/**
 * Configuration options for template compilation.
 * These options control how templates are processed and how variables are resolved.
 */
export interface CompileTemplateOptions {
  /**
   * When enabled, throws an error if a variable referenced in the template is not found.
   * This is useful for catching missing variables early in development.
   *
   * @example
   * // Will throw error if 'name' is not provided
   * compileTemplate("Hello {{name}}", {}, { strict: true });
   *
   * @default false
   */
  strict?: boolean;

  /**
   * Controls how undefined variables are handled in the output.
   * When false, undefined variables are replaced with an empty string.
   * When true, the original variable placeholder is preserved.
   *
   * @example
   * // With preserveUndefined: false
   * compileTemplate("Hello {{name}}", {})
   * // Output: "Hello "
   *
   * // With preserveUndefined: true
   * compileTemplate("Hello {{name}}", {}, { preserveUndefined: true })
   * // Output: "Hello {{name}}"
   *
   * @default false
   */
  preserveUndefined?: boolean;

  /**
   * When enabled, objects and arrays are automatically converted to JSON strings.
   * This is useful when you want to display complex data structures in the template.
   *
   * @example
   * // With autoStringifyObjects: true
   * compileTemplate("Data: {{data}}", { data: { foo: "bar" } })
   * // Output: "Data: {"foo":"bar"}"
   *
   * @default true
   */
  autoStringifyObjects?: boolean;

  /**
   * When enabled, attempts to parse string values as JSON.
   * This is useful when you want to convert string representations of objects back to objects.
   *
   * @example
   * // With parseStrings: true
   * compileTemplate("{{json}}", { json: '{"foo":"bar"}' })
   * // Output: { foo: "bar" }
   *
   * @default true
   */
  parseStrings?: boolean;

  /**
   * When enabled, attempts to parse string values as BigInt.
   * This is useful when working with large numbers that exceed JavaScript's Number.MAX_SAFE_INTEGER.
   *
   * @example
   * // With parseBinInts: true
   * compileTemplate("{{bigNum}}", { bigNum: "9007199254740993" })
   * // Output: 9007199254740993n
   *
   * @default false
   */
  parseBinInts?: boolean;

  /**
   * Maximum depth for nested variable resolution.
   * This prevents circular references and infinite loops in complex data structures.
   *
   * @example
   * // With maxVariableDepth: 1
   * compileTemplate("{{a.b.c}}", { a: { b: { c: "value" } } }, { maxVariableDepth: 1 })
   * // Output: "" (c is at depth 2)
   *
   * @default 10
   */
  maxVariableDepth?: number;

  /**
   * Custom function to resolve variable values.
   * This allows for custom logic when resolving template variables.
   *
   * @param path The variable path being resolved (e.g., "user.profile.name")
   * @returns The resolved value or undefined if the variable should be handled by the default resolver
   *
   * @example
   * compileTemplate("Hello {{user.name}}", {}, {
   *   resolver: (path) => {
   *     if (path === "user.name") return "Custom User";
   *     return undefined;
   *   }
   * });
   */
  resolver?: (path: string) => any;

  /**
   * Transform function applied to the final string output.
   * This allows for custom string processing after all variables are resolved.
   *
   * @param value The processed string value
   * @returns The transformed string
   *
   * @example
   * compileTemplate("Hello {{name}}", { name: "World" }, {
   *   stringTransform: (s) => s.toUpperCase()
   * });
   * // Output: "HELLO WORLD"
   */
  stringTransform?: (value: string) => string;

  /**
   * Custom regular expression pattern for matching variables in the template.
   * The pattern should have a capture group for the variable name.
   *
   * @example
   * // Using custom pattern <variable>
   * compileTemplate("Hello <name>", { name: "World" }, {
   *   variablePattern: /<([^{}]+)>/g
   * });
   *
   * @default /{{([^{}]+)}}/g
   */
  variablePattern?: RegExp;

  /**
   * Character used to escape variable delimiters.
   * When a variable delimiter is preceded by this character, it will be treated as a literal character
   * rather than a variable marker. The escape character itself will be removed from the output.
   *
   * @example
   * // With escapeCharacter: '\'
   * compileTemplate("Hello \\{{name}}", { name: "World" })
   * // Output: "Hello {{name}}"
   *
   * // With escapeCharacter: '#'
   * compileTemplate("Hello #{{name}}", { name: "World" }, { escapeCharacter: '#' })
   * // Output: "Hello {{name}}"
   *
   * @default '\\'
   */
  escapeCharacter?: string;
}
