# HabitAI - Smart Habit & Behavioral Analytics Web App

Welcome to **HabitAI**, a premium, responsive full-stack web application designed to help users establish healthy routines while tracing active interaction signals. HabitAI integrates habit tracking with **Internet of Behavior (IoB)** telemetry and processes data through an **AI Habit Advisor** to deliver smart, corrective behavioral advice.

This document serves as a comprehensive guide explaining how this codebase implements and satisfies each of the core **Course Outcomes (CO1 to CO5)**.

---

## Course Outcomes Mapping & Evidence

### 1. Modern Front-end Framework & Responsive Design (CO1)
*Outcome Statement: Apply modern front-end development frameworks to build responsive web applications.*

HabitAI's user interface is implemented as a responsive Single Page Application (SPA) using **React** and compiled via the high-speed **Vite** bundler.
* **Component-Driven Architecture**: The frontend divides UI concerns into modular, reusable React components located in the [`frontend/src/components/`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/components) directory:
  * [`App.jsx`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/App.jsx): The main shell orchestrating state, rendering headers/navigation tabs, and initiating session metrics.
  * [`HabitTracker.jsx`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/components/HabitTracker.jsx): Houses the custom 7-day grid check-in bubble interface, habit deletion handles, and consecutive streak calculators.
  * [`ConsistencyAnalytics.jsx`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/components/ConsistencyAnalytics.jsx): Implements the KPI metrics cards, radial weekly goal progress rings, concentric SVG category rings, and trend graphs.
  * [`IoBAnalytics.jsx`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/components/IoBAnalytics.jsx): Manages raw telemetry tabular rendering, interactive distribution bars, and synchronizes telemetry inputs.
  * [`AiAdvisor.jsx`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/components/AiAdvisor.jsx): Coordinates requests to the rule-based AI engine and presents insights.
  * [`TutorialTour.jsx`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/components/TutorialTour.jsx): Coordinates a custom, interactive glassmorphic guided tour across the application views using SVG curved arrows.
* **Rich CSS Design System & Layouts**: Written in [`index.css`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/index.css) utilizing custom CSS variables (`--color-primary`, `--bg-dark`, etc.), glassmorphism (`backdrop-filter: blur(12px)`), neon glows, and custom micro-animations (e.g. `fade-in-up`, `spin`).
* **Responsiveness**: Form layouts (e.g., standard Flexbox and CSS Grid combinations `grid-2`, `grid-3`, `grid-4`) automatically flow from wide desktop screens into single-column layouts for mobile viewports.

---

### 2. RESTful APIs & Relational Database Integration (CO2)
*Outcome Statement: Develop robust RESTful APIs and integrate with databases for backend solutions.*

