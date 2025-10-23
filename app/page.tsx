import Image from 'next/image';
import { Leaf, PenLine, ArrowRight, Instagram, Send } from 'lucide-react';

const featuredPosts = [
  {
    title: '산책 중 만난 들꽃',
    date: '2025-10-12 · 강원',
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  {
    title: '가을의 잎맥 관찰',
    date: '2025-10-08 · 경기',
    img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  {
    title: '비오는 날의 숲',
    date: '2025-09-30 · 전북',
    img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3'
  }
];

const latestPosts = Array.from({ length: 6 }).map((_, index) => ({
  title: `포스트 제목 예시 ${index + 1}`,
  excerpt: '현장에서 본 것들을 요약한 한두 문장으로 호기심을 전합니다.',
  date: '2025-10-12 · 강원',
  readCount: 324,
  img: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3'
}));

const categories = [
  {
    title: '🌿 야생화 일기',
    description: '들꽃과 풀의 계절을 기록합니다. 피어난 순간의 색과 향기를 포착한 일기입니다.'
  },
  {
    title: '🌲 나무의사 노트',
    description: '수목 진단과 병충해 이야기, 관리 팁을 나무의사의 시선으로 정리합니다.'
  },
  {
    title: '🍃 숲과 사람',
    description: '숲속 사람들의 인터뷰와 에세이, 자연이 주는 위로를 나눕니다.'
  },
  {
    title: '📓 그린테크',
    description: 'AI·IT로 보는 식물 진단 이야기. 기술이 숲을 만나는 지점을 탐색합니다.'
  }
];

const socialPlaceholders = Array.from({ length: 6 });

export default function HomePage() {
  return (
    <main>
      <header className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <Leaf className="w-8 h-8 text-soop-canopy" strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-2xl font-medium tracking-tight">soopnote</p>
            <p className="text-xs text-soop-mist -mt-0.5">숲의 숨을 기록하다</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-4 text-sm text-soop-mist">
          <a className="hover:text-soop-canopy transition-colors" href="#categories">
            야생화 일기
          </a>
          <a className="hover:text-soop-canopy transition-colors" href="#latest">
            나무의사 노트
          </a>
          <a className="hover:text-soop-canopy transition-colors" href="#stories">
            숲과 사람
          </a>
          <button className="inline-flex items-center gap-2 py-2 px-4 rounded-full bg-soop-canopy text-white shadow-sm transition-transform hover:scale-[1.02]">
            <PenLine className="w-4 h-4" />
            글쓰기
          </button>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 grid grid-cols-12 gap-12 items-start py-8">
        <div className="col-span-12 lg:col-span-7 space-y-8 fade-in">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-soop-mist">Forest journal</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-soop-forest leading-tight font-display">
              숨의 기록 — 작은 꽃들, 큰 이야기
            </h1>
            <p className="mt-4 text-lg text-soop-mist max-w-2xl">
              야생화의 순간을 포착하고, 나무의사의 시선으로 현장을 기록합니다. 사진과 진단, 그리고 연구 노트가 만나는 감성 식물 저널.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="inline-flex items-center gap-2 bg-white shadow-sm py-3 px-5 rounded-full text-sm text-soop-ink hover:shadow-md transition" href="#latest">
                최근 글 보기
                <ArrowRight className="w-4 h-4" />
              </a>
              <a className="inline-flex items-center gap-2 py-3 px-5 rounded-full text-sm border border-soop-forest/20 hover:bg-soop-forest/10 transition" href="#categories">
                야생화 컬렉션
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" aria-label="추천 글">
            {featuredPosts.map((post) => (
              <article key={post.title} className="rounded-2xl overflow-hidden bg-white shadow-md card-hover">
                <div className="relative h-32 w-full">
                  <Image src={post.img} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm text-soop-forest">{post.title}</h3>
                  <p className="mt-1 text-xs text-soop-mist">{post.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-5 space-y-6 fade-in">
          <div className="rounded-3xl p-6 bg-white/90 shadow-lg border border-soop-forest/10">
            <p className="text-xs uppercase tracking-[0.35em] text-soop-mist">오늘의 메모</p>
            <p className="mt-4 text-soop-forest text-lg font-medium leading-relaxed">
              참나무 잎 가장자리에 작은 반점 관찰 — 수분 스트레스 가능성. 오후 광량이 많은 구간에서 특히 두드러짐.
            </p>
            <p className="mt-4 text-xs text-soop-mist">현장: 수원 · 2025-10-18</p>
            <div className="mt-6">
              <p className="text-xs text-soop-mist">태그</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {['#야생화', '#진단일지', '#가을'].map((tag) => (
                  <span key={tag} className="text-xs px-3 py-1 bg-soop-forest/10 text-soop-forest rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-6 border-t border-soop-forest/10 pt-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-soop-forest/10 to-soop-canopy/20" />
              <div>
                <p className="text-sm font-semibold text-soop-forest">오하 이태근</p>
                <p className="text-xs text-soop-mist">나무의사 · 수목진단</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl p-6 bg-white/60 backdrop-blur-sm border border-white/40">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.35em] text-soop-mist">인스타그램</p>
              <Instagram className="w-4 h-4 text-soop-mist" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {socialPlaceholders.map((_, index) => (
                <div key={index} className="relative h-20 rounded-xl overflow-hidden bg-white/70">
                  <div className="absolute inset-0 flex items-center justify-center text-soop-mist text-xs">
                    soon
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section id="categories" className="max-w-6xl mx-auto px-6 py-14">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-semibold text-soop-forest font-display">카테고리</h2>
            <p className="mt-2 text-sm text-soop-mist">
              식물과 사람을 잇는 네 가지 갈래. 하루 한 장, 나무와 나를 잇는 노트를 펼쳐보세요.
            </p>
          </div>
          <a className="inline-flex items-center gap-2 text-sm text-soop-canopy hover:underline" href="#latest">
            전체 아카이브 보기
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <article key={category.title} className="group rounded-3xl p-6 bg-white/80 shadow-sm border border-soop-forest/10 transition hover:border-soop-canopy/40">
              <h3 className="text-xl font-semibold text-soop-forest">{category.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-soop-mist">{category.description}</p>
              <button className="mt-4 inline-flex items-center gap-2 text-xs text-soop-canopy group-hover:underline">
                자세히 보기
                <ArrowRight className="w-3 h-3" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section id="latest" className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-3xl font-semibold text-soop-forest font-display">최근 게시물</h2>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <article key={post.title} className="bg-white rounded-3xl overflow-hidden shadow-md border border-soop-forest/10 card-hover">
              <div className="relative h-48 w-full">
                <Image src={post.img} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-soop-forest">{post.title}</h3>
                <p className="mt-2 text-sm text-soop-mist leading-relaxed">{post.excerpt}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-soop-mist">
                  <span>{post.date}</span>
                  <span>읽음 {post.readCount}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="stories" className="max-w-6xl mx-auto px-6 py-14">
        <div className="rounded-[40px] bg-soop-forest text-white p-10 md:p-14 flex flex-col lg:flex-row gap-10 items-center">
          <div className="flex-1 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-white/60">soopnote letter</p>
            <h2 className="text-3xl md:text-4xl font-semibold">숲의 향기를 전하는 뉴스레터</h2>
            <p className="text-sm text-white/70">
              식물 진단 리포트, 숲과 사람의 인터뷰, 그리고 기술이 만난 현장을 모아 매달 전해드립니다.
            </p>
          </div>
          <form className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <input
              type="email"
              placeholder="이메일 주소"
              className="flex-1 rounded-full px-5 py-3 text-sm text-soop-ink focus:outline-none focus:ring-2 focus:ring-soop-leaf"
            />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm text-soop-forest font-semibold">
              구독하기
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </section>

      <footer className="bg-soop-forest text-white">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-lg font-semibold">soopnote</p>
            <p className="mt-2 text-sm text-white/70">숲의 숨을 기록하다. 하루 한 장, 나무와 나를 잇는 노트.</p>
          </div>
          <div>
            <p className="text-sm font-medium">Contact</p>
            <p className="mt-2 text-sm text-white/70">hello@soopnote.com</p>
            <p className="text-sm text-white/50">© 2025 soopnote. All Rights Reserved.</p>
          </div>
          <div>
            <p className="text-sm font-medium">Follow</p>
            <div className="mt-2 flex gap-4 text-sm text-white/70">
              <a href="#" className="hover:text-white">Instagram</a>
              <a href="#" className="hover:text-white">YouTube</a>
              <a href="#" className="hover:text-white">Newsletter</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
