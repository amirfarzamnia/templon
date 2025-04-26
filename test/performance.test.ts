import { compileTemplate } from "../src/index";

describe("Performance tests", () => {
  // Helper to generate large test data
  const generateLargeObject = (depth: number, breadth: number): any => {
    if (depth <= 0) {
      return "leaf-value";
    }

    const result: Record<string, any> = {};

    for (let i = 0; i < breadth; i++) {
      result[`prop-${i}`] = generateLargeObject(depth - 1, breadth);
    }

    return result;
  };

  const generateLargeTemplate = (variables: number): string => {
    let template = "";

    for (let i = 0; i < variables; i++) {
      template += `Variable-${i}: {{var${i}}} `;
    }

    return template;
  };

  const generateVariables = (count: number): Record<string, any> => {
    const variables: Record<string, any> = {};

    for (let i = 0; i < count; i++) {
      variables[`var${i}`] = `value-${i}`;
    }

    return variables;
  };

  // Set long timeout for performance tests
  jest.setTimeout(10000);

  it("should efficiently process templates with many variables", () => {
    const template = generateLargeTemplate(100);
    const variables = generateVariables(100);

    const startTime = Date.now();
    compileTemplate(template, variables);
    const endTime = Date.now();

    const executionTime = endTime - startTime;

    // This is a flexible assertion since execution time will vary by environment
    // The main goal is to ensure it completes in a reasonable time
    expect(executionTime).toBeLessThan(1000); // Should take less than 1 second

    console.log(`Processing 100 variables took ${executionTime}ms`);
  });

  it("should efficiently process deep object templates", () => {
    const template = {
      level1: {
        level2: {
          level3: {
            value: "{{deepValue}}",
          },
        },
      },
    };
    const variables = { deepValue: "test-value" };

    const startTime = Date.now();
    compileTemplate(template, variables);
    const endTime = Date.now();

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(1000);

    console.log(`Processing deep object template took ${executionTime}ms`);
  });

  it("should handle large nested objects in variables", () => {
    const largeNestedObject = generateLargeObject(4, 4);
    const template = "{{obj.prop-0.prop-1.prop-2.prop-3}}";
    const variables = { obj: largeNestedObject };

    const startTime = Date.now();
    const result = compileTemplate(template, variables);
    const endTime = Date.now();

    // Fix expectations: at depth 4, prop-3 accesses the leaf value directly
    expect(result).toBe("leaf-value");

    const executionTime = endTime - startTime;
    expect(executionTime).toBeLessThan(1000);

    console.log(`Processing large nested object took ${executionTime}ms`);
  });

  it("should efficiently process templates with complex variable patterns", () => {
    // Template with mixed delimiters requiring separate processing
    let template = "";
    for (let i = 0; i < 50; i++) {
      if (i % 2 === 0) {
        template += `Standard {{var${i}}} `;
      } else {
        template += `Custom <var${i}> `;
      }
    }

    const variables = generateVariables(50);

    // Process with standard pattern
    const startTime1 = Date.now();
    compileTemplate(template, variables);
    const endTime1 = Date.now();

    // Process with custom pattern
    const startTime2 = Date.now();
    compileTemplate(template, variables, {
      variablePattern: /<([^<>]+)>/g,
    });
    const endTime2 = Date.now();

    const executionTime1 = endTime1 - startTime1;
    const executionTime2 = endTime2 - startTime2;

    expect(executionTime1).toBeLessThan(1000);
    expect(executionTime2).toBeLessThan(1000);

    console.log(
      `Standard pattern: ${executionTime1}ms, Custom pattern: ${executionTime2}ms`
    );
  });
});
