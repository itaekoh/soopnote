import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

// Anthropic SDK + 긴 생성 시간을 고려해 Node 런타임 + 넉넉한 타임아웃
export const runtime = 'nodejs';
export const maxDuration = 60;

type LengthOption = 'short' | 'medium' | 'long';

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
- 보고서(PDF)가 첨부된 경우, 그 보고서의 사실·수치·진단 소견을 충실히 반영하되 딱딱한 보고서가 아니라 에세이형 글로 재구성한다. 보고서에 없는 내용을 덧붙이지 않는다.
- 독자에게 가르치려 들지 않고, 함께 바라보는 듯한 어조.

[출력 형식 — 매우 중요]
- contentHtml은 TinyMCE 에디터에 그대로 붙여넣을 수 있는 HTML 본문이어야 한다.
- <html>, <head>, <body> 태그는 절대 포함하지 않는다. 본문 요소만 출력한다.
- 새로 쓰는 본문에 사용 가능한 태그: <p>, <h2>, <h3>, <blockquote>, <ul>, <li>, <strong>, <em>. 새 요소에는 인라인 style·class를 쓰지 않는다.
- 본문에 이미 들어있는 <figure>, <figcaption>, <img> 태그(사진)는 내용·위치·속성을 그대로 보존한다. 사진을 새로 만들어 넣지는 않는다.
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

    // ── 3. 입력 파싱 (multipart: 텍스트 필드 + 선택적 PDF) ──
    const form = await req.formData();
    const subject = (form.get('subject') as string | null)?.trim() || '';
    const fieldNotes = (form.get('fieldNotes') as string | null)?.trim() || '';
    const length = ((form.get('length') as string) || 'medium') as LengthOption;
    const tone = (form.get('tone') as string | null)?.trim() || '따뜻한 에세이';
    const keywords = ((form.get('keywords') as string | null) || '')
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);
    const categorySlug = (form.get('categorySlug') as string) || '';
    const categoryGuide = CATEGORY_GUIDE[categorySlug] || '자연과 나무에 대한 에세이.';
    const pdf = form.get('pdf') as File | null;
    const mode = (form.get('mode') as string) === 'revise' ? 'revise' : 'generate';
    const currentTitle = (form.get('currentTitle') as string | null)?.trim() || '';
    const currentContent = (form.get('currentContent') as string | null) || '';
    const reviseInstruction = (form.get('reviseInstruction') as string | null)?.trim() || '';

    if (mode === 'revise') {
      if (!currentContent.trim() || !reviseInstruction) {
        return jsonError('수정할 초안과 수정 요청 내용이 필요합니다.', 400);
      }
    } else {
      if (!subject) {
        return jsonError('주제(소재)를 입력해주세요.', 400);
      }
      if (!fieldNotes && !pdf) {
        return jsonError('현장 메모를 입력하거나 보고서 PDF를 첨부해주세요.', 400);
      }
    }

    // PDF → base64 document 블록 (생성 모드에서만; Anthropic은 본문 텍스트 앞에 배치)
    let pdfBlock: { type: 'document'; source: { type: 'base64'; media_type: 'application/pdf'; data: string } } | null = null;
    if (pdf && mode === 'generate') {
      if (pdf.type !== 'application/pdf') {
        return jsonError('PDF 파일만 첨부할 수 있습니다.', 400);
      }
      const MAX_PDF_SIZE = 4 * 1024 * 1024; // Vercel 요청 본문 한도 고려
      if (pdf.size > MAX_PDF_SIZE) {
        return jsonError('보고서 PDF는 4MB 이하만 첨부할 수 있습니다.', 400);
      }
      const base64 = Buffer.from(await pdf.arrayBuffer()).toString('base64');
      pdfBlock = {
        type: 'document',
        source: { type: 'base64', media_type: 'application/pdf', data: base64 },
      };
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return jsonError('서버에 ANTHROPIC_API_KEY가 설정되지 않았습니다.', 500);
    }

    // ── 4. Claude로 초안 생성 ─────────────────────────────
    const anthropic = new Anthropic();

    let userText: string;
    if (mode === 'revise') {
      // 수정 모드: 현재 초안을 사용자의 요청대로 다듬는다
      const lines = [
        `[카테고리] ${categoryGuide}`,
        `[톤·문체] ${tone}`,
        `[분량] ${LENGTH_GUIDE[length]}`,
        keywords.length > 0 ? `[강조 키워드] ${keywords.join(', ')}` : '',
        '아래는 현재 작성된 초안입니다. 사용자의 [수정 요청]에 따라 이 초안을 다듬어 주세요.',
        '- 본문에 이미 들어있는 <img>·<figure>·<figcaption>(사진)은 내용·위치를 그대로 유지하세요.',
        '- "📷 [사진 자리] ..." 형태의 사진 자리 표시도 그대로 유지하세요.',
        '- 수정 요청과 무관한 부분은 원래의 톤과 흐름을 최대한 보존하세요.',
        `[수정 요청] ${reviseInstruction}`,
        `[현재 제목] ${currentTitle}`,
        '[현재 본문 HTML]',
        currentContent,
      ];
      userText = lines.filter(Boolean).join('\n');
    } else {
      // 생성 모드: 새 초안 작성
      const promptLines = [
        `[카테고리] ${categoryGuide}`,
        `[주제·소재] ${subject}`,
        `[톤·문체] ${tone}`,
        `[분량] ${LENGTH_GUIDE[length]}`,
        keywords.length > 0 ? `[강조 키워드] ${keywords.join(', ')}` : '',
      ];
      if (pdf) {
        promptLines.push(
          '[첨부 보고서] 사용자가 PDF 보고서를 첨부했습니다. 이 보고서의 내용(사실·수치·소견)을 핵심 근거로 삼아 글을 작성하세요. 보고서에 없는 사실은 지어내지 마세요.'
        );
      }
      if (fieldNotes) {
        promptLines.push('[현장 메모·관찰 내용]', fieldNotes);
      }
      promptLines.push(
        '사진이 들어가면 좋을 위치 2~4곳에 정확히 <p>📷 [사진 자리] 추천 캡션</p> 형식으로 자리 표시를 넣어 주세요. 추천 캡션은 그 자리에 어울리는 짧은 사진 설명입니다. (실제 <img>는 넣지 않습니다.)',
        '위 자료를 바탕으로, 지침에 맞는 블로그 글 초안을 작성해 주세요. 주어진 내용을 자연스러운 이야기로 엮되, 없는 사실은 지어내지 마세요.'
      );
      userText = promptLines.filter(Boolean).join('\n');
    }

    // PDF가 있으면 document 블록을 텍스트 앞에 둔다
    const userContent = pdfBlock
      ? [pdfBlock, { type: 'text' as const, text: userText }]
      : userText;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: OUTPUT_SCHEMA },
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userContent }],
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
