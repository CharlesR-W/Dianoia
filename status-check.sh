#!/bin/bash

echo "🔍 Dianoia Status Check"
echo "======================"

# Check Node.js version
echo "📋 Node.js Version:"
export NVM_DIR="$HOME/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18 > /dev/null 2>&1
node --version

# Check backend
echo ""
echo "🔧 Backend Status:"
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is running on port 5000"
    curl -s http://localhost:5000/health | jq . 2>/dev/null || curl -s http://localhost:5000/health
else
    echo "❌ Backend is not running on port 5000"
fi

# Check frontend
echo ""
echo "🎨 Frontend Status:"
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend is not running on port 3000"
fi

# Check processes
echo ""
echo "🔄 Active Processes:"
ps aux | grep -E "(npm|node)" | grep -v grep | grep -E "(dianoia|3000|5000)" || echo "No Dianoia processes found"

# Check ports
echo ""
echo "🌐 Port Status:"
ss -tlnp | grep -E ":(3000|5000)" || echo "No servers found on ports 3000 or 5000"

echo ""
echo "📝 Next Steps:"
if curl -s http://localhost:5000/health > /dev/null; then
    echo "✅ Backend is working! You can test it at: http://localhost:5000/health"
    echo "📱 If frontend is not working, try: cd frontend && npm start"
else
    echo "❌ Backend needs to be started: cd backend && npm run dev"
fi

echo ""
echo "🔑 To add OpenAI API key:"
echo "   Edit backend/.env and add: OPENAI_API_KEY=your_key_here" 