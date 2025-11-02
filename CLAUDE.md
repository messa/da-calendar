# CLAUDE.md

This file provides context for AI assistants working with the da-calendar project.

## Project Overview

This is a Next.js calendar application built with React and TypeScript that displays events and courses from [Daily Adventures](https://daily-adventures.cz/). The calendar is automatically updated daily through an automated data workflow.

## Data Workflow

The project uses an automated pipeline to keep event data current:

1. **Scheduled Updates**: A GitHub Actions workflow (`update_calendar.yaml`) runs daily at midnight UTC
2. **Data Fetching**: Python script `data/fetch_calendar.py` retrieves event information from daily-adventures.cz
3. **Data Processing**: Events are parsed from HTML and consolidated (multi-day events are merged)
4. **Storage**: Processed data is saved to `data/calendar.json` in a structured format
5. **Auto-commit**: Changes are committed and pushed to the repository by GitHub Actions bot
6. **Deployment**: Vercel's GitHub integration detects changes and automatically redeploys the website

This workflow ensures the calendar stays synchronized with the source website without manual intervention.

## Technology Stack

### Frontend
- **Framework**: Next.js 16.0.1 - React framework with SSR/SSG capabilities
- **Runtime**: React 19 - Component-based UI library
- **Language**: TypeScript 5.9.3 - Type-safe JavaScript
- **Styling**: Tailwind CSS 4.1.16 - Utility-first CSS framework

### Data Collection
- **Python 3.12** - Script runtime
- **lxml** - HTML parsing library
- **requests** - HTTP client for data fetching

### Development Tools
- **ESLint** - Code linting (configured with Next.js defaults)
- **PostCSS** - CSS processing
- **Autoprefixer** - Automatic vendor prefix addition

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
da-calendar/
├── .github/
│   └── workflows/
│       └── update_calendar.yaml    # Cron job: daily calendar updates
│
├── app/                            # Next.js app directory
│   ├── favicon.ico                 # Site icon
│   ├── globals.css                 # Global styles + Tailwind directives
│   ├── layout.tsx                  # Root layout (defines HTML structure)
│   └── page.tsx                    # Main calendar page (renders monthly grids)
│
├── data/                           # Data files
│   ├── calendar.json               # Event data (auto-updated by GitHub Actions)
│   └── fetch_calendar.py           # Python script: fetch & parse events
│
├── public/                         # Static assets
│   ├── next.svg                    # Next.js logo
│   └── vercel.svg                  # Vercel logo
│
├── Configuration files:
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Dependencies and scripts
├── postcss.config.js               # PostCSS setup (Tailwind integration)
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript compiler options
└── CLAUDE.md                       # This file
```

## Key Implementation Details

### Calendar Rendering
- `app/page.tsx` reads from `data/calendar.json` and renders monthly calendar grids
- Multi-day events are visually connected across cells with special styling
- Events display with tooltips showing duration
- Czech language used for month/day names
- Responsive design with mobile-first approach

### Data Format
`calendar.json` structure:
```json
{
  "months": [
    {
      "date": "2025-11-01",
      "days": [
        {
          "date": "2025-11-01",
          "events": [
            {
              "title": "Event Name",
              "url": "https://...",
              "start_date": "2025-11-01",
              "end_date": "2025-11-03",
              "duration_days": 3
            }
          ]
        }
      ]
    }
  ]
}
```

### Python Script
`data/fetch_calendar.py`:
- Fetches calendar HTML from daily-adventures.cz WordPress AJAX endpoint
- Parses HTML using lxml
- Consolidates consecutive-day events into multi-day events
- Outputs ISO-formatted dates in JSON
- Includes unit tests with sample data

## Deployment

- **Platform**: Vercel
- **Trigger**: Automatic on push to main branch
- **Build Command**: `npm run build`
- **Output**: Static site with pre-rendered pages

## License

This project is licensed under the MIT License. See LICENSE file for details.
