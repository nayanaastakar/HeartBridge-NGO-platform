# HeartBridge NGO Platform - Comprehensive Project Guide

Welcome to the HeartBridge Project! This guide will help you understand every corner of the platform for your demo and exam.

---

## 1. Project Overview
**What is HeartBridge?**  
HeartBridge is a digital bridge between NGOs and Donors. It solves two main problems:
1.  **Trust**: We provide a verification system for NGOs.
2.  **Transparency**: Donors can see "Impact Stories" and how their money is used.

---

## 2. Who uses the platform? (The 3 Roles)

### 👤 1. The Donor (Public User)
*   **Goal**: Find a cause and donate.
*   **Capabilities**: Browse NGOs by category (e.g., Old Age Homes, Education), search for specific NGOs, view their verified profiles, read impact stories, and make donations.

### 🏢 2. The NGO Admin
*   **Goal**: Raise funds and showcase their work.
*   **Capabilities**:
    *   **Verification Journey**: Upload legal proof (like 12A/80G certificates).
    *   **Manage Profile**: Update their logo, address, and mission.
    *   **Quick Actions**: Create "Wishes" (specific items they need), "Emergency Funds", and "Impact Stories".
    *   **Dashboard**: Track total donations and active campaigns.

### 🛡️ 3. The System Admin (Superuser)
*   **Goal**: Maintain the security and quality of the platform.
*   **Capabilities**:
    *   **Verification Review**: Review uploaded documents from NGOs and verify them with one click.
    *   **User Management**: Can edit or delete any user or NGO in the system.
    *   **Global Analytics**: View project-wide statistics on donations and growth.

---

## 3. Key Feature Deep-Dive

### ✅ The Verification Workflow (Very Important for Demo!)
*   **Step 1 (NGO)**: The NGO logs in to their dashboard and clicks "Upload Now" to submit their Registration Certificate (which is stored locally on our server).
*   **Step 2 (System Admin)**: The Admin reviews the document in a professional "Review Dialog".
*   **Step 3 (The Toggle)**: If satisfied, the Admin clicks "Verify NGO Now". This flips the `isVerified` flag in the database, and the NGO now gets a "Verified" badge across the platform.

### 📊 The Dual-Dashboard System
*   The platform has **two unique dashboards** built using Angular:
    1.  **Admin Dashboard**: Shows system-wide health and user lists.
    2.  **NGO Dashboard**: Shows specific stats for that organization and their "Verification Journey" progress bar.

### 🏗️ File Management
*   We use a middleware called **Multer** to handle file uploads.
*   Instead of using external links, files are saved in `backend/uploads/`.
*   We serve these files "statically," meaning they are accessed via a direct URL on our server.

---

## 4. Technical Architecture (The Stack)

*   **Frontend**: **Angular 15+** with **Angular Material** for a premium design.
*   **Backend**: **Node.js** & **Express.js**.
*   **Database**: **NoSQL (MongoDB)** for flexible data (like varying NGO profiles).
*   **Authentication**: **JWT (JSON Web Tokens)** for secure, encrypted logins.

---

## 5. Potential Exam Questions & Answers

**Q: Why did you use NoSQL (MongoDB) instead of SQL?**  
*A: "Donation and NGO data can often change or have unique fields. MongoDB allows us to handle this 'Unstructured Data' more efficiently than a traditional table-based database."*

**Q: How do you handle security for logins?**  
*A: "We use JWT (JSON Web Tokens). When a user logs in, the server gives them an encrypted token. The frontend sends this token with every request to prove who the user is without sending their password every time."*

**Q: How is the 'Verification Status' updated in real-time?**  
*A: "When the Admin clicks 'Verify', we send a PUT request to our API. The frontend then refreshes the NGO list using Angular’s data binding, instantly showing the new status."*

**Q: What is the most innovative part of the platform?**  
*A: "The Transparency Hub. By allowing NGOs to post 'Impact Stories' with before-and-after photos, we build a level of donor trust that traditional platforms lack."*

---

## 6. How to Run the Demo Successfully
1.  **System Admin Login**: `admin@heartbridge.com` / `admin123`
2.  **NGO Admin Login**: `ngo16@heartbridge.com` / `password123`
3.  **Local Proof Documents**: I have created local professional certificates (HTML format) inside `backend/uploads/proof-documents/` (`certificate.html` and `tax_80g.html`).
4.  **Sample Files for Upload**: If you want to test the manual upload feature in the NGO Dashboard, you can use any small PDF or image file. I have also pre-linked the HTML certificates to NGO accounts to ensure the "Review Docs" feature works perfectly out of the box.

---

**Good luck with your demo! You've got this!**
