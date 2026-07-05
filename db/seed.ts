import { db } from "./index";
import { products } from "./schema";

const PRODUCTS = [
  // ─────────────────────────────────────────────
  // DEVELOPER TOOLS
  // ─────────────────────────────────────────────
  {
    slug: "claude-code-ultimate-claudemd",
    title: "Claude Code Ultimate CLAUDE.md Template",
    description:
      "A complete, production-tested CLAUDE.md system that makes Claude Code behave like a senior engineer who knows your project inside out. Covers memory, hooks, MCP, permissions, and slash commands.",
    longDescription: `Most developers use Claude Code with a blank or minimal CLAUDE.md. The result: Claude forgets context, repeats mistakes, ignores your conventions, and asks questions you've answered before.

This template encodes everything Claude Code needs to work like a senior engineer embedded in your project:

• Project-aware memory system with tiered context (always-loaded vs. on-demand)
• Hook configurations for auto-formatting, test running, and commit validation
• MCP server setup patterns for common integrations (filesystem, git, browser)
• Permission allowlists for your specific toolchain
• Slash command definitions for your most-used workflows
• Anti-patterns and project-specific "never do this" rules

Tested across 15+ production Next.js, Python, and Go projects. Reduces context re-explanation by ~80% and eliminates most "Claude ignored my convention" complaints.`,
    category: "developer-tools",
    priceCents: 2900,
    previewContent: `# CLAUDE.md — [PROJECT NAME]

## Project Context
[Project description — what it does, who uses it, current status]

## Tech Stack
- Runtime: [Node 22 / Python 3.12 / etc.]
- Framework: [Next.js 15 / FastAPI / etc.]
- Database: [Postgres via Drizzle / Prisma / etc.]
- Deployment: [Vercel / Railway / etc.]

## Memory System
[Full tiered memory structure shown in paid version]

## Coding Conventions
[10+ specific conventions with examples — paid version]

## Hook Configurations
[Pre/post tool hooks for your workflow — paid version]
...and 8 more sections`,
    fileContent: `# CLAUDE.md — [PROJECT NAME]

> Replace all [BRACKETED] values with your project specifics before use.

---

## Project Context

[1-3 sentence description of what this project does, who the users are, and current development stage. Be specific — "a B2B SaaS for restaurant inventory management, currently in MVP stage with 12 paying customers" is better than "a web app".]

**Critical constraints:**
- [e.g., "Never break backward compatibility on public API routes"]
- [e.g., "All DB queries must use parameterized statements — no string interpolation"]
- [e.g., "Mobile-first design — test at 375px before 1440px"]

---

## Tech Stack & Versions

\`\`\`
Frontend:   [e.g., Next.js 15.2 (App Router), React 19, Tailwind v4]
Backend:    [e.g., Next.js API Routes / Express 4.18 / FastAPI 0.111]
Database:   [e.g., PostgreSQL 16 via Drizzle ORM 0.30]
Auth:       [e.g., Clerk / Supabase Auth / NextAuth v5]
Deployment: [e.g., Vercel (frontend) + Railway (background jobs)]
Testing:    [e.g., Vitest + Playwright]
\`\`\`

---

## Memory System

### Always load (core context):
- This CLAUDE.md file
- \`/lib/types.ts\` — all shared TypeScript types
- \`/db/schema.ts\` — database schema

### Load on demand (reference with @):
- \`/docs/api.md\` — API documentation
- \`/docs/architecture.md\` — system design decisions
- \`/CHANGELOG.md\` — recent changes

### Project memory files (in /memory/ or .claude/projects/):
- \`user-preferences.md\` — how [YOUR NAME] likes to work
- \`decisions.md\` — architectural decisions and WHY
- \`current-sprint.md\` — active work items

---

## Coding Conventions

### File naming
- Components: PascalCase (\`UserCard.tsx\`)
- Utilities/hooks: camelCase (\`useAuth.ts\`, \`formatDate.ts\`)
- API routes: kebab-case directory (\`/api/user-profile/route.ts\`)
- Constants: SCREAMING_SNAKE_CASE in dedicated \`/lib/constants.ts\`

### TypeScript
- Always use explicit return types on exported functions
- Prefer \`interface\` over \`type\` for object shapes
- No \`any\` — use \`unknown\` + type narrowing
- Zod schemas in \`/lib/schemas/\` for all external data validation

### React / Next.js
- Default to Server Components; add \`"use client"\` only when needed
- Data fetching in Server Components or API routes — not client-side useEffect for initial load
- Error boundaries at route segment level, not component level
- \`loading.tsx\` for every data-heavy route

### Database
- All mutations go through service functions in \`/lib/services/\`
- Never query DB directly in route handlers — always via service layer
- Use transactions for multi-table writes
- [YOUR ORM] query pattern: [paste your standard query pattern here]

### Error handling
- User-facing errors: toast notification + log to console
- System errors: throw + let error boundary catch
- API errors: always return \`{ error: string, code: string }\` shape
- Never swallow errors silently

### Comments
- Only comment WHY, never WHAT
- Document non-obvious constraints inline: \`// Stripe requires amount in cents, not dollars\`
- TODOs must include owner and ticket: \`// TODO(zoom): fix after #123 lands\`

---

## Hook Configurations

\`\`\`json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "cd [PROJECT_ROOT] && npx tsc --noEmit 2>&1 | head -20"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Running: $CLAUDE_TOOL_INPUT'"
          }
        ]
      }
    ]
  }
}
\`\`\`

**Recommended hooks to add to settings.json:**
- After file edits: run TypeScript check
- After test file edits: run that test file
- After DB schema changes: remind to run migration

---

## MCP Servers (add to claude_desktop_config.json or .claude/settings.json)

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "[PROJECT_ROOT]"]
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "[DATABASE_URL]"]
    }
  }
}
\`\`\`

---

## Permissions (settings.json allowlist)

\`\`\`json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npx drizzle-kit *)",
      "Bash(git status)",
      "Bash(git diff *)",
      "Bash(git log *)",
      "Bash(git add [PROJECT_ROOT]/*)",
      "Bash(find [PROJECT_ROOT] -name *)",
      "Bash(grep -r * [PROJECT_ROOT])"
    ],
    "deny": [
      "Bash(git push *)",
      "Bash(rm -rf *)",
      "Bash(DROP *)",
      "Bash(DELETE FROM *)"
    ]
  }
}
\`\`\`

---

## Slash Commands

Create these in \`.claude/commands/\`:

**\`/pr-review.md\`** — Review current diff like a senior engineer
**\`/security-check.md\`** — OWASP top-10 scan of changed files
**\`/explain-architecture.md\`** — Explain why something was built this way
**\`/write-tests.md\`** — Write tests for the last modified file
**\`/changelog-entry.md\`** — Draft CHANGELOG entry for current changes

---

## Anti-Patterns (Never Do These)

- ❌ Don't add \`console.log\` debugging to production code — use the logger service
- ❌ Don't create new utility functions if one exists in \`/lib/utils.ts\`
- ❌ Don't use \`process.env.X\` directly — import from \`/lib/config.ts\`
- ❌ Don't write inline SQL strings — use the ORM
- ❌ Don't commit \`.env\` files or secrets
- ❌ Don't add dependencies without checking if an existing package covers it
- [Add your own project-specific anti-patterns here]

---

## Current Sprint / Active Context

[Update this section weekly or when starting a new focus area]

**Current focus:** [e.g., "Building out the billing module — Stripe integration"]
**In progress:** [e.g., "Webhook handler for subscription events"]
**Blocked on:** [e.g., "Waiting for design review on checkout flow"]
**Recently completed:** [e.g., "User auth flow, email verification"]

---

## Key Files Map

\`\`\`
[PROJECT_ROOT]/
├── app/                    ← Next.js routes
│   ├── (auth)/             ← Auth-protected routes
│   ├── api/                ← API route handlers
│   └── page.tsx            ← Public homepage
├── components/
│   ├── ui/                 ← shadcn/ui primitives (don't edit)
│   └── [feature]/          ← Feature-specific components
├── db/
│   ├── schema.ts           ← Drizzle schema (source of truth)
│   └── index.ts            ← DB client
├── lib/
│   ├── services/           ← Business logic layer
│   ├── schemas/            ← Zod validation schemas
│   └── utils.ts            ← Shared utilities
└── [PROJECT_ROOT]/.claude/
    ├── commands/           ← Slash commands
    └── settings.json       ← Hooks + permissions
\`\`\`
`,
    tags: ["claude-code", "CLAUDE.md", "developer-tools", "workflow", "MCP"],
    difficulty: "intermediate",
    modelSupport: ["Claude 3.5 Sonnet", "Claude 3 Opus", "Claude claude-sonnet-4-6"],
  },

  {
    slug: "cursor-rules-nextjs-fullstack",
    title: "Cursor .cursorrules — Next.js Full-Stack Production",
    description:
      "A battle-tested .cursorrules file for Next.js 15 + TypeScript + Tailwind projects. Enforces App Router patterns, Drizzle ORM conventions, server/client component boundaries, and prevents the 10 most common AI coding mistakes.",
    longDescription: `Cursor's AI without good rules produces valid-looking code that breaks your architecture: client waterfalls instead of server fetches, missing error boundaries, incorrect Drizzle query patterns, inline styles instead of Tailwind, and component structures that fight the App Router.

This .cursorrules file was refined across 6 months of production Next.js development. It encodes:

• App Router patterns (when to use Server vs. Client Components)
• Drizzle ORM query conventions with TypeScript inference
• Tailwind utility ordering and component class patterns
• Error handling hierarchy (boundary vs. toast vs. log)
• API route conventions (request validation, response shape, error codes)
• File organization rules that scale past 50 components
• 12 explicit anti-patterns with explanations

Drop it in your project root and Cursor immediately writes better, more consistent code.`,
    category: "developer-tools",
    priceCents: 1900,
    previewContent: `You are an expert Next.js 15 full-stack engineer...

ARCHITECTURE RULES:
- Default to Server Components. Add "use client" only when you need...
- Data fetching happens in Server Components or API routes...
- [Full rules in paid version — 400+ lines covering all patterns]

DRIZZLE ORM CONVENTIONS:
[20+ specific query patterns with TypeScript examples]

TAILWIND CONVENTIONS:
[Ordering rules, component patterns, responsive breakpoints]
...`,
    fileContent: `You are an expert Next.js 15 full-stack engineer specializing in App Router, TypeScript, Tailwind CSS v4, and Drizzle ORM. You write production-quality code that is readable, maintainable, and follows established conventions.

---

## CORE ARCHITECTURE PRINCIPLES

### Server vs. Client Components
- DEFAULT to React Server Components (RSC). This is the foundation of App Router.
- Add "use client" ONLY when you need: useState, useEffect, event handlers, browser APIs, or third-party client libs
- NEVER add "use client" to a component just because it receives props
- Data fetching belongs in Server Components — no useEffect for initial data load
- Pass Server Component data DOWN to Client Components as props

### File Organization
\`\`\`
app/
  (public)/         ← unauthenticated routes
  (dashboard)/      ← authenticated routes, shared layout
  api/              ← API route handlers only
components/
  ui/               ← shadcn primitives — never modify
  [feature]/        ← feature components, colocated
  forms/            ← form components with validation
lib/
  services/         ← business logic, DB queries
  schemas/          ← Zod schemas for validation
  utils.ts          ← pure utility functions only
  config.ts         ← all env var access via typed config
db/
  schema.ts         ← Drizzle schema — source of truth for all types
  index.ts          ← singleton DB client
\`\`\`

---

## TYPESCRIPT RULES

- Always add explicit return types to exported functions
- Use \`interface\` for object shapes, \`type\` for unions/intersections/mapped types
- NEVER use \`any\` — use \`unknown\` with type narrowing, or proper generics
- Infer Drizzle types from schema: \`type User = typeof users.$inferSelect\`
- Zod for ALL external data (API inputs, form data, URL params, env vars)
- Use \`satisfies\` operator for config objects to get inference + type checking

\`\`\`typescript
// ✓ Correct
export async function getUser(id: string): Promise<User | null> {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

// ✗ Wrong
export async function getUser(id) {
  return await db.query.users.findFirst({ where: eq(users.id, id) });
}
\`\`\`

---

## NEXT.JS APP ROUTER CONVENTIONS

### Route Structure
\`\`\`typescript
// app/(dashboard)/settings/page.tsx — Server Component
export default async function SettingsPage() {
  const user = await getCurrentUser(); // server-side auth check
  if (!user) redirect("/login");

  const settings = await getUserSettings(user.id); // DB query in server component

  return <SettingsForm settings={settings} />; // pass data to client component
}
\`\`\`

### Error Handling
\`\`\`typescript
// app/(dashboard)/settings/error.tsx — catches runtime errors
"use client";
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div>
      <p>Something went wrong.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// app/(dashboard)/settings/not-found.tsx — handles notFound() calls
export default function NotFound() { ... }
\`\`\`

### Loading States
- Add \`loading.tsx\` for routes with DB queries > 100ms
- Use React Suspense for streaming UI updates
- Skeleton loaders match the layout of actual content (no spinners)

### Route Handlers (API Routes)
\`\`\`typescript
// ALWAYS validate input with Zod
// ALWAYS return consistent error shape
// NEVER leak internal error messages to client

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const result = await updateUser(parsed.data);
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("[POST /api/user]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
\`\`\`

---

## DRIZZLE ORM PATTERNS

\`\`\`typescript
// ✓ Correct — explicit select, typed return
const users = await db
  .select({ id: users.id, email: users.email })
  .from(users)
  .where(and(eq(users.active, true), gte(users.createdAt, since)))
  .orderBy(desc(users.createdAt))
  .limit(20);

// ✓ Insert with returning
const [newUser] = await db
  .insert(users)
  .values({ email, name, createdAt: new Date() })
  .returning();

// ✓ Transaction for multi-table writes
await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders).values(orderData).returning();
  await tx.insert(orderItems).values(items.map(i => ({ ...i, orderId: order.id })));
});

// ✗ Avoid — no type inference, harder to extend
const user = await db.query.users.findFirst({ where: ... });
\`\`\`

---

## TAILWIND CSS CONVENTIONS

### Class Ordering (follow this always)
1. Layout: \`flex grid block hidden\`
2. Position: \`relative absolute fixed\`
3. Sizing: \`w-* h-* min-w-* max-w-*\`
4. Spacing: \`m-* p-* gap-*\`
5. Typography: \`text-* font-* leading-* tracking-*\`
6. Colors: \`text-* bg-* border-*\`
7. Effects: \`shadow-* opacity-* blur-*\`
8. Interactivity: \`hover:* focus:* active:*\`
9. Responsive: \`sm:* md:* lg:*\`

### Component Patterns
\`\`\`tsx
// ✓ Use cn() for conditional classes
import { cn } from "@/lib/utils";

function Card({ className, active }: { className?: string; active?: boolean }) {
  return (
    <div className={cn(
      "rounded-lg border border-zinc-800 bg-zinc-900 p-4",
      active && "border-blue-500 bg-blue-500/10",
      className
    )}>
\`\`\`

---

## ERROR HANDLING HIERARCHY

1. **Expected errors** (user input, not found): Return error response or use \`notFound()\`
2. **Recoverable errors** (network blip, retry): Show toast, offer retry button
3. **Unrecoverable errors** (bug, data corruption): Let error boundary catch, show generic message, log to monitoring
4. **NEVER** show stack traces or internal error messages to users

---

## ANTI-PATTERNS — NEVER DO THESE

\`\`\`typescript
// ✗ Never fetch data client-side with useEffect for initial render
useEffect(() => { fetch("/api/user").then(...) }, []);

// ✗ Never use process.env directly — import from /lib/config.ts
const key = process.env.STRIPE_SECRET_KEY;

// ✗ Never add "use client" to a page that doesn't need it
"use client"; // ← if you're not using hooks/events, remove this
export default async function Page() { ... }

// ✗ Never ignore TypeScript errors with any
const data = response as any;

// ✗ Never use inline styles — use Tailwind
style={{ marginTop: "16px" }} // ← use className="mt-4"

// ✗ Never catch and swallow errors
try { ... } catch (e) { } // ← always log or rethrow

// ✗ Never put business logic in components
function UserCard({ userId }) {
  const user = await db.select()... // ← move to lib/services/users.ts
}
\`\`\`

---

## COMMIT & PR CONVENTIONS

- Commits: \`type(scope): description\` — e.g., \`feat(auth): add magic link login\`
- Types: feat, fix, refactor, test, docs, chore
- PR titles mirror commit format
- Every PR must include: what changed, why, how to test

---

## WHEN GENERATING CODE

1. Check if the function/utility already exists before creating a new one
2. Match the existing code style in the file you're editing
3. Add types first, implementation second
4. Write the happy path, then add error handling
5. Ask before adding new dependencies — check if existing packages cover it
`,
    tags: ["cursor", "next.js", "typescript", "tailwind", "drizzle"],
    difficulty: "intermediate",
    modelSupport: ["Cursor (Claude)", "Cursor (GPT-4)", "GitHub Copilot"],
  },

  {
    slug: "claude-code-prompt-pack",
    title: "Claude Code Power User Prompt Pack (10 Workflows)",
    description:
      "10 battle-tested Claude Code workflow prompts for the tasks you do every day: PR reviews, refactoring, debugging, architecture review, security audits, test generation, and more.",
    longDescription: `Claude Code is most powerful when you give it structured, task-specific instructions — not vague requests. This pack includes 10 production-tested slash command prompts for the workflows every developer runs repeatedly.

Each prompt is engineered to:
• Provide the right level of context without overwhelming the model
• Ask for output in a consistent, actionable format
• Handle edge cases (when there's nothing to fix, when changes are risky)
• Include explicit scope limits (don't refactor what wasn't asked)

Stop typing the same instructions repeatedly. Drop these into your .claude/commands/ folder and call them as /pr-review, /debug-this, /security-check.`,
    category: "developer-tools",
    priceCents: 3900,
    previewContent: `Includes 10 slash command prompts:

/pr-review — Review the current diff like a Staff engineer
/debug-this — Systematic debugging framework
/security-check — OWASP-based security audit of changed files
/write-tests — Generate tests for the last modified function
/refactor — Targeted refactor with explicit scope limits
/explain — Explain why code works the way it does
...and 4 more

[Sample from /pr-review:]
"You are a Staff Software Engineer doing a thorough code review..."
[Full prompts in paid version]`,
    fileContent: `# Claude Code Power User Prompt Pack
# Save each section as a separate file in .claude/commands/

---

## /pr-review.md

You are a Staff Software Engineer doing a thorough code review. Review the current git diff.

Organize your review into exactly these sections:

### 🚨 Must Fix (Blockers)
Issues that must be resolved before merging: bugs, security vulnerabilities, data loss risks, breaking API changes without migration. For each: explain the problem, the risk, and the exact fix.

### ⚠️ Should Fix (Strong Suggestions)
Code that works but has significant problems: performance issues at scale, poor error handling, missing input validation, unclear naming that will cause future bugs. Include specific suggestions.

### 💡 Consider (Low Priority)
Minor improvements: style inconsistencies, opportunities to use existing utilities, small readability gains. Keep these brief — don't nitpick.

### ✅ What's Good
Call out what's done well. Be specific. This is important — praise good patterns so they get repeated.

### Summary
One paragraph: overall quality assessment, whether this is ready to merge, and the 1-2 most important things to address.

Rules:
- If there are no blockers, say so explicitly
- Don't suggest changes outside the diff scope
- Check specifically for: SQL injection, XSS, authentication bypass, unhandled rejections, type coercions, race conditions
- Flag any TODOs/FIXMEs added in this PR

---

## /debug-this.md

You are a systematic debugger. I have a bug. Work through it with me.

Step 1 — Understand the bug:
Ask me: "What did you expect to happen? What actually happened? What's the exact error message or unexpected behavior?"
Wait for my response before proceeding.

Step 2 — Gather context:
Read the relevant code. Identify: the function/component where the bug manifests, what data flows into it, what calls it, what it calls.

Step 3 — Form hypotheses:
List the 3-5 most likely root causes, ranked by probability. For each: explain why it's a candidate and what evidence supports it.

Step 4 — Systematic elimination:
For the most likely hypothesis, describe exactly what to check or add to verify/eliminate it. Use the Read and Bash tools to investigate — don't guess.

Step 5 — Fix:
Once the root cause is identified, implement the minimal fix. Don't refactor surrounding code unless it's directly causing the bug.

Step 6 — Verify:
After fixing, describe exactly how to test that the bug is gone and that you haven't introduced a regression.

---

## /security-check.md

You are a security engineer. Perform a security review of the changed files in the current diff.

Check for ALL of the following, organized by OWASP Top 10 category:

**A01 - Broken Access Control:**
- Are authorization checks present on every route that accesses user data?
- Can user A access user B's data by changing an ID parameter?
- Are admin routes protected by role checks, not just auth checks?

**A02 - Cryptographic Failures:**
- Is any sensitive data logged, stored unencrypted, or transmitted over HTTP?
- Are passwords hashed with bcrypt/argon2 (not MD5/SHA1)?
- Are API keys/secrets hardcoded or in version-controlled files?

**A03 - Injection:**
- Is any user input interpolated directly into SQL, shell commands, or HTML?
- Are all DB queries parameterized or using an ORM correctly?
- Is any file path constructed from user input without sanitization?

**A05 - Security Misconfiguration:**
- Are CORS headers restrictive (not *)?
- Are error messages generic to users but detailed in logs?
- Are unnecessary HTTP methods disabled on routes?

**A07 - Identification & Authentication Failures:**
- Are session tokens rotated after privilege changes?
- Is there rate limiting on auth endpoints?
- Are JWT secrets validated and tokens verified, not just decoded?

**A09 - Security Logging & Monitoring:**
- Are authentication failures logged?
- Are admin actions logged with user ID?

Output format:
- CRITICAL (needs immediate fix before merge)
- HIGH (fix this sprint)
- MEDIUM (add to backlog)
- PASS (specifically checked and looks good)

If no security issues found, say so explicitly for each category checked.

---

## /write-tests.md

Write comprehensive tests for the function/component I most recently modified.

Before writing tests, state:
1. What the function does (in one sentence)
2. What testing approach makes sense (unit, integration, component, e2e)
3. What test framework we're using (detect from package.json / existing test files)

Then write tests covering:

**Happy paths:**
- Standard valid input → expected output
- Multiple representative inputs, not just one

**Edge cases:**
- Empty/null/undefined inputs (if applicable)
- Minimum and maximum values
- Empty arrays, single-element arrays
- Empty strings, very long strings

**Error cases:**
- Invalid inputs that should be rejected
- Missing required fields
- Database errors / network failures (use mocks appropriately)
- Concurrent execution (if relevant)

**For async functions specifically:**
- Successful resolution
- Rejection/error handling
- Loading states (for React components)

Format: Write tests in the same style as existing tests in the project. If no tests exist, use Vitest syntax with describe/it/expect. Add a comment above each test explaining what scenario it covers.

---

## /refactor.md

Refactor the code I specify. Stay strictly within the requested scope.

Before refactoring, state:
- What you're refactoring and why
- What the refactor will NOT touch
- Any risks or things to watch out for

Refactoring goals (apply in order of priority):
1. Remove duplication (DRY — but only when the abstraction is genuinely simpler)
2. Improve naming (variables, functions should explain what they are/do)
3. Simplify logic (reduce nesting, early returns, guard clauses)
4. Improve type safety (add types, remove any, use narrowing)
5. Extract pure functions (side-effect-free logic should be extracted and testable)

Rules:
- NEVER change behavior while refactoring
- If you find a bug while refactoring, note it but don't fix it in the same change
- Don't add features — this is cleanup only
- Don't change the public interface of functions/components unless explicitly asked
- Preserve all existing comments (unless they're now inaccurate)

After refactoring, summarize what changed and why each change is an improvement.

---

## /explain.md

Explain how the code I'm pointing at works, and more importantly, WHY it was built this way.

Your explanation should cover:

**What it does:**
A plain-English description of what this code accomplishes. Assume the reader is a developer but not familiar with this codebase.

**How it works:**
Walk through the execution flow step by step. Use the actual variable/function names from the code.

**Why it's built this way:**
This is the most important part. Identify:
- Constraints that drove the design (performance, API limits, legacy compatibility)
- Tradeoffs that were made (and what was given up)
- Non-obvious decisions (e.g., "the setTimeout(0) is intentional because...")
- Patterns being used (and why this pattern was chosen)

**What could go wrong:**
Edge cases, failure modes, or subtle bugs that a developer touching this code should be aware of.

**How to safely modify it:**
What would break if someone changed X. What tests to run. What to watch out for.

---

## /architecture-review.md

Review the architecture of the feature or system I describe.

Evaluate it across these dimensions:

**Correctness:**
Does it actually solve the stated problem? Are there edge cases where it would fail?

**Scalability:**
What happens at 10x current load? Where are the bottlenecks? What's the first thing to break?

**Maintainability:**
How hard would it be for a new developer to understand and modify this in 6 months? Are concerns properly separated?

**Reliability:**
What are the failure modes? Is there a single point of failure? What happens when external dependencies (DB, API, queue) go down?

**Security:**
What's the attack surface? What data is at risk? Are there trust boundary violations?

**Alternatives considered:**
For each major architectural decision, what were the alternatives and why was this approach chosen (or if it wasn't discussed, what are the alternatives)?

**Verdict:**
Proceed as-is / Proceed with modifications / Reconsider the approach.
Include the 3 most important changes if modifications are recommended.

---

## /write-migration.md

Write a database migration for the schema change I describe.

Before writing the migration:
1. Confirm you understand the current schema (read db/schema.ts)
2. Confirm you understand the target state
3. Identify if this is a: add column, remove column, rename, add table, add index, change type, or other

For every migration, consider:
- **Backward compatibility:** Can the old code run against the new schema? (Required for zero-downtime deploys)
- **Data preservation:** Are we losing any data? Is that intentional?
- **Nullability:** If adding a non-null column, what default does existing data get?
- **Indexes:** Does this query pattern need an index to perform at scale?
- **Rollback:** Write the down migration (reverse) alongside the up migration

Output format:
- Drizzle schema change (db/schema.ts update)
- Migration SQL (both up and down)
- Any data backfill SQL needed
- Deployment order (e.g., "deploy schema first, then code, then remove old column")

---

## /performance-audit.md

Profile and audit the performance of the code I specify.

Work through these layers:

**Database queries:**
- Are there N+1 query patterns? (Loading a list, then querying each item)
- Are queries using indexes? (Run EXPLAIN ANALYZE if possible)
- Are we fetching more columns than needed?
- Are we missing pagination on list queries?

**React rendering (if applicable):**
- Are expensive computations happening on every render without useMemo?
- Are event handlers re-created on every render without useCallback?
- Are large lists rendered without virtualization?
- Are there unnecessary re-renders from context updates?

**Network:**
- Are we making sequential requests that could be parallel?
- Are large payloads being sent that could be filtered server-side?
- Are there missing caching headers on static resources?

**Bundle size (if applicable):**
- Are there large dependencies that have lighter alternatives?
- Are heavy libraries imported fully instead of tree-shaken?

For each issue found: explain the impact, show the current code, and provide the fixed version.

---

## /standup.md

Generate my standup update from the recent git history.

Read the git log for the last 24 hours (or since last standup):
\`\`\`
git log --since="24 hours ago" --author="$(git config user.name)" --oneline
\`\`\`

Then generate a standup in this format:

**Yesterday:**
[3-5 bullet points summarizing what was accomplished, in plain language a non-technical person could understand]

**Today:**
[Based on in-progress branches, open PRs, or the last commit's direction — what's the logical next step?]

**Blockers:**
[Any TODO comments, FIXME notes, or incomplete implementations that suggest blockers]

Keep it concise. Skip merge commits and minor chore commits. Focus on features, fixes, and meaningful progress.
`,
    tags: ["claude-code", "slash-commands", "developer-tools", "workflow"],
    difficulty: "beginner",
    modelSupport: ["Claude 3.5 Sonnet", "Claude claude-sonnet-4-6", "Claude 3 Opus"],
  },

  // ─────────────────────────────────────────────
  // GAME DEVELOPMENT
  // ─────────────────────────────────────────────
  {
    slug: "godot4-gdscript-generation-system",
    title: "Godot 4 GDScript Generation System",
    description:
      "A structured prompt framework for generating production-quality Godot 4 GDScript. Covers state machines, signal patterns, navigation, physics, and your project's node naming conventions.",
    longDescription: `Generic AI code generation fails Godot developers in predictable ways: wrong node paths, outdated GDScript 2.0 syntax, missing @export annotations, signals that don't match Godot's conventions, and navigation code that ignores NavigationAgent2D/3D patterns.

This system encodes the Godot 4 patterns that produce usable code:

• State machine scaffolding with enum-based states and transition methods
• NavigationAgent2D/3D integration with avoidance and target tracking
• Physics body patterns (CharacterBody2D, RigidBody, Area2D) with correct move_and_slide usage
• Signal declaration, emission, and connection patterns
• @export variable organization and inspector-friendly defaults
• Resource-based data patterns (replacing the old Node-as-data antipattern)
• Scene instancing and Node management patterns

Works for both 2D and 3D projects. Tested against Godot 4.2 and 4.3.`,
    category: "game-dev",
    priceCents: 3400,
    previewContent: `ROLE: Expert Godot 4 game developer who writes clean GDScript 2.0...

CONTEXT BLOCK (fill before each use):
- Node type: [CharacterBody2D / RigidBody3D / Area2D / etc.]
- Purpose: [What this script controls]
- Connected nodes: [Key children/siblings this script interacts with]
- Signals to emit: [Events this node should broadcast]
...

[Full 350-line system prompt in paid version — covers state machines,
navigation, physics, signal patterns, and Godot 4-specific conventions]`,
    fileContent: `# Godot 4 GDScript Generation System

## HOW TO USE
Fill in the CONTEXT BLOCK below before each use. The more specific you are, the better the output.

---

## CONTEXT BLOCK (fill this in before each request)

\`\`\`
Project type: [2D platformer / 3D action / top-down RPG / etc.]
Godot version: [4.2 / 4.3 / 4.4]
Node being scripted: [e.g., "CharacterBody2D — the player character"]
Parent node: [e.g., "Player (Node2D) > PlayerBody (CharacterBody2D)"]
Key children: [e.g., "AnimationPlayer, NavigationAgent2D, AttackHitbox (Area2D)"]
Purpose of this script: [1-2 sentences describing what it does]
States needed: [e.g., "IDLE, RUN, JUMP, ATTACK, HURT, DEAD"]
Signals to emit: [e.g., "health_changed(new_health), died, attack_landed"]
Variables to expose in Inspector: [e.g., "speed, jump_force, health, damage"]
Physics approach: [move_and_slide / move_and_collide / custom]
Special requirements: [anything specific to your project]
\`\`\`

---

## SYSTEM PROMPT (paste into Claude/ChatGPT before your request)

You are an expert Godot 4 game developer specializing in clean, maintainable GDScript 2.0. You write code that works in Godot 4.2+ and follows the official GDScript style guide.

**CRITICAL GODOT 4 RULES — never break these:**

1. **GDScript 2.0 syntax only.** No Godot 3 patterns:
   - Use \`@export\` not \`export var\`
   - Use \`@onready\` not \`onready var\`
   - Use \`super()\` not \`.move_and_slide()\`
   - Signals: \`signal my_signal(param: Type)\` with typed params
   - \`CharacterBody2D\` not \`KinematicBody2D\`

2. **Node references.** Always use \`@onready\` for node references:
   \`\`\`gdscript
   @onready var animation_player: AnimationPlayer = $AnimationPlayer
   @onready var nav_agent: NavigationAgent2D = $NavigationAgent2D
   \`\`\`

3. **move_and_slide() in Godot 4** takes no parameters. Velocity is set via the \`velocity\` property:
   \`\`\`gdscript
   velocity = direction * speed
   move_and_slide()
   # NOT: move_and_slide(velocity, Vector2.UP)
   \`\`\`

4. **Signal connections in code:**
   \`\`\`gdscript
   # Connect in _ready()
   health_component.health_changed.connect(_on_health_changed)
   # Emit with new syntax
   died.emit()
   attack_landed.emit(damage_amount)
   \`\`\`

5. **State machines** use enums:
   \`\`\`gdscript
   enum State { IDLE, RUN, JUMP, ATTACK, HURT, DEAD }
   var current_state: State = State.IDLE

   func _change_state(new_state: State) -> void:
       if current_state == new_state:
           return
       _exit_state(current_state)
       current_state = new_state
       _enter_state(new_state)
   \`\`\`

6. **NavigationAgent2D/3D pattern:**
   \`\`\`gdscript
   @onready var nav_agent: NavigationAgent2D = $NavigationAgent2D

   func _physics_process(delta: float) -> void:
       if nav_agent.is_navigation_finished():
           return
       var next_pos = nav_agent.get_next_path_position()
       var direction = global_position.direction_to(next_pos)
       velocity = direction * speed
       move_and_slide()

   func set_target(target_pos: Vector2) -> void:
       nav_agent.target_position = target_pos
   \`\`\`

7. **Resource-based data** instead of passing Nodes as data:
   \`\`\`gdscript
   # Define in separate file: weapon_data.gd
   class_name WeaponData extends Resource
   @export var damage: int = 10
   @export var attack_speed: float = 1.0

   # Use on node
   @export var weapon: WeaponData
   \`\`\`

8. **@export organization** — group related exports:
   \`\`\`gdscript
   @export_group("Movement")
   @export var speed: float = 200.0
   @export var acceleration: float = 800.0
   @export var friction: float = 600.0

   @export_group("Combat")
   @export var max_health: int = 100
   @export var damage: int = 10
   \`\`\`

9. **Typed variables everywhere:**
   \`\`\`gdscript
   # ✓ Always type
   var velocity: Vector2 = Vector2.ZERO
   var health: int = 100
   var is_on_floor: bool = false

   # ✗ Never untyped
   var velocity = Vector2.ZERO
   \`\`\`

10. **_process vs _physics_process:**
    - \`_physics_process(delta)\`: movement, collision, physics calculations
    - \`_process(delta)\`: visual updates, input polling, UI, animations
    - Never do physics in \`_process\`

---

## TEMPLATE: Complete CharacterBody2D Script

Use this as the starting structure and fill it with the context block:

\`\`\`gdscript
class_name [ClassName] extends CharacterBody2D

# ─── Signals ───────────────────────────────────
signal health_changed(new_health: int)
signal died

# ─── Enums ─────────────────────────────────────
enum State { IDLE, RUN, JUMP, DEAD }

# ─── Exports ───────────────────────────────────
@export_group("Movement")
@export var speed: float = 200.0
@export var jump_force: float = -400.0

@export_group("Stats")
@export var max_health: int = 100

# ─── State ─────────────────────────────────────
var current_state: State = State.IDLE
var current_health: int

# ─── Node References ───────────────────────────
@onready var animation_player: AnimationPlayer = $AnimationPlayer
@onready var sprite: Sprite2D = $Sprite2D

# ─── Lifecycle ─────────────────────────────────
func _ready() -> void:
    current_health = max_health

func _physics_process(delta: float) -> void:
    match current_state:
        State.IDLE: _state_idle(delta)
        State.RUN: _state_run(delta)
        State.JUMP: _state_jump(delta)
        State.DEAD: pass

# ─── State Handlers ────────────────────────────
func _state_idle(delta: float) -> void:
    pass

func _state_run(delta: float) -> void:
    pass

func _state_jump(delta: float) -> void:
    if not is_on_floor():
        velocity.y += get_gravity() * delta

# ─── State Machine ─────────────────────────────
func _change_state(new_state: State) -> void:
    if current_state == new_state:
        return
    current_state = new_state

# ─── Public API ────────────────────────────────
func take_damage(amount: int) -> void:
    current_health = max(0, current_health - amount)
    health_changed.emit(current_health)
    if current_health == 0:
        _die()

func _die() -> void:
    _change_state(State.DEAD)
    died.emit()
\`\`\`

---

## COMMON REQUESTS AND HOW TO PHRASE THEM

**Enemy AI with pathfinding:**
"Using the context block above, write a Godot 4 GDScript for an enemy AI that uses NavigationAgent2D to chase the player, has states PATROL/CHASE/ATTACK/DEAD, emits attacked(damage) and died signals, and exposes speed/detection_radius/attack_range/damage in the Inspector."

**Player controller:**
"Using the context block above, write a Godot 4 player controller for a [2D platformer/top-down shooter]. Needs IDLE/RUN/JUMP/ATTACK states, coyote time, jump buffering, and 8-directional movement for top-down."

**Inventory system:**
"Write a Godot 4 Resource-based inventory item class and an inventory manager node. Items have name, icon, stackable bool, max_stack_size. Inventory emits item_added, item_removed, item_used."

**Save/Load:**
"Write a Godot 4 save/load system using Resource files. Save to user://save_data.tres. Include player position, inventory items array, and quest flags dictionary."
`,
    tags: ["godot4", "gdscript", "game-dev", "state-machine", "navigation"],
    difficulty: "intermediate",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Claude claude-sonnet-4-6"],
  },

  {
    slug: "godot4-game-design-toolkit",
    title: "Godot 4 Game Design Toolkit",
    description:
      "Prompt frameworks for game design work in Godot 4 projects: level design, enemy balancing, NPC dialogue, economy tuning, and game feel analysis. For designers and developer-designers.",
    longDescription: `Game design AI assistance fails because prompts lack game-specific structure. "Design an enemy" produces a generic description. This toolkit gives you frameworks for the design decisions that make or break games.

Covers:
• Enemy design framework: stats, behavior, counter-mechanics, player communication
• Level design briefs: flow, teaching moments, risk/reward, pacing
• Dialogue writing: Godot-compatible format, branching, character voice
• Economy balancing: resource flows, progression curves, monetization design
• Game feel audit: input responsiveness, feedback clarity, juice assessment
• Playtest debrief: session notes → actionable design changes`,
    category: "game-dev",
    priceCents: 2900,
    previewContent: `5 game design frameworks included:

1. Enemy Design Framework — stats, behavior, counter-mechanics
2. Level Design Brief — flow, pacing, teaching moments
3. Dialogue Writer — branching, Godot-compatible format
4. Economy Balancer — resource flows, progression curves
5. Game Feel Auditor — input, feedback, juice analysis

[Sample from Enemy Design Framework — full content in paid version]`,
    fileContent: `# Godot 4 Game Design Toolkit
# 5 frameworks for design decisions

---

## FRAMEWORK 1: Enemy Design

### Prompt
You are an expert game designer specializing in enemy design for action games. Design an enemy for my game using the specification below.

**Game Context:**
- Genre: [platformer / top-down shooter / RPG / etc.]
- Player's current abilities: [list player's tools: dash, shoot, melee, etc.]
- Current zone/difficulty level: [early game / mid / late / boss]
- Theme: [forest / dungeon / sci-fi / etc.]

**Enemy Request:**
- Role: [damage dealer / tank / support / sniper / glass cannon]
- Intended challenge type: [positioning, timing, pattern recognition, resource management]
- Should teach the player: [optional — e.g., "to use the dodge ability"]

**Output format:**

**Name & Concept:** 1-2 sentences on what it is and why it's interesting.

**Stats:**
- Health: [value + rationale]
- Movement speed: [value + rationale]
- Damage per hit: [value + rationale]
- Attack range: [melee/short/long]
- Attack cooldown: [seconds]

**Behavior Pattern:**
Describe the state machine: idle behavior, detection trigger, approach pattern, attack pattern, retreat/cooldown behavior. Be specific about timing and telegraphing.

**Player Counter-Mechanics:**
What 2-3 things can the player do to counter this enemy effectively? What does poor play against this enemy look like?

**Visual Communication:**
How does the player read this enemy's intent? Describe: idle animation cue, attack windup, vulnerable state, death animation.

**Godot Implementation Notes:**
Suggested node structure, key scripts needed, any Godot-specific patterns (NavigationAgent, AnimationTree, hitbox/hurtbox setup).

**Balancing Levers:**
What 3 variables most affect difficulty? What happens when each is tuned up/down?

---

## FRAMEWORK 2: Level Design Brief

### Prompt
You are a level designer creating a level design document. Create a complete brief for the level I describe.

**Level Context:**
- Game type: [genre]
- Player abilities available: [list]
- Previous level taught: [what mechanic/skill was introduced before]
- This level should introduce or reinforce: [mechanic/theme]
- Intended playtime: [X minutes first run / X minutes optimized]
- Difficulty target: [1-10]

**Output format:**

**Level Summary:** 2-3 sentence overview — what makes this level memorable and what it teaches.

**Core Teaching Moment:** The single most important mechanic or skill this level develops. How is it introduced (safe context), practiced (low stakes), then tested (meaningful challenge)?

**Flow Map (text-based):**
Describe the level's spatial structure: start → mid-point(s) → end. Include: safe zones, challenge rooms, secret areas, shortcuts, reward locations.

**Pacing Arc:**
Break the level into 5 beats: Opening tension, First challenge, Escalation, Peak difficulty, Resolution. Describe what happens in each.

**Risk/Reward Structure:**
- Main path challenge vs. reward
- Optional challenge vs. reward (secrets, detours)
- Mastery reward for skilled play

**Enemy/Obstacle Composition:**
Which enemies appear and in what combinations? How do combinations create emergent challenge beyond individual difficulty?

**Godot Scene Structure:**
Suggested scene organization: TileMap layers, spawner placement, trigger areas, checkpoint positions.

---

## FRAMEWORK 3: Dialogue Writer (Godot-Compatible)

### Prompt
You are a narrative designer writing game dialogue. Write dialogue for the scene I describe, formatted for Godot implementation.

**Scene Context:**
- Character speaking: [Name, role, personality in 1-2 sentences]
- Player's relationship to character: [first meeting / ally / antagonist / etc.]
- Scene purpose: [exposition / quest-giving / worldbuilding / character moment]
- Player's context: [what just happened, what they know]
- Tone: [serious / humorous / mysterious / urgent]
- Length: [brief (1-3 exchanges) / medium (5-8 exchanges) / long (10+ with branching)]

**Output format:**
Provide dialogue in this Godot-compatible dictionary format:

\`\`\`gdscript
var dialogue = [
    {
        "speaker": "CHARACTER_NAME",
        "text": "Dialogue line here.",
        "portrait": "neutral",  # neutral/happy/angry/sad/surprised
        "choices": []  # empty = auto-advance
    },
    {
        "speaker": "CHARACTER_NAME",
        "text": "Line with player choice following.",
        "portrait": "concerned",
        "choices": [
            {"text": "Player choice 1", "next": 3},
            {"text": "Player choice 2", "next": 5}
        ]
    },
]
\`\`\`

Include:
- Natural speech patterns for the character
- Subtext (what they're not saying)
- A memorable line or moment
- Notes on delivery (portrait suggestions, pause timing)

---

## FRAMEWORK 4: Economy Balancer

### Prompt
You are a game economy designer. Analyze and balance the economy I describe.

**Economy Description:**
- Resources: [list all resources: gold, XP, crafting materials, etc.]
- Sources: [how each resource is earned]
- Sinks: [what each resource is spent on]
- Progression gating: [what resources gate advancement]
- Current problem: [inflation / feels unrewarding / progression wall / pay-to-win / etc.]

**Analysis output:**

**Flow Diagram (text):** Draw the resource flow: production → storage → consumption → outcome

**Imbalance Identification:**
- Where is there surplus production? (inflation risk)
- Where are artificial scarcity points? (frustration risk)
- Are sinks meaningful? (is spending rewarding?)

**Recommended Adjustments:**
For each adjustment: what to change, by what factor, and expected outcome.

**Progression Curve:**
Plot the intended progression: early game (0-30%) / mid game (30-70%) / late game (70-100%). Where should the player feel powerful? Where constrained?

**Exploit Prevention:**
What are the top 3 ways a player could break this economy? How to prevent without making it feel restricted?

---

## FRAMEWORK 5: Game Feel Audit

### Prompt
You are a game feel expert. Audit the feel of the mechanic I describe.

**Mechanic Description:**
- What action does the player perform: [input → result]
- Current implementation: [describe what happens now]
- What's feeling wrong: [floaty / stiff / unresponsive / over-juiced / etc.]

**Audit output:**

**Input Response:** Is the control immediate? Any input lag? Is there a "wind up" before the action that feels intentional vs. accidental?

**Output Clarity:** Can the player read what's happening from visual/audio feedback alone? What feedback is missing?

**Juice Assessment:**
Rate these (present/missing/overdone): screen shake, hit pause, particle effects, sound design, camera follow, animation squash/stretch, controller rumble.

**The "Feels Like" Test:** What does this mechanic currently feel like (be specific)? What should it feel like?

**5 Concrete Tweaks:** Specific numerical or design changes to try, ordered by expected impact. For each: what to change, why it should help, how to test if it worked.
`,
    tags: ["godot4", "game-design", "level-design", "dialogue", "balancing"],
    difficulty: "beginner",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Gemini 1.5 Pro"],
  },

  // ─────────────────────────────────────────────
  // MARKETING
  // ─────────────────────────────────────────────
  {
    slug: "content-repurposing-machine",
    title: "Content Repurposing Machine",
    description:
      "Turn one piece of content into 8 formats in under 10 minutes. Blog post → LinkedIn article, Twitter thread, newsletter section, YouTube script, TikTok hook, email, Instagram caption, and quote cards.",
    longDescription: `Content teams spend 80% of their time creating content and 20% distributing it. It should be the other way around. This framework flips that ratio.

One strong blog post or video transcript becomes a full week of multi-channel content. The system:

• Adapts tone and format for each platform's native behavior
• Preserves the core insight while rewriting for the context
• Maintains consistent brand voice across formats
• Generates platform-specific hooks and CTAs
• Produces content that performs natively — not "copy-pasted" repurposing

Tested on 200+ content pieces across SaaS, agency, personal brand, and e-commerce contexts.`,
    category: "marketing",
    priceCents: 3900,
    previewContent: `INPUT: Your original content (blog post, video transcript, podcast notes)
BRAND VOICE: [describe your tone + 3 example phrases]

OUTPUTS GENERATED:
1. LinkedIn Long-Form Article (800-1200 words)
2. Twitter/X Thread (8-12 tweets)
3. Newsletter Section (300-400 words)
4. YouTube Script (3-5 min)
5. TikTok/Reels Hook Script (30-60 sec)
6. Email to List (200-300 words)
7. Instagram Caption (150-200 words)
8. 5 Quote Card Texts

[Full prompt system in paid version — includes platform-specific formatting rules]`,
    fileContent: `# Content Repurposing Machine

## SETUP (do this once — save for reuse)

Fill in your brand voice profile:
\`\`\`
BRAND NAME: [Your brand/company name]
BRAND VOICE: [3-5 adjectives: e.g., "direct, no-BS, slightly irreverent, expert"]
TARGET AUDIENCE: [Who you're writing for — be specific]
NEVER SAY: [Words/phrases to avoid: e.g., "synergy", "game-changer", "dive in"]
ALWAYS DO: [Your conventions: e.g., "use data, short paragraphs, questions as headers"]
EXAMPLE OF YOUR BEST CONTENT: [Paste 1-2 sentences in your voice]
\`\`\`

---

## MASTER PROMPT

You are a senior content strategist and platform-native copywriter. I'm going to give you a piece of content and a brand voice profile. Your job is to repurpose this content into 8 different formats, each optimized for its platform.

**BRAND VOICE PROFILE:**
[Paste your completed setup above]

**ORIGINAL CONTENT:**
[Paste your blog post, video transcript, podcast notes, or core idea here]

**KEY INSIGHT TO PRESERVE:**
[1-2 sentences — what's the single most important point in this content?]

---

Now generate ALL 8 formats:

---

### FORMAT 1: LinkedIn Long-Form Article

Platform context: LinkedIn rewards depth and professional vulnerability. The best posts combine tactical insight with personal story. Readers are professionals who have 3-5 minutes. The algorithm favors posts with genuine engagement in the first 30 minutes.

Write a 800-1,000 word LinkedIn article:
- Hook: A bold statement, counterintuitive claim, or story opening — NOT "I'm excited to share"
- Body: 3-4 key points, each with a specific example or data point
- Format: Short paragraphs (2-3 sentences max), white space, occasional line breaks for emphasis
- CTA: One specific call to action at the end — ask a question or invite a response
- Avoid: Humble bragging, generic advice, excessive emojis

---

### FORMAT 2: Twitter/X Thread

Platform context: Twitter rewards specificity and boldness. Threads perform best when each tweet can stand alone but rewards reading the full thread. The first tweet must stop the scroll.

Write a 10-tweet thread:
- Tweet 1: The hook — most provocative or valuable statement. End with "🧵" and "here's what I learned:"
- Tweets 2-9: One specific insight per tweet. Include numbers, examples, contrasts. 240 chars max each.
- Tweet 10: The "so what" — what to do with this information. End with "Follow for more on [topic]"
- Format: Short sentences. Line breaks. Bold the key phrase by putting it first.

---

### FORMAT 3: Email Newsletter Section

Platform context: Email is intimate. The reader chose to be here. Conversational tone, one idea per email, and a clear reason to click (or not — value-first).

Write a 300-400 word newsletter section:
- Subject line: 5-8 words, specific, creates curiosity without being clickbait
- Preview text: Completes or expands the subject line
- Opening: Personal, addresses the reader directly
- Body: Expand the core insight with 1 story or concrete example
- Lesson: What the reader should take away
- CTA: Soft — "Reply and tell me if you've experienced this" or link to deeper resource

---

### FORMAT 4: YouTube Video Script

Platform context: YouTube viewers decide in the first 30 seconds. Scripts must be conversational — written for the ear, not the eye. Retention drops at 30%, 50%, and 70% — add a pattern interrupt at each point.

Write a 3-4 minute video script (450-600 words spoken):
- Hook (0-30s): Start with the problem or a story. Don't introduce yourself first.
- Setup (30s-1m): Why does this matter? What's at stake?
- Core content (1m-3m): 3 main points. Each with example, implication, and transition.
- Pattern interrupt at ~2m: Change energy, ask audience a question, tease what's coming
- CTA (final 30s): Subscribe + comment prompt + next video tease
- Note: Mark [B-ROLL], [CUT TO], [GRAPHIC] where relevant

---

### FORMAT 5: TikTok/Instagram Reels Hook Script

Platform context: 3-second hook determines everything. Viewers are mid-scroll. Audio-on but also works silent. 30-60 seconds max. One idea. High energy or high value — not both needed.

Write a 60-second script:
- Hook (0-3s): Spoken AND visual hook described. "If you [relatable situation], this is for you."
- Core (3-50s): The one thing. Concrete. Specific. No fluff.
- Punchline/payoff (50-60s): The memorable line they'll quote or save
- On-screen text: List the 3-5 key phrases to overlay as text
- Tone: [Match brand voice — direct/educational/entertaining]

---

### FORMAT 6: Email to List

Platform context: Broadcast email — list may include prospects, customers, and lurkers. Goal: deliver value, re-engage, or drive to one action.

Write a 200-250 word email:
- Subject: Intriguing but not clickbait. Under 50 characters.
- Opening: 1-2 sentences that earn the read
- Value delivery: The insight, quickly
- Bridge: Why this matters to them specifically
- CTA: One link, one action, one reason to click now
- Sign-off: Personal, not corporate

---

### FORMAT 7: Instagram Caption

Platform context: Instagram is visual-first. The caption supports the image. 150-250 words. Conversational. Line breaks matter. Hashtags at the end.

Write an Instagram caption:
- Opening line: Must work as a standalone hook visible before "more"
- Body: Personal perspective on the topic, 3-4 short paragraphs
- Value: The takeaway
- Question: Invite comments with a specific question
- Hashtags: 5-10 relevant hashtags (mix of large and niche)

---

### FORMAT 8: Quote Cards (5 variations)

Write 5 standalone quote-worthy lines from the original content:
- Each under 140 characters
- Complete thought — no context needed
- Shareable on its own
- Mix of: tactical insight, mindset shift, contrarian take, data point, and motivational
- Format: "The quote." — [Brand Name]

---

## QUALITY CHECKS

Before finalizing, verify each format:
- [ ] Sounds like [Brand Name], not generic AI content
- [ ] Doesn't start with "I" or "Are you"
- [ ] No "game-changer," "deep dive," or "in today's world"
- [ ] Each format is optimized for its platform (not just reformatted)
- [ ] The core insight is preserved across all formats
`,
    tags: ["content-marketing", "repurposing", "linkedin", "twitter", "email"],
    difficulty: "beginner",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Claude claude-sonnet-4-6"],
  },

  {
    slug: "seo-content-factory",
    title: "SEO Content Factory — Topical Authority System",
    description:
      "A complete AI-powered system for building topical authority: from keyword research and content clustering through brief generation, optimized drafting, and meta writing. For SEO teams and content marketers.",
    longDescription: `Random blog posts don't rank. Topical authority — a deep cluster of interconnected content that signals expertise to Google — does. But building it manually is slow and expensive.

This system automates the research-to-publish pipeline:

1. Topic clustering: turn a seed keyword into a full topical authority map
2. Search intent classification: match content type to query intent
3. Content brief generation: SERP-informed structure with exact headers, questions to answer, and entities to mention
4. Draft generation: properly structured, optimized first draft
5. On-page optimization: meta title, description, internal links, FAQs, schema

The output is ready for human editing — not a final product, but a 70% first draft that cuts writing time by 60-70%.`,
    category: "marketing",
    priceCents: 4900,
    previewContent: `SYSTEM INCLUDES:

Step 1: Topical Authority Map Generator
Input: 1 seed keyword
Output: Pillar page + 20+ cluster articles organized by intent

Step 2: Content Brief Builder
Input: Target keyword + SERP context
Output: Full brief with headers, questions, entities, word count targets

Step 3: SEO-Optimized Draft Generator
Input: Brief + brand voice
Output: Full article draft with on-page optimization

Step 4: Meta & Schema Generator
Input: Article draft
Output: Title tag, meta description, FAQ schema, internal linking suggestions

[Full 4-step system in paid version]`,
    fileContent: `# SEO Content Factory — Topical Authority System

## STEP 1: TOPICAL AUTHORITY MAP GENERATOR

### Prompt
You are an SEO strategist and content architect. Build a complete topical authority map for the seed keyword I provide.

**Seed Keyword:** [YOUR KEYWORD]
**Website:** [Your website, what it does, target audience]
**Goal:** [e.g., "Rank for commercial keywords in the X space" or "Build awareness around Y topic"]

**Output structure:**

### Pillar Page (1)
The comprehensive guide that anchors the topic cluster.
- Title: [SEO-optimized H1]
- Target keyword: [primary KW]
- Search intent: [informational / commercial / navigational]
- Word count target: [2,000-4,000 for pillar pages]
- What it covers: [10-15 key sections]

### Cluster Articles (organize by sub-topic)

**Sub-topic cluster 1: [name]**
List 4-6 cluster articles that support the pillar:
| Title | Primary KW | Intent | Word Count | Internal Link Target |
|-------|------------|--------|------------|---------------------|
| ...   | ...        | ...    | ...        | ...                 |

**Sub-topic cluster 2: [name]**
[Same format]

[Continue for all sub-topic clusters — aim for 20-30 total articles]

### Content Priority Matrix
Rank all articles by:
1. Search volume (estimated High/Medium/Low)
2. Keyword difficulty (estimated Hard/Medium/Easy)
3. Business value (High/Medium/Low)
4. Internal linking value (how many other articles link to this)

Recommend a production order: start with which 5 articles and why.

---

## STEP 2: CONTENT BRIEF BUILDER

### Prompt
You are an SEO content strategist writing a detailed content brief. Create a comprehensive brief for the article below.

**Article details:**
- Target keyword: [KEYWORD]
- Secondary keywords: [2-3 related keywords]
- Search intent: [informational / commercial / transactional]
- Target word count: [from topical map or manual input]
- Competing articles to beat: [paste top 3 URLs from Google if available]
- Brand voice: [3 adjectives + 1 example sentence]
- Target reader: [specific person — role, problem they're trying to solve]

**Brief output:**

### Keyword Summary
- Primary: [keyword] — [estimated monthly volume]
- Secondary: [list with volumes]
- LSI / related entities to mention: [list 8-10 semantic terms Google expects to see]
- Questions to answer (People Also Ask): [list 5-8 questions]

### Search Intent Analysis
What is the searcher's job-to-be-done? What do they need to KNOW, DO, or DECIDE after reading? What content format does this intent call for? (guide, list, comparison, tutorial, definition)

### Article Structure (H1-H4 outline)
\`\`\`
H1: [SEO title — target keyword near the front, under 60 chars]

Introduction (150-200 words):
  - Hook: [specific approach — statistic, question, bold statement]
  - Context: establish why this matters
  - Preview: what the article covers
  - Target keyword: use naturally in first 100 words

H2: [Main section 1 — include secondary keyword if natural]
  H3: [Sub-section]
  H3: [Sub-section]

H2: [Main section 2]
  ...

H2: Frequently Asked Questions
  H3: [Question 1 from PAA — verbatim for schema]
  H3: [Question 2]
  H3: [Question 3]

Conclusion (100-150 words):
  - Summarize key takeaways (3 bullets)
  - CTA: [specific action]
\`\`\`

### Content Requirements
- Word count: [target] words ±10%
- Include: [specific data points, stats, examples that should appear]
- Avoid: [competitor tropes, over-used phrases, thin sections]
- Link internally to: [3-5 existing pages to link from this article]
- External links: [2-3 authoritative sources to cite]

### On-Page Optimization Targets
- Title tag: under 60 chars, KW near front
- Meta description: 120-155 chars, includes KW, has CTA
- Image alt text: describe what the featured image should be
- URL slug: [suggested slug]

---

## STEP 3: SEO-OPTIMIZED DRAFT GENERATOR

### Prompt
You are an expert SEO content writer. Write a fully optimized article using the brief below. Write for humans first, search engines second — content that is genuinely useful and engaging, not keyword-stuffed.

**[PASTE THE COMPLETE BRIEF FROM STEP 2]**

**Additional voice instructions:**
- Short paragraphs (3-4 sentences max)
- Subheadings every 200-300 words
- Bullet points for lists of 3+ items
- Bold the most important phrase in each major section
- No fluff openers ("In today's digital landscape...")
- First-person or second-person — never third-person corporate

Write the complete article. After the article, add a section labeled "EDITOR NOTES" with:
- 3 places where the human editor should add personal examples or data
- 1-2 claims that need fact-checking or citation
- Suggested featured image description
- Any sections that feel thin and need expansion

---

## STEP 4: META & SCHEMA GENERATOR

### Prompt
Generate all on-page SEO elements for the article I provide.

**Article:** [Paste full article or summary]
**Primary keyword:** [KEYWORD]
**URL:** [yoursite.com/slug]

**Generate:**

**Title Tags (3 variations):**
- Option A: [keyword-forward version]
- Option B: [benefit-forward version]
- Option C: [question format if appropriate]
Each under 60 characters. Mark the recommended one.

**Meta Description:**
120-155 characters. Include primary keyword. End with a soft CTA. Natural language, not robotic.

**FAQ Schema (JSON-LD):**
\`\`\`json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Question verbatim from article]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[40-50 word direct answer]"
      }
    }
  ]
}
\`\`\`
Include all FAQ questions from the article.

**Internal Linking Suggestions:**
Based on the article's topics, suggest 5 anchor text + target URL combinations for internal links to add or request from other pages.

**Content Score Checklist:**
- [ ] Primary keyword in H1
- [ ] Primary keyword in first 100 words
- [ ] Primary keyword in meta title and description
- [ ] Secondary keywords distributed naturally
- [ ] LSI/entity terms included
- [ ] FAQ section present
- [ ] Internal links: 3-5
- [ ] External links: 2-3 authoritative sources
- [ ] Word count within ±10% of target
- [ ] Images have descriptive alt text
`,
    tags: ["SEO", "content-marketing", "topical-authority", "blog", "keyword-research"],
    difficulty: "advanced",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Gemini 1.5 Pro"],
  },

  {
    slug: "cold-email-master-pack",
    title: "Cold Email Master Pack — 15 Proven Templates",
    description:
      "15 cold email templates engineered for response rates, not just opens. Every scenario: B2B outreach, partnership requests, investor emails, agency pitches, reactivation sequences, and follow-ups.",
    longDescription: `Generic cold emails fail because they're about the sender, not the recipient. Every template in this pack is written around the recipient's context, pain, and desired outcome.

Included:
• B2B sales (founder-to-founder, AE to VP, SDR to manager)
• Partnership and collaboration requests
• Investor cold outreach (seed and Series A)
• Agency new business development
• Freelancer/consultant outreach
• Job application differentiation
• Customer reactivation sequences
• Multi-touch follow-up sequences (day 3, 7, 14)

Each template includes: the opening gambit, the value proposition frame, the CTA, and common failure points to avoid.`,
    category: "marketing",
    priceCents: 2900,
    previewContent: `15 templates organized by scenario:

B2B SALES (4 templates)
- Founder cold outreach to ICP
- AE to VP/Director
- Problem-led opener (no product mention until email 2)
- Trigger-based (hiring/funding/news)

PARTNERSHIP (3 templates)
- Complementary product partnership
- Content/media collaboration
- Distribution partnership

[+ 8 more templates — investor, agency, reactivation, follow-ups]

[Sample opener from the B2B Founder template:]
"[Trigger you noticed] → [specific implication for them] → [one-line pitch]"
[Full templates in paid version]`,
    fileContent: `# Cold Email Master Pack — 15 Templates

## HOW TO USE
1. Pick the template matching your scenario
2. Fill in the [BRACKETED] fields with specifics
3. Never send without personalizing — the brackets are required, not optional
4. The subject lines are optimized for open rate — test 2 at a time

---

## B2B SALES TEMPLATES

### Template 1: Founder-to-Founder Cold Outreach

**When to use:** You're the founder or someone senior reaching out to another founder/CEO.

**Subject A:** Quick question about [their specific challenge]
**Subject B:** [Mutual connection] suggested I reach out

---

Hi [First name],

[Trigger/personalization — pick one]:
- I saw [Company] just [raised/launched/hired/expanded] — congrats on [specific thing].
- [Mutual connection name] mentioned you're working through [specific challenge].
- I noticed [Company] recently [specific public signal — new product, job posting, press mention].

That usually means [specific implication of the trigger — what they're likely dealing with].

At [Your Company], we help [exact type of company they are] [specific outcome you deliver] — specifically [the part that's most relevant to them given the trigger].

[Social proof: 1 sentence — "We did this for [similar company] who went from X to Y."]

Would a 15-minute call this week be worth it to see if there's a fit?

[Your name]
[Title, Company]
[One-line proof point or website]

---

*Why this works:* Trigger → implication → relevance. The reader recognizes their situation before you mention your product. Three sentences before the pitch, not one.

*Failure modes to avoid:*
- Starting with "I" — delete immediately
- Mentioning the product name before sentence 4
- More than 150 words total
- Generic social proof ("our customers love us")

---

### Template 2: AE/SDR to VP/Director

**When to use:** Sales rep outreach to a buyer at a specific company.

**Subject A:** [Company]'s [challenge you solve] — a thought
**Subject B:** Re: [Industry] challenge I keep hearing about

---

Hi [First name],

[Provocative observation — not a compliment]:
Most [their job title]s at [their company size/type] I talk to are dealing with [specific painful problem]. Usually shows up as [symptom 1] and [symptom 2].

[Your company] solves this by [mechanism — how you solve it, not what you do]. [Client name] went from [before] to [after] in [timeframe].

Given [Company] is [specific relevant context — size, market, recent move], I thought this might be relevant.

Worth 20 minutes to see if the numbers make sense for your team?

[Name]

---

*Notes:* Under 100 words. The provocation in sentence 1 qualifies them — if they don't have the problem, they self-select out. That's fine.

---

### Template 3: Problem-Led Opener (No Product Pitch Until Email 2)

**When to use:** Long-cycle B2B where trust must be built first. Or when your product needs explaining.

**Subject:** [Specific question relevant to their role]

---

Hi [First name],

Quick question — how does [Company] currently handle [specific process relevant to your solution]?

I ask because [the reason this matters — a trend, a common pain, a specific context about their company].

We work with [type of company] on this and I've been compiling data on how different approaches compare. Happy to share what we're seeing if useful.

[Name]

---

*Notes:* This asks for information, not a meeting. Reply rate is 2-3x higher than a direct pitch. Email 2 (after they reply) is where you introduce the product.

---

### Template 4: Trigger-Based (Funding/Hiring/News)

**When to use:** When you have a specific, recent trigger to reference.

**Subject:** Congrats on [funding/launch] — quick note

---

Hi [First name],

Saw the [funding round / product launch / news item] — [one specific genuine observation about it].

Companies at your stage typically [experience a specific challenge you solve]. It usually hits around [when/how it manifests].

We help [company type] through that with [solution in one clause]. [One relevant customer name or proof point].

Would a quick call make sense to see if the timing is right?

[Name]

---

## PARTNERSHIP TEMPLATES

### Template 5: Complementary Product Partnership

**Subject:** [Company A] + [Company B] — potential win-win?

---

Hi [First name],

I'm [name] from [Company] — we [one-line description targeting their audience].

I noticed you serve [shared audience type] who often also need [what you provide]. We've seen this come up for [describe how it currently creates friction for the shared customer].

Our customers regularly ask us about [their product/service] too. Seems like there's a referral/integration opportunity where both sides benefit.

Would a 20-minute call to explore what that could look like make sense?

[Name]

---

### Template 6: Content/Media Collaboration

**Subject:** Collaboration idea for [their audience/channel]

---

Hi [First name],

I follow [their content/channel/publication] — specifically [reference a specific piece and why it resonated].

I run [your platform/newsletter/channel] focused on [topic]. Our audience ([size]) overlaps significantly with yours on [shared interest].

I have an idea for a collaboration that would give both our audiences genuine value: [one specific idea — guest post, co-hosted event, joint research, etc.].

If this sounds interesting, I'm happy to send a more detailed proposal. Worth a quick email back?

[Name]

---

### Template 7: Distribution Partnership

**Subject:** Distribution opportunity — [their market]

---

Hi [First name],

[Company] has strong reach into [specific market segment] — I've been following your growth in [niche].

We've built [product/content] specifically for [that same segment] but don't have your distribution. You have distribution but [implication — not your product category].

The straightforward version: we promote each other to our respective audiences on a [revenue share / free exchange / co-marketing] basis.

We've done this with [similar company] and drove [specific result].

Worth exploring?

[Name]

---

## INVESTOR OUTREACH

### Template 8: Cold Outreach to Angel/Seed Investor

**Subject:** [Company] — [one-line what you do]

---

Hi [First name],

[Company] is [one clear sentence — what you do, for whom, with what traction hook].

Traction: [specific metric] in [timeframe]. [Key signal of product-market fit].

Why I'm reaching out to you specifically: [reference a portfolio company, a specific thesis they've written about, or a specific thing they've invested in that's adjacent].

We're raising [amount] at [terms if appropriate] and I'd love 20 minutes with you.

Here's our deck: [link]

[Name]

---

*Notes:* Investors read dozens of cold emails. The traction goes in the email, not just the deck. Make them want to see more before they open the link.

---

## REACTIVATION TEMPLATES

### Template 9: Churned Customer Win-Back (6+ months)

**Subject:** Things have changed at [Your Company]

---

Hi [First name],

It's been a while since [Company] used [Your Product] — I wanted to reach out personally.

When you left, [acknowledge the reason if you know it — or "I know the timing wasn't right"].

Since then, we've [specific improvement relevant to their departure reason]. [Customer example of how this improvement helped someone similar to them].

I'd love to offer you a [trial / discounted period / demo of new features] to see if things feel different.

No obligation — just want you to have the chance to see where we are now.

[Name]

---

### Template 10: Inactive Customer Re-Engagement

**Subject:** [First name] — are you getting value from [product]?

---

Hi [First name],

I noticed [Company] hasn't used [specific feature] in [timeframe]. I wanted to check in.

Sometimes that means it's not useful. Sometimes it means it got buried. Either way, I wanted to ask directly: is [product] working for you?

If there's something specific that's not working, I'd like to fix it. If the use case has changed, I can help you figure out if [product] still makes sense.

Either outcome is fine — I just don't want you paying for something that isn't delivering.

[Name]

---

## FOLLOW-UP SEQUENCES

### Template 11: Follow-Up Day 3 (No Response)

**Subject:** Re: [original subject]

---

[First name] — following up in case this got buried.

One specific question: does [the specific problem you solve] show up for your team?

If not, totally fine — just want to know if it's worth continuing to reach out.

[Name]

---

### Template 12: Follow-Up Day 7

**Subject:** [A fresh angle — new subject line entirely]

---

Hi [First name],

Different approach — instead of pitching, let me ask:

[1 specific question about their situation that your product solves. Make it a question any thoughtful person in their role would have an opinion on.]

We work on this for [type of company] and I'm curious how you think about it.

[Name]

---

### Template 13: Follow-Up Day 14 (The Breakup)

**Subject:** Closing the loop

---

Hi [First name],

I've reached out a few times without hearing back — I'll take that as a sign the timing isn't right.

I'll stop reaching out. If that changes, my info is below.

[Name]

---

*Note:* The "breakup" email often has the highest reply rate of the sequence. People respond to closure. It should be genuine — actually stop outreach if they don't reply to this one.

---

## ADDITIONAL TEMPLATES

### Template 14: Job Application Differentiation

**Subject:** [Role] application — plus something you probably didn't expect

---

Hi [Hiring manager name],

I applied through the portal for [role] — but I wanted to send this note directly because cover letters in ATS systems rarely convey what I actually want to say.

I've been following [Company] specifically because [specific, genuine reason — not "I love your culture"].

For this role specifically: I noticed [specific challenge or opportunity visible from outside the company]. My [specific background] is directly relevant because [specific connection].

I've attached the standard materials but wanted you to have this context first.

[Name]

---

### Template 15: Consultant/Freelancer New Client Outreach

**Subject:** [Their specific need] — [your specific specialty]

---

Hi [First name],

I saw [how you found them — job posting, LinkedIn, referral, published work].

I'm a [specific specialty] consultant who specializes in [their specific need]. In the last [timeframe], I've done this for [2 similar companies] — [specific result 1] and [specific result 2].

I'm selective about client work and only take [X] projects at a time. If the scope matches what I focus on, I'd like to learn more about what you're trying to accomplish.

Worth a 20-minute call?

[Name]
[Portfolio/work sample link]

---

## SUBJECT LINE TESTING BANK

Use these as A/B test options across any template:
- Question format: "Quick question about [their thing]"
- Specific trigger: "[Their news] — a thought"
- Curiosity gap: "Something I noticed about [Company]"
- Mutual connection: "[Name] suggested I reach out"
- Direct: "[Your company] + [Their company]"
- Provocative: "Why most [role]s struggle with [problem]"
- Personalized: "Re: [specific thing they published/posted]"
`,
    tags: ["cold-email", "sales", "outreach", "B2B", "templates"],
    difficulty: "beginner",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Any model"],
  },

  // ─────────────────────────────────────────────
  // DEVELOPER TOOLS (continued)
  // ─────────────────────────────────────────────
  {
    slug: "api-design-review-system",
    title: "API Design Review System — REST & GraphQL",
    description:
      "A structured prompt framework for reviewing and designing APIs before you build them. Covers REST resource modeling, GraphQL schema design, versioning strategy, error contracts, and auth patterns.",
    longDescription: `APIs are harder to change than implementation code. A poorly designed API becomes permanent technical debt the moment a consumer depends on it. This system helps you get the design right before a single line of implementation is written.

The framework covers the full API design lifecycle:

• Resource modeling: how to identify resources, relationships, and the actions that belong on each
• REST conventions: naming, HTTP verb usage, status codes, pagination patterns, filtering/sorting
• GraphQL schema design: query depth limits, resolver patterns, N+1 prevention, mutation design
• Versioning strategy: URL vs. header versioning, deprecation lifecycle, breaking change detection
• Error contracts: consistent error shapes, error codes, human vs. machine-readable messages
• Authentication patterns: which auth method fits which use case (API keys, JWT, OAuth)
• Security review: OWASP API Security Top 10 applied to your specific design

Use it before you start, or as a structured review of an existing API that needs improvement.`,
    category: "developer-tools",
    priceCents: 2900,
    previewContent: `FRAMEWORK OVERVIEW:

Step 1: Resource Modeling Review
- Identify resources and sub-resources correctly
- Check for resource vs. action confusion
- [Full criteria in paid version]

Step 2: REST Convention Audit
- Naming, verbs, status codes, pagination
- [Full 25-point checklist in paid version]

Step 3: Error Contract Design
- Consistent error shape template
- [Full specification in paid version]

Step 4: Security Review (OWASP API Top 10)
[Full review framework in paid version]`,
    fileContent: `# API Design Review System — REST & GraphQL

## HOW TO USE
Run these prompts in order for a new API design, or jump to the relevant section for targeted review.

---

## PROMPT 1: RESOURCE MODELING REVIEW

You are a senior API architect. Review the API design I provide and evaluate its resource modeling.

**My API:**
[Describe your API: what it does, who consumes it, the main operations]

**Current design (paste endpoints or schema):**
[Paste your current design]

**Evaluate these dimensions:**

### Resource Identification
- Are resources modeled as nouns (not verbs)?
  - ✓ \`/orders/{id}\`  ✗ \`/getOrder\`, \`/createOrder\`
- Are collections and singletons correctly separated?
  - \`/users\` (collection) vs \`/users/{id}\` (singleton)
- Are sub-resources correct, or should they be separate top-level resources?
  - \`/users/{id}/orders\` — is an order a sub-resource of a user, or its own resource?

### Relationship Modeling
- How are many-to-many relationships handled? (junction endpoints or embedded arrays?)
- Are relationships navigable in both directions when needed?
- Is there unnecessary coupling (endpoint that conflates two unrelated resources)?

### Action vs. Resource Confusion
- Are there "action" endpoints disguised as resources? (\`/users/{id}/activate\`)
- Should those be: state transitions (PATCH), separate sub-resources, or kept as actions?

### Output
1. List each resource modeling problem found, with the specific issue and the recommended fix
2. Rate overall resource design: Clean / Needs Work / Redesign Recommended
3. Priority of fixes: Critical (breaks clients) / Important (hard to use correctly) / Nice-to-have

---

## PROMPT 2: REST CONVENTION AUDIT

You are an expert in REST API design best practices. Audit the following API for REST convention compliance.

**API endpoints:**
[Paste your endpoint list]

**Check every endpoint for:**

### HTTP Verb Usage
- GET: safe and idempotent, no request body, no side effects
- POST: create new resource OR non-idempotent action
- PUT: full replacement (must be idempotent)
- PATCH: partial update (should be idempotent)
- DELETE: removal (idempotent)

Flag: verbs in URLs, POST used for retrieval, GET with side effects

### Status Code Correctness
Standard mapping to enforce:
\`\`\`
200 OK — successful GET, PUT, PATCH
201 Created — successful POST that creates a resource (include Location header)
204 No Content — successful DELETE or action with no response body
400 Bad Request — malformed request, validation failure
401 Unauthorized — not authenticated
403 Forbidden — authenticated but not authorized
404 Not Found — resource doesn't exist
409 Conflict — state conflict (duplicate, version mismatch)
422 Unprocessable Entity — valid JSON but business logic failure
429 Too Many Requests — rate limit exceeded
500 Internal Server Error — unexpected server error (never expose internals)
\`\`\`

### URL Design
- Plural nouns for collections: \`/users\` not \`/user\`
- Lowercase, hyphen-separated: \`/user-profiles\` not \`/userProfiles\`
- No trailing slashes (or be consistent)
- No file extensions (\`.json\`, \`.xml\`)
- Hierarchy reflects resource ownership, not system architecture

### Pagination
- Does every list endpoint have pagination?
- Cursor-based (preferred for large datasets) or offset?
- Are total counts returned? (expensive — consider returning with a flag)
- Standard shape:
\`\`\`json
{
  "data": [...],
  "pagination": {
    "next_cursor": "abc123",
    "has_more": true
  }
}
\`\`\`

### Filtering & Sorting
- Query params for filtering: \`?status=active&created_after=2024-01-01\`
- Sort: \`?sort=created_at&order=desc\`
- No filtering via POST body on GET endpoints

**Output:** Table of all violations found, categorized by severity (Breaking / Convention / Style).

---

## PROMPT 3: ERROR CONTRACT DESIGN

You are an API architect. Help me design a consistent error response contract for my API.

**My API context:**
- Type: [REST / GraphQL / both]
- Consumers: [internal services / third-party developers / mobile clients]
- Current error shape (if any): [paste example]
- Problems I'm experiencing: [inconsistent shapes, hard to debug, unclear codes, etc.]

**Design a complete error contract:**

### Standard Error Shape
Design one JSON error response shape for all errors:
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",       // machine-readable, stable
    "message": "Email is invalid",    // human-readable, for developers
    "details": [...],                 // optional: field-level errors for validation
    "trace_id": "req_abc123",         // for support/debugging
    "docs_url": "..."                 // optional: link to error documentation
  }
}
\`\`\`

### Error Code Design
- Naming convention: \`RESOURCE_PROBLEM\` (e.g., \`USER_NOT_FOUND\`, \`ORDER_ALREADY_CANCELLED\`)
- Stability guarantee: error codes MUST be stable across versions
- Enumeration: maintain a complete registry (not ad-hoc strings)

### Validation Errors (multi-field)
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "code": "INVALID_FORMAT", "message": "Must be a valid email address" },
      { "field": "age", "code": "OUT_OF_RANGE", "message": "Must be between 18 and 120" }
    ]
  }
}
\`\`\`

**Design the error code registry for my specific API** — categorize by domain, list all codes I'll need, define the HTTP status that accompanies each.

---

## PROMPT 4: GRAPHQL SCHEMA REVIEW

You are a GraphQL architecture expert. Review the following GraphQL schema.

**Schema:**
[Paste your schema]

**Review dimensions:**

### Query Design
- Are queries named for what they return, not how they fetch? (\`user(id: ID!)\` not \`getUserById\`)
- Are list queries paginated using Relay cursor spec?
- Are filters typed (input objects) not variadic strings?
- Is there unnecessary nesting that creates N+1 risks?

### Mutation Design
\`\`\`graphql
# ✓ Correct mutation pattern
mutation CreateOrder($input: CreateOrderInput!): CreateOrderPayload!

# Payload includes the created object AND user errors (not just the type)
type CreateOrderPayload {
  order: Order
  userErrors: [UserError!]!
}

# ✗ Avoid — no input wrapper, poor error handling
mutation createOrder($productId: ID!, $quantity: Int!): Order
\`\`\`

### N+1 Prevention
- Every field that resolves to a list — does it have a DataLoader pattern?
- Are there deeply nested queries that could hammer the DB? (Set a max depth limit: usually 5-7)
- Are expensive fields marked with complexity costs?

### Type Design
- Are nullable fields intentional? (In GraphQL, nullable is the default — should it be non-null?)
- Are IDs using ID scalar or String? (ID is preferred — signals semantic meaning)
- Are enums used for known-value fields instead of strings?
- Are interfaces/unions used where polymorphism exists?

**Output:** Schema quality score (A-F) per dimension, specific field-level issues with fixes, priority of changes.

---

## PROMPT 5: VERSIONING & BREAKING CHANGE STRATEGY

You are an API lifecycle expert. Help me design the versioning and change strategy for my API.

**My context:**
- Current version: [v1, v2, etc. — or starting fresh]
- Consumer types: [internal / external third-party / mobile apps]
- Release cadence: [how often do you ship API changes]
- Current pain point: [if any — consumers breaking, afraid to make changes, etc.]

**Design a versioning strategy covering:**

### What Counts as a Breaking Change
Breaking (require new version):
- Removing a field
- Renaming a field or endpoint
- Changing a field type
- Making an optional field required
- Changing HTTP status codes on existing endpoints
- Removing enum values

Non-breaking (can ship without version bump):
- Adding new optional fields to responses
- Adding new optional query parameters
- Adding new endpoints
- Adding new enum values (with caution — clients should handle unknown values)

### Versioning Approach
Evaluate for my use case:
1. **URL versioning** (\`/v1/users\`) — visible, easy to test, hard to deprecate
2. **Header versioning** (\`Accept: application/vnd.api+json;version=1\`) — clean URLs, harder to discover
3. **Date-based versioning** (Stripe approach: \`Stripe-Version: 2024-01-01\`) — granular, complex

Recommend one approach with tradeoffs.

### Deprecation Lifecycle
Design a deprecation lifecycle:
- Deprecation notice: how far in advance (minimum), how communicated
- Sunset headers: \`Sunset: Sat, 31 Dec 2025 23:59:59 GMT\`
- Deprecation header: \`Deprecation: true\`
- Breaking change log: format and location

---

## PROMPT 6: API SECURITY REVIEW (OWASP API TOP 10)

You are an API security specialist. Review my API for the OWASP API Security Top 10 (2023).

**API design:**
[Paste your endpoints, auth mechanism, and any relevant implementation details]

**Review each category:**

**API1: Broken Object Level Authorization (BOLA/IDOR)**
- Can user A access user B's object by guessing/iterating an ID?
- Are object ownership checks performed on every request, server-side?

**API2: Broken Authentication**
- How are tokens validated? (signature check, expiry, revocation)
- Are there weak token patterns? (predictable IDs, no expiry, no rotation)

**API3: Broken Object Property Level Authorization**
- Can a user read fields they shouldn't? (e.g., internal admin fields exposed in public response)
- Can a user write fields they shouldn't? (mass assignment — accepting all body fields without allowlist)

**API4: Unrestricted Resource Consumption**
- Is there rate limiting on all endpoints?
- Is there pagination enforced (max page size)?
- Are expensive operations (search, file upload, bulk) separately rate-limited?

**API5: Broken Function Level Authorization**
- Are admin/internal endpoints discoverable but not protected?
- Are HTTP methods restricted? (PUT/DELETE disabled where not needed)

**API8: Security Misconfiguration**
- CORS: is the allowed origin list restrictive?
- Are internal stack traces returned to clients on 500 errors?
- Are unnecessary HTTP methods enabled?

**Output:**
- CRITICAL (exploitable now) / HIGH (fix before launch) / MEDIUM (fix this sprint) / LOW (hardening)
- Specific fix for each issue found
`,
    tags: ["API", "REST", "GraphQL", "architecture", "developer-tools"],
    difficulty: "advanced",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Claude claude-sonnet-4-6"],
  },

  {
    slug: "devops-terraform-prompts",
    title: "DevOps & Terraform Prompt Toolkit",
    description:
      "Infrastructure-as-code and CI/CD prompt pack. Write Terraform modules, design GitHub Actions pipelines, review security posture, and debug infrastructure issues with structured AI assistance.",
    longDescription: `Infrastructure code has the highest blast radius of any code you write — a mistake in Terraform can delete production databases. AI assistance for IaC needs to be precise and cautious.

This toolkit gives you prompts engineered for infrastructure work:

• Terraform module generation with proper resource dependencies, variable validation, and outputs
• GitHub Actions pipeline design for build/test/deploy workflows with proper secrets handling
• AWS/GCP/Azure resource design with least-privilege IAM patterns
• Infrastructure security review: exposed ports, open security groups, unencrypted resources
• Cost estimation prompts: identify expensive patterns before they hit your bill
• Incident diagnosis framework: structured approach to debugging infra failures
• Runbook generation: turn ad-hoc fixes into documented procedures

Each prompt includes explicit constraints about what NOT to do — because in infrastructure, the dangerous path is often simpler than the safe one.`,
    category: "developer-tools",
    priceCents: 2400,
    previewContent: `TOOLKIT CONTENTS:

1. Terraform Module Generator
   - Resource block structure, variable validation, outputs
   - [Full template in paid version]

2. GitHub Actions Pipeline Designer
   - Build / test / deploy with proper secrets handling
   - [Full template in paid version]

3. Infrastructure Security Reviewer
   - IAM least-privilege, exposed resources, encryption audit
   - [Full checklist in paid version]

4. Incident Diagnosis Framework
   - Structured debugging for infrastructure failures
   - [Full framework in paid version]`,
    fileContent: `# DevOps & Terraform Prompt Toolkit

---

## PROMPT 1: TERRAFORM MODULE GENERATOR

You are a senior infrastructure engineer specializing in Terraform. Generate a Terraform module for the resource I describe.

**Resource request:**
[Describe what you need: e.g., "An AWS RDS PostgreSQL instance with read replica, automated backups, and encrypted storage"]

**Context:**
- Cloud provider: [AWS / GCP / Azure]
- Environment: [production / staging / development]
- Terraform version: [1.x — specify]
- Provider version: [e.g., hashicorp/aws ~> 5.0]
- Existing VPC/network setup: [describe or say "greenfield"]

**Generate the complete module with these requirements:**

### Module Structure
\`\`\`
modules/[resource-name]/
├── main.tf       — resource definitions
├── variables.tf  — all input variables with validation
├── outputs.tf    — all useful outputs
└── versions.tf   — required_providers block
\`\`\`

### Variable Design Rules
- Every variable must have: type, description, and either a default or validation
- No sensitive defaults — passwords/keys must be explicitly provided
- Use variable validation blocks for constrained values:
\`\`\`hcl
variable "environment" {
  type        = string
  description = "Deployment environment"
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}
\`\`\`
- Mark sensitive variables: \`sensitive = true\`

### Security Requirements (enforce these always)
- No hardcoded values — everything is a variable or data source
- Encryption at rest enabled by default (set to false must be explicit)
- Encryption in transit enabled by default
- Least-privilege IAM: generate the minimal IAM policy for this resource
- No 0.0.0.0/0 ingress rules unless explicitly requested (and flag it as a security risk)
- Enable logging/audit trails for production resources

### Output All
Generate outputs for everything a consuming module would need: ARNs, IDs, endpoints, DNS names.

### Comments
Comment WHY on non-obvious decisions: \`# destroy_protection prevents accidental deletion of production data\`

---

## PROMPT 2: GITHUB ACTIONS PIPELINE DESIGNER

You are a DevOps engineer specializing in GitHub Actions. Design a CI/CD pipeline for the project I describe.

**Project:**
- Language/Framework: [e.g., Node.js/Next.js, Python/FastAPI, Go]
- Tests: [unit / integration / e2e — what tools: Jest, Pytest, Playwright]
- Deploy target: [Vercel / AWS ECS / GKE / Railway / etc.]
- Branches: [describe your branching strategy: main + feature branches, or gitflow, etc.]
- Current pain: [slow builds, flaky tests, manual deploys, no preview environments, etc.]

**Design a complete workflow:**

### Pipeline Stages Required
1. **Lint + Type Check** — fast feedback on code quality (target: <2 min)
2. **Unit Tests** — isolated, parallelized (target: <5 min)
3. **Integration Tests** — with service dependencies (target: <10 min)
4. **Build** — production artifact or container
5. **Deploy to Preview** — on PR open/update
6. **Deploy to Production** — on merge to main

### Secrets Handling (critical)
- List every secret the pipeline needs
- Show how each is accessed: \`\${{ secrets.SECRET_NAME }}\`
- For environment-specific secrets: use GitHub Environments with required reviewers
- NEVER log secrets: avoid \`echo\` or \`run: env\` that could expose them in logs
- Rotate pattern: all secrets should be rotated every 90 days — document the process

### Performance Optimization
- Cache: npm/pip/go dependencies by lock file hash
- Parallelization: which jobs can run in parallel vs. must be sequential
- Conditional runs: skip build/deploy if only docs changed (\`paths-ignore\`)
- Fail fast: put cheapest checks first

### Full YAML Output
Generate the complete \`.github/workflows/ci.yml\` with:
- Correct \`on:\` triggers
- Environment variables vs. secrets (prefer env for non-sensitive)
- Job dependencies (\`needs:\`)
- Timeout limits on each job
- Status check names that match branch protection rules

---

## PROMPT 3: INFRASTRUCTURE SECURITY REVIEW

You are a cloud security engineer. Review the following infrastructure configuration for security issues.

**Configuration to review:**
[Paste Terraform code, CloudFormation, or describe your architecture]

**Cloud provider:** [AWS / GCP / Azure]

**Review against these categories:**

### Network Security
- Are security groups/firewall rules using least-privilege? (specific IPs/CIDRs, not 0.0.0.0/0)
- Are inbound rules limited to required ports only?
- Is there public internet access where it's not needed?
- Are VPC flow logs enabled for audit trails?

### Identity & Access Management
- Are IAM roles using least-privilege? (wildcard \`*\` resources or \`*\` actions are red flags)
- Are there overly permissive policies? (AdministratorAccess on service roles)
- Is cross-account access properly scoped?
- Are IAM keys rotated? (access keys older than 90 days)
- Are EC2/GCE instances using instance roles (not hardcoded keys)?

### Data Security
- Is data encrypted at rest? (S3 bucket encryption, EBS encryption, RDS encryption)
- Is data encrypted in transit? (TLS everywhere, HTTP to HTTPS redirect)
- Are S3 buckets private by default? (Block Public Access enabled)
- Are database snapshots encrypted?
- Is sensitive data in environment variables vs. secrets manager?

### Logging & Monitoring
- Is CloudTrail/Cloud Audit Logs enabled in all regions?
- Are S3 access logs enabled on sensitive buckets?
- Is database audit logging enabled?
- Are there CloudWatch/alerting rules for suspicious activity?

### Output Format
For each finding:
- **Severity:** Critical / High / Medium / Low
- **Resource:** Which specific resource
- **Issue:** What's wrong
- **Risk:** What could happen if exploited
- **Fix:** Exact Terraform/config change to remediate

---

## PROMPT 4: INCIDENT DIAGNOSIS FRAMEWORK

You are a site reliability engineer. Help me diagnose a production infrastructure incident.

**Incident description:**
[Describe what's happening: symptoms, when it started, what changed recently]

**System overview:**
[Brief: what services are involved, what they do, how they connect]

**Current observations:**
[Paste relevant logs, metrics, error messages, or dashboard screenshots]

**Work through this systematically:**

### Step 1: Scope the Impact
- What is broken vs. degraded vs. unaffected?
- How many users are affected (all / some / specific segment)?
- Is this getting worse, stable, or improving?
- When exactly did it start? (down to the minute if possible)

### Step 2: Timeline of Changes
Ask me:
- What deployments happened in the last 2 hours?
- Any infrastructure changes (Terraform apply, config changes)?
- Any traffic pattern changes (spike, new client, cronjob)?
- Any external dependency changes (third-party API, payment provider)?

### Step 3: Hypothesis Generation
Based on what I've told you, generate the 3-5 most likely root causes, ranked by probability.
For each: the hypothesis, supporting evidence, and how to confirm/eliminate it.

### Step 4: Investigation Commands
For the top hypothesis, provide the exact commands to investigate:
- Specific log queries (CloudWatch Insights, kubectl logs, grep patterns)
- Metrics to check (CPU, memory, connection counts, error rates)
- Network checks (curl commands, DNS lookups, port checks)

### Step 5: Immediate Mitigation
While diagnosing, what can be done RIGHT NOW to reduce user impact?
(Roll back deployment, increase replicas, disable a feature flag, reroute traffic)
Clearly separate: "safe to do immediately" vs. "risky — confirm root cause first"

---

## PROMPT 5: RUNBOOK GENERATOR

Convert this incident or procedure into a structured runbook.

**Procedure/incident to document:**
[Describe the situation: what happened, how it was resolved, or what maintenance process you do]

**Generate a runbook covering:**

### Trigger Conditions
When does this runbook get used? What are the specific symptoms or alerts that indicate it's needed?

### Prerequisites
- Access required (AWS console, kubectl, database credentials)
- Tools needed (awscli version, kubectl, custom scripts)
- Who should be on the call (primary, secondary, escalation path)

### Step-by-Step Procedure
Each step must be:
- Specific (not "check the logs" — "run \`aws logs tail /aws/lambda/function-name --since 1h\`")
- Verifiable (include what success looks like: "you should see HTTP 200 responses return")
- Safe (flag any step that could cause additional impact)
- Reversible (if applicable, include the rollback step)

### Verification
How do you confirm the issue is resolved? What metrics/checks confirm normal operation?

### Post-Incident
- Immediate notifications to send
- Data to preserve for post-mortem
- Monitoring to watch for recurrence
`,
    tags: ["devops", "terraform", "github-actions", "infrastructure", "CI/CD"],
    difficulty: "advanced",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Claude claude-sonnet-4-6"],
  },

  // ─────────────────────────────────────────────
  // GAME DEVELOPMENT (continued)
  // ─────────────────────────────────────────────
  {
    slug: "unity-csharp-prompt-pack",
    title: "Unity C# Prompt Pack — Modern Unity Patterns",
    description:
      "Prompt framework for generating production-quality Unity C# code. Covers Unity 6 patterns, ScriptableObject architecture, coroutines vs. async/await, physics, UI Toolkit, and common systems (save, pooling, events).",
    longDescription: `Unity AI assistance produces code that compiles but fights the engine: MonoBehaviour inheritance soup, GetComponent in Update, FindObjectOfType everywhere, and coroutines where async/await belongs.

This pack encodes the Unity patterns that actually scale:

• ScriptableObject-based architecture for data and events
• Event system design (ScriptableObject events vs. C# events vs. UnityEvents)
• Object pooling with Unity's built-in ObjectPool<T>
• Coroutine patterns vs. async/await decision framework
• UI Toolkit (UIElements) patterns for modern Unity UI
• Input System (new) integration patterns
• Save/Load system with serialization best practices
• Physics best practices (FixedUpdate discipline, layer matrix design)

Each prompt encodes both the correct pattern AND the wrong patterns to avoid — because Unity has a long history of bad tutorials that AI models have learned from.`,
    category: "game-dev",
    priceCents: 2900,
    previewContent: `5 core prompt frameworks:

1. ScriptableObject Architecture Generator
   — Data containers, event channels, runtime sets
2. Unity Systems Generator
   — Object pooling, save/load, audio manager
3. Physics & Movement Patterns
   — CharacterController, Rigidbody, FixedUpdate discipline
4. UI Toolkit Component Builder
   — Modern UIElements patterns
5. Async/Coroutine Decision Framework
   — When to use which + correct implementations

[Full prompts in paid version]`,
    fileContent: `# Unity C# Prompt Pack — Modern Unity Patterns

---

## PROMPT 1: SCRIPTABLEOBJECT ARCHITECTURE GENERATOR

You are a senior Unity developer who uses ScriptableObject-based architecture. Generate the requested system using SO architecture principles.

**System request:**
[Describe what you need: e.g., "Player stats system that can be modified by items and buffs"]

**Project context:**
- Unity version: [6.x / 2023.x / 2022 LTS]
- Project type: [2D / 3D / mobile / PC]
- Team size: [solo / small / studio]

**CRITICAL UNITY RULES — enforce always:**

### What ScriptableObjects are for
\`\`\`csharp
// ✓ Data containers — use SO
[CreateAssetMenu(fileName = "WeaponData", menuName = "Game/Weapon Data")]
public class WeaponData : ScriptableObject
{
    public string weaponName;
    public int damage;
    public float attackSpeed;
    [PreviewField] public Sprite icon;
}

// ✓ Event channels — use SO
[CreateAssetMenu(fileName = "GameEvent", menuName = "Events/Game Event")]
public class GameEvent : ScriptableObject
{
    private readonly List<GameEventListener> listeners = new();

    public void Raise()
    {
        for (int i = listeners.Count - 1; i >= 0; i--)
            listeners[i].OnEventRaised();
    }

    public void RegisterListener(GameEventListener listener) => listeners.Add(listener);
    public void UnregisterListener(GameEventListener listener) => listeners.Remove(listener);
}

// ✓ Runtime sets — SO holds a list populated at runtime
[CreateAssetMenu(fileName = "EnemyRuntimeSet", menuName = "Runtime Sets/Enemy")]
public class EnemyRuntimeSet : ScriptableObject
{
    public List<EnemyController> items = new();
    public void Add(EnemyController item) => items.Add(item);
    public void Remove(EnemyController item) => items.Remove(item);
}
\`\`\`

### What ScriptableObjects are NOT for
- Runtime state that changes during gameplay (use MonoBehaviour + SO for default values)
- Singletons (use SO + static instance carefully, or proper DI)
- Per-instance state (each enemy's current health — use MonoBehaviour)

### MonoBehaviour Rules
\`\`\`csharp
// ✓ Cache references in Awake/Start, never in Update
private Rigidbody _rb;
private void Awake() => _rb = GetComponent<Rigidbody>();

// ✗ Never
private void Update()
{
    GetComponent<Rigidbody>().AddForce(Vector3.up); // GC allocation every frame
}

// ✓ Null check with TryGetComponent
if (TryGetComponent<IDamageable>(out var damageable))
    damageable.TakeDamage(damage);
\`\`\`

Generate the complete system with: ScriptableObject definitions, MonoBehaviour components that use them, example usage, and [CreateAssetMenu] paths.

---

## PROMPT 2: UNITY SYSTEMS GENERATOR

You are a Unity systems programmer. Generate the following common system using modern Unity patterns.

**System needed:** [Object Pool / Save System / Audio Manager / Scene Manager / Dialog System]

**OBJECT POOL PATTERN (Unity 6):**
\`\`\`csharp
using UnityEngine.Pool;

public class BulletPool : MonoBehaviour
{
    [SerializeField] private Bullet bulletPrefab;
    [SerializeField] private int defaultCapacity = 20;
    [SerializeField] private int maxSize = 100;

    private IObjectPool<Bullet> _pool;

    private void Awake()
    {
        _pool = new ObjectPool<Bullet>(
            createFunc: CreateBullet,
            actionOnGet: OnGetBullet,
            actionOnRelease: OnReleaseBullet,
            actionOnDestroy: OnDestroyBullet,
            collectionCheck: true,
            defaultCapacity: defaultCapacity,
            maxSize: maxSize
        );
    }

    private Bullet CreateBullet() =>
        Instantiate(bulletPrefab);

    private void OnGetBullet(Bullet bullet) =>
        bullet.gameObject.SetActive(true);

    private void OnReleaseBullet(Bullet bullet) =>
        bullet.gameObject.SetActive(false);

    private void OnDestroyBullet(Bullet bullet) =>
        Destroy(bullet.gameObject);

    public Bullet GetBullet() => _pool.Get();
    public void ReleaseBullet(Bullet bullet) => _pool.Release(bullet);
}
\`\`\`

**SAVE SYSTEM PATTERN:**
\`\`\`csharp
// Use JsonUtility for simple data, Newtonsoft for complex
[System.Serializable]
public class SaveData
{
    public int playerLevel;
    public float[] playerPosition; // Vector3 doesn't serialize — use float[]
    public List<string> completedQuests = new();
}

public static class SaveSystem
{
    private static readonly string SavePath =
        Path.Combine(Application.persistentDataPath, "save.json");

    public static void Save(SaveData data)
    {
        string json = JsonUtility.ToJson(data, prettyPrint: true);
        File.WriteAllText(SavePath, json);
    }

    public static SaveData Load()
    {
        if (!File.Exists(SavePath)) return new SaveData();
        string json = File.ReadAllText(SavePath);
        return JsonUtility.FromJson<SaveData>(json);
    }
}
\`\`\`

Generate the complete system for my request above, following these patterns.

---

## PROMPT 3: ASYNC VS COROUTINE DECISION FRAMEWORK

You are a Unity C# expert. Help me decide between coroutines and async/await, then implement the correct solution.

**What I'm trying to do:**
[Describe the async operation: e.g., "Wait 2 seconds then spawn an enemy", "Load a scene with a loading screen", "Make an HTTP request for leaderboard data"]

**Decision framework:**

Use **Coroutines** when:
- Waiting for Unity-specific conditions: \`WaitForSeconds\`, \`WaitForEndOfFrame\`, \`WaitUntil\`
- Spreading work across frames: \`yield return null\`
- Working in Unity 2019 or earlier
- The operation is tightly coupled to a GameObject's lifecycle (stop if GameObject destroyed)

\`\`\`csharp
// ✓ Coroutine — correct for frame-based waiting
private IEnumerator SpawnWave()
{
    yield return new WaitForSeconds(3f);
    for (int i = 0; i < enemyCount; i++)
    {
        SpawnEnemy();
        yield return new WaitForSeconds(0.5f);
    }
}

// Start: StartCoroutine(SpawnWave());
// Stop: StopCoroutine(SpawnWave()); // or store reference
\`\`\`

Use **async/await** when:
- Making network/IO requests (\`UnityWebRequest\`, file IO)
- Integrating with \`System.Threading.Tasks\` code
- Operations that don't need per-frame Unity hooks
- You want proper cancellation with \`CancellationToken\`

\`\`\`csharp
// ✓ async/await — correct for network requests
private async Task<LeaderboardData> FetchLeaderboardAsync(CancellationToken ct = default)
{
    using var request = UnityWebRequest.Get("https://api.example.com/scores");
    var operation = request.SendWebRequest();

    while (!operation.isDone)
    {
        ct.ThrowIfCancellationRequested();
        await Task.Yield(); // yield to Unity's main thread
    }

    if (request.result != UnityWebRequest.Result.Success)
        throw new Exception(request.error);

    return JsonUtility.FromJson<LeaderboardData>(request.downloadHandler.text);
}
\`\`\`

**NEVER mix carelessly:** don't call \`async void\` from Unity events — use \`async Task\` and fire-and-forget carefully.

Based on my request, recommend the right approach and generate the complete implementation.

---

## PROMPT 4: PHYSICS & MOVEMENT PATTERNS

You are a Unity physics expert. Generate a movement system for the following:

**Movement type:** [CharacterController / Rigidbody kinematic / Rigidbody physics-driven]
**Perspective:** [2D / 3D first-person / 3D third-person / top-down]
**Features needed:** [jump / sprint / crouch / wall-running / swimming / etc.]

**PHYSICS DISCIPLINE RULES — always enforce:**

\`\`\`csharp
// ✓ Physics in FixedUpdate ONLY
private void FixedUpdate()
{
    // Rigidbody operations here
    _rb.MovePosition(_rb.position + _velocity * Time.fixedDeltaTime);
}

// ✓ Input reading in Update
private void Update()
{
    _inputDirection = new Vector3(
        Input.GetAxisRaw("Horizontal"),
        0f,
        Input.GetAxisRaw("Vertical")
    ).normalized;
}

// ✗ NEVER do physics in Update
private void Update()
{
    _rb.AddForce(Vector3.up); // frame-rate dependent!
}
\`\`\`

**CharacterController vs. Rigidbody:**
- CharacterController: deterministic, good for player character, no physics interactions
- Rigidbody kinematic: player character that needs physics interactions (pushing crates)
- Rigidbody physics: enemies, projectiles, destructible objects

Generate complete movement script with:
- Proper FixedUpdate/Update separation
- Input buffering for jumps (coyote time if applicable)
- Layer mask for ground detection
- Exported variables for tuning in Inspector
`,
    tags: ["unity", "C#", "game-dev", "scriptableobject", "patterns"],
    difficulty: "intermediate",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Claude claude-sonnet-4-6"],
  },

  {
    slug: "game-narrative-system",
    title: "Game Narrative Design System",
    description:
      "Complete framework for AI-assisted game narrative work: story structure, character writing, branching dialogue, quest design, worldbuilding, and lore consistency. Engine-agnostic.",
    longDescription: `Game narrative is where AI assistance is most often misused — generating generic dialogue and flat characters that kill immersion. This system gives you the frameworks that produce narrative work worth using.

Covers the full narrative design workflow:

• Story structure: three-act structure applied to games, pacing for player agency
• Character design: motivation-driven characters with consistent voice and arc
• Branching dialogue: meaningful choices vs. illusion of choice, consequence design
• Quest design: structure quests that feel purposeful, not fetch-quest filler
• Worldbuilding: building consistent lore without writing a novel first
• Villain design: antagonists with coherent worldview and compelling motivation
• Lore consistency checker: catch contradictions before they ship

Designed for indie developers who wear the narrative hat alongside programming, but useful for dedicated narrative designers too.`,
    category: "game-dev",
    priceCents: 2400,
    previewContent: `5 narrative frameworks:

1. Story Structure Framework
   — Three-act adapted for player agency
2. Character Design Template
   — Motivation, arc, voice, relationship web
3. Branching Dialogue Designer
   — Meaningful choices, consequence tracking
4. Quest Design Framework
   — Purpose-driven quest structure
5. Worldbuilding Sprint
   — Consistent lore from one session

[Full frameworks in paid version]`,
    fileContent: `# Game Narrative Design System
# 5 frameworks for game narrative work

---

## FRAMEWORK 1: STORY STRUCTURE FOR GAMES

### Prompt
You are a narrative designer specializing in interactive storytelling. Help me structure the story for my game.

**Game context:**
- Genre: [RPG / action-adventure / visual novel / puzzle / etc.]
- Player agency level: [high — many meaningful choices / medium — some choices / low — cinematic experience]
- Tone: [serious / humorous / dark / hopeful / etc.]
- Approximate length: [2 hours / 10 hours / 40+ hours]
- Core theme: [the idea or question the game is really about]

**My story idea:**
[Describe your premise — what the game is about, who the protagonist is, what the conflict is]

**Structure it as:**

### Act 1: Setup (target: 15-20% of game)
**Ordinary World:** What is the protagonist's status quo? What is their flaw or wound that the story will address?
**Inciting Incident:** What disrupts the status quo? What is the call to adventure?
**Refusal:** Why would a believable person resist the call? (Skipping this makes protagonists feel stupid)
**Crossing the Threshold:** What commits the protagonist to the journey? Make it a point of no return.
**Player Agency Hook:** What choice does the player make early that signals this is THEIR story?

### Act 2A: Complications (target: 30%)
**New World Rules:** What does the player learn about how this world/conflict works?
**Allies & Enemies:** Who does the protagonist meet? What relationships form?
**Rising Stakes:** Each attempt to solve the problem makes things more complicated, not less.
**Midpoint Shift:** A moment that changes the direction — false victory (things seem solved) or dark revelation (things are worse than thought).

### Act 2B: Dark Night (target: 30%)
**Escalating Pressure:** The protagonist's approach is failing. The flaw is costing them.
**Point of No Return:** A loss or betrayal that forces the protagonist to change (or fail).
**All Is Lost Moment:** Things must get as bad as they can before the resolution earns it.
**Internal Decision:** The protagonist must CHOOSE their path forward — not be pushed into it.

### Act 3: Resolution (target: 20-25%)
**Climax Setup:** How do the skills, relationships, and knowledge gained in Act 2 converge?
**Climax:** The final confrontation. The protagonist's arc and the plot's external conflict resolve together.
**Aftermath:** What does the world look like now? What did the protagonist gain/lose?
**Player Reflection:** How does the ending acknowledge the player's choices?

**Also generate:** 3 alternative ending paths if player agency level is high/medium.

---

## FRAMEWORK 2: CHARACTER DESIGN TEMPLATE

### Prompt
You are a character writer for games. Design a complete, playable character for my game.

**Character role:** [protagonist / antagonist / companion / NPC / boss]
**Genre:** [game genre]
**My rough idea (if any):** [what you know about this character]

**Design output:**

### Core Identity
- **Name & Appearance:** Visual design notes (memorable silhouette, readability)
- **Role in story:** What function do they serve in the narrative?
- **One-sentence essence:** Who are they in a single sentence?

### Psychological Core
- **Wound:** What happened in their past that shapes who they are today? (Backstory without wound = biography, not character)
- **Flaw:** What character flaw results from that wound? (Not a quirk — something that creates real problems)
- **Desire:** What do they consciously want? (External goal)
- **Need:** What do they actually need? (Often different from what they want — this is the arc)
- **Fear:** What would they do anything to avoid?
- **Lie they believe:** What false belief guides their behavior?

### Character Arc
- **Start state:** Who are they at the beginning?
- **End state (positive arc):** Who have they grown into?
- **End state (negative arc, if applicable):** How could they fail to grow, or get worse?
- **Arc trigger:** What event begins their change?
- **Resistance:** Why won't they change easily?

### Voice & Speech Patterns
- **Vocabulary:** Formal/casual, technical/plain, regional/neutral?
- **Syntax:** Long sentences or short? Questions or statements? Direct or evasive?
- **What they talk about:** Favorite subjects, obsessions, deflections
- **What they never say:** Topics they avoid, things they can't admit
- **Sample dialogue:** Write 5 lines that are unmistakably this character

### Relationship Web
- Relationship to protagonist: [what it starts as, how it changes]
- Relationship to antagonist: [if applicable]
- Key supporting relationships: [who reveals different sides of them]

---

## FRAMEWORK 3: BRANCHING DIALOGUE DESIGNER

### Prompt
You are a narrative designer specializing in choice-based dialogue. Design the branching dialogue for the scene I describe.

**Scene context:**
- Characters: [who is in this scene]
- What just happened: [the immediate context]
- Scene purpose: [information revealed, relationship change, decision made]
- Choices should affect: [immediate scene / later quests / character relationship / game ending]
- Tone: [tense / comedic / emotional / etc.]

**CHOICE DESIGN PRINCIPLES — apply to all choices:**

### Meaningful vs. Illusory Choices
Meaningful choice: player is genuinely uncertain which to pick because both have real pros/cons
Illusory choice: one option is clearly "good," others are "bad" — avoid unless intentional

For each choice point, provide:
- The choice text (what the player reads)
- The subtext (what the choice actually represents — the VALUE the player is expressing)
- Immediate consequence (what happens in this scene)
- Downstream consequence (what this changes later — even if subtly)

### Consequence Design
\`\`\`
Good: Player chooses "I forgive you" → Marcus trusts player more → later, Marcus sacrifices himself for player
Bad: Player chooses "I hate you" → Marcus turns hostile → later, Marcus is an enemy boss
Interesting: Player chooses "I forgive you" → Marcus is relieved → BUT later, Marcus makes a naive mistake BECAUSE he trusted too easily
\`\`\`
The "interesting" consequence is memorable. Design 1-2 choices per scene with interesting rather than good/bad consequences.

### Dialogue Format
\`\`\`
[NPC LINE]
  A) [Player choice text] → [outcome description] → [GOTO line X]
  B) [Player choice text] → [outcome description] → [GOTO line Y]
  C) [Say nothing] → [outcome description] → [GOTO line Z]

[Line X - consequence of choice A]
...
\`\`\`

Write the complete dialogue tree for my scene, with 2-3 meaningful choice points and full branching.

---

## FRAMEWORK 4: QUEST DESIGN FRAMEWORK

### Prompt
You are a quest designer. Design a complete quest for my game.

**Context:**
- Game type: [RPG / action-adventure / etc.]
- Quest giver: [who gives the quest, their relationship to player]
- Quest tier: [main story / side quest / world quest / daily quest]
- Target play time: [5 min / 20 min / 1 hour]
- Themes I want to explore: [optional]

**Quest design output:**

### Quest Summary
- Title: [evocative, not "Kill 10 rats"]
- Hook: Why would a player WANT to do this? (gameplay reward / narrative curiosity / character appeal)
- Core loop: [what the player does moment-to-moment]

### Three-Part Quest Structure
**Setup (25%):**
- Quest giver presentation: what do they want and why?
- Initial context: what does the player know vs. what's hidden?
- First objective: clear, achievable, introduces the quest's mechanics

**Complication (50%):**
- Midpoint twist: what changes? (Things are not what they seemed — good quests have at least one revelation)
- Choice point: does the player face a meaningful decision?
- Escalation: how does the challenge increase?

**Resolution (25%):**
- Climax: what's the final challenge?
- Payoff: does the resolution feel earned?
- Aftermath: what changed in the world because the player did this?

### Avoid These Quest Anti-patterns
- Fetch quests with no story: "collect 5 herbs" → why? for what? who cares?
- Morally clear choices: "help the orphan or help the villain" — obvious choices aren't interesting
- Dead NPC motivation: "my husband was killed" — give quest givers wants beyond their tragedy
- Reward as only motivation: the best quests are remembered for their story, not their XP

---

## FRAMEWORK 5: WORLDBUILDING SPRINT

### Prompt
You are a worldbuilder. Help me create a coherent, compelling game world in a focused session.

**Starting point:**
- Genre/setting: [fantasy / sci-fi / post-apocalyptic / historical / contemporary / etc.]
- Tone: [gritty realistic / high fantasy / hopeful / dark / satirical]
- The core conflict of the world: [what is the fundamental tension? e.g., "magic is dying and those who depend on it are desperate"]
- What I already know (if anything): [any established lore]

**Build the world in 5 layers:**

### Layer 1: The World's Central Truth
What is the one defining fact about this world that makes it different from all others?
This is the "what if" — "what if magic was a resource that ran out?" or "what if humanity colonized space but brought all its old conflicts?"
Everything else should flow from this.

### Layer 2: The Power Structure
- Who holds power? (political, economic, military, magical/technological)
- How did they get it?
- Who is challenging that power and why?
- What does ordinary life look like under this structure?

### Layer 3: The History That Matters
You don't need 10,000 years of history. Identify 3 historical events that:
1. Created the current power structure
2. Left a wound the world hasn't recovered from
3. Created a mystery or question the player might uncover

### Layer 4: Factions & Viewpoints
3-5 factions the player encounters. For each:
- What do they want?
- What do they believe?
- What would they sacrifice for their goal?
- How do they see the protagonist?

### Layer 5: The Street Level
What is daily life like for ordinary people? This grounds the world.
- What do people eat, wear, celebrate, fear?
- What's the folk wisdom / common saying that reflects the world's theme?
- What would surprise a visitor from our world?

**Lore Consistency Check:**
After building, audit: does each layer logically follow from Layer 1's central truth?
Flag any contradictions and suggest resolutions.
`,
    tags: ["narrative", "game-design", "dialogue", "worldbuilding", "quest-design"],
    difficulty: "intermediate",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Claude claude-sonnet-4-6"],
  },

  // ─────────────────────────────────────────────
  // MARKETING (continued)
  // ─────────────────────────────────────────────
  {
    slug: "linkedin-authority-system",
    title: "LinkedIn Authority System — Complete Content Engine",
    description:
      "A complete LinkedIn content and growth system: content pillars, post frameworks for every format (hooks, carousels, thought leadership), engagement strategy, and a 30-day posting calendar.",
    longDescription: `LinkedIn is the highest-ROI organic channel for B2B, consulting, and personal brand building — but only if you post content people actually read. Generic "motivation Monday" posts and self-promotional announcements get ignored.

This system gives you the complete playbook:

• Content pillar framework: how to define 3-5 topics you can post on indefinitely without running out
• Post format library: proven structures for hooks, carousels, story posts, list posts, and thought leadership
• Hook engineering: the formulas that stop the scroll and drive to the first line
• Engagement strategy: how to build genuine network momentum without gaming the algorithm
• 30-day content calendar: a complete month of post ideas organized by pillar and format
• Profile optimization prompts: headline, about section, and featured section that convert

Tested by professionals who grew from 0 to 5K+ followers and who use LinkedIn to generate consulting leads, job opportunities, and speaking invitations.`,
    category: "marketing",
    priceCents: 3400,
    previewContent: `SYSTEM INCLUDES:

1. Content Pillar Builder
   — Define your 3-5 topics + your unique angle on each

2. Post Format Library (6 formats)
   — Hook post, carousel, story post, list, thought leadership, engagement post

3. Hook Engineering Formulas
   — 12 proven openers that stop the scroll

4. 30-Day Content Calendar Template
   — Pre-planned posting cadence by pillar and format

5. Profile Optimization Prompts
   — Headline, About, Featured section frameworks

[Full system in paid version]`,
    fileContent: `# LinkedIn Authority System — Complete Content Engine

---

## MODULE 1: CONTENT PILLAR BUILDER

### Prompt
You are a LinkedIn content strategist. Help me define the content pillars I'll build my LinkedIn presence around.

**My background:**
- Professional role: [your job title / what you do]
- Industry: [your sector]
- Target audience on LinkedIn: [who you want to reach — potential clients, employers, peers, etc.]
- Goal: [leads / job opportunities / speaking invites / thought leadership / network building]
- What I'm known for or want to be known for: [your specific expertise or perspective]

**Build my content pillar framework:**

### Step 1: Identify Your Unfair Advantage
What do you know that most people in your field don't? What experiences do you have that give you a perspective others lack?
This is your content moat — the reason people follow YOU specifically, not just anyone who posts on these topics.

### Step 2: Define 3-5 Content Pillars
For each pillar, define:
- **Topic:** [general area]
- **Your angle:** [your specific take — what you believe that others don't, or your unique vantage point]
- **Content types it supports:** [tips, stories, opinions, case studies, data]
- **Why your audience cares:** [connection to their job/life/goals]
- **Sustainability check:** Can you post on this 1x/week for a year without running out?

### Step 3: Content Mix
Design a posting mix:
- 40% Tactical/how-to content (builds followers)
- 30% Opinion/thought leadership (builds authority)
- 20% Story/personal (builds trust)
- 10% Promotional/call-to-action (converts followers to leads/relationships)

**Generate my complete pillar framework** with 4 pillars, the angle for each, and 10 post ideas per pillar.

---

## MODULE 2: POST FORMAT LIBRARY

### Prompt
You are a LinkedIn copywriter. Write a [FORMAT] post about [TOPIC] for my LinkedIn.

**My context:**
- Content pillar: [which pillar this post belongs to]
- Audience: [who I'm writing for]
- Key insight to share: [the one thing I want them to remember]
- Tone: [professional / conversational / bold / analytical]

---

### FORMAT A: THE HOOK POST

Structure: Opening hook → Context → 3-5 numbered insights → Lesson → CTA

**Rules:**
- Line 1 is everything. It must stop the scroll.
- First 2 lines visible before "see more" — these must create curiosity or conviction
- Short paragraphs (1-3 lines). White space is not wasted.
- End with a question to drive comments (comments = algorithm boost)

**Hook formulas:**
\`\`\`
1. Counterintuitive: "X doesn't work. Here's what actually does:"
2. Number: "After [doing X] for [Y years], here's what I wish I knew:"
3. Story opener: "In [year], I [did something]. The lesson cost me [X]."
4. Bold claim: "The advice everyone gives about X is wrong."
5. Question: "Why do [smart people] still [make this mistake]?"
\`\`\`

---

### FORMAT B: THE CAROUSEL (Document Post)

Carousels get 3-5x more reach than text posts. Use them for:
- "X things about Y" lists
- Step-by-step processes
- Before/after comparisons
- Data visualizations

**Structure:**
\`\`\`
Slide 1 — The Hook: Bold claim or question. One sentence. Large text.
Slide 2 — The Promise: What they'll learn. Why it matters.
Slides 3-8 — The Content: One insight per slide. Image + headline + 1-2 lines.
Slide 9 — The Takeaway: Summary in 1-2 sentences.
Slide 10 — The CTA: Follow for more, comment your answer, DM for resource.
\`\`\`

**Text post to accompany carousel:**
Hook + 2 sentences of context + "Swipe through →"

---

### FORMAT C: THE STORY POST

Personal stories drive the highest engagement when they have professional relevance.

**Structure:**
\`\`\`
Setup: [The situation — what was happening, stakes]
Conflict: [What went wrong, the mistake, the challenge]
Turning point: [What changed — decision, insight, outside force]
Resolution: [What happened after]
Lesson: [The single takeaway — stated plainly]
CTA: [Question inviting others to share their experience]
\`\`\`

**Story rules:**
- Be specific. "I lost a $50,000 client" > "I lost a client"
- Include your emotional state — it's what makes stories human
- The lesson must be transferable — what can someone else do with this?
- Don't moralize. State the lesson once and trust the reader.

---

### FORMAT D: THE LIST POST

Performs well for tactical content. Use when you have 5+ specific, actionable items.

\`\`\`
Hook: "X [things/tools/mistakes/lessons] that [outcome]"

1. [First item] — [1-2 line explanation]
2. [Second item] — [explanation]
...

Which one are you already doing?
\`\`\`

**The secret to good list posts:** Each item must be specific enough to be actionable. "Be consistent" is bad. "Post 3x/week for 8 weeks before judging results" is good.

---

### FORMAT E: THOUGHT LEADERSHIP

Takes a stance on a contested issue in your industry.

\`\`\`
Opening: State the conventional wisdom: "Everyone says you should X."
Turn: "But here's what I've found after [Y years/Z clients]: [your contrarian view]"
Evidence: 2-3 specific examples, data points, or case studies
Nuance: "To be fair, [conventional wisdom] works when [specific condition]. But..."
Conclusion: Restate your position. Be willing to be wrong publicly.
CTA: "What's your experience? Agree or disagree?"
\`\`\`

**Warning:** Thought leadership posts get pushback. That's the point. Engagement (including disagreement) signals to the algorithm that the post is generating real conversation.

---

### FORMAT F: ENGAGEMENT POST

Designed purely to generate comments. Comments compound — more comments → more reach → more followers.

\`\`\`
Option 1 — This or that: "Hot take: [X] > [Y]. Change my mind."
Option 2 — Fill in the blank: "The best advice I ever received about [X] was _______."
Option 3 — Poll question: "When starting a new project, do you: A) Plan everything first or B) Build and iterate?"
Option 4 — Experience share: "What's one thing you wish you knew before [career milestone]?"
\`\`\`

---

## MODULE 3: HOOK ENGINEERING

### 12 Scroll-Stopping Openers

Use these templates, filled with your specific content:

\`\`\`
1. "I [did something audacious] for [timeframe]. Here's what happened:"
2. "Hot take: [contrarian claim about your industry]."
3. "[Number] years ago I made a [mistake]. It [cost/taught] me [specific thing]."
4. "Nobody talks about [underappreciated topic]. But it's the reason [outcome]."
5. "The [job title] playbook is broken. Here's what actually works:"
6. "I used to believe [X]. I was wrong."
7. "[Famous company/person] does [unexpected thing]. Here's why it works:"
8. "Unpopular opinion: [take that will generate discussion]"
9. "The [cheapest/fastest/simplest] way to [desirable outcome]:"
10. "Here's the email that [changed my career/got me a $X client/landed me the job]:"
11. "Most [job titles] spend 80% of their time on the wrong thing."
12. "I just [completed notable milestone]. Here's the honest breakdown:"
\`\`\`

---

## MODULE 4: 30-DAY CONTENT CALENDAR

### Prompt
You are a social media strategist. Create a 30-day LinkedIn content calendar based on my pillars.

**My pillars:** [Paste pillars from Module 1]
**Posting frequency:** [1x / 2x / 3x per week]
**Formats I'm comfortable with:** [text posts / carousels / video / all]

**Generate a 30-day calendar:**

| Day | Pillar | Format | Hook (first line) | Type |
|-----|--------|--------|-------------------|------|
| 1   | [P1]   | Hook post | [specific opening line] | Tactical |
| 3   | [P2]   | Story | [specific opening line] | Story |
| 5   | [P3]   | List | [specific opening line] | Tactical |
...

Requirements:
- Vary pillars so no pillar repeats in consecutive posts
- Vary formats — max 2 of same format per week
- Include 1 engagement post per week (Friday performs well)
- Include 1 thought leadership per 2 weeks
- Generate the actual first line for each post — not just the topic

---

## MODULE 5: PROFILE OPTIMIZATION

### Prompt
You are a LinkedIn profile optimizer. Improve my profile to convert profile visitors into followers and leads.

**My current profile:**
- Headline: [your current headline]
- About section: [paste current about section]
- Target audience: [who visits your profile and what you want them to do]
- What makes you different: [your unique angle/experience]

**Optimize three elements:**

### 1. Headline (220 characters)
Most people write: "Senior Engineer at Acme Corp"
Write instead: "[What you do] + [for whom] + [measurable outcome or specific angle]"

\`\`\`
Bad:  "Software Engineer | AWS | React | Building cool things"
Good: "Staff Engineer → helping dev teams ship 2x faster | Writing about architecture, CI/CD, and the real cost of tech debt"
\`\`\`

Generate 3 headline options for my profile. Mark the recommended one.

### 2. About Section (2,600 chars — use ~1,500)
Structure:
\`\`\`
Line 1: The hook — who you help and what outcome (not your job title)
Paragraph 1: What you do and for whom. Be specific about the type of person/problem.
Paragraph 2: Why you're different. Your methodology, philosophy, or specific approach.
Paragraph 3: Proof. Specific results, companies, accomplishments.
CTA: What you want them to do next (follow, DM, check the link)
\`\`\`

### 3. Featured Section
The Featured section converts visitors. Use it for:
- Your best-performing post (shows social proof)
- A lead magnet or free resource (builds email list)
- A case study or portfolio piece (proves expertise)
- A product or service landing page (direct conversion)

Recommend what to put in each of my 3 featured slots based on my goals.
`,
    tags: ["linkedin", "personal-brand", "content-marketing", "social-media", "B2B"],
    difficulty: "beginner",
    modelSupport: ["Claude 3.5 Sonnet", "GPT-4o", "Claude claude-sonnet-4-6"],
  },
];

async function seed() {
  console.log(`Seeding ${PRODUCTS.length} products...`);

  for (const product of PRODUCTS) {
    await db
      .insert(products)
      .values(product)
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          title: product.title,
          description: product.description,
          longDescription: product.longDescription,
          priceCents: product.priceCents,
          previewContent: product.previewContent,
          fileContent: product.fileContent,
          tags: product.tags,
          difficulty: product.difficulty,
          modelSupport: product.modelSupport,
        },
      });
    console.log(`  ✓ ${product.slug}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
