import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `당신은 유튜브 숏츠 대본 작가입니다. 나무의사 'Julia'(오이택)의 블로그 글을 받아, 세로 숏츠(약 35~50초)용 대본을 만듭니다. 결과는 영상 툴 'Vrew'에 바로 활용합니다.

[목표]
- 첫 1~2초에 스크롤을 멈추게 하는 훅으로 시작.
- 글 전체를 다 담지 말고, 가장 흥미로운 한 가지 포인트에 집중.
- 핵심을 빠르게 전달하고, 마지막에 블로그로 유도(CTA).

[지침]
- 구어체, 짧고 명료한 문장. 한 문장이 한 컷(약 3~6초)에 들어갈 분량으로.
- 나무의사의 전문성은 살리되, 어려운 용어는 한 마디로 풀어서.
- 블로그 글에 없는 사실은 지어내지 않는다.
- scenes는 4~7컷. 각 컷은 narration(읽어줄 내레이션 1문장)과 visual(그 컷에 어울리는 화면 — 글의 사진 활용이나 촬영/자료 제안)로 구성.
- 마지막 컷의 narration은 블로그 유도 멘트(예: "자세한 이야기는 프로필 링크에서").
- hook: 0~2초용 강력한 도입 한마디(짧게).
- title: 숏츠 제목(후킹, 30자 내외).
- description: 유튜브 설명 2~3문장.
- hashtags: 5~8개 (반드시 "#shorts" 포함, 나무/식물/자연 관련).`;

const OUTPUT_SCHEMA: Record<string, unknown> = {
  type: 'object',
  properties: {
    title: { type: 'string', description: '숏츠 제목(후킹)' },
    hook: { type: 'string', description: '0~2초용 강력한 도입 한마디' },
    scenes: {
      type: 'array',
      description: '컷 단위 대본 (4~7개)',
      items: {
        type: 'object',
        properties: {
          narration: { type: 'string', description: '그 컷의 내레이션 한 문장' },
          visual: { type: 'string', description: '그 컷에 어울리는 화면/비주얼 제안' },
        },
        required: ['narration', 'visual'],
        additionalProperties: false,
      },
    },
    description: { type: 'string', description: '유튜브 업로드 설명 2~3문장' },
    hashtags: { type: 'array', items: { type: 'string' }, description: '해시태그 5~8개(#shorts 포함)' },
  },
  required: ['title', 'hook', 'scenes', 'description', 'hashtags'],
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
    // 인증 + 권한
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

    // 입력
    const body = await req.json().catch(() => ({}));
    const title = (body.title as string | undefined)?.trim() || '';
    const articleText = (body.articleText as string | undefined)?.trim() || '';
    if (!articleText) {
      return jsonError('숏츠로 만들 글 내용이 필요합니다.', 400);
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return jsonError('서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다.', 500);
    }

    const anthropic = new Anthropic();
    const userPrompt = [
      `[블로그 제목] ${title}`,
      '[블로그 본문]',
      articleText,
      '',
      '위 글을 바탕으로, 지침에 맞는 세로 숏츠 대본을 만들어 주세요.',
    ].join('\n');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 12000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    if (message.stop_reason === 'refusal') {
      return jsonError('AI가 이 요청에 대한 작성을 거절했습니다.', 422);
    }
    if (message.stop_reason === 'max_tokens') {
      return jsonError('숏츠 대본이 최대 길이에 도달해 잘렸습니다. 다시 시도해 주세요.', 502);
    }
    const textBlock = message.content.find((b: any) => b.type === 'text') as
      | { type: 'text'; text: string }
      | undefined;
    if (!textBlock?.text) {
      return jsonError('AI 응답이 비어 있습니다. 다시 시도해 주세요.', 502);
    }

    let result: unknown;
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
    console.error('숏츠 대본 생성 실패:', error);
    return jsonError(error.message || '숏츠 대본 생성에 실패했습니다.', 500);
  }
}
