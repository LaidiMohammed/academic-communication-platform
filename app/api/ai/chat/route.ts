import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, validateContentType, validateBodySize } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Modèles essayés dans l'ordre : si le premier est retiré/saturé, on bascule.
const MODELS = [
  process.env.GROQ_MODEL,
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'llama-3.3-70b-versatile',
  'openai/gpt-oss-120b',
].filter((m): m is string => Boolean(m));

export async function POST(req: NextRequest) {
  try {
    // Lu à chaque requête (et non au chargement du module) pour refléter
    // immédiatement une mise à jour de la variable d'environnement.
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const ctCheck = validateContentType(req);
    if (ctCheck) return ctCheck;
    const sizeCheck = validateBodySize(req);
    if (sizeCheck) return sizeCheck;

    const auth = await getAuthUser(req);
    if (auth.error) return auth.error;

    const { allowed } = await rateLimit(auth.user.id, 10, 60000, auth.supabase);
    if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    // Les modèles sans vision reçoivent uniquement le texte.
    const toGroqMessages = (withVision: boolean) => messages.map((msg: any) => {
      const images: string[] = Array.isArray(msg.images) ? msg.images : [];
      if (withVision && images.length > 0) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.text || 'Analyze this image' },
            ...images.map((url) => ({ type: 'image_url', image_url: { url } })),
          ],
        };
      }
      return { role: msg.role, content: msg.text || '' };
    });

    let reply = '';
    let lastError = '';

    for (const model of MODELS) {
      const withVision = model.includes('llama-4') || model.includes('vision');
      try {
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: toGroqMessages(withVision),
            temperature: 0.7,
            max_tokens: 4096,
          }),
          signal: AbortSignal.timeout(30000),
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.choices?.[0]?.message?.content || '';
          if (reply) break;
        }

        const detail = (await response.text()).slice(0, 300);
        lastError = `${model} → ${response.status}: ${detail}`;
        // Clé invalide : inutile d'essayer les autres modèles.
        if (response.status === 401 || response.status === 403) break;
      } catch (err) {
        lastError = `${model} → ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    if (!reply) {
      return NextResponse.json(
        { error: 'Groq indisponible', details: lastError },
        { status: 502 },
      );
    }

    if (conversationId) {
      const lastMsg = messages[messages.length - 1];
      const userImages = Array.isArray(lastMsg?.images) ? lastMsg.images : [];
      const imagesJson = userImages.length > 0 ? JSON.stringify(userImages) : '[]';

      await auth.supabase.from('ai_messages').insert([
        { conversation_id: conversationId, role: 'user', text: lastMsg?.text || '', images: imagesJson },
        { conversation_id: conversationId, role: 'assistant', text: reply, images: '[]' },
      ]);

      const titleText = lastMsg?.text || '';
      const shortTitle = titleText.length > 60 ? titleText.slice(0, 60) + '...' : titleText || 'New Chat';
      await auth.supabase.from('ai_conversations')
        .update({ title: shortTitle, updated_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
