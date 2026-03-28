export interface RSSFeedItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet?: string;
}

export interface ParsedArticle {
  title: string;
  url: string;
  published_at: string;
  raw_content: string | null;
  source_id: string | null;
}

export interface IngestionResult {
  fetched: number;
  classified: number;
  errors: string[];
}
