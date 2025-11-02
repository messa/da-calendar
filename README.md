# Daily Adventures Calendar

A Next.js calendar application that displays events and courses from [Daily Adventures](https://daily-adventures.cz/).

## Data Workflow

This project uses an automated workflow to keep the calendar up-to-date:

1. **Data Collection**: A GitHub Actions workflow runs daily at midnight UTC (configured as a cron job)
2. **Python Script**: The `data/fetch_calendar.py` script fetches event data from daily-adventures.cz website
3. **Data Update**: The script updates `data/calendar.json` with the latest events
4. **Auto-Commit**: Changes are automatically committed and pushed back to the repository
5. **Deployment**: Vercel's GitHub integration automatically deploys the updated Next.js website

This ensures the calendar is always current without manual intervention.

## Technology Stack

### Core Framework
- **[Next.js](https://nextjs.org/) 16.0.1** - React framework with server-side rendering, static site generation, and optimized performance
- **[React](https://react.dev/) 19** - Modern UI library for building component-based interfaces
- **[TypeScript](https://www.typescriptlang.org/) 5.9.3** - Type-safe JavaScript for better developer experience and code quality

### Styling
- **[Tailwind CSS](https://tailwindcss.com/) 4.1.16** - Utility-first CSS framework for rapid UI development
- **[PostCSS](https://postcss.org/)** - CSS processing with Tailwind integration

### Data Collection (Python)
- **lxml** - HTML parsing and processing
- **requests** - HTTP library for fetching calendar data

## Directory Structure

```
da-calendar/
├── .github/
│   └── workflows/
│       └── update_calendar.yaml    # GitHub Actions workflow for daily calendar updates
├── app/
│   ├── favicon.ico                 # Site favicon
│   ├── globals.css                 # Global styles and Tailwind imports
│   ├── layout.tsx                  # Root layout component
│   └── page.tsx                    # Main calendar page component
├── data/
│   ├── calendar.json               # Event data (auto-updated daily)
│   └── fetch_calendar.py           # Python script to fetch and parse events
├── public/
│   ├── next.svg                    # Next.js logo
│   └── vercel.svg                  # Vercel logo
├── next.config.mjs                 # Next.js configuration
├── package.json                    # Node.js dependencies and scripts
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.ts              # Tailwind CSS configuration
├── tsconfig.json                   # TypeScript configuration
├── CLAUDE.md                       # AI assistant context file
├── LICENSE                         # MIT License
└── README.md                       # This file
```

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the calendar.

### Build

Create a production build:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Lint

```bash
npm run lint
```

## Deployment

This project is deployed on [Vercel](https://vercel.com/). The deployment is automated - any push to the main branch triggers a new deployment.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
