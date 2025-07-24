import React, { useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { ArgumentNode as ArgumentNodeType } from '../types';
import { useStore } from '../store/useStore';

interface ArgumentNodeData {
    label: string;
    author: 'user' | 'llm';
}

export default function ArgumentNode({ data, id, selected }: NodeProps<ArgumentNodeData>) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(data.label);
    const { updateNodeLabel, setSelectedNode } = useStore();

    const handleDoubleClick = useCallback(() => {
        setIsEditing(true);
        setEditValue(data.label);
    }, [data.label]);

    const handleEditSubmit = useCallback(() => {
        if (editValue.trim()) {
            updateNodeLabel(id, editValue.trim());
        }
        setIsEditing(false);
    }, [editValue, id, updateNodeLabel]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleEditSubmit();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
            setEditValue(data.label);
        }
    }, [handleEditSubmit, data.label]);

    const handleClick = useCallback(() => {
        setSelectedNode({ id, type: 'argumentNode', position: { x: 0, y: 0 }, data });
    }, [id, data, setSelectedNode]);

    const bgColor = data.author === 'user' ? 'bg-blue-50' : 'bg-green-50';
    const borderColor = selected ? 'border-blue-500' : 'border-gray-300';

    return (
        <div
            className={`${bgColor} border-2 ${borderColor} rounded-lg p-4 min-w-[200px] max-w-[300px] shadow-md`}
            onClick={handleClick}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3" />

            {isEditing ? (
                <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleEditSubmit}
                    onKeyDown={handleKeyDown}
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    rows={3}
                />
            ) : (
                <div
                    className="cursor-text select-none"
                    onDoubleClick={handleDoubleClick}
                >
                    {data.label}
                </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
                {data.author === 'user' ? '👤 You' : '🤖 AI'}
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
} 