import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/write',
          '/write/*',
          '/admin',
          '/account',
          '/api/*',
        ],
      },
    ],
    sitemap: 'https://www.soopnote.com/sitemap.xml',
  };
}
