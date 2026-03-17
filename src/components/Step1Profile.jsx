import { useState } from 'react'

const COMMUNICATION_STYLES = [
  { key: 'friendly', icon: '😊' },
  { key: 'professional', icon: '💼' },
  { key: 'inspirational', icon: '✨' },
  { key: 'direct', icon: '🎯' },
  { key: 'humorous', icon: '😄' },
  { key: 'educational', icon: '📚' },
]

export default function Step1Profile({ data, onChange, onNext, t }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!data.name.trim()) newErrors.name = t.required
    if (!data.profession.trim()) newErrors.profession = t.required
    if (!data.targetCustomer.trim()) newErrors.targetCustomer = t.required
    if (data.communicationStyles.length === 0) newErrors.communicationStyles = t.selectAtLeastOne
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

  const toggleStyle = (key) => {
    const current = data.communicationStyles
    const updated = current.includes(key)
      ? current.filter(s => s !== key)
      : [...current, key]
    onChange({ communicationStyles: updated })
    if (errors.communicationStyles && updated.length > 0) {
      setErrors(prev => ({ ...prev, communicationStyles: undefined }))
    }
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
          <h2 className="text-xl font-bold text-slate-900">{t.step1Title}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.step1Subtitle}</p>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="label">
              {t.nameLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder={t.namePlaceholder}
              value={data.name}
              onChange={e => handleChange('name', e.target.value)}
            />
            {errors.name && (
              <p className="error-text">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.name}
              </p>
            )}
          </div>

          {/* Profession */}
          <div>
            <label className="label">
              {t.professionLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.profession ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder={t.professionPlaceholder}
              rows={3}
              value={data.profession}
              onChange={e => handleChange('profession', e.target.value)}
            />
            {errors.profession && (
              <p className="error-text">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.profession}
              </p>
            )}
          </div>

          {/* Target Customer */}
          <div>
            <label className="label">
              {t.targetCustomerLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.targetCustomer ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder={t.targetCustomerPlaceholder}
              rows={3}
              value={data.targetCustomer}
              onChange={e => handleChange('targetCustomer', e.target.value)}
            />
            {errors.targetCustomer && (
              <p className="error-text">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.targetCustomer}
              </p>
            )}
          </div>

          {/* Communication Style */}
          <div>
            <label className="label">
              {t.communicationStyleLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <p className="text-xs text-slate-500 mb-3">{t.communicationStyleSubtitle}</p>
            <div className="flex flex-wrap gap-2">
              {COMMUNICATION_STYLES.map(style => {
                const isActive = data.communicationStyles.includes(style.key)
                const label = t[`style${style.key.charAt(0).toUpperCase() + style.key.slice(1)}`]
                return (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => toggleStyle(style.key)}
                    className={`chip ${isActive ? 'chip-active' : 'chip-inactive'}`}
                  >
                    <span>{style.icon}</span>
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
            {errors.communicationStyles && (
              <p className="error-text mt-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.communicationStyles}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex justify-end">
          <button onClick={handleNext} className="btn-primary">
            {t.next}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
