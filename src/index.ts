import { CompileTemplateOptions, TemplateInput, TemplateOutput } from "./types";
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
 *
 * @example
 * compileTemplate("Hello {user.name}", { user: { name: "John" } });
 */
export function compileTemplate(
  template: TemplateInput,
  variables: Record<string, any> = {},
  options: CompileTemplateOptions = {}
): TemplateOutput {
  const {
    strict = false,
    preserveUndefined = false,
    autoStringifyObjects = true,
    resolver,
    stringTransform = (s) => s,
  } = options;

  const resolveVariable = (path: string): any => {
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

    do {
      changed = false;

      result = result.replace(/{([^{}]+)}/g, (match: string, path: string) => {
        const value = resolveVariable(path.trim());

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
      });
    } while (changed && result.includes("{"));

    return stringTransform(restoreEscapeSequences(result));
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
export type { CompileTemplateOptions, TemplateInput, TemplateOutput };
