import React, { useEffect } from 'react';

interface SeoMetaProps {
  title?: string;
  description?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
  schemaId?: string;
}

const ensureMetaTag = (selector: string, attributes: Record<string, string>) => {
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    Object.entries(attributes).forEach(([key, value]) => {
      if (key !== 'content') tag?.setAttribute(key, value);
    });
    document.head.appendChild(tag);
  }
  return tag;
};

const SeoMeta: React.FC<SeoMetaProps> = ({ title, description, structuredData, schemaId = 'seo-schema' }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
      const ogTitle = ensureMetaTag('meta[property="og:title"]', { property: 'og:title' });
      ogTitle.setAttribute('content', title);
    }

    if (description !== undefined) {
      const metaDescription = ensureMetaTag('meta[name="description"]', { name: 'description' });
      metaDescription.setAttribute('content', description);
      const ogDescription = ensureMetaTag('meta[property="og:description"]', { property: 'og:description' });
      ogDescription.setAttribute('content', description);
    }

    if (structuredData) {
      const existing = document.getElementById(schemaId);
      if (existing) existing.remove();
      const script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      script.text = JSON.stringify(structuredData);
      document.head.appendChild(script);
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }

    return undefined;
  }, [title, description, structuredData, schemaId]);

  return null;
};

export default SeoMeta;
