/**
 * Processes escape sequences in templates by replacing escaped braces with special Unicode characters.
 * This prevents the template engine from processing escaped braces as variable placeholders.
 *
 * @param str - The string containing escape sequences to process
 * @returns The string with escape sequences replaced with special characters
 *
 * @example
 * processEscapeSequences("Hello \\{name\\}") // Returns "Hello \uE000name\uE001"
 *
 * @internal
 */
export const processEscapeSequences = (str: string): string =>
  str.replace(/\\{/g, "\uE000").replace(/\\}/g, "\uE001");

/**
 * Restores escape sequences after template processing by replacing special Unicode characters
 * back to their original escaped brace form.
 *
 * @param str - The string containing special characters to restore
 * @returns The string with special characters replaced with escaped braces
 *
 * @example
 * restoreEscapeSequences("Hello \uE000name\uE001") // Returns "Hello {name}"
 *
 * @internal
 */
export const restoreEscapeSequences = (str: string): string =>
  str.replace(/\uE000/g, "{").replace(/\uE001/g, "}");

/**
 * Attempts to parse a string as JSON if it appears to be a valid JSON object or array.
 * This is used to automatically convert string representations of objects/arrays back to their
 * original form after template processing.
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
      return JSON.parse(trimmed);
    }
  } catch {}

  return str;
};
