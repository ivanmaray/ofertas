# Copilot Instructions for Ofertas_FH Next.js Project

## Project Overview
This is a Next.js web application for processing pharmaceutical offers. It allows users to upload Excel files, select price columns, preview data, and view processed results with search functionality.

## Completed Tasks
- [x] Scaffold Next.js project with TypeScript and Tailwind CSS
- [x] Install dependencies (xlsx, papaparse)
- [x] Copy basedatos.xlsx to public folder
- [x] Customize app/page.tsx with file upload, preview, column selection, processing, and results display
- [x] Implement auto-import of basedatos.xlsx on startup
- [x] Add search filters for principle active and presentation
- [x] Start development server

## Pending Tasks
- [ ] Test the application with sample files
- [ ] Add export functionality for results
- [ ] Deploy to Vercel
- [ ] Add error handling and loading states
- [ ] Optimize for mobile responsiveness

## Key Features Implemented
- File upload with multiple file support (.xlsx, .xls, .csv)
- 20-row preview of uploaded data
- Manual price column selection
- Processing of offers with basedatos enrichment
- Search by principle active and presentation
- Results table with CN, price, lab, principle, presentation, date, supply issues

## Technologies Used
- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- xlsx for Excel parsing
- React hooks for state management

## How to Run
```bash
cd /Users/ivanmaray/Desktop/Ofertas_FH/next-app
npm run dev
```

Open http://localhost:3000 in your browser.