# Ynex Admin Dashboard - Next.js + TypeScript + Tailwind

A modern admin dashboard template built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🚀 Next.js 14 with App Router
- 📘 TypeScript
- 🎨 Tailwind CSS
- 🔥 Firebase Integration (optional)
- 📊 Charts & Analytics (ApexCharts, Chart.js, ECharts)
- 📅 Calendar (FullCalendar)
- 🗺️ Maps (Leaflet)
- 📝 Rich Text Editor (Quill)
- 📋 Data Tables (GridJS, React Table)
- 🎭 UI Components (Material-UI, Preline)
- 🌙 Dark Mode Support
- 📱 Responsive Design

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Install dependencies:
```bash
npm install
```

2. (Optional) Configure Firebase:
   - Update `shared/firebase/firebaseapi.tsx` with your Firebase config
   - Or remove Firebase if not needed

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login

- Email: `adminnextjs@gmail.com`
- Password: `1234567890`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run sass` - Compile SCSS to CSS
- `npm run sass-min` - Compile SCSS to CSS (minified)

## Project Structure

```
app/
  ├── (components)/          # Route groups
  │   ├── (authenticationlayout)/  # Auth pages
  │   ├── (contentlayout)/         # Main dashboard pages
  │   └── (landingpagelayout)/     # Landing pages
  ├── api/                   # API routes
  └── page.tsx              # Home/login page

shared/
  ├── components/           # Reusable components
  ├── data/                 # Static data & mock data
  ├── firebase/             # Firebase configuration
  ├── layout-components/    # Layout components (header, sidebar, etc.)
  └── redux/                # Redux store & actions

public/
  └── assets/               # Static assets (images, fonts, etc.)
```

## Customization

### Theme Colors
Edit `tailwind.config.ts` to customize colors and theme settings.

### Layout Components
Modify components in `shared/layout-components/`:
- `header/` - Top navigation
- `sidebar/` - Sidebar menu
- `footer/` - Footer component

### Routes
Add new pages in `app/(components)/(contentlayout)/` following the existing structure.

## Dependencies

Key dependencies:
- **Next.js 14.2.1** - React framework
- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 3.4** - Styling
- **Redux Toolkit** - State management
- **ApexCharts** - Charts library
- **Preline UI** - Component library

See `package.json` for full list.

## Build & Deploy

```bash
npm run build
npm run start
```

For static export, modify `next.config.js` to add `output: "export"`.

## License

Check the license agreement for usage terms.

## Support

For issues and questions, refer to the original theme documentation or create an issue in your repository.

# Samsara_crm
