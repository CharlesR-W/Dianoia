# Dianoia Development Plan

## Project Overview
Building a visual argumentation co-pilot system where users create claims and AI generates supporting/refuting claims, visualized on a 2D canvas using React Flow.

## Technology Stack
- **Frontend**: React + TypeScript + React Flow + Zustand + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + OpenAI SDK
- **Persistence**: Browser localStorage (MVP)

## Development Phases

### Phase 1: Project Setup & Foundation (Session 1)
**Goal**: Establish project structure and basic dependencies

#### 1.1 Project Initialization
- [ ] Create project directory structure
- [ ] Initialize frontend React app with TypeScript
- [ ] Initialize backend Node.js app with TypeScript
- [ ] Set up package.json files with dependencies
- [ ] Configure TypeScript for both frontend and backend
- [ ] Set up Tailwind CSS configuration

#### 1.2 Shared Types Setup
- [ ] Create shared types.ts with ArgumentNode and ArgumentEdge interfaces
- [ ] Set up type sharing between frontend and backend

#### 1.3 Environment Configuration
- [ ] Create .env files for API keys
- [ ] Set up CORS configuration
- [ ] Configure development scripts

### Phase 2: Backend Implementation (Session 1-2)
**Goal**: Build the API server and LLM integration

#### 2.1 Core Backend Structure
- [ ] Set up Express server with middleware
- [ ] Create basic error handling
- [ ] Implement CORS and body parsing

#### 2.2 LLM Service
- [ ] Implement llmService.ts with OpenAI integration
- [ ] Create prompt templates for support/refute/unpack actions
- [ ] Add error handling for API calls
- [ ] Test LLM integration

#### 2.3 API Controller
- [ ] Implement argumentController.ts
- [ ] Create /api/generate endpoint
- [ ] Add request validation
- [ ] Implement intelligent node positioning logic
- [ ] Add comprehensive error handling

### Phase 3: Frontend State Management (Session 2)
**Goal**: Implement Zustand store and data persistence

#### 3.1 Zustand Store
- [ ] Create useStore.ts with nodes and edges state
- [ ] Implement addNode, addEdge, updateNodeLabel actions
- [ ] Add localStorage persistence
- [ ] Create loading states for async operations

#### 3.2 API Service
- [ ] Implement api.ts service
- [ ] Create generateAndAddNode function
- [ ] Add error handling and retry logic

### Phase 4: React Flow Integration (Session 2-3)
**Goal**: Build the visual canvas and custom components

#### 4.1 Canvas Component
- [ ] Create ArgumentCanvas.tsx
- [ ] Set up ReactFlowProvider
- [ ] Configure nodeTypes and edgeTypes
- [ ] Implement canvas event handlers

#### 4.2 Custom Node Component
- [ ] Create ArgumentNode.tsx
- [ ] Implement editable textarea (double-click to edit)
- [ ] Add visual styling based on author (user/llm)
- [ ] Implement selection states
- [ ] Add React Flow handles

#### 4.3 Custom Edge Component
- [ ] Create ArgumentEdge.tsx (if needed)
- [ ] Implement animated edges
- [ ] Add visual indicators for relation types

### Phase 5: User Interface Components (Session 3)
**Goal**: Build interaction panels and controls

#### 5.1 Main App Component
- [ ] Create App.tsx with layout
- [ ] Add "Add Initial Claim" button
- [ ] Implement responsive design

#### 5.2 Interaction Panel
- [ ] Create InteractionPanel.tsx
- [ ] Implement Support/Refute/Unpack buttons
- [ ] Add loading states and spinners
- [ ] Position panel relative to selected node

#### 5.3 Responsive Design
- [ ] Implement mobile-friendly layouts
- [ ] Add touch-friendly button sizes
- [ ] Test responsive behavior

### Phase 6: Integration & Testing (Session 3-4)
**Goal**: Connect all components and ensure functionality

#### 6.1 End-to-End Integration
- [ ] Connect frontend to backend
- [ ] Test complete user flow
- [ ] Verify localStorage persistence
- [ ] Test error scenarios

#### 6.2 User Experience Polish
- [ ] Add loading indicators
- [ ] Implement smooth animations
- [ ] Add keyboard shortcuts
- [ ] Optimize performance

#### 6.3 Testing & Debugging
- [ ] Test all user interactions
- [ ] Verify LLM responses
- [ ] Test responsive design
- [ ] Debug any issues

### Phase 7: Documentation & Deployment (Session 4)
**Goal**: Prepare for deployment and create documentation

#### 7.1 Documentation
- [ ] Create README.md with setup instructions
- [ ] Document API endpoints
- [ ] Add usage examples

#### 7.2 Deployment Preparation
- [ ] Create production build scripts
- [ ] Set up environment variables
- [ ] Prepare deployment instructions

## File Structure (Target)
```
dianoia/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ArgumentCanvas.tsx
│   │   │   ├── ArgumentNode.tsx
│   │   │   └── InteractionPanel.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── store/
│   │   │   └── useStore.ts
│   │   ├── types/
│   │   │   └── types.ts
│   │   └── App.tsx
│   ├── package.json
│   └── tailwind.config.js
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   └── llmService.ts
│   │   ├── controllers/
│   │   │   └── argumentController.ts
│   │   ├── types/
│   │   │   └── types.ts
│   │   └── index.ts
│   ├── package.json
│   └── .env
├── shared/
│   └── types.ts
├── README.md
└── DEVELOPMENT_PLAN.md
```

## Success Criteria
- [ ] User can create an initial claim
- [ ] AI generates supporting/refuting claims on demand
- [ ] Claims are visually connected on canvas
- [ ] Graph state persists in localStorage
- [ ] Responsive design works on mobile
- [ ] Error handling is robust
- [ ] Performance is smooth

## Notes for Successor Sessions
- Check progress.md for current status
- Ensure all dependencies are installed
- Verify environment variables are set
- Test the complete user flow before proceeding
- Focus on one phase at a time
- Document any deviations from the plan 