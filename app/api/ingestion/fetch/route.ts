import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { parseAllSources } from "@/lib/ingestion/rss-parser";
import { classifyArticle, generateImpactNote } from "@/lib/claude";
import { TIER1_SOURCES } from "@/lib/ingestion/sources";
import { Source } from "@/types/database";
import { IngestionResult } from "@/types/ingestion";

export const dynamic = "force-dynamic";

const CLASSIFY_DELAY_MS = 500;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function seedSourcesIfEmpty(): Promise<Source[]> {
  const { data: existing } = await supabaseServer
    .from("sources")
    .select("*")
    .eq("active", true);

  if (existing && existing.length > 0) {
    return existing as Source[];
  }

  // Seed from TIER1_SOURCES
  const toInsert = TIER1_SOURCES.map((s) => ({
    name: s.name,
    url: s.url,
    source_type: s.type,
    active: true,
  }));

  const { data: inserted, error } = await supabaseServer
    .from("sources")
    .insert(toInsert)
    .select();

  if (error) {
    throw new Error(`Failed to seed sources: ${error.message}`);
  }

  return (inserted || []) as Source[];
}

export async function GET() {
  const result: IngestionResult = { fetched: 0, classified: 0, errors: [] };
  const classifiedArticleIds: string[] = [];

  try {
    // 1. Fetch active sources from Supabase (seed if empty)
    const sources = await seedSourcesIfEmpty();

    if (sources.length === 0) {
      return NextResponse.json(
        { error: "No active sources found" },
        { status: 404 }
      );
    }

    // 2. Parse all RSS feeds in parallel
    const { articles: parsedArticles, errors: parseErrors } =
      await parseAllSources(sources as Source[]);
    result.errors.push(...parseErrors);

    // 3. Process each article
    for (const article of parsedArticles) {
      try {
        // Check URL uniqueness
        const { data: existing } = await supabaseServer
          .from("articles")
          .select("id")
          .eq("url", article.url)
          .limit(1);

        if (existing && existing.length > 0) {
          continue; // Skip duplicate
        }

        // Insert raw article
        const { data: inserted, error: insertError } = await supabaseServer
          .from("articles")
          .insert({
            source_id: article.source_id,
            title: article.title,
            url: article.url,
            published_at: article.published_at,
            raw_content: article.raw_content,
          })
          .select()
          .single();

        if (insertError) {
          result.errors.push(
            `Insert failed for "${article.title}": ${insertError.message}`
          );
          continue;
        }

        result.fetched++;

        // Classify with Claude API
        try {
          const classification = await classifyArticle({
            title: article.title,
            content: article.raw_content || "",
            url: article.url,
          });

          const impactNote = await generateImpactNote(inserted, classification);

          // Update article with classifications
          const { error: updateError } = await supabaseServer
            .from("articles")
            .update({
              topics: classification.topics,
              product_categories: classification.product_categories,
              impact_level: classification.impact_level,
              impact_note: impactNote,
              updated_at: new Date().toISOString(),
            })
            .eq("id", inserted.id);

          if (updateError) {
            result.errors.push(
              `Classification update failed for "${article.title}": ${updateError.message}`
            );
          } else {
            result.classified++;
            classifiedArticleIds.push(inserted.id);
          }

          // Rate limiting
          await sleep(CLASSIFY_DELAY_MS);
        } catch (classifyError) {
          const msg =
            classifyError instanceof Error
              ? classifyError.message
              : String(classifyError);
          result.errors.push(
            `Classification failed for "${article.title}": ${msg}`
          );
        }
      } catch (articleError) {
        const msg =
          articleError instanceof Error
            ? articleError.message
            : String(articleError);
        result.errors.push(`Processing failed: ${msg}`);
      }
    }

    // 4. Classify any previously unclassified articles
    const { data: unclassified } = await supabaseServer
      .from("articles")
      .select("id, title, url, raw_content")
      .is("impact_level", null)
      .order("published_at", { ascending: false })
      .limit(20);

    if (unclassified && unclassified.length > 0) {
      for (const article of unclassified) {
        try {
          const classification = await classifyArticle({
            title: article.title,
            content: article.raw_content || "",
            url: article.url,
          });

          const impactNote = await generateImpactNote(
            article as any,
            classification
          );

          const { error: updateError } = await supabaseServer
            .from("articles")
            .update({
              topics: classification.topics,
              product_categories: classification.product_categories,
              impact_level: classification.impact_level,
              impact_note: impactNote,
              updated_at: new Date().toISOString(),
            })
            .eq("id", article.id);

          if (!updateError) {
            result.classified++;
            classifiedArticleIds.push(article.id);
          } else {
            result.errors.push(
              `Backfill update failed for "${article.title}": ${updateError.message}`
            );
          }

          await sleep(CLASSIFY_DELAY_MS);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          result.errors.push(
            `Backfill classification failed for "${article.title}": ${msg}`
          );
        }
      }
    }

    // 5. Update last_fetched timestamp on sources
    await supabaseServer
      .from("sources")
      .update({ last_fetched: new Date().toISOString() })
      .eq("active", true);

    // 6. Fire-and-forget: trigger watchlist alerts for new articles
    if (classifiedArticleIds.length > 0) {
      const appUrl = getAppUrl();
      fetch(`${appUrl}/api/email/send-alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleIds: classifiedArticleIds }),
      }).catch((err) => {
        console.error("[Ingestion] Failed to trigger alerts:", err);
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Ingestion pipeline failed", details: msg },
      { status: 500 }
    );
  }
}
import { getAppUrl } from "@/lib/env";
