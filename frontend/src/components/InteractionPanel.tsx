import React from 'react';
import { ArgumentNode, Action } from '../types';
import { useStore } from '../store/useStore';
import { generateAndAddNode } from '../services/api';
import { nanoid } from 'nanoid';

interface InteractionPanelProps {
    selectedNode: ArgumentNode;
}

export default function InteractionPanel({ selectedNode }: InteractionPanelProps) {
    const { addNode, addEdge, setLoading, isLoading } = useStore();

    const handleAction = async (action: Action) => {
        if (isLoading) return;

        setLoading(true);
        try {
            const result = await generateAndAddNode(selectedNode, action);
            addNode(result.newNode);
            addEdge(result.newEdge);
        } catch (error) {
            console.error('Failed to generate argument:', error);
            alert('Failed to generate argument. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="absolute top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Generate new argument:
            </h3>

            <div className="space-y-2">
                <button
                    onClick={() => handleAction('supports')}
                    disabled={isLoading}
                    className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                    {isLoading ? '⏳' : '➕'} Support
                </button>

                <button
                    onClick={() => handleAction('refutes')}
                    disabled={isLoading}
                    className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                    {isLoading ? '⏳' : '➖'} Refute
                </button>

                <button
                    onClick={() => handleAction('unpacks')}
                    disabled={isLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded transition-colors"
                >
                    {isLoading ? '⏳' : '❓'} Unpack
                </button>
            </div>

            {isLoading && (
                <div className="mt-3 text-center text-sm text-gray-500">
                    Generating argument...
                </div>
            )}
        </div>
    );
} 