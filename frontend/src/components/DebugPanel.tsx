import React, { useState, useEffect } from 'react';
import { debug } from '../utils/debug';

interface DebugPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [config, setConfig] = useState<any>({});
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [filterLevel, setFilterLevel] = useState<string>('all');
    const [filterComponent, setFilterComponent] = useState<string>('all');

    // Refresh logs periodically
    useEffect(() => {
        if (!isOpen || !autoRefresh) return;

        const interval = setInterval(() => {
            setLogs(debug.getLogs());
            setConfig(debug.getConfig());
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, autoRefresh]);

    // Initial load
    useEffect(() => {
        if (isOpen) {
            setLogs(debug.getLogs());
            setConfig(debug.getConfig());
        }
    }, [isOpen]);

    const handleClearLogs = () => {
        debug.clearLogs();
        setLogs([]);
    };

    const handleExportLogs = () => {
        const logData = debug.exportLogs();
        const blob = new Blob([logData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dianoia-debug-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleToggleDebug = () => {
        const newEnabled = !config.enabled;
        debug.updateConfig({ enabled: newEnabled });
        setConfig(debug.getConfig());
    };

    const handleLevelChange = (level: string) => {
        debug.updateConfig({ level: level as any });
        setConfig(debug.getConfig());
    };

    const filteredLogs = logs.filter(log => {
        if (filterLevel !== 'all' && log.level !== filterLevel) return false;
        if (filterComponent !== 'all' && log.component !== filterComponent) return false;
        return true;
    });

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'error': return 'text-red-600 bg-red-50';
            case 'warn': return 'text-yellow-600 bg-yellow-50';
            case 'info': return 'text-blue-600 bg-blue-50';
            case 'debug': return 'text-gray-600 bg-gray-50';
            case 'trace': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-6xl flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">🐛 Debug Panel</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 flex">
                    {/* Controls Panel */}
                    <div className="w-80 border-r p-4 space-y-4">
                        <div>
                            <h3 className="font-semibold mb-2">Debug Settings</h3>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={config.enabled}
                                        onChange={handleToggleDebug}
                                        className="mr-2"
                                    />
                                    Enable Debug Logging
                                </label>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Log Level
                                    </label>
                                    <select
                                        value={config.level}
                                        onChange={(e) => handleLevelChange(e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        <option value="error">Error</option>
                                        <option value="warn">Warning</option>
                                        <option value="info">Info</option>
                                        <option value="debug">Debug</option>
                                        <option value="trace">Trace</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Log Filters</h3>
                            <div className="space-y-2">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Level Filter
                                    </label>
                                    <select
                                        value={filterLevel}
                                        onChange={(e) => setFilterLevel(e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="error">Error</option>
                                        <option value="warn">Warning</option>
                                        <option value="info">Info</option>
                                        <option value="debug">Debug</option>
                                        <option value="trace">Trace</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Component Filter
                                    </label>
                                    <select
                                        value={filterComponent}
                                        onChange={(e) => setFilterComponent(e.target.value)}
                                        className="w-full border rounded px-2 py-1"
                                    >
                                        <option value="all">All Components</option>
                                        <option value="app">App</option>
                                        <option value="store">Store</option>
                                        <option value="api_service">API Service</option>
                                        <option value="server">Server</option>
                                        <option value="controller">Controller</option>
                                        <option value="llm_service">LLM Service</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={handleClearLogs}
                                    className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                                >
                                    Clear Logs
                                </button>
                                <button
                                    onClick={handleExportLogs}
                                    className="w-full bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                                >
                                    Export Logs
                                </button>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={autoRefresh}
                                        onChange={(e) => setAutoRefresh(e.target.checked)}
                                        className="mr-2"
                                    />
                                    Auto Refresh
                                </label>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold mb-2">Stats</h3>
                            <div className="text-sm space-y-1">
                                <div>Total Logs: {logs.length}</div>
                                <div>Filtered: {filteredLogs.length}</div>
                                <div>Errors: {logs.filter(l => l.level === 'error').length}</div>
                                <div>Warnings: {logs.filter(l => l.level === 'warn').length}</div>
                            </div>
                        </div>
                    </div>

                    {/* Logs Display */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Debug Logs</h3>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                            <div className="space-y-2">
                                {filteredLogs.length === 0 ? (
                                    <div className="text-gray-500 text-center py-8">
                                        No logs to display
                                    </div>
                                ) : (
                                    filteredLogs.map((log, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded border ${getLevelColor(log.level)}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="font-mono text-xs">
                                                    [{log.timestamp}] [{log.level.toUpperCase()}] [{log.component}]
                                                </div>
                                                <div className="text-xs opacity-75">
                                                    {log.action}
                                                </div>
                                            </div>
                                            <div className="text-sm mb-2">{log.message}</div>
                                            {log.data && (
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer">Data</summary>
                                                    <pre className="mt-1 bg-white bg-opacity-50 p-2 rounded overflow-auto">
                                                        {JSON.stringify(log.data, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                            {log.context && (
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer">Context</summary>
                                                    <pre className="mt-1 bg-white bg-opacity-50 p-2 rounded overflow-auto">
                                                        {JSON.stringify(log.context, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                            {log.error && (
                                                <details className="text-xs">
                                                    <summary className="cursor-pointer text-red-600">Error Details</summary>
                                                    <pre className="mt-1 bg-red-50 p-2 rounded overflow-auto">
                                                        {JSON.stringify(log.error, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DebugPanel; 