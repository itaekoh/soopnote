import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostForPage, getPublishedPostIds } from '@/lib/api/server-posts';
import { ArticleJsonLd } from '@/components/ArticleJsonLd';
import TreeDiagnoseDetailClient from './TreeDiagnoseDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const postId = Number(id);

  // cache() 로 감싸져 있어 아래 페이지 본문과 조회를 공유한다.
  const post = await getPostForPage(postId);

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
      description: '요청하신 게시글을 찾을 수 없습니다.',
    };
  }

  const url = `https://www.soopnote.com/tree-diagnose/${postId}`;
  const imageUrl = post.featured_image_url || '/og-image.png';

  return {
    title: post.title,
    description: post.excerpt || post.title,
    keywords: [
      '나무진단',
      '나무의사',
      '수목진단',
      '수목치료',
      post.title,
      ...(post.subcategory_names || []),
    ],
    authors: [{ name: post.author_name || 'Soopnote' }],
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      locale: 'ko_KR',
      url: url,
      siteName: 'Soopnote - 숲의 기록',
      title: post.title,
      description: post.excerpt || post.title,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.published_at || post.created_at,
      modifiedTime: post.updated_at,
      authors: [post.author_name || 'Soopnote'],
      tags: post.subcategory_names || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: [imageUrl],
      creator: '@soopnote',
    },
  };
}

/**
 * 본문을 서버에서 그린다.
 *
 * 예전에는 메타데이터만 서버에서 만들고 본문은 브라우저가 따로 받아 왔다.
 * 그래서 크롤러가 처음 받는 HTML 에 글이 없었다(보이는 텍스트 273자).
 * 이제 글을 서버에서 받아 넘기므로 HTML 안에 본문이 들어간다.
 */
export const revalidate = 300;

/**
 * 공개된 글을 미리 만들어 둔다.
 *
 * 이게 없으면 [id] 경로가 요청마다 새로 그려지고 Cache-Control 이
 * private, no-store 로 나가서 CDN 이 보관하지 않는다. 측정해 보니
 * 상세 TTFB 1.2초(MISS), 목록은 150ms(PRERENDER) 였다.
 *
 * 새 글은 여기 목록에 없어도 첫 요청에서 그려진 뒤 캐시된다(dynamicParams 기본값).
 */
export async function generateStaticParams() {
  const ids = await getPublishedPostIds('tree-diagnose');
  return ids.map((id) => ({ id: String(id) }));
}

export default async function TreeDiagnoseDetailPage({ params }: Props) {
  const { id } = await params;
  const postId = Number(id);
  const post = await getPostForPage(postId);

  // 없는 글은 빈 화면 대신 제대로 404 를 준다.
  // 예전에는 클라이언트가 "찾을 수 없습니다" 를 그렸고, 서버는 200 을
  // 돌려줬다. 검색엔진에는 '내용 없는 정상 페이지' 로 보인다.
  if (!post) notFound();

  return (
    <>
      <ArticleJsonLd post={post} url={`https://www.soopnote.com/tree-diagnose/${postId}`} />
      <TreeDiagnoseDetailClient postId={postId} initialPost={post} />
    </>
  );
}