The backend is powered by a **Node.js** & **Express** REST API server running on **Port 5000**, fully integrated with a relational **SQLite** database via the **Sequelize ORM**.
* **Database Models & Associations**: Models are configured in the [`backend/models/`](file:///c:/Users/aksha/Desktop/MAD/backend/models) directory:
  * [`User.js`](file:///c:/Users/aksha/Desktop/MAD/backend/models/User.js): Represents the user credentials schema. Has a 1-to-many association with both `Habit` and `BehavioralMetric`.
  * [`Habit.js`](file:///c:/Users/aksha/Desktop/MAD/backend/models/Habit.js): Captures habit metadata. Has a 1-to-many association with `HabitLog`.
  * [`HabitLog.js`](file:///c:/Users/aksha/Desktop/MAD/backend/models/HabitLog.js): Logs the occurrences of completed habits. Maps to a parent `Habit` via foreign key `habitId` (using `onDelete: 'CASCADE'`).
  * [`BehavioralMetric.js`](file:///c:/Users/aksha/Desktop/MAD/backend/models/BehavioralMetric.js): Stores user-action data (`eventType`, `elementId`, `value`) for IoB analytics.
* **Database Config**: Set up in [`database.js`](file:///c:/Users/aksha/Desktop/MAD/backend/config/database.js), storing records inside [`database.sqlite`](file:///c:/Users/aksha/Desktop/MAD/backend/database.sqlite).
* **REST Endpoints**: Express routes and controllers handle requests efficiently:
  * **Auth Endpoints** ([`authRoutes.js`](file:///c:/Users/aksha/Desktop/MAD/backend/routes/authRoutes.js) / [`authController.js`](file:///c:/Users/aksha/Desktop/MAD/backend/controllers/authController.js)): Managing `POST /api/auth/register`, `POST /api/auth/login`, and identity verification on `GET /api/auth/me`.
  * **Habits REST Resource** ([`habitRoutes.js`](file:///c:/Users/aksha/Desktop/MAD/backend/routes/habitRoutes.js) / [`habitController.js`](file:///c:/Users/aksha/Desktop/MAD/backend/controllers/habitController.js)): Exposes `GET /api/habits`, `POST /api/habits`, `DELETE /api/habits/:id`, and `POST /api/habits/:id/toggle` to toggle habit completions.
  * **Analytics REST endpoints** ([`analyticsRoutes.js`](file:///c:/Users/aksha/Desktop/MAD/backend/routes/analyticsRoutes.js) / [`analyticsController.js`](file:///c:/Users/aksha/Desktop/MAD/backend/controllers/analyticsController.js)): Exposes telemetry logging via `POST /api/analytics/log` and retrieval via `GET /api/analytics/metrics`.

---

### 3. Application Containerization & CI/CD Pipelines (CO3)
*Outcome Statement: Deploy containerized applications using CI/CD pipelines on cloud platforms.*

HabitAI is fully dockerized and configured for automated continuous integration to ensure deployment readiness.
* **Containerization**:
  * [`backend/Dockerfile`](file:///c:/Users/aksha/Desktop/MAD/backend/Dockerfile): Packages the Node.js API server in a lightweight alpine container.
  * [`frontend/Dockerfile`](file:///c:/Users/aksha/Desktop/MAD/frontend/Dockerfile): Uses a multi-stage Docker build. Stage 1 compiles frontend static assets using Vite, and Stage 2 runs a high-performance **Nginx** server to serve the assets on Port 7000, configuration managed in [`nginx.conf`](file:///c:/Users/aksha/Desktop/MAD/frontend/nginx.conf).
  * [`docker-compose.yml`](file:///c:/Users/aksha/Desktop/MAD/docker-compose.yml): Orchestrates both microservices locally, linking network ports `7000` (frontend Nginx) and `5000` (Express server), while loading development folders dynamically to enable fast changes.
* **CI/CD Workflow**:
  * Configured in [`ci-cd.yml`](file:///c:/Users/aksha/Desktop/MAD/.github/workflows/ci-cd.yml).
  * The GitHub Actions pipeline triggers on every push or pull request to the `main` or `master` branches.
  * Spawns environment runners, installs dependencies, validates compilation integrity, runs test connections for Sequelize SQLite, and verifies container build steps for both backend and frontend Docker configurations.

---

### 4. Mobile Responsiveness & Progressive Web App (PWA) (CO4)
*Outcome Statement: Build basic mobile and progressive web applications using modern tools.*

HabitAI is configured as a fully installable PWA optimized for mobile layouts.
* **Web App Manifest**: Configured in [`manifest.json`](file:///c:/Users/aksha/Desktop/MAD/frontend/public/manifest.json) to declare icons, theme colors, display modes (`standalone`), and start URLs, enabling the app to be installed onto mobile home screens.
* **Service Worker**: Written in [`service-worker.js`](file:///c:/Users/aksha/Desktop/MAD/frontend/public/service-worker.js) and initialized by [`registerServiceWorker.js`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/registerServiceWorker.js). It registers a cache-first offline asset pipeline:
  * Automatically caches critical UI shells (Vite bundles, CSS files, assets).
  * Bypasses API requests (`/api/`) dynamically, allowing seamless backend communications.
  * Serves cached files offline when no internet connection is detected.
* **Touch-Friendly Layouts**: All tracker check-in bubbles, button items, and interactive tab links feature responsive click targets for thumbs and fingers.

---

### 5. Application Security & Emerging Tech Integration - AI / IoB (CO5)
*Outcome Statement: Implement security measures and emerging technologies like AI and IoB in applications.*

Security practices and emerging architectural paradigms are embedded throughout the application:
* **Backend Security**:
  * **Password Encryption**: Implemented in [`authController.js`](file:///c:/Users/aksha/Desktop/MAD/backend/controllers/authController.js) using **bcryptjs** (10 hashing rounds) to secure passwords.
  * **Stateless Authorization**: Utilizing **JSON Web Tokens (JWT)** generated during login and verified through the Express middleware in [`authMiddleware.js`](file:///c:/Users/aksha/Desktop/MAD/backend/middleware/authMiddleware.js).
  * **Headers Defense**: Implements **Helmet** middleware to prevent clickjacking, cross-site scripting (XSS), and custom cors configuration for secure request routing.
* **Internet of Behavior (IoB) Telemetry**:
  * Frontend elements automatically track navigational behaviors via the helper function `logBehavior` inside [`AuthContext.jsx`](file:///c:/Users/aksha/Desktop/MAD/frontend/src/context/AuthContext.jsx).
  * Traces page transitions, clicks (such as clicking specific habits or toggling view settings), and overall user session duration.
* **Rule-Based AI Recommendation Engine**:
  * Implemented in [`getAiAdvice`](file:///c:/Users/aksha/Desktop/MAD/backend/controllers/analyticsController.js#L40-L130).
  * Evaluates user completion percentages (from SQLite `HabitLogs`) and correlates it with click frequencies (from `BehavioralMetrics`).
  * Yields dynamic feedback: alerts users if they are suffering from micro-interaction fatigue (excessive click logs) or suggests moving habit completions to their measured peak hour.

---

## File and Architecture Hierarchy

```
HabitAI/
│
├── .github/workflows/
│   └── ci-cd.yml                       <-- GitHub Actions CI/CD Configuration (CO3)
│
├── backend/
│   ├── config/
│   │   └── database.js                 <-- SQLite ORM Config (CO2)
│   ├── controllers/
│   │   ├── authController.js           <-- Password Hashing & JWT Signing (CO5)
│   │   ├── habitController.js          <-- Habit Logs CRUD (CO2)
│   │   └── analyticsController.js      <-- AI Rule Engine (CO5)
│   ├── models/
│   │   ├── User.js, Habit.js...        <-- Sequelize Schemas (CO2)
│   │   └── index.js                    <-- Relationships Declarations (CO2)
│   ├── routes/
│   │   └── authRoutes.js, etc.         <-- REST Endpoint Routing (CO2)
│   ├── Dockerfile                      <-- Backend Docker Container (CO3)
│   ├── seed.js                         <-- Initial Data Populator
│   └── server.js                       <-- Express Server Setup & Middlewares (CO5)
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json               <-- PWA Manifest Settings (CO4)
│   │   └── service-worker.js           <-- PWA Service Worker (CO4)
│   ├── src/
│   │   ├── components/
│   │   │   ├── HabitTracker.jsx        <-- Main Routine Tracker View (CO1)
│   │   │   ├── ConsistencyAnalytics.jsx<-- SVG Charts & KPI Ring (CO1)
│   │   │   ├── IoBAnalytics.jsx        <-- Behavior Log Viewers (CO1)
│   │   │   ├── AiAdvisor.jsx           <-- Cognitive Recommendations (CO1)
│   │   │   ├── TutorialTour.jsx        <-- Fixed-Wizard Visual Guide (CO1)
│   │   │   └── Auth.jsx                <-- Authentication Screen
│   │   ├── context/
│   │   │   └── AuthContext.jsx         <-- User State & Telemetry Dispatch (CO5)
│   │   ├── App.jsx                     <-- App Shell & View Selector (CO1)
│   │   ├── index.css                   <-- CSS Variables & Keyframes (CO1)
│   │   └── registerServiceWorker.js    <-- Service Worker Activator (CO4)
│   ├── Dockerfile                      <-- Frontend Docker Container (CO3)
│   └── nginx.conf                      <-- Frontend Nginx Serving Config (CO3)
│
└── docker-compose.yml                  <-- Multi-Container Orchestration (CO3)
```

---

## Free Hosting Guide

To host HabitAI online for free with persistent data, follow these steps:

### 1. Split Frontend & Backend (Recommended)
This approach leverages free static web hosts (Vercel or Netlify) and a free backend app host (Render) connected to a free cloud database (Neon or Supabase).

#### Frontend: Vercel or Netlify (100% Free)
1. Push your project folder to your GitHub account.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Select your repository, configure the root directory to `frontend`, and select the **Vite** framework preset.
4. Add the following **Environment Variable**:
   * Name: `VITE_API_URL`
   * Value: `https://your-backend-service-url.onrender.com/api` (Replace with your actual backend URL from Render)
5. Click **Deploy**.

#### Database: Supabase or Neon.tech (100% Free PostgreSQL)
1. Create a free PostgreSQL database instance on [Supabase](https://supabase.com/) or [Neon.tech](https://neon.tech/).
2. Copy the database connection URI string (looks like `postgres://user:password@host/dbname`).

#### Backend: Render.com (100% Free Node Web Service)
1. Sign in to [Render.com](https://render.com/) and select **New** > **Web Service**.
2. Link your GitHub repository.
3. Configure the following:
   * **Root Directory**: `backend`
   * **Runtime**: `Node`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. Under **Environment Variables**, add:
   * `DATABASE_URL`: `[your_postgres_connection_uri_copied_above]`
   * `JWT_SECRET`: `[any_secure_random_string_for_signing_tokens]`
   * `PORT`: `5000`
5. Click **Deploy Web Service**. Once deployed, copy the service URL and update the `VITE_API_URL` environment variable on Vercel.

---
