# Attribute questions

The clarification checklist for `from-brief/01-clarify`. Ask only what the brief leaves genuinely ambiguous **and** what changes a token decision. Cap a single round at 3–4 questions; default the rest and record them as Open questions.

## Drivers that change tokens (ask if unknown)

| Attribute | Why it matters | Sensible default if unanswered |
|---|---|---|
| **Brand personality** (e.g. trustworthy / playful / premium / technical / warm) | Drives palette temperature, type pairing, radius, motion energy | Neutral-professional |
| **Audience & context** (consumer vs. pro tool, casual vs. expert, region) | Drives density, contrast, font size floor, tone | General consumer, mobile-heavy |
| **Primary platform & usage** (mobile-first app, content site, dashboard) | Drives layout strategy, enriched/mobile-only split, density | Mobile-first responsive web |
| **Brand color or logo constraints** | Anchors the brand ramp | Derive a distinctive primary from personality |
| **Light / dark / both** | Doubles the semantic layer if both | Light only (note dark as future) |
| **Accessibility / compliance bar** (e.g. WCAG AA/AAA, public sector) | Sets contrast and target-size minimums | WCAG AA |

## Do not ask

- Exact hex values, font names, or pixel sizes — those are the system's job to derive.
- Anything already stated or strongly implied by the brief.
- Implementation/framework details unless they constrain tokens.

## Output of clarification

A short attribute profile (personality, audience, platform, color/theme constraints, a11y bar) that `derive` turns into tokens. Anything defaulted is listed for the user to correct.
