import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `Jsi Analise — přátelská a inspirativní AI asistentka. Pomáháš s tvorbou obsahu, copywritingem a nápady pro sociální sítě. Komunikuješ přirozeně a lidsky, v češtině. Jsi vstřícná, kreativní a motivující.`;

export async function POST(req) {
  const { message, history } = await req.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY není nastaven' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const client = new Anthropic({ apiKey });

  const messages = [
    ...history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .filter((m) => m.content)
      .map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const stream = client.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        });

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            );
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: err.message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
