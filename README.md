# IndiBrief

IndiBrief is a Next.js application that fetches the latest news headlines from India Today, summarizes them using Google Gemini, and allows users to receive them on demand via email or preview them in the browser.

## Features

-   **On-Demand News**: Get the latest news headlines delivered to your email with the click of a button.
-   **AI-Powered Summaries**: Each news article is summarized by Google Gemini to give you a quick overview.
-   **Web Preview**: Preview the latest headlines and their summaries directly in the browser.
-   **Modern UI**: A clean, modern, and animated user interface built with Tailwind CSS.

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20 or later)
-   [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project by copying the example file:

```bash
cp .env.local.example .env.local
```

Now, open the `.env.local` file and add the following environment variables.

-   `DATABASE_URL`: The connection string for your database. For the default SQLite setup, you don't need to change this.
    ```
    DATABASE_URL="file:./dev.db"
    ```
-   `GEMINI_API_KEY`: Your API key for the Google Gemini API. You can get one from [Google AI Studio](https://aistudio.google.com/).
    ```
    GEMINI_API_KEY="your-google-gemini-api-key"
    ```
-   `AUTH_SECRET`: A secret key for NextAuth.js. You can generate one with `openssl rand -base64 32`.
    ```
    AUTH_SECRET="your-super-secret-key"
    ```
-   **Email Server Settings**: These are required for the email sign-in functionality.
    ```
    EMAIL_SERVER_HOST="your-email-server-host"
    EMAIL_SERVER_PORT="your-email-server-port"
    EMAIL_SERVER_USER="your-email-server-user"
    EMAIL_SERVER_PASSWORD="your-email-server-password"
    EMAIL_FROM="your-email-from"
    ```

### 4. Run database migrations

Apply the database schema to your database by running the following command:

```bash
npx prisma migrate dev
```

### 5. Run the development server

Now you can start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use the Application

### Signing In

The application uses a passwordless email sign-in system. For this proof of concept, the email is hardcoded to `test@example.com`.
When you click the "Sign In with Email" button, a magic link will be sent to your console (not a real email inbox). You need to copy the link from the console and open it in your browser to sign in.

### Fetching News

The application fetches news headlines from India Today using a cron job. To fetch the latest news, you need to manually trigger the cron job by visiting the following URL in your browser:

[http://localhost:3000/api/cron](http://localhost:3000/api/cron)

For the application to fetch news automatically in a production environment, you will need to set up a scheduling service (like Vercel Cron Jobs or GitHub Actions) to call this URL at a regular interval (e.g., every 30 minutes).

### Using the Dashboard

Once you are signed in and have fetched some headlines, you will see the main dashboard with two options:

-   **Send News**: This will send an email to your sign-in address with the latest headlines and their summaries.
-   **Preview Latest**: This will take you to a page where you can preview the latest headlines and their summaries directly in the browser.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
