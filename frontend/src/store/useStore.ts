import { create } from 'zustand';
import { ArgumentNode, ArgumentEdge } from '../types';
import { debug } from '../utils/debug';

interface ArgumentStore {
    nodes: ArgumentNode[];
    edges: ArgumentEdge[];
    selectedNode: ArgumentNode | null;
    isLoading: boolean;

    // Actions
    addNode: (node: ArgumentNode) => void;
    addEdge: (edge: ArgumentEdge) => void;
    updateNodeLabel: (nodeId: string, label: string) => void;
    setNodes: (nodes: ArgumentNode[]) => void;
    setEdges: (edges: ArgumentEdge[]) => void;
    setSelectedNode: (node: ArgumentNode | null) => void;
    setLoading: (loading: boolean) => void;

    // Persistence
    saveToLocalStorage: () => void;
    loadFromLocalStorage: () => void;
}

export const useStore = create<ArgumentStore>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNode: null,
    isLoading: false,

    addNode: (node: ArgumentNode) => {
        debug.info('store', 'add_node', 'Adding new node to store', {
            nodeId: node.id,
            nodeLabel: node.data.label,
            nodeAuthor: node.data.author,
            currentNodesCount: get().nodes.length
        });

        set((state) => {
            const newNodes = [...state.nodes, node];
            const newState = { ...state, nodes: newNodes };

            debug.info('store', 'state_change', 'State changed after adding node', {
                nodeId: node.id,
                action: 'addNode',
                oldNodesCount: state.nodes.length,
                newNodesCount: newNodes.length
            });

            // Save to localStorage
            try {
                localStorage.setItem('dianoia-graph', JSON.stringify({
                    nodes: newNodes,
                    edges: state.edges
                }));
                debug.trace('store', 'localStorage_save', 'Saved to localStorage after adding node', {
                    nodeId: node.id,
                    totalNodes: newNodes.length
                });
            } catch (error) {
                debug.trackError(error as Error, 'store', 'localStorage_save_error');
            }

            return newState;
        });
    },

    addEdge: (edge: ArgumentEdge) => {
        debug.info('store', 'add_edge', 'Adding new edge to store', {
            edgeId: edge.id,
            sourceId: edge.source,
            targetId: edge.target,
            relation: edge.data.relation,
            currentEdgesCount: get().edges.length
        });

        set((state) => {
            const newEdges = [...state.edges, edge];
            const newState = { ...state, edges: newEdges };

            debug.info('store', 'state_change', 'State changed after adding edge', {
                edgeId: edge.id,
                action: 'addEdge',
                oldEdgesCount: state.edges.length,
                newEdgesCount: newEdges.length
            });

            // Save to localStorage
            try {
                localStorage.setItem('dianoia-graph', JSON.stringify({
                    nodes: state.nodes,
                    edges: newEdges
                }));
                debug.trace('store', 'localStorage_save', 'Saved to localStorage after adding edge', {
                    edgeId: edge.id,
                    totalEdges: newEdges.length
                });
            } catch (error) {
                debug.trackError(error as Error, 'store', 'localStorage_save_error');
            }

            return newState;
        });
    },

    updateNodeLabel: (nodeId: string, label: string) => {
        debug.info('store', 'update_node_label', 'Updating node label', {
            nodeId,
            newLabel: label,
            currentNodesCount: get().nodes.length
        });

        set((state) => {
            const oldNode = state.nodes.find(node => node.id === nodeId);
            const newNodes = state.nodes.map(node =>
                node.id === nodeId ? { ...node, data: { ...node.data, label } } : node
            );
            const newState = { ...state, nodes: newNodes };

            debug.info('store', 'state_change', 'State changed after updating node label', {
                nodeId,
                oldLabel: oldNode?.data.label,
                newLabel: label,
                action: 'updateNodeLabel'
            });

            // Save to localStorage
            try {
                localStorage.setItem('dianoia-graph', JSON.stringify({
                    nodes: newNodes,
                    edges: state.edges
                }));
                debug.trace('store', 'localStorage_save', 'Saved to localStorage after updating node label', {
                    nodeId,
                    newLabel: label
                });
            } catch (error) {
                debug.trackError(error as Error, 'store', 'localStorage_save_error');
            }

            return newState;
        });
    },

    setNodes: (nodes: ArgumentNode[]) => {
        debug.info('store', 'set_nodes', 'Setting nodes array', {
            nodesCount: nodes.length,
            nodeIds: nodes.map(n => n.id)
        });

        set((state) => {
            const newState = { ...state, nodes };

            debug.info('store', 'state_change', 'State changed after setting nodes', {
                oldNodesCount: state.nodes.length,
                newNodesCount: nodes.length,
                action: 'setNodes'
            });

            // Save to localStorage
            try {
                localStorage.setItem('dianoia-graph', JSON.stringify({
                    nodes,
                    edges: state.edges
                }));
                debug.trace('store', 'localStorage_save', 'Saved to localStorage after setting nodes', {
                    nodesCount: nodes.length
                });
            } catch (error) {
                debug.trackError(error as Error, 'store', 'localStorage_save_error');
            }

            return newState;
        });
    },

    setEdges: (edges: ArgumentEdge[]) => {
        debug.info('store', 'set_edges', 'Setting edges array', {
            edgesCount: edges.length,
            edgeIds: edges.map(e => e.id)
        });

        set((state) => {
            const newState = { ...state, edges };

            debug.info('store', 'state_change', 'State changed after setting edges', {
                oldEdgesCount: state.edges.length,
                newEdgesCount: edges.length,
                action: 'setEdges'
            });

            // Save to localStorage
            try {
                localStorage.setItem('dianoia-graph', JSON.stringify({
                    nodes: state.nodes,
                    edges
                }));
                debug.trace('store', 'localStorage_save', 'Saved to localStorage after setting edges', {
                    edgesCount: edges.length
                });
            } catch (error) {
                debug.trackError(error as Error, 'store', 'localStorage_save_error');
            }

            return newState;
        });
    },

    setSelectedNode: (node: ArgumentNode | null) => {
        debug.info('store', 'set_selected_node', 'Setting selected node', {
            nodeId: node?.id || null,
            nodeLabel: node?.data.label || null
        });

        set((state) => {
            const newState = { ...state, selectedNode: node };

            debug.info('store', 'state_change', 'State changed after setting selected node', {
                oldSelectedNodeId: state.selectedNode?.id,
                newSelectedNodeId: node?.id,
                action: 'setSelectedNode'
            });

            return newState;
        });
    },

    setLoading: (loading: boolean) => {
        debug.info('store', 'set_loading', 'Setting loading state', { loading });

        set((state) => {
            const newState = { ...state, isLoading: loading };

            debug.info('store', 'state_change', 'State changed after setting loading', {
                oldLoading: state.isLoading,
                newLoading: loading,
                action: 'setLoading'
            });

            return newState;
        });
    },

    saveToLocalStorage: () => {
        const { nodes, edges } = get();
        debug.info('store', 'manual_save', 'Manually saving to localStorage', {
            nodesCount: nodes.length,
            edgesCount: edges.length
        });

        try {
            localStorage.setItem('dianoia-graph', JSON.stringify({ nodes, edges }));
            debug.info('store', 'manual_save_success', 'Manual save to localStorage successful');
        } catch (error) {
            debug.trackError(error as Error, 'store', 'manual_save_error');
        }
    },

    loadFromLocalStorage: () => {
        debug.info('store', 'load_from_storage', 'Loading state from localStorage');

        try {
            const saved = localStorage.getItem('dianoia-graph');
            if (saved) {
                const { nodes, edges } = JSON.parse(saved);
                const newNodes = nodes || [];
                const newEdges = edges || [];

                debug.info('store', 'load_success', 'Successfully loaded from localStorage', {
                    nodesCount: newNodes.length,
                    edgesCount: newEdges.length
                });

                set({ nodes: newNodes, edges: newEdges });
            } else {
                debug.info('store', 'load_no_data', 'No saved data found in localStorage');
            }
        } catch (error) {
            debug.trackError(error as Error, 'store', 'load_error');
            console.error('Error loading from localStorage:', error);
        }
    }
}));

// Initialize debug logging for store
debug.info('store', 'store_created', 'Zustand store created and initialized'); 