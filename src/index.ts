import { CompileTemplateOptions, TemplateInput } from "./types";
import {
  processEscapeSequences,
  restoreEscapeSequences,
  tryParseJson,
} from "./utils";

/**
 * Compiles templates with advanced features:
 * - Deep variable resolution (dot notation)
 * - Object/array processing
 * - Escape sequences
 * - Strict mode validation
 * - Custom resolvers
 * - Circular reference protection
 * - Customizable variable pattern
 *
 * @template T - The type of the template input which is also the output type
 * @example
 * compileTemplate("Hello {{user.name}}", { user: { name: "John" } });
 */
export function compileTemplate<T extends TemplateInput>(
  template: T,
  variables: Record<string, any> = {},
  options: CompileTemplateOptions = {}
): T {
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
  } = options;

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

    // Check direct property first for performance
    if (Object.prototype.hasOwnProperty.call(variables, path)) {
      return variables[path];
    }

    // Handle nested properties with dot notation
    return path.split(".").reduce((obj: any, key: string) => {
      if (obj && typeof obj === "object" && key in obj) {
        return obj[key];
      }

      return undefined;
    }, variables);
  };

  const processString = (str: string): string => {
    let result = processEscapeSequences(str);

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

          if (
            autoStringifyObjects &&
            typeof value === "object" &&
            value !== null
          ) {
            return JSON.stringify(value);
          }

          changed = true;

          return String(value);
        }
      );
    } while (changed && result.includes("{"));

    result = stringTransform(restoreEscapeSequences(result));

    if (parseStrings) {
      try {
        const parsed = JSON.parse(result);

        if (
          typeof parsed !== "number" ||
          Number.isSafeInteger(parsed) ||
          parseBinInts
        ) {
          result = parsed;
        }
      } catch {}
    }

    return result;
  };

  const processValue = (value: any): any => {
    if (typeof value === "string") {
      const processed = processString(value);

      return tryParseJson(processed);
    }

    if (Array.isArray(value)) {
      return value.map(processValue);
    }

    if (value && typeof value === "object") {
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
export type { CompileTemplateOptions, TemplateInput };
