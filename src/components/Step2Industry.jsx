import { useState } from 'react'

export default function Step2Industry({ data, onChange, onNext, onBack, t, language }) {
  const [errors, setErrors] = useState({})

  const validate = () => {
    const newErrors = {}
    if (!data.keywords.trim()) newErrors.keywords = t.required
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
          <h2 className="text-xl font-bold text-slate-900">{t.step2Title}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.step2Subtitle}</p>
        </div>

        <div className="space-y-5">
          {/* Keywords */}
          <div>
            <label className="label">
              {t.keywordsLabel}
              <span className="text-red-400 ml-1">*</span>
            </label>
            <textarea
              className={`form-textarea ${errors.keywords ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
              placeholder={t.keywordsPlaceholder}
              rows={4}
              value={data.keywords}
              onChange={e => handleChange('keywords', e.target.value)}
            />
            {errors.keywords && (
              <p className="error-text">
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.keywords}
              </p>
            )}
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {language === 'cs'
                ? 'AI použije tato klíčová slova pro hledání aktuálních trendů'
                : 'AI will use these keywords to search for current trends'}
            </p>
          </div>

          {/* Don't Do */}
          <div>
            <label className="label">
              {t.dontDoLabel}
            </label>
            <textarea
              className="form-textarea"
              placeholder={t.dontDoPlaceholder}
              rows={3}
              value={data.dontDo}
              onChange={e => onChange({ dontDo: e.target.value })}
            />
          </div>

          {/* Tip box */}
          <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary-800 mb-0.5">
                  {language === 'cs' ? 'Tip pro lepší výsledky' : 'Tip for better results'}
                </p>
                <p className="text-xs text-primary-700">
                  {language === 'cs'
                    ? 'Čím konkrétnější klíčová slova zadáte, tím relevantnější trendy AI najde a tím lépe bude příspěvek cílit na vaši oblast.'
                    : 'The more specific keywords you enter, the more relevant trends AI will find and the better the post will target your field.'}
                </p>
              </div>
            </div>
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
