# Real Estate Data Scraper

A high-performance, AI-powered real estate data extraction and analysis tool built with Next.js 16. This application uses automated stealth browsing and advanced Large Language Models to structure highly unstructured real estate listings into predictable, relational data formats.

## 🚀 Features

- **Automated Stealth Scraping:** Bypasses aggressive WAF protections on major real estate portals using Playwright and the Puppeteer Stealth plugin.
- **AI-Driven Data Structuring:** Leverages Google's Gemini models via the Vercel AI SDK to predictably extract over 50 specific data points (carpet area, price per sqft, amenities, etc.) from unstructured HTML.
- **Intelligent Normalization:** Backend sanitization pipelines prevent AI hallucinations (e.g., ensuring carpet area does not exceed built-up area).
- **Parallel Batch Processing:** Efficiently streams NDJSON results to the client, utilizing concurrency limits to prevent API quota exhaustion.
- **Modern Authentication:** Secure, session-based authentication managed by `better-auth`.
- **Responsive Dashboard:** A beautiful, responsive user interface built with Tailwind CSS and `shadcn/ui` for analyzing, filtering, and discounting property data.

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & [shadcn/ui](https://ui.shadcn.com/)
- **Database:** PostgreSQL (hosted on Neon)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication:** [better-auth](https://better-auth.com/)
- **Scraping Engine:** Playwright Extra + Stealth Plugin
- **AI Integration:** Vercel AI SDK (`@ai-sdk/google`)
- **Validation:** Zod

## 🏗️ Architecture & Structure

This project follows a clean, domain-driven architecture organized within the `src/` directory:

- `/src/app` - Next.js 16 application router pages and API endpoints.
- `/src/auth` - Core authentication logic and better-auth configurations.
- `/src/components` - Reusable UI components (shadcn/ui and custom layouts).
- `/src/db` - Database schemas and Drizzle ORM connection logic.
- `/src/features` - The core business logic, including the Playwright scraper, AI extractor, and data normalizers.
- `/src/lib` - Utility functions, regular expressions, and rate limiters.
- `src/proxy.ts` - Centralized routing logic and authentication protection.

## ⚙️ Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm / yarn / pnpm
- A PostgreSQL Database (e.g., [Neon](https://neon.tech/))

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

3. **Environment Configuration:**
   Create a `.env` file in the root of your project. You will need to provide your database connection strings, authentication secrets, and API keys for the AI models. *(Refer to the internal team documentation for the required environment keys).*

4. **Initialize the Database:**
   Push the Drizzle schema to your PostgreSQL database to create the necessary tables:
   ```bash
   npx drizzle-kit push
   ```

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## 🗄️ Database Management

Drizzle ORM is used for database interactions. Below is a quick reference for the essential `drizzle-kit` commands used in this project.

### Development Commands
In development, you often want your database to match your schema immediately without worrying about a versioned history for every tiny change.

- `npx drizzle-kit push`: Pushes your schema changes directly to the database without generating SQL migration files. Ideal for rapid prototyping on a local or sandbox database.
- `npx drizzle-kit generate`: Creates a versioned SQL migration file in your migrations folder based on your current schema. Use this when you are ready to "lock in" a set of changes for production.
- `npx drizzle-kit studio`: Launches Drizzle Studio, a local GUI for visually browsing and editing your data.
- `npx drizzle-kit up`: Updates your metadata and snapshots to the latest Drizzle Kit version.

### Production Commands
In production environments, **do not** use `push`. Instead, apply the versioned migration files generated during development.

- `npx drizzle-kit migrate`: Reads your generated `.sql` files and safely applies only the pending migrations to the production database.
- `npx drizzle-kit check`: Verifies that your migration history is consistent and hasn't been corrupted. Highly recommended for CI/CD pipelines before deployment.

> **Pro-Tip:** For production deployments, it is often preferred to execute the `migrate()` function programmatically inside your application code (e.g., during the build step or at startup) rather than relying on the CLI. This ensures the database schema is strictly synchronized with the deployed app version.


## 🛡️ Best Practices & Limitations

- **Rate Limiting:** The application is configured with internal rate limits to respect external API free-tier quotas (e.g., LLM APIs).
- **Stealth Browsing:** The scraping engine uses headless Chromium. Depending on the target website, scraping success rates may vary based on their live bot-mitigation updates.
- **Data Integrity:** Always review the scraped data. While the AI is heavily prompted via strict Zod descriptions, real estate data is inherently messy and requires the built-in normalization fallbacks.

## 📄 License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.
