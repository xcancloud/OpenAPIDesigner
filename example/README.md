# OpenAPI Designer - Example

A standalone example application demonstrating the OpenAPI Designer component.

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open the URL shown in the terminal (typically http://localhost:5173).

## Features

- **Sample Documents** — Switch between a blank document and the Petstore sample
- **Theme Toggle** — Switch between light and dark modes
- **Language Toggle** — Switch between English and Chinese
- **Live Status** — Footer bar shows document title, version, and stats

## Project Structure

```
example/
├── index.html          # HTML entry point
├── package.json        # Dependencies
├── vite.config.ts      # Vite config with aliases to parent src/
├── tsconfig.json       # TypeScript config
└── src/
    ├── main.tsx        # React entry point
    ├── App.tsx         # Example application
    └── styles/
        └── index.css   # Tailwind CSS + theme variables
```

The example imports the `OpenAPIDesigner` component from the parent project
via Vite path aliases (`@components` → `../src/app/components`).
