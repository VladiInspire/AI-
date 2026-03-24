'use client'

import { useState, useEffect, useCallback } from 'react'
import type { AnalysisResult, CriterionResult } from './api/analyze/route'

const CRITERIA: { key: keyof Omit<AnalysisResult, 'improved_prompt'>; label: string; description: string }[] = [
  { key: 'role', label: 'Role', description: 'Jakou roli má AI zaujmout?' },
  { key: 'kontext', label: 'Kontext', description: 'Jaké je pozadí nebo situace?' },
  { key: 'cil', label: 'Cíl', description: 'Co konkrétně má AI vytvořit?' },
  { key: 'pro_koho', label: 'Pro koho', description: 'Kdo je cílová skupina?' },
  { key: 'styl', label: 'Styl', description: 'Jaký tón, formát nebo styl?' },
  { key: 'co_nechci', label: 'Co nechci', description: 'Čeho se má AI vyvarovat?' },
]

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path d="M5.5 10.5L8.5 13.5L14.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CrossIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="10" r="10" fill="#ef4444" />
      <path d="M7 7L13 13M13 7L7 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CriterionRow({ criterion, result }: { criterion: typeof CRITERIA[0]; result: CriterionResult }) {
  return (
    <div className={`criterion-row ${result.present ? 'criterion-ok' : 'criterion-fail'}`}>
      <div className="criterion-header">
        <span className="criterion-icon">
          {result.present ? <CheckIcon /> : <CrossIcon />}
        </span>
        <span className="criterion-label">{criterion.label}</span>
        <span className="criterion-desc">{criterion.description}</span>
      </div>
      <p className="criterion-note">{result.note}</p>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button className="copy-btn" onClick={handleCopy}>
      {copied ? '✓ Zkopírováno' : 'Kopírovat'}
    </button>
  )
}

export default function Home() {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('anthropic_api_key')
    if (saved) setApiKey(saved)
  }, [])

  const handleApiKeyChange = (val: string) => {
    setApiKey(val)
    localStorage.setItem('anthropic_api_key', val)
  }

  const handlePromptChange = (val: string) => {
    setPrompt(val)
    setCharCount(val.length)
  }

  const analyze = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Zadej prosím Anthropic API klíč.')
      return
    }
    if (!prompt.trim()) {
      setError('Zadej prosím prompt k analýze.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, prompt }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Chyba při analýze.')
        return
      }

      setResult(data as AnalysisResult)
    } catch {
      setError('Nepodařilo se spojit se serverem. Zkus to znovu.')
    } finally {
      setLoading(false)
    }
  }, [apiKey, prompt])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      analyze()
    }
  }

  const score = result
    ? CRITERIA.filter((c) => (result[c.key] as CriterionResult).present).length
    : 0

  return (
    <main className="main">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="header-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#7c3aed" />
              <path d="M10 18h16M18 10v16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="18" cy="18" r="5" stroke="white" strokeWidth="2" />
            </svg>
          </div>
          <div>
            <h1 className="title">Analyzátor promptů</h1>
            <p className="subtitle">Zjisti, jak dobrý je tvůj AI prompt, a získej vylepšenou verzi</p>
          </div>
        </header>

        {/* API Key card */}
        <div className="card">
          <label className="field-label">
            <span className="label-text">Anthropic API klíč</span>
            <span className="label-hint">Uloží se do prohlížeče</span>
          </label>
          <div className="input-group">
            <input
              type={showKey ? 'text' : 'password'}
              className="input"
              placeholder="sk-ant-..."
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button className="toggle-btn" onClick={() => setShowKey((v) => !v)} title={showKey ? 'Skrýt' : 'Zobrazit'}>
              {showKey ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Prompt card */}
        <div className="card">
          <label className="field-label">
            <span className="label-text">Tvůj prompt</span>
            <span className="label-hint">{charCount} znaků · Ctrl+Enter = Analyzovat</span>
          </label>
          <textarea
            className="textarea"
            placeholder="Napiš nebo vlož prompt, který chceš analyzovat..."
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={6}
          />
          {error && <p className="error-msg">{error}</p>}
          <button className="analyze-btn" onClick={analyze} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" />
                Analyzuji...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                Analyzovat prompt
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="results-section">
            {/* Score */}
            <div className="score-card">
              <div className="score-left">
                <div className={`score-circle ${score === 6 ? 'score-perfect' : score >= 4 ? 'score-good' : 'score-poor'}`}>
                  <span className="score-number">{score}</span>
                  <span className="score-total">/6</span>
                </div>
              </div>
              <div className="score-right">
                <p className="score-label">
                  {score === 6 ? 'Výborný prompt!' : score >= 4 ? 'Dobrý základ' : 'Potřebuje zlepšení'}
                </p>
                <p className="score-desc">
                  {score === 6
                    ? 'Tvůj prompt splňuje všechna kritéria.'
                    : `Chybí ${6 - score} kritéri${6 - score === 1 ? 'um' : 'a'}. Níže najdeš vylepšenou verzi.`}
                </p>
                <div className="score-bar-track">
                  <div className="score-bar-fill" style={{ width: `${(score / 6) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Criteria checklist */}
            <div className="card">
              <h2 className="section-title">Hodnocení kritérií</h2>
              <div className="criteria-list">
                {CRITERIA.map((criterion) => (
                  <CriterionRow
                    key={criterion.key}
                    criterion={criterion}
                    result={result[criterion.key] as CriterionResult}
                  />
                ))}
              </div>
            </div>

            {/* Improved prompt */}
            {result.improved_prompt && (
              <div className="card improved-card">
                <div className="improved-header">
                  <h2 className="section-title">Vylepšený prompt</h2>
                  <CopyButton text={result.improved_prompt} />
                </div>
                <div className="improved-prompt">
                  <p>{result.improved_prompt}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <footer className="footer">
          <p>Poháněno <strong>Claude claude-sonnet-4-20250514</strong> od Anthropic</p>
        </footer>
      </div>
    </main>
  )
}
