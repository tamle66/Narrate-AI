import sys
import json
import struct
import socket
import subprocess
import os
import time
import logging
import threading

# Setup logging
log_file = os.path.join(os.path.dirname(__file__), "host_debug.log")
logging.basicConfig(filename=log_file, level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

def log(msg):
    logging.debug(msg)

# Configuration
PORT = 8880
BACKEND_DIR_NAME = "backend"
# Determine absolute path for backend relative to this script
BACKEND_ABS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", BACKEND_DIR_NAME))

POSSIBLE_PATHS = [
    BACKEND_ABS_PATH,
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "Kokoro-FastAPI")),
]

# Lock for stdout access
stdout_lock = threading.Lock()

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
        # Read byte by byte or small chunks to avoid buffering issues
        # This is a bit more manual but ensures we catch everything immediately
        for line in iter(process.stdout.readline, b''):
            log(f"Raw line read: {line}") # Debug raw bytes
            try:
                # Try decoding commonly used encodings in Windows
                decoded = line.decode('utf-8').strip()
            except:
                try:
                    decoded = line.decode('mbcs', errors='ignore').strip()
                except:
                    decoded = str(line)
            
            if decoded:
                log(f"{message_type.upper()} log: {decoded}")
                send_message({"status": message_type, "log": decoded})
            else:
                # Still send empty lines to keep connection alive? No, might spam.
                pass
                
    except Exception as e:
        log(f"Monitor exception: {e}")
    finally:
        log("Stopped monitoring process output")
        # If process ends, check return code
        if process.poll() is not None and process.returncode != 0:
             send_message({"status": "error", "message": f"Process exited with code {process.returncode}"})

def install_backend():
    """Clones repo and installs uv if missing."""
    target_dir = BACKEND_ABS_PATH
    log(f"Starting backend installation to: {target_dir}")
    
    # Set environment to force unbuffered output
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    
    if os.path.exists(target_dir):
        # Even if exists, we might want to run setup to ensure dependencies
        log("Backend folder exists. proceeding to setup deps.")
    
    try:
        setup_script_path = os.path.join(os.path.dirname(__file__), "temp_setup.bat")
        with open(setup_script_path, "w") as f:
            f.write(f'@echo off\n')
            f.write(f'echo [SETUP] STARTING SETUP PROCESS...\n')
            
            if not os.path.exists(target_dir):
                f.write(f'echo [SETUP] Cloning Kokoro-FastAPI...\n')
                f.write(f'git clone https://github.com/remsky/Kokoro-FastAPI.git "{target_dir}"\n')
            
            f.write(f'cd /d "{target_dir}"\n')
            f.write(f'echo [SETUP] Installing uv...\n')
            f.write(f'pip install uv\n')
            f.write(f'echo [SETUP] Installation Complete.\n')

        log(f"Running setup script: {setup_script_path}")
        # Run with env
        process = subprocess.Popen([setup_script_path], cwd=os.path.dirname(__file__), 
                                   shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
        
        t = threading.Thread(target=monitor_process_output, args=(process, "installing"), daemon=True)
        t.start()
        
        return {"status": "installing", "message": "Installation started"}
        
    except Exception as e:
        log(f"Install error: {e}")
        return {"status": "error", "message": str(e)}

def start_server():
    server_path = find_server_script()
    if not server_path:
        return {"status": "backend_missing", "message": "Kokoro-FastAPI not found. Install required."}

    if is_port_open(PORT):
        log("Server already running on port 8880")
        return {"status": "running", "message": "Server already active"}

    # Set environment to force unbuffered output
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"

    try:
        start_script_bat = os.path.join(server_path, "start-cpu.bat")
        start_script_ps1 = os.path.join(server_path, "start-cpu.ps1")
        
        process = None

        if os.path.exists(start_script_bat):
             log(f"Starting via BAT: {start_script_bat}")
             process = subprocess.Popen([start_script_bat], cwd=server_path, 
                                        shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
        
        elif os.path.exists(start_script_ps1):
             log(f"Starting via PS1: {start_script_ps1}")
             process = subprocess.Popen(["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", start_script_ps1], 
                                        cwd=server_path, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, env=env)
             
        if process:
            t = threading.Thread(target=monitor_process_output, args=(process, "starting"), daemon=True)
            t.start()
            return {"status": "starting", "message": "Launched start script with monitoring"}

        log("No start script found.")
        return {"status": "error", "message": "No start script found in backend folder"}
        
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
                     send_message({"status": "backend_missing"})
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

            elif cmd == "ping":
                send_message({"response": "pong"})
            else:
                log(f"Unknown command: {cmd}")
            
        except Exception as e:
            log(f"Main Loop Exception: {e}")
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

