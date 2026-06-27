import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ShieldCheck, RotateCcw } from 'lucide-react';

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

interface ResultCardProps {
  result: AnalysisResult;
  onReset: () => void;
}

function formatFeatureName(name: string): string {
  const flaggedMap: Record<string, string> = {
    flag_deposit: '⚠ Deposit Keywords',
    flag_crypto: '⚠ Crypto Keywords',
    flag_urgent: '⚠ Urgency Keywords',
    flag_download: '⚠ Download Keywords',
    flag_wire_transfer: '⚠ Wire Transfer Keywords',
    flag_run_commands: '⚠ Command Execution Keywords',
  };

  if (flaggedMap[name]) return flaggedMap[name];

  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ResultCard({ result, onReset }: ResultCardProps) {
  const [animatedConfidence, setAnimatedConfidence] = useState(0);
  const isScam = result.verdict === 'SCAM';
  const verdictColor = isScam ? 'text-verdict-scam' : 'text-verdict-legit';
  const verdictBg = isScam ? 'bg-verdict-scam/10 dark:bg-verdict-scam/10' : 'bg-verdict-legit/10 dark:bg-verdict-legit/10';
  const verdictBorder = isScam ? 'border-b border-verdict-scam/30' : 'border-b border-verdict-legit/30';
  const cardGlow = isScam
    ? 'shadow-[0_0_40px_rgba(229,62,62,0.15)]'
    : 'shadow-[0_0_40px_rgba(16,185,129,0.12)]';

  const confidencePct = (result.confidence * 100).toFixed(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedConfidence(result.confidence * 100);
    }, 100);
    return () => clearTimeout(timer);
  }, [result.confidence]);

  const shapFeatures = useMemo(() => {
    const features = result.shap_features.slice(0, 10);
    const maxAbs = Math.max(...features.map((f) => Math.abs(f.shap_value)), 1e-9);
    return features.map((f) => ({
      ...f,
      normalized: Math.abs(f.shap_value) / maxAbs,
    }));
  }, [result.shap_features]);

  return (
    <div className={`glass-card glass-card-light dark:glass-card-dark p-0 animate-fadeSlideUp overflow-hidden ${cardGlow}`}>
      {/* Section A — Verdict Banner */}
      <div className={`px-6 sm:px-8 pt-6 pb-5 ${verdictBg} ${verdictBorder}`}>
        <div className="flex items-center gap-3">
          {isScam ? (
            <AlertTriangle className="w-8 h-8 text-verdict-scam" />
          ) : (
            <ShieldCheck className="w-8 h-8 text-verdict-legit" />
          )}
          <div>
            <div className={`text-[2.2rem] font-extrabold leading-none ${verdictColor}`}>
              {result.verdict}
            </div>
            <p className="mt-1 text-sm text-secondary-light dark:text-secondary-dark">
              {isScam ? 'High confidence fraud detected' : 'Appears to be a legitimate posting'}
            </p>
          </div>
        </div>
      </div>

      {/* Section B — Confidence Score */}
      <div className="px-6 sm:px-8 py-5 border-b border-white/10 dark:border-white/5">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary-light dark:text-secondary-dark mb-3">
          Confidence Score
        </div>
        <div className={`text-[1.8rem] font-extrabold ${verdictColor}`}>
          {confidencePct}%
        </div>
        <div className="mt-3 h-[10px] rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-[800ms] ease-out"
            style={{
              width: `${animatedConfidence}%`,
              background: isScam
                ? 'linear-gradient(90deg, #1D6EE0, #E53E3E)'
                : 'linear-gradient(90deg, #1D6EE0, #10B981)',
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-secondary-light dark:text-secondary-dark">Legit</span>
          <span className="text-[10px] text-secondary-light dark:text-secondary-dark">Scam</span>
        </div>
      </div>

      {/* Section C — SHAP Feature Breakdown */}
      <div className="px-6 sm:px-8 py-5 border-b border-white/10 dark:border-white/5">
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary-light dark:text-secondary-dark">
          What Triggered This Verdict
        </div>
        <div className="mt-1 text-[11px] text-secondary-light/70 dark:text-secondary-dark/70">
          Features that influenced the ML model&apos;s decision
        </div>

        <div className="mt-4 space-y-3">
          {shapFeatures.map((feature, idx) => {
            const barColor = feature.direction === 'SCAM' ? 'bg-verdict-scam' : 'bg-verdict-legit';
            const valueColor = feature.direction === 'SCAM' ? 'text-verdict-scam' : 'text-verdict-legit';
            const sign = feature.shap_value >= 0 ? '+' : '';
            return (
              <div
                key={feature.feature_name + idx}
                className="group flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] rounded-lg px-2 py-1.5 -mx-2 transition-colors duration-150"
              >
                <span className="w-[160px] sm:w-[200px] text-xs text-primary-light dark:text-primary-dark truncate">
                  {formatFeatureName(feature.feature_name)}
                </span>
                <div className="flex-1 h-[6px] rounded-full bg-black/5 dark:bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} animate-barGrow`}
                    style={{
                      '--bar-width': `${feature.normalized * 100}%`,
                      animationDelay: `${idx * 50}ms`,
                    } as React.CSSProperties}
                  />
                </div>
                <span className={`w-[64px] text-right text-xs font-semibold tabular-nums ${valueColor}`}>
                  {sign}{feature.shap_value.toFixed(3)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section D — AI Explanation */}
      <div className="px-6 sm:px-8 py-5 border-b border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary-light dark:text-secondary-dark">
            AI Analysis
          </span>
          <span className="glass-pill glass-pill-light dark:glass-pill-dark px-2.5 py-0.5 text-[10px] font-semibold text-secondary-light dark:text-secondary-dark">
            Powered by Groq
          </span>
        </div>
        {result.explanation ? (
          <blockquote className="border-l-[3px] border-cobalt pl-4 italic text-sm leading-relaxed text-primary-light dark:text-primary-dark">
            {result.explanation}
          </blockquote>
        ) : (
          <p className="text-sm text-secondary-light dark:text-secondary-dark">
            AI explanation unavailable
          </p>
        )}
      </div>

      {/* Section E — Analyze Another */}
      <div className="px-6 sm:px-8 py-5 flex justify-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[12px] border border-cobalt text-cobalt font-semibold text-sm transition-all duration-200 hover:bg-cobalt/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          <RotateCcw className="w-4 h-4" />
          Analyze Another Posting
        </button>
      </div>
    </div>
  );
}
