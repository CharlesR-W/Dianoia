#!/bin/bash

# Dianoia - Visual Argumentation Co-Pilot
# Unified startup script with intelligent process management

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=5000
FRONTEND_PORT=3000
BACKEND_PID_FILE=".backend.pid"
FRONTEND_PID_FILE=".frontend.pid"

echo -e "${BLUE}🚀 Starting Dianoia - Visual Argumentation Co-Pilot${NC}"

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to find and kill Dianoia processes
kill_dianoia_processes() {
    echo -e "${YELLOW}🔍 Checking for existing Dianoia processes...${NC}"
    
    # Kill processes by PID files if they exist
    if [ -f "$BACKEND_PID_FILE" ]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        if kill -0 $backend_pid 2>/dev/null; then
            echo -e "${YELLOW}🔄 Stopping existing backend server (PID: $backend_pid)${NC}"
            kill $backend_pid 2>/dev/null || true
            sleep 2
        fi
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        if kill -0 $frontend_pid 2>/dev/null; then
            echo -e "${YELLOW}🔄 Stopping existing frontend server (PID: $frontend_pid)${NC}"
            kill $frontend_pid 2>/dev/null || true
            sleep 2
        fi
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    # Kill any remaining processes on our ports
    if check_port $BACKEND_PORT; then
        echo -e "${YELLOW}🔄 Stopping process on backend port $BACKEND_PORT${NC}"
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
    
    if check_port $FRONTEND_PORT; then
        echo -e "${YELLOW}🔄 Stopping process on frontend port $FRONTEND_PORT${NC}"
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# Function to check Node.js version
check_node_version() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed${NC}"
        exit 1
    fi
    
    local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        echo -e "${YELLOW}⚠️  Node.js version 18+ recommended. Current: $(node --version)${NC}"
        echo -e "${YELLOW}   Consider using nvm to upgrade: nvm install 18 && nvm use 18${NC}"
    else
        echo -e "${GREEN}✅ Node.js version: $(node --version)${NC}"
    fi
}

# Function to start backend server
start_backend() {
    echo -e "${BLUE}🔧 Starting backend server on port $BACKEND_PORT...${NC}"
    
    cd backend
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Start backend with timeout and PID tracking
    # Set debug environment variables
    export DIANOIA_DEBUG=true
    export DIANOIA_DEBUG_LEVEL=debug
    
    timeout 30s npm run dev > ../backend.log 2>&1 &
    local backend_pid=$!
    echo $backend_pid > "../$BACKEND_PID_FILE"
    
    # Wait for backend to start
    local attempts=0
    while [ $attempts -lt 30 ]; do
        if check_port $BACKEND_PORT; then
            echo -e "${GREEN}✅ Backend server running on port $BACKEND_PORT (PID: $backend_pid)${NC}"
            break
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    if [ $attempts -eq 30 ]; then
        echo -e "${RED}❌ Backend server failed to start within 30 seconds${NC}"
        echo -e "${YELLOW}📋 Backend logs:${NC}"
        cat ../backend.log
        exit 1
    fi
    
    cd ..
}

# Function to start frontend server
start_frontend() {
    echo -e "${BLUE}🎨 Starting frontend server on port $FRONTEND_PORT...${NC}"
    
    cd frontend
    
    # Check if dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start frontend with timeout and PID tracking
    timeout 60s npm start > ../frontend.log 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > "../$FRONTEND_PID_FILE"
    
    # Wait for frontend to start
    local attempts=0
    while [ $attempts -lt 60 ]; do
        if check_port $FRONTEND_PORT; then
            echo -e "${GREEN}✅ Frontend server running on port $FRONTEND_PORT (PID: $frontend_pid)${NC}"
            break
        fi
        sleep 1
        attempts=$((attempts + 1))
    done
    
    if [ $attempts -eq 60 ]; then
        echo -e "${RED}❌ Frontend server failed to start within 60 seconds${NC}"
        echo -e "${YELLOW}📋 Frontend logs:${NC}"
        cat ../frontend.log
        exit 1
    fi
    
    cd ..
}

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down Dianoia servers...${NC}"
    
    if [ -f "$BACKEND_PID_FILE" ]; then
        local backend_pid=$(cat "$BACKEND_PID_FILE")
        kill $backend_pid 2>/dev/null || true
        rm -f "$BACKEND_PID_FILE"
    fi
    
    if [ -f "$FRONTEND_PID_FILE" ]; then
        local frontend_pid=$(cat "$FRONTEND_PID_FILE")
        kill $frontend_pid 2>/dev/null || true
        rm -f "$FRONTEND_PID_FILE"
    fi
    
    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM EXIT

# Main execution
main() {
    # Check Node.js version
    check_node_version
    
    # Kill existing Dianoia processes
    kill_dianoia_processes
    
    # Start backend
    start_backend
    
    # Start frontend
    start_frontend
    
    # Success message
    echo -e "\n${GREEN}🎉 Dianoia is ready!${NC}"
    echo -e "${BLUE}📡 Backend: http://localhost:$BACKEND_PORT${NC}"
    echo -e "${BLUE}🌐 Frontend: http://localhost:$FRONTEND_PORT${NC}"
    echo -e "${BLUE}🏥 Health check: http://localhost:$BACKEND_PORT/health${NC}"
    echo -e "${BLUE}🐛 Debug logs: http://localhost:$BACKEND_PORT/debug/logs${NC}"
    echo -e "\n${YELLOW}💡 Open http://localhost:$FRONTEND_PORT in your browser to start using Dianoia${NC}"
    echo -e "${YELLOW}🐛 Click the 'Debug' button in the app header to view debug logs${NC}"
    echo -e "${YELLOW}🛑 Press Ctrl+C to stop all servers${NC}"
    
    # Keep script running
    wait
}

# Run main function
main 