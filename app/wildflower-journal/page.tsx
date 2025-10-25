"use client";

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import {
  ArrowLeft,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Underline
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type EditorMeta = {
  title: string;
  subtitle: string;
  location: string;
  recordedAt: string;
  author: string;
};

const initialContent = `
  <p>아침 8시, 숲은 아직 차분한 숨을 쉬고 있었습니다. 들꽃들은 빛을 향해 몸을 길게 뻗으며 저마다의 색으로 숲의 결을 완성하고 있었어요.</p>
  <p>현장 노트에는 토양의 수분도, 잎의 질감, 바람의 방향까지 기록합니다. 작은 정보 하나가 식물의 건강을 이해하는 실마리가 되기 때문입니다.</p>
  <h2>오늘의 관찰 키워드</h2>
  <ul>
    <li>#현호색</li>
    <li>#금낭화</li>
    <li>#봄숲</li>
  </ul>
  <p>다음 방문 시에는 습지 구간의 야생화를 집중적으로 살필 계획입니다.</p>
`.trim();

function ToolbarButton({
  icon: Icon,
  label,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-soop-forest transition hover:bg-white"
    >
      <Icon className="h-4 w-4" strokeWidth={1.8} />
    </button>
  );
}

function EditorToolbar({ onCommand }: { onCommand: (command: string, value?: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 rounded-full bg-soop-canopy/10 p-2">
      <ToolbarButton icon={Undo2} label="실행 취소" onClick={() => onCommand('undo')} />
      <ToolbarButton icon={Redo2} label="다시 실행" onClick={() => onCommand('redo')} />
      <div className="w-px bg-soop-canopy/10" aria-hidden />
      <ToolbarButton icon={Bold} label="굵게" onClick={() => onCommand('bold')} />
      <ToolbarButton icon={Italic} label="기울임" onClick={() => onCommand('italic')} />
      <ToolbarButton icon={Underline} label="밑줄" onClick={() => onCommand('underline')} />
      <div className="w-px bg-soop-canopy/10" aria-hidden />
      <ToolbarButton icon={Heading2} label="본문 제목" onClick={() => onCommand('formatBlock', '<h2>')} />
      <ToolbarButton icon={Heading3} label="소제목" onClick={() => onCommand('formatBlock', '<h3>')} />
      <ToolbarButton icon={Quote} label="인용" onClick={() => onCommand('formatBlock', '<blockquote>')} />
      <div className="w-px bg-soop-canopy/10" aria-hidden />
      <ToolbarButton icon={List} label="불릿 리스트" onClick={() => onCommand('insertUnorderedList')} />
      <ToolbarButton icon={ListOrdered} label="번호 리스트" onClick={() => onCommand('insertOrderedList')} />
      <ToolbarButton icon={Link2} label="링크" onClick={() => onCommand('createLink')} />
    </div>
  );
}

export default function WildflowerJournalEditorPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [meta, setMeta] = useState<EditorMeta>({
    title: '봄 숲의 향기와 야생화 관찰 노트',
    subtitle: '야생화 일기 · Wildflower diary',
    location: '강원 인제 자락',
    recordedAt: '2025-04-18 09:30',
    author: 'soopnote'
  });
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const handleCommand = (command: string, value?: string) => {
    if (!editorRef.current) return;

    editorRef.current.focus();

    if (command === 'formatBlock' && value) {
      document.execCommand(command, false, value);
      handleInput();
      return;
    }

    if (command === 'createLink') {
      const url = window.prompt('링크 URL을 입력해주세요.');

      if (!url) return;

      document.execCommand(command, false, url);
      handleInput();
      return;
    }

    document.execCommand(command, false, value ?? '');
    handleInput();
  };

  const handleInput = () => {
    if (!editorRef.current) return;

    setContent(editorRef.current.innerHTML);
  };

  const updateMeta = (field: keyof EditorMeta) => (event: ChangeEvent<HTMLInputElement>) => {
    setMeta((previous) => ({ ...previous, [field]: event.target.value }));
  };

  return (
    <main className="min-h-screen bg-soop-sky/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-soop-mist transition hover:text-soop-canopy"
          >
            <ArrowLeft className="h-4 w-4" /> 홈으로 돌아가기
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.3em] text-soop-mist">Editor · Admin</p>
            <h1 className="text-3xl font-semibold text-soop-forest md:text-4xl">
              야생화 일기 상세페이지 위지윅 에디터
            </h1>
            <p className="max-w-2xl text-sm text-soop-mist">
              관리자 페이지에서 바로 콘텐츠를 편집하고, 저장 전 실시간 미리보기를 확인할 수 있도록 구성했습니다.
              제목과 메타 정보, 본문 콘텐츠를 모두 위지윅 방식으로 다듬어 보세요.
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="space-y-6 rounded-3xl bg-white/70 p-6 shadow-sm backdrop-blur">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-soop-forest">메타 정보</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs font-medium text-soop-mist">
                  제목
                  <input
                    value={meta.title}
                    onChange={updateMeta('title')}
                    className="rounded-xl border border-soop-forest/10 bg-white px-3 py-2 text-sm text-soop-ink focus:outline-none focus:ring-2 focus:ring-soop-canopy/40"
                    placeholder="포스트 제목"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-soop-mist">
                  서브타이틀
                  <input
                    value={meta.subtitle}
                    onChange={updateMeta('subtitle')}
                    className="rounded-xl border border-soop-forest/10 bg-white px-3 py-2 text-sm text-soop-ink focus:outline-none focus:ring-2 focus:ring-soop-canopy/40"
                    placeholder="포스트 부제목"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-soop-mist">
                  촬영 · 관찰 위치
                  <input
                    value={meta.location}
                    onChange={updateMeta('location')}
                    className="rounded-xl border border-soop-forest/10 bg-white px-3 py-2 text-sm text-soop-ink focus:outline-none focus:ring-2 focus:ring-soop-canopy/40"
                    placeholder="예) 강원 인제 자락"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-soop-mist">
                  기록 시각
                  <input
                    value={meta.recordedAt}
                    onChange={updateMeta('recordedAt')}
                    className="rounded-xl border border-soop-forest/10 bg-white px-3 py-2 text-sm text-soop-ink focus:outline-none focus:ring-2 focus:ring-soop-canopy/40"
                    placeholder="예) 2025-04-18 09:30"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-soop-mist">
                  작성자
                  <input
                    value={meta.author}
                    onChange={updateMeta('author')}
                    className="rounded-xl border border-soop-forest/10 bg-white px-3 py-2 text-sm text-soop-ink focus:outline-none focus:ring-2 focus:ring-soop-canopy/40"
                    placeholder="작성자 이름"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-soop-forest">본문 콘텐츠</h2>
              <EditorToolbar onCommand={handleCommand} />
              <div
                ref={editorRef}
                onInput={handleInput}
                contentEditable
                suppressContentEditableWarning
                className="min-h-[320px] rounded-3xl border border-dashed border-soop-canopy/30 bg-white/70 p-6 text-sm leading-relaxed text-soop-ink focus:outline-none focus:ring-2 focus:ring-soop-canopy/40"
                aria-label="야생화 일기 본문 편집기"
              />
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white/90 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-soop-forest">실시간 미리보기</h2>
              <article className="mt-4 space-y-4 text-sm leading-relaxed text-soop-ink">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-soop-mist">{meta.subtitle}</p>
                  <h3 className="text-2xl font-semibold text-soop-forest">{meta.title}</h3>
                  <p className="text-xs text-soop-mist">
                    {meta.location} · {meta.recordedAt} · {meta.author}
                  </p>
                </div>
                <div
                  className="space-y-3 text-sm leading-relaxed text-soop-ink [&_a]:text-soop-canopy [&_a]:underline [&_blockquote]:rounded-2xl [&_blockquote]:border-l-2 [&_blockquote]:border-soop-canopy/30 [&_blockquote]:bg-soop-sky/20 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-soop-forest [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_li]:list-disc [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:pl-1 [&_ul]:ml-5 [&_ol]:ml-5 [&_strong]:font-semibold"
                >
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              </article>
            </div>

            <div className="space-y-3 rounded-3xl bg-soop-forest/90 p-6 text-white shadow-sm">
              <h2 className="text-lg font-semibold">출판용 데이터</h2>
              <p className="text-xs text-white/70">
                백엔드로 전달하거나 JSON 파일로 저장할 수 있도록 직렬화된 데이터를 확인하세요.
              </p>
              <pre className="max-h-48 overflow-auto rounded-2xl bg-black/30 p-4 text-[11px] leading-relaxed">
{JSON.stringify(
  {
    meta,
    content
  },
  null,
  2
)}
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
