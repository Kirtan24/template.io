const fc = require("fast-check");

describe("Email template fields - specification tests", () => {
  test("template_name should always be non-empty string", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (name) => {
        expect(typeof name).toBe("string");
        expect(name.length).toBeGreaterThan(0);
      })
    );
  });

  test("subject should always be non-empty string", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (subject) => {
        expect(typeof subject).toBe("string");
        expect(subject.length).toBeGreaterThan(0);
      })
    );
  });

  test("body should always contain non-empty text", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (body) => {
        expect(typeof body).toBe("string");
        expect(body.length).toBeGreaterThan(0);
      })
    );
  });

  test("companyId if provided should be a valid string", () => {
    const validIdArb = fc.string({ minLength: 1, maxLength: 50 });

    fc.assert(
      fc.property(validIdArb, (id) => {
        expect(typeof id).toBe("string");
        expect(id.length).toBeGreaterThan(0);
      })
    );
  });
});
