const express = require("express");
const request = require("supertest");
const mockingoose = require("mockingoose");

const authRouter = require("../../src/routes/auth.route");
const User = require("../../src/models/user.model");
const Company = require("../../src/models/company.model");
const Permission = require("../../src/models/permission.model");

describe("Auth routes - integration (router mounted)", () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/api/auth", authRouter);
  });

  beforeEach(() => mockingoose.resetAll());
  afterEach(() => jest.restoreAllMocks());

  test("POST /api/auth/login -> 200 on valid creds", async () => {
    mockingoose(User).toReturn(
      {
        _id: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        password: "$2b$10$hashed",
        role: "user",
        companyId: "cid",
        permissions: [],
      },
      "findOne"
    );

    // mock company findById().populate()
    jest.spyOn(Company, "findById").mockImplementation(() => ({
      populate: () =>
        Promise.resolve({
          _id: "cid",
          plan: { name: "Basic" },
          lastLoggedInUser: [],
          activeDashboard: 0,
          save: jest.fn(),
        }),
    }));

    mockingoose(Permission).toReturn([{ name: "read" }], "find");

    jest.spyOn(require("bcrypt"), "compare").mockResolvedValue(true);
    jest.spyOn(require("jsonwebtoken"), "sign").mockReturnValue("jwt");

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token", "jwt");
  });
});
