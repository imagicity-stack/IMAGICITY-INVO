import { MetadataRoute } from 'next';

/**
 * @returns {MetadataRoute.Manifest}
 */
export default function manifest() {
  return {
    name: 'IMAGICITY Invo',
    short_name: 'Invo',
    description: 'Manage invoices, quotations, and clients with a streamlined progressive web app.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    icons: [
      {
        src: '/imvo.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/imvo.png',
        sizes: '1024x1024',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
