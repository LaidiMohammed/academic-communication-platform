import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { canAccessChat } from '@/lib/chat-access';
import { validateContentType, validateBodySize, getAuthUser } from '@/lib/api-utils';
import { rateLimit } from '@/lib/rate-limit';

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const AUDIO_TYPES = new Set([
  'audio/aac', 'audio/mp4', 'audio/mpeg', 'audio/ogg', 'audio/webm', 'audio/x-m4a',
]);
const BLOCKED_FILE_TYPES = new Set([
  'application/javascript', 'image/svg+xml', 'text/html', 'text/javascript',
]);

function getExtension(fileName: string, mimeType: string) {
  const originalExtension = fileName.split('.').pop()?.toLowerCase();
  if (originalExtension?.match(/^[a-z0-9]{1,8}$/)) return originalExtension;

  const mimeExtensions: Record<string, string> = {
    'audio/aac': 'aac', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg', 'audio/webm': 'webm', 'audio/x-m4a': 'm4a',
    'image/gif': 'gif', 'image/heic': 'heic', 'image/heif': 'heif',
    'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  };
  return mimeExtensions[mimeType] || 'bin';
}

export async function POST(req: NextRequest) {
  const ctCheck = validateContentType(req);
  if (ctCheck) return ctCheck;
  const sizeCheck = validateBodySize(req, MAX_UPLOAD_BYTES);
  if (sizeCheck) return sizeCheck;

  const auth = await getAuthUser(req);
  if (auth.error) return auth.error;

  const { allowed } = await rateLimit(auth.user.id, 20, 60000, auth.supabase);
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

  const body: unknown = await req.json();
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const values = body as Record<string, unknown>;
  const chatId = typeof values.chatId === 'string' ? values.chatId : '';
  const kind = typeof values.kind === 'string' ? values.kind : '';
  const fileName = typeof values.fileName === 'string' ? values.fileName : '';
  const mimeType = typeof values.contentType === 'string'
    ? values.contentType.split(';')[0].toLowerCase()
    : '';
  const fileSize = typeof values.fileSize === 'number' ? values.fileSize : 0;

  if (!chatId || !fileName) {
    return NextResponse.json({ error: 'chatId and fileName are required' }, { status: 400 });
  }
  if (kind !== 'voice' && kind !== 'image' && kind !== 'file') {
    return NextResponse.json({ error: 'Invalid upload kind' }, { status: 400 });
  }
  if (!(await canAccessChat(auth.supabase, auth.user.id, chatId))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!fileSize || fileSize > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'File must be between 1 byte and 25 MB' }, { status: 400 });
  }
  if (kind === 'voice' && !AUDIO_TYPES.has(mimeType)) {
    return NextResponse.json({ error: 'Unsupported voice recording format' }, { status: 400 });
  }
  if (kind === 'image' && (!mimeType.startsWith('image/') || BLOCKED_FILE_TYPES.has(mimeType))) {
    return NextResponse.json({ error: 'Unsupported image format' }, { status: 400 });
  }
  if (BLOCKED_FILE_TYPES.has(mimeType)) {
    return NextResponse.json({ error: 'Unsupported file format' }, { status: 400 });
  }

  // Validate file extension against declared MIME type to prevent MIME mismatch attacks
  const ext = getExtension(fileName, mimeType);
  const extMimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
    webp: 'image/webp', heic: 'image/heic', heif: 'image/heif',
    mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav',
    m4a: 'audio/x-m4a', aac: 'audio/aac', webm: 'audio/webm',
    pdf: 'application/pdf', doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    txt: 'text/plain', csv: 'text/csv',
  };
  const expectedMime = extMimeMap[ext];
  if (expectedMime && expectedMime !== mimeType && kind !== 'file') {
    return NextResponse.json({ error: 'File extension does not match content type' }, { status: 400 });
  }

  const path = `${chatId}/${auth.user.id}/${randomUUID()}.${ext}`;
  const { data, error: uploadError } = await auth.supabase.storage
    .from('chat-files')
    .createSignedUploadUrl(path);

  if (uploadError || !data) {
    return NextResponse.json({ error: uploadError?.message || 'Could not prepare upload' }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
