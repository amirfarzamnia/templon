/**
 * Configuration options for template compilation
 */
export interface CompileTemplateOptions {
  /**
   * Throw errors when variables are missing
   *
   * @default false
   */
  strict?: boolean;

  /**
   * Preserve undefined variables in output
   * When false, undefined variables are replaced with empty string
   *
   * @default false
   */
  preserveUndefined?: boolean;

  /**
   * Automatically stringify objects to JSON
   *
   * @default true
   */
  autoStringifyObjects?: boolean;

  /**
   * Automatically parse strings in output
   *
   * @default true
   */
  parseStrings?: boolean;

  /**
   * Automatically parse BigInts in output
   *
   * @default false
   */
  parseBinInts?: boolean;

  /**
   * Custom variable resolver function
   *
   * @param path The variable path being resolved
   * @returns The resolved value or undefined
   */
  resolver?: (path: string) => any;

  /**
   * Transform function for final string output
   *
   * @param value The processed string value
   * @returns The transformed string
   */
  stringTransform?: (value: string) => string;
}

/**
 * Possible input types for templates
 */
export type TemplateInput = string | object | any[];

/**
 * Possible output types from compilation
 */
export type TemplateOutput = string | number | boolean | object | any[];
