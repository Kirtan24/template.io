const emailtemplateController = require("../../../src/controllers/emailtemplate.controller");
const EmailTemplate = require("../../../src/models/emailtemplate.model");
const User = require("../../../src/models/user.model");
const Template = require("../../../src/models/template.model");

describe("emailtemplate.controller - unit tests", () => {
  afterEach(() => jest.restoreAllMocks());

  describe("getAllEmailTemplates", () => {
    test("returns 200 with templates for admin user", async () => {
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
      ];

      jest.spyOn(User, "findById").mockResolvedValue(fakeUser);
      jest.spyOn(EmailTemplate, "find").mockImplementation(() => ({
        populate: () => ({
          select: () => Promise.resolve(fakeTemplates),
        }),
      }));

      const req = { user: { id: "507f1f77bcf86cd799439011" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await emailtemplateController.getAllEmailTemplates(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success" })
      );
    });

    test("returns 404 when user not found", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);

      const req = { user: { id: "507f1f77bcf86cd799439011" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await emailtemplateController.getAllEmailTemplates(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getEmailTemplateById", () => {
    test("returns template when found", async () => {
      const fakeTemplate = {
        _id: "507f1f77bcf86cd799439011",
        template_name: "Welcome",
        subject: "Welcome!",
        body: "<p>Welcome</p>",
      };

      jest.spyOn(EmailTemplate, "findById").mockImplementation(() => ({
        populate: () => Promise.resolve(fakeTemplate),
      }));

      const req = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      await emailtemplateController.getEmailTemplateById(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeTemplate);
    });
  });

  describe("updateEmailTemplate", () => {
    test("updates template successfully", async () => {
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

      const req = {
        user: { id: "507f1f77bcf86cd799439011" },
        params: { id: "507f1f77bcf86cd799439011" },
        body: { template_name: "New Name" },
      };

      const res = { json: jest.fn().mockReturnThis() };

      await emailtemplateController.updateEmailTemplate(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success" })
      );
    });
  });

  describe("deleteEmailTemplate", () => {
    test("marks template as deleted when not in use", async () => {
      const fakeTemplate = {
        _id: "507f1f77bcf86cd799439011",
        template_name: "Old Template",
        deleted: false,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(EmailTemplate, "findById").mockResolvedValue(fakeTemplate);
      jest.spyOn(Template, "countDocuments").mockResolvedValue(0);

      const req = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = { json: jest.fn().mockReturnThis() };

      await emailtemplateController.deleteEmailTemplate(req, res);

      expect(fakeTemplate.deleted).toBe(true);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ status: "success" })
      );
    });

    test("returns 400 when template is in use", async () => {
      const fakeTemplate = {
        _id: "507f1f77bcf86cd799439011",
        template_name: "Used Template",
        deleted: false,
      };

      jest.spyOn(EmailTemplate, "findById").mockResolvedValue(fakeTemplate);
      jest.spyOn(Template, "countDocuments").mockResolvedValue(1);

      const req = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      await emailtemplateController.deleteEmailTemplate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
