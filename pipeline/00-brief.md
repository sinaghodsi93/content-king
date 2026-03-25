# Collect Product Brief

Read the file `brief.md` in the current working directory. If not found, also check `../brief.md` (project root). This file contains the product brief and content request.

If `brief.md` does not exist in either location, create it at `brief.md` with this template and tell the user to fill it in:

```markdown
# Content Request

## What to generate
[e.g., "Launch video script, 60 seconds" or "Twitter thread, 10 tweets"]

## Product Brief
- **Brand/Product Name:** [name]
- **What it does:** [1-2 sentences]
- **Who it's for:** [target audience]
- **Key features:**
  - [feature 1]
  - [feature 2]
  - [feature 3]
- **What makes it different:** [differentiator]
- **Tone:** [hype / calm authority / playful / technical / aspirational]
```

If `brief.md` exists, read it and then write a validated version to `workspace/00-brief-validated.md` that includes:
1. The full product brief
2. The content type identified (launch video / twitter thread / youtube ad / landing page hero / product hunt launch)
3. The length/size identified
4. The word/character budget based on these rules:

### Word Count Budgets

**Launch Video / YouTube Ad:**
| Length | Total Words | Hook | Body | CTA |
|--------|------------|------|------|-----|
| 15s | ~40 words | 10-15 | 15-20 | 8-10 |
| 30s | ~75 words | 15-20 | 40-45 | 10-15 |
| 60s | ~150 words | 20-30 | 100-110 | 15-20 |
| 90s | ~225 words | 25-35 | 165-175 | 20-25 |
| 2min | ~300 words | 30-40 | 230-240 | 25-30 |

**Twitter/X Thread:** 280 chars max per tweet
- Short: 5 tweets | Standard: 10 tweets | Deep Dive: 15 tweets

**Landing Page Hero:**
- Short: Headline (10 words) + Subheadline (20 words) + CTA (5 words)
- Long: Above + 3 feature bullets (15 words each) + social proof line (15 words)

**Product Hunt Launch:** Tagline (60 chars) + Description (260 chars) + Maker Comment (300-500 words)

Write the validated brief to `workspace/00-brief-validated.md`.
