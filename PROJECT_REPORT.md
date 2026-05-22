# Project Report: HabitAI - Smart Habit & Behavioral Analytics Web App

## 1. Full Stack Application Mini Project

---

### i. Problem Statement

Many individuals struggle to form and maintain long-term productive habits. While traditional habit trackers allow users to log their progress manually, they operate passively. They fail to understand **user behavior patterns** (interaction timings, click behavior, visual engagements) and do not provide customized, proactive, and analytical feedback. 

**HabitAI** addresses this problem by combining routine logging with **Internet of Behavior (IoB)** tracking. The application logs user interaction events (such as button clicks, page transitions, and session duration) and feeds them, along with habit compliance records, into an **AI Recommendation Engine**. This engine analyzes the data to output behavioral feedback, suggesting actionable adjustments (e.g., advising a user to change their habit check-in times or reduce micro-interactions to mitigate cognitive fatigue).

---

### ii. Frontend Implementation

The frontend is a single-page application (SPA) built using **React** with the **Vite** bundler for high-speed builds and runs on **Port 7000**.

#### Key Features:
- **Responsive Framework (CO1)**: Built with React, featuring layout divisions that adjust fluidly from mobile views to widescreen monitors.
- **Harmonious Theme & Glassmorphism**: Utilizes high-contrast dark space backgrounds (`#09090e`) paired with custom HSL-based gradient variables, glowing accent shadows, and semi-transparent glass cards (`backdrop-filter: blur(12px)`) for a premium visual aesthetic.
- **Progressive Web App (PWA) (CO4)**: Includes a Web Manifest (`manifest.json`) and a Cache-First Service Worker (`service-worker.js`). These allow users to install the app on mobile or desktop devices and navigate the client offline using local cached resources.
- **Component Breakdown**:
  - `Auth.jsx`: Responsive login and signup screens containing secure validation rules.
  - `HabitTracker.jsx`: Interfaces a 7-day visual check-in grid. Users check off completions in a bubble calendar and track consecutive streaks.
  - `IoBAnalytics.jsx`: Integrates custom interactive bar charts summarizing user click-streams and screen views.
  - `AiAdvisor.jsx`: Queries and renders recommendations from the AI behavioral analysis engine.

---

### iii. Backend Development

The backend is built with **Node.js** and **Express.js**, running a secure, RESTful JSON API structure on **Port 5000**.

#### Key Features:
- **Security & Integrity (CO5)**:
  - Password hashing with **bcryptjs** (10 salt rounds) during registration.
  - Stateless authentication using **JSON Web Tokens (JWT)** generated upon sign-in.
  - Express middleware security headers via **helmet** and cross-origin controls using **cors** matching the custom Port 7000.
- **AI Recommendation Engine (CO5)**:
  - Implements a rule-based engine that processes user completion logs and IoB event lists.
  - Computes compliance rate percentages and interaction levels (High/Moderate/Low).
  - Generates personalized recommendations based on streak thresholds and interface fatigue data.
- **API Endpoints**:
  - `POST /api/auth/register` & `/api/auth/login`: Public auth routes.
  - `GET /api/auth/me`: Secure token identity check.
  - `GET /api/habits` & `POST /api/habits`: Secure habit management.
  - `DELETE /api/habits/:id` & `POST /api/habits/:id/toggle`: Habit modification.
  - `POST /api/analytics/log`: Metric logging (open/anonymous access).
  - `GET /api/analytics/metrics` & `GET /api/analytics/ai-advice`: Secure behavioral reporting.

---

### iv. Database Integration

The application utilizes **SQLite** as its lightweight, relational database, connected through the **Sequelize ORM** (CO2).

#### Database Relationships:
- **Users Table**: Stores unique usernames, verified emails, and hashed passwords.
  - Has a **One-to-Many** relationship with the **Habits** table.
  - Has a **One-to-Many** relationship with the **BehavioralMetrics** table.
- **Habits Table**: Stores habit metadata (title, category, frequency).
  - Has a **One-to-Many** relationship with the **HabitLogs** table (cascading deletes enabled).
- **HabitLogs Table**: Stores individual daily completion timestamps linked to a habit.
- **BehavioralMetrics Table (IoB)**: Stores telemetry event details (`eventType`, `elementId`, optional duration or description value).

#### Schema Diagram:
```
  [User] 1 ---- * [Habit] 1 ---- * [HabitLog]
     1
     |
     *
  [BehavioralMetric] (IoB Tracker)
```

---

### v. Deployment & Output

The project includes configurations for deployment on cloud platforms using containerization and automated verification.

#### Containerization (CO3):
- **Backend Dockerfile**: A lightweight Node-alpine container running the Express server.
- **Frontend Dockerfile & Nginx Config**: A multi-stage build. The React code compiles with Node, and Nginx serves the static dist files on Port 7000.
- **docker-compose.yml**: Orchestrates the frontend and backend containers, maps ports `7000:7000` and `5000:5000`, and passes environment variables.

#### CI/CD Pipeline (CO3):
- **GitHub Actions Workflow** (`ci-cd.yml`):
  - Triggers on push or pull requests to main branches.
  - Spins up virtual environments, sets up Node, installs dependencies, and compiles the React application.
  - Validates Sequelize configurations and runs Docker build checks for both frontend and backend Dockerfiles.

---

## Course Outcomes (CO) Matrix

| Course Outcome | Description | HabitAI Project Evidence |
|---|---|---|
| **CO1** | Apply modern front-end development frameworks to build responsive web applications. | Built a React SPA using Vite, CSS variables, and fluid, responsive layout components. |
| **CO2** | Develop robust RESTful APIs and integrate with databases for backend solutions. | Built Node/Express REST API endpoints integrated with SQLite via Sequelize ORM. |
| **CO3** | Deploy containerized applications using CI/CD pipelines on cloud platforms. | Configured `Dockerfile`, `docker-compose.yml`, and a `.github/workflows/ci-cd.yml` GitHub Actions pipeline. |
| **CO4** | Build basic mobile and progressive web applications using modern tools. | Implemented PWA `manifest.json`, local caching `service-worker.js`, and responsive mobile scaling. |
| **CO5** | Implement security measures and emerging technologies like AI and IoB in applications. | Secured with JWT and bcrypt. Tracked interaction metrics (IoB) and integrated a rule-based AI Advisor. |

---

## Conclusion

This assignment demonstrated the implementation of a full-stack, secure, and containerized web application. By integrating:
1. A responsive **React** frontend on Port 7000,
2. An **Express/Node** backend on Port 5000,
3. An **SQLite** database via Sequelize ORM,
4. **JWT-based** authentication and security practices,
5. **Progressive Web App (PWA)** capabilities, and
6. **AI/IoB** behavioral telemetry tracking,

we successfully created a solution that meets modern software engineering standards and achieves all Course Outcomes.
