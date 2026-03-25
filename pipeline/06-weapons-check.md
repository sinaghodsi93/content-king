# Weapons Check

Read these files:
- `workspace/00-brief-validated.md` (product brief, content type, budgets)
- `workspace/03-hooks.md` (hook options)
- `workspace/04-body.md` (body content)
- `workspace/05-cta.md` (CTA options)

You are the final quality gate. Every single line/tweet/bullet in the content gets scored on two dimensions. Lines that fail get rewritten. Lines that are pure filler get cut.

## The Two Dimensions

### 1. Invention Novelty (1-10)
Does this line make the product feel like a genuine breakthrough?
- 10: "Something that has never existed before and changes everything"
- 7: "Interesting twist on something familiar"
- 4: "I've heard this claim from every product in this category"
- 1: "Generic statement you could put on any product"

### 2. Copy Intensity (1-10)
Sharp enough that someone FEELS something — not just understands?
- 10: "This line physically hits. I want to screenshot it."
- 7: "Well written, has energy"
- 4: "Competent but forgettable"
- 1: "Corporate filler that means nothing"

## Content Type Notes

### Launch Video / YouTube Ad
- Score line by line
- Word budget stays enforced — cuts tighten, don't lengthen

### Twitter/X Thread
- Score tweet by tweet
- Each tweet must standalone — a weak tweet in position 5 means people stop reading
- Thread retention drops ~20% per tweet, so quality must INCREASE toward the end

### Landing Page Hero
- Score each headline, subheadline, bullet, and CTA independently
- Headlines carry 80% of the weight — be ruthless

### Product Hunt Launch
- Score tagline, description, and each paragraph of maker comment
- Tagline is make-or-break — treat it like a headline

## Rules
- Both dimensions must hit 9+/10 to PASS
- Novel idea + flat copy → REWRITE the copy
- Sharp copy + boring feature → REWRITE to find the novel angle
- Pure filler → CUT
- Budget constraints stay enforced

## Process

### Step 1: Score Everything
```
Line/Tweet: "[content]"
Novelty: X/10 — [reason]
Intensity: X/10 — [reason]
Verdict: PASS / REWRITE / CUT
```

### Step 2: Rewrite Failures
- Diagnose what's weak
- Rewrite
- Re-score
- If still fails after 2 attempts → CUT

### Step 3: Assemble Final Content
- Verify flow after cuts
- Verify transitions
- Verify word/character counts
- Must read as one cohesive piece

## Output

Write the weapons check report to `workspace/06-weapons-check.md` in this format:

```
## Weapons Check Report

### Scoring
| # | Content | Novelty | Intensity | Verdict |
|---|---------|---------|-----------|---------|
| 1 | "..." | X/10 | X/10 | PASS/REWRITE/CUT |

### Rewrites
[Before/after with new scores]

### Cuts
[What was cut and why]

### Final Content
[Complete, clean, copy-paste ready]

### Stats
- Items checked: X
- Passed: X
- Rewritten: X
- Cut: X
```
