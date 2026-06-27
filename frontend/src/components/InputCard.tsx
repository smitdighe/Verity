import { useState, useCallback } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface InputCardProps {
  onAnalyze: (text: string) => void;
  isLoading: boolean;
}

export default function InputCard({ onAnalyze, isLoading }: InputCardProps) {
  const [text, setText] = useState('');

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!text.trim() || isLoading) return;
    onAnalyze(text.trim());
  }, [text, isLoading, onAnalyze]);

  const isDisabled = !text.trim() || isLoading;

  return (
    <div className="glass-card glass-card-light dark:glass-card-dark p-6 sm:p-8">
      <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-secondary-light dark:text-secondary-dark mb-3">
        Paste Job Posting
      </label>

      <textarea
        value={text}
        onChange={handleChange}
        placeholder="Paste the full job posting here — title, description, requirements, everything you see..."
        className="w-full min-h-[220px] resize-y rounded-[14px] p-4 text-sm leading-relaxed text-primary-light dark:text-primary-dark placeholder:text-secondary-light/60 dark:placeholder:text-secondary-dark/60 glass-input-light dark:glass-input-dark focus:border-cobalt focus:ring-0 outline-none transition-all duration-200"
        disabled={isLoading}
      />

      <div className="flex justify-end mt-2">
        <span className="text-xs text-secondary-light dark:text-secondary-dark">
          {text.length.toLocaleString()} characters
        </span>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isDisabled}
        className={`mt-4 w-full h-[52px] rounded-[12px] font-bold text-white flex items-center justify-center gap-2.5 transition-all duration-200 ${
          isDisabled
            ? 'bg-cobalt/50 cursor-not-allowed'
            : 'bg-cobalt hover:bg-cobalt-hover hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(29,110,224,0.3)] active:scale-[0.99]'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            <span>Analyze Job Posting</span>
          </>
        )}
      </button>
    </div>
  );
}
