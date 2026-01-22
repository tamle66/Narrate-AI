import sys
import json
import struct
import socket
import subprocess
import os
import time
import logging
import threading
import re

# Setup logging
log_file = os.path.join(os.path.dirname(__file__), "host_debug.log")
logging.basicConfig(filename=log_file, level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

def log(msg):
    logging.debug(msg)

# Configuration
PORT = 8880
BACKEND_DIR_NAME = "narrate-ai-core"
# Determine absolute path for backend relative to this script: ../external/kokoro-engine
BACKEND_ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "external"))
BACKEND_ABS_PATH = os.path.join(BACKEND_ROOT_DIR, BACKEND_DIR_NAME)

POSSIBLE_PATHS = [
    BACKEND_ABS_PATH,
    # Fallbacks for various common clone names
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "external", "kokoro-engine")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "external", "Kokoro-FastAPI")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "external", "kokoro-fastapi")),
    # Fallback for old project structure
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")), 
]

# Lock for stdout access
stdout_lock = threading.Lock()
current_process = None
process_lock = threading.Lock()

def send_message(message):
    """Send a message to Chrome via stdout. Thread-safe."""
    try:
        json_msg = json.dumps(message)
        with stdout_lock:
            # Write message length (4 bytes, little endian)
            sys.stdout.buffer.write(struct.pack('I', len(json_msg)))
            # Write message content
            sys.stdout.write(json_msg)
            sys.stdout.flush()
        log(f"Sent: {json_msg}")
    except Exception as e:
        log(f"Error sending message: {e}")

def read_message():
    """Read a message from Chrome via stdin."""
    # This might block, but we are in main thread
    # Read message length (4 bytes)
    text_length_bytes = sys.stdin.buffer.read(4)
    if not text_length_bytes:
        log("No length bytes read. Exiting.")
        return None
    text_length = struct.unpack('I', text_length_bytes)[0]
    # Read message content
    text = sys.stdin.read(text_length)
    log(f"Received: {text}")
    return json.loads(text)

def is_port_open(port):
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(('localhost', port)) == 0
    except Exception as e:
        log(f"Port check error: {e}")
        return False

def find_server_script():
    for path in POSSIBLE_PATHS:
        if os.path.exists(path):
            log(f"Found server path: {path}")
            return path
    log("Server path not found")
    return None

def monitor_process_output(process, message_type="starting"):
    """Reads stdout from the process and sends it to Chrome."""
    log(f"Started monitoring process output (Type: {message_type})")
    try:
        # Use a small buffer to catch progress updates like \r
        buffer = b""
        while True:
            char = process.stdout.read(1)
            if not char:
                break
            
            if char == b'\n' or char == b'\r':
                if buffer:
                    try:
                        decoded = buffer.decode('utf-8', errors='ignore').strip()
                    except:
                        decoded = str(buffer)
                    
                    if decoded:
                        # log(f"{message_type.upper()} log: {decoded}")
                        send_message({"status": message_type, "log": decoded})
                    buffer = b""
            else:
                buffer += char
                
    except Exception as e:
        log(f"Monitor exception: {e}")
    finally:
        log("Stopped monitoring process output")
        # Check if process is still alive, if so, wait a bit
        try:
            process.wait(timeout=1)
        except:
            pass
        if process.returncode != 0:
             send_message({"status": "error", "message": f"Process exited with code {process.returncode}"})
    
    # Clear global process if it's this one
    global current_process
    with process_lock:
        if current_process == process:
            current_process = None

def kill_current_process():
    global current_process
    with process_lock:
        if current_process:
            log(f"Killing process {current_process.pid}")
            try:
                # Kill process tree on Windows
                subprocess.run(['taskkill', '/F', '/T', '/PID', str(current_process.pid)], 
                               capture_output=True, check=False)
            except Exception as e:
                log(f"Kill error: {e}")
            current_process = None

