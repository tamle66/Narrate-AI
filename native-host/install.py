import os
import sys
import json
import winreg

HOST_NAME = "com.kokoro.tts.host"
ALLOWED_ORIGIN = "chrome-extension://<YOUR_EXTENSION_ID>/" # Update this!

def install():
    # 1. Prepare paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    host_py = os.path.join(current_dir, "kokoro_host.py")
    wrapper_bat = os.path.join(current_dir, "wrapper.bat")
    manifest_path = os.path.join(current_dir, "host_manifest.json")
    
    # 2. Get Extension ID
    print("----------------------------------------------------------------")
    print("SETUP KOKORO TTS NATIVE HOST")
    print("----------------------------------------------------------------")
    
    # Try to read existing manifest to see if ID is already set
    existing_id = "<YOUR_EXTENSION_ID>"
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r") as f:
                data = json.load(f)
                origins = data.get("allowed_origins", [])
                if origins:
                    # Extract ID from chrome-extension://ID/
                    existing_id = origins[0].split("://")[1].strip("/")
        except:
            pass

    extension_id = input(f"Enter your Chrome Extension ID (Press Enter to keep '{existing_id}'): ").strip()
    if not extension_id:
        extension_id = existing_id
    
    if extension_id == "<YOUR_EXTENSION_ID>":
        print("WARNING: You strictly *must* update the ID later for the extension to work.")

    final_origin = f"chrome-extension://{extension_id}/"

    # 3. Create wrapper.bat
    # We need a wrapper because Chrome creates a process directly from 'path'
    with open(wrapper_bat, "w") as f:
        f.write(f'@echo off\npython "{host_py}" %*')
    print(f"Created wrapper: {wrapper_bat}")

    # 4. Create Manifest
    manifest = {
        "name": HOST_NAME,
        "description": "Native Host for Kokoro TTS",
        "path": wrapper_bat,
        "type": "stdio",
        "allowed_origins": [final_origin]
    }
    
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Created manifest: {manifest_path}")

    # 5. Add Registry Key
    key_path = f"Software\\Google\\Chrome\\NativeMessagingHosts\\{HOST_NAME}"
    try:
        key = winreg.CreateKey(winreg.HKEY_CURRENT_USER, key_path)
        winreg.SetValue(key, "", winreg.REG_SZ, manifest_path)
        winreg.CloseKey(key)
        print(f"Registry key added: HKCU\\{key_path}")
        print("----------------------------------------------------------------")
        print("Installation Successful!")
        print(f"Linked to Extension ID: {extension_id}")
        print("You can now click 'Retry' in the extension.")
        print("----------------------------------------------------------------")
    except Exception as e:
        print(f"Registry Error: {e}")

if __name__ == "__main__":
    install()
