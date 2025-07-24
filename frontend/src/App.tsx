import React, { useCallback, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import './App.css';
import ArgumentCanvas from './components/ArgumentCanvas';
import { useStore } from './store/useStore';
import { ArgumentNode } from './types';
import { APIKeySetup } from './components/APIKeySetup';
import DebugPanel from './components/DebugPanel';
import { debug } from './utils/debug';

const App: React.FC = () => {
    const { addNode, loadFromLocalStorage } = useStore();
    const [apiKeyReady, setApiKeyReady] = useState(!!localStorage.getItem('dianoia_provider'));
    const [debugPanelOpen, setDebugPanelOpen] = useState(false);

    // Initialize app and load saved state
    useEffect(() => {
        debug.info('app', 'initialization', 'App component initializing', {
            apiKeyReady,
            hasProvider: !!localStorage.getItem('dianoia_provider'),
            provider: localStorage.getItem('dianoia_provider')
        });

        // Load saved graph from localStorage
        try {
            loadFromLocalStorage();
            debug.info('app', 'load_complete', 'Initial load from localStorage completed');
        } catch (error) {
            debug.trackError(error as Error, 'app', 'initial_load_error');
        }
    }, [loadFromLocalStorage, apiKeyReady]);

    const handleAddInitialClaim = useCallback(() => {
        debug.info('app', 'add_initial_claim', 'User clicked add initial claim button');

        const newNode: ArgumentNode = {
            id: nanoid(),
            type: 'argumentNode',
            position: { x: 400, y: 200 },
            data: {
                label: 'Click to edit your initial claim...',
                author: 'user'
            }
        };

        debug.info('app', 'creating_initial_node', 'Creating initial claim node', {
            nodeId: newNode.id,
            position: newNode.position,
            label: newNode.data.label
        });

        addNode(newNode);

        debug.info('app', 'initial_claim_added', 'Initial claim node added to store', {
            nodeId: newNode.id
        });
    }, [addNode]);

    const handleSetupComplete = useCallback(() => {
        debug.info('app', 'setup_complete', 'API key setup completed, switching to main app');
        setApiKeyReady(true);
    }, []);

    const handleToggleDebugPanel = useCallback(() => {
        debug.info('app', 'toggle_debug_panel', 'User toggled debug panel', {
            newState: !debugPanelOpen
        });
        setDebugPanelOpen(!debugPanelOpen);
    }, [debugPanelOpen]);

    if (!apiKeyReady) {
        debug.trace('app', 'rendering_setup', 'Rendering API key setup component');
        return <APIKeySetup onSetupComplete={handleSetupComplete} />;
    }

    debug.trace('app', 'rendering_main', 'Rendering main app interface');

    return (
        <div className="App h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Dianoia - Visual Argumentation Co-Pilot
                    </h1>
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={handleAddInitialClaim}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            ➕ Add Initial Claim
                        </button>
                        <button
                            onClick={handleToggleDebugPanel}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            🐛 Debug
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-gray-50">
                <ArgumentCanvas />
            </main>

            <DebugPanel
                isOpen={debugPanelOpen}
                onClose={() => setDebugPanelOpen(false)}
            />
        </div>
    );
};

export default App; 