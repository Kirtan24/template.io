# Class Diagram – Template.io (Template Management System)

This class diagram represents the **object-oriented architecture** of Template.io – a Template Management System that streamlines the creation, management, and distribution of document and email templates. The system is built with **role-based access control, automated document workflows, email scheduling, mass data processing, and digital signatures**.

---

<img width="7572" height="7808" alt="image" src="https://github.com/user-attachments/assets/32f469b0-6b3e-45b5-89d2-0242c7f02124" />

## 1. **User Hierarchy and Roles**

At the core is the abstract **User** class, defining common attributes (`id`, `name`, `email`, `password`, `status`) and behaviors (`login()`, `logout()`, `register()`).
Specialized roles extend from this base class:

* **SystemAdmin**

  * Manages the entire platform.
  * Approves/rejects company registrations.
  * Creates and manages permissions.
  * Monitors overall system activity.

* **CompanyAdmin**

  * Assigned when a company is approved.
  * Creates and manages employees under that company.
  * Can also create additional company admins.
  * Handles company-specific templates and permissions.

* **Employee**

  * Works under a company admin.
  * Creates/manages templates, generates documents, and sends or schedules them.

* **Visitor**

  * Public role before registration.
  * Can view available subscription plans and register a company.

* **DocumentSigner (External User)**

  * Non-registered user role.
  * Only interacts with documents requiring signatures.
  * Uploads and submits e-signatures.

This hierarchy ensures **clear separation of responsibilities and controlled access**.

---

## 2. **Authentication**

* Independent **Authentication** class handles login, password validation, and reset functionality.
* Shared across all roles, ensuring **uniform authentication and session handling**.

---

## 3. **Company and Subscription Model**

* **Company**: Represents an organization using Template.io.

  * Attributes include `name`, `industry`, `address`, `status`, `registrationDate`.
  * Linked to `CompanyAdmin` and `Employee` accounts.

* **Plan**: Defines the subscription (Basic, Professional, Enterprise).

  * Each plan has a `name`, `description`, `billingCycle`, and `permissions`.

* **Permission**: Encapsulates feature rights (e.g., template creation, scheduling, bulk upload).

  * Linked to **Plan** and applied to **Users** dynamically.

This structure enables **multi-tenancy with scalable, subscription-driven access control**.

---

## 4. **Template Management**

Two major template entities exist:

* **EmailTemplate**

  * Defines reusable email structures (`name`, `subject`, `body`).
  * Methods for `createTemplate()`, `updateTemplate()`, `deleteTemplate()`, and `sendPreview()`.

* **DocumentTemplate**

  * Defines reusable document structures (`name`, `description`, `isSignatureWorkflow`, `mappingFields`).
  * Tightly coupled with email templates for sending.
  * Supports workflows like assigning signature fields and dynamic variables.

Both are company-specific and support CRUD operations with **role-based ownership**.

---

## 5. **Document Generation & Mass Data Processing**

* **GenerateDocument**

  * Uses **DocumentTemplate** to produce finalized documents.
  * Supports **two workflows**:

    1. **Manual Data Entry** – Fill form fields to generate a single document.
    2. **Mass Data Processing** – Upload CSV/Excel to auto-generate multiple documents at once.
  * Methods: `generateDocument()`, `sendDocument()`, `scheduleDocument()`.

This enables businesses to **automate bulk document workflows efficiently**.

---

## 6. **Inbox & Email Tracking**

* **Inbox**

  * Stores and tracks all outgoing emails and scheduled communications.
  * Attributes: `email`, `documentId`, `status` (sent, scheduled, opened), `timestamps`.
  * Methods: `sendEmail()`, `trackEmail()`, `resendEmail()`, `scheduleEmail()`.

Provides a **central log for communication and tracking**.

---

## 7. **Signature Workflow**

* **SignDoc**

  * Represents a document requiring digital signatures.
  * Attributes: `documentId`, `signerId`, `status`, `signature`, `timestamps`.
  * Methods: `requestSignature()`, `validateSignature()`, `notifyCompletion()`.

* **DocumentSigner**

  * External participant.
  * Uploads their e-signature and submits signed documents.

This ensures **secure and legally valid digital approvals**.

---

## 8. **Associations & Multiplicities**

* **Company → Plan**: A company subscribes to one plan; a plan can serve many companies.
* **Plan → Permission**: Each plan defines multiple permissions.
* **Company → User**: A company has multiple admins and employees.
* **Company → Template**: A company manages many email/document templates.
* **Template → GenerateDocument**: One template can generate multiple documents.
* **GenerateDocument → Inbox**: Each generated document corresponds to email records in inbox.
* **GenerateDocument → SignDoc → DocumentSigner**: Enables e-signature workflow.

These relationships ensure **data integrity and structured workflow across the system**.

Do you want me to now **write a polished Markdown README section** (with diagram + explanation flow) so you can paste it directly into GitHub?
