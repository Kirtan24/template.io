const mockingoose = require("mockingoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authController = require("../../../src/controllers/auth.controller");
const User = require("../../../src/models/user.model");
const Company = require("../../../src/models/company.model");
const Permission = require("../../../src/models/permission.model");

describe("Auth Controller - unit tests", () => {
  beforeEach(() => mockingoose.resetAll());
  afterEach(() => jest.restoreAllMocks());

  test("login: successful login returns token and user data", async () => {
    const fakeUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Test User",
      email: "test@example.com",
      password: "$2b$10$hashed",
      role: "user",
      companyId: "5f8f8c44b54764421b7156c",
      permissions: [],
    };

    mockingoose(User).toReturn(fakeUser, "findOne");
    // mock companyModel.findById(...).populate(...) chain
    jest.spyOn(Company, "findById").mockImplementation(() => ({
      populate: () =>
        Promise.resolve({
          _id: fakeUser.companyId,
          plan: { name: "Basic" },
          lastLoggedInUser: [],
          activeDashboard: 0,
          save: jest.fn(),
        }),
    }));
    mockingoose(Permission).toReturn([{ name: "read" }], "find");

    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    jest.spyOn(jwt, "sign").mockReturnValue("fake-jwt");

    const req = { body: { email: "test@example.com", password: "password" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ status: "success", token: "fake-jwt" })
    );
  });

  test("login: wrong password returns 400", async () => {
    mockingoose(User).toReturn(
      { _id: "1", email: "a@b.com", password: "$2b$10$hash" },
      "findOne"
    );
    jest.spyOn(bcrypt, "compare").mockResolvedValue(false);

    const req = { body: { email: "a@b.com", password: "bad" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ status: "error" })
    );
  });
});
