import { compileTemplate } from "./index";

describe("compileTemplate", () => {
  it("should compile simple templates", () => {
    expect(compileTemplate("Hello {name}", { name: "World" })).toBe(
      "Hello World"
    );
  });

  it("should handle nested objects", () => {
    expect(
      compileTemplate("Hello {user.name}", { user: { name: "John" } })
    ).toBe("Hello John");
  });

  it("should preserve escaped brackets", () => {
    expect(compileTemplate("Escaped \\{name\\}", { name: "test" })).toBe(
      "Escaped {name}"
    );
  });

  it("should throw in strict mode for missing variables", () => {
    expect(() =>
      compileTemplate("Hello {name}", {}, { strict: true })
    ).toThrow();
  });
});
