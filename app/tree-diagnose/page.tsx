'use client';

import { Stethoscope, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TreeDiagnoseList() {
  const posts = [
    {
      id: 1,
      title: '오래된 느티나무의 새 생명, 가지 톱질 후 빠른 회복의 비결',
      excerpt: '마을 입구에 서 있는 수령 80년의 느티나무. 오래 살아온 이 나무는 몇 년 전부터 쇠퇴의 징조를 보이기 시작했다.',
      date: '2025-10-15',
      location: '서울시 강남구',
      views: 286,
      status: '양호',
      treeType: '느티나무',
      emoji: '🌳',
      gradient: 'from-green-100 via-emerald-100 to-teal-100',
    },
    {
      id: 2,
      title: '소나무 재선충병 조기 발견과 긴급 처치 사례',
      excerpt: '정기 순찰 중 발견한 소나무의 이상 징후. 잎이 갈변하고 수지 분비가 감소하는 전형적인 재선충병 증상이었다.',
      date: '2025-10-08',
      location: '경기도 가평',
      views: 512,
      status: '치료중',
      treeType: '소나무',
      emoji: '🌲',
      gradient: 'from-amber-100 via-orange-100 to-red-100',
    },
    {
      id: 3,
      title: '벚나무 가지 고사 원인 진단 및 영양 처방',
      excerpt: '공원의 오래된 왕벚나무에서 발견된 가지 고사 증상. 토양 검사 결과 영양 결핍이 주요 원인으로 밝혀졌다.',
      date: '2025-09-29',
      location: '부산시 해운대구',
      views: 198,
      status: '양호',
      treeType: '벚나무',
      emoji: '🌸',
      gradient: 'from-pink-100 via-rose-100 to-red-100',
    },
    {
      id: 4,
      title: '은행나무 뿌리 부패 치료 및 토양 개선 작업',
      excerpt: '도심 가로수로 심어진 은행나무의 뿌리 부패 증상. 과도한 포장으로 인한 통기성 부족이 원인이었다.',
      date: '2025-09-20',
      location: '대전시 유성구',
      views: 334,
      status: '치료완료',
      treeType: '은행나무',
      emoji: '🍂',
      gradient: 'from-yellow-100 via-amber-100 to-orange-100',
    },
    {
      id: 5,
      title: '단풍나무 탄저병 진단과 친환경 방제',
      excerpt: '아파트 단지 내 단풍나무에서 발견된 탄저병. 환경친화적인 방법으로 치료를 진행했다.',
      date: '2025-09-12',
      location: '인천시 연수구',
      views: 267,
      status: '치료중',
      treeType: '단풍나무',
      emoji: '🍁',
      gradient: 'from-red-100 via-orange-100 to-yellow-100',
    },
    {
      id: 6,
      title: '회화나무 동공 처리 및 구조 안전성 확보',
      excerpt: '오래된 회화나무의 줄기에 발견된 큰 동공. 구조적 안전성을 확보하기 위한 전문 처치가 필요했다.',
      date: '2025-09-05',
      location: '광주시 북구',
      views: 445,
      status: '치료완료',
      treeType: '회화나무',
      emoji: '🌿',
      gradient: 'from-lime-100 via-green-100 to-emerald-100',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case '양호':
        return 'bg-green-50 text-green-700';
      case '치료중':
        return 'bg-orange-50 text-orange-700';
      case '치료완료':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F5F3EE_0%,#F8FAF8_60%)] text-gray-800">
      <Header />

      {/* 페이지 헤더 */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 mb-4">
            <Stethoscope className="w-8 h-8 text-amber-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#26422E] mb-4">나무진단</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            나무의사의 전문적인 진단과 치료 기록. 건강한 나무를 위한 세심한 관찰과 처방을 담았습니다.
          </p>
        </div>

        {/* 필터/정렬 */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            총 <span className="font-semibold text-amber-700">{posts.length}</span>개의 진단 기록
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm rounded-lg bg-amber-700 text-white">최신순</button>
            <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">상태별</button>
            <button className="px-4 py-2 text-sm rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">나무별</button>
          </div>
        </div>

        {/* 게시물 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/tree-diagnose/${post.id}`}>
              <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer">
                {/* 썸네일 */}
                <div className={`h-48 bg-gradient-to-br ${post.gradient} flex items-center justify-center relative`}>
                  <div className="text-center">
                    <div className="text-6xl mb-2">{post.emoji}</div>
                  </div>
                  <div className={`absolute top-3 right-3 px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(post.status)}`}>
                    {post.status}
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 font-medium">
                      {post.treeType}
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-[#26422E] mb-2 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{post.location.split(' ')[0]}</span>
                      </div>
                    </div>
                    <div>읽음 {post.views}</div>
                  </div>
                </div>

                {/* 하단 태그 */}
                <div className="px-5 pb-4">
                  <div className="inline-block px-3 py-1 text-xs rounded-full bg-amber-50 text-amber-700 font-medium">
                    나무진단
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* 더보기 버튼 */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 rounded-lg bg-white border-2 border-amber-700 text-amber-700 font-semibold hover:bg-amber-700 hover:text-white transition-colors">
            더 많은 진단 기록 보기
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
