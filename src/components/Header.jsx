export default function Header({ language, setLanguage, t }) {
  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {t.appTitle}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">{t.poweredBy}</p>
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setLanguage('cs')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              language === 'cs'
                ? 'bg-white text-primary-700 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🇨🇿 CS
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              language === 'en'
                ? 'bg-white text-primary-700 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🇬🇧 EN
          </button>
        </div>
      </div>
    </header>
  )
}
