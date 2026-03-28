import Parser from "rss-parser";
import { ParsedArticle } from "@/types/ingestion";
import { Source } from "@/types/database";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "GovSignal-AI/1.0 (AI Policy Monitor)",
  },
});

export async function parseRSSFeed(
  url: string,
  sourceId: string | null = null
): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(url);

    return (feed.items || []).map((item) => ({
      title: item.title || "Untitled",
      url: item.link || "",
      published_at: item.pubDate
        ? new Date(item.pubDate).toISOString()
        : new Date().toISOString(),
      raw_content: item.contentSnippet || item.content || null,
      source_id: sourceId,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[RSS] Failed to parse ${url}: ${message}`);
    return [];
  }
}

export async function parseAllSources(
  sources: Source[]
): Promise<{ articles: ParsedArticle[]; errors: string[] }> {
  const errors: string[] = [];

  const results = await Promise.allSettled(
    sources
      .filter((s) => s.active && s.source_type === "rss")
      .map(async (source) => {
        const articles = await parseRSSFeed(source.url, source.id);
        if (articles.length === 0) {
          errors.push(`No articles from ${source.name} (${source.url})`);
        }
        return articles;
      })
  );

  const articles = results
    .filter(
      (r): r is PromiseFulfilledResult<ParsedArticle[]> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value);

  results.forEach((r) => {
    if (r.status === "rejected") {
      errors.push(`Source fetch rejected: ${r.reason}`);
    }
  });

  return { articles, errors };
}
