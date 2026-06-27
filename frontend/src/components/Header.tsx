import { ShieldCheck, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggle: () => void;
}

export default function Header({ isDark, onToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass-card glass-card-light dark:glass-card-dark transition-colors duration-300">
      <div className="max-w-[860px] mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-cobalt" strokeWidth={2.5} />
          <span className="text-xl font-extrabold tracking-tight text-primary-light dark:text-primary-dark">
            Verity
          </span>
        </div>

        <button
          onClick={onToggle}
          className="glass-pill glass-pill-light dark:glass-pill-dark flex items-center gap-2 px-4 py-2 transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-primary-dark" />
          ) : (
            <Moon className="w-4 h-4 text-primary-light" />
          )}
          <span className="text-xs font-semibold text-primary-light dark:text-primary-dark">
            {isDark ? 'Light' : 'Dark'}
          </span>
        </button>
      </div>
    </header>
  );
}
