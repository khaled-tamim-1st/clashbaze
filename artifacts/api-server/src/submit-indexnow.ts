async function submitIndexNow() {
  const host = "www.clashmarket.online";
  const key = "8f961b38ae5b4a9588de60fb674bab1c";
  const keyLocation = `https://${host}/${key}.txt`;

  let urlList: string[] = [];

  try {
    const sitemapRes = await fetch(`https://${host}/sitemap.xml`);
    if (sitemapRes.ok) {
      const xml = await sitemapRes.text();
      const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
      if (matches.length > 0) {
        urlList = matches;
      }
    }
  } catch (e) {
    console.warn("Could not fetch sitemap, falling back to static list", e);
  }

  if (urlList.length === 0) {
    urlList = [
      `https://${host}/`,
      `https://${host}/clash-of-clans`,
      `https://${host}/clash-of-clans/town-hall-18`,
      `https://${host}/clash-of-clans/town-hall-17`,
      `https://${host}/clash-of-clans/town-hall-16`,
      `https://${host}/clash-of-clans/town-hall-15`,
      `https://${host}/clash-royale`,
      `https://${host}/guarantee`,
      `https://${host}/how-it-works`,
      `https://${host}/about`,
      `https://${host}/blog`,
    ];
  }

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  console.log(`Submitting ${urlList.length} URLs to IndexNow (Bing/Yandex):`, payload);

  const endpoints = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Submitting to: ${endpoint}`);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      console.log(`Response from ${endpoint}:`, res.status, res.statusText);
      const text = await res.text();
      console.log(`Body:`, text || "(empty - 200 OK / 202 Accepted)");
    } catch (err) {
      console.error(`Submission to ${endpoint} failed:`, err);
    }
  }

  process.exit(0);
}

submitIndexNow();
