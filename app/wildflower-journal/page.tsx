import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Camera, Leaf, MapPin, PenLine } from 'lucide-react';

const gallery = [
  {
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: '바람에 흔들리는 들꽃',
    caption: '산책길에서 만난 들꽃들. 빛이 머문 자리마다 향기가 번집니다.'
  },
  {
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: '비를 머금은 야생화',
    caption: '새벽에 내린 이슬을 머금은 꽃잎은 또 다른 얼굴을 보여줍니다.'
  },
  {
    src: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3',
    alt: '숲의 가장자리 풍경',
    caption: '숲과 들판이 만나는 가장자리. 서로 다른 식생이 조화롭게 어우러집니다.'
  }
];

const timeline = [
  {
    title: '09:30 AM · 숲의 입구',
    description:
      '오늘의 첫 기록. 산책로 초입에서 피어난 금낭화 군락을 관찰했습니다. 토양은 습윤했고, 인근 계류에서 불어오는 바람이 꽃의 수분 활동을 돕고 있었습니다.'
  },
  {
    title: '11:00 AM · 계곡 주변',
    description:
      '계곡 주변의 그늘진 환경에서 자라는 파드득나물의 생육 상태를 확인했습니다. 잎맥에 미세한 변색이 있어 현장에서 간이 검사를 진행했습니다.'
  },
  {
    title: '14:20 PM · 능선 아래',
    description:
      '능선 아래의 따뜻한 사면에서 다양한 나비가 방문하는 모습을 기록했습니다. 꽃가루 매개자 활동이 활발하여 사진과 함께 데이터로 저장했습니다.'
  }
];

export default function WildflowerJournalDetailPage() {
  return (
    <main className="min-h-screen bg-soop-sky/30">
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
        <header className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-soop-mist hover:text-soop-canopy transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            홈으로 돌아가기
          </Link>

          <div className="flex flex-wrap items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <Leaf className="w-6 h-6 text-soop-canopy" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-soop-mist">Wildflower diary</p>
              <h1 className="mt-1 text-4xl md:text-5xl font-semibold text-soop-forest leading-tight">
                봄 숲의 향기와 야생화 관찰 노트
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-soop-mist">
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-4 h-4" /> 강원 인제 자락
            </span>
            <span className="inline-flex items-center gap-2">
              <Camera className="w-4 h-4" /> 기록: 2025년 4월 18일
            </span>
            <span className="inline-flex items-center gap-2">
              <PenLine className="w-4 h-4" /> 글, 사진: soopnote
            </span>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[2fr_1fr] items-start">
          <article className="space-y-8 text-soop-ink leading-relaxed">
            <p>
              아침 8시, 숲은 아직 차분한 숨을 쉬고 있었습니다. 이른 시간임에도 들꽃들은 빛을 향해 몸을 길게 뻗고 있었고, 저마다의 색으로 숲의 결을 완성하고 있었습니다. 오늘은 특히 산비탈에 흐드러진 현호색 군락이 눈에 들어왔습니다.
            </p>
            <p>
              현장 노트에는 토양의 수분도, 잎의 질감, 바람의 방향까지 기록합니다. 나무의사로서의 습관이기도 하지만, 작은 정보가 식물의 건강을 이해하는 실마리가 되기 때문입니다. 현호색은 반그늘에서 가장 건강하게 자라는 모습을 보여주었습니다.
            </p>
            <p>
              점심 무렵에는 숲 가장자리의 햇살이 강해지면서 다른 식물들의 표정도 달라졌습니다. 냉이꽃과 별꽃이 섞여 피어난 곳에서는 꿀벌들이 연신 꽃가루를 옮겼습니다. 이 작은 움직임들이 봄 숲의 리듬을 만들어가는 듯했습니다.
            </p>
            <p>
              오후에는 계곡을 따라 내려오며 병해충 조짐이 있는 개체를 선별했습니다. 잎에 생긴 미세한 반점을 채집하여 간이 진단 키트로 검사했고, 일시적인 환경 스트레스라는 결론을 내렸습니다. 현장에서의 빠른 대응이 식물을 살리는 첫 걸음이라 생각합니다.
            </p>
          </article>

          <aside className="space-y-6 bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-soop-forest">오늘의 관찰 키워드</h2>
            <div className="flex flex-wrap gap-2">
              {['#현호색', '#금낭화', '#봄숲', '#수분활동', '#현장진단'].map((keyword) => (
                <span
                  key={keyword}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-soop-forest/10 text-soop-forest text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <div className="h-px bg-soop-forest/10" aria-hidden />
            <div className="space-y-3 text-sm text-soop-mist">
              <p>오늘 수집한 기상 데이터와 토양 샘플은 연구 노트에 추가로 정리될 예정입니다.</p>
              <p>다음 방문 시에는 습지 구간의 야생화를 집중적으로 살필 계획입니다.</p>
            </div>
          </aside>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-semibold text-soop-forest">현장 기록 타임라인</h2>
          <div className="space-y-6">
            {timeline.map((item) => (
              <div key={item.title} className="rounded-3xl bg-white/60 backdrop-blur-sm p-6 shadow-sm">
                <p className="text-sm font-semibold text-soop-canopy">{item.title}</p>
                <p className="mt-2 text-soop-ink text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-soop-forest">오늘의 숲 풍경</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {gallery.map((item) => (
              <figure
                key={item.src}
                className="overflow-hidden rounded-3xl bg-white/60 backdrop-blur-sm shadow-sm"
              >
                <div className="relative h-56">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover hover:scale-[1.02] transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    priority
                  />
                </div>
                <figcaption className="px-4 py-3 text-xs text-soop-mist leading-relaxed">{item.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
