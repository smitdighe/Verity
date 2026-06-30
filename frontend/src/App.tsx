import { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import InputCard from './components/InputCard';
import LoadingState from './components/LoadingState';
import ResultCard from './components/ResultCard';
import Footer from './components/Footer';

interface ShapFeature {
  feature_name: string;
  shap_value: number;
  direction: 'SCAM' | 'LEGIT';
}

interface AnalysisResult {
  verdict: 'SCAM' | 'LEGIT';
  confidence: number;
  shap_features: ShapFeature[];
  explanation: string | null;
}

type AppState = 'idle' | 'loading' | 'result' | 'error';

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [appState, setAppState] = useState<AppState>('idle');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleAnalyze = useCallback(async (text: string) => {
    setAppState('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const response = await fetch('https://verity-backend-vyrr.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_text: text }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
      setAppState('result');
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not reach the analysis server. Make sure the backend is running.'
      );
      setAppState('error');
    }
  }, []);

  const handleReset = useCallback(() => {
    setAppState('idle');
    setResult(null);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark transition-colors duration-300 relative overflow-hidden">
      <div className="background-orbs" aria-hidden="true">
        <div className="background-orb background-orb-1" />
        <div className="background-orb background-orb-2" />
        <div className="background-orb background-orb-3" />
        <div className="background-orb background-orb-4" />
      </div>

      <div className="relative z-10">
        <Header isDark={isDark} onToggle={() => setIsDark((d) => !d)} />

        <main className="max-w-[860px] mx-auto px-6 pb-4">
          <HeroSection />

          <InputCard onAnalyze={handleAnalyze} isLoading={appState === 'loading'} />

          <div className="mt-6">
            {appState === 'loading' && <LoadingState />}

            {appState === 'result' && result && (
              <ResultCard result={result} onReset={handleReset} />
            )}

            {appState === 'error' && (
              <div className="glass-card glass-card-light dark:glass-card-dark p-6 sm:p-8 animate-fadeSlideUp border-l-4 border-l-verdict-scam">
                <div className="text-sm font-semibold text-verdict-scam mb-1">Analysis Failed</div>
                <p className="text-sm text-primary-light dark:text-primary-dark">
                  {errorMsg || 'Could not reach the analysis server. Make sure the backend is running.'}
                </p>
                <button
                  onClick={handleReset}
                  className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-[10px] border border-cobalt text-cobalt font-semibold text-sm transition-all duration-200 hover:bg-cobalt/10"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
