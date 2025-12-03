const express = require("express");
const request = require("supertest");
const emailtemplateRouter = require("../../src/routes/emailtemplate.route");
const EmailTemplate = require("../../src/models/emailtemplate.model");
const User = require("../../src/models/user.model");
const Template = require("../../src/models/template.model");

describe("Email Template routes - integration tests", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: "507f1f77bcf86cd799439011" };
      next();
    });
    app.use("/api/email-template", emailtemplateRouter);
  });

  afterEach(() => jest.restoreAllMocks());

  describe("GET /api/email-template", () => {
    test("returns 200 with templates list for admin", async () => {
      const fakeUser = {
        _id: "507f1f77bcf86cd799439011",
        role: "admin",
        companyId: null,
      };

      const fakeTemplates = [
        {
          _id: "1",
          template_name: "Welcome",
          subject: "Welcome!",
          body: "<p>Welcome</p>",
        },
        {
          _id: "2",
          template_name: "Reset",
          subject: "Reset Password",
          body: "<p>Reset</p>",
        },
      ];

      jest.spyOn(User, "findById").mockResolvedValue(fakeUser);
      jest.spyOn(EmailTemplate, "find").mockImplementation(() => ({
        populate: () => ({
          select: () => Promise.resolve(fakeTemplates),
        }),
      }));

      const res = await request(app).get("/api/email-template");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
    });

    test("returns 404 when user not found", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);

      const res = await request(app).get("/api/email-template");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("status", "error");
    });
  });

  describe("GET /api/email-template/:id", () => {
    test("returns 200 with template details", async () => {
      const fakeTemplate = {
        _id: "507f1f77bcf86cd799439011",
        template_name: "Welcome",
        subject: "Welcome!",
        body: "<p>Welcome</p>",
      };

      jest.spyOn(EmailTemplate, "findById").mockImplementation(() => ({
        populate: () => Promise.resolve(fakeTemplate),
      }));

      const res = await request(app).get(
        "/api/email-template/507f1f77bcf86cd799439011"
      );

      expect(res.status).toBe(200);
    });

    test("returns 404 when template not found", async () => {
      jest.spyOn(EmailTemplate, "findById").mockImplementation(() => ({
        populate: () => Promise.resolve(null),
      }));

      const res = await request(app).get("/api/email-template/nonexistent");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("status", "error");
    });
  });

  describe("PUT /api/email-template/:id", () => {
    test("returns 200 when template updated successfully", async () => {
      const fakeUser = {
        _id: "507f1f77bcf86cd799439011",
        role: "admin",
        companyId: null,
      };

      const fakeTemplate = {
        _id: "507f1f77bcf86cd799439011",
        template_name: "Old Name",
        subject: "Old Subject",
        body: "<p>Old Body</p>",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findById").mockResolvedValue(fakeUser);
      jest.spyOn(EmailTemplate, "findById").mockResolvedValue(fakeTemplate);

      const res = await request(app)
        .put("/api/email-template/507f1f77bcf86cd799439011")
        .send({ template_name: "Updated Name" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
    });
  });

  describe("DELETE /api/email-template/:id", () => {
    test("returns 200 when template deleted successfully", async () => {
      const fakeTemplate = {
        _id: "507f1f77bcf86cd799439011",
        template_name: "Template to Delete",
        deleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(EmailTemplate, "findById").mockResolvedValue(fakeTemplate);
      jest.spyOn(Template, "countDocuments").mockResolvedValue(0);

      const res = await request(app).delete(
        "/api/email-template/507f1f77bcf86cd799439011"
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "success");
    });

    test("returns 400 when template is in use", async () => {
      const fakeTemplate = {
        _id: "507f1f77bcf86cd799439011",
        template_name: "Used Template",
        deleted: false,
      };

      jest.spyOn(EmailTemplate, "findById").mockResolvedValue(fakeTemplate);
      jest.spyOn(Template, "countDocuments").mockResolvedValue(2);

      const res = await request(app).delete(
        "/api/email-template/507f1f77bcf86cd799439011"
      );

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("status", "error");
    });
  });
});
