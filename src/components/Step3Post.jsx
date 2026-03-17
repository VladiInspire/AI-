import { useState } from 'react'

const NETWORKS = [
  {
    key: 'LinkedIn',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    color: 'text-blue-700',
    bgActive: 'bg-blue-50',
    borderActive: 'border-blue-600',
  },
  {
    key: 'Facebook',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    color: 'text-blue-600',
    bgActive: 'bg-blue-50',
    borderActive: 'border-blue-500',
  },
  {
    key: 'Instagram',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
    color: 'text-pink-600',
    bgActive: 'bg-pink-50',
    borderActive: 'border-pink-500',
  },
  {
    key: 'Newsletter',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'text-purple-600',
    bgActive: 'bg-purple-50',
    borderActive: 'border-purple-500',
  },
]

export default function Step3Post({ data, onChange, onNext, onBack, t }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!data.network) newErrors.network = t.selectNetwork
    if (!data.topic.trim()) newErrors.topic = t.required
    if (!data.goal.trim()) newErrors.goal = t.required
    return newErrors
  }

  const handleNext = () => {
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onNext()
  }

  const handleChange = (field, value) => {
    onChange({ [field]: value })
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="animate-slide-up">
      <div className="card p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{t.step3Title}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.step3Subtitle}</p>
        </div>

        <div className="space-y-6">
          {/* Network selection */}
          <div>
            <label className="label">
              {t.networkLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {NETWORKS.map(network => {
                const isActive = data.network === network.key
                return (
                  <button
                    key={network.key}
                    type="button"
                    onClick={() => handleChange('network', network.key)}
                    className={`network-card ${
                      isActive
                        ? `${network.bgActive} ${network.borderActive} border-2`
                        : 'network-card-inactive'
                    }`}
                  >
                    <div className={isActive ? network.color : 'text-slate-400'}>
                      {network.icon}
                    </div>
                    <span className={`text-xs font-semibold ${isActive ? network.color : 'text-slate-500'}`}>
                      {network.key}
                    </span>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            {errors.network && (
              <p className="error-text mt-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.network}
              </p>
            )}
          </div>

          {/* Topic */}
          <div>
            <label className="label">
              {t.topicLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.topic ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder={t.topicPlaceholder}
              rows={3}
              value={data.topic}
              onChange={e => handleChange('topic', e.target.value)}
            />
            {errors.topic && (
              <p className="error-text">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.topic}
              </p>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="label">
              {t.goalLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.goal ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder={t.goalPlaceholder}
              value={data.goal}
              onChange={e => handleChange('goal', e.target.value)}
            />
            {errors.goal && (
              <p className="error-text">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.goal}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between gap-3">
          <button onClick={onBack} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            {t.back}
          </button>
          <button onClick={handleNext} className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t.generate}
          </button>
        </div>
      </div>
    </div>
  )
}
