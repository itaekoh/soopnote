import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import WildflowerDetailClient from './WildflowerDetailClient';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { id } = await params;
  const postId = Number(id);

  const { data: post } = await supabase
    .from('sn_posts_full')
    .select('*')
    .eq('id', postId)
    .single();

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다',
      description: '요청하신 게시글을 찾을 수 없습니다.',
    };
  }

  const url = `https://www.soopnote.com/wildflower/${postId}`;
  const imageUrl = post.featured_image_url || '/og-image.png';

  return {
    title: post.title,
    description: post.excerpt || post.title,
    keywords: [
      '야생화',
      '자연관찰',
      '식물일지',
      post.title,
      ...(post.subcategory_names || []),
    ],
    authors: [{ name: post.author_name || 'Soopnote' }],
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

export default async function WildflowerDetailPage({ params }: Props) {
  const { id } = await params;
  return <WildflowerDetailClient postId={Number(id)} />;
}
