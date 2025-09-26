#!/usr/bin/env python3
"""
Full System Startup Script
Starts both backend API and frontend development server
"""

import subprocess
import sys
import time
import os
import signal
import threading
from pathlib import Path

def run_backend():
    """Start the FastAPI backend server"""
    print("🚀 Starting backend API server...")
    backend_cmd = [
        sys.executable, "-c", """
import sys
sys.path.append('.')
from backend.main import app
import uvicorn
uvicorn.run(app, host='0.0.0.0', port=8000, reload=True)
"""
    ]
    
    try:
        subprocess.run(backend_cmd, check=True)
    except KeyboardInterrupt:
        print("Backend server stopped.")
    except Exception as e:
        print(f"Backend server error: {e}")

def run_frontend():
    """Start the React frontend development server"""
    print("🎨 Starting frontend development server...")
    
    # Check if frontend directory exists
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return
    
    # Check if node_modules exists
    if not (frontend_dir / "node_modules").exists():
        print("📦 Installing frontend dependencies...")
        try:
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to install dependencies: {e}")
            return
    
    # Start frontend server
    try:
        subprocess.run(["npm", "run", "dev"], cwd=frontend_dir, check=True)
    except KeyboardInterrupt:
        print("Frontend server stopped.")
    except Exception as e:
        print(f"Frontend server error: {e}")

def check_requirements():
    """Check if all requirements are met"""
    print("🔍 Checking system requirements...")
    
    # Check Python
    try:
        python_version = sys.version_info
        if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
            print("❌ Python 3.8+ required")
            return False
        print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    except Exception as e:
        print(f"❌ Python check failed: {e}")
        return False
    
    # Check Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()}")
        else:
            print("❌ Node.js not found")
            return False
    except Exception as e:
        print(f"❌ Node.js check failed: {e}")
        return False
    
    # Check npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm {result.stdout.strip()}")
        else:
            print("❌ npm not found")
            return False
    except Exception as e:
        print(f"❌ npm check failed: {e}")
        return False
    
    return True

def check_api_keys():
    """Check if API keys are configured"""
    print("🔑 Checking API configuration...")
    
    # Check for .env file in frontend
    frontend_env = Path("frontend/.env")
    if not frontend_env.exists():
        print("⚠️  Frontend .env file not found. Copy env.example to .env and configure your API keys.")
        print("   cp frontend/env.example frontend/.env")
    
    # Check environment variables
    required_vars = [
        "ANTHROPIC_API_KEY",
        "ELEVENLABS_API_KEY"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Missing environment variables: {', '.join(missing_vars)}")
        print("   Set these in your .env file or environment")
    else:
        print("✅ API keys configured")
    
    return len(missing_vars) == 0

def main():
    """Main function to start the full system"""
    print("🌟 Max Planck Startup Evaluator - Full System")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("❌ ERROR: Please run this script from the project root directory")
        sys.exit(1)
    
    # Check requirements
    if not check_requirements():
        print("\n❌ System requirements not met. Please install missing dependencies.")
        sys.exit(1)
    
    # Check API keys
    api_keys_ok = check_api_keys()
    if not api_keys_ok:
        print("\n⚠️  Some API keys are missing. The system will work with limited functionality.")
    
    print("\n🚀 Starting system components...")
    print("   Backend API: http://localhost:8000")
    print("   Frontend: http://localhost:3000")
    print("   API Docs: http://localhost:8000/docs")
    print("\n💡 Press Ctrl+C to stop all services\n")
    
    # Start both services in separate threads
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    
    try:
        # Start backend first
        backend_thread.start()
        time.sleep(3)  # Give backend time to start
        
        # Start frontend
        frontend_thread.start()
        
        # Wait for both threads
        backend_thread.join()
        frontend_thread.join()
        
    except KeyboardInterrupt:
        print("\n🛑 Shutting down system...")
        print("   Stopping all services...")
        sys.exit(0)

if __name__ == "__main__":
    main()


