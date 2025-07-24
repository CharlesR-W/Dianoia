import { ArgumentNode, Action } from '../types';
import { debug } from '../utils/debug';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Generate a unique session ID for this browser session
const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

debug.info('api_service', 'initialization', 'API service initialized', {
    apiBaseUrl: API_BASE_URL,
    sessionId,
    environment: process.env.NODE_ENV || 'development'
});

export async function setupAPIKey(
    provider: 'openai' | 'openrouter',
    apiKey: string,
    model?: string
): Promise<void> {
    debug.startTimer('setup_api_key');

    try {
        debug.info('api_service', 'setup_key_start', 'Setting up API key', {
            provider,
            model,
            hasApiKey: !!apiKey,
            sessionId
        });

        const requestBody = {
            sessionId,
            provider,
            apiKey,
            model,
        };

        debug.trackAPIRequest('POST', `${API_BASE_URL}/api/setup-key`, requestBody);

        const response = await fetch(`${API_BASE_URL}/api/setup-key`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        debug.trackAPIResponse('POST', `${API_BASE_URL}/api/setup-key`, response.status);

        if (!response.ok) {
            const errorData = await response.json();
            debug.error('api_service', 'setup_key_error', 'API key setup failed', {
                status: response.status,
                error: errorData,
                provider,
                sessionId
            });
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        // Store the provider info in localStorage for UI display
        localStorage.setItem('dianoia_provider', provider);
        localStorage.setItem('dianoia_model', model || '');

        debug.info('api_service', 'setup_key_success', 'API key setup completed successfully', {
            provider,
            model,
            sessionId
        });

    } catch (error) {
        debug.trackError(error as Error, 'api_service', 'setup_key_failed');
        console.error('Error setting up API key:', error);
        throw error;
    } finally {
        debug.endTimer('setup_api_key');
    }
}

export async function generateAndAddNode(
    sourceNode: ArgumentNode,
    action: Action
): Promise<{ newNode: ArgumentNode; newEdge: any }> {
    debug.startTimer('generate_and_add_node');

    try {
        debug.info('api_service', 'generate_request_start', 'Starting generate request', {
            action,
            sourceNodeId: sourceNode.id,
            sourceNodeLabel: sourceNode.data.label,
            sessionId
        });

        const requestBody = {
            sourceNode,
            action,
            sessionId,
        };

        debug.trackAPIRequest('POST', `${API_BASE_URL}/api/generate`, requestBody);

        const response = await fetch(`${API_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            debug.error('api_service', 'generate_request_error', 'Generate request failed', {
                status: response.status,
                error: errorData,
                action,
                sourceNodeId: sourceNode.id,
                sessionId
            });
            throw new Error(errorData.message || 'Failed to generate argument');
        }

        const data = await response.json();

        debug.trackAPIResponse('POST', `${API_BASE_URL}/api/generate`, response.status);

        debug.info('api_service', 'generate_request_success', 'Generate request completed successfully', {
            action,
            sourceNodeId: sourceNode.id,
            newNodeId: data.newNode?.id,
            newEdgeId: data.newEdge?.id,
            sessionId
        });

        return data;
    } catch (error) {
        debug.trackError(error as Error, 'api_service', 'generate_request_failed');
        console.error('API Error:', error);
        throw error;
    } finally {
        debug.endTimer('generate_and_add_node');
    }
} 