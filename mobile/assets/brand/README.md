# Brand assets

Source SVGs for the AgentBridge mark (from Figma). These are reference/export
assets, not loaded directly at runtime — the app renders the mark natively
via `src/components/Logo.js` (react-native-svg), which reproduces these same
paths/colors so it can recolor, resize, and animate them per screen.

- `logo-connecting.svg` — full color, base frame of the animated "looking
  for your agent" state (`Logo` animates the cables in via `animated`)
- `logo-static.svg` — full color, static cables (nav bars, headers)
- `logo-dim.svg` — desaturated/low-opacity, with cables (`dim` prop)
- `logo-simple-dim.svg` — desaturated, no cables, larger anchors (`dim`
  + `cables={false}`)

Also referenced: a plain success checkmark-in-circle for the "agent linked"
moment - not a bridge mark, implemented directly as `SuccessCheck.js`.

These aren't wired into `app.json`'s icon/splash config yet - the actual
app-icon and favicon PNGs (`icon.png`, `android-icon-*.png`, `favicon.png`)
are still Expo's default template placeholders and need to be generated
from this mark at each required size.
