---

```markdown
# Social Media Analytics

This is a **React + TypeScript** application built with **Vite**. It fetches and analyzes social media data via APIs, displaying **Top Posts**, **Latest Posts**, and **Top Users** with smart caching to reduce redundant API calls.

---

## Features

- Built with **React + Vite + TypeScript**
- Efficient **API caching** to reduce load
- Displays:
  - **Top Users** by comment engagement
  - **Popular Posts** (by comment count)
  - **Latest Posts** (by timestamp)
- In-memory caching to minimize API hits
- Clear cache at app load to ensure fresh data

---

## Prerequisites

- [Node.js](https://nodejs.org/) v14 or later
- npm (comes with Node.js) or [Yarn](https://yarnpkg.com/)

---

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies:

   Using npm:

   ```bash
   npm install
   ```

   Or using Yarn:

   ```bash
   yarn
   ```

---

## Running the App

Start the development server with hot module replacement:

Using npm:

```bash
npm run dev
```

Or using Yarn:

```bash
yarn dev
```

Then open your browser at:  
[http://localhost:5173](http://localhost:5173)

---

## Application Overview

### Home Page

- Prefetches and caches all required data on load
- Displays navigation links to explore:
  - Top Users
  - Latest Posts
  - Popular Posts

### Top Users

- Shows top 5 users based on their most commented post

### Top Posts

- View Latest Posts (by timestamp)
- View Popular Posts (with most comments)

---

## Cache Management

- All API data is cached in memory after the first fetch
- Cache is cleared on app start using `clearCachedData()` to avoid stale data during development

---

---

## Troubleshooting

- Ensure a valid **Access Token** is defined in `.env`:

  ```
  VITE_ACCESS_TOKEN=your-token-here
  ```

- Confirm that the API server is live and responds correctly
- Check the browser console for detailed error messages during development

---

## License

This project is licensed under the **MIT License**.

---
