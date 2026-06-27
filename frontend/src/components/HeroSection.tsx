import { Brain, BarChart3, Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="text-center pt-16 pb-12 px-6">
      <h1 className="text-[3rem] font-extrabold leading-[1.1] tracking-tight text-primary-light dark:text-primary-dark">
        Verify before you apply
      </h1>
      

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pt-4">
        <span className="glass-pill glass-pill-light dark:glass-pill-dark inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-secondary-light dark:text-secondary-dark">
          <Brain className="w-3.5 h-3.5" />
          ML-Powered
        </span>
        <span className="glass-pill glass-pill-light dark:glass-pill-dark inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-secondary-light dark:text-secondary-dark">
          <BarChart3 className="w-3.5 h-3.5" />
          SHAP Explainable
        </span>
        <span className="glass-pill glass-pill-light dark:glass-pill-dark inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-secondary-light dark:text-secondary-dark">
          <Zap className="w-3.5 h-3.5" />
          Groq AI Analysis
        </span>
      </div>
    </section>
  );
}
