import React from 'react';
import clsx from 'clsx';

interface LabelControlProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Wrapper for label + control using CSS Grid
 */
export default function LabelControl({ label, children, className }: LabelControlProps) {
    return (
        <div className={clsx('flex flex-col gap-2', className)}>
            <label className="text-sm text-text-muted whitespace-nowrap">{label}</label>
            {children}
        </div>
    );
}
