/**
 * Processes escape sequences in templates
 *
 * @internal
 */
export const processEscapeSequences = (str: string): string =>
  str.replace(/\\{/g, "\uE000").replace(/\\}/g, "\uE001");

/**
 * Restores escape sequences after processing
 *
 * @internal
 */
export const restoreEscapeSequences = (str: string): string =>
  str.replace(/\uE000/g, "{").replace(/\uE001/g, "}");

/**
 * Attempts to parse a string as JSON if it appears to be JSON
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
