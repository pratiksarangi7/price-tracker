import { extractCurrency } from "@/lib/utils";
import axios from "axios";
import * as cheerio from "cheerio";
export async function scrapeAmazonProduct(url: string) {
  if (!url) return;
  const userName = String(process.env.BRIGHT_DATA_USERNAME);
  const password = String(process.env.BRIGHT_DATA_PASSWORD);
  const port = 33335;
  const session_id = (1000000 * Math.random()) | 0;
  const options = {
    auth: {
      username: `${userName}-session-${session_id}`,
      password,
    },
    host: "brd.superproxy.io",
    port,
    rejectUnauthorized: false,
  };
  try {
    const response = await axios.get(url, options);
    // console.log(response.data);
    const $ = cheerio.load(response.data);
    const title = $("#productTitle").text().trim();
    console.log(title);
    const currentPrice = $(".a-price-whole")
      .first()
      .text()
      .trim()
      .replace(/\D/g, "");
    const originalPrice = $(".a-price.a-text-price .a-offscreen")
      .text()
      .trim()
      .replace(/\D/g, "");
    const outOfStock =
      $("#availability span").text().trim().toLowerCase() ===
      "currently unavailable";
    const images =
      $("#imgBlkFront").attr("data-a-dynamic-image") ||
      $("#landingImage").attr("data-a-dynamic-image") ||
      "{}";
    const imgUrls = Object.keys(JSON.parse(images));
    const currency = extractCurrency($(".a-price-symbol"));
    const discountRate = $(".savingsPercentage").text().replace(/[-%]/g, "");
    console.log({
      title,
      currentPrice,
      originalPrice,
      outOfStock,
      imgUrls,
      currency,
      discountRate,
    });
    const data = {
      url,
      currency: currency || "$",
      image: imgUrls[0],
      title,
      currentPrice: Number(currentPrice) || Number(originalPrice),
      originalPrice: Number(originalPrice) || Number(currentPrice),
      priceHistory: [],
      discountRate: Number(discountRate),
      category: "category",
      reviewsCount: 100,
      stars: 4.5,
      isOutOfStock: outOfStock,
      lowestPrice: Number(currentPrice) || Number(originalPrice),
      highestPrice: Number(originalPrice) || Number(currentPrice),
      averagePrice: Number(currentPrice) || Number(originalPrice),
      description: "",
    };
    return data;
  } catch (err: any) {
    throw new Error(`failed to scrape product: ${err.message}`);
  }
}
