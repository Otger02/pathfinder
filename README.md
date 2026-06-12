# Pathfinder: Immigration Knowledge Base

A minimal Next.js repository serving as a centralized knowledge base container for immigration information, asylum procedures, and multilingual resources.

## Project Structure

- **`/docs`** — Project documentation and guides
- **`/knowledge`** — Organized immigration content:
  - `spain/` — Spanish immigration law and procedures
  - `europe/` — EU-wide asylum and protection content
  - `resources/` — NGOs and organizations by country/region
  - `languages/` — Translation glossaries and terminology
- **`/data`** — Structured JSON files for decision trees and authorization catalogs
- **`/app`** — Next.js app directory (minimal, for future use)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
npm start
```

## Content Organization

This repository is designed as a **content container** rather than a full-featured application. Content is organized hierarchically:

- Documentation and guides in markdown format
- Structured data in JSON format for decision trees and catalogs
- Language-specific glossaries for consistent terminology
- Regional knowledge bases for jurisdiction-specific information

## License

TBD

## Contributing

TBD

## Documents institucionals (dossiers PDF)

Els dossiers públics de `public/` **no s'actualitzen sols** — regenera'ls
quan canviï el producte, la cobertura legal o el marc de compliment:

```bash
# Dossier en castellà (text)
npx tsx scripts/generate-dossier.ts

# Dossier en català (visual, amb captures reals de l'app)
npm run dev                                # terminal 1
npx tsx scripts/capture-screenshots.ts     # terminal 2
npx tsx scripts/generate-dossier-ca.ts
```

Sortides: `public/pathfinder-dossier.pdf` i `public/pathfinder-dossier-ca.pdf`
(enllaçats des del footer, /privacy i /terms). Committeja els PDFs regenerats.

### Espècimens de prova (visió)

Documents ficticis per provar la lectura de documents (📎 al chat):
`public/especimen-passaport.png` + `public/especimen-contracte.pdf`
(persona fictícia consistent entre tots dos). Regenerar amb
`npx tsx scripts/generate-test-specimens.ts`; validar amb
`npx tsx scripts/test-vision-specimens.ts` (crides reals a l'API).
