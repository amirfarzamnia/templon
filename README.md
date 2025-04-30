# Templon

Advanced template compiler with deep variable resolution, object processing, and strict validation with circular reference protection.

<div align="center">
  <p align="center">
    <img src="https://raw.githubusercontent.com/amirfarzamnia/templon/refs/heads/master/assets/templon.png" alt="Templon" width="100%" style="border-radius:0.5rem" />
  </p>
</div>

[![npm version](https://badge.fury.io/js/templon.svg)](https://www.npmjs.com/package/templon)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/amirfarzamnia/templon.svg)](https://github.com/amirfarzamnia/templon/issues)
[![GitHub stars](https://img.shields.io/github/stars/amirfarzamnia/templon.svg)](https://github.com/amirfarzamnia/templon/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/amirfarzamnia/templon.svg)](https://github.com/amirfarzamnia/templon/forks)

## Features

- **Deep Variable Resolution**: Access nested properties using dot notation (e.g., `{{user.profile.name}}`)
- **Object/Array Processing**: Automatically handle complex data structures
- **Strict Mode**: Validate template variables and throw errors for missing values
- **Custom Resolvers**: Extend functionality with custom variable resolution logic
- **Circular Reference Protection**: Prevent infinite loops with depth limiting
- **TypeScript Support**: Full type safety and autocompletion
- **Customizable Variable Pattern**: Use your own regex pattern for variable matching

## Installation

```bash
npm install templon
# or
yarn add templon
# or
pnpm add templon
```

## Basic Usage

```typescript
import { compileTemplate } from "templon";

// Simple string interpolation
const result = compileTemplate("Hello {{name}}", { name: "World" });
// Output: "Hello World"

// Nested object access
const result = compileTemplate("Hello {{user.profile.name}}", {
  user: {
    profile: {
      name: "John",
    },
  },
});
// Output: "Hello John"

// Array access
const result = compileTemplate("First user: {{users.0.name}}", {
  users: [{ name: "John" }, { name: "Jane" }],
});
// Output: "First user: John"
```

Note: The template engine uses [radash](https://radash-docs.vercel.app/docs/object/get) under the hood for deep property access, which provides safe and efficient object traversal.

## Advanced Examples

### Working with Arrays

```typescript
const template = "Users: {{users}}";
const data = {
  users: ["John", "Jane", "Bob"],
};
const result = compileTemplate(template, data);
// Output: "Users: John,Jane,Bob"
```

### Custom Variable Pattern

```typescript
const template = "Hello <name>";
const result = compileTemplate(
  template,
  { name: "World" },
  { variablePattern: /<([^{}]+)>/g }
);
// Output: "Hello World"
```

### Strict Mode

```typescript
const template = "Hello {{name}}";

try {
  compileTemplate(template, {}, { strict: true });
} catch (error) {
  // Error: Missing variable: name
}
```

### Custom Resolver

```typescript
const template = "Hello {{user.name}}";
const result = compileTemplate(
  template,
  {},
  {
    resolver: (path) => {
      if (path === "user.name") return "Custom User";

      return undefined;
    },
  }
);
// Output: "Hello Custom User"
```

## Configuration Options

| Option               | Type                      | Default         | Description                                |
| -------------------- | ------------------------- | --------------- | ------------------------------------------ |
| strict               | boolean                   | false           | Throw errors when variables are missing    |
| preserveUndefined    | boolean                   | false           | Preserve undefined variables in output     |
| autoStringifyObjects | boolean                   | true            | Automatically stringify objects to JSON    |
| parseStrings         | boolean                   | true            | Automatically parse strings in output      |
| parseBinInts         | boolean                   | false           | Automatically parse BigInts in output      |
| resolver             | (path: string) => any     | undefined       | Custom variable resolver function          |
| stringTransform      | (value: string) => string | (s) => s        | Transform function for final string output |
| maxVariableDepth     | number                    | 10              | Maximum depth for variable resolution      |
| variablePattern      | RegExp                    | /{{([^{}]+)}}/g | Custom regex pattern for variable matching |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
