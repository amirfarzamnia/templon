import {
  processEscapeSequences,
  restoreEscapeSequences,
  tryParseJson,
} from "../src/utils";

describe("Template utility functions", () => {
  describe("processEscapeSequences", () => {
    it("should replace escaped opening and closing delimiters with markers", () => {
      const input = "This is \\{{escaped}} but this {{isNot}}";
      const result = processEscapeSequences(input);

      // The \uE000 and \uE001 are the special Unicode marker characters
      expect(result).not.toContain("\\{{");
      expect(result).toContain("{{isNot}}");

      // We can't directly test for the Unicode characters in the expect statement,
      // so we'll verify the function behavior indirectly
      expect(result).not.toBe(input);
      expect(restoreEscapeSequences(result)).toBe(
        "This is {{escaped}} but this {{isNot}}"
      );
    });

    it("should handle custom variable patterns", () => {
      const input = "This is \\<escaped> but this <notEscaped>";
      const pattern = /<([^<>]+)>/g;

      const result = processEscapeSequences(input, pattern, "\\");

      expect(result).not.toContain("\\<");
      expect(result).toContain("<notEscaped>");

      // Verify through restoration
      expect(restoreEscapeSequences(result, pattern)).toBe(
        "This is <escaped> but this <notEscaped>"
      );
    });

    it("should handle custom escape characters", () => {
      const input = "This is #{{escaped}} but this {{notEscaped}}";

      const result = processEscapeSequences(input, /{{([^{}]+)}}/g, "#");

      expect(result).not.toContain("#{{");
      expect(result).toContain("{{notEscaped}}");

      // Verify through restoration
      expect(restoreEscapeSequences(result)).toBe(
        "This is {{escaped}} but this {{notEscaped}}"
      );
    });

    it("should handle multiple escape sequences", () => {
      const input = "\\{{first}} and \\{{second}} but {{third}}";

      const result = processEscapeSequences(input);

      // Verify through restoration
      expect(restoreEscapeSequences(result)).toBe(
        "{{first}} and {{second}} but {{third}}"
      );
    });

    it("should handle escape sequences at start and end of string", () => {
      const input = "\\{{start}} middle \\{{end}}";

      const result = processEscapeSequences(input);

      // Verify through restoration
      expect(restoreEscapeSequences(result)).toBe("{{start}} middle {{end}}");
    });
  });

  describe("restoreEscapeSequences", () => {
    it("should restore markers to their original delimiter form", () => {
      // First process to get markers
      const original = "This is \\{{escaped}} but this {{isNot}}";
      const processed = processEscapeSequences(original);

      // Then restore
      const restored = restoreEscapeSequences(processed);

      expect(restored).toBe("This is {{escaped}} but this {{isNot}}");
    });

    it("should handle custom variable patterns when restoring", () => {
      const original = "This is \\<escaped> but this <notEscaped>";
      const pattern = /<([^<>]+)>/g;

      const processed = processEscapeSequences(original, pattern, "\\");
      const restored = restoreEscapeSequences(processed, pattern);

      expect(restored).toBe("This is <escaped> but this <notEscaped>");
    });

    it("should handle empty strings", () => {
      expect(restoreEscapeSequences("")).toBe("");
    });

    it("should leave strings without markers unchanged", () => {
      const str = "This has no markers";
      expect(restoreEscapeSequences(str)).toBe(str);
    });
  });

  describe("tryParseJson", () => {
    it("should parse valid JSON objects", () => {
      const jsonStr = '{"name":"John","age":30}';
      const result = tryParseJson(jsonStr);

      expect(result).toEqual({
        name: "John",
        age: 30,
      });
    });

    it("should parse valid JSON arrays", () => {
      const jsonStr = '[1,2,3,"four"]';
      const result = tryParseJson(jsonStr);

      expect(result).toEqual([1, 2, 3, "four"]);
    });

    it("should return the original string for invalid JSON", () => {
      const invalidJson = '{"name":"John" "age":30}'; // Missing comma
      const result = tryParseJson(invalidJson);

      expect(result).toBe(invalidJson);
    });

    it("should return the original string for non-object/array JSON strings", () => {
      expect(tryParseJson('"just a string"')).toBe('"just a string"');
      expect(tryParseJson("42")).toBe("42");
      expect(tryParseJson("true")).toBe("true");
    });

    it("should handle strings with whitespace", () => {
      const jsonStr = '  {"name": "John"}  ';
      const result = tryParseJson(jsonStr);

      expect(result).toEqual({
        name: "John",
      });
    });

    it("should handle empty objects and arrays", () => {
      expect(tryParseJson("{}")).toEqual({});
      expect(tryParseJson("[]")).toEqual([]);
    });
  });
});
