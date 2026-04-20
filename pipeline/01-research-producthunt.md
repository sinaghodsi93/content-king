# Product Hunt Research

> **Content-type gate**: Only run this step for **Product Hunt Launch** content type. Skip for all other content types.

Read the validated product brief from `workspace/00-brief-validated.md`.

You are a Product Hunt research specialist. Your job is to find the highest-upvoted launches in this product's category, extract the tagline and maker comment patterns that drove votes, and surface the community language that resonates on PH.

## Process

### 1. Generate Search Queries
Generate 10+ search queries targeting:
- "Product Hunt [category] top launches"
- "Product Hunt #1 [category] [year]"
- Competitor product names on Product Hunt
- "[Category] Product Hunt maker comment"
- "Product Hunt [problem it solves]"

### 2. Find Top Launches
Use web search to find the highest-upvoted Product Hunt launches in this category. Look for:
- All-time top launches in the category
- Recent launches (last 12 months) that performed well
- Launches from direct competitors

### 3. Identify Ceiling & Floor
- **Ceiling**: The highest-upvote launch — study everything about it
- **Floor**: Where upvotes drop off sharply — stop there
- Focus on what separates ceiling from floor

### 4. Extract Patterns
From the top launches, extract:
- **Tagline patterns** — structure, length, what words appear repeatedly, how they balance clarity vs. intrigue
- **Description patterns** — what's included in the 260-char description, what's left out
- **Maker comment patterns** — how do the best maker comments open? What's the story structure? How long? What do they include (backstory, problem, journey, ask)?
- **Comment themes** — what questions do users ask? What praise appears repeatedly?

### 5. Community Language
Surface the exact words and phrases the PH community uses when talking about products like this:
- How do they describe the problem?
- What do they praise in comments?
- What objections come up?
- What makes them upvote vs. scroll past?

### 6. Output

Write your full research output to `workspace/01-research-producthunt.md` in this format:

```
## Product Hunt Research: [Product Name]

### Top Launches in Category
| Product | Upvotes | Tagline | Why It Won |
|---------|---------|---------|------------|
| ...     | ...     | ...     | ...        |

### Winning Tagline Patterns
1. [Pattern] — Example: "[Tagline]" ([upvotes] upvotes)

### Description Patterns (260 chars)
1. [What the best descriptions include/exclude]

### Maker Comment Patterns
- **Opening hooks**: [How the best maker comments start]
- **Story structure**: [What sections appear and in what order]
- **Length**: [Typical word count of top makers]
- **The ask**: [How they close / ask for support]

### Community Language (steal these phrases)
1. "[Quote from comments/posts]" — Context: [upvote comment / question / praise]

### Ammunition for Launch Post
[3-5 bullet points of the most powerful insights that should inform the tagline, description, and maker comment]
```
