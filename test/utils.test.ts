import { tryParseJson } from "../src/utils";

describe("Template utility functions", () => {
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
