import https from "node:https";

https.get("https://api.clashmarket.online/api/accounts?game=clash-of-clans", (res) => {
  let d = "";
  res.on("data", (c) => (d += c));
  res.on("end", () => {
    const list = JSON.parse(d);
    list.forEach((a) => {
      console.log(`ID: ${a.id} | Slug: ${a.slug}`);
      console.log(`  Title: ${a.title}`);
      console.log(`  Price: ${a.price} | OldPrice: ${a.oldPrice}`);
      console.log(`  Images count: ${a.images?.length}`);
      console.log(`  First Image: ${a.images && a.images[0]}`);
      console.log("---");
    });
  });
});
