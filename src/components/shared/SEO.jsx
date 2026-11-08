import { useEffect } from 'react';

const BASE_URL = 'https://naturalice.ae';

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

export default function SEO({
  title,
  description,
  canonicalPath = '/',
  noindex = false,
  schema = null,
  lang = 'en',
  alternates = null,
}) {
  useEffect(() => {
    const canonicalUrl = new URL(canonicalPath, BASE_URL).toString();

    document.title = title;
    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    if (alternates) {
      [['en', alternates.en], ['ar', alternates.ar], ['x-default', alternates.en]].forEach(([code, path]) => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = code;
        link.href = new URL(path, BASE_URL).toString();
        document.head.appendChild(link);
      });
    }

    let jsonLd = document.head.querySelector('#naturalice-route-schema');
    if (schema) {
      if (!jsonLd) {
        jsonLd = document.createElement('script');
        jsonLd.id = 'naturalice-route-schema';
        jsonLd.type = 'application/ld+json';
        document.head.appendChild(jsonLd);
      }
      jsonLd.textContent = JSON.stringify(schema);
    } else if (jsonLd) {
      jsonLd.remove();
    }
  }, [title, description, canonicalPath, noindex, schema, lang, alternates?.en, alternates?.ar]);

  return null;
}