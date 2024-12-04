import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://trimtech.app',
      lastModified: new Date(),
    },
    {
      url: 'https://trimtech.app/login',
      lastModified: new Date(),
    },
  ]
}
