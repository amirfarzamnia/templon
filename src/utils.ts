import sjson from "secure-json-parse";

/**
 * Attempts to parse a string as JSON if it appears to be a valid JSON object or array.
 * This is used to automatically convert string representations of objects/arrays back to their
 * original form after template processing.
 *
 * This function is secure against prototype pollution and other JSON-based attacks because it:
 * 1. Only parses strings that are explicitly objects or arrays (starting/ending with {}/[])
 * 2. Uses a secure JSON parsing library that prevents prototype pollution
 * 3. Returns the original string if parsing fails, preventing injection attacks
 *
 * @param str - The string to attempt parsing
 * @returns The parsed JSON object/array if successful, or the original string if parsing fails
 *
 * @example
 * tryParseJson('{"name": "John"}') // Returns { name: "John" }
 * tryParseJson('[1, 2, 3]') // Returns [1, 2, 3]
 * tryParseJson('Hello World') // Returns "Hello World"
 *
 * @internal
 */
export const tryParseJson = (str: string): any => {
  try {
    const trimmed = str.trim();

    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      return sjson(trimmed);
    }
  } catch {}

  return str;
};
