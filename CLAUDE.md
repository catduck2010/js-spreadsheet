# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build

```bash
bun install
bun run build          # compiles SCSS → dist/main.css (uses sass via bunx)
```

There are no tests (`bun run test` is a placeholder that exits with an error). No linter is configured.

To run the app, open `spreadsheet.html` in a browser. RxJS is loaded from a CDN, so an internet connection is required.

## Architecture

This is a single-page browser spreadsheet app. All application logic lives in one file: `script/main.js`.

### Core classes (script/main.js)

- **`Sheet`** — Data model. Holds a 2D array (`board`) of `SheetCell` objects, a `cellMap` (UUID → cell) for tracking live cells, and a `RefTree` for dependency management. Handles formula parsing, cell references, SUM function evaluation, CSV export/import, and row/column insert/delete. Uses static helpers for column letter ↔ index conversion (`letter2index`, `index2letter`) and label parsing (`convertLabel`).

- **`SheetCell`** — Individual cell. Stores value, formula text (`formula`), internal formula with placeholders (`formulaR` using `{-R-}` for cell refs and `{-S-}` for SUM refs), and references to other cells. Handles formula refresh/recalculation.

- **`RefTree`** — Directed graph (adjacency list via `Map`) for cell dependency tracking. Detects circular references using DFS cycle detection. Updates dependent cells bottom-up after edits using RxJS observables.

- **`SheetTable`** — DOM controller. Bridges `Sheet` data to the HTML table. Manages selection state (cell/row/column), the formula bar, name box (locator), inline editing via temporary `<input>` elements, and menu interactions. Stored as `document.sheetTable`.

### Key patterns

- **Formula evaluation**: Formulas starting with `=` are parsed, cell references are replaced with `{-R-}` placeholders and SUM ranges with `{-S-}` placeholders in `formulaR`. At eval time, placeholders are substituted with actual values, validated against a numeric-only regex, then evaluated via `new Function()`.
- **RxJS usage**: Used for ordering cell refresh operations (`from` + `pipe` + `filter`) and for processing formula reference substitutions (`concat` observable streams). Loaded via CDN in the HTML.
- **Global state**: The spreadsheet instance is stored on `document.sheetTable`. HTML event handlers reference it directly.
- **Array prototype extensions**: `Array.prototype.insert` and `Array.prototype.remove` are added for splice convenience.

### Styles

SCSS files in `styles/` compile to `dist/main.css`. `main.scss` contains all styles; `mixin.scss` defines shared `cellHeight` and `commonGrid` mixins.
