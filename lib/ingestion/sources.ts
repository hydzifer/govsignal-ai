export const TIER1_SOURCES = [
  // --- EU AI Act (4 sources) ---
  {
    name: "EU AI Office",
    url: "https://digital-strategy.ec.europa.eu/en/rss.xml",
    type: "rss" as const,
    tags: ["eu_ai_act"],
  },
  {
    name: "European Parliament - AI",
    url: "https://www.europarl.europa.eu/rss/doc/top-stories/en.xml",
    type: "rss" as const,
    tags: ["eu_ai_act", "eu_legislation"],
  },
  {
    name: "EUR-Lex - EU Legislation",
    url: "https://eur-lex.europa.eu/EN/display-feed.rss?rssId=162",
    type: "rss" as const,
    tags: ["eu_ai_act", "eu_legislation"],
  },
  {
    name: "EDPB - European Data Protection Board",
    url: "https://www.edpb.europa.eu/feed/news_en",
    type: "rss" as const,
    tags: ["eu_ai_act", "data_protection"],
  },

  // --- US Federal AI (5 sources) ---
  {
    name: "NIST News",
    url: "https://www.nist.gov/news-events/news/rss.xml",
    type: "rss" as const,
    tags: ["us_federal_ai", "standards"],
  },
  {
    name: "NIST Cybersecurity Insights",
    url: "https://www.nist.gov/blogs/cybersecurity-insights/rss.xml",
    type: "rss" as const,
    tags: ["us_federal_ai", "ai_security"],
  },
  {
    name: "Federal Register: FTC",
    url: "https://www.federalregister.gov/api/v1/documents.rss?conditions%5Bagencies%5D%5B%5D=federal-trade-commission",
    type: "rss" as const,
    tags: ["us_federal_ai", "consumer_protection"],
  },
  {
    name: "White House - Presidential Actions",
    url: "https://www.whitehouse.gov/presidential-actions/feed/",
    type: "rss" as const,
    tags: ["us_federal_ai", "executive_orders"],
  },
  {
    name: "Federal Register: FDA AI & Digital Health",
    url: "https://www.federalregister.gov/api/v1/documents.rss?conditions%5Bagencies%5D%5B%5D=food-and-drug-administration&conditions%5Bterm%5D=artificial+intelligence+OR+digital+health+OR+software+medical+device",
    type: "rss" as const,
    tags: ["us_federal_ai", "healthcare_ai"],
  },

  // --- GPAI / International (2 sources) ---
  {
    name: "AI Now Institute",
    url: "https://ainowinstitute.org/feed",
    type: "rss" as const,
    tags: ["gpai", "international"],
  },
  {
    name: "UN News - SDGs & AI Governance",
    url: "https://news.un.org/feed/subscribe/en/news/topic/sdgs/feed/rss.xml",
    type: "rss" as const,
    tags: ["gpai", "ai_ethics"],
  },

  // --- Chips / Infrastructure (3 sources) ---
  {
    name: "Federal Register: BIS Export Controls",
    url: "https://www.federalregister.gov/api/v1/documents.rss?conditions%5Bagencies%5D%5B%5D=industry-and-security-bureau&conditions%5Btype%5D%5B%5D=RULE&conditions%5Btype%5D%5B%5D=PRORULE&conditions%5Btype%5D%5B%5D=NOTICE",
    type: "rss" as const,
    tags: ["chips_act", "export_controls"],
  },
  {
    name: "European Chips Act - EC",
    url: "https://ec.europa.eu/commission/presscorner/api/rss",
    type: "rss" as const,
    tags: ["chips_act", "eu_infrastructure"],
  },
  {
    name: "DARPA News",
    url: "https://www.darpa.mil/rss.xml",
    type: "rss" as const,
    tags: ["infrastructure", "defense_ai"],
  },

  // --- Standards & Compliance (2 sources) ---
  {
    name: "NIST IT Standards & News",
    url: "https://www.nist.gov/news-events/information%20technology/rss.xml",
    type: "rss" as const,
    tags: ["standards", "compliance"],
  },
  {
    name: "CSET Georgetown - AI Policy",
    url: "https://cset.georgetown.edu/feed/",
    type: "rss" as const,
    tags: ["research", "us_federal_ai", "policy_analysis"],
  },
];
