const companyController = require("../../../src/controllers/company.controller");
const Company = require("../../../src/models/company.model");
const User = require("../../../src/models/user.model");

describe("company.controller - unit tests", () => {
  afterEach(() => jest.restoreAllMocks());

  describe("getAllCompanies", () => {
    test("returns all companies", async () => {
      const fakeCompanies = [
        {
          _id: "507f1f77bcf86cd799439011",
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

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await companyController.getAllCompanies(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ companies: fakeCompanies })
      );
    });
  });

  describe("getCompanyById", () => {
    test("returns company when found", async () => {
      const fakeCompany = {
        _id: "507f1f77bcf86cd799439011",
        name: "Tech Corp",
        email: "tech@example.com",
      };

      jest.spyOn(Company, "findById").mockResolvedValue(fakeCompany);

      const req = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await companyController.getCompanyById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ company: fakeCompany })
      );
    });
  });

  describe("companyEmployees", () => {
    test("returns employees for company", async () => {
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

      const req = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await companyController.companyEmployees(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ employees: fakeEmployees })
      );
    });
  });

  describe("companyProfile", () => {
    test("returns company profile", async () => {
      const fakeCompany = {
        _id: "507f1f77bcf86cd799439011",
        name: "Tech Corp",
        email: "tech@example.com",
        contactNumber: "1234567890",
        address: "123 Main St",
        companyStatus: "active",
      };

      jest.spyOn(Company, "findById").mockImplementation(() => ({
        select: () => ({
          populate: () => ({
            populate: () => Promise.resolve(fakeCompany),
          }),
        }),
      }));

      const req = { params: { id: "507f1f77bcf86cd799439011" } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await companyController.companyProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ company: fakeCompany })
      );
    });
  });

  describe("inactiveCompany", () => {
    test("returns inactive companies", async () => {
      const inactiveCompanies = [
        {
          _id: "1",
          name: "Pending Corp",
          companyStatus: "inactive",
        },
      ];

      jest.spyOn(Company, "countDocuments").mockResolvedValue(1);
      jest.spyOn(Company, "find").mockImplementation(() => ({
        populate: () => Promise.resolve(inactiveCompanies),
      }));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };

      await companyController.inactiveCompany(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ count: 1 })
      );
    });
  });
});
