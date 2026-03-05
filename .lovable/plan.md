

# Cover Page Rewrite

Rewrite `src/pages/Cover.tsx` to match the user-provided copy exactly. The page structure will be:

1. **Title**: "International Student Strategic Career Timeline Mapping Engine"
2. **Intro paragraphs**: Three paragraphs explaining the app's purpose (intersection of hiring cycles and F-1 OPT, backward-mapping from start date, LRM concept)
3. **"What this app provides" section**: Four bullet items in GlassCards or a single card:
   - LRM Calculation
   - Regulatory Anchors
   - Strategic Roadmap
   - Customized Action Plan
4. **"Hosted by" section**: Career Center contact via `ContactCard` with a "Hosted by" label above it
5. **Disclaimers**: USCIS + Legal (existing)
6. **"Begin Planning" CTA button** (existing)

All text verbatim from the user's message. No em dashes, no emojis. Uses existing `GlassCard`, `ContactCard`, and `Button` components.

Single file change: `src/pages/Cover.tsx`

