# **Project Design Commentary**

This document explains how the Template Management System backend was redesigned to be cleaner, modular, and easier to maintain. Examples from the **original code** and the **refactored code** have been included to make the improvements clear and practical.

---

## **1. Overall Improvement in Software Design**

The original controller was a single large file where each route handler contained:

* validation logic
* Cloudinary operations
* database logic
* field formatting
* DOCX processing
* repeated conditions
* error handling

This made the file long, repetitive, and hard to maintain.

The redesign focused on extracting repeated logic into **small, reusable helper functions**, reducing controller size, and enforcing consistent behavior.

**Example of improvement:**
Originally, every controller manually repeated:

```js
if (!req.user.id) {
  return res.status(404).json({ message: "User id not found" });
}

const user = await userModel.findById(req.user.id);
if (!user) {
  return res.status(404).json({ message: "User not found" });
}
```

In the refactored version:

```js
const user = await validateUser(req.user.id);
```

All user-related validation is now centralised, improving consistency and readability.

---

## **2. Design Principles Applied**

### **Single Responsibility Principle (SRP)**

Every function now has only one job.

**Example:**
Original upload controller did *everything*:

* delete old file
* upload new file
* read DOCX
* extract variables
* validate user
* build payload

Refactored version splits this:

```js
validateFile(file);
await handleOldFileCleanup(oldFilename);
const uniqueVariables = processDocxFile(file.buffer);
const templateData = createTemplateData(...);
```

Each function handles one step → cleaner flow, easier debugging.

---

### **DRY (Don’t Repeat Yourself)**

Repeated logic was removed.

**Example:**
Field formatting was repeated 3 times (upload, update, add):

```js
const formattedFields = fields.map(field => ({
  name: field.name,
  placeholder: field.placeholder,
  inputType: field.inputType,
  isSignature: field.inputType === "file" ? field.isSignature || false : undefined
}));
```

Refactored:

```js
const formattedFields = formatFields(fields);
```

Now only one function maintains this logic.

---

### **Separation of Concerns**

Cloudinary operations, validation, DOCX processing, and database logic are **moved out of controllers**.

**Example:**
Instead of deleting Cloudinary files inside the controller:

```js
const deleteResult = await deleteCloudFile(filename)
```

Now:

```js
await deleteFileFromCloudinary(filename);
```

This makes controllers pure business logic.

---

## **3. Key Refactoring Done**

### **3.1 Extracted User Validation**

**Before:**

```js
if (!userId) return res.status(404).json(...);
const user = await userModel.findById(userId);
if (!user) return res.status(404).json(...);
```

**After:**

```js
const user = await validateUser(req.user.id);
```

→ Every controller now has consistent user validation.

---

### **3.2 Extracted Template Query Logic**

**Before (duplicated logic):**

```js
if (userRole === "admin") {
  query = { companyId: null, deleted: { $ne: true } };
}
if (userRole === "company") {
  query = { $or: [...], deleted: { $ne: true } };
}
```

**After:**

```js
const query = buildTemplateQuery(user.role, user.companyId);
```

→ Easy to modify business rules later.

---

### **3.3 Encapsulated File Validation**

**Before:**

```js
if (!file) return res.status(400).json({ message: "File is required" });
```

**After:**

```js
validateFile(file);
```

→ Reusable across all upload endpoints.

---

### **3.4 Cleaned Cloudinary File Deletion**

**Before:**

```js
const deleteResult = await deleteCloudFile(oldFilename);
if (deleteResult.result !== "ok") { ... }
```

**After:**

```js
await handleOldFileCleanup(oldFilename);
```

→ Centralised error handling and logging.

---

### **3.5 Simplified DOCX Variable Extraction**

**Before (inside controller):**

```js
const zip = new PizZip(file.buffer);
const doc = new Docxtemplater(zip);
doc.compile();
const text = doc.getFullText();
```

**After:**

```js
const variables = processDocxFile(file.buffer);
```

→ Controller no longer handles technical parsing details.

---

### **3.6 Cleaned New Template Creation Logic**

**Before:**

```js
template = new templateModel({
  name,
  filename,
  description,
  isSignature,
  fields: formattedFields
});
await template.save();
```

**After:**

```js
template = await createNewTemplate(req.body);
```

→ Standardised template creation for future extensibility.

---

### **3.7 Standardised Error Handling**

Original code had different styles everywhere:

```js
return res.status(500).json({ message: "Server Error" });
return res.status(400).json({ message: "Invalid tag" });
return res.status(404).json({ message: "Not found" });
```

Refactored:

* helper functions throw errors
* controllers map them to consistent status codes

Example:

```js
throw new Error("Template not found");
```

Controller:

```js
const statusCode = error.message.includes("not found")
  ? 404
  : 500
```

---

## **4. Final Result**

After refactoring:

* Controllers became **short, readable, business-focused**
* Repeated logic was moved into **shared helper functions**
* Validation, file handling, query building, and DOCX parsing became **modular**
* The system is now **cleaner, scalable, and easier to maintain**

Example comparison:

### **Before (uploadTemplate portion):**

> 120+ lines mixed with validation, deletion, parsing, error handling, DB logic, response building.

### **After:**

```js
validateFile(file);
const user = await validateUser(req.user.id);
await handleOldFileCleanup(oldFilename);
const variables = processDocxFile(file.buffer);
const templateData = createTemplateData(...);
```

→ Actual controller logic reduced to ~15 lines.
