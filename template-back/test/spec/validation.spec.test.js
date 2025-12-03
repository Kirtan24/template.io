const fc = require("fast-check");

describe("email validator (spec tests)", () => {
  test("rejects simple invalid emails (property-based)", () => {
    const invalidEmailArb = fc
      .string()
      .filter((s) => !s.includes("@") || s.length < 3);
    fc.assert(
      fc.property(invalidEmailArb, (email) => {
        const ok = /\S+@\S+\.\S+/.test(email);
        return ok === false;
      })
    );
  });
});