def install_backend():
    """Clones repo and installs uv if missing."""
    target_dir = BACKEND_ABS_PATH
    root_dir = BACKEND_ROOT_DIR
    log(f"Starting backend installation to: {target_dir}")
    
    if not os.path.exists(target_dir):
        try:
            log(f"Cloning repo to {target_dir}...")
            send_message({"status": "installing", "log": f"[SETUP] Cloning Narrate AI Core..."})
            subprocess.run(['git', 'clone', 'https://github.com/remsky/Kokoro-FastAPI.git', target_dir], check=True)
            log("Clone successful.")
        except Exception as e:
            log(f"Clone failed: {e}")
            return {"status": "error", "message": f"Git clone failed: {e}"}

    # Ensure external directory exists
    if not os.path.exists(root_dir):
        os.makedirs(root_dir)
    
    # Set environment to force unbuffered output and plain progress
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["UV_PROGRESS_MODE"] = "plain"
    env["UV_SHOW_PROGRESS"] = "1"
    
    # 1. Patch pyproject.toml directly in Python to avoid shell escaping hell
    pyproject_path = os.path.join(target_dir, "pyproject.toml")
    lock_path = os.path.join(target_dir, "uv.lock")
    
    if os.path.exists(pyproject_path):
        try:
            log(f"Patching {pyproject_path}...")
            with open(pyproject_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Replace misaki[en,ja,ko,zh] or any variant with just misaki[en]
            new_content = re.sub(r'misaki\[.*?\]', 'misaki[en]', content)
            
            if content != new_content:
                with open(pyproject_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                log("Patching successful.")
                # Also must delete lock file to force re-resolve
                if os.path.exists(lock_path):
                    os.remove(lock_path)
                    log("Deleted uv.lock to force re-resolution.")
            else:
                log("No patching needed (already patched).")
        except Exception as e:
            log(f"Patching failed: {e}")

    # 2. Prepare the setup script for remaining tasks
    try:
        setup_script_path = os.path.join(os.path.dirname(__file__), "temp_setup.bat")
        with open(setup_script_path, "w") as f:
            f.write(f'@echo off\n')
            f.write(f'echo [SETUP] STARTING SETUP PROCESS...\n')
            
            if not os.path.exists(target_dir):
                f.write(f'echo [SETUP] External folder missing. This shouldn\'t happen here.\n')
            
            f.write(f'cd /d "{target_dir}"\n')
            f.write(f'echo [SETUP] Updating pip and installing uv...\n')
            f.write(f'"{sys.executable}" -m pip install --upgrade pip\n')
            f.write(f'"{sys.executable}" -m pip install uv\n')
            f.write(f'echo [SETUP] Success: UV is ready.\n')
            f.write(f'echo [SETUP] Initializing AI environment (this may take a few minutes)...\n')
            f.write(f'uv sync --no-dev\n')
            f.write(f'echo [SETUP] Installation Complete.\n')

        log(f"Running setup script: {setup_script_path}")
        kill_current_process() # Cleanup any old one
        
        # Run with env
        process = subprocess.Popen([setup_script_path], cwd=os.path.dirname(__file__), 
                                   shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
        
        with process_lock:
            current_process = process
        
        t = threading.Thread(target=monitor_process_output, args=(process, "installing"), daemon=True)
        t.start()
        
        return {"status": "installing", "message": "Installation started"}
        
    except Exception as e:
        log(f"Install error: {e}")
        return {"status": "error", "message": str(e)}

def start_server():
    server_path = find_server_script()
    if not server_path:
        return {"status": "backend_missing", "message": "Narrate AI Core not found. Install required."}

    if is_port_open(PORT):
        log("Server already running on port 8880")
        return {"status": "running", "message": "Server already active"}

    # Set environment for server start
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["UV_PROGRESS_MODE"] = "plain"
    env["UV_SHOW_PROGRESS"] = "1"

    try:
        # Priority: GPU PS1 > CPU PS1 > GPU BAT > CPU BAT
        scripts = [
            ("start-gpu.ps1", "ps1"),
            ("start-cpu.ps1", "ps1"),
            ("start-gpu.bat", "bat"),
            ("start-cpu.bat", "bat")
        ]
        
        process = None
        for script_name, script_type in scripts:
            script_path = os.path.join(server_path, script_name)
            if os.path.exists(script_path):
                log(f"Attempting to start via {script_type.upper()}: {script_path}")
                if script_type == "ps1":
                    process = subprocess.Popen(["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", script_path], 
                                                cwd=server_path, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
                else: # bat
                    process = subprocess.Popen([script_path], cwd=server_path, 
                                                shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
                
                if process:
                    log(f"Successfully launched: {script_name}")
                    kill_current_process()
                    with process_lock:
                        current_process = process
                    break
             
        if process:
            t = threading.Thread(target=monitor_process_output, args=(process, "starting"), daemon=True)
            t.start()
            return {"status": "starting", "message": "Launched server script with monitoring"}

        log("No start script found.")
        return {"status": "error", "message": "No recognized start script (ps1/bat) found in backend folder"}
        
    except Exception as e:
        log(f"Start server exception: {e}")
        return {"status": "error", "message": str(e)}

def main():
    log("Host started.")
    while True:
        try:
            message = read_message()
            if not message:
                break
            
            cmd = message.get("command")
            if cmd == "check_status":
                if find_server_script() is None:
                     send_message({
                         "status": "backend_missing", 
                         "log": f"[HOST] Backend not found. Searched in: {', '.join([os.path.basename(p) for p in POSSIBLE_PATHS])}. Please check 'external/' folder."
                     })
                elif is_port_open(PORT):
                    send_message({"status": "running", "port": PORT})
                else:
                    send_message({"status": "stopped"})
            
            elif cmd == "start_server":
                result = start_server()
                send_message(result)
            
            elif cmd == "install_backend":
                result = install_backend()
                send_message(result)
            
            elif cmd == "stop":
                kill_current_process()
                send_message({"status": "stopped", "message": "Process killed by user"})

            elif cmd == "ping":
                send_message({"response": "pong"})
            else:
                log(f"Unknown command: {cmd}")
            
        except Exception as e:
            log(f"Main Loop Exception: {e}")
            kill_current_process()
            send_message({"status": "error", "message": str(e)}) 
            break

if __name__ == "__main__":
    try:
        # Windows fix for binary stdin/stdout
        if sys.platform == "win32":
            import msvcrt
            msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
            msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)
        main()
    except Exception as e:
        with open("critical_error.log", "w") as f:
            f.write(str(e))

