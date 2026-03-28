interface Props { currentStep: number; steps: string[]; onStepClick?: (step: number) => void; }

export default function StepIndicator({ currentStep, steps, onStepClick }: Props) {
  return (
    <div className="flex items-center gap-1 w-full">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === currentStep;
        const isDone = stepNum < currentStep;
        const canClick = isDone && onStepClick;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <button type="button" disabled={!canClick} onClick={() => canClick && onStepClick(stepNum)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all w-full ${isActive ? 'bg-blue-800 text-white shadow-md' : isDone ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer' : 'bg-gray-100 text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : isDone ? 'bg-blue-200 text-blue-700' : 'bg-gray-200 text-gray-400'}`}>
                {isDone ? '\u2713' : stepNum}
              </span>
              <span className="text-xs font-medium truncate hidden sm:block">{label}</span>
            </button>
            {i < steps.length - 1 && <div className={`w-4 h-0.5 mx-1 flex-shrink-0 ${isDone ? 'bg-blue-300' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}
