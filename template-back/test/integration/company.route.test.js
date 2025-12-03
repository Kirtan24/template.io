const express = require("express");
const request = require("supertest");
const companyRouter = require("../../src/routes/company.route");
const Company = require("../../src/models/company.model");
const User = require("../../src/models/user.model");

describe("Company routes - integration tests", () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use((req, res, next) => {
      req.user = { id: "507f1f77bcf86cd799439011" };
      next();
    });
    app.use("/api/company", companyRouter);
  });

  afterEach(() => jest.restoreAllMocks());

  describe("GET /api/company", () => {
    test("returns all companies", async () => {
      const fakeCompanies = [
        {
          _id: "1",
          name: "Tech Corp",
          email: "tech@example.com",
          companyStatus: "active",
        },
      ];

      jest.spyOn(Company, "find").mockImplementation(() => ({
        populate: () => ({
          populate: () => ({
            sort: () => Promise.resolve(fakeCompanies),
          }),
        }),
      }));

      const res = await request(app).get("/api/company");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("companies");
    });
  });

  describe("GET /api/company/:id", () => {
    test("returns company by ID", async () => {
      const fakeCompany = {
        _id: "507f1f77bcf86cd799439011",
        name: "Tech Corp",
        email: "tech@example.com",
      };

      jest.spyOn(Company, "findById").mockResolvedValue(fakeCompany);

      const res = await request(app).get(
        "/api/company/507f1f77bcf86cd799439011"
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("company");
    });

    test("returns 404 when company not found", async () => {
      jest.spyOn(Company, "findById").mockResolvedValue(null);

      const res = await request(app).get("/api/company/nonexistent");

      expect(res.status).toBe(404);
    });
  });

  describe("GET /api/company/count", () => {
    test("returns inactive companies count", async () => {
      const inactiveCompanies = [
        { _id: "1", name: "Pending Corp", companyStatus: "inactive" },
      ];

      jest.spyOn(Company, "countDocuments").mockResolvedValue(1);
      jest.spyOn(Company, "find").mockImplementation(() => ({
        populate: () => Promise.resolve(inactiveCompanies),
      }));

      const res = await request(app).get("/api/company/count");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("count");
      expect(res.body).toHaveProperty("companies");
    });
  });

  describe("GET /api/company/employees/:id", () => {
    test("returns company employees", async () => {
      const fakeCompany = {
        _id: "507f1f77bcf86cd799439011",
        name: "Tech Corp",
      };

      const fakeEmployees = [
        { _id: "1", name: "John", role: "admin" },
        { _id: "2", name: "Jane", role: "employee" },
      ];

      jest.spyOn(Company, "findById").mockResolvedValue(fakeCompany);
      jest.spyOn(User, "find").mockImplementation(() => ({
        sort: () => Promise.resolve(fakeEmployees),
      }));

      const res = await request(app).get(
        "/api/company/employees/507f1f77bcf86cd799439011"
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("employees");
    });
  });

  describe("GET /api/company/profile/:id", () => {
    test("returns company profile", async () => {
      const fakeCompany = {
        _id: "507f1f77bcf86cd799439011",
        name: "Tech Corp",
        email: "tech@example.com",
        contactNumber: "1234567890",
        companyStatus: "active",
      };

      jest.spyOn(Company, "findById").mockImplementation(() => ({
        select: () => ({
          populate: () => ({
            populate: () => Promise.resolve(fakeCompany),
          }),
        }),
      }));

      const res = await request(app).get(
        "/api/company/profile/507f1f77bcf86cd799439011"
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("company");
    });
  });
});
