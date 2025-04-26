/**
 * Marker characters used internally to temporarily replace escaped sequences.
 * These special Unicode characters are unlikely to appear in normal text.
 */
const ESCAPE_MARKERS = {
  start: "\uE000", // Private Use Area Unicode character
  end: "\uE001", // Private Use Area Unicode character
};

/**
 * Processes escape sequences in templates by analyzing the variablePattern and
 * replacing variable delimiters preceded by the escape character.
 *
 * This function can handle any variable pattern format and uses a configurable escape character.
 *
 * @param str - The string containing escape sequences to process
 * @param variablePattern - The pattern used to match variables
 * @param escapeChar - The character used for escaping (defaults to backslash)
 * @returns The string with escape sequences replaced with special characters
 *
 * @example
 * // With default backslash escaping and {{name}} pattern
 * processEscapeSequences("Hello \\{{name}}") // Properly escapes {{name}}
 *
 * // With custom escaping and <name> pattern
 * processEscapeSequences("Hello #<name>", /<([^<>]+)>/g, '#') // Properly escapes <name>
 *
 * @internal
 */
export const processEscapeSequences = (
  str: string,
  variablePattern: RegExp = /{{([^{}]+)}}/g,
  escapeChar: string = "\\"
): string => {
  // Extract the delimiter information from the variable pattern
  let patternStr = variablePattern.toString();

  // Remove the global flag and any modifiers from the RegExp string
  patternStr = patternStr.replace(/\/[gimuy]*$/, "").replace(/^\//, "");

  // Extract the first character sequence in the pattern (opening delimiter)
  const openDelimMatch = patternStr.match(/^[^(]*(?=\()/);
  const openDelim = openDelimMatch ? openDelimMatch[0] : "{{";

  // Extract the character sequence after the capture group (closing delimiter)
  const closeDelimMatch = patternStr.match(/(?<=\)[^)]*)[^(]*$/);
  const closeDelim = closeDelimMatch ? closeDelimMatch[0] : "}}";

  // Escape the escape character and delimiters for use in a RegExp
  const escapedEscapeChar = escapeChar.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const escapedOpenDelim = openDelim.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const escapedCloseDelim = closeDelim.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

  // Create patterns to match escaped delimiters
  const escapedOpenPattern = new RegExp(
    `${escapedEscapeChar}${escapedOpenDelim}`,
    "g"
  );
  const escapedClosePattern = new RegExp(
    `${escapedEscapeChar}${escapedCloseDelim}`,
    "g"
  );

  // Replace escaped delimiters with marker characters
  return str
    .replace(escapedOpenPattern, ESCAPE_MARKERS.start)
    .replace(escapedClosePattern, ESCAPE_MARKERS.end);
};

/**
 * Restores escape sequences after template processing by replacing special Unicode characters
 * back to their original delimiter form without the escape character.
 *
 * @param str - The string containing special characters to restore
 * @param variablePattern - The pattern used to match variables
 * @returns The string with special characters replaced with unescaped delimiters
 *
 * @example
 * restoreEscapeSequences("Hello \uE000name\uE001") // Returns "Hello {name}"
 *
 * @internal
 */
export const restoreEscapeSequences = (
  str: string,
  variablePattern: RegExp = /{{([^{}]+)}}/g
): string => {
  // Extract the delimiter information from the variable pattern
  let patternStr = variablePattern.toString();

  // Remove the global flag and any modifiers from the RegExp string
  patternStr = patternStr.replace(/\/[gimuy]*$/, "").replace(/^\//, "");

  // Extract the first character sequence in the pattern (opening delimiter)
  const openDelimMatch = patternStr.match(/^[^(]*(?=\()/);
  const openDelim = openDelimMatch ? openDelimMatch[0] : "{{";

  // Extract the character sequence after the capture group (closing delimiter)
  const closeDelimMatch = patternStr.match(/(?<=\)[^)]*)[^(]*$/);
  const closeDelim = closeDelimMatch ? closeDelimMatch[0] : "}}";

  // Replace marker characters with unescaped delimiters
  return str
    .replace(new RegExp(ESCAPE_MARKERS.start, "g"), openDelim)
    .replace(new RegExp(ESCAPE_MARKERS.end, "g"), closeDelim);
};

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
