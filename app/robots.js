export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/employer/', '/admin/', '/auth/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/employer/', '/admin/', '/auth/'],
      }
    ],
    sitemap: 'https://hireboard.in/sitemap.xml',
    host: 'https://hireboard.in',
  };
}
