export default function LoadingState() {
  return (
    <div className="glass-card glass-card-light dark:glass-card-dark p-6 sm:p-8 animate-fadeSlideUp">
      <div className="space-y-4">
        <div className="h-8 rounded-lg shimmer-light dark:shimmer-dark animate-shimmer w-1/3" />
        <div className="h-4 rounded-lg shimmer-light dark:shimmer-dark animate-shimmer w-full" />
        <div className="h-4 rounded-lg shimmer-light dark:shimmer-dark animate-shimmer w-5/6" />
        <div className="h-4 rounded-lg shimmer-light dark:shimmer-dark animate-shimmer w-4/5" />
        <div className="h-32 rounded-lg shimmer-light dark:shimmer-dark animate-shimmer w-full mt-4" />
      </div>
      <div className="mt-6 flex items-center justify-center gap-2 text-sm text-secondary-light dark:text-secondary-dark">
        <span>Running ML model + SHAP analysis</span>
        <span className="w-1.5 h-1.5 rounded-full bg-cobalt animate-pulseDot" />
      </div>
    </div>
  );
}
