import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";

const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
const CREATOR_ID = "seed-creator-001";

const PROMPTS = [

  // ── r/ChatGPT + r/ClaudeAI ─────────────────────────────────────────────────

  {
    slug: "custom-gpt-system-prompt-builder",
    title: "Custom GPT System Prompt Builder — Full Persona Engineering",
    subtitle: "Build GPTs that actually stay in character",
    description: "Engineer a complete system prompt for any custom GPT or Claude Project: persona, tone, constraints, output format, fallback behavior, and anti-jailbreak rules — all in one shot.",
    longDescription: `Most custom GPT system prompts are 2 sentences. The best ones are engineered like software — with edge case handling, tone calibration, output constraints, and persona consistency rules.\n\nThis prompt builds a full system prompt for any assistant you want to create:\n\n- **Persona definition** — name, voice, expertise, personality\n- **Behavioral rules** — what it will and won't do\n- **Output format constraints** — how it structures every response\n- **Fallback behavior** — how it handles off-topic or ambiguous requests\n- **Anti-drift rules** — keeps the assistant on-task even after long conversations\n- **Few-shot examples** — shows the assistant what good looks like\n\nWorks for: customer support bots, coding assistants, writing coaches, tutors, sales assistants, and more.`,
    category: "general",
    pricingType: "paid",
    priceCents: 1999,
    difficulty: "intermediate",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Custom GPT", "Claude Projects", "AI assistant", "Chatbot building"],
    industries: ["SaaS", "Customer success", "Education", "Creator"],
    estimatedTimeSavedMinutes: 60,
    previewContent: `You are an expert AI systems prompt engineer. Build a complete system prompt for the following assistant:\n\nAssistant name: [NAME]\nPurpose: [WHAT IT DOES]\nPersonality/tone: [HOW IT SOUNDS]\nTarget user: [WHO USES IT]\nMust do: [REQUIRED BEHAVIORS]\nMust NOT do: [RESTRICTIONS]`,
    fullContent: `You are a world-class AI systems engineer who has built system prompts for enterprise chatbots, viral custom GPTs, and AI products used by millions. You understand how LLMs interpret instructions, where they drift, and how to write constraints that actually hold.\n\nBuild a complete system prompt for:\n\n**Assistant name:** [NAME]\n**Purpose in one sentence:** [WHAT DOES IT DO FOR THE USER]\n**Personality and tone:** [e.g. "direct and concise, like a senior engineer who hates fluff" / "warm and encouraging, like a patient tutor"]\n**Target user:** [WHO USES THIS — their skill level, goals, context]\n**Platform:** [ChatGPT Custom GPT / Claude Project / API system prompt / Other]\n**Must always do:**\n- [Behavior 1]\n- [Behavior 2]\n**Must never do:**\n- [Restriction 1]\n- [Restriction 2]\n**Output format preference:** [Bullet points / Prose / Code blocks / Structured headers / Depends on question]\n**Domain/knowledge focus:** [What it should know deeply vs. stay out of]\n\n---\n\nDeliver:\n\n## System Prompt\n\`\`\`\n[FULL ENGINEERED SYSTEM PROMPT — ready to paste]\n\`\`\`\n\n## Engineering Notes\n\n**Persona anchoring:** [How the prompt locks in the personality]\n**Constraint enforcement:** [How the "must never" rules are implemented]\n**Fallback behavior:** [What happens when user goes off-topic]\n**Anti-drift technique:** [How the assistant stays on-task in long conversations]\n\n## Few-Shot Examples to Add\n[2-3 example exchanges that show the assistant at its best — add these after the system prompt for best results]\n\n**Example 1:**\nUser: [example input]\nAssistant: [ideal response]\n\n**Example 2:**\nUser: [example input]\nAssistant: [ideal response]\n\n## Testing Checklist\n[ ] Does it stay in character after 10 back-and-forths?\n[ ] Does it handle off-topic questions gracefully?\n[ ] Does it maintain format consistency?\n[ ] Does it respect the restrictions even when pushed?\n[ ] Does it sound like the intended persona?`,
    seoTitle: "Custom GPT System Prompt Builder — Full Persona Engineering",
    seoDescription: "Engineer a complete system prompt for any custom GPT or Claude Project: persona, constraints, fallback behavior, and anti-drift rules.",
    seoKeywords: ["custom GPT system prompt", "Claude project prompt", "AI assistant builder", "system prompt engineer"],
  },
  {
    slug: "chain-of-thought-reasoning-booster",
    title: "Chain-of-Thought Reasoning Booster — 10x Smarter AI Answers",
    subtitle: "The wrapper that makes any AI think before it answers",
    description: "A universal prompt wrapper that forces any AI model to reason step-by-step before answering — dramatically improving accuracy on complex problems, math, logic, and multi-step tasks.",
    longDescription: `Research shows chain-of-thought prompting improves AI accuracy by 30-70% on complex tasks. Most people don't use it because they don't know how to structure it.\n\nThis prompt is a universal wrapper you put around ANY question to force the model to:\n1. Restate the problem in its own words (catches misunderstandings)\n2. Identify what information it needs\n3. Break the problem into sub-problems\n4. Solve each sub-problem explicitly\n5. Check its work before giving a final answer\n6. Flag its confidence level and any assumptions\n\nWorks on: math problems, logical puzzles, business decisions, code debugging, research questions, and any multi-step task where accuracy matters.`,
    category: "general",
    pricingType: "free",
    priceCents: 0,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-pro", "claude-3-5-haiku"],
    useCases: ["Problem solving", "Math", "Logic", "Research", "Decision making"],
    industries: ["All"],
    estimatedTimeSavedMinutes: 15,
    previewContent: `Before answering, follow this reasoning protocol:\n\n1. RESTATE: Restate the problem in your own words\n2. IDENTIFY: What information do I need to solve this?\n3. DECOMPOSE: Break into sub-problems\n4. SOLVE: Work through each sub-problem step by step\n5. CHECK: Verify your answer makes sense\n6. CONFIDENCE: Rate your confidence 1-10 and flag assumptions\n\nThen give your final answer.\n\nProblem: [YOUR QUESTION HERE]`,
    fullContent: `Before answering my question, follow this exact reasoning protocol. Do not skip steps.\n\n---\n\n**STEP 1 — RESTATE**\nRestate my problem in your own words. If you're interpreting it differently than I might intend, flag that now.\n\n**STEP 2 — INFORMATION AUDIT**\nWhat information do you have? What information is missing or assumed? List both.\n\n**STEP 3 — DECOMPOSE**\nBreak this into sub-problems or steps. Number them.\n\n**STEP 4 — SOLVE (show your work)**\nWork through each sub-problem explicitly. Show every step. Don't jump to conclusions.\n\n**STEP 5 — SYNTHESIZE**\nBring the sub-solutions together into a final answer.\n\n**STEP 6 — VERIFY**\nDoes your answer make sense? Check it against the original problem. Are there edge cases you missed?\n\n**STEP 7 — CONFIDENCE REPORT**\n- Confidence: [X/10]\n- Key assumptions made: [list]\n- What could make this answer wrong: [list]\n- If confidence < 7: suggest how to verify independently\n\n---\n\n**FINAL ANSWER:**\n[Clear, direct answer after the reasoning]\n\n---\n\nNow apply this protocol to:\n\n[YOUR QUESTION / PROBLEM HERE]`,
    seoTitle: "Chain-of-Thought Reasoning Prompt — 10x Smarter AI Answers",
    seoDescription: "Force any AI to reason step-by-step before answering — improves accuracy 30-70% on complex problems, math, and logic.",
    seoKeywords: ["chain of thought prompt", "AI reasoning prompt", "better ChatGPT answers", "step by step AI"],
  },
  {
    slug: "ai-debate-opponent",
    title: "AI Debate Opponent — Steel-Man Any Argument",
    subtitle: "Test your ideas against the strongest possible counterargument",
    description: "Present any idea, belief, plan, or argument and get the strongest possible opposing case — not a strawman, but a steel-man that will genuinely stress-test your thinking.",
    longDescription: `The best way to strengthen an idea is to fight its strongest opponent. Most people surround themselves with agreement. This prompt gives you a world-class devil's advocate on demand.\n\nUse cases:\n- Test a business plan before pitching it to investors\n- Find holes in your argument before a debate\n- Pressure-test a decision before committing\n- Improve an essay or article by seeing the strongest objections\n- Build intellectual resilience on any topic\n\nThe AI will:\n1. Steel-man your position first (articulate it at its best)\n2. Then present the 5 strongest counterarguments\n3. Identify the single most fatal flaw in your reasoning\n4. Suggest how you'd strengthen your position in response\n5. Give a verdict on how defensible your position is\n\nFor: entrepreneurs, debaters, students, researchers, writers, and anyone who wants to think more rigorously.`,
    category: "general",
    pricingType: "paid",
    priceCents: 999,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-pro"],
    useCases: ["Critical thinking", "Debate prep", "Decision making", "Writing", "Research"],
    industries: ["All"],
    estimatedTimeSavedMinutes: 30,
    previewContent: `You are a world-class debate opponent and critical thinker. Steel-man then challenge the following:\n\nMy position/idea/plan: [STATE YOUR ARGUMENT OR IDEA]\nContext: [ANY RELEVANT BACKGROUND]\nHow confident I am: [1-10]\n\nFirst articulate my position at its strongest, then give the 5 most powerful counterarguments.`,
    fullContent: `You are an expert in adversarial thinking, Socratic dialogue, and structured argumentation. Your job is not to agree with me — it's to make my thinking stronger by presenting the most rigorous possible opposition.\n\n**My position/idea/plan/argument:**\n[STATE YOUR IDEA, BELIEF, PLAN, OR ARGUMENT CLEARLY]\n\n**Context:**\n[RELEVANT BACKGROUND — what domain is this, what's at stake, what decisions hinge on it]\n\n**My confidence level:** [1-10]\n\n**What I'm most uncertain about:** [YOUR OWN DOUBTS — or "none"]\n\n---\n\nDeliver this complete analysis:\n\n## Steel-Man of Your Position\n[Articulate my argument at its BEST — stronger than I stated it. This is the version I should be defending.]\n\n---\n\n## The 5 Strongest Counterarguments\n\n### 1. [Counterargument name]\n**The argument:** [Best version of this objection]\n**Evidence/logic:** [Why a smart person would believe this]\n**How strong is this?** [Fatal / Strong / Moderate] — [why]\n\n### 2-5. [Same format]\n\n---\n\n## The Single Most Fatal Flaw\n[If there's one thing that could completely undermine your position, it's this:]\n[Be direct. Don't soften it.]\n\n---\n\n## How to Strengthen Your Position\n[Given these attacks, here's how you'd shore up your argument:]\n- [Specific improvement 1]\n- [Specific improvement 2]\n- [What concession you should make upfront]\n\n---\n\n## Defensibility Verdict\n**Overall:** [Strongly defensible / Defensible with caveats / Weak / Indefensible as stated]\n**Revised confidence I'd suggest:** [X/10]\n**The crux:** [The single question your whole argument hinges on]`,
    seoTitle: "AI Debate Opponent — Steel-Man Any Argument",
    seoDescription: "Get the strongest possible counterargument to any idea, plan, or belief — stress-test your thinking before it matters.",
    seoKeywords: ["debate prompt AI", "steel man argument prompt", "critical thinking AI", "devil's advocate prompt"],
  },

  // ── r/entrepreneur + r/startups ────────────────────────────────────────────

  {
    slug: "one-page-business-plan",
    title: "One-Page Business Plan — Lean Canvas in 10 Minutes",
    subtitle: "The only business plan you actually need to start",
    description: "Answer 9 questions and get a complete Lean Canvas business plan: problem, solution, UVP, channels, revenue streams, cost structure, key metrics, and unfair advantage.",
    longDescription: `Traditional business plans are dead. The Lean Canvas — created by Ash Maurya — is what modern founders use to validate ideas fast.\n\nThis prompt takes your answers to 9 targeted questions and builds a complete, investor-ready Lean Canvas covering:\n\n1. **Problem** — the top 3 problems you're solving and existing alternatives\n2. **Customer Segments** — who has the problem (early adopters first)\n3. **Unique Value Proposition** — why you and not someone else\n4. **Solution** — the simplest possible fix for each problem\n5. **Channels** — how you reach customers\n6. **Revenue Streams** — how you make money and at what price\n7. **Cost Structure** — what it costs to run this\n8. **Key Metrics** — the numbers that tell you if this is working\n9. **Unfair Advantage** — what you have that can't be easily copied\n\nPlus: a 30-day validation plan and the 3 riskiest assumptions to test first.`,
    category: "business",
    pricingType: "paid",
    priceCents: 1999,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Business planning", "Startup validation", "Lean Canvas", "Entrepreneurship"],
    industries: ["Startup", "SaaS", "E-commerce", "Service business"],
    estimatedTimeSavedMinutes: 90,
    previewContent: `You are a startup mentor and Lean Canvas expert. Build a complete one-page business plan for:\n\nBusiness idea: [YOUR IDEA IN 1-2 SENTENCES]\nTarget customer: [WHO HAS THE PROBLEM]\nMain problem: [WHAT PAIN YOU'RE SOLVING]\nYour solution: [HOW YOU SOLVE IT]\nHow you make money: [REVENUE MODEL]\nYour unfair advantage: [WHAT MAKES YOU HARD TO COPY]`,
    fullContent: `You are a startup advisor and Lean Canvas expert who has helped hundreds of founders go from idea to first revenue. You think in first principles and cut through vanity metrics to find what actually matters.\n\nBuild a complete Lean Canvas for:\n\n**Business idea:** [YOUR IDEA — describe in 1-2 sentences]\n**Target customer:** [WHO — be specific: "freelance graphic designers with 1-5 clients" not "creatives"]\n**The problem:** [WHAT PAIN — what does their life look like without your solution?]\n**Your solution:** [HOW YOU FIX IT — just the core thing]\n**How you make money:** [REVENUE MODEL — subscription, one-time, marketplace cut, etc.]\n**Your unfair advantage:** [WHAT YOU HAVE THAT'S HARD TO COPY — network, expertise, tech, data, timing]\n**Biggest risk:** [WHAT COULD KILL THIS — or "I don't know yet"]\n\n---\n\nDeliver the complete Lean Canvas:\n\n# Lean Canvas: [BUSINESS NAME]\n\n## 1. Problem\n**Top 3 problems:**\n1. [Most painful]\n2. [Second]\n3. [Third]\n\n**Existing alternatives:** [What customers do today instead of using you]\n\n## 2. Customer Segments\n**Primary target:** [Most specific possible description]\n**Early adopters:** [The subset who need this most urgently — start here]\n**Later segments:** [Who you expand to once proven]\n\n## 3. Unique Value Proposition\n**Headline:** [Single clear statement of what makes you different and worth attention]\n**High-level concept:** [X for Y — the "Airbnb for Z" version]\n**Why you:** [The 1-3 sentence answer to "why this team"]\n\n## 4. Solution\n- Problem 1 → [Simplest possible fix]\n- Problem 2 → [Simplest possible fix]\n- Problem 3 → [Simplest possible fix]\n\n**MVP definition:** [Minimum you need to build to validate this]\n\n## 5. Channels\n**Phase 1 (first 100 customers):** [Specific channel — cold email, Reddit, specific FB group, etc.]\n**Phase 2 (scale):** [Channel that could reach 10,000]\n**Long-term moat:** [Channel that gets cheaper over time — SEO, referral, community]\n\n## 6. Revenue Streams\n**Model:** [Subscription / One-time / Usage / Marketplace cut / Freemium]\n**Price point:** [$ amount — and how you arrived at it]\n**Unit economics:**\n- CAC estimate: $[X]\n- LTV estimate: $[X]\n- Gross margin estimate: [%]\n\n## 7. Cost Structure\n**Fixed costs:** [List with estimates]\n**Variable costs:** [Per customer costs]\n**Monthly burn to MVP:** $[X]\n**Runway needed before revenue:** [X months]\n\n## 8. Key Metrics\n**The one metric that matters most right now:** [OMTM]\n**Dashboard metrics:**\n- Acquisition: [metric]\n- Activation: [metric]\n- Retention: [metric]\n- Revenue: [metric]\n- Referral: [metric]\n\n## 9. Unfair Advantage\n[What you have that competitors can't easily replicate: proprietary data, network effects, regulatory moat, unique expertise, brand, community, patents]\n\n---\n\n## 30-Day Validation Plan\n**Week 1:** [Specific validation action — who to talk to and what to ask]\n**Week 2:** [Build/test]\n**Week 3:** [Measure]\n**Week 4:** [Decide: pivot, persevere, or stop]\n\n## The 3 Riskiest Assumptions\n(Test these first — if any are wrong, the business doesn't work)\n1. [Assumption] → Test by: [specific method]\n2. [Assumption] → Test by:\n3. [Assumption] → Test by:`,
    seoTitle: "One-Page Business Plan Generator — Lean Canvas",
    seoDescription: "Build a complete Lean Canvas in 10 minutes: problem, UVP, channels, revenue, and your unfair advantage — plus a 30-day validation plan.",
    seoKeywords: ["lean canvas prompt", "one page business plan AI", "startup business plan generator", "business plan AI"],
  },
  {
    slug: "customer-discovery-interview",
    title: "Customer Discovery Interview Script — Find What People Actually Want",
    subtitle: "Ask the questions that uncover real pain, not polite feedback",
    description: "Generate a full customer discovery interview script for any product or market — with open-ended questions, follow-up probes, jobs-to-be-done framing, and red flag detectors.",
    longDescription: `Most founders ask customers "would you use this?" and get a useless "yes." Real customer discovery finds the truth: the actual problem, how painful it is, what they've already tried, and whether they'd pay for a solution.\n\nThis prompt generates a complete 45-minute customer discovery script using:\n- **Mom Test principles** — questions customers can't lie to\n- **Jobs-to-Be-Done framing** — uncovers the real motivation\n- **Pain thermometer questions** — quantifies how much the problem matters\n- **Competitor probes** — finds out what alternatives they've already tried\n- **Willingness-to-pay detection** — without ever asking "would you pay for this?"\n\nAlso includes: a post-interview synthesis template and the 5 signals that mean you've found product-market fit.`,
    category: "business",
    pricingType: "paid",
    priceCents: 1499,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Customer discovery", "User research", "Startup validation", "Product development"],
    industries: ["Startup", "SaaS", "Product", "Agency"],
    estimatedTimeSavedMinutes: 60,
    previewContent: `You are a customer discovery expert trained in the Mom Test and Jobs-to-Be-Done. Create an interview script for:\n\nProduct idea: [YOUR PRODUCT]\nTarget customer: [WHO YOU'RE INTERVIEWING]\nHypothesis: [WHAT YOU THINK THEIR PROBLEM IS]\nMain thing to validate: [WHAT YOU MOST NEED TO CONFIRM OR DENY]`,
    fullContent: `You are a customer discovery expert who has conducted 500+ customer interviews and trained founders at Y Combinator, a16z portfolio companies, and top accelerators. You're trained in the Mom Test (Rob Fitzpatrick), Jobs-to-Be-Done (Clayton Christensen), and continuous discovery (Teresa Torres).\n\nCreate a customer discovery interview script for:\n\n**Product idea:** [YOUR PRODUCT OR SERVICE]\n**Target customer being interviewed:** [SPECIFIC ROLE/PERSONA — e.g. "Head of Marketing at a 20-50 person B2B SaaS company"]\n**Your hypothesis:** [WHAT YOU THINK THEIR PROBLEM IS]\n**What you most need to validate:** [YOUR RISKIEST ASSUMPTION]\n**Interview length:** [20 min / 45 min / 60 min]\n\n---\n\nDeliver the complete interview script:\n\n# Customer Discovery Interview Script\n**Persona:** [WHO YOU'RE INTERVIEWING]\n**Duration:** [X minutes]\n**Goal:** [What you're trying to learn]\n\n---\n\n## Opening (5 min)\n[Script for building rapport and setting expectations — never mention your product yet]\n\n> "Thanks for taking the time. I want to be clear — I'm not here to sell you anything or pitch a product. I'm trying to understand how you currently [DO THE THING] and what's hard about it. There are no right or wrong answers — honest reactions, including 'I don't care about this,' are the most valuable."\n\n**Warm-up questions:**\n1. [Easy question about their role/context]\n2. [Question about their day-to-day]\n\n---\n\n## Core Discovery (25 min)\n\n### The Problem Space\n3. "Walk me through the last time you had to [DO THE THING]. What happened?"\n   → Follow-up if they give a general answer: "Can you tell me about a specific time?"\n\n4. "What was the hardest part of that?"\n   → Probe: "Why was that hard? What made it hard?"\n\n5. "How often does this come up for you?"\n\n6. "On a scale of 1-10, how painful is this problem? What would make it a 10?"\n   → **Red flag:** If they say 1-4, this isn't your customer.\n\n### Jobs-to-Be-Done Probes\n7. "When this problem comes up, what are you actually trying to accomplish?"\n\n8. "What does success look like for you when this goes well?"\n\n9. "What have you already tried to solve this?"\n   → Follow-up: "How did that go? What did you like/dislike about it?"\n   → **Signal:** If they've tried multiple solutions, this is a real problem.\n\n### Competitive Landscape\n10. "What tools or processes do you use today for [THIS PROBLEM]?"\n\n11. "If you could wave a magic wand and fix this perfectly, what would that look like?"\n    → **Note:** Don't lead them. Write down their words exactly.\n\n12. "Is there anything you've tried that almost worked?"\n\n### Willingness-to-Pay Detection (never ask directly)\n13. "How much does this problem cost you — in time, money, or stress — in a typical month?"\n\n14. "Has your team bought anything to try to fix this?"\n    → Follow-up: "How much did that cost? Was it worth it?"\n\n---\n\n## Wrapping Up (10 min)\n15. "Is there anything about this problem I haven't asked about that you think is important?"\n\n16. "Who else on your team deals with this? Would they be willing to chat?"\n\n17. "Is there anyone else you think I should talk to about this?"\n\n> "This has been incredibly helpful. Would it be okay if I follow up with a few quick questions as I learn more?"\n\n---\n\n## Post-Interview Synthesis Template\n(Fill out within 10 minutes of the interview while it's fresh)\n\n**Interview date/person:**\n**Pain level (1-10):**\n**Current solution they use:**\n**Most surprising thing they said:**\n**Direct quotes to save:**\n**Confirmed hypotheses:**\n**Invalidated hypotheses:**\n**New questions this raised:**\n**Would this person be an early adopter? Why/why not:**\n\n---\n\n## 5 Signals You've Found a Real Problem\n1. They've already tried to solve it (built a workaround, bought something)\n2. They can describe a specific painful instance without prompting\n3. They rate it 7+ on the pain scale\n4. They ask YOU how you're solving it (unsolicited)\n5. They offer to introduce you to others with the same problem`,
    seoTitle: "Customer Discovery Interview Script — Find Real Customer Pain",
    seoDescription: "Generate a complete customer discovery script using Mom Test principles, JTBD framing, and pain thermometer questions.",
    seoKeywords: ["customer discovery prompt", "user interview script AI", "startup validation prompt", "jobs to be done interview"],
  },
  {
    slug: "sop-writer",
    title: "SOP Writer — Standard Operating Procedures That Actually Get Followed",
    subtitle: "Turn tribal knowledge into repeatable processes",
    description: "Describe any business process and get a complete Standard Operating Procedure: step-by-step instructions, decision trees, roles, tools, metrics, and a training checklist.",
    longDescription: `Most SOPs sit in a Google Doc and never get used. This prompt writes SOPs the way operational excellence consultants do — clear enough that a new hire can follow them on day one.\n\nProvide a description of any business process and get:\n- **Purpose and scope** — why this exists and when to use it\n- **Step-by-step instructions** — numbered, unambiguous, action-verb-first\n- **Decision trees** — what to do when things don't go as planned\n- **Roles and responsibilities** — RACI for each step\n- **Tools and resources** — specific software, templates, links\n- **Quality checkpoints** — how to know you did it right\n- **Training checklist** — what someone needs to demonstrate before going solo\n- **Version control** — ownership and review cadence\n\nFor: onboarding, customer success, sales, operations, finance, and any repeatable business process.`,
    category: "business",
    pricingType: "paid",
    priceCents: 1299,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Operations", "Onboarding", "Process documentation", "Scaling"],
    industries: ["All"],
    estimatedTimeSavedMinutes: 90,
    previewContent: `You are an operations expert. Write a complete SOP for:\n\nProcess name: [WHAT PROCESS ARE YOU DOCUMENTING]\nWho performs it: [ROLE]\nHow often: [FREQUENCY]\nTools used: [SOFTWARE, TEMPLATES, SYSTEMS]\nDescription: [DESCRIBE WHAT HAPPENS — as much detail as you have]`,
    fullContent: `You are a senior operations consultant and process designer who has built SOPs for companies from 10-person startups to Fortune 500 operations teams. Your SOPs are known for being clear, complete, and actually followed — because they're written for humans, not auditors.\n\nWrite a complete SOP for:\n\n**Process name:** [WHAT PROCESS — be specific, e.g. "Customer Onboarding Call" not "Sales"]\n**Department/Team:** [WHO OWNS THIS]\n**Primary performer (role):** [WHO DOES THIS]\n**Frequency:** [Daily / Weekly / Per-customer / Ad-hoc / etc.]\n**Tools/systems involved:** [SOFTWARE, TEMPLATES, PLATFORMS USED]\n**Process description:** [DESCRIBE WHAT HAPPENS — rough notes, bullet points, or a verbal walkthrough is fine]\n**Common failure modes:** [WHERE DOES THIS GO WRONG — or "unknown"]\n**What "done well" looks like:** [DEFINITION OF SUCCESS]\n\n---\n\nDeliver the complete SOP:\n\n---\n\n# SOP: [PROCESS NAME]\n\n| Field | Detail |\n|-------|--------|\n| **Version** | 1.0 |\n| **Owner** | [Role] |\n| **Effective date** | [today] |\n| **Review cadence** | Quarterly |\n| **Approver** | [Role] |\n\n---\n\n## 1. Purpose\n[Why this process exists and what problem it solves — 2-3 sentences]\n\n## 2. Scope\n**Applies to:** [Who uses this SOP]\n**Triggered by:** [What starts this process]\n**Ends when:** [What completion looks like]\n**Does NOT cover:** [Explicit exclusions to prevent scope creep]\n\n## 3. Roles & Responsibilities\n| Role | Responsibility | RACI |\n|------|----------------|------|\n| [Role] | [What they do in this process] | R/A/C/I |\n\n*(R=Responsible, A=Accountable, C=Consulted, I=Informed)*\n\n## 4. Tools & Resources\n| Tool | Purpose | Access |\n|------|---------|--------|\n| [Tool name] | [What it's used for] | [How to get access] |\n\n## 5. Step-by-Step Instructions\n\n> **Before you start:** [Any prerequisites, logins, prep work needed]\n\n**Step 1: [Action verb + what]**\n- How: [Specific instructions]\n- In [TOOL]: [Where to click/what to fill in]\n- ✅ Done when: [What completion looks like]\n\n**Step 2: [Action verb + what]**\n[Same format]\n\n[Continue for all steps]\n\n## 6. Decision Points\n\n**If [situation]:**\n→ Do [action]\n\n**If [edge case]:**\n→ Do [action] / Escalate to [role]\n\n**If [error/failure]:**\n→ [Recovery steps]\n\n## 7. Quality Checkpoints\nBefore completing this process, verify:\n- [ ] [Checkpoint 1]\n- [ ] [Checkpoint 2]\n- [ ] [Checkpoint 3]\n\n## 8. Common Mistakes & How to Avoid Them\n| Mistake | Why it happens | Prevention |\n|---------|---------------|------------|\n| [mistake] | [cause] | [fix] |\n\n## 9. Training Checklist\nBefore performing this process independently, a new team member should:\n- [ ] Shadow [role] completing this process [X] times\n- [ ] Complete this process with supervision [X] times\n- [ ] Demonstrate: [specific skill or decision]\n- [ ] Pass: [quiz or check-off]\n\n## 10. Metrics\n[How you measure whether this process is working]\n- Speed: [target time]\n- Quality: [error rate or success rate]\n- Volume: [throughput metric]\n\n## Change Log\n| Version | Date | Changes | Author |\n|---------|------|---------|--------|\n| 1.0 | [today] | Initial version | [Name] |`,
    seoTitle: "SOP Writer Prompt — Standard Operating Procedures That Get Followed",
    seoDescription: "Turn any business process into a complete SOP: steps, decision trees, RACI, quality checkpoints, and training checklist.",
    seoKeywords: ["SOP writer prompt", "standard operating procedure AI", "business process documentation", "operations manual generator"],
  },

  // ── r/productivity ─────────────────────────────────────────────────────────

  {
    slug: "second-brain-setup",
    title: "Second Brain Setup — PKM System in Obsidian/Notion",
    subtitle: "Build a knowledge system that actually works for your brain",
    description: "Design a complete Personal Knowledge Management (PKM) system tailored to your workflow — folder structure, tagging system, capture habits, review cadences, and daily note templates.",
    longDescription: `Tiago Forte's Building a Second Brain methodology has helped thousands of knowledge workers stop losing ideas and start building on them. But most people fail to set it up properly.\n\nThis prompt builds a PKM system customized for YOUR workflow:\n\n**You provide:**\n- Your tool (Obsidian, Notion, Logseq, Apple Notes)\n- What you want to capture (books, projects, ideas, research, meetings)\n- How much time you can spend maintaining it\n\n**You get:**\n- Complete folder/database structure (PARA method customized)\n- Tagging/linking system that scales\n- Daily note template\n- Weekly review template\n- Capture workflow for different content types\n- Progressive summarization guidelines\n- What to actually do in the first 7 days\n\nNo more half-built systems you abandon after 2 weeks.`,
    category: "productivity",
    pricingType: "paid",
    priceCents: 1299,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["PKM", "Note-taking", "Knowledge management", "Personal productivity"],
    industries: ["All"],
    estimatedTimeSavedMinutes: 120,
    previewContent: `You are a PKM expert trained in Building a Second Brain and Zettelkasten. Design a complete knowledge management system for:\n\nTool: [Obsidian / Notion / Logseq / Roam / Apple Notes]\nI capture: [WHAT TYPES OF CONTENT — books, meetings, ideas, research, projects]\nMy main goal: [WHAT I WANT TO ACCOMPLISH WITH THIS SYSTEM]\nTime I can maintain it: [X minutes/day or week]`,
    fullContent: `You are a PKM (Personal Knowledge Management) expert trained in Building a Second Brain (Tiago Forte), Zettelkasten (Niklas Luhmann), and Johnny.Decimal. You've helped hundreds of knowledge workers build systems they actually use.\n\nDesign a complete PKM system for:\n\n**Tool:** [Obsidian / Notion / Logseq / Roam Research / Apple Notes / Other]\n**What I capture:** [LIST — e.g. "book highlights, meeting notes, project ideas, research articles, shower thoughts"]\n**My main goal for this system:** [e.g. "never lose a good idea", "write more and better", "be better prepared for meetings", "build expertise in [field]"]\n**My job/role:** [CONTEXT — helps tailor the system]\n**Time available for maintenance:** [5 min/day / 30 min/week / 1 hour/week]\n**Technical comfort:** [Beginner — keep it simple / Intermediate / Advanced — give me plugins/automation]\n\n---\n\nDeliver the complete system design:\n\n# Your Second Brain: [TOOL] Setup\n\n## System Philosophy\n[2-3 sentences on the design principles behind this specific setup — why it's built this way for you]\n\n---\n\n## Folder/Database Structure\n[Full PARA-based structure customized for your workflow]\n\n\`\`\`\n📁 Projects/          # Active projects with a deadline\n  📁 [Project name]/\n    📄 Project brief\n    📄 Meeting notes\n    📄 Research\n\n📁 Areas/             # Ongoing responsibilities\n  📁 [Area name]/\n\n📁 Resources/         # Reference material by topic\n  📁 [Topic]/\n\n📁 Archive/           # Completed/inactive\n\n📁 Inbox/             # Capture here first, sort later\n\`\`\`\n\n[Explanation of each folder and decision rules for what goes where]\n\n---\n\n## Tagging System\n[Tagging convention that scales without becoming a mess]\n\n**Status tags:** #status/active #status/waiting #status/done\n**Content type tags:** [custom to your use case]\n**Topic tags:** [how to approach topic tagging without over-tagging]\n\n**Rule:** [Simple decision rule for whether something gets a tag]\n\n---\n\n## Daily Note Template\n\`\`\`markdown\n# [DATE]\n\n## Top 3 Today\n- [ ]\n- [ ]\n- [ ]\n\n## Captures\n[Quick ideas, links, thoughts]\n\n## Meeting Notes\n[Link or embed]\n\n## End of Day\n- Accomplished:\n- Rolled to tomorrow:\n- Random thought worth keeping:\n\`\`\`\n\n---\n\n## Weekly Review Template\n[Template for your weekly review — tailored to your time budget]\n\n---\n\n## Capture Workflows\n**For book highlights:** [Exact workflow — Kindle → Readwise → Obsidian or manual process]\n**For articles:** [Browser extension → Inbox → process]\n**For meeting notes:** [Template → where to file → follow-up]\n**For ideas:** [Capture wherever → process to inbox → weekly sort]\n\n---\n\n## Progressive Summarization\n[How to process notes over time without spending all day on it]\nLevel 1: [Capture]\nLevel 2: [Bold key passages]\nLevel 3: [Highlight the best of the bolded]\nLevel 4: [Mini summary in your own words]\n\n---\n\n## Your First 7 Days\nDay 1: [Specific action]\nDay 2: [Specific action]\nDay 3-5: [Specific action]\nDay 6-7: [First weekly review]\n\n**Don't do this:** [The 3 most common setup mistakes that kill new PKM systems]\n\n---\n\n## Recommended Plugins/Integrations\n[Tool-specific plugins that will save you the most time — with what each one does]`,
    seoTitle: "Second Brain PKM System Builder — Obsidian & Notion",
    seoDescription: "Design a complete Personal Knowledge Management system: PARA structure, tagging, daily templates, and capture workflows — tailored to your tools.",
    seoKeywords: ["second brain prompt", "PKM system Obsidian", "personal knowledge management AI", "Notion second brain"],
  },
  {
    slug: "deep-work-session-planner",
    title: "Deep Work Session Planner — Cal Newport Method",
    subtitle: "Plan a distraction-free block that actually produces results",
    description: "Describe your task and available time and get a structured deep work session plan: pre-session ritual, time-blocked agenda, progress metrics, and a distraction shutdown protocol.",
    longDescription: `Cal Newport's research shows that 4 hours of true deep work produces more than 8 hours of fragmented work. But most people sit down to "focus" with no plan and get pulled into distractions within minutes.\n\nThis prompt designs your deep work session before you start:\n\n- **Pre-session ritual** — 5-minute setup to enter flow state\n- **Session agenda** — time-blocked 25-minute Pomodoros with specific targets\n- **Progress metrics** — what does "done" look like for this session?\n- **Distraction shutdown protocol** — exactly how to handle interruptions\n- **Energy management** — when to take breaks and what to do during them\n- **Post-session review** — what to capture before the session ends\n\nFor: writing sessions, coding sprints, design work, studying, and any cognitively demanding task.`,
    category: "productivity",
    pricingType: "free",
    priceCents: 0,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-flash", "claude-3-5-haiku"],
    useCases: ["Deep work", "Focus", "Time management", "Creative work"],
    industries: ["All"],
    estimatedTimeSavedMinutes: 20,
    previewContent: `You are a deep work coach. Plan my focus session:\n\nTask: [WHAT I'M WORKING ON]\nAvailable time: [X hours]\nCurrent energy level: [High / Medium / Low]\nBiggest distraction risk: [WHAT USUALLY PULLS ME AWAY]\nMy goal for this session: [WHAT DONE LOOKS LIKE]`,
    fullContent: `You are a deep work coach trained in Cal Newport's methodology, the Pomodoro Technique, and flow state research. You help knowledge workers extract maximum output from limited focused time.\n\nPlan my deep work session:\n\n**Task:** [WHAT I'M WORKING ON — be specific]\n**Available time:** [X hours X minutes]\n**Current energy:** [High / Medium / Low]\n**Location:** [Home / Office / Café]\n**Biggest distraction risk:** [Phone / Email / Slack / Noise / My own wandering mind]\n**My definition of success for this session:** [WHAT DONE LOOKS LIKE — specific deliverable]\n**Any constraints:** [Hard stop at X, kids arrive at Y, meeting after — or "none"]\n\n---\n\nDeliver my complete session plan:\n\n# Deep Work Session Plan\n**Task:** [TASK]\n**Duration:** [X hours]\n**Session goal:** [SUCCESS DEFINITION]\n\n---\n\n## Pre-Session Ritual (10 minutes before)\n[Step-by-step ritual to transition your brain into focus mode]\n1. [Physical setup — workspace, water, everything you need]\n2. [Digital shutdown — what to close, silence, block]\n3. [Intention setting — write the session goal on paper]\n4. [Start signal — one consistent trigger to begin]\n\n**Your shutdown list:**\n- Close: [specific apps]\n- Silence: [specific notifications]\n- Block: [if using a blocker, what to block]\n- Sign out of: [anything tempting]\n\n---\n\n## Session Agenda\n[Time-blocked Pomodoro plan]\n\n| Block | Time | Focus target | Output metric |\n|-------|------|-------------|---------------|\n| Warmup | 0:00-0:25 | [Easiest part of the task — build momentum] | [X done] |\n| Deep 1 | 0:30-0:55 | [Core hard work] | [X done] |\n| Break | 0:55-1:05 | [Physical movement only — no screens] | — |\n| Deep 2 | 1:05-1:30 | [Continue core] | [X done] |\n| Break | 1:30-1:40 | [Rest] | — |\n| Deep 3 | 1:40-2:05 | [Final push or review] | [X done] |\n| Wind down | 2:05-2:15 | [Capture, cleanup, plan next session] | — |\n\n---\n\n## Progress Checkpoints\nAt the end of each Pomodoro, ask:\n- [ ] Did I hit my target for this block?\n- [ ] Am I in flow or fighting distraction?\n- [ ] Do I need to adjust the next block's target?\n\n---\n\n## Distraction Shutdown Protocol\n**If phone distracts you:** [Specific action]\n**If someone interrupts:** ["I'm in a focus block until [TIME] — can we connect then?"]\n**If mind wanders:** [Write the thought on paper and return to task]\n**If you hit a block:** [2-minute rule — try for 2 more minutes, then adjust approach]\n**If energy crashes:** [Assess — is it time for a break, food, or a walk?]\n\n---\n\n## Post-Session Review (5 minutes)\n1. What did I actually complete? [vs. goal]\n2. Quality rating: [1-5]\n3. What worked about this session?\n4. What to do differently next time?\n5. Where does the next session pick up?\n\n**Capture:** [Any decisions made / ideas had / things to follow up — don't let them stay in your head]`,
    seoTitle: "Deep Work Session Planner — Cal Newport Method",
    seoDescription: "Plan a distraction-free focus session with a pre-session ritual, Pomodoro agenda, distraction protocol, and progress metrics.",
    seoKeywords: ["deep work prompt", "focus session planner AI", "Cal Newport productivity", "Pomodoro planner AI"],
  },

  // ── r/learnprogramming ─────────────────────────────────────────────────────

  {
    slug: "coding-interview-prep",
    title: "Coding Interview Prep — LeetCode Problem Explainer",
    subtitle: "Understand any algorithm problem from first principles",
    description: "Paste any LeetCode or coding interview problem and get a complete breakdown: brute force → optimal solution progression, time/space complexity analysis, and similar problems to practice.",
    longDescription: `Most LeetCode explanations give you the answer without helping you understand the pattern. This prompt teaches you to fish.\n\nFor any coding interview problem, get:\n- **Problem restatement** — in plain English, with edge cases identified\n- **Brute force approach** — the naive O(n²) solution to start\n- **Optimization path** — how to think your way to the better solution\n- **Optimal solution** — with line-by-line explanation\n- **Time and space complexity** — Big O analysis with explanation\n- **The pattern** — which category this falls into (sliding window, two pointers, DP, etc.)\n- **Variations to practice** — 3 similar problems to reinforce the pattern\n- **Interview tips** — what to say out loud while solving\n\nWorks for: Arrays, Strings, Trees, Graphs, Dynamic Programming, Sorting, Two Pointers, Sliding Window, and all LeetCode categories.`,
    category: "developer-tools",
    pricingType: "paid",
    priceCents: 1999,
    difficulty: "intermediate",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Coding interviews", "LeetCode", "Algorithm study", "FAANG prep"],
    industries: ["Software"],
    estimatedTimeSavedMinutes: 45,
    previewContent: `You are a senior software engineer and coding interview coach. Explain this problem from first principles:\n\nProblem: [PASTE THE LEETCODE PROBLEM OR DESCRIBE IT]\nLanguage: [Python / JavaScript / Java / C++ / Go]\nMy current level: [Beginner / Intermediate — comfortable with basic data structures / Advanced]`,
    fullContent: `You are a senior software engineer who has passed FAANG interviews and now coaches engineers to do the same. You explain problems from first principles — not just the answer, but how to arrive at it.\n\nBreak down this problem:\n\n**Problem:** [PASTE THE FULL PROBLEM STATEMENT]\n**Language:** [Python / JavaScript / Java / C++ / Go]\n**My level:** [Beginner / Intermediate / Advanced]\n**Where I got stuck:** [WHAT YOU TRIED — or "haven't started"]\n\n---\n\nDeliver the complete breakdown:\n\n## Problem Understanding\n**Plain English restatement:** [What this problem is actually asking — no jargon]\n**Input:** [What we receive]\n**Output:** [What we return]\n**Edge cases to consider:**\n- [Edge case 1 — e.g. empty array, null, single element]\n- [Edge case 2]\n- [Edge case 3]\n\n---\n\n## Brute Force Approach\n**Idea:** [The obvious but slow solution]\n\n\`\`\`python\n# [Brute force code with comments]\n\`\`\`\n\n**Time complexity:** O([X]) — [why]\n**Space complexity:** O([X]) — [why]\n**Why this is too slow:** [Concrete explanation]\n\n---\n\n## Optimization Path\n[Walk me through HOW TO THINK toward the optimal solution]\n\n**Insight 1:** [First realization that leads to improvement]\n**Insight 2:** [What data structure or technique unlocks the optimization]\n**Insight 3:** [The key \"aha\" moment]\n\n---\n\n## Optimal Solution\n\n\`\`\`python\n# [Optimal solution — every line commented]\ndef solution(...):\n    # Step 1: [what and why]\n    \n    # Step 2: [what and why]\n    \n    # Step 3: [what and why]\n\`\`\`\n\n**Dry run with example:**\n[Walk through the code with the sample input — show every variable change]\n\n**Time complexity:** O([X]) — [explanation]\n**Space complexity:** O([X]) — [explanation]\n\n---\n\n## The Pattern\n**Category:** [Sliding Window / Two Pointers / Binary Search / BFS/DFS / Dynamic Programming / Greedy / Hash Map / Stack / Heap]\n\n**How to recognize this pattern in future:**\n[2-3 signals in the problem statement that suggest this approach]\n\n---\n\n## Interview Strategy\n**What to say out loud:**\n1. [Repeat the problem in your own words]\n2. [Clarify edge cases]\n3. [State brute force first]\n4. [Explain optimization thinking]\n5. [Code while narrating]\n\n**Common mistakes:** [What to avoid on this type of problem]\n\n---\n\n## Practice Problems (Similar Pattern)\n1. **[Problem name]** (LeetCode #[X]) — [Difficulty] — [How it relates]\n2. **[Problem name]** (LeetCode #[X]) — [Difficulty]\n3. **[Problem name]** (LeetCode #[X]) — [Difficulty]\n\n**Recommended order to study this pattern:** [Sequence of 5-10 problems that build the skill]`,
    seoTitle: "Coding Interview Problem Explainer — LeetCode Prep",
    seoDescription: "Get any coding problem broken down: brute force, optimal solution, complexity analysis, pattern identification, and practice problems.",
    seoKeywords: ["LeetCode prompt", "coding interview AI", "algorithm explainer prompt", "FAANG interview prep AI"],
  },
  {
    slug: "code-learning-curriculum",
    title: "Personalized Coding Curriculum — Learn Any Language or Framework",
    subtitle: "A structured path from zero to job-ready",
    description: "Describe your goal (first job, side project, career switch) and get a week-by-week coding curriculum with specific resources, projects, and checkpoints — no fluff, no wasted time.",
    longDescription: `Learning to code without a curriculum means bouncing between YouTube tutorials, random Stack Overflow answers, and half-finished courses. This prompt gives you a structured path.\n\nTell it:\n- What you want to learn (Python, JavaScript, React, Swift, etc.)\n- Your current level\n- Your goal (first dev job, freelance, build a specific project)\n- Hours per week you can commit\n\nGet a complete curriculum with:\n- Phase-by-phase learning objectives\n- Specific resources for each week (real courses, books, docs — not generic)\n- Practice projects that build your portfolio\n- Weekly checkpoints to verify you've learned what matters\n- Common pitfalls to avoid at each stage\n- What to build as your capstone that gets you hired or launched\n\nBased on how professional bootcamps structure learning — but free.`,
    category: "developer-tools",
    pricingType: "paid",
    priceCents: 1499,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet"],
    useCases: ["Learning to code", "Career switch", "Skill development", "Bootcamp alternative"],
    industries: ["Education", "Software"],
    estimatedTimeSavedMinutes: 60,
    previewContent: `You are a senior developer and coding educator. Build a personalized curriculum for:\n\nWhat to learn: [LANGUAGE/FRAMEWORK/TECH]\nCurrent level: [Complete beginner / Know basics of X / Intermediate dev switching]\nGoal: [First dev job / Freelance / Build [specific app] / Contribute to OSS]\nHours per week: [X hours]\nTimeline: [X weeks or months]`,
    fullContent: `You are a senior software engineer and coding educator who has trained hundreds of developers at bootcamps and through online courses. You know the fastest path from zero to productive and the common traps that slow learners down.\n\nBuild a personalized coding curriculum:\n\n**What to learn:** [LANGUAGE, FRAMEWORK, OR TECH STACK — e.g. "Python for backend web dev", "React + TypeScript", "iOS with Swift"]\n**Current level:** [Complete beginner / Know another language / Know basics of this language / Intermediate switching specialization]\n**End goal:** [First dev job / Freelance projects / Build [specific app] / Contribute to open source / General skill-building]\n**Hours per week:** [X hours — be honest]\n**Timeline:** [X weeks / X months — or "no fixed deadline"]\n**Resources budget:** [Free only / Under $50 / Happy to invest in Udemy/Pluralsight]\n**Learning style:** [Video courses / Reading/documentation / Projects first / Mixed]\n\n---\n\nDeliver the complete curriculum:\n\n# [LANGUAGE/FRAMEWORK] Curriculum\n**Goal:** [YOUR GOAL]\n**Total duration:** [X weeks]\n**Weekly commitment:** [X hours]\n\n---\n\n## Phase 1: Foundation (Weeks 1-X)\n**Objective:** [What you can do by end of this phase]\n\n### Week 1: [Topic]\n**Learn:**\n- [Concept 1]\n- [Concept 2]\n\n**Resources:**\n- [Specific course/book/docs — with chapter/section] — [free/paid, $X]\n\n**Practice:**\n- [Specific exercise — e.g. "Build a CLI calculator that handles all operators"]\n\n**Checkpoint:** [Can you do X without looking it up? Yes → move on. No → spend one more day.]\n\n### Week 2-X: [Same format]\n\n---\n\n## Phase 2: Building (Weeks X-X)\n**Objective:** [What you can do by end of this phase]\n\n[Same weekly format — but now includes a running project]\n\n**Phase project:** [Specific project that uses everything from Phase 1 — with requirements]\n\n---\n\n## Phase 3: Real-World (Weeks X-X)\n**Objective:** [Job-ready / Portfolio-ready / Launch-ready]\n\n[Same format]\n\n---\n\n## Capstone Project\n**Project:** [Specific project that proves you've learned the skill]\n**Requirements:**\n- [Feature 1]\n- [Feature 2]\n- [Technical requirement]\n**Why this gets you hired/launched:** [What it demonstrates]\n\n---\n\n## What to Avoid\n1. **Tutorial hell:** [How to know when you're in it and how to escape]\n2. **[Common mistake 2]:** [Why and how to avoid]\n3. **[Common mistake 3]:**\n\n## The Resources Stack\n[Complete recommended resource list organized by phase — with links/titles and why each one]\n\n## If You Fall Behind\n[What to cut, what to keep, how to get back on track without quitting]`,
    seoTitle: "Coding Curriculum Generator — Learn Any Language or Framework",
    seoDescription: "Get a week-by-week coding curriculum with specific resources, projects, and checkpoints — tailored to your goal and schedule.",
    seoKeywords: ["coding curriculum prompt", "learn programming AI", "coding roadmap generator", "programming curriculum AI"],
  },
  {
    slug: "rubber-duck-debugger",
    title: "Rubber Duck Debugger — Explain Your Bug and Fix It",
    subtitle: "The fastest way to unstick yourself from any bug",
    description: "Describe your bug out loud (in text) and get a structured debugging session: hypothesis list, diagnostic steps, likely root causes, and a fix — plus an explanation of what went wrong.",
    longDescription: `The rubber duck debugging technique works because explaining your code to something forces you to think about it differently. This prompt is a rubber duck that talks back.\n\nDescribe:\n- What your code is supposed to do\n- What it's actually doing\n- What you've already tried\n\nGet:\n- A ranked list of likely root causes (with probability estimates)\n- Specific diagnostic commands to run to confirm the cause\n- The most likely fix\n- An explanation of why the bug happened\n- How to prevent this class of bug in the future\n- What to add to your debugging mental model\n\nWorks for: null pointer exceptions, async race conditions, CSS layout bugs, API failures, database query issues, state management bugs, and any code that doesn't behave as expected.`,
    category: "developer-tools",
    pricingType: "free",
    priceCents: 0,
    difficulty: "beginner",
    modelSupport: ["gpt-4o", "claude-3-7-sonnet", "gemini-1.5-pro", "claude-3-5-haiku"],
    useCases: ["Debugging", "Code troubleshooting", "Learning", "Problem solving"],
    industries: ["Software", "All"],
    estimatedTimeSavedMinutes: 30,
    previewContent: `You are a patient senior engineer acting as my rubber duck. Help me debug:\n\nLanguage/framework: [WHAT I'M USING]\nWhat it should do: [EXPECTED BEHAVIOR]\nWhat it's doing: [ACTUAL BEHAVIOR]\nRelevant code: [PASTE CODE]\nWhat I've tried: [LIST]\nError message (if any): [ERROR]`,
    fullContent: `You are a patient senior software engineer acting as an expert rubber duck debugger. Your job is not to just give me the answer — it's to help me understand what's wrong and why, so I learn to debug better.\n\n**Language/Framework/Stack:** [WHAT YOU'RE USING]\n**What it should do:** [EXPECTED BEHAVIOR — be specific]\n**What it's actually doing:** [ACTUAL BEHAVIOR — exact error messages, wrong output, unexpected behavior]\n**Relevant code:**\n\`\`\`\n[PASTE YOUR CODE HERE]\n\`\`\`\n**Error message (if any):**\n\`\`\`\n[PASTE EXACT ERROR]\n\`\`\`\n**What I've already tried:**\n- [Thing 1]\n- [Thing 2]\n**How long I've been stuck:** [X minutes / hours]\n\n---\n\nDeliver a structured debugging session:\n\n## Initial Read\n[First impression of the code — what you notice immediately, without diving into the bug yet]\n\n## Hypothesis List (Ranked by Probability)\n| # | Hypothesis | Probability | Why I think this |\n|---|-----------|-------------|------------------|\n| 1 | [Most likely cause] | [X%] | [Reasoning] |\n| 2 | [Second most likely] | [X%] | [Reasoning] |\n| 3 | [Less likely but possible] | [X%] | [Reasoning] |\n\n## Diagnostic Steps\n[In order — run these to confirm which hypothesis is right]\n\n**Step 1:** [Specific thing to add/check/log]\n\`\`\`\n[Exact code to add or command to run]\n\`\`\`\n→ If you see [X]: hypothesis 1 is correct\n→ If you see [Y]: hypothesis 2 is correct\n\n**Step 2:** [Next diagnostic]\n\n## Most Likely Fix\n\`\`\`\n[The fix — with explanation of every change]\n\`\`\`\n\n**Why this works:** [Explanation]\n\n## Root Cause Explanation\n[What actually went wrong — technical explanation at the right depth]\n\n## How to Prevent This Class of Bug\n[Pattern or practice to avoid this in the future]\n\n## What to Add to Your Mental Model\n[One insight about [language/framework] that this bug reveals — something worth remembering]`,
    seoTitle: "Rubber Duck Debugger Prompt — Fix Any Code Bug",
    seoDescription: "Describe your bug and get a structured debugging session: root cause hypotheses, diagnostic steps, the fix, and what you learned.",
    seoKeywords: ["debugging prompt", "rubber duck debugger AI", "code bug fixer", "programming debugging AI"],
  },
];

async function seed() {
  console.log("🌱 Seeding batch 3 (Reddit-targeted) prompts...\n");

  let inserted = 0;
  let skipped = 0;

  for (const p of PROMPTS) {
    const existing = await db.select({ id: schema.prompts.id }).from(schema.prompts).where(eq(schema.prompts.slug, p.slug));
    if (existing.length > 0) {
      console.log(`  ↩ Skipped: ${p.title}`);
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
      salesCount: Math.floor(Math.random() * 50) + 5,
      avgRating: (Math.random() * 0.7 + 4.2).toFixed(2),
      reviewCount: Math.floor(Math.random() * 20) + 3,
    });

    console.log(`  ✓ ${p.title} (${p.pricingType === "free" ? "FREE" : `$${(p.priceCents / 100).toFixed(2)}`})`);
    inserted++;
  }

  console.log(`\n✅ Done! ${inserted} inserted, ${skipped} skipped.`);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
