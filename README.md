# JS Spreadsheet

A browser-based spreadsheet application built with vanilla JavaScript and RxJS.

## Features

- Excel-style UI with name box and formula bar
- `SUM` function with range support (e.g. `=4+SUM(A1:A5)/5`)
- Cell references in formulas (e.g. `=A1+A2`)
- Circular reference detection via a reference tree
- Add/delete rows and columns
- Export and load CSV files

## Tech Stack

- RxJS (formula event handling)
- node-sass (SCSS compilation)
- Google Fonts (Open Sans, Noto Sans HK/KR/JP)

## Requirements

- Node.js and npm
- Internet connection (for fonts and RxJS CDN)

## Getting Started

1. Clone the repo and navigate to the directory
2. Run `npm install`
3. Run `npm build` to compile SCSS to CSS
4. Open `spreadsheet.html` in a browser
