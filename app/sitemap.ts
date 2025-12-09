import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase/client';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.soopnote.com';

  // 정적 페이지
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/wildflower`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tree-diagnose`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/logs`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];

  // 게시글 동적 페이지 (published만)
  try {
    const { data: posts } = await supabase
      .from('sn_posts')
      .select('id, updated_at, category_id')
      .eq('status', 'published')
      .order('updated_at', { ascending: false });

    // 카테고리별 slug 매핑
    const categorySlugMap: { [key: number]: string } = {};
    const { data: categories } = await supabase
      .from('sn_categories')
      .select('id, slug')
      .eq('type', 'menu');

    categories?.forEach((cat) => {
      categorySlugMap[cat.id] = cat.slug;
    });

    const postPages =
      posts?.map((post) => ({
        url: `${baseUrl}/${categorySlugMap[post.category_id]}/${post.id}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];

    return [...staticPages, ...postPages];
  } catch (error) {
    console.error('Sitemap 생성 중 오류:', error);
    return staticPages;
  }
}
