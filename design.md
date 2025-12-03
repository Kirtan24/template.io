# **Project Design Commentary**

This document explains the complete refactoring performed on the Template Management System backend controller. The goal of the redesign was to improve maintainability, readability, scalability, and consistency by extracting repeated logic into reusable helper functions and making controllers more business-focused rather than technical-heavy.

The following sections walk through each major refactor clearly and with code examples.

---

## **Big Picture**

In the original implementation, the controller file was one large module where every route handled:

* user validation
* ID validation
* file validation
* Cloudinary operations
* DOCX parsing
* MongoDB queries
* field formatting
* error handling

This created **duplicated code**, tightly-coupled logic, long functions, and difficulty in updating business rules.

### **Refactored Approach**

The redesigned controller keeps the same functionality but introduces:

* **small reusable helper functions**
* **centralized validation**
* **cleaner business-flow controllers**
* **consistent error handling**

In short:
**Repeated logic was moved out; controllers now orchestrate instead of doing everything.**

---

# **User Validation Extracted (`validateUser`)**

### **Before**

User validation and fetch were repeated in multiple routes:

```js
const userId = req.user.id;
if (!userId) {
  return res.status(404).json({ status: 'error', message: 'User id not found.' });
}

const user = await userModel.findById(userId);
if (!user) {
  return res.status(404).json({ status: 'error', message: 'User not found.' });
}
```

### **After**

```js
const validateUser = async (userId) => {
  if (!userId) throw new Error("User id not found");

  const user = await userModel.findById(userId);
  if (!user) throw new Error("User not found");

  return user;
};
```

Used in controllers:

```js
const user = await validateUser(req.user.id);
```

### **Why this refactor matters**

* Removes duplicated logic
* Ensures consistent error messages
* Follows **SRP** (Single Responsibility Principle)
* One change updates all routes

---

# **Template Query Logic Extracted (`buildTemplateQuery`)**

### **Before**

Query logic for admin/company/employee was fully embedded inside the controller:

```js
if (userRole === "admin") {
  query = { companyId: null, deleted: { $ne: true } };
} else if (userRole === "company" || userRole === "employee") {
  query = {
    $or: [{ companyId: null }, { companyId }],
    isActive: true,
    deleted: { $ne: true },
  };
} else {
  return res.status(403).json({ message: "Unauthorized user role" });
}
```

### **After**

```js
const buildTemplateQuery = (userRole, companyId) => {
  if (userRole === "admin") {
    return { companyId: null, deleted: { $ne: true } };
  }

  if (userRole === "company" || userRole === "employee") {
    return {
      $or: [{ companyId: null }, { companyId }],
      isActive: true,
      deleted: { $ne: true },
    };
  }

  throw new Error("Unauthorized user role");
};
```

Used in:

```js
const query = buildTemplateQuery(user.role, user.companyId);
```

### **Why this refactor matters**

* Centralizes business rules
* Easy to update access logic in one place
* Controller becomes simple and readable

---

# **Validation Helpers Extracted (ID, File, Filename)**

### **Before**

Inline validation everywhere:

```js
if (!id) return res.status(400).json({ message: "Template ID is required" });
if (!file) return res.status(400).json({ message: "File is required" });
if (!filename) return res.status(400).json({ message: "Filename is required" });
```

### **After**

```js
const validateTemplateId = (id) => {
  if (!id) throw new Error("Template id is required");
};

const validateFile = (file) => {
  if (!file) throw new Error("File is required");
};

const validateFilename = (filename) => {
  if (!filename) throw new Error("Filename is required");
};
```

Used like:

```js
validateTemplateId(req.params.id);
validateFile(req.file);
validateFilename(filename);
```

### **Why this refactor matters**

* Avoids repeated validation blocks
* Enforces consistent error handling
* Makes controllers cleaner

---

# **Cloudinary File Deletion Extracted**

### **Before**

Every controller manually deleted Cloudinary files:

```js
const deleteResult = await deleteCloudFile(oldFilename);
if (deleteResult.result !== "ok") {
  return res.status(500).json({ message: "Failed to delete file" });
}
```

This logic was repeated in:

* `uploadTemplate`
* `deleteTemplate`
* `deleteFileFromCloudinary`

### **After**

```js
const handleOldFileCleanup = async (oldFilename) => {
  if (!oldFilename) return;

  const deleteResult = await deleteCloudFile(oldFilename, {
    resourceType: "raw",
    folder: "templates",
  });

  if (deleteResult.result !== "ok") {
    throw new Error("Failed to delete old file from Cloudinary");
  }
};
```

Used like:

```js
await handleOldFileCleanup(oldFilename);
await deleteFileFromCloudinary(filename);
```

