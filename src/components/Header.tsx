import ToolBar, { type ToolBarProps } from './ToolBar';

type HeaderProps = ToolBarProps & {
    onDarkModeToggle: () => void;
    onMapModeToggle: () => void;
};

export default function Header({
    onDarkModeToggle,
    onMapModeToggle,
    ...toolBarProps
}: HeaderProps) {
    return (
        <header className='w-full flex flex-col bg-surface select-none shadow border-b border-bdr'>
            <div className='flex justify-between items-center px-10 py-2 border-b border-bdr'>
                <h1 className='text-3xl font-bold text-text-main'>PF Visualizer</h1>
                <div className='flex gap-3'>
                    <button onClick={onDarkModeToggle}>DarkMode</button>
                    <button onClick={onMapModeToggle}>MapMode</button>
                </div>
            </div>
            <ToolBar {...toolBarProps} />
        </header>
    )
}