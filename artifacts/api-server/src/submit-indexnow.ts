async function submitIndexNow() {
  const host = "www.clashmarket.online";
  const key = "c7e2b04f18394982a5c317b960b72fa1";
  const keyLocation = `https://${host}/${key}.txt`;

  const urlList = [
    `https://${host}/`,
    `https://${host}/clash-of-clans`,
    `https://${host}/clash-royale`,
    `https://${host}/blog`,
    `https://${host}/blog/buy-clash-of-clans-account-installments-tabby-tamara-saudi`,
    `https://${host}/blog/how-to-change-supercell-id-email-guide`,
    `https://${host}/blog/clash-of-clans-account-ban-reasons-protection-guide`,
    `https://${host}/blog/clash-royale-accounts-guide-2026`,
    `https://${host}/blog/buy-clash-of-clans-account-safely-2026`,
    `https://${host}/blog/how-to-price-clash-of-clans-account`,
    `https://${host}/blog/town-hall-17-vs-18-comparison`,
  ];

  const payload = {
    host,
    key,
    keyLocation,
    urlList,
  };

  console.log("Submitting to IndexNow:", payload);

  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    console.log("IndexNow response status:", res.status, res.statusText);
    const text = await res.text();
    console.log("IndexNow response body:", text || "(empty - 200 OK / 202 Accepted)");
  } catch (err) {
    console.error("IndexNow submission failed:", err);
  }

  process.exit(0);
}

submitIndexNow();
