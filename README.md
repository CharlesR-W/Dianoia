# Dianoia - Visual Argumentation Co-Pilot

## Please note this project is not yet functional!  The readme below describes intended features and usage, subject to change.

A web-based "Centaur" tool for argumentation generation and analysis, inspired by argument markup languages like Argdown.  The intent is to provide the user a streamlined way to use LLMs to generate and evaluate argumentation, with the particular hope that re-instantiation of LLMs can be used to mitigate cognitive biases.

## Features

- **Visual Argument Mapping**: Create and connect claims on a 2D canvas
- **AI-Powered Generation**: Generate supporting, refuting, or unpacking claims using OpenAI
- **Interactive Interface**: Double-click to edit claims, drag to reposition
- **Local Persistence**: Saves your argument graphs in browser localStorage.  An online "library" of argumentation graphs is planned,

## Technology Stack

- **Frontend**: React + TypeScript + React Flow + Zustand + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + OpenAI SDK
- **Persistence**: Browser localStorage (MVP)

## Quick Start

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn
- OpenAI API key (Planned OpenRouter support)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Dianoia
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env and add your OpenAI API key
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the development servers**

   In one terminal (backend):
   ```bash
   cd backend
   npm run dev
   ```

   In another terminal (frontend):
   ```bash
   cd frontend
   npm start
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend health check: http://localhost:5000/health

## Usage

1. **Create an initial claim**: Click the "Add Initial Claim" button
2. **Edit claims**: Double-click any claim to edit its text
3. **Generate related claims**: Select a claim and use the interaction panel:
   - **Support** (green): Generate a claim that supports the selected claim
   - **Refute** (red): Generate a claim that refutes the selected claim
   - **Unpack** (blue): Generate a claim that unpacks an assumption of the selected claim
4. **Move claims**: Drag claims around the canvas to reposition them
5. **View connections**: Claims are automatically connected with animated edges

## Development

### Project Structure

```
dianoia/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared TypeScript types
├── DEVELOPMENT_PLAN.md # Development roadmap
└── progress.md        # Progress tracking
```

### Available Scripts

**Backend:**
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm start`: Start production server

**Frontend:**
- `npm start`: Start development server
- `npm run build`: Build for production
- `npm test`: Run tests

### Environment Variables

**Backend (.env):**
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 5000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

## Deployment

### Local Deployment
Both frontend and backend can run locally using the development scripts above.

### Server Deployment
1. Build the frontend: `cd frontend && npm run build`
2. Build the backend: `cd backend && npm run build`
3. Set up environment variables on your server
4. Start the backend: `cd backend && npm start`
5. Serve the frontend build files using a web server (nginx, Apache, etc.)

## Contributing

This is an MVP prototype. The architecture is designed for extensibility. Key areas for future development:

- Database integration for persistent storage
- User authentication and multi-user support
- Advanced argument analysis features
- Export/import functionality
- Collaborative editing

## License

MIT License

## Support

For issues and questions, please [create an issue](link-to-issues) in the repository. 
