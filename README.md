# Excel Analytics Platform (MERN)

A full-stack Excel analytics web app built with the MERN stack.  
Users can upload Excel spreadsheets, explore the parsed data, and build interactive charts.  
Admins get an overview of usage and can manage users and uploaded files.

---

## ✨ Features

## 📑 Table of Contents

- [Features](#-features)
  - [User Features](#-user-features)
    - [Authentication](#authentication)
    - [Excel Upload & Parsing](#excel-upload--parsing)
    - [History & Dataset Management](#history--dataset-management)
    - [Chart Builder](#chart-builder)
    - [Export to PDF](#export-to-pdf)
  - [Admin Features](#-admin-features)
  - [Tech Stack](#-tech-stack)
  - [Project Structure](#-project-structure)
  - [Environment Variables](#environment-variables)
    - [Backend env](#backend-backendenv)
    - [Frontend env](#frontend-frontendenv)
  - [Getting Started](#-getting-started)
    - [Backend Setup](#backend-setup)
    - [Frontend Setup](#frontend-setup)
- [API Overview](#api-overview)
- [License](#license)



### 👤 User Features

- **Authentication**
  - User registration and login with JWT-based authentication.
  - Passwords hashed using `bcryptjs`.

- **Excel Upload & Parsing**
  - Upload `.xls` / `.xlsx` files via a simple UI.
  - Files are stored on the server using `multer`.
  - Data is parsed with the `xlsx` library and stored as JSON in MongoDB.

- **History & Dataset Management**
  - View a list of your previously uploaded files.
  - Select any upload from history to reload its data into the chart builder.
  - Delete individual uploads (file + database entry).

- **Chart Builder**
  - Select any uploaded dataset and interactively:
    - Choose **X** and **Y** columns.
    - Switch between chart types (e.g. scatter, bar, line, pie).
    - Automatically filters out invalid / empty values for cleaner charts.
  - Charts rendered using **Plotly** (`react-plotly.js` + `plotly.js-dist`).

- **Export to PDF**
  - Export the current Plotly chart as a **PDF** using `jsPDF`.
  - High resolution export (1200×800) for reports or presentations.

---

### 🛠 Admin Features

* **Admin Dashboard**

  * View **all uploads** across all users with:

    * File name
    * User name & email
    * Upload timestamp
  * View **high-level statistics**:

    * Total uploads
    * Total users (computed from the data)
    * Upload counts grouped by user

* **User & Upload Management**

  * Delete specific uploads from the admin dashboard.
  * Dedicated backend helper methods:

    * Cascade delete uploads when a user is deleted.
    * Delete associated files from disk (`/uploads` directory).
  * Protected routes via `auth` + `admin` middleware.

---

### 🔑 Admin Demo Credentials

To explore the **Admin Dashboard**, use the demo credentials below:

**Email:** [admin@gmail.com](mailto:admin@gmail.com)
**Password:** admin@123

> ⚠️ Note: This is a demo admin account provided for reviewers to explore the admin functionality.
> In production environments, admin accounts are created directly in the database with secure hashed passwords.


- **User & Upload Management**
  - Delete specific uploads from the admin dashboard.
  - Dedicated backend helper methods:
    - Cascade delete uploads when a user is deleted.
    - Delete associated files from disk (`/uploads` directory).
  - Protected routes via `auth` + `admin` middleware.

---

## 🧱 Tech Stack

### Frontend

- **React** (Vite)
- **React Router DOM**
- **Axios** (API client with JWT interceptor)
- **Plotly** (`react-plotly.js`, `plotly.js-dist`)
- **jsPDF** (chart → PDF export)
- Custom CSS in `src/Stylesheets`

### Backend

- **Node.js** + **Express**
- **MongoDB** + **Mongoose**
- **Multer** (file uploads)
- **xlsx** (Excel parsing)
- **bcryptjs** (password hashing)
- **jsonwebtoken** (authentication)
- **CORS**, **dotenv**

---

## 📁 Project Structure

```text
excel-analytics-platform/
├── backend/
│   ├── .env                 # Backend environment variables (local)
│   ├── server.js            # Express app entry point
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js          # JWT auth middleware
│   │   └── admin.js         # Admin role check
│   ├── models/
│   │   ├── Upload.js        # Upload schema + cascading delete helpers
│   │   └── User.js          # User schema + cascading delete helpers
│   ├── routes/
│   │   ├── auth.js          # /api/auth (login/register)
│   │   ├── uploads.js       # /api/uploads (upload/history/delete)
│   │   └── admin.js         # /api/admin (admin uploads/users)
│   └── uploads/             # Uploaded Excel files (runtime)
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx         # React entry
    │   ├── App.jsx          # Routing + layout + navbar
    │   ├── api/
    │   │   ├── api.js       # Axios instance + common API helpers
    │   │   └── admin.js     # (optional admin helpers, currently unused)
    │   ├── components/
    │   │   ├── UploadPanel.jsx   # Excel upload UI
    │   │   └── ChartBuilder.jsx  # Plotly chart builder + PDF export
    │   ├── pages/
    │   │   ├── LandingPage.jsx   # Marketing / landing page
    │   │   ├── Login.jsx         # Login form
    │   │   ├── Register.jsx      # Registration form
    │   │   ├── Dashboard.jsx     # User dashboard (upload + history + charts)
    │   │   └── AdminDashboard.jsx# Admin analytics and management
    │   ├── Stylesheets/          # Scoped CSS files
    │   │   ├── App.css
    │   │   ├── Dashboard.css
    │   │   ├── admindashboard.css
    │   │   ├── landing.css
    │   │   └── Login_Register.css
    │   └── assets/
    │       └── react.svg
    └── README.md (frontend-specific, optional)
```

---

## ⚙️ Environment Variables <a id="environment-variables"></a>

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/excel_analytics
JWT_SECRET=replace_with_strong_secret
```

### Frontend (`frontend/.env` — optional)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
npm install
node server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## API Overview

| Method | Route | Description |
|--------|--------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login and receive token |
| POST | /uploads/upload | Upload Excel file |
| GET | /uploads/history | Fetch previous uploads |
| DELETE | /uploads/:id | Delete uploaded file |
| GET | /admin/uploads | Admin — fetch all uploads |
| GET | /admin/users | Admin — get all users |
| DELETE | /admin/users/:id | Admin — delete user & files |

---

## License

Open for use — modify freely.
