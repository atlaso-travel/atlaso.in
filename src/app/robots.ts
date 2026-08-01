import { MetadataRoute } from "next";

/**
 * AI crawlers are named explicitly rather than left to the `*` wildcard.
 *
 * The wildcard already permits them, so this changes nothing technically — but
 * for a comparison site whose growth depends on being the source an answer
 * engine cites, "yes" should be a recorded decision rather than a default nobody
 * chose. It also documents the position for whoever edits this file next.
 *
 * The distinction worth knowing:
 *   GPTBot, ClaudeBot, PerplexityBot, CCBot  — fetch pages to answer questions
 *                                              and to train. Allowing them is
 *                                              how we get cited.
 *   Google-Extended                          — does NOT affect Search ranking or
 *                                              indexing at all. It only controls
 *                                              Gemini and AI Overviews grounding.
 *                                              Disallowing it would remove us
 *                                              from AI Overviews while changing
 *                                              nothing in blue-link results.
 *
 * Private surfaces stay blocked for every agent, named or not.
 */

const DISALLOW = [
  "/api/",
  "/_next/",
  // Parameterised or personal customer surfaces — no unique content to index.
  "/search?",
  "/compare?",
  "/book/",
  "/booking/",
  "/saved",
  "/comparisons",
  // Internal.
  "/operator",
  "/admin",
];

/**
 * Named AI agents. `/compare/` (the programmatic, server-rendered comparison
 * pages) is deliberately NOT in the disallow list — those pages are the most
 * citable thing on the site.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/"], disallow: DISALLOW },
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: ["/"],
        disallow: DISALLOW,
      })),
    ],
    sitemap: "https://www.atlaso.in/sitemap.xml",
    host: "https://www.atlaso.in",
  };
}
