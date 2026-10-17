import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  url?: string;
  schema?: object | object[];
}

export function SEO({ title, description, url, schema }: SEOProps) {
  const siteName = "神狗勾耗材商城";
  // If the title already contains the site name, don't append it again
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const defaultDesc = "神狗勾耗材商城為台灣頂尖 3D 列印耗材專營商店，專為創客與專業人士提供高品質的高速 PLA、PETG、ABS、TPU 等 3D 列印線材。";
  const finalDesc = description || defaultDesc;
  const finalUrl = url ? `https://goddog.space${url}` : 'https://goddog.space';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={finalUrl} />
      <link rel="canonical" href={finalUrl} />
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
}
