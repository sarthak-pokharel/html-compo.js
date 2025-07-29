# TypeScript Version of html-compo.js

This directory contains the TypeScript version of the html-compo.js library.

## Files

- `main.ts` - Main TypeScript implementation
- `types.d.ts` - Type definitions for the library
- `tsconfig.json` - TypeScript configuration

## Key TypeScript Features Added

### Type Safety
- Strong typing for all component objects and interfaces
- Proper type definitions for DOM elements and shadow DOM
- Type-safe attribute handling and component configuration

### Interfaces
- `ComponentObject` - Defines the structure of component definitions
- `HtmlCompoAPI` - Main API interface
- `HtmlCompoFunc` - Component manipulation class interface
- `CompoSelf` - Component self-reference object
- `UseComponentOptions` - Component usage options

### Improved Error Handling
- Type-safe error throwing with `never` return type
- Compile-time checking for proper argument types

### Enhanced IDE Support
- Full IntelliSense support
- Auto-completion for component methods
- Type checking during development

## Building

To compile the TypeScript to JavaScript:

```bash
npm run build
```

To watch for changes and recompile automatically:

```bash
npm run build:watch
```

## Usage

The TypeScript version maintains full compatibility with the original JavaScript API while adding type safety:

```typescript
// Type-safe component access
const component = window.htmlCompo.getComponent('my-ref');
if (component) {
  // TypeScript knows these methods exist and their signatures
  const content = component.html();
  component.attr('class', 'new-class');
}
```

## Differences from JavaScript Version

1. **Type Annotations**: All functions and variables have proper type annotations
2. **Interface Definitions**: Clear interfaces for all data structures
3. **Method Overloading**: Proper TypeScript method overloading for `html()` and `attr()` methods
4. **Global Type Declaration**: Proper global window object augmentation
5. **ES2019 Target**: Uses modern JavaScript features with ES2019 target

The compiled JavaScript output will be functionally identical to the original while providing all the benefits of TypeScript during development.
