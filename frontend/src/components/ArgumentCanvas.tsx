import React, { useCallback, useEffect } from 'react';
import ReactFlow, {
    Node,
    Edge,
    NodeChange,
    EdgeChange,
    Connection,
    addEdge,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    Controls,
    Background,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useStore } from '../store/useStore';
import ArgumentNode from './ArgumentNode';
import InteractionPanel from './InteractionPanel';

const nodeTypes = {
    argumentNode: ArgumentNode,
};

export default function ArgumentCanvas() {
    const {
        nodes,
        edges,
        selectedNode,
        setNodes,
        setEdges,
        loadFromLocalStorage
    } = useStore();

    // Load saved data on mount
    useEffect(() => {
        loadFromLocalStorage();
    }, [loadFromLocalStorage]);

    const onNodesChange = useCallback(
        (changes: NodeChange[]) => {
            const updatedNodes = changes.reduce((acc, change) => {
                if (change.type === 'position' && change.position) {
                    const nodeIndex = acc.findIndex(n => n.id === change.id);
                    if (nodeIndex !== -1) {
                        acc[nodeIndex] = { ...acc[nodeIndex], position: change.position };
                    }
                }
                return acc;
            }, [...nodes]);
            setNodes(updatedNodes);
        },
        [nodes, setNodes]
    );

    const onEdgesChange = useCallback(
        (changes: EdgeChange[]) => {
            // For now, we don't allow edge changes in the MVP
            // This can be extended later for manual edge creation
        },
        [setEdges]
    );

    const onConnect = useCallback(
        (params: Connection) => {
            // For now, we don't allow manual connections in the MVP
            // All connections are created automatically when generating arguments
        },
        [setEdges]
    );

    return (
        <div className="w-full h-full relative">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Controls />
                    <Background />
                </ReactFlow>
            </ReactFlowProvider>

            {selectedNode && (
                <InteractionPanel selectedNode={selectedNode} />
            )}
        </div>
    );
} 