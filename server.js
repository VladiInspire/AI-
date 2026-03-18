const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Check if API key is configured server-side
app.get('/api/status', (req, res) => {
  res.json({ hasApiKey: !!process.env.ANTHROPIC_API_KEY });
});

app.post('/api/generate', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY || req.body.apiKey;

  if (!apiKey) {
    return res.status(400).json({ error: 'API klíč není nastaven / API key not set' });
  }

  const { data, language } = req.body;
  const client = new Anthropic({ apiKey });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const prompt = buildPrompt(data, language);

  try {
    let messages = [{ role: 'user', content: prompt }];
    let maxContinuations = 5;
    let continuationCount = 0;

    while (continuationCount < maxContinuations) {
      const stream = client.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        tools: [{ type: 'web_search_20260209', name: 'web_search', allowed_callers: ['direct'] }],
        messages,
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
        }
        // Notify frontend that web search is happening
        if (
          event.type === 'content_block_start' &&
          event.content_block?.type === 'tool_use' &&
          event.content_block?.name === 'web_search'
        ) {
          res.write(`data: ${JSON.stringify({ searching: true })}\n\n`);
        }
      }

      const finalMsg = await stream.finalMessage();

      if (finalMsg.stop_reason === 'end_turn') {
        break;
      } else if (finalMsg.stop_reason === 'pause_turn') {
        messages = [
          { role: 'user', content: prompt },
          { role: 'assistant', content: finalMsg.content },
        ];
        continuationCount++;
      } else {
        break;
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

function buildPrompt(data, language) {
  const styles = data.styles.join(', ');

  if (language === 'cs') {
    return `Jsi odborný copywriter specializující se na sociální sítě.

PROFIL AUTORKY:
- Jméno: ${data.name}
- Čím se zabývá: ${data.role}
- Cílová zákaznice: ${data.customer}
- Styl komunikace: ${styles}

OBOR A KONKURENCE:
- Klíčová slova / obor / konkurence: ${data.keywords}
- Co nechce dělat / čeho se vyvarovat: ${data.avoid || 'není specifikováno'}

ZADÁNÍ PŘÍSPĚVKU:
- Platforma: ${data.network}
- Téma příspěvku: ${data.topic}
- Cíl příspěvku: ${data.goal}

POSTUP:
1. Nejprve použij web_search pro zjištění aktuálních trendů a nejlepších praktik pro "${data.keywords}" na platformě ${data.network} v roce 2025.
2. Na základě zjištěných trendů vytvoř originální a poutavý příspěvek v češtině, který:
   - Plně odpovídá stylu komunikace: ${styles}
   - Dosahuje cíle: ${data.goal}
   - Je optimalizován pro platformu ${data.network} (správná délka, formát, případné hashtags nebo emoji)
   - Vychází z profilu autorky a její cílové skupiny
   - NEZAHRNUJE: ${data.avoid || 'nic specifikovaného'}
   - Reflektuje aktuální trendy v oboru

Výstup: Piš POUZE finální text příspěvku, bez jakýchkoli vysvětlení, bez úvodu, bez komentáře. Pouze samotný příspěvek připravený ke kopírování a publikaci.`;
  } else {
    return `You are an expert social media copywriter.

AUTHOR PROFILE:
- Name: ${data.name}
- What they do: ${data.role}
- Target customer: ${data.customer}
- Communication style: ${styles}

INDUSTRY & COMPETITION:
- Keywords / industry / competition: ${data.keywords}
- What to avoid: ${data.avoid || 'not specified'}

POST BRIEF:
- Platform: ${data.network}
- Topic: ${data.topic}
- Goal: ${data.goal}

PROCESS:
1. First, use web_search to find current trends and best practices for "${data.keywords}" on ${data.network} in 2025.
2. Based on the trends found, create an original, engaging post in English that:
   - Fully matches the communication style: ${styles}
   - Achieves the goal: ${data.goal}
   - Is optimized for ${data.network} (correct length, format, hashtags or emoji if appropriate)
   - Reflects the author's profile and target audience
   - AVOIDS: ${data.avoid || 'nothing specified'}
   - Incorporates current industry trends

Output: Write ONLY the final post text, without any explanations, introductions, or comments. Just the post itself, ready to copy and publish.`;
  }
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════╗');
    console.log('║   Social Post Generator — AI powered       ║');
    console.log('╚════════════════════════════════════════════╝');
    console.log(`\n🌐  Otevři: http://localhost:${PORT}`);
    if (!process.env.ANTHROPIC_API_KEY) {
      console.log('\n⚠️  ANTHROPIC_API_KEY není nastaven.');
      console.log('   Zadej API klíč přímo v aplikaci nebo nastav proměnnou prostředí:');
      console.log('   set ANTHROPIC_API_KEY=your-key-here  (Windows cmd)');
      console.log('   $env:ANTHROPIC_API_KEY="your-key"    (PowerShell)');
    } else {
      console.log('\n✅  API klíč načten z prostředí.');
    }
    console.log('');
  });
}

module.exports = app;
