# Zeus voice audio chain plugins

The TX-side voice audio chain for Openhpsdr-Zeus, shipped as a curated
set of Zeus-native `IAudioPlugin` plugins. Each block plugs into the
chain at `audio.slot: "tx.pre-cfc"` and surfaces an operator UI panel
at `ui.panels[0].slot: "tx-audio-tools.chain"` so Zeus's
**Settings → TX Audio Tools** tab renders the whole chain in order
above CFC.

## The v1 chain (per [openhpsdr-zeus#332](https://github.com/Kb2uka/openhpsdr-zeus/issues/332))

Locked signal order — Zeus's `TxAudioToolsPanel` sorts installed
chain plugins into this order automatically:

| # | Block | Status | Folder |
|---|---|---|---|
| 1 | **10-Band Parametric EQ** | shipped (v0.1.0) | [`Eq/`](Eq/) |
| 2 | **Compressor** | shipped (v0.1.2) | [`Compressor/`](Compressor/) |
| 3 | **Exciter** | pending | — |
| 4 | **Bass enhancer** (Aphex 204 / MaxxBass-style psychoacoustic) | pending | — |
| 5 | **Reverb** | pending | — |

WDSP CFC continues to render below the chain (it's built into Zeus
core, not a plugin).

## Conventions every audio-chain plugin follows

Every block in this folder implements the same shape so operators get
a consistent experience across the chain:

1. **Realtime DSP** in pure managed C#, no native dependency. No
   allocate / lock / IO inside `Process`. Coefficients / parameters
   snapshotted once per block to avoid torn reads if a control-thread
   `Set` lands mid-block.
2. **`bypass: bool` parameter** in the params DTO (default `false`).
   `Process` fast-path when bypass is on: `input.CopyTo(output)`,
   identity meters, zero any block-specific gain/activity metric,
   preserve internal DSP state so re-engagement doesn't pop.
3. **`IPluginSettings` persistence** under a `"bypass"` key plus
   one key per operator-tunable parameter. Operator dial-in
   survives backend restart, same pattern Zeus uses for drive /
   TUN persistence on the radio side.
4. **REST surface** at `/api/plugins/{id}/params` (GET full state,
   POST partial PATCH) and `/api/plugins/{id}/meters` (GET live
   IN/OUT levels + any block-specific metric like the compressor's
   gain reduction).
5. **UI panel**:
   - Brass-instrument-plate header with `--power` gold rail bloom
     matching Zeus v3 Lifted Dark theme.
   - **Bypass button** top-right of the header: `--tx` red active
     state with glow, `--bg-2` neutral inactive state.
   - Centerpiece SVG visualization specific to the block
     (transfer-function curve for Comp, magnitude curve for EQ,
     spectrum + harmonic overlay for Exciter, etc.).
   - SVG rotary knobs with drag-to-rotate (270 ° arc, shift-drag
     for fine, double-click to reset, wheel to step).
   - Segmented LED-style vertical meters where applicable.
   - All colours via `tokens.css` CSS variables; no raw hex.
   - Inter UI / JetBrains Mono numerics.
   - Knob/control area dims to 45 % opacity when bypassed.

The `Compressor/` folder is the canonical reference — every other
block in this category copies its csproj layout, build harness
(`package.json`, `tsconfig.json`, `vite.config.ts`), plugin manifest
shape, and UI conventions. Start there when authoring a new
audio-chain block.

## Authoritative references

- **Phase 0 PRD** (master proposal):
  [`docs/proposals/audio-chain-phase0.md`](https://github.com/Kb2uka/openhpsdr-zeus/blob/develop/docs/proposals/audio-chain-phase0.md)
  in the main Zeus repo.
- **Sibling research**:
  [`docs/proposals/audio-chain/01-aethersdr-and-external-deps.md`](https://github.com/Kb2uka/openhpsdr-zeus/blob/develop/docs/proposals/audio-chain/01-aethersdr-and-external-deps.md),
  [`02-wdsp-gap-analysis.md`](https://github.com/Kb2uka/openhpsdr-zeus/blob/develop/docs/proposals/audio-chain/02-wdsp-gap-analysis.md),
  [`03-ux-and-integration.md`](https://github.com/Kb2uka/openhpsdr-zeus/blob/develop/docs/proposals/audio-chain/03-ux-and-integration.md).
- **Plugin runtime** ([openhpsdr-zeus#368](https://github.com/Kb2uka/openhpsdr-zeus/pull/368))
  and **slot-query rendering**
  ([openhpsdr-zeus#373](https://github.com/Kb2uka/openhpsdr-zeus/pull/373))
  on the Zeus core side wire all of this together.
