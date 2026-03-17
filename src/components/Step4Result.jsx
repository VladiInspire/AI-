import { useState, useEffect, useRef } from 'react'

const NETWORK_COLORS = {
  LinkedIn: 'bg-blue-50 border-blue-200 text-blue-700',
  Facebook: 'bg-blue-50 border-blue-200 text-blue-600',
  Instagram: 'bg-pink-50 border-pink-200 text-pink-600',
  Newsletter: 'bg-purple-50 border-purple-200 text-purple-600',
}

export default function Step4Result({ formData, language, onBack, onStartOver, t }) {
  const [status, setStatus] = useState('idle') // idle | searching | generating | done | error
  const [searchMessage, setSearchMessage] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const abortRef = useRef(null)
  const hasStartedRef = useRef(false)

  const generate = async () => {
    // Abort any previous request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('searching')
    setGeneratedText('')
    setErrorMsg('')
    setSearchMessage(language === 'cs' ? '🔍 Hledám trendy v oboru...' : '🔍 Searching for trends...')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          language
        }),
        signal: controller.signal
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Unknown error')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (!data.trim()) continue

          try {
            const event = JSON.parse(data)

            if (event.type === 'searching') {
              setStatus('searching')
              setSearchMessage(event.message)
            } else if (event.type === 'text_start') {
              setStatus('generating')
            } else if (event.type === 'delta') {
              setGeneratedText(prev => prev + event.text)
            } else if (event.type === 'done') {
              setStatus('done')
            } else if (event.type === 'error') {
              throw new Error(event.error)
            }
          } catch (parseError) {
            // Ignore JSON parse errors for partial chunks
          }
        }
      }

      setStatus('done')
    } catch (err) {
      if (err.name === 'AbortError') return
      console.error('Generation error:', err)
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  useEffect(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      generate()
    }
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = generatedText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  const handleTryAgain = () => {
    hasStartedRef.current = false
    generate()
  }

  const networkBadgeClass = NETWORK_COLORS[formData.network] || 'bg-slate-50 border-slate-200 text-slate-600'

  return (
    <div className="animate-slide-up space-y-4">
      {/* Status: Searching / Generating */}
      {(status === 'searching' || status === 'generating') && (
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col items-center text-center py-4">
            {/* Animated spinner */}
            <div className="relative w-16 h-16 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                {status === 'searching' ? (
                  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {status === 'searching' ? (language === 'cs' ? 'Hledám aktuální trendy' : 'Searching current trends') : t.generatingTitle}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs">
              {status === 'searching' ? searchMessage : t.generatingSubtitle}
            </p>

            {/* Steps indicator */}
            <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
              <div className={`flex items-center gap-1.5 ${status !== 'idle' ? 'text-primary-600 font-medium' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${status !== 'idle' ? 'bg-primary-500' : 'bg-slate-300'}`} />
                {language === 'cs' ? 'Trendy v oboru' : 'Industry trends'}
              </div>
              <div className="w-6 h-px bg-slate-200" />
              <div className={`flex items-center gap-1.5 ${status === 'generating' ? 'text-primary-600 font-medium' : ''}`}>
                <div className={`w-2 h-2 rounded-full ${status === 'generating' ? 'bg-primary-500' : 'bg-slate-300'}`} />
                {language === 'cs' ? 'Psaní příspěvku' : 'Writing post'}
              </div>
            </div>
          </div>

          {/* Live preview of generating text */}
          {status === 'generating' && generatedText && (
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-sm text-slate-600 post-content cursor-blink">{generatedText}</p>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {(status === 'done' || (status === 'generating' && generatedText)) && status !== 'searching' && (
        <div className={`card p-6 sm:p-8 ${status === 'done' ? 'animate-slide-up' : ''}`}>
          {status === 'done' && (
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t.step4Title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{t.step4Subtitle}</p>
              </div>
              <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${networkBadgeClass}`}>
                {formData.network}
              </span>
            </div>
          )}

          {/* Post content */}
          {status === 'done' && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <p className="text-sm text-slate-800 post-content leading-relaxed">
                {generatedText}
              </p>
            </div>
          )}

          {/* Actions */}
          {status === 'done' && (
            <div className="mt-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`btn-primary flex-1 sm:flex-none justify-center ${copied ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t.copied}
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {t.copyPost}
                  </>
                )}
              </button>

              {/* Try Again */}
              <button onClick={handleTryAgain} className="btn-outline justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.tryAgain}
              </button>

              {/* Start Over */}
              <button onClick={onStartOver} className="btn-secondary justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t.startOver}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{t.errorTitle}</h3>
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 max-w-md">
              {errorMsg}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button onClick={handleTryAgain} className="btn-primary justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.tryAgain}
              </button>
              <button onClick={onBack} className="btn-secondary justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                {t.back}
              </button>
              <button onClick={onStartOver} className="btn-secondary justify-center">
                {t.startOver}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
