import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { generateArgument, setSessionKey, getSessionKey } from '../services/llmService';
import { ArgumentNode, ArgumentEdge, Action } from '../types';
import { debug } from '../../../shared/debug';

interface GenerateRequest {
    sourceNode: ArgumentNode;
    action: Action;
    sessionId?: string;
}

interface SetupAPIKeyRequest {
    sessionId: string;
    provider: 'openai' | 'openrouter';
    apiKey: string;
    model?: string;
}

function calculateNewNodePosition(sourceNode: ArgumentNode): { x: number; y: number } {
    debug.trace('controller', 'calculate_position', 'Calculating new node position', {
        sourcePosition: sourceNode.position
    });

    // Position the new node below the source node
    const newPosition = {
        x: sourceNode.position.x,
        y: sourceNode.position.y + 150
    };

    debug.trace('controller', 'position_calculated', 'New position calculated', {
        newPosition,
        sourcePosition: sourceNode.position
    });

    return newPosition;
}

export async function handleGenerate(req: Request, res: Response): Promise<void> {
    const timerId = debug.startTimer('handleGenerate', {
        action: req.body?.action,
        sessionId: req.body?.sessionId
    });

    try {
        debug.info('controller', 'generate_request', 'Received generate request', {
            body: req.body,
            headers: req.headers
        });

        const { sourceNode, action, sessionId }: GenerateRequest = req.body;

        // Validate request body
        if (!sourceNode || !action) {
            debug.warn('controller', 'validation_failed', 'Missing required fields', {
                hasSourceNode: !!sourceNode,
                hasAction: !!action,
                receivedFields: Object.keys(req.body)
            });

            res.status(400).json({ error: 'Missing required fields: sourceNode and action' });
            return;
        }

        if (!['supports', 'refutes', 'unpacks'].includes(action)) {
            debug.warn('controller', 'validation_failed', 'Invalid action provided', {
                action,
                validActions: ['supports', 'refutes', 'unpacks']
            });

            res.status(400).json({ error: 'Invalid action. Must be one of: supports, refutes, unpacks' });
            return;
        }

        debug.info('controller', 'validation_passed', 'Request validation passed', {
            sourceNodeId: sourceNode.id,
            action,
            sessionId
        });

        // Generate new argument using LLM
        debug.info('controller', 'llm_call_start', 'Calling LLM service', {
            claim: sourceNode.data.label,
            action,
            sessionId
        });

        const newClaimText = await generateArgument(sourceNode.data.label, action, sessionId);

        debug.info('controller', 'llm_call_success', 'LLM call completed successfully', {
            originalClaim: sourceNode.data.label,
            newClaim: newClaimText,
            action
        });

        // Create new node
        const newNode: ArgumentNode = {
            id: nanoid(),
            type: 'argumentNode',
            position: calculateNewNodePosition(sourceNode),
            data: {
                label: newClaimText,
                author: 'llm'
            }
        };

        // Create new edge
        const newEdge: ArgumentEdge = {
            id: nanoid(),
            source: sourceNode.id,
            target: newNode.id,
            type: 'argumentEdge',
            data: {
                relation: action
            },
            animated: true
        };

        debug.info('controller', 'response_ready', 'Generated response ready', {
            newNodeId: newNode.id,
            newEdgeId: newEdge.id,
            action
        });

        res.status(200).json({
            newNode,
            newEdge
        });

    } catch (error) {
        debug.trackError(error as Error, 'controller', 'generate_error', {
            body: req.body,
            sessionId: req.body?.sessionId
        });

        console.error('Error in handleGenerate:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        debug.endTimer(timerId);
    }
}

export async function handleSetupAPIKey(req: Request, res: Response): Promise<void> {
    const timerId = debug.startTimer('handleSetupAPIKey', {
        provider: req.body?.provider,
        sessionId: req.body?.sessionId
    });

    try {
        debug.info('controller', 'setup_key_request', 'Received API key setup request', {
            provider: req.body?.provider,
            sessionId: req.body?.sessionId,
            hasApiKey: !!req.body?.apiKey
        });

        const { sessionId, provider, apiKey, model }: SetupAPIKeyRequest = req.body;

        // Validate request body
        if (!sessionId || !provider || !apiKey) {
            debug.warn('controller', 'setup_validation_failed', 'Missing required fields for API key setup', {
                hasSessionId: !!sessionId,
                hasProvider: !!provider,
                hasApiKey: !!apiKey,
                receivedFields: Object.keys(req.body)
            });

            res.status(400).json({ error: 'Missing required fields: sessionId, provider, and apiKey' });
            return;
        }

        if (!['openai', 'openrouter'].includes(provider)) {
            debug.warn('controller', 'setup_validation_failed', 'Invalid provider specified', {
                provider,
                validProviders: ['openai', 'openrouter']
            });

            res.status(400).json({ error: 'Invalid provider. Must be one of: openai, openrouter' });
            return;
        }

        debug.info('controller', 'setup_validation_passed', 'API key setup validation passed', {
            sessionId,
            provider,
            model
        });

        // Store the API key for this session
        setSessionKey(sessionId, { provider, apiKey, model });

        debug.info('controller', 'key_stored', 'API key stored successfully', {
            sessionId,
            provider,
            model
        });

        res.status(200).json({
            message: 'API key configured successfully',
            provider,
            sessionId
        });

    } catch (error) {
        debug.trackError(error as Error, 'controller', 'setup_key_error', {
            body: req.body,
            sessionId: req.body?.sessionId
        });

        console.error('Error in handleSetupAPIKey:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    } finally {
        debug.endTimer(timerId);
    }
} 