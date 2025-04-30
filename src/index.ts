import { CompileTemplateOptions } from "./types";
import {
  processEscapeSequences,
  restoreEscapeSequences,
  tryParseJson,
} from "./utils";
import { get, isArray, isNumber, isObject, isString } from "radash";
import sjson from "secure-json-parse";

/**
 * Compiles templates with advanced features for variable resolution and processing.
 *
 * This function processes templates by replacing variables with their corresponding values
 * from the provided variables object. It supports deep variable resolution, object processing,
 * and various configuration options for customization.
 *
 * Key Features:
 * - Deep variable resolution using dot notation (e.g., {{user.profile.name}})
 * - Automatic object/array processing and JSON stringification
 * - Support for escape sequences in templates
 * - Strict mode for validation of required variables
 * - Custom resolvers for complex variable resolution logic
 * - Circular reference protection with configurable depth limiting
 * - Customizable variable pattern matching
 *
 * @template T - The type of the template input which is also the output type
 * @param template - The template to compile. Can be a string, object, or array.
 * @param variables - Object containing variable values for template resolution
 * @param options - Configuration options for template compilation
 * @returns The compiled template with variables resolved
 *
 * @example
 * // Basic string interpolation
 * compileTemplate("Hello {{name}}", { name: "World" });
 * // Output: "Hello World"
 *
 * @example
 * // Nested object access
 * compileTemplate("Hello {{user.profile.name}}", {
 *   user: {
 *     profile: {
 *       name: "John"
 *     }
 *   }
 * });
 * // Output: "Hello John"
 *
 * @example
 * // With strict mode
 * try {
 *   compileTemplate("Hello {{name}}", {}, { strict: true });
 * } catch (error) {
 *   // Error: Missing variable: name
 * }
 *
 * @example
 * // Custom variable pattern
 * compileTemplate("Hello <name>",
 *   { name: "World" },
 *   { variablePattern: /<([^{}]+)>/g }
 * );
 * // Output: "Hello World"
 */
export function compileTemplate<T>(
  template: T,
  variables: Record<string, any> = {},
  options: CompileTemplateOptions = {}
): T extends string ? string : T {
  const {
    strict = false,
    preserveUndefined = false,
    autoStringifyObjects = true,
    parseStrings = true,
    parseBinInts = false,
    maxVariableDepth = 10,
    resolver,
    stringTransform = (s) => s,
    variablePattern = /{{([^{}]+)}}/g,
    escapeCharacter = "\\",
  } = options;

  /**
   * Resolves a variable path to its corresponding value.
   * Handles custom resolvers and deep property access.
   *
   * @param path - The variable path to resolve
   * @param depth - Current recursion depth for circular reference protection
   * @returns The resolved value or undefined if not found
   */
  const resolveVariable = (path: string, depth: number = 0): any => {
    // Prevent infinite recursion
    if (depth >= maxVariableDepth) {
      return undefined;
    }

    // Use custom resolver if provided
    if (resolver) {
      const result = resolver(path);

      if (result !== undefined) {
        return result;
      }
    }

    // Use radash get for deep property access
    return get(variables, path);
  };

  /**
   * Processes a string template by replacing variables with their values.
   * Handles escape sequences, object stringification, and strict mode validation.
   *
   * @param str - The string template to process
   * @returns The processed string with variables resolved
   */
  const processString = (str: string): string => {
    let result = processEscapeSequences(str, variablePattern, escapeCharacter);
    let changed: boolean;
    let iterationCount = 0;

    do {
      changed = false;

      iterationCount++;

      // Prevent infinite processing loops
      if (iterationCount > maxVariableDepth) {
        break;
      }

      result = result.replace(
        variablePattern,
        (match: string, path: string) => {
          const value = resolveVariable(path.trim(), iterationCount);

          if (value === undefined) {
            if (strict) {
              throw new Error(`Missing variable: ${path}`);
            }

            return preserveUndefined ? match : "";
          }

          if (autoStringifyObjects && isObject(value)) {
            return JSON.stringify(value);
          }

          changed = true;

          return String(value);
        }
      );
    } while (changed && result.includes("{"));

    result = stringTransform(restoreEscapeSequences(result, variablePattern));

    if (parseStrings) {
      try {
        const parsedResult = sjson(result);

        if (
          !isNumber(parsedResult) ||
          Number.isSafeInteger(parsedResult) ||
          parseBinInts
        ) {
          result = parsedResult;
        }
      } catch {}
    }

    return result;
  };

  /**
   * Processes a value based on its type.
   * Recursively processes strings, arrays, and objects.
   *
   * @param value - The value to process
   * @returns The processed value
   */
  const processValue = (value: any): any => {
    if (isString(value)) {
      const processed = processString(value);

      return tryParseJson(processed);
    }

    if (isArray(value)) {
      return value.map(processValue);
    }

    if (isObject(value)) {
      return Object.entries(value).reduce(
        (acc: Record<string, any>, [key, val]) => {
          acc[key] = processValue(val);

          return acc;
        },
        {}
      );
    }

    return value;
  };

  return processValue(template);
}

// Export types for consumers
export type { CompileTemplateOptions };
