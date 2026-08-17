import { Helmet } from "react-helmet-async";
interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: object | object[];
}

export function SEO({
  title = 'كلاش ماركت | بيع وشراء حسابات كلاش أوف كلانس وكلاش رويال في الخليج',
  description = 'كلاش ماركت هو وجهتك الموثوقة لبيع وشراء حسابات كلاش أوف كلانس وكلاش رويال في السعودية والخليج، أسعار تنافسية، كروت وتاون ماكس، ومعاملات آمنة مع تسليم فوري.',
  image = 'https://www.clashmarket.online/opengraph.png',
  url = 'https://www.clashmarket.online/',
  type = 'website',
  jsonLd,
}: SEOProps) {
  const fullTitle = title.includes('كلاش ماركت') ? title : `${title} | كلاش ماركت`;
  const jsonLdArray = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="كلاش ماركت" />
      <meta property="og:locale" content="ar_SA" />
      <meta property="og:locale:alternate" content="ar_AE" />
      <meta property="og:locale:alternate" content="ar_KW" />
      <meta property="og:locale:alternate" content="ar_QA" />
      <meta property="og:locale:alternate" content="ar_BH" />
      <meta property="og:locale:alternate" content="ar_OM" />
      <meta property="og:locale:alternate" content="ar_EG" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {jsonLdArray.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}