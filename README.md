# Template.io – Template Management System (TMS)

This repository contains the source code for Template.io, a Template Management System designed to centralize and automate the handling of document templates, email templates, document generation, e-signature workflows, user management, permissions, scheduling, and email tracking. The project includes both backend and frontend layers, with RESTful APIs developed using Node.js and Express.

This README file contains the setup instructions, project structure, run instructions, and complete API endpoint descriptions as required.

---

# 1. Clone the Repository

```
git clone <your-github-repository-link>
cd template-io
```

---

# 2. Setup Instructions

## 2.1 Requirements

Ensure the following are installed:

* Node.js version 18 or higher
* npm or yarn
* MongoDB (local or cloud database)
* Git installed on your system

---

## 2.2 Backend Setup

```
cd backend
npm install
```

Create an `.env` file inside the backend directory:

```
PORT=5000
MONGO_URI=<your-mongo-connection-string>
JWT_SECRET=<your-secret-key>
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

Start the backend server:

```
npm run dev
```

---

## 2.3 Frontend Setup

```
cd frontend
npm install
```

Create `.env` file:

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

Start frontend:

```
npm start
```

---

# 3. Project Structure

```
template-io/
│
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── config/
│   │   ├── models/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── sockets/
│   │   └── workers/
│
└── frontend/
    ├── src/
    │   ├── assets/
    │   ├── components/
    │   ├── services/
    │   ├── utilis/
    ├── public/
    └── package.json
```

---

# 4. How to Run the Project

1. Start MongoDB (local or remote connection).
2. Start the backend using:

```
npm run dev
```

3. Start the frontend using:

```
npm start
```

4. Open the frontend in your browser (default: [http://localhost:3000](http://localhost:3000)).

---

# 5. API Endpoint Descriptions

(Based directly on the backend routes you provided)

Below is a structured description of all available API groups.

---

## 5.1 Authentication Routes (`/api/auth`)

| Method | Endpoint         | Description                            |
| ------ | ---------------- | -------------------------------------- |
| POST   | /register        | Register a new user (System-side only) |
| POST   | /login           | Login and receive JWT token            |
| POST   | /logout          | Logout using token (protected)         |
| POST   | /forgot-password | Request password reset link            |
| POST   | /reset-password  | Reset password using token             |
| GET    | /validate-token  | Validate login token                   |

---

## 5.2 User Routes (`/api/user`)

| Method | Endpoint         | Description          |
| ------ | ---------------- | -------------------- |
| GET    | /                | Get all users        |
| POST   | /                | Create new user      |
| DELETE | /:id             | Delete user          |
| POST   | /profile         | Get user profile     |
| POST   | /update-profile  | Update profile       |
| POST   | /update-password | Change password      |
| GET    | /dashboard/stats | Dashboard statistics |

---

## 5.3 Utility Routes (`/api/util`)

| Method | Endpoint         | Description            |
| ------ | ---------------- | ---------------------- |
| GET    | /models          | Get all DB models      |
| POST   | /backup          | Backup database        |
| POST   | /restore         | Restore database       |
| GET    | /sleep/:time     | Delay response         |
| GET    | /server-info     | Server details         |
| GET    | /generate-uuid   | Generate UUID          |
| POST   | /hash-data       | Hash data              |
| GET    | /generate-random | Generate random number |
| DELETE | /clear-logs      | Clear server logs      |

---

## 5.4 Plans Routes (`/api/plans`)

| Method | Endpoint | Description                |
| ------ | -------- | -------------------------- |
| GET    | /        | Get all plans              |
| GET    | /:id     | Get plan by ID (protected) |
| POST   | /        | Update plan (protected)    |

---

## 5.5 Inbox Routes (`/api/inbox`)

| Method | Endpoint          | Description                   |
| ------ | ----------------- | ----------------------------- |
| GET    | /                 | Get all sent/scheduled emails |
| GET    | /:id              | Get single mail               |
| DELETE | /:id              | Delete mail                   |
| POST   | /send             | Send an email                 |
| POST   | /scheduleMail     | Schedule an email             |
| POST   | /upload-signature | Upload signer’s signature     |
| POST   | /verify-token     | Verify mail token             |

---

## 5.6 General Routes (`/api/general`)

| Method | Endpoint  | Description        |
| ------ | --------- | ------------------ |
| GET    | /load     | Loading test route |
| GET    | /jobs/:id | Get job status     |

---

## 5.7 Company Routes (`/api/companies`)

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| GET    | /                   | Get all companies      |
| GET    | /count              | Get inactive companies |
| GET    | /:id                | Get company by ID      |
| DELETE | /:id                | Delete company         |
| GET    | /employees/:id      | Get company employees  |
| GET    | /profile/:id        | Company profile        |
| PATCH  | /approve/:companyId | Approve company        |
| PATCH  | /reject/:companyId  | Reject company         |

---

## 5.8 Template Routes (`/api/templates`)

| Method | Endpoint                 | Description                          |
| ------ | ------------------------ | ------------------------------------ |
| POST   | /                        | Get all templates                    |
| GET    | /:id                     | Get template by ID                   |
| POST   | /upload                  | Upload DOCX template                 |
| POST   | /finalsave               | Save template after variable mapping |
| PUT    | /:id                     | Update template                      |
| PATCH  | /:id                     | Update template status               |
| DELETE | /:id                     | Delete template                      |
| DELETE | /cancelProcess/:filename | Delete file from Cloudinary          |
| POST   | /generate-docx           | Generate a document                  |
| POST   | /bulk-generate           | Generate multiple documents          |

---

## 5.9 Credentials Routes (`/api/credentials`)

| Method | Endpoint     | Description                |
| ------ | ------------ | -------------------------- |
| GET    | /            | Get all credentials        |
| GET    | /deleted     | Get deleted credentials    |
| GET    | /:id         | Get credential by ID       |
| POST   | /            | Add credential             |
| PUT    | /:id         | Update credential          |
| DELETE | /:id         | Delete credential          |
| PUT    | /restore/:id | Restore deleted credential |

---

## 5.10 Permission Routes (`/api/permissions`)

| Method | Endpoint     | Description                      |
| ------ | ------------ | -------------------------------- |
| GET    | /            | Get all permissions              |
| GET    | /:id         | Get permission by ID             |
| GET    | /company/:id | Get company permissions          |
| GET    | /user/:id    | Get user permissions             |
| PUT    | /:id         | Update permissions               |
| POST   | /all         | Create or update all permissions |

---

## 5.11 Email Template Routes (`/api/email-template`)

| Method | Endpoint | Description              |
| ------ | -------- | ------------------------ |
| GET    | /        | Get all email templates  |
| GET    | /:id     | Get email template by ID |
| POST   | /        | Add email template       |
| PUT    | /:id     | Update email template    |
| DELETE | /:id     | Delete email template    |

---

# 6. Notes

* All protected routes require a valid JWT token in the `Authorization: Bearer <token>` header.
* All file uploads (DOCX templates, signatures) use Multer middleware.
* The backend runs on the defined `PORT`, default: **5000**.
