import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

/**
 * Reusable dropdown component with proper responsive widths
 * Note: Label should be handled by LabelControl wrapper
 */
export default function Dropdown<T extends string>({
    options,
    value,
    onChange,
    disabled,
}: {
    options: readonly T[];
    value: T;
    onChange: (v: T) => void;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div ref={ref} className="relative w-full">
            <button
                type='button'
                disabled={disabled}
                onClick={() => setOpen(!open)}
                className={clsx(
                    'w-full flex justify-between px-3 py-1 rounded-lg',
                    'appearance-none font-medium',
                    'text-text-main',
                    'border border-bdr',
                    'cursor-pointer',
                    'bg-surface-light',
                    'hover:bg-surface-highlight',
                    'transition-all',
                    disabled && 'opacity-60 cursor-not-allowed'
                )}
            >
                {value}
                <ChevronDownIcon className='size-5'/>
            </button>

            {open && (
                <div
                    className={clsx(
                        'absolute top-full left-0 mt-5 w-full z-20 overflow-hidden',
                        'rounded-lg border border-bdr-glass glass shadow-highlight'
                    )}
                    onMouseLeave={() => setOpen(false)}
                >
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            className={clsx(
                                'relative block w-full px-4 py-2 text-left pointer-events-auto cursor-pointer z-10',
                                'text-text-main hover:bg-surface-highlight-glass',
                                opt === value && 'font-semibold bg-surface-light-glass'
                            )}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
