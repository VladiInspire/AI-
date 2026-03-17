import Anthropic from '@anthropic-ai/sdk'

// Vercel serverless function config
export const config = {
  maxDuration: 60,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    name,
    profession,
    targetCustomer,
    communicationStyles,
    keywords,
    dontDo,
    network,
    topic,
    goal,
    language
  } = req.body

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: language === 'cs'
        ? 'Chybí API klíč. Nastavte proměnnou prostředí ANTHROPIC_API_KEY.'
        : 'Missing API key. Set the ANTHROPIC_API_KEY environment variable.'
    })
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const networkGuidelines = {
    LinkedIn: language === 'cs'
      ? 'LinkedIn příspěvek: 150–300 slov, profesionální tón, 3–5 relevantních hashtagů na konci, může obsahovat bullet points, sdílení know-how nebo příběhů z praxe.'
      : 'LinkedIn post: 150–300 words, professional tone, 3–5 relevant hashtags at the end, can include bullet points, sharing expertise or real stories.',
    Facebook: language === 'cs'
      ? 'Facebook příspěvek: 50–150 slov, osobní a přátelský tón, 1–2 hashtagy, poutavý začátek, výzva k akci.'
      : 'Facebook post: 50–150 words, personal and friendly tone, 1–2 hashtags, engaging opening, call to action.',
    Instagram: language === 'cs'
      ? 'Instagram příspěvek: 80–150 slov, vizuální jazyk, emocionální apel, 5–10 hashtagů na konci (odděleny od textu), výzva k interakci (uložit, sdílet, komentovat).'
      : 'Instagram post: 80–150 words, visual language, emotional appeal, 5–10 hashtags at the end (separated from text), call for interaction (save, share, comment).',
    Newsletter: language === 'cs'
      ? 'Newsletter: 200–400 slov, osobní oslovení, strukturovaný obsah s odstavci, hodnotný obsah pro čtenáře, jasná výzva k akci na konci, žádné hashtagy.'
      : 'Newsletter: 200–400 words, personal greeting, structured content with paragraphs, valuable content for readers, clear call to action at the end, no hashtags.'
  }

  const styleNames = {
    cs: { friendly: 'přátelský', professional: 'profesionální', inspirational: 'inspirativní', direct: 'přímý', humorous: 'humorný', educational: 'vzdělávací' },
    en: { friendly: 'friendly', professional: 'professional', inspirational: 'inspirational', direct: 'direct', humorous: 'humorous', educational: 'educational' }
  }

  const langKey = language === 'cs' ? 'cs' : 'en'
  const selectedStyles = communicationStyles.map(s => styleNames[langKey][s] || s).join(', ')

  const prompt = language === 'cs'
    ? `Jsi expert na sociální sítě a copywriting. Tvým úkolem je vytvořit profesionální příspěvek na ${network}.

INFORMACE O AUTOROVI:
- Jméno: ${name}
- Profese / Čím se zabývám: ${profession}
- Cílová zákaznice / zákazník: ${targetCustomer}
- Styl komunikace: ${selectedStyles}

OBOR A ZAMĚŘENÍ:
- Klíčová slova oboru: ${keywords}
${dontDo ? `- Co nechci dělat / témata se chci vyhnout: ${dontDo}` : ''}

ZADÁNÍ PŘÍSPĚVKU:
- Síť: ${network}
- Téma příspěvku: ${topic}
- Cíl příspěvku: ${goal}

POKYNY PRO TVORBU:
1. Nejprve pomocí nástroje web_search zjisti aktuální trendy v oboru "${keywords}" pro rok 2025 – hledej co lidi zajímá, jaká jsou témata, co rezonuje.
2. Na základě zjištěných trendů a výše uvedených informací vytvoř příspěvek.
3. Příspěvek musí respektovat styl komunikace: ${selectedStyles}
4. Formát pro ${network}: ${networkGuidelines[network]}
5. Příspěvek musí být autentický, hodnotný a oslovovat cílovou skupinu: ${targetCustomer}
6. Vrať POUZE hotový příspěvek bez jakéhokoli úvodu, vysvětlení nebo komentáře.`
    : `You are a social media and copywriting expert. Your task is to create a professional ${network} post.

AUTHOR INFORMATION:
- Name: ${name}
- Profession / What I do: ${profession}
- Target customer: ${targetCustomer}
- Communication style: ${selectedStyles}

INDUSTRY & FOCUS:
- Industry keywords: ${keywords}
${dontDo ? `- What I don't want to do / topics to avoid: ${dontDo}` : ''}

POST BRIEF:
- Network: ${network}
- Post topic: ${topic}
- Post goal: ${goal}

CREATION GUIDELINES:
1. First, use the web_search tool to find current trends in "${keywords}" for 2025 – look for what people are interested in, trending topics, what resonates.
2. Based on the discovered trends and the information above, create the post.
3. The post must respect the communication style: ${selectedStyles}
4. Format for ${network}: ${networkGuidelines[network]}
5. The post must be authentic, valuable and address the target audience: ${targetCustomer}
6. Return ONLY the finished post with no introduction, explanation or commentary.`

  try {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      tools: [
        {
          type: 'web_search_20250305',
          name: 'web_search',
          max_uses: 3
        }
      ],
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: { 'anthropic-beta': 'web-search-2025-03-05' }
    })

    let finalText = ''

    for await (const event of stream) {
      if (event.type === 'content_block_start') {
        if (event.content_block.type === 'text') {
          res.write(`data: ${JSON.stringify({ type: 'text_start' })}\n\n`)
        } else if (event.content_block.type === 'tool_use' && event.content_block.name === 'web_search') {
          const msg = language === 'cs' ? '🔍 Prohledávám aktuální trendy v oboru...' : '🔍 Searching for current industry trends...'
          res.write(`data: ${JSON.stringify({ type: 'searching', message: msg })}\n\n`)
        }
      } else if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        finalText += event.delta.text
        res.write(`data: ${JSON.stringify({ type: 'delta', text: event.delta.text })}\n\n`)
      } else if (event.type === 'message_stop') {
        res.write(`data: ${JSON.stringify({ type: 'done', fullText: finalText })}\n\n`)
      }
    }

    res.end()
  } catch (error) {
    console.error('Anthropic API error:', error)
    const errorMsg = language === 'cs'
      ? `Chyba při generování: ${error.message}`
      : `Generation error: ${error.message}`

    if (!res.headersSent) {
      res.status(500).json({ error: errorMsg })
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', error: errorMsg })}\n\n`)
      res.end()
    }
  }
}
