# Real Estate Data Scraper

A high-performance, AI-powered real estate data extraction and analysis tool built with Next.js 16. This application uses automated stealth browsing and advanced Large Language Models to structure highly unstructured real estate listings into predictable, relational data formats.

## 🚀 Features

- **Automated Stealth Scraping:** Bypasses aggressive WAF protections on major real estate portals using Playwright and the Puppeteer Stealth plugin.
- **AI-Driven Data Structuring:** Leverages Google's Gemini models via the Vercel AI SDK to predictably extract over 50 specific data points (carpet area, price per sqft, amenities, etc.) from unstructured HTML.
- **Intelligent Normalization:** Backend sanitization pipelines prevent AI hallucinations (e.g., ensuring carpet area does not exceed built-up area).
- **Parallel Batch Processing:** Efficiently streams NDJSON results to the client, utilizing concurrency limits to prevent API quota exhaustion.
- **Modern Authentication:** Secure, session-based authentication managed by `better-auth`.
- **Responsive Dashboard:** A beautiful, responsive user interface built with Tailwind CSS and `shadcn/ui` for analyzing, filtering, and discounting property data.
- **Secure Image Proxying:** Integrates with AWS S3 using dynamic pre-signed URLs to serve scraped screenshots without exposing private buckets.

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide React, Next Themes
- **Backend:** Next.js API Routes, TypeScript, Playwright Extra, Puppeteer Stealth, Vercel AI SDK, Zod
- **Database:** PostgreSQL, Neon, Drizzle ORM
- **Authentication:** better-auth
- **Object Storage:** AWS S3

## 🏗️ Architecture & File Structure

This project follows a highly scalable, domain-driven architecture utilizing Next.js 16 App Router. Business logic is strictly decoupled from HTTP transport layers.

```text
├── src/
│   ├── app/                    # Next.js 16 App Router pages and API routes
│   │   ├── (auth)/             # Authentication views (login, signup)
│   │   ├── dashboard/          # Main application dashboard
│   │   ├── api/                # Backend API Routes
│   │   │   ├── auth/[...all]/  # better-auth catch-all route
│   │   │   ├── images/[...filepath]/ # AWS S3 Catch-all Proxy Route (Pre-signed URLs)
│   │   │   └── property-extraction/  # Unified Controller for POST (Scraping), GET, DELETE
│   ├── auth/                   # Core authentication logic (better-auth client/server config)
│   ├── components/             # Reusable UI components (shadcn/ui, layout, modals)
│   ├── db/                     # Database schemas and Drizzle ORM connection logic
│   ├── features/               # Core Domain Logic (Decoupled from API routes)
│   │   └── property-extraction/# Scraper engine, AI extractors, Zod schemas, normalizers
│   └── lib/                    # Third-party integrations (e.g., s3-client.ts) and utils
```

## 🔐 Environment Variables

Create a `.env` file in the root of the project. Use the following structure with your own credentials:

```env
# AI Integration
GOOGLE_GENERATIVE_AI_API_KEY="your_google_gemini_api_key_here"

# AWS S3 Storage
AWS_REGION="your_aws_region_here"
AWS_ACCESS_KEY_ID="your_aws_access_key_here"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key_here"
AWS_S3_BUCKET_NAME="your_s3_bucket_name_here"

# Authentication (better-auth)
BETTER_AUTH_SECRET="your_random_secret_string_here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Database
DATABASE_URL="postgres://user:password@hostname/dbname?sslmode=require"
```

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm / yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AdnanKhan2003/auto-fetch-estate.git
   cd auto-fetch-estate
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Initialize the Database:**
   Push the Drizzle schema to your PostgreSQL database to create the necessary tables:
   ```bash
   npx drizzle-kit push
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🗄️ Database Management

Drizzle ORM is used for database interactions. Below is a quick reference for the essential `drizzle-kit` commands used in this project.

### Development Commands
- `npx drizzle-kit push`: Pushes your schema changes directly to the database without generating SQL migration files. Ideal for rapid prototyping.
- `npx drizzle-kit generate`: Creates a versioned SQL migration file in your migrations folder based on your current schema. 
- `npx drizzle-kit studio`: Launches Drizzle Studio, a local GUI for visually browsing and editing your data.

### Production Commands
In production environments, **do not** use `push`. Instead, apply the versioned migration files generated during development.
- `npx drizzle-kit migrate`: Reads your generated `.sql` files and safely applies only the pending migrations to the production database.

## 🛡️ Best Practices & Limitations

- **Rate Limiting:** The application is configured with internal rate limits to respect external API free-tier quotas (e.g., LLM APIs).
- **Strict Boundaries:** Incoming AI data is parsed through strict Zod schemas before database insertion to prevent frontend crashes from hallucinated fields.
- **Stealth Browsing:** The scraping engine uses headless Chromium. Success rates may vary based on live bot-mitigation updates on target websites.

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
