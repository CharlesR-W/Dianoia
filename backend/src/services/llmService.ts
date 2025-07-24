import { Configuration, OpenAIApi } from 'openai';
import axios from 'axios';
import { Action } from '../types';
import { debug } from '../../../shared/debug';

interface LLMConfig {
    provider: 'openai' | 'openrouter';
    apiKey: string;
    model?: string;
}

// Store for session-based API keys
const sessionKeys = new Map<string, LLMConfig>();

export function setSessionKey(sessionId: string, config: LLMConfig): void {
    debug.info('llm_service', 'session_key_set', 'Setting session API key', {
        sessionId,
        provider: config.provider,
        model: config.model,
        hasApiKey: !!config.apiKey
    });

    sessionKeys.set(sessionId, config);

    debug.trace('llm_service', 'session_keys_count', 'Current session keys count', {
        count: sessionKeys.size
    });
}

export function getSessionKey(sessionId: string): LLMConfig | null {
    const config = sessionKeys.get(sessionId) || null;

    debug.trace('llm_service', 'session_key_retrieved', 'Retrieved session key', {
        sessionId,
        found: !!config,
        provider: config?.provider
    });

    return config;
}

function getPromptTemplate(action: Action, claim: string): string {
    debug.trace('llm_service', 'prompt_generation', 'Generating prompt template', {
        action,
        claimLength: claim.length
    });

    const baseInstruction = "You are a clear and concise reasoning assistant. Given a claim, generate a *single, concise* new claim as a response. Do not add any preamble or explanation. Just provide the text of the new claim.";

    let prompt: string;
    switch (action) {
        case 'supports':
            prompt = `${baseInstruction}\n\nHere is the claim to support:\n"${claim}"\n\nYour concise supporting claim:`;
            break;
        case 'refutes':
            prompt = `${baseInstruction}\n\nHere is the claim to refute:\n"${claim}"\n\nYour concise refuting claim:`;
            break;
        case 'unpacks':
            prompt = `${baseInstruction}\n\nHere is the claim to analyze:\n"${claim}"\n\nIdentify and state a key underlying assumption of this claim:`;
            break;
        default:
            debug.error('llm_service', 'unknown_action', 'Unknown action provided', { action });
            throw new Error(`Unknown action: ${action}`);
    }

    debug.trace('llm_service', 'prompt_generated', 'Prompt template generated', {
        action,
        promptLength: prompt.length
    });

    return prompt;
}

async function callOpenAI(apiKey: string, prompt: string, model: string = 'text-davinci-003'): Promise<string> {
    const timerId = debug.startTimer('openai_api_call', { model });

    try {
        debug.info('llm_service', 'openai_call_start', 'Making OpenAI API call', {
            model,
            promptLength: prompt.length
        });

        const configuration = new Configuration({ apiKey });
        const openai = new OpenAIApi(configuration);

        const response = await openai.createCompletion({
            model: model,
            prompt: prompt,
            temperature: 0.7,
            max_tokens: 50,
        });

        const result = response.data.choices[0]?.text?.trim() || 'No response generated';

        debug.info('llm_service', 'openai_call_success', 'OpenAI API call successful', {
            model,
            resultLength: result.length,
            usage: response.data.usage
        });

        return result;
    } catch (error) {
        debug.trackError(error as Error, 'llm_service', 'openai_call_error', {
            model,
            promptLength: prompt.length
        });
        throw error;
    } finally {
        debug.endTimer(timerId);
    }
}

async function callOpenRouter(apiKey: string, prompt: string, model: string = 'openai/gpt-3.5-turbo'): Promise<string> {
    const timerId = debug.startTimer('openrouter_api_call', { model });

    try {
        debug.info('llm_service', 'openrouter_call_start', 'Making OpenRouter API call', {
            model,
            promptLength: prompt.length
        });

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 50,
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            }
        });

        const result = response.data.choices[0]?.message?.content?.trim() || 'No response generated';

        debug.info('llm_service', 'openrouter_call_success', 'OpenRouter API call successful', {
            model,
            resultLength: result.length,
            usage: response.data.usage
        });

        return result;
    } catch (error) {
        debug.trackError(error as Error, 'llm_service', 'openrouter_call_error', {
            model,
            promptLength: prompt.length
        });
        throw error;
    } finally {
        debug.endTimer(timerId);
    }
}

export async function generateArgument(claim: string, action: Action, sessionId?: string): Promise<string> {
    const timerId = debug.startTimer('generate_argument', {
        action,
        sessionId,
        claimLength: claim.length
    });

    try {
        debug.info('llm_service', 'argument_generation_start', 'Starting argument generation', {
            action,
            sessionId,
            claimLength: claim.length
        });

        let config: LLMConfig | null = null;

        // Try to get session key first
        if (sessionId) {
            debug.trace('llm_service', 'session_key_lookup', 'Looking up session key', { sessionId });
            config = getSessionKey(sessionId);
        }

        // Fall back to environment variable if no session key
        if (!config && process.env.OPENAI_API_KEY) {
            debug.info('llm_service', 'env_key_fallback', 'Using environment API key as fallback');
            config = {
                provider: 'openai',
                apiKey: process.env.OPENAI_API_KEY,
                model: 'text-davinci-003'
            };
        }

        if (!config) {
            debug.error('llm_service', 'no_api_key', 'No API key configured', {
                sessionId,
                hasEnvKey: !!process.env.OPENAI_API_KEY
            });
            throw new Error('No API key configured. Please set up your API key in the session or environment.');
        }

        debug.info('llm_service', 'config_resolved', 'API configuration resolved', {
            provider: config.provider,
            model: config.model,
            sessionId
        });

        const prompt = getPromptTemplate(action, claim);

        let result: string;
        if (config.provider === 'openai') {
            result = await callOpenAI(config.apiKey, prompt, config.model);
        } else if (config.provider === 'openrouter') {
            result = await callOpenRouter(config.apiKey, prompt, config.model || 'openai/gpt-3.5-turbo');
        } else {
            debug.error('llm_service', 'unsupported_provider', 'Unsupported provider', { provider: config.provider });
            throw new Error(`Unsupported provider: ${config.provider}`);
        }

        debug.info('llm_service', 'argument_generation_success', 'Argument generation completed', {
            action,
            originalClaim: claim,
            generatedClaim: result,
            provider: config.provider
        });

        return result;
    } catch (error) {
        debug.trackError(error as Error, 'llm_service', 'argument_generation_error', {
            action,
            sessionId,
            claim
        });

        console.error('Error calling LLM API:', error);
        throw new Error('Failed to generate argument from LLM');
    } finally {
        debug.endTimer(timerId);
    }
} 