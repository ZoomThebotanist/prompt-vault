import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

const CREATOR_ID = "seed-creator-001";
const CREATOR_EMAIL = "prompts@promptvault.dev";

const PROMPTS = [
  // ── Developer Tools ────────────────────────────────────────────────────────
  {
    slug: "senior-code-reviewer",
    title: "Senior Code Reviewer — Full Stack",
    subtitle: "Get 10x better PR reviews in seconds",
    description: "Acts as a seasoned senior engineer reviewing your code for bugs, security flaws, performance issues, and style violations. Returns structured feedback with severity levels.",
    longDescription: `This prompt transforms any LLM into a rigorous senior engineer who reviews code the way top companies actually do it — not just syntax, but architecture, security, edge cases, and maintainability.\n\nWhat you get:\n- Severity-ranked findings (Critical / High / Medium / Low)\n- Exact line references and explanations\n- Suggested rewrites for each issue\n- Security vulnerability scan (OWASP Top 10)\n- Performance bottleneck identification\n\nWorks with: TypeScript, Python, Go, Rust, Java, C#, Ruby, PHP, and more.`,
    category: "developer-tools",
    pricingType: "paid",
    priceCents: 1499,
    difficulty: "intermediate",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-pro"],
    useCases: ["Code review", "PR feedback", "Security audit", "Refactoring"],
    industries: ["Software", "Fintech", "SaaS"],
    estimatedTimeSavedMinutes: 45,
    previewContent: `You are a senior software engineer with 12+ years of experience conducting code reviews at companies like Google, Stripe, and Airbnb.\n\nReview the following code and return a structured report with this exact format:\n\n## Code Review Report\n\n### Critical Issues (Fix Before Merge)\n[Issues that could cause data loss, security breaches, or production outages]\n\n### High Priority\n[Significant bugs, performance problems, or bad patterns]\n\n...`,
    fullContent: `You are a senior software engineer with 12+ years of experience conducting code reviews at companies like Google, Stripe, and Airbnb. You have deep expertise in security vulnerabilities, performance optimization, and clean architecture.\n\nReview the following code and return a structured report:\n\n## Code Review Report\n\n**Language/Framework:** [detected automatically]\n**Overall Grade:** [A/B/C/D/F]\n**Summary:** [2-3 sentence executive summary]\n\n---\n\n### 🔴 Critical Issues (Fix Before Merge)\nFor each issue:\n- **Location:** file.ts:line\n- **Problem:** [clear description]\n- **Why it matters:** [impact if not fixed]\n- **Fix:**\n\`\`\`\n[corrected code]\n\`\`\`\n\n### 🟠 High Priority\n[Same format]\n\n### 🟡 Medium Priority  \n[Same format]\n\n### 🟢 Low / Style\n[Same format]\n\n---\n\n### Security Scan (OWASP Top 10)\n- SQL Injection: [safe/vulnerable]\n- XSS: [safe/vulnerable]\n- Auth issues: [safe/vulnerable]\n- Sensitive data exposure: [safe/vulnerable]\n- Other: [any findings]\n\n### Performance\n- Time complexity concerns: [findings]\n- Memory issues: [findings]\n- Database query efficiency: [findings]\n\n### Positive Notes\n[What was done well — always include this section]\n\n---\nNow review this code:\n\n[PASTE CODE HERE]`,
    seoTitle: "Senior Code Reviewer Prompt — AI Code Review",
    seoDescription: "Get expert-level code reviews with severity rankings, security scans, and line-by-line fixes.",
    seoKeywords: ["code review prompt", "AI code reviewer", "PR review", "security audit prompt"],
  },
  {
    slug: "regex-master",
    title: "Regex Master — Build Any Pattern Instantly",
    subtitle: "Never struggle with regex again",
    description: "Describe what you need in plain English and get a precise regex pattern with full explanation, test cases, and common edge cases covered.",
    longDescription: `Stop spending 30 minutes on regex101. This prompt takes your plain-English description and produces:\n\n- The exact regex pattern for your use case\n- Step-by-step breakdown of every part\n- Language-specific versions (JS, Python, Go, PCRE, etc.)\n- 5 test cases (passing + failing)\n- Common edge cases and how the pattern handles them\n- Alternative approaches if multiple valid patterns exist\n\nPerfect for: form validation, log parsing, data extraction, URL matching, and more.`,
    category: "developer-tools",
    pricingType: "free",
    priceCents: 0,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-flash"],
    useCases: ["Form validation", "Log parsing", "Data extraction", "String matching"],
    industries: ["Software", "Data Engineering", "DevOps"],
    estimatedTimeSavedMinutes: 20,
    previewContent: `You are a regex expert. I will describe what I want to match in plain English and you will:\n1. Provide the regex pattern\n2. Explain each part\n3. Give language-specific versions\n4. Show 5 test cases\n\nMy requirement: [DESCRIBE WHAT YOU NEED TO MATCH]`,
    fullContent: `You are a regex expert with deep knowledge of PCRE, JavaScript, Python, Go, and Java regex flavors.\n\nWhen I describe what I need to match, respond with:\n\n## Regex Pattern\n\`\`\`\n[PATTERN]\n\`\`\`\n\n## How it works — step by step\n| Part | Meaning |\n|------|----------|\n| [each token] | [explanation] |\n\n## Language-specific versions\n\`\`\`javascript\n// JavaScript\nconst regex = /PATTERN/flags;\n\`\`\`\n\`\`\`python\n# Python\nimport re\npattern = re.compile(r'PATTERN')\n\`\`\`\n\`\`\`go\n// Go\nregex := regexp.MustCompile(\`PATTERN\`)\n\`\`\`\n\n## Test cases\n| Input | Match? | Captured groups |\n|-------|--------|------------------|\n| [example] | ✅/❌ | [groups] |\n[5 rows: 3 passing, 2 failing edge cases]\n\n## Edge cases handled\n- [edge case 1]\n- [edge case 2]\n- [edge case 3]\n\n## Alternative approaches\n[If there are other valid patterns, explain the tradeoffs]\n\n---\nMy requirement: [DESCRIBE WHAT YOU NEED TO MATCH]`,
    seoTitle: "Regex Generator Prompt — Instant Regex Patterns",
    seoDescription: "Describe in English, get perfect regex with explanations and test cases.",
    seoKeywords: ["regex prompt", "regex generator", "regex builder AI"],
  },
  {
    slug: "api-documentation-writer",
    title: "API Documentation Writer — OpenAPI + Markdown",
    subtitle: "Turn messy endpoints into clean docs",
    description: "Paste your API routes, functions, or code and get polished developer documentation with examples, error codes, authentication notes, and OpenAPI snippets.",
    longDescription: `Good API docs are the difference between developers adopting your product or abandoning it. This prompt writes documentation that developers actually want to read.\n\nGive it:\n- Raw route definitions\n- Function signatures\n- Database schemas\n- Or just a description of what your API does\n\nGet back:\n- Endpoint reference with full parameter tables\n- Request/response examples with real JSON\n- Error code documentation\n- Authentication sections\n- Code samples in curl, JavaScript, Python, and Go\n- OpenAPI 3.0 YAML snippet`,
    category: "developer-tools",
    pricingType: "paid",
    priceCents: 999,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["API docs", "Developer experience", "OpenAPI", "README"],
    industries: ["Software", "SaaS", "Platform"],
    estimatedTimeSavedMinutes: 60,
    previewContent: `You are a technical writer specializing in developer documentation. Convert the following API definition into polished, complete documentation.\n\nInclude: endpoint table, parameters, request/response examples, error codes, and code samples in curl, JS, and Python.\n\n[PASTE YOUR API ROUTES/CODE HERE]`,
    fullContent: `You are a senior technical writer specializing in developer documentation for companies like Stripe, Twilio, and Vercel. Your docs are clear, complete, and make developers love the product.\n\nConvert the following API definition into polished documentation:\n\n# [API Name] Reference\n\n## Overview\n[Brief description of what this API does]\n\n## Authentication\n[Authentication method with examples]\n\n## Base URL\n\`\`\`\nhttps://api.example.com/v1\n\`\`\`\n\n---\n\n## Endpoints\n\nFor each endpoint provide:\n\n### [METHOD] /endpoint/path\n[One-line description]\n\n**Parameters**\n| Name | Type | Required | Description |\n|------|------|----------|-------------|\n| param | string | Yes | Description |\n\n**Request Example**\n\`\`\`bash\ncurl -X POST https://api.example.com/v1/endpoint \\\n  -H "Authorization: Bearer {token}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"key": "value"}'\n\`\`\`\n\n\`\`\`javascript\n// JavaScript\nconst response = await fetch('...');\n\`\`\`\n\n\`\`\`python\n# Python\nimport requests\nresponse = requests.post('...')\n\`\`\`\n\n**Response**\n\`\`\`json\n{\n  "id": "...",\n  "status": "success"\n}\n\`\`\`\n\n**Error Codes**\n| Code | Meaning |\n|------|---------|\n| 400 | Bad request — [specific reason] |\n| 401 | Unauthorized |\n| 404 | Resource not found |\n\n---\n\n## OpenAPI 3.0 Snippet\n\`\`\`yaml\n[YAML for this endpoint]\n\`\`\`\n\n---\nNow document this API:\n\n[PASTE YOUR API ROUTES/CODE HERE]`,
    seoTitle: "API Documentation Writer Prompt — OpenAPI + Markdown",
    seoDescription: "Paste your API routes and get polished developer docs with examples, error codes, and OpenAPI YAML.",
    seoKeywords: ["API documentation prompt", "OpenAPI generator", "developer docs AI"],
  },

  // ── Marketing ──────────────────────────────────────────────────────────────
  {
    slug: "cold-email-sequence-writer",
    title: "Cold Email Sequence — 5-Touch Sales Cadence",
    subtitle: "Outbound emails that actually get replies",
    description: "Write a complete 5-email cold outreach sequence for any product or service. Each email has a different angle: value, social proof, pain point, case study, and breakup.",
    longDescription: `Most cold emails fail because they sound like cold emails. This prompt writes sequences that feel like they came from a real person who did their homework.\n\nYou get a complete 5-touch cadence:\n1. **Email 1:** The value hook (day 1)\n2. **Email 2:** Social proof + specific result (day 3)\n3. **Email 3:** Pain point + agitation (day 7)\n4. **Email 4:** Mini case study (day 12)\n5. **Email 5:** Breakup email (day 18)\n\nEach email includes subject line variants (A/B tested), call to action, and send timing. Fill in your product, ICP, and value prop — get back a sequence ready to drop into your outbound tool.`,
    category: "marketing",
    pricingType: "paid",
    priceCents: 1999,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-pro"],
    useCases: ["Cold outreach", "B2B sales", "Lead generation", "Email marketing"],
    industries: ["SaaS", "Agency", "Consulting", "B2B"],
    estimatedTimeSavedMinutes: 90,
    previewContent: `You are an expert B2B copywriter specializing in cold email outreach. Write a 5-touch email sequence for the following:\n\nProduct/Service: [WHAT YOU SELL]\nIdeal Customer: [YOUR ICP]\nMain Value Prop: [CORE BENEFIT]\nCompany Name: [YOUR COMPANY]\n\nFor each email provide: subject line (+ A/B variant), body, CTA, and recommended send day.`,
    fullContent: `You are a world-class B2B copywriter who has written cold email sequences for $10M+ ARR SaaS companies, agencies, and consultants. Your emails get 40%+ open rates and 8%+ reply rates.\n\nWrite a 5-touch cold email cadence for:\n\n**Product/Service:** [WHAT YOU SELL]\n**Ideal Customer Profile (ICP):** [DESCRIBE YOUR TARGET — role, company size, industry]\n**Main Value Proposition:** [THE #1 THING YOUR PRODUCT DOES FOR THEM]\n**Proof Point:** [A RESULT, CASE STUDY, OR CUSTOMER NAME YOU CAN USE]\n**Company Name:** [YOUR COMPANY]\n**Sender Name:** [YOUR NAME + TITLE]\n\n---\n\nDeliver exactly this structure for all 5 emails:\n\n## Email [N] — [ANGLE NAME]\n**Send day:** Day X\n**Subject line A:** [subject]\n**Subject line B:** [A/B variant]\n\n**Body:**\n[Email body — max 150 words, no buzzwords, sounds like a human]\n\n**CTA:** [Specific call to action]\n**P.S.:** [Optional PS line]\n\n---\n\nAngles to use:\n1. Email 1 (Day 1): Lead with the most compelling value statement. Short, punchy. Make them curious.\n2. Email 2 (Day 3): Social proof. Drop a specific result ("we helped [company] do X in Y days").\n3. Email 3 (Day 7): Lean into pain. Describe the problem they have without your solution.\n4. Email 4 (Day 12): Mini case study. Tell a 3-sentence story about a customer transformation.\n5. Email 5 (Day 18): Breakup email. Light, human, no pressure. Leaves door open.\n\nRules:\n- Never start with "I" or "My name is"\n- No more than 3 sentences before the CTA in emails 1-3\n- One CTA per email — never two asks\n- Zero jargon: no "synergy", "leverage", "circle back"\n- Write like a person, not a marketing bot`,
    seoTitle: "Cold Email Sequence Prompt — 5-Touch B2B Outreach",
    seoDescription: "Write a complete 5-email cold outreach cadence that gets replies. B2B sales, SaaS, agencies.",
    seoKeywords: ["cold email prompt", "sales email sequence", "B2B outreach emails", "cold outreach AI"],
  },
  {
    slug: "viral-social-content-engine",
    title: "Viral Social Content Engine — 30 Posts in One Shot",
    subtitle: "A month of content from one idea",
    description: "Turn any topic, product, or expertise into 30 ready-to-post social media pieces: hooks, threads, carousels, short videos, and engagement bait — all in your brand voice.",
    longDescription: `Content creators and marketers waste hours every week staring at blank drafts. This prompt batch-generates an entire month of content from a single input.\n\nYou provide:\n- Your topic or niche\n- Brand voice and tone\n- Target platform (Twitter/X, LinkedIn, Instagram, TikTok)\n- 1-3 content pillars\n\nYou get 30 pieces across 6 formats:\n- 10 hook-first text posts\n- 5 Twitter/X threads (with all sub-tweets)\n- 5 LinkedIn long-form posts\n- 5 carousel slide outlines\n- 3 short-form video scripts (60 seconds)\n- 2 "engagement bait" posts (questions, polls, hot takes)\n\nAll written in your voice, not generic AI slop.`,
    category: "marketing",
    pricingType: "paid",
    priceCents: 2499,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Social media", "Content calendar", "Brand building", "Creator economy"],
    industries: ["Media", "Creator", "SaaS", "E-commerce", "Agency"],
    estimatedTimeSavedMinutes: 180,
    previewContent: `You are a top-tier social media strategist. Generate 30 pieces of content for the following:\n\nNiche/Topic: [YOUR TOPIC]\nBrand Voice: [DESCRIBE YOUR TONE — e.g. "witty, direct, no fluff"]\nPlatform Focus: [Twitter/LinkedIn/Instagram/TikTok]\nContent Pillars: [YOUR 2-3 MAIN THEMES]\nGoal: [Grow followers / Drive leads / Build authority]\n\nDeliver 30 posts across the 6 formats specified below.`,
    fullContent: `You are a top-tier social media strategist who has grown accounts to 100K+ followers across Twitter, LinkedIn, and Instagram. You understand viral mechanics, platform algorithms, and what makes people actually stop scrolling.\n\nGenerate 30 pieces of content for:\n\n**Niche/Topic:** [YOUR TOPIC OR EXPERTISE]\n**Brand Voice:** [DESCRIBE YOUR TONE — e.g. "direct, slightly contrarian, no corporate speak, uses occasional humor"]\n**Platform Focus:** [PRIMARY PLATFORM — Twitter/X, LinkedIn, Instagram, or TikTok]\n**Content Pillars:** [LIST 2-3 THEMES — e.g. "productivity tips, entrepreneurship stories, tool reviews"]\n**Target Audience:** [WHO IS READING — e.g. "early-stage founders, aged 25-40"]\n**Goal:** [GROW FOLLOWERS / DRIVE LEADS / BUILD AUTHORITY / SELL PRODUCT]\n\n---\n\nDeliver all 30 pieces in this structure:\n\n## HOOK-FIRST TEXT POSTS (10 posts)\nFor each:\n**Post [N]:**\n[Hook line — must stop the scroll]\n[2-4 supporting lines]\n[Punchline or CTA]\n\n---\n\n## THREADS (5 threads, 5-8 tweets each)\nFor each thread:\n**Thread [N]: [Title]**\n1/ [Opening hook tweet]\n2/ [Point]\n...\nFinal/ [CTA + engagement question]\n\n---\n\n## LINKEDIN LONG-FORM (5 posts)\nFor each:\n**Post [N]:**\n[First line — the hook, no "I" start]\n[Body — 150-250 words, line breaks every 2-3 sentences for readability]\n[CTA or question]\n\n---\n\n## CAROUSEL OUTLINES (5 carousels)\nFor each:\n**Carousel [N]: [Title]**\nSlide 1: [Cover — hook]\nSlide 2-8: [Each slide's single main point]\nSlide 9/Last: [CTA slide]\n\n---\n\n## SHORT VIDEO SCRIPTS (3 videos, ~60 seconds)\nFor each:\n**Video [N]: [Topic]**\nHook (0-3s): [What you say in the first 3 seconds]\nBody (3-50s): [Main content as bullet points]\nCTA (50-60s): [What you ask viewers to do]\n\n---\n\n## ENGAGEMENT BAIT (2 posts)\nHot take post, controversy, or question designed for maximum comments:\n**Post 1:** [Opinion or question]\n**Post 2:** [Poll setup or debate starter]\n\n---\nRules:\n- Never use "Excited to share", "I'm thrilled", or any corporate opener\n- Every hook must be completable in under 8 words\n- Write as [BRAND VOICE] throughout — no generic AI tone\n- Vary content types — don't make all 30 the same structure`,
    seoTitle: "30-Day Social Media Content Generator Prompt",
    seoDescription: "Generate a full month of viral social posts, threads, carousels, and video scripts from one prompt.",
    seoKeywords: ["social media content prompt", "content calendar AI", "viral post generator", "30 days of content"],
  },

  // ── Writing ────────────────────────────────────────────────────────────────
  {
    slug: "ghostwriter-long-form",
    title: "Ghostwriter — Long-Form Articles & Essays",
    subtitle: "Write like an expert, even when you're not",
    description: "Produce polished 1,500–3,000 word articles, essays, or blog posts on any topic. Captures your voice, cites research naturally, and structures for maximum readability and SEO.",
    longDescription: `This isn't a "write me a blog post" prompt. This is a professional ghostwriting system that produces the quality you'd pay $500+ for a human writer to deliver.\n\nIt handles:\n- Voice matching (you provide 2-3 sample sentences, it mirrors your style)\n- Research integration (give it bullet points, it weaves them in naturally)\n- SEO structuring (H2/H3 hierarchy, keyword density, meta description)\n- Readability scoring (targets Flesch-Kincaid 60+ for broad appeal)\n- Narrative arc (problem → insight → solution → action)\n\nWorks for: newsletters, Medium articles, blog posts, LinkedIn essays, thought leadership pieces, and op-eds.`,
    category: "writing",
    pricingType: "paid",
    priceCents: 1799,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Blog writing", "Newsletter", "Thought leadership", "SEO content"],
    industries: ["Media", "SaaS", "Consulting", "Creator"],
    estimatedTimeSavedMinutes: 120,
    previewContent: `You are a professional ghostwriter. Write a [LENGTH]-word [FORMAT] on the following:\n\nTopic: [YOUR TOPIC]\nTarget Reader: [WHO IS THIS FOR]\nVoice Samples: [PASTE 2-3 SENTENCES YOU'VE WRITTEN]\nKey Points to Cover: [YOUR MAIN ARGUMENTS OR RESEARCH]\nTone: [Professional / Conversational / Academic / Opinionated]\nGoal: [Educate / Persuade / Entertain / Drive CTA]`,
    fullContent: `You are a professional ghostwriter who has written for Inc., Forbes, TechCrunch, and top Substack newsletters. You produce articles that sound authentically human, capture the author's voice exactly, and rank on Google.\n\nWrite a [LENGTH: 1500/2000/2500/3000]-word [FORMAT: blog post/newsletter/essay/LinkedIn article] with these specs:\n\n**Topic:** [YOUR TOPIC]\n**Target Reader:** [WHO — e.g. "B2B marketers at companies with 10-100 employees"]\n**Author's Voice Samples:** [PASTE 2-3 SENTENCES THE AUTHOR HAS WRITTEN — even from texts or emails is fine]\n**Key Points to Cover:** [BULLET LIST OF YOUR MAIN IDEAS, ARGUMENTS, OR RESEARCH FINDINGS]\n**Primary Keyword (for SEO):** [KEYWORD or "none"]\n**Tone:** [Professional / Conversational / Slightly Academic / Direct and Opinionated]\n**Goal:** [Educate / Build authority / Persuade / Drive newsletter signups / Sell product]\n**CTA at the end:** [WHAT YOU WANT READERS TO DO]\n\n---\n\nDeliver the article in this structure:\n\n**[HEADLINE]** (make it specific and curiosity-driven, not generic)\n\n**[SUBHEADLINE]** (optional — amplifies the headline)\n\n[OPENING — The hook. First paragraph must be 2-3 sentences max. Create tension or make a bold claim.]\n\n[SECTION 1: H2]\n[3-4 paragraphs. Each paragraph max 4 sentences.]\n\n[SECTION 2: H2]\n...\n\n[SECTION 3: H2 — Include a real-feeling anecdote, data point, or mini case study here]\n...\n\n[CONCLUSION — Bring back the opening tension. Resolve it. End on insight, not summary.]\n\n[CTA — Natural, not pushy]\n\n---\n\nRules:\n- Mirror the author's voice from their samples — same sentence rhythm, word choice, formality level\n- Never use "In conclusion", "As we've seen", or "It's important to note"\n- Vary sentence length intentionally — short punchy sentences after long ones\n- No passive voice unless it's stylistically intentional\n- Every H2 should be something the reader wants to click on, not just a label`,
    seoTitle: "Ghostwriter Prompt — Long-Form Articles & Blog Posts",
    seoDescription: "Write polished 1,500–3,000 word articles that sound like you. Voice-matched, SEO-structured, editorial quality.",
    seoKeywords: ["ghostwriter prompt", "blog writing AI", "long form content prompt", "article writer AI"],
  },

  // ── Game Dev ───────────────────────────────────────────────────────────────
  {
    slug: "game-design-document-generator",
    title: "Game Design Document (GDD) Generator",
    subtitle: "Go from idea to full GDD in one session",
    description: "Transform your game idea into a structured Game Design Document covering core loop, mechanics, progression, monetization, art direction, and technical scope. Built for indie devs.",
    longDescription: `A solid GDD is the foundation of every successful game. This prompt generates a complete, professional GDD from just a high-level concept.\n\nYou get a full document covering:\n- **Core Loop** — what players do every 30 seconds, 5 minutes, and 1 hour\n- **Mechanics** — all game systems explained with interaction diagrams\n- **Progression** — XP curves, unlocks, skill trees, or level structure\n- **Monetization** — F2P vs premium model, IAP strategy, battle pass structure\n- **Art Direction** — visual style, color palette, UI/UX tone\n- **Technical Scope** — engine recommendation, platform targets, team size estimate\n- **MVP vs Stretch Goals** — what to ship vs what to cut\n\nBuilt for Godot, Unity, Unreal, and custom engine indie projects.`,
    category: "game-dev",
    pricingType: "paid",
    priceCents: 2999,
    difficulty: "intermediate",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Game design", "GDD", "Indie dev", "Game planning"],
    industries: ["Gaming", "Indie", "Mobile"],
    estimatedTimeSavedMinutes: 240,
    previewContent: `You are a senior game designer. Generate a complete Game Design Document for:\n\nGame Concept: [YOUR IDEA — 1-3 sentences]\nGenre: [e.g. "roguelike", "city builder", "platformer"]\nTarget Platform: [Mobile / PC / Console / Web]\nTarget Audience: [Casual / Core / Hardcore, age range]\nMonetization: [F2P / Premium / Early Access]\nTeam Size: [Solo / 2-5 / 5-10]\nTimeline: [Jam / 3 months / 1 year / 2 years]`,
    fullContent: `You are a senior game designer with credits at Supercell, Riot Games, and several successful indie studios. You have shipped games across mobile, PC, and console with millions of players.\n\nGenerate a complete Game Design Document (GDD) for:\n\n**Game Concept:** [YOUR IDEA — describe in 1-3 sentences]\n**Working Title:** [GAME NAME or "TBD"]\n**Genre:** [e.g. roguelike deckbuilder, city builder, metroidvania, idle RPG]\n**Inspiration / Comps:** [2-3 games this is "X meets Y" — e.g. "Hades meets Into the Breach"]\n**Target Platform:** [Mobile / PC Steam / Console / Browser]\n**Target Audience:** [e.g. "core gamers 18-35 who loved Hades and Slay the Spire"]\n**Monetization Model:** [Premium $X / Free-to-Play / Early Access / Subscription]\n**Team Size:** [Solo dev / 2-5 person indie / 5-10 person studio]\n**Target Timeline:** [Game Jam / 3 months MVP / 1 year / 2 years]\n\n---\n\nDeliver a GDD with all of these sections:\n\n# [GAME TITLE] — Game Design Document\n**Version:** 0.1 | **Date:** [today]\n\n## 1. Executive Summary\n[3-5 sentences: what is this game, who is it for, what makes it special, and what's the business case]\n\n## 2. Core Pillars\n[3 design pillars — the non-negotiable things this game must feel like. E.g. "Every run feels different", "Death has weight", "Mastery is visible"]\n\n## 3. Core Loop\n### Second-to-second (30 seconds)\n[What the player is doing at the most granular level]\n\n### Minute-to-minute (5 minutes)\n[Medium-term loop — a single encounter, level, or decision cycle]\n\n### Session (30-60 minutes)\n[What a full session arc looks like — start, middle, end state]\n\n### Long-term (days/weeks)\n[Retention hooks — what brings them back]\n\n## 4. Game Mechanics\n[For each core mechanic:]\n### [Mechanic Name]\n- **What it is:** [1 sentence]\n- **How it works:** [step-by-step]\n- **Why it's fun:** [design intent]\n- **Edge cases:** [what happens in weird situations]\n\n## 5. Progression Systems\n[XP curves, unlock trees, or level structure]\n[Include a rough curve: when does the player feel powerful? When do they hit walls?]\n\n## 6. Content Plan\n- Enemies/Factions: [list with brief descriptions]\n- Levels/Biomes: [list]\n- Items/Abilities: [key items, how many total]\n- Story beats: [if applicable]\n\n## 7. Monetization Strategy\n[Detailed breakdown based on chosen model]\n[For F2P: what's free, what's paid, battle pass structure, IAP price points]\n[For Premium: price point justification, DLC roadmap]\n\n## 8. Art Direction\n- **Visual Style:** [2D pixel / 3D low-poly / hand-drawn / realistic / etc.]\n- **Color Palette:** [mood and palette description]\n- **UI/UX Tone:** [minimal / detailed / stylized]\n- **Art References:** [name 2-3 games or art styles to reference]\n- **Asset scope:** [rough count of sprites/models needed]\n\n## 9. Audio Direction\n- **Music style:** [genre, mood, adaptive vs static]\n- **SFX approach:** [realistic / stylized / minimal]\n- **Budget estimate:** [in-house / licensed / commissioned]\n\n## 10. Technical Architecture\n- **Recommended Engine:** [Godot / Unity / Unreal / Custom — with reasoning]\n- **Platform targets:** [primary + stretch]\n- **Key technical challenges:** [top 3 hardest things to build]\n- **Third-party tools:** [physics engine, analytics, cloud saves, etc.]\n\n## 11. MVP Scope\n**Must Ship:**\n[Minimum viable feature set — what you absolutely need for a playable demo]\n\n**Cut for MVP:**\n[Nice-to-have features that come later]\n\n**Stretch Goals:**\n[Post-launch additions if it succeeds]\n\n## 12. Team & Timeline\n**Roles needed:** [list]\n**Milestone plan:**\n- Month 1: [deliverable]\n- Month 2: [deliverable]\n- [etc.]\n\n## 13. Risk Assessment\n| Risk | Likelihood | Impact | Mitigation |\n|------|-----------|--------|------------|\n| [risk] | High/Med/Low | High/Med/Low | [how to handle] |\n\n## 14. Success Metrics\n[How will you know if this game succeeded? Define KPIs: downloads, revenue, reviews, playtime, retention]`,
    seoTitle: "Game Design Document Generator Prompt — Full GDD",
    seoDescription: "Generate a complete Game Design Document from your idea: core loop, mechanics, monetization, art direction, and scope.",
    seoKeywords: ["game design document prompt", "GDD generator AI", "indie game design", "game design AI"],
  },

  // ── Business ───────────────────────────────────────────────────────────────
  {
    slug: "investor-pitch-deck-writer",
    title: "Investor Pitch Deck — Slide-by-Slide Script",
    subtitle: "Write your raise story the way VCs want to hear it",
    description: "Generate a complete 12-slide investor pitch deck narrative: problem, solution, market size, traction, business model, team, ask — written in the language VCs respond to.",
    longDescription: `Most founders lose investors in the first 3 slides because they lead with solution instead of problem, or bury their traction, or don't show they understand the market.\n\nThis prompt reverse-engineers how top VCs evaluate deals and writes your story in the exact structure that works: Sequoia's narrative arc meets YC's conciseness.\n\nYou get:\n- Full speaker notes for all 12 slides\n- Data suggestions (where to put numbers for maximum impact)\n- Common objection responses baked in\n- "Why now" narrative that creates urgency\n- Ask slide with use of funds table\n- The 3-sentence elevator pitch\n\nFor seed, Series A, and Angel rounds.`,
    category: "business",
    pricingType: "paid",
    priceCents: 3999,
    difficulty: "intermediate",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Fundraising", "Pitch deck", "Investor relations", "Startup"],
    industries: ["Startup", "Venture", "SaaS", "Fintech"],
    estimatedTimeSavedMinutes: 300,
    previewContent: `You are a startup pitch coach who has helped raise $500M+. Write a complete 12-slide pitch deck script for:\n\nCompany: [NAME]\nOne-liner: [WHAT YOU DO IN ONE SENTENCE]\nProblem: [THE PAIN YOU SOLVE]\nSolution: [YOUR PRODUCT]\nTraction: [YOUR BEST METRIC]\nMarket: [TAM]\nStage: [Pre-seed / Seed / Series A]\nAsk: [$AMOUNT for X% equity]`,
    fullContent: `You are a startup pitch coach who has helped companies raise over $500M from Sequoia, a16z, YC, and leading angels. You know exactly what investors look for and what makes them swipe left.\n\nWrite a complete 12-slide pitch deck script for:\n\n**Company Name:** [NAME]\n**One-liner:** [WHAT YOU DO IN ONE SENTENCE — format: "We help [WHO] do [WHAT] so they can [OUTCOME]"]\n**Problem:** [THE PAINFUL PROBLEM YOU SOLVE — be specific, not generic]\n**Solution:** [YOUR PRODUCT — what it does, how it works]\n**Why Now:** [WHY IS THIS THE RIGHT MOMENT — regulatory shift, technology unlock, behavior change]\n**Traction:** [YOUR BEST METRICS — revenue, users, growth rate, notable customers]\n**Market:** [TAM / SAM / SOM — include the number even if rough]\n**Business Model:** [HOW YOU MAKE MONEY — pricing, margins, unit economics]\n**Competition:** [WHO ELSE IS IN THIS SPACE]\n**Team:** [FOUNDERS — names, relevant background, why you]\n**Stage:** [Pre-seed / Seed / Series A]\n**Ask:** [$AMOUNT for X% equity or at $Y valuation]\n**Use of Funds:** [HOW YOU'LL SPEND IT — e.g. "60% engineering, 25% sales, 15% ops"]\n\n---\n\nDeliver the complete pitch deck script:\n\n# [COMPANY NAME] — Investor Pitch\n\n## Slide 1: Title\n**Headline:** [Company name + one-liner]\n**Visual suggestion:** [What image/visual would work here]\n**Speaker note:** [What to say — 3-5 sentences max]\n\n## Slide 2: The Problem\n**Headline:** [Make it feel urgent and real]\n**3 key points:**\n- [Point 1 — with a data point]\n- [Point 2 — with an example or story]\n- [Point 3 — the emotional hook]\n**Speaker note:** [Open with a story or stat that makes the investor feel the pain]\n\n## Slide 3: The Solution\n**Headline:** [Not "Introducing X" — make it outcome-focused]\n**Demo/product description:**\n**Speaker note:** [Show don't tell — describe what investors should see on this slide]\n\n## Slide 4: Why Now\n**Headline:** [The timing thesis]\n**3 tailwinds:**\n- [Technology unlock]\n- [Regulatory/market shift]\n- [Behavior change]\n**Speaker note:** [This is the most underrated slide — nail the urgency]\n\n## Slide 5: Market Size\n**Headline:**\n**TAM:** $[X]B — [how you calculated it]\n**SAM:** $[X]B\n**SOM (5-year):** $[X]B\n**Speaker note:** [Bottom-up market sizing is more credible than top-down]\n\n## Slide 6: Business Model\n**Pricing:** [How you charge]\n**Unit economics:**\n- CAC: $[X]\n- LTV: $[X]\n- LTV:CAC: [X]x\n- Payback period: [X] months\n**Speaker note:**\n\n## Slide 7: Traction\n**Headline:** [Your strongest metric as the headline]\n**Key metrics grid:**\n- [Metric 1]\n- [Metric 2]\n- [Metric 3]\n- [Metric 4]\n**Speaker note:** [Lead with the hockey stick. If you have logos, name them. If you have revenue, show the chart.]\n\n## Slide 8: Product\n**Screenshot or demo description:**\n**Key differentiating features:**\n**Speaker note:**\n\n## Slide 9: Competition\n**2x2 matrix or feature table:**\n[Show how you're differentiated — never say "no competition"]\n**Speaker note:** [Acknowledge the real competitors. Show your moat.]\n\n## Slide 10: Go-to-Market\n**Channel strategy:**\n**First 100 customers — how you got them:**\n**Scale plan:**\n**Speaker note:**\n\n## Slide 11: Team\n**Founders:**\n[Name, title — 1-2 most relevant credentials]\n**Why us:**\n[The "unfair advantage" — domain expertise, network, prior exits]\n**Speaker note:** [Investors bet on people. Make them believe in you.]\n\n## Slide 12: The Ask\n**Raising:** $[AMOUNT]\n**Use of funds:**\n| Category | % | Purpose |\n|----------|---|---------|\n| Engineering | X% | [what you'll build] |\n| Sales/Marketing | X% | [channels] |\n| Ops | X% | [specifics] |\n**Milestones this round gets us to:**\n- [Milestone 1 — in X months]\n- [Milestone 2]\n- [Milestone 3 — "puts us in position for Series A at $Xm ARR"]\n**Speaker note:** [End with the vision, not the features. Where does this go in 5 years?]\n\n---\n\n## Bonus: Your 3-Sentence Elevator Pitch\n[The version you say when someone asks "what do you do?" at a conference]\n\n## Common Objection Responses\n**"The market is too small":** [response]\n**"Big Tech could copy this":** [response]\n**"Why are you the right team?":** [response]\n**"Your CAC is too high":** [response]`,
    seoTitle: "Investor Pitch Deck Writer Prompt — 12-Slide Script",
    seoDescription: "Generate a complete investor pitch deck narrative: problem, traction, business model, and ask — written the way VCs want to hear it.",
    seoKeywords: ["pitch deck prompt", "investor pitch AI", "startup pitch script", "fundraising prompt"],
  },

  // ── Design ─────────────────────────────────────────────────────────────────
  {
    slug: "ui-ux-design-critic",
    title: "UI/UX Design Critic — Honest Product Feedback",
    subtitle: "Get Figma-level critique without hiring a designer",
    description: "Paste a screenshot URL or describe your UI and get a structured critique covering usability, visual hierarchy, accessibility, conversion optimization, and mobile responsiveness.",
    longDescription: `Most feedback on UI/UX is vague: "it looks nice" or "feels off." This prompt gives you the specific, actionable critique a senior product designer would give — organized by impact level.\n\nSend it:\n- A screenshot URL\n- A Figma embed link\n- Or a detailed text description of your UI\n\nGet back:\n- Usability issues ranked by severity\n- Visual hierarchy analysis\n- WCAG 2.1 accessibility check\n- CTA and conversion optimization suggestions\n- Mobile/responsive concerns\n- "This reminds me of X design pattern, here's how they solved it" references\n- Prioritized fix list (what to fix first)`,
    category: "design",
    pricingType: "paid",
    priceCents: 1299,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["UI review", "UX audit", "Conversion optimization", "Accessibility"],
    industries: ["SaaS", "E-commerce", "Agency", "Startup"],
    estimatedTimeSavedMinutes: 60,
    previewContent: `You are a senior UI/UX designer with 10+ years at top product companies. Critique the following UI:\n\n[PASTE SCREENSHOT URL OR DESCRIBE YOUR UI IN DETAIL]\n\nContext:\n- Product type: [app / landing page / dashboard / e-commerce]\n- Primary goal: [what should users do on this screen]\n- Target user: [who uses this]`,
    fullContent: `You are a senior UI/UX designer with 10+ years of experience at companies like Figma, Linear, Notion, and Stripe. You have an eye for detail, a deep understanding of conversion psychology, and you give the kind of direct, specific feedback that actually improves products.\n\nCritique the following UI:\n\n**UI to Review:** [PASTE SCREENSHOT URL or DESCRIBE IN DETAIL]\n**Product Type:** [Landing page / SaaS dashboard / Mobile app / E-commerce / Onboarding flow]\n**Primary Conversion Goal:** [What should users do? Sign up / Buy / Book / Learn]\n**Target User:** [Who uses this — role, tech-savviness, device]\n**Known Pain Point (if any):** [What's already been flagged as a problem, or "unknown"]\n\n---\n\nDeliver a structured critique:\n\n# UI/UX Critique Report\n\n## First Impression (5-second test)\n[What would a new user think in the first 5 seconds? What's clear? What's confusing?]\n\n## Overall Grade: [A/B/C/D/F]\n[2-3 sentence executive summary]\n\n---\n\n## 🔴 Critical Issues\n[Problems that are actively hurting conversion or usability]\nFor each:\n- **Issue:** [What's wrong]\n- **Impact:** [Why it matters — lost conversions, user frustration, etc.]\n- **Fix:** [Specific solution — reference a design pattern, example site, or exact change]\n\n## 🟠 High Priority\n[Same format]\n\n## 🟡 Medium Priority\n[Same format]\n\n## 🟢 Polish / Enhancement\n[Nice-to-have improvements]\n\n---\n\n## Visual Hierarchy Analysis\n- **What draws the eye first:** [correct or incorrect?]\n- **CTA visibility:** [rating 1-10 + explanation]\n- **Typography hierarchy:** [H1→H2→body flow assessment]\n- **White space usage:** [cramped/balanced/too sparse]\n- **Color usage:** [does it guide the eye? Any conflicts?]\n\n## Accessibility (WCAG 2.1)\n- **Color contrast:** [pass/fail estimates for main elements]\n- **Touch targets:** [are buttons big enough? 44x44px minimum]\n- **Text size:** [readability on mobile]\n- **Alt text / labels:** [any obvious gaps]\n\n## Conversion Optimization\n- **Above-the-fold value prop:** [clear / buried / missing]\n- **CTA analysis:** [text, placement, color, hierarchy]\n- **Trust signals:** [present / missing / misplaced]\n- **Friction points:** [what would make users leave]\n\n## Mobile / Responsive Concerns\n[How does this translate to a 375px wide screen?]\n\n## Design Pattern References\n["This navigation pattern works well — see how [Linear / Stripe / Vercel] handles it"]\n[2-3 specific references with what to steal]\n\n---\n\n## Prioritized Fix List\n1. [Fix first — highest impact]\n2. [Fix second]\n3. [Fix third]\n4. [Fix fourth]\n5. [Fix fifth]\n\n## What's Working Well\n[Acknowledge what's done right — always include this]`,
    seoTitle: "UI/UX Design Critic Prompt — Product Feedback AI",
    seoDescription: "Get senior-level UI/UX critique covering usability, hierarchy, accessibility, and conversion — organized by impact.",
    seoKeywords: ["UI UX critique prompt", "design review AI", "UX audit prompt", "product design feedback"],
  },

  // ── Productivity ────────────────────────────────────────────────────────────
  {
    slug: "meeting-notes-to-action-items",
    title: "Meeting Notes → Action Items + Follow-Up Email",
    subtitle: "Turn messy notes into clean deliverables instantly",
    description: "Paste raw meeting notes, transcript, or bullet points and get structured action items, owners, deadlines, decisions log, and a ready-to-send follow-up email.",
    longDescription: `The meeting ends and everyone leaves without a clear understanding of who does what by when. This prompt turns that chaos into clarity in under 30 seconds.\n\nPaste anything:\n- Raw bullet points you typed during the call\n- AI-generated transcript (Otter, Fireflies, etc.)\n- Slack thread or email chain summary\n\nGet back:\n- Action items table with owner + deadline\n- Decisions made (explicit and implied)\n- Open questions that need answers\n- Blockers flagged\n- Ready-to-send follow-up email draft\n- TL;DR (3 bullets) for sharing with people who weren't there`,
    category: "productivity",
    pricingType: "free",
    priceCents: 0,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-flash", "claude-3-5-haiku"],
    useCases: ["Meeting notes", "Project management", "Team communication", "Productivity"],
    industries: ["All"],
    estimatedTimeSavedMinutes: 25,
    previewContent: `You are a chief of staff. Extract all action items, decisions, and follow-ups from these meeting notes:\n\n[PASTE YOUR MEETING NOTES / TRANSCRIPT HERE]\n\nMeeting context:\n- Date: [DATE]\n- Attendees: [NAMES]\n- Meeting type: [Standup / Planning / Review / Client call / etc.]`,
    fullContent: `You are an expert chief of staff. Your job is to take messy meeting notes and turn them into a clean, actionable summary that teams can actually use.\n\nProcess the following meeting notes:\n\n**Date:** [DATE]\n**Meeting Name/Purpose:** [WHAT WAS THIS MEETING FOR]\n**Attendees:** [LIST OF NAMES — first names are fine]\n**Notes:** \n[PASTE YOUR RAW NOTES, TRANSCRIPT, OR BULLET POINTS HERE]\n\n---\n\nDeliver exactly this output:\n\n## TL;DR\n- [Most important outcome in one sentence]\n- [Second most important]\n- [Third most important]\n\n---\n\n## Action Items\n| # | Task | Owner | Deadline | Priority |\n|---|------|-------|----------|----------|\n| 1 | [specific task] | [name] | [date or "ASAP" or "Next meeting"] | High/Med/Low |\n[All action items — be specific. Not "follow up" but "Send revised proposal to Acme by EOD Friday"]\n\n---\n\n## Decisions Made\n- [Decision 1 — what was decided and any rationale mentioned]\n- [Decision 2]\n[List every decision, even implicit ones]\n\n---\n\n## Open Questions (Need Answers)\n- [Question] → Owner: [name if assigned] → Deadline: [if mentioned]\n[Things that came up but weren't resolved]\n\n---\n\n## Blockers\n- [Blocker] → Blocking: [what/who] → Owner: [who needs to resolve]\n[Anything stopping progress]\n\n---\n\n## Follow-Up Email\n**Subject:** [Meeting name] — Action Items & Next Steps [date]\n\n[READY-TO-SEND EMAIL DRAFT]\nHi team,\n\nThanks for [the call / joining today's meeting]. Here's a summary of where we landed:\n\n**Decisions:**\n• [decision 1]\n• [decision 2]\n\n**Action Items:**\n• [Name] — [task] by [deadline]\n• [Name] — [task] by [deadline]\n\n**Next meeting:** [date/time if mentioned, or "TBD"]\n\nReply if anything looks off.\n\n[SENDER NAME]\n\n---\n\n## Notes on Ambiguity\n[Flag any action items where the owner or deadline wasn't clear — and your best guess at each]`,
    seoTitle: "Meeting Notes to Action Items Prompt — Follow-Up Email Generator",
    seoDescription: "Paste raw meeting notes and get structured action items, decisions log, and a ready-to-send follow-up email.",
    seoKeywords: ["meeting notes prompt", "action items generator", "follow up email AI", "meeting summary prompt"],
  },

  // ── Education ──────────────────────────────────────────────────────────────
  {
    slug: "feynman-explainer",
    title: "Feynman Explainer — Understand Anything in 5 Minutes",
    subtitle: "Complex topics explained simply, at any level",
    description: "Paste any complex topic — technical, scientific, financial, or philosophical — and get a multi-level explanation from ELI5 to expert. Uses analogies, examples, and the Feynman technique.",
    longDescription: `Named after Nobel Prize-winning physicist Richard Feynman, who believed that if you can't explain something simply, you don't understand it well enough.\n\nThis prompt:\n1. Explains the topic at 4 levels (5-year-old, high schooler, undergrad, expert)\n2. Creates 3 original analogies that make abstract ideas click\n3. Identifies the 3 most common misconceptions\n4. Gives you a 5-question quiz to test your understanding\n5. Provides "what to learn next" so you can go deeper\n\nPerfect for: learning new domains, preparing to explain things to stakeholders, onboarding to a new field, or studying for exams.`,
    category: "education",
    pricingType: "free",
    priceCents: 0,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-pro", "claude-3-5-haiku"],
    useCases: ["Learning", "Teaching", "Studying", "Explaining to stakeholders"],
    industries: ["Education", "All"],
    estimatedTimeSavedMinutes: 30,
    previewContent: `Use the Feynman technique to explain the following concept at 4 different levels:\n\nConcept: [WHAT YOU WANT TO UNDERSTAND]\n\nLevels:\n1. ELI5 (explain like I'm 5)\n2. High school student\n3. College undergraduate\n4. Domain expert\n\nAlso provide: 3 analogies, 3 common misconceptions, and a 5-question quiz.`,
    fullContent: `You are a master educator who combines the clarity of Richard Feynman, the storytelling of Malcolm Gladwell, and the precision of a great textbook author.\n\nExplain the following concept using the Feynman method:\n\n**Concept to Explain:** [WHAT YOU WANT TO UNDERSTAND — can be technical, scientific, financial, philosophical, or anything]\n**My Current Level:** [Complete beginner / Some exposure / Intermediate / Advanced]\n**Why I'm Learning This:** [e.g. "for work", "out of curiosity", "explaining to my team", "exam prep"]\n\n---\n\nDeliver this complete explanation:\n\n## Concept: [TOPIC]\n\n### Level 1: ELI5 (Explain Like I'm 5)\n[Use a story, toys, food, or everyday objects. No jargon at all. Max 100 words.]\n\n### Level 2: High School Student\n[Introduce 2-3 key terms. Use relatable examples from everyday life. Max 200 words.]\n\n### Level 3: College Undergraduate\n[Get technical. Introduce the formal definition, key equations or frameworks if relevant. Use precise vocabulary. Max 300 words.]\n\n### Level 4: Domain Expert\n[Go deep. Nuance, edge cases, current debates in the field, limitations of common models. Speak peer-to-peer. Max 300 words.]\n\n---\n\n## 3 Original Analogies\n1. **[Analogy title]:** [Explanation of the analogy and how it maps to the concept]\n2. **[Analogy title]:** [Different angle, different domain]\n3. **[Analogy title]:** [A surprising or counterintuitive one that makes it click]\n\n---\n\n## 3 Common Misconceptions\n1. **Myth:** [What people commonly get wrong]\n   **Reality:** [The accurate version]\n2. [Same format]\n3. [Same format]\n\n---\n\n## The 5-Question Understanding Check\n(Answer these yourself after reading — they reveal whether you actually get it)\n\n1. [Question that tests the core concept — not just recall, but application]\n2. [Question that tests an analogy or implication]\n3. [Question that reveals a common misconception if answered wrong]\n4. [Question that asks you to explain it to someone else in one sentence]\n5. [Harder question that tests deeper understanding]\n\n**Answers:**\n1. [Answer]\n2. [Answer]\n3. [Answer]\n4. [Answer]\n5. [Answer]\n\n---\n\n## What to Learn Next\nIf you want to go deeper, the logical next topics are:\n1. [Topic] — [one sentence on why it connects]\n2. [Topic]\n3. [Topic]\n\n**Best resources:**\n- [Book/Course/Video — specific title]\n- [Resource 2]\n- [Resource 3]`,
    seoTitle: "Feynman Explainer Prompt — Understand Any Topic Simply",
    seoDescription: "Get any complex topic explained at 4 levels, with analogies, misconceptions debunked, and a quiz to test your understanding.",
    seoKeywords: ["Feynman technique prompt", "explain complex topics AI", "learn anything prompt", "ELI5 AI"],
  },

  // ── Research ───────────────────────────────────────────────────────────────
  {
    slug: "market-research-synthesizer",
    title: "Market Research Synthesizer — Competitive Intel Report",
    subtitle: "Turn scattered research into a board-ready brief",
    description: "Paste your research notes, competitor URLs, Reddit threads, or raw data and get a structured competitive intelligence report with opportunities, threats, and strategic recommendations.",
    longDescription: `Executives and founders spend hours doing market research but struggle to synthesize it into something actionable. This prompt is the analyst that does the synthesis for you.\n\nGive it:\n- Raw notes from competitor websites\n- Reddit/Twitter comments from your target market\n- Industry reports (paste the key sections)\n- Your own observations and hypotheses\n\nGet back a structured report covering:\n- Market landscape summary\n- Competitor strength/weakness matrix\n- Customer pain points ranked by frequency\n- Whitespace opportunities (what's underserved)\n- Threats and risks\n- 5 strategic recommendations with rationale\n- Executive summary (1 page)`,
    category: "research",
    pricingType: "paid",
    priceCents: 1999,
    difficulty: "intermediate",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Market research", "Competitive analysis", "Strategy", "Due diligence"],
    industries: ["Startup", "Consulting", "VC", "Enterprise"],
    estimatedTimeSavedMinutes: 180,
    previewContent: `You are a strategy consultant. Synthesize the following market research into a structured competitive intelligence report:\n\nMarket/Industry: [WHAT MARKET YOU'RE ANALYZING]\nYour Product/Company: [WHAT YOU DO]\nResearch Input:\n[PASTE YOUR NOTES, COMPETITOR INFO, CUSTOMER FEEDBACK, REPORTS HERE]`,
    fullContent: `You are a strategy consultant from McKinsey with expertise in market analysis and competitive intelligence. You synthesize messy research into clear, actionable insights that executives can act on immediately.\n\nSynthesize the following into a competitive intelligence report:\n\n**Market/Industry:** [WHAT MARKET OR NICHE YOU'RE ANALYZING]\n**Your Company/Product:** [WHAT YOU DO — or "conducting research for investment purposes"]\n**Strategic Question:** [WHAT DECISION IS THIS RESEARCH MEANT TO INFORM]\n**Research Input:**\n[PASTE ALL YOUR RAW RESEARCH HERE — competitor URLs, Reddit threads, customer interview notes, industry report excerpts, your own observations, anything]\n\n---\n\nDeliver this complete report:\n\n# Competitive Intelligence Report: [MARKET]\n**Prepared:** [today's date] | **Analyst:** AI Research Synthesis\n\n## Executive Summary (1 page)\n[3-5 bullet points that tell the whole story. What's the market state, who's winning, what's the opportunity, what's the risk, what should you do?]\n\n---\n\n## Market Landscape\n**Market size estimate:** [TAM if determinable from research]\n**Growth trajectory:** [growing/flat/declining + why]\n**Key dynamics:** [3-5 forces shaping this market right now]\n**Customer segments:** [Who buys in this market and what they want]\n\n---\n\n## Competitor Analysis\n| Competitor | Strengths | Weaknesses | Positioning | Est. Size |\n|------------|-----------|------------|-------------|----------|\n| [Name] | [Top 2-3] | [Top 2-3] | [How they position] | [if known] |\n[All significant competitors from the research]\n\n**Who's winning and why:**\n[1-2 paragraphs on the current leader and their moat]\n\n---\n\n## Customer Pain Points\n(Ranked by frequency in research)\n\n1. **[Pain point]** — [Evidence from research, direct quotes if available]\n2. [Same format]\n3. [Same format]\n4. [Same format]\n5. [Same format]\n\n---\n\n## Whitespace Opportunities\n(What's underserved or ignored)\n\n1. **[Opportunity]**\n   - Evidence: [Why this gap exists]\n   - Who could own it: [what type of company/product]\n   - Risk: [why it might not work]\n\n2. [Same format]\n3. [Same format]\n\n---\n\n## Threats & Risks\n| Threat | Likelihood | Impact | Timeframe |\n|--------|-----------|--------|----------|\n| [risk] | H/M/L | H/M/L | 6mo/1yr/2yr |\n\n---\n\n## Strategic Recommendations\n5 specific, actionable recommendations based on this research:\n\n1. **[Recommendation]**\n   - **Rationale:** [Why this, based on what you found]\n   - **How:** [Specific steps]\n   - **Expected outcome:** [What success looks like]\n\n2-5. [Same format]\n\n---\n\n## Data Confidence Assessment\n[What's well-supported vs. what's a hypothesis. Flag any gaps in the research that should be filled before making major decisions.]`,
    seoTitle: "Market Research Synthesizer Prompt — Competitive Intel Report",
    seoDescription: "Paste your raw research and get a structured competitive intelligence report with opportunities, threats, and strategic recommendations.",
    seoKeywords: ["market research prompt", "competitive analysis AI", "competitive intelligence prompt", "market analysis AI"],
  },
];

async function seed() {
  console.log("🌱 Seeding prompt-vault database...\n");

  // 1. Upsert the seed creator user
  console.log("Creating creator user...");
  const existingUser = await db.select().from(schema.user).where(eq(schema.user.id, CREATOR_ID));
  if (existingUser.length === 0) {
    await db.insert(schema.user).values({
      id: CREATOR_ID,
      name: "PromptVault Team",
      email: CREATOR_EMAIL,
      emailVerified: true,
      role: "creator",
      username: "promptvault",
      bio: "Official curated prompts from the PromptVault team.",
    });
    console.log("  ✓ User created");
  } else {
    console.log("  ✓ User already exists");
  }

  // 2. Upsert creator profile
  console.log("Creating creator profile...");
  const existingProfile = await db.select().from(schema.creatorProfiles).where(eq(schema.creatorProfiles.userId, CREATOR_ID));
  if (existingProfile.length === 0) {
    await db.insert(schema.creatorProfiles).values({
      userId: CREATOR_ID,
      displayName: "PromptVault Team",
      headline: "Curated high-performance prompts for professionals",
      bio: "The official PromptVault collection — battle-tested prompts across engineering, marketing, writing, business, and more.",
      verified: true,
      onboardedAt: new Date(),
    });
    console.log("  ✓ Profile created");
  } else {
    console.log("  ✓ Profile already exists");
  }

  // 3. Insert prompts
  console.log(`\nInserting ${PROMPTS.length} prompts...`);
  let inserted = 0;
  let skipped = 0;

  for (const p of PROMPTS) {
    const existing = await db.select({ id: schema.prompts.id }).from(schema.prompts).where(eq(schema.prompts.slug, p.slug));
    if (existing.length > 0) {
      console.log(`  ↩ Skipped (exists): ${p.title}`);
      skipped++;
      continue;
    }

    await db.insert(schema.prompts).values({
      creatorId: CREATOR_ID,
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      description: p.description,
      longDescription: p.longDescription,
      category: p.category,
      pricingType: p.pricingType as "free" | "paid",
      priceCents: p.priceCents,
      difficulty: p.difficulty as "beginner" | "intermediate" | "advanced",
      modelSupport: p.modelSupport,
      useCases: p.useCases,
      industries: p.industries,
      estimatedTimeSavedMinutes: p.estimatedTimeSavedMinutes,
      previewContent: p.previewContent,
      fullContent: p.fullContent,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      seoKeywords: p.seoKeywords,
      status: "published",
      publishedAt: new Date(),
      salesCount: Math.floor(Math.random() * 80) + 5,
      avgRating: (Math.random() * 1 + 4).toFixed(2),
      reviewCount: Math.floor(Math.random() * 30) + 3,
    });

    console.log(`  ✓ ${p.title} (${p.pricingType === "free" ? "FREE" : `$${(p.priceCents / 100).toFixed(2)}`})`);
    inserted++;
  }

  console.log(`\n✅ Done! ${inserted} inserted, ${skipped} skipped.`);
  console.log("🚀 Visit http://localhost:3000 to see your prompts live.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
