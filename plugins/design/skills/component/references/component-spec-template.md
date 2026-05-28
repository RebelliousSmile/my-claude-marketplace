# Component — <Name>

> Spec stored at `design/components/<name>.md`. Filled by `component/01-spec`, consumed by `02-implement` and `audit`.

## Purpose

One sentence: what this component is for and when to use it (vs. when not to).

## Anatomy

The structural parts (slots/regions), e.g. `[icon?] [label] [trailing?]`. Note which are optional.

## Options

| Option | Type | Values | Default | Effect |
|---|---|---|---|---|
| `variant` | enum | `primary` `secondary` `ghost` `danger` | `primary` | visual mode |
| `size` | enum | `sm` `md` `lg` | `md` | scale step (maps to space/type tokens) |
| `icon` | bool | — | `false` | renders leading icon slot |
| `loading` | bool | — | `false` | shows spinner, disables interaction |
| `block` | bool | — | `false` | full-width |

(Adapt to the component. Document any invalid combination.)

## States

For each applicable state, the token-based treatment:

- default · hover · focus (visible ring) · active · disabled · loading · empty · error

## Tokens used

List the tokens this component consumes (semantic colors, space steps, type style, radius, shadow, motion). No value lives outside a token.

## Responsive divergence

- Behavior/appearance changes by breakpoint, if any.
- Any mobile-only pattern + its desktop equivalent (same outcome).
- If none, state "uniform across breakpoints".

## Accessibility

- Role / semantics (native element preferred).
- Keyboard interaction and focus order.
- Labeling (associated label / `aria-*` only where native won't do).
- Contrast verdict for each variant.
- Touch target ≥ 44px on mobile.

## Usage examples

Minimal (no props) + a couple of common option combinations.
