import { CompileTemplateOptions, TemplateInput } from "./types";
import {
  processEscapeSequences,
  restoreEscapeSequences,
  tryParseJson,
} from "./utils";
import { get, isNumber, isObject, isString } from "radash";

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

    // Use radash get for deep property access
    return get(variables, path);
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

          if (autoStringifyObjects && isObject(value)) {
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
        const parsedResult = JSON.parse(result);

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

  const processValue = (value: any): any => {
    if (isString(value)) {
      const processed = processString(value);

      return tryParseJson(processed);
    }

    if (Array.isArray(value)) {
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
export type { CompileTemplateOptions, TemplateInput };