### **Why this refactor matters**

* Avoids repeating deletion logic
* Keeps Cloudinary handling consistent
* Makes controllers readable

---

# **DOCX Variable Extraction Modularized**

### **Before**

DOCX parsing lived entirely inside the controller:

```js
const zip = new PizZip(file.buffer);
const doc = new Docxtemplater(zip);
doc.compile();
const text = doc.getFullText();
...
```

### **After**

```js
const processDocxFile = (buffer) => {
  const zip = new PizZip(buffer);
  const doc = new Docxtemplater(zip);
  doc.compile();
  return extractVariablesFromDocx(doc);
};
```

With:

```js
const extractVariablesFromDocx = (doc) => {
  const text = doc.getFullText();
  const variables = [];
  ...
  return variables;
};
```

Used like:

```js
const uniqueVariables = processDocxFile(file.buffer);
```

### **Why this refactor matters**

* DOCX logic becomes reusable and testable
* Controller only orchestrates; doesn’t perform low-level operations

---

# **Field Formatting Consolidated (`formatFields`)**

### **Before**

Field formatting was repeated in:

* addTemplate
* updateTemplate (update case)
* updateTemplate (create case)

### **After**

```js
const formatFields = (fields) => {
  return fields.map(field => ({
    name: field.name,
    placeholder: field.placeholder,
    inputType: field.inputType,
    isSignature: field.inputType === "file"
      ? field.isSignature || false
      : undefined
  }));
};
```

Used like:

```js
const formattedFields = formatFields(fields);
```

### **Why this refactor matters**

* Removes three identical blocks
* Ensures consistent data structure
* Easy to extend field metadata later

---

# **Template Creation & Update Split Into Two Helpers**

### **Before**

`updateTemplate` contained both:

* update existing template
* create new template

AND repeated field formatting + property assignment.

### **After**

Two helpers created:

```js
const updateExistingTemplate = async (template, data) => {
  template.name = data.name;
  template.fields = formatFields(data.fields);
  template.filename = data.filename;
  template.description = data.description;
  template.emailTemplate = data.emailTemplate;
  template.isSignature = data.isSignature;
  return await template.save();
};
```

```js
const createNewTemplate = async (data) => {
  const template = new templateModel({
    name: data.name,
    filename: data.filename,
    description: data.description,
    isSignature: data.isSignature,
    fields: formatFields(data.fields),
  });
  return await template.save();
};
```

### **Why this refactor matters**

* Removes large repeated code blocks
* Makes update logic easier to maintain
* Cleaner controller

---

# **Deletion Flow Refactor**

### **Before**

Deletion handled everything inline:

* validate ID
* check file exists
* delete file
* mark template deleted

### **After**

Separated into:

```js
const validateTemplateForDeletion = (template) => {
  if (!template) throw new Error("Template not found");
  if (!template.filename) throw new Error("No file associated with this template");
};
```

```js
const markTemplateAsDeleted = async (template) => {
  template.deleted = true;
  template.deletedAt = new Date();
  await template.save();
};
```

Deletion now reads cleanly:

```js
validateTemplateId(id);
const template = await templateModel.findById(id);
validateTemplateForDeletion(template);

await deleteFileFromCloudinary(template.filename);
await markTemplateAsDeleted(template);
```

### **Why this refactor matters**

* Step-by-step flow is easy to understand
* Each step is testable and reusable

---

# **Error Handling Standardized**

### **Before**

Different controllers used different patterns:

```js
return res.status(400).json(...)
return res.status(500).json(...)
console.error(error)
```

Some returned strings, others objects.

### **After**

Helper functions throw errors:

```js
throw new Error("Template not found");
```

Controllers decide response:

```js
const statusCode =
  error.statusCode ||
  (error.message.includes("not found") ? 404 :
   error.message.includes("required") ? 400 : 500);
```

### **Why this refactor matters**

* Consistent error format
* Cleaner controllers
* Easier debugging

---

# **Final Summary**

After refactoring:

* Controllers now contain only **business flow**, not technical details
* Repeated logic is completely eliminated
* Input validation, Cloudinary handling, DOCX parsing, and template formatting are modular
* Code is easier to maintain, extend, and test
* Bug surface is reduced by centralizing logic

### **Before (uploadTemplate) – over 120 lines**

Mixing validation, parsing, uploads, deletions, and DB logic.

### **After (~15 lines)**

```js
validateFile(file);
const user = await validateUser(req.user.id);
await handleOldFileCleanup(oldFilename);
const variables = processDocxFile(file.buffer);
const templateData = createTemplateData(...);
```

The result is a **clean, professional, scalable backend design.**

---
