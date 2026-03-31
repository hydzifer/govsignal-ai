import Anthropic from "@anthropic-ai/sdk";
import { Article, Classification } from "@/types/database";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is missing");
  }
  return new Anthropic({ apiKey });
}

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  retries = MAX_RETRIES
): Promise<string> {
  const anthropic = getClient();

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: userMessage }],
      system: systemPrompt,
    });

    const block = response.content[0];
    if (block.type === "text") {
      return block.text;
    }
    throw new Error("Unexpected response format from Claude API");
  } catch (error) {
    if (retries > 0 && error instanceof Error && !error.message.includes("authentication")) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return callClaude(systemPrompt, userMessage, retries - 1);
    }
    throw error;
  }
}

export async function classifyArticle(article: {
  title: string;
  content: string;
  url: string;
}): Promise<Classification> {
  const systemPrompt = `You are an AI policy analyst specializing in EU and US AI regulation.
Classify the given article and respond with ONLY valid JSON in this exact format:
{
  "topics": ["topic1", "topic2"],
  "product_categories": ["category1", "category2"],
  "impact_level": "high" | "medium" | "low",
  "reasoning": "Brief explanation of classification"
}

Topics should be specific regulatory areas (e.g., "AI Act", "GDPR", "Executive Order", "FDA AI/ML").
Product categories should identify affected industries (e.g., "healthcare", "finance", "autonomous vehicles").
Impact level: "high" = immediate compliance action needed, "medium" = monitor closely, "low" = informational.`;

  const userMessage = `Title: ${article.title}\nURL: ${article.url}\nContent: ${article.content}`;

  const response = await callClaude(systemPrompt, userMessage);

  try {
    return JSON.parse(response) as Classification;
  } catch {
    throw new Error(`Failed to parse classification response: ${response}`);
  }
}

export async function generateImpactNote(
  article: Article,
  classification: Classification
): Promise<string> {
  const systemPrompt = `You are an AI policy analyst writing impact notes for B2B customers.
Write a concise impact analysis in markdown format (150-250 words).
Include: what changed, who is affected, what actions to consider, and timeline if applicable.
Be specific and actionable. Do not use generic advice.`;

  const userMessage = `Article: ${article.title}
URL: ${article.url}
Content: ${article.raw_content || "No content available"}
Classification: ${JSON.stringify(classification)}`;

  return callClaude(systemPrompt, userMessage);
}

export async function generateWeeklySummary(articles: Article[]): Promise<string> {
  const systemPrompt = `You are an AI policy analyst writing a weekly regulatory summary for B2B customers.
Write a comprehensive summary in markdown format (300-400 words).
Structure: Executive Summary, Key Developments (bullet points), Outlook.
Focus on actionable insights and upcoming deadlines.`;

  const articleSummaries = articles.map(
    (a) =>
      `- ${a.title} (Impact: ${a.impact_level || "unclassified"}, Topics: ${a.topics.join(", ") || "none"})`
  );

  const userMessage = `Summarize these ${articles.length} articles from this week:\n${articleSummaries.join("\n")}`;

  return callClaude(systemPrompt, userMessage);
}
