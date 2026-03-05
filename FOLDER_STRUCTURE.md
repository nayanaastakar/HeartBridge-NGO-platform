# HeartBridge NGO Platform - Folder Structure Guide

This guide explains the purpose of every major folder and file in the project.

---

## 🏗️ Root Directory
*   `backend/`: The server-side code (Node.js/Express/MongoDB).
*   `frontend/`: The user interface code (Angular).
*   `PROJECT_REPORT.md`: Comprehensive project documentation.
*   `EXPLANATION.md`: A high-level guide to project roles and features.
*   `FOLDER_STRUCTURE.md`: This file, explaining the technical organization.
*   `start-servers.bat`: A shortcut to run both backend and frontend at once.

---

## 🛡️ Backend Folder (`/backend`)
We use a **Model-View-Controller (MVC)** inspired architecture to keep the code organized.

*   `server.js`: The entry point. It sets up the database connection and middle-wares.
*   `models/`: **Schemas**. Defines the structure of data in MongoDB (e.g., `User.js`, `NGO.js`).
*   `routes/`: **Endpoints**. Defines the URL paths like `/login` or `/donate`.
*   `controllers/`: **Logics**. Contains the actual functions that run when a route is hit.
*   `services/`: **Helpers**. Reusable functions for database operations.
*   `middleware/`: **Security**. Functions that run before a request is processed (e.g., checking if a user is logged in).
*   `uploads/`: **Storage**. Where profile pictures and NGO certificates are saved.
*   `utils/`: **Utilities**. Small helper functions like JWT token generation.

---

## 🎨 Frontend Folder (`/frontend/src/app`)
Built with **Angular**, divided into modular components and services.

*   `components/`: Reusable UI elements (e.g., `navbar`, `login`, `ngo-dashboard`).
*   `services/`: Communication layer. Methods to fetch and send data to the Backend API.
*   `guards/`: Route security. Prevents normal users from accessing the Admin dashboard.
*   `app-routing.module.ts`: Navigation map. Configures which component shows for which URL.
*   `app.module.ts`: Main configuration. Declares all components and imports necessary Angular modules.
*   `styles.scss`: Global styling. Uses modern CSS techniques for a premium look.

---

## 🗣️ Why this structure?
1.  **Modularity**: Each feature (like login or NGO management) is in its own file.
2.  **Scalability**: We can easily add new features without breaking old ones.
3.  **Security**: Private backend logic is completely separate from the public frontend.
4.  **Maintenance**: It's easy for the team to find and fix bugs because everything has a dedicated place.
