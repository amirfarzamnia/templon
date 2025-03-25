# Templon

Advanced template compiler with deep variable resolution, object processing, and strict validation.

## Features

- Deep variable resolution using dot notation
- Automatic object/array processing
- Support for escape sequences
- Strict mode for validation
- Custom resolvers and transformers
- TypeScript support

## Installation

```bash
npm install templon
```

## Usage

```typescript
import { compileTemplate } from "templon";

// Basic string interpolation
compileTemplate("Hello {name}", { name: "World" });

// Nested objects
compileTemplate("Hello {user.name}", { user: { name: "John" } });

// With options
compileTemplate(
  "Hello {name}",
  {
    name: "World",
  },
  {
    strict: true,
    autoStringifyObjects: false,
  }
);
```

## Options

| Option               | Type                      | Default   | Description                                |
| -------------------- | ------------------------- | --------- | ------------------------------------------ |
| strict               | boolean                   | false     | Throw errors when variables are missing    |
| preserveUndefined    | boolean                   | false     | Preserve undefined variables in output     |
| autoStringifyObjects | boolean                   | true      | Automatically stringify objects to JSON    |
| resolver             | (path: string) => any     | undefined | Custom variable resolver function          |
| stringTransform      | (value: string) => string | (s) => s  | Transform function for final string output |
