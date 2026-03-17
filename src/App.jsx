import { useState } from 'react'
import { translations } from './i18n/translations'
import Header from './components/Header'
import StepIndicator from './components/StepIndicator'
import Step1Profile from './components/Step1Profile'
import Step2Industry from './components/Step2Industry'
import Step3Post from './components/Step3Post'
import Step4Result from './components/Step4Result'

const INITIAL_FORM_DATA = {
  // Step 1
  name: '',
  profession: '',
  targetCustomer: '',
  communicationStyles: [],
  // Step 2
  keywords: '',
  dontDo: '',
  // Step 3
  network: '',
  topic: '',
  goal: '',
}

export default function App() {
  const [language, setLanguage] = useState('cs')
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  const t = translations[language]

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartOver = () => {
    setFormData(INITIAL_FORM_DATA)
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <Header language={language} setLanguage={setLanguage} t={t} />

      {/* Main content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pb-12">
        {/* Step indicator */}
        <StepIndicator currentStep={currentStep} t={t} />

        {/* Steps */}
        {currentStep === 1 && (
          <Step1Profile
            data={formData}
            onChange={updateFormData}
            onNext={handleNext}
            t={t}
          />
        )}

        {currentStep === 2 && (
          <Step2Industry
            data={formData}
            onChange={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
            language={language}
          />
        )}

        {currentStep === 3 && (
          <Step3Post
            data={formData}
            onChange={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            t={t}
          />
        )}

        {currentStep === 4 && (
          <Step4Result
            formData={formData}
            language={language}
            onBack={handleBack}
            onStartOver={handleStartOver}
            t={t}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white py-4">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t.footerText}
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t.poweredBy}
          </p>
        </div>
      </footer>
    </div>
  )
}
