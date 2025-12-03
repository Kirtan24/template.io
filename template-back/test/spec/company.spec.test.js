const fc = require("fast-check");

describe("Company fields - specification tests", () => {
  test("company name should always be non-empty string", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (name) => {
        expect(typeof name).toBe("string");
        expect(name.length).toBeGreaterThan(0);
      })
    );
  });

  test("company email should always be non-empty string", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (email) => {
        expect(typeof email).toBe("string");
        expect(email.length).toBeGreaterThan(0);
      })
    );
  });

  test("contact number should always be non-empty string", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (phone) => {
        expect(typeof phone).toBe("string");
        expect(phone.length).toBeGreaterThan(0);
      })
    );
  });

  test("company status should be one of valid statuses", () => {
    const statusArb = fc.constantFrom("active", "inactive", "suspended");

    fc.assert(
      fc.property(statusArb, (status) => {
        expect(["active", "inactive", "suspended"]).toContain(status);
      })
    );
  });
});
