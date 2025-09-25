#!/usr/bin/env python3
"""
Startup script that uses Claude API directly without CrewAI dependency issues
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
    print("Starting backend API server...")
    backend_cmd = [
        sys.executable, "-c", """
import sys
sys.path.append('.')
from backend.main import app
import uvicorn
uvicorn.run(app, host='0.0.0.0', port=8000, reload=False)
"""
    ]
    
    try:
        subprocess.run(backend_cmd, check=True)
    except KeyboardInterrupt:
        print("Backend server stopped.")
    except Exception as e:
        print(f"Backend server error: {e}")

def run_frontend():
    """Frontend removed - API only"""
    print("Frontend removed - using API only")
    print("Access API documentation at: http://localhost:8000/docs")

def check_claude_api():
    """Check if Claude API key is configured"""
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key or api_key == "your_claude_api_key_here":
        print("WARNING: Claude API key not configured!")
        print("   Please set your API key:")
        print("   echo 'ANTHROPIC_API_KEY=your_actual_api_key' > .env")
        print("   Or export ANTHROPIC_API_KEY=your_actual_api_key")
        return False
    else:
        print("Claude API key configured")
        return True

def main():
    """Main function to start the system"""
    print("Research Paper Unicorn Potential Analyzer")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not Path("backend").exists():
        print("ERROR: Please run this script from the project root directory")
        sys.exit(1)
    
    # Check Claude API key
    if not check_claude_api():
        print("\nTo get your Claude API key:")
        print("   1. Go to https://console.anthropic.com/")
        print("   2. Sign up or log in")
        print("   3. Go to API Keys section")
        print("   4. Create a new API key")
        print("   5. Set it in your .env file")
        print("\n   The system will work without it but with limited functionality.")
    
    print("\nStarting system components...")
    print("   Backend API: http://localhost:8000")
    print("   API Docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the service\n")
    
    # Start backend (this will block)
    try:
        run_backend()
    except KeyboardInterrupt:
        print("\nShutting down system...")
        sys.exit(0)

if __name__ == "__main__":
    main()
