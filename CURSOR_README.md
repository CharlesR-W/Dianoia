# Dianoia - Visual Argumentation Co-Pilot

## Project Status: MVP with Comprehensive Debugging System

### 🎯 Current State
- **Backend**: Fully functional Node.js/Express server with OpenAI/OpenRouter integration
- **Frontend**: React/TypeScript app with React Flow visualization
- **Debugging**: Comprehensive logging system implemented and enabled by default
- **API Key Management**: Secure per-session API key storage
- **State Management**: Zustand store with localStorage persistence

### 🐛 Debugging System Overview

A comprehensive debugging system has been implemented across the entire application stack. The system provides:

#### Features
- **Structured Logging**: All major operations log with component, action, and context
- **Performance Tracking**: Automatic timing of API calls and operations
- **Error Tracking**: Detailed error logging with stack traces
- **State Change Monitoring**: Track all Zustand store changes
- **API Request/Response Logging**: Complete HTTP request/response tracking
- **Real-time Debug Panel**: Web-based interface for viewing logs and controlling debug settings

#### Debug Levels
- `error`: Critical errors that need immediate attention
- `warn`: Warning conditions that may indicate issues
- `info`: General information about application flow
- `debug`: Detailed debugging information (default level)
- `trace`: Very detailed tracing information

#### Components with Debug Coverage
- **Backend**: Server, controllers, LLM service
- **Frontend**: App, store, API service, components
- **Shared**: Debug utility and types

### 🚀 How to Use the Debug System

#### 1. View Debug Logs
- Click the "🐛 Debug" button in the app header
- The debug panel shows real-time logs with filtering options
- Logs are automatically refreshed every second

#### 2. Control Debug Settings
- **Enable/Disable**: Toggle debug logging on/off
- **Log Level**: Set minimum log level (error, warn, info, debug, trace)
- **Filters**: Filter logs by level and component
- **Auto Refresh**: Enable/disable automatic log updates

#### 3. Export Debug Information
- Click "Export Logs" to download a JSON file with all debug data
- Useful for sharing with developers or analyzing issues

#### 4. Backend Debug Endpoint
- Access debug logs via API: `GET /debug/logs`
- Returns current logs, configuration, and performance data

### 📁 Key Files and Their Debug Integration

#### Backend Files
- `backend/src/index.ts`: Server startup, request/response logging, error handling
- `backend/src/controllers/argumentController.ts`: Request validation, LLM calls, error tracking
- `backend/src/services/llmService.ts`: API calls, session management, prompt generation

#### Frontend Files
- `frontend/src/App.tsx`: App initialization, user interactions, state loading
- `frontend/src/store/useStore.ts`: State changes, localStorage operations, error handling
- `frontend/src/services/api.ts`: HTTP requests, response handling, error tracking
- `frontend/src/components/DebugPanel.tsx`: Debug interface and controls

#### Shared Files
- `shared/debug.ts`: Core debugging utility with all logging functions
- `shared/types.ts`: TypeScript interfaces for the application

### 🔧 Environment Configuration

#### Debug Environment Variables
```bash
# Backend
DIANOIA_DEBUG=true              # Enable/disable debug logging
DIANOIA_DEBUG_LEVEL=debug       # Set log level (error, warn, info, debug, trace)

# Frontend (via localStorage)
dianoia_debug_enabled=true      # Enable/disable debug logging
dianoia_debug_level=debug       # Set log level
```

#### API Configuration
```bash
# Backend
OPENAI_API_KEY=your_key         # Fallback API key
FRONTEND_URL=http://localhost:3000  # CORS origin

# Frontend
REACT_APP_API_URL=http://localhost:5000  # Backend API URL
```

### 🏃‍♂️ Running the Application

#### Start Scripts
```bash
# Unified start script (recommended)
./start.sh

# Individual services
cd backend && npm start
cd frontend && npm start
```

#### Debug Access Points
- **Frontend Debug Panel**: Click "🐛 Debug" button in app header
- **Backend Debug API**: `http://localhost:5000/debug/logs`
- **Console Logs**: All debug output appears in browser/server console
- **Health Check**: `http://localhost:5000/health`

### 🐛 Common Debug Scenarios

#### 1. API Key Issues
- Check `llm_service` logs for API key validation
- Look for `no_api_key` or `setup_key_error` events
- Verify session key storage in `session_key_set` logs

#### 2. LLM Generation Problems
- Monitor `openai_call_start` and `openrouter_call_start` events
- Check for `argument_generation_error` events
- Review prompt generation in `prompt_generated` logs

#### 3. Frontend State Issues
- Track state changes in `store` component logs
- Monitor localStorage operations in `localStorage_save` events
- Check for `load_error` events during app initialization

#### 4. Network/API Issues
- Review `api_service` request/response logs
- Check for `generate_request_error` or `setup_key_error` events
- Monitor request timing in performance logs

### 🔄 Development Workflow

#### Adding Debug to New Components
1. Import the debug utility: `import { debug } from '../../../shared/debug';`
2. Add logging at key points:
   ```typescript
   debug.info('component_name', 'action', 'description', { data });
   debug.trackError(error, 'component_name', 'action', { context });
   ```
3. Use performance tracking for expensive operations:
   ```typescript
   const timerId = debug.startTimer('operation_name', { metadata });
   // ... operation ...
   debug.endTimer(timerId, { result });
   ```

#### Debug Best Practices
- Use descriptive component and action names
- Include relevant data in log context
- Track errors with full context
- Use appropriate log levels
- Add performance tracking for API calls and heavy operations

### 📊 Performance Monitoring

The debug system automatically tracks:
- API call durations
- State change frequency
- Error rates by component
- Memory usage (when available)
- Request/response timing

### 🔮 Future Enhancements

#### Planned Debug Features
- **Log Persistence**: Save logs to file system
- **Remote Debugging**: Send logs to external service
- **Performance Alerts**: Notify on slow operations
- **User Session Tracking**: Track user interactions
- **Error Reporting**: Automatic error reporting to monitoring service

#### Integration Opportunities
- **Sentry**: Error tracking and performance monitoring
- **LogRocket**: Session replay and debugging
- **DataDog**: Application performance monitoring
- **Custom Analytics**: User behavior tracking

### 🛠️ Troubleshooting

#### Debug System Not Working
1. Check if debug is enabled: `localStorage.getItem('dianoia_debug_enabled')`
2. Verify log level: `localStorage.getItem('dianoia_debug_level')`
3. Check browser console for any debug initialization errors
4. Ensure shared/debug.ts is properly imported

#### Performance Issues
1. Disable auto-refresh in debug panel
2. Filter logs by component to reduce noise
3. Set log level to 'error' or 'warn' for production
4. Clear logs periodically to prevent memory buildup

#### Missing Logs
1. Check if component is importing debug utility
2. Verify log level is appropriate for the message
3. Ensure debug is enabled in environment/localStorage
4. Check for JavaScript errors preventing debug initialization

---

**Last Updated**: Debug system implementation complete
**Next Steps**: Monitor debug output, optimize performance, add additional logging as needed 