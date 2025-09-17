# 🧾 Template.io – Template Management System

**Template.io** is a centralized Template Management System that streamlines the creation, management, and distribution of email and document templates with support for e-signatures, scheduling, and dynamic content.

---

## ⚙️ Features

- Role-based access: System Admin, Company Admin, Employee, Signer
- Document & Email template management
- Dynamic fields with docx templates
- Bulk document generation via Excel/CSV
- E-signature workflows
- Email scheduling and inbox tracking

---

## 👤 User Roles

| Role          | Permissions Summary                                       |
| ------------- | --------------------------------------------------------- |
| System Admin  | Full system control (companies, permissions, users, etc.) |
| Company Admin | Manages company templates, users, permissions             |
| Employee      | Uses features based on permissions                        |
| Signer        | Signs documents via secure email link                     |
| Site Visitor  | Registers company request via homepage                    |

---

## 📦 Tech Stack

- **Frontend**: React / Vue / Angular (choose based on your stack)
- **Backend**: Node.js (Express) / Django / Laravel
- **Database**: PostgreSQL / MongoDB / MySQL
- **Storage**: Cloudinary for template files

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18.x
- npm / yarn
- MongoDB / PostgreSQL
- Git

### Installation

```bash
# Clone repo
git clone https://github.com/your-org/template-io.git
cd template-io

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```
