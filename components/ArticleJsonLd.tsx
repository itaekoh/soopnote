import type { PostFull } from '@/lib/types/database.types';

/**
 * 글 상세 페이지용 구조화 데이터 (schema.org BlogPosting)
 *
 * 전에는 사이트 전체를 설명하는 WebSite 스키마 하나뿐이어서, 검색엔진이
 * 개별 글을 '기사'로 인식할 단서가 없었다. 제목·작성일·수정일·작성자·
 * 대표 이미지를 명시하면 검색 결과에 날짜와 작성자가 함께 노출되고,
 * 애드센스 심사에서도 글이 제대로 된 콘텐츠로 읽힌다.
 */
export function ArticleJsonLd({
  post,
  url,
}: {
  post: PostFull;
  url: string;
}) {
  const published = post.published_at || post.created_at;

  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline: post.title,
    description: post.excerpt || post.title,
    inLanguage: 'ko-KR',
    datePublished: published,
    dateModified: post.updated_at || published,
    author: {
      '@type': 'Person',
      name: post.author_name || '수피파이',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Soopnote',
      url: 'https://www.soopnote.com',
    },
    ...(post.featured_image_url ? { image: [post.featured_image_url] } : {}),
    ...(post.category_name ? { articleSection: post.category_name } : {}),
    ...(post.subcategory_names?.length ? { keywords: post.subcategory_names.join(', ') } : {}),
  };

  return (
    <script
      type="application/ld+json"
      // 본문이 아니라 메타데이터만 담으므로 사용자 입력이 그대로 실행될
      // 여지는 없지만, </script> 가 섞여 태그가 닫히는 것은 막는다.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
