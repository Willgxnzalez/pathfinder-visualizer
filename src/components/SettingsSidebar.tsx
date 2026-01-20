import React from 'react';
import clsx from 'clsx';
import LabelControl from './LabelControl';

interface SettingsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    nodeSize: number;
    nodeMin: number;
    nodeMax: number;
    nodeStep: number;
    onNodeSizeChange: (size: number) => void;
}

export default function SettingsSidebar({
    isOpen,
    onClose,
    nodeSize,
    nodeMin,
    nodeMax,
    nodeStep,
    onNodeSizeChange,
}: SettingsSidebarProps) {
    return (
        <>
            {/* Darken screen when open */}
            <div
                className={clsx(
                    'fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />
            <div
                className={clsx(
                    'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-surface border-r border-bdr z-50 overflow-y-auto transition-transform duration-300',
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                )}
            >
                <div className="p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-lg font-bold text-text-main">Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-surface-highlight transition-all text-text-muted hover:text-text-main"
                        >
                            ✕
                        </button>
                    </div>
                    <LabelControl label={`Node Size: ${nodeSize}px`}>
                        <input
                            type="range"
                            min={nodeMin}
                            max={nodeMax}
                            step={nodeStep}
                            value={nodeSize}
                            onChange={e => onNodeSizeChange(Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer"
                        />
                    </LabelControl>
                </div>
            </div>
        </>
    );
}
