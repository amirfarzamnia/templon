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

  describe("escaping system", () => {
    it("should preserve escaped brackets", () => {
      expect(compileTemplate("Escaped \\{{name\\}}", { name: "test" })).toBe(
        "Escaped {{name}}"
      );
    });

    it("should support escaping custom variable patterns", () => {
      expect(
        compileTemplate(
          "Escaped \\<name\\>",
          { name: "test" },
          { variablePattern: /<([^<>]+)>/g }
        )
      ).toBe("Escaped <name>");
    });

    it("should support custom escape character", () => {
      expect(
        compileTemplate(
          "Escaped #{{name}}",
          { name: "test" },
          { escapeCharacter: "#" }
        )
      ).toBe("Escaped {{name}}");
    });

    it("should handle multiple escape sequences", () => {
      expect(
        compileTemplate("\\{{first}} and \\{{second}}", {
          first: "value1",
          second: "value2",
        })
      ).toBe("{{first}} and {{second}}");
    });

    it("should handle mixed escaped and unescaped variables", () => {
      expect(
        compileTemplate("\\{{escaped}} but {{unescaped}}", {
          escaped: "should not show",
          unescaped: "should show",
        })
      ).toBe("{{escaped}} but should show");
    });

    it("should handle custom pattern with custom escape character", () => {
      expect(
        compileTemplate(
          "Normal <var> but escaped #<var>",
          { var: "value" },
          {
            variablePattern: /<([^<>]+)>/g,
            escapeCharacter: "#",
          }
        )
      ).toBe("Normal value but escaped <var>");
    });
  });
});
