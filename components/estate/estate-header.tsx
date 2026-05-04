interface EstateHeaderProps {
  onClear: () => void;
}

function EstateHeader({ onClear }: EstateHeaderProps) {
  return (
    <header className="flex flex-row items-center justify-between gap-1">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
        V S Jadon Compare
      </h1>
      <button
        onClick={onClear}
        className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors cursor-pointer"
      >
        Clear History
      </button>
    </header>
  );
}

export default EstateHeader;
