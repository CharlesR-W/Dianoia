import React, { useState, useEffect } from 'react';
import { setupAPIKey } from '../services/api';

interface APIKeySetupProps {
    onSetupComplete: () => void;
}

export const APIKeySetup: React.FC<APIKeySetupProps> = ({ onSetupComplete }) => {
    const [provider, setProvider] = useState<'openai' | 'openrouter'>('openrouter');
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    // Check if API key is already configured
    useEffect(() => {
        const storedProvider = localStorage.getItem('dianoia_provider');
        if (storedProvider) {
            setIsVisible(false);
            onSetupComplete();
        } else {
            setIsVisible(true);
        }
    }, [onSetupComplete]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!apiKey.trim()) {
            setError('Please enter your API key');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await setupAPIKey(provider, apiKey.trim(), model.trim() || undefined);
            setIsVisible(false);
            onSetupComplete();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to setup API key');
        } finally {
            setIsLoading(false);
        }
    };

    const getDefaultModel = () => {
        return provider === 'openai' ? 'text-davinci-003' : 'openai/gpt-3.5-turbo';
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h2 className="text-xl font-bold mb-4">Setup API Key</h2>
                <p className="text-gray-600 mb-4">
                    Enter your API key to start using Dianoia. Your key is stored securely for this session only.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Provider
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as 'openai' | 'openrouter')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="openrouter">OpenRouter (Recommended)</option>
                            <option value="openai">OpenAI</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            API Key
                        </label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder={provider === 'openrouter' ? 'sk-or-v1-...' : 'sk-...'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Model (Optional)
                        </label>
                        <input
                            type="text"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder={getDefaultModel()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Default: {getDefaultModel()}
                        </p>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Setting up...' : 'Setup API Key'}
                        </button>
                    </div>
                </form>

                <div className="mt-4 text-xs text-gray-500">
                    <p><strong>OpenRouter:</strong> Get your key at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">openrouter.ai</a></p>
                    <p><strong>OpenAI:</strong> Get your key at <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a></p>
                </div>
            </div>
        </div>
    );
}; 