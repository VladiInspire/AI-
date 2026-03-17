export default function StepIndicator({ currentStep, t }) {
  const steps = [
    { num: 1, label: t.step1Label },
    { num: 2, label: t.step2Label },
    { num: 3, label: t.step3Label },
    { num: 4, label: t.step4Label },
  ]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Mobile: step counter */}
      <div className="flex items-center justify-between mb-4 sm:hidden">
        <span className="text-sm font-semibold text-slate-700">
          {t.stepOf} {currentStep} {t.stepOfOf} 4
        </span>
        <span className="text-sm font-semibold text-primary-600">
          {steps[currentStep - 1].label}
        </span>
      </div>

      {/* Desktop: full step indicator */}
      <div className="hidden sm:flex items-center">
        {steps.map((step, idx) => (
          <div key={step.num} className="flex items-center flex-1 last:flex-none">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step.num < currentStep
                    ? 'bg-primary-600 text-white'
                    : step.num === currentStep
                    ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.num < currentStep ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                  step.num <= currentStep ? 'text-primary-600' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {idx < steps.length - 1 && (
              <div className="flex-1 mx-3 mb-5">
                <div
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    step.num < currentStep ? 'bg-primary-500' : 'bg-slate-200'
                  }`}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar - mobile */}
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden sm:hidden">
        <div
          className="h-full bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />
      </div>
    </div>
  )
}
