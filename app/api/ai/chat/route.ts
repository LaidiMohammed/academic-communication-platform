import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const db = createServiceClient();

export async function POST(req: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

    const { messages, conversationId, userId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const groqMessages = messages.map((msg: any) => {
      if (msg.images && msg.images.length > 0) {
        return {
          role: msg.role,
          content: [
            { type: 'text', text: msg.text || 'Analyze this image' },
            ...msg.images.map((img: string) => ({
              type: 'image_url',
              image_url: { url: img },
            })),
          ],
        };
      }
      return { role: msg.role, content: msg.text };
    });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json({ error: `Groq API error: ${response.status}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'No response generated.';

    if (conversationId && userId) {
      const lastMsg = messages[messages.length - 1];
      const userImages = lastMsg?.images || [];
      const imagesJson = userImages.length > 0 ? JSON.stringify(userImages) : '[]';

      await db.from('ai_messages').insert([
        { conversation_id: conversationId, role: 'user', text: lastMsg?.text || '', images: imagesJson },
        { conversation_id: conversationId, role: 'assistant', text: reply, images: '[]' },
      ]);

      const titleText = lastMsg?.text || '';
      const shortTitle = titleText.length > 60 ? titleText.slice(0, 60) + '...' : titleText || 'New Chat';
      await db.from('ai_conversations').update({ title: shortTitle, updated_at: new Date().toISOString() }).eq('id', conversationId);
    }

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
