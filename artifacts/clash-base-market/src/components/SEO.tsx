import { Helmet } from "react-helmet-async";
interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export function SEO({
  title = 'كلاش ماركت | بيع وشراء حسابات وتصاميم كلاش أوف كلانس',
  description = 'كلاش ماركت هو منصتك الموثوقة لبيع وشراء حسابات كلاش أوف كلانس، وتصاميم القرى المبتكرة وآمنة المعاملات بأفضل الأسعار.',
  image = 'https://clashmarket.online/opengraph.png',
  url = 'https://clashmarket.online/',
}: SEOProps) {
  const fullTitle = title.includes('كلاش ماركت') ? title : `${title} | كلاش ماركت`;

  return (
     <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="كلاش ماركت" />
      <meta property="og:locale" content="ar_AR" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}