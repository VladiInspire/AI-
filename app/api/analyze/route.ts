import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

export interface CriterionResult {
  present: boolean
  note: string
}

export interface AnalysisResult {
  role: CriterionResult
  kontext: CriterionResult
  cil: CriterionResult
  pro_koho: CriterionResult
  styl: CriterionResult
  co_nechci: CriterionResult
  improved_prompt: string | null
}

const SYSTEM_PROMPT = `Jsi expert na tvorbu a hodnocení AI promptů. Analyzuješ prompt uživatele a hodnotíš ho podle 6 kritérií.

Kritéria:
1. **Role** – Je v promptu definována role nebo persona, kterou má AI zaujmout? (např. "Jsi zkušený copywriter", "Chovej se jako datový analytik")
2. **Kontext** – Obsahuje prompt dostatečný kontext nebo pozadí situace? (např. popis projektu, cílový trh, relevantní informace)
3. **Cíl** – Je jasně specifikováno, co má AI vytvořit nebo udělat? (konkrétní výstup nebo akce)
4. **Pro koho** – Je definována cílová skupina nebo příjemce výstupu? (např. "pro marketing manažery", "pro začátečníky", "pro technické ředitele")
5. **Styl** – Je specifikován styl, tón nebo formát odpovědi? (např. "formálně", "přátelsky", "jako bullet pointy", "stručně")
6. **Co nechci** – Obsahuje prompt výslovné omezení nebo co se má vyhnout? (např. "bez žargonu", "nekratší než 500 slov", "nevyužívej příklady z USA")

Vrať POUZE validní JSON objekt (bez markdown bloků, bez dalšího textu) v tomto formátu:
{
  "role": { "present": true/false, "note": "krátké vysvětlení česky" },
  "kontext": { "present": true/false, "note": "krátké vysvětlení česky" },
  "cil": { "present": true/false, "note": "krátké vysvětlení česky" },
  "pro_koho": { "present": true/false, "note": "krátké vysvětlení česky" },
  "styl": { "present": true/false, "note": "krátké vysvětlení česky" },
  "co_nechci": { "present": true/false, "note": "krátké vysvětlení česky" },
  "improved_prompt": "vylepšený prompt v češtině nebo angličtině (podle jazyka originálu) pokud nějaké kritérium chybí, jinak null"
}

Pravidla pro improved_prompt:
- Pokud jsou všechna kritéria splněna, nastav improved_prompt na null
- Pokud chybí alespoň jedno kritérium, vytvoř vylepšenou verzi promptu, která přirozeně doplní chybějící prvky
- Zachovej původní záměr a jazyk promptu
- Vylepšený prompt musí být přirozeně formulovaný, ne jen seznam kritérií`

export async function POST(req: NextRequest) {
  try {
    const { apiKey, prompt } = await req.json()

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({ error: 'API klíč je povinný.' }, { status: 400 })
    }
    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt je povinný.' }, { status: 400 })
    }

    const client = new Anthropic({ apiKey: apiKey.trim() })

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyzuj tento prompt:\n\n${prompt}`,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : ''

    let result: AnalysisResult
    try {
      result = JSON.parse(rawText) as AnalysisResult
    } catch {
      // Try to extract JSON from text if wrapped in markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return NextResponse.json({ error: 'Nepodařilo se zpracovat odpověď od API.' }, { status: 500 })
      }
      result = JSON.parse(jsonMatch[0]) as AnalysisResult
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Neznámá chyba'
    if (message.includes('401') || message.includes('invalid_api_key') || message.includes('authentication')) {
      return NextResponse.json({ error: 'Neplatný API klíč. Zkontroluj ho a zkus znovu.' }, { status: 401 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
