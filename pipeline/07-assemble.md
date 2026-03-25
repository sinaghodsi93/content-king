# Assemble Final Output

Read these files:
- `workspace/00-brief-validated.md` (product brief with content type and brand name)
- `workspace/03-hooks.md` (hook options)
- `workspace/04-body.md` (body content)
- `workspace/05-cta.md` (CTA options)
- `workspace/06-weapons-check.md` (weapons check with final polished content)

## Task

Assemble the final content into a clean, production-ready output file.

1. Use the **Final Content** section from the weapons check as the primary source (it has the polished, quality-gated version)
2. Include the top hook option, the full body, and the recommended CTA
3. Format it cleanly for the content type:
   - **Video/Ad scripts**: Scene-by-scene with visual/delivery notes
   - **Twitter threads**: Numbered tweets, each clearly separated
   - **Landing page**: Headline → Subheadline → Bullets → CTA with button text
   - **Product Hunt**: Tagline → Description → Maker Comment

## Output

Determine the brand name and content type from the validated brief.

Write the final assembled content to `output/[brand-name]-[content-type].md` (in the project root's output directory, e.g., `../output/acme-launch-video.md`).

The file should contain:
1. A title header with brand name and content type
2. The final assembled content, clean and copy-paste ready
3. A metadata section at the bottom with:
   - Content type and length
   - Word/character count
   - Date generated
   - Weapons check pass rate

Tell the user: "Your content is ready! Open `viewer.html` in your browser and drag in the generated file from the `output/` folder to view it."
