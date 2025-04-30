import { compileTemplate } from "../src/index";

describe("Basic compileTemplate tests", () => {
  it("should compile simple templates", () => {
    expect(compileTemplate("Hello {{name}}", { name: "World" })).toBe(
      "Hello World"
    );
  });

  it("should handle nested objects", () => {
    expect(
      compileTemplate("Hello {{user.name}}", { user: { name: "John" } })
    ).toBe("Hello John");
  });

  it("should throw in strict mode for missing variables", () => {
    expect(() =>
      compileTemplate("Hello {{name}}", {}, { strict: true })
    ).toThrow();
  });

  it("should support custom variable patterns", () => {
    expect(
      compileTemplate(
        "Hello {name}",
        { name: "World" },
        { variablePattern: /{([^{}]+)}/g }
      )
    ).toBe("Hello World");
  });
});
