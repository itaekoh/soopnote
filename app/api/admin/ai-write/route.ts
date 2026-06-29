import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// Anthropic SDK + 긴 생성 시간을 고려해 Node 런타임 + 넉넉한 타임아웃
export const runtime = 'nodejs';
export const maxDuration = 60;

type LengthOption = 'short' | 'medium' | 'long';

interface AiWritePayload {
  categorySlug: string;
  subject: string;
  fieldNotes: string;
  keywords?: string[];
  length?: LengthOption;
  tone?: string;
}

const LENGTH_GUIDE: Record<LengthOption, string> = {
  short: '약 600자 내외, 3~4개 문단',
  medium: '약 1,200자 내외, 5~7개 문단',
  long: '약 2,000자 내외, 8개 이상 문단',
};

const CATEGORY_GUIDE: Record<string, string> = {
  wildflower:
    '식물 관찰 일지. 야생화·들풀을 현장에서 만난 경험. 식물의 생김새, 자생 환경, 계절감, 관찰자의 감상을 섬세하게 담는다.',
  'tree-diagnose':
    '나무진단 현장 기록. 수목의 병해충·생리장해 진단 경험. 증상 관찰 → 원인 추정 → 진단 소견의 흐름을 자연스럽게 녹이되, 전문 용어는 풀어서 설명한다.',
  logs:
    '아카이브 에세이. 나무의사로서의 생각, 현장에서 얻은 통찰, 자연과 사람에 대한 사유를 담담하게 풀어낸다.',
};

const SYSTEM_PROMPT = `당신은 'Julia'라는 필명으로 글을 쓰는 나무의사 오이택입니다. 수피파이(soopnote.com)에 나무진단·수목 현장·식물 관찰 경험을 에세이 형식의 블로그 글로 기록합니다.

[글의 성격]
- 현장 경험에서 우러나온 진솔한 에세이. 정보 전달과 개인적 감상이 자연스럽게 어우러진다.
- 과장이나 미사여구의 남발 없이, 담백하고 단정한 문장. 그러나 따뜻한 시선이 배어 있다.
- 사실(관찰 내용)에 충실하되, 그 사실을 매끄러운 이야기로 엮는다. 입력에 없는 사실(수치, 지명, 학명 등)을 지어내지 않는다.
- 독자에게 가르치려 들지 않고, 함께 바라보는 듯한 어조.

[출력 형식 — 매우 중요]
- contentHtml은 TinyMCE 에디터에 그대로 붙여넣을 수 있는 HTML 본문이어야 한다.
- <html>, <head>, <body> 태그는 절대 포함하지 않는다. 본문 요소만 출력한다.
- 사용 가능한 태그: <p>, <h2>, <h3>, <blockquote>, <ul>, <li>, <strong>, <em>. 그 외 태그·인라인 style·class 속성은 사용하지 않는다.
- 소제목이 필요하면 <h2>를 사용한다. 글 맨 앞에 제목(<h1> 또는 제목 문단)은 넣지 않는다 (제목은 title 필드로 별도 제공).
- 각 문단은 <p>로 감싼다.

[작성 지침]
- title: 글의 분위기를 담은 간결한 제목. 진부한 표현 지양.
- excerpt: 글을 한두 문장으로 요약한 도입 문구 (목록 카드에 노출됨).
- readTime: "5분"처럼 분 단위 읽기 시간.`;

const OUTPUT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    title: { type: 'string', description: '글 제목' },
    excerpt: { type: 'string', description: '한두 문장 요약 도입 문구' },
    contentHtml: { type: 'string', description: 'TinyMCE용 HTML 본문 (body 요소만)' },
    readTime: { type: 'string', description: '읽기 시간, 예: "5분"' },
  },
  required: ['title', 'excerpt', 'contentHtml', 'readTime'],
  additionalProperties: false,
};

function jsonError(message: string, status: number) {
  return new NextResponse(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  try {
    // ── 1. 인증 (upload API와 동일 패턴) ──────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonError('Unauthorized: No token provided', 401);
    }
    const token = authHeader.split(' ')[1];

    const supabaseAuth = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user }, error: userError } = await supabaseAuth.auth.getUser(token);
    if (userError || !user) {
      return jsonError('Unauthorized: Invalid token', 401);
    }

    // ── 2. 권한 확인 (super_admin / writer) ───────────────
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: profile } = await supabaseAdmin
      .from('sn_users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || !['super_admin', 'writer'].includes(profile.role)) {
      return jsonError('Forbidden: Admin only', 403);
    }

    // ── 3. 입력 검증 ──────────────────────────────────────
    const body = (await req.json()) as AiWritePayload;
    const subject = body.subject?.trim();
    const fieldNotes = body.fieldNotes?.trim();
    if (!subject || !fieldNotes) {
      return jsonError('주제와 현장 메모는 필수입니다.', 400);
    }
    const length: LengthOption = body.length ?? 'medium';
    const tone = body.tone?.trim() || '따뜻한 에세이';
    const keywords = (body.keywords ?? []).filter(Boolean);
    const categoryGuide =
      CATEGORY_GUIDE[body.categorySlug] || '자연과 나무에 대한 에세이.';

    if (!process.env.ANTHROPIC_API_KEY) {
      return jsonError('서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다.', 500);
    }

    // ── 4. Claude로 초안 생성 ─────────────────────────────
    const anthropic = new Anthropic();

    const userPrompt = [
      `[카테고리] ${categoryGuide}`,
      `[주제·소재] ${subject}`,
      `[톤·문체] ${tone}`,
      `[분량] ${LENGTH_GUIDE[length]}`,
      keywords.length > 0 ? `[강조 키워드] ${keywords.join(', ')}` : '',
      '',
      '[현장 메모·관찰 내용]',
      fieldNotes,
      '',
      '위 메모를 바탕으로, 지침에 맞는 블로그 글 초안을 작성해 주세요. 메모에 없는 구체적 사실은 지어내지 말고, 주어진 내용을 자연스러운 이야기로 엮어 주세요.',
    ]
      .filter(Boolean)
      .join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    if (message.stop_reason === 'refusal') {
      return jsonError('AI가 이 요청에 대한 작성을 거절했습니다. 내용을 조정해 다시 시도해 주세요.', 422);
    }

    const textBlock = message.content.find((b: any) => b.type === 'text') as
      | { type: 'text'; text: string }
      | undefined;
    if (!textBlock?.text) {
      return jsonError('AI 응답이 비어 있습니다. 다시 시도해 주세요.', 502);
    }

    let result: { title: string; excerpt: string; contentHtml: string; readTime: string };
    try {
      result = JSON.parse(textBlock.text);
    } catch {
      return jsonError('AI 응답을 해석하지 못했습니다. 다시 시도해 주세요.', 502);
    }

    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('AI 글쓰기 생성 실패:', error);
    return jsonError(error.message || 'AI 초안 생성에 실패했습니다.', 500);
  }
}
