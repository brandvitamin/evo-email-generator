# EVOPANEL Email Generator

This is a web application that generates customized follow-up emails for EVOPANEL by Bord Products based on CSV data.

## Features

- Upload CSV files with contact information
- Generate customized emails for each contact
- Preview individual emails
- Export emails as CSV for use in email marketing systems
- Download CSV or copy to clipboard

## CSV Format Requirements

Your CSV file should include the following columns:
- `Specifier Contact: Name` - Contact's full name
- `Specifier Contact: Email` - Contact's email address
- `Specifier Meeting Date` - Date of the meeting (YYYY-MM-DD format)
- `ARC Representative` - Name of the Arc Agency representative
- `Action Required` - Type of follow-up needed (must be one of: "PDF information", "PDF information & indicative pricing", "PDF information, Indicative pricing & samples requested")
- `Current Projects` - Description of their projects
- `Specifier Needs` - Specific requirements or interests

## Deployment Instructions

### Local Development

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm start` to start the development server
4. Open [http://localhost:3000](http://localhost:3000) to view it in your browser

### Deploy to Render

1. Push your code to GitHub or GitLab
2. Sign up for [Render](https://render.com)
3. Create a new "Static Site" service
4. Connect your repository
5. Use these build settings:
   - Build Command: `npm run build`
   - Publish Directory: `build`
6. Click "Create Static Site"

### Deploy to Netlify

1. Push your code to GitHub or GitLab
2. Sign up for [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Connect your repository
5. Configure build settings:
   - Build Command: `npm run build`
   - Publish Directory: `build`
6. Click "Deploy site"

## Technologies Used

- React
- PapaParse (for CSV parsing)
- CSS for styling
