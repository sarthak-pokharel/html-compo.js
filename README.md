# HTML Components Create and Reuse

A lightweight JavaScript library for creating reusable HTML components without any build tools or complex setup.

## 🚀 Quick Start

```html
<script src="//cdn.jsdelivr.net/npm/html-compo@latest"></script>

<user-card>John Doe</user-card>
<user-card>Jane Smith</user-card>

<html-components>
  <user-card>
    <div class="card">
      <h3>@{self.data}</h3>
      <p>Welcome, @{self.data}!</p>
    </div>
  </user-card>
</html-components>
```

## 📚 Documentation

- **[Complete Documentation](./docs/documentation.html)** - Comprehensive guide with API reference
- **[Interactive Examples](./docs/examples.html)** - Live demos and use cases
- **[TypeScript Support](./TYPESCRIPT.md)** - Type-safe development guide

## 🌐 Online Resources

- **Home Page:** [htmlcompo.sarthak2004.com](https://htmlcompo.sarthak2004.com/)
- **NPM Package:** [html-compo](https://www.npmjs.com/package/html-compo)
- **GitHub:** [html-compo.js](https://github.com/SarthakWhenever/html-compo.js)

## 📦 Installation

### CDN (Recommended)
```html
<script src="//cdn.jsdelivr.net/npm/html-compo@latest"></script>
```

### NPM
```bash
npm install html-compo
```

Then import in your project:
```javascript
import 'html-compo';
```

## ✨ Key Features

- 🎯 **Zero Dependencies** - Pure JavaScript, no framework required
- 📝 **Simple Syntax** - Use familiar HTML with `@{variable}` templating
- 🔧 **Attribute Binding** - Pass data through HTML attributes
- 🎨 **Shadow DOM Support** - Encapsulated styling with `fragment="true"`
- 🔗 **Component References** - Access and manipulate components via `ref` attribute
- 📱 **Framework Agnostic** - Works with any existing HTML/JavaScript project
- 🚀 **TypeScript Ready** - Full type definitions included

## 🏃‍♂️ Basic Usage

### 1. Define Components
```html
<html-components>
  <greeting-card>
    <div class="greeting">
      <h2>Hello, @{self.data}!</h2>
      <p>This is a reusable component.</p>
    </div>
  </greeting-card>
</html-components>
```

### 2. Use Components
```html
<greeting-card>World</greeting-card>
<greeting-card>HTML-COMPO.js</greeting-card>
```

### 3. With Attributes
```html
<user-profile name="John" role="Admin" email="john@example.com"></user-profile>

<html-components>
  <user-profile compo-attrs="name,role,email">
    <div class="profile">
      <h3>@{name}</h3>
      <p>Role: @{role}</p>
      <p>Email: @{email}</p>
    </div>
  </user-profile>
</html-components>
```

## 🎮 Interactive Examples

Check out our [interactive examples page](./docs/examples.html) featuring:

- 📊 **Dashboard Components** - Real-time stats and user management
- 🛒 **Shopping Cart** - Add/remove items with dynamic totals
- 💬 **Chat Interface** - Message components with different types
- 📈 **Data Visualization** - Progress bars and charts
- 🎮 **Mini Games** - Interactive number guessing game
- 🎨 **Theme System** - Dynamic theme switching

## 🔗 API Reference

### Global API
```javascript
// Get component by reference
const component = htmlCompo.getComponent('my-ref');

// Manipulate component content
component.html('New content');
component.attr('class', 'new-class');
```

### Template Variables
- `@{self.data}` - Content inside component tags
- `@{self.componentName}` - Component tag name
- `@{attributeName}` - Values from component attributes

### Component Definition
```html
<html-components>
  <my-component compo-attrs="prop1,prop2=defaultValue" fragment="true">
    <!-- Component template with @{variables} -->
  </my-component>
</html-components>
```

## 🎯 Advanced Features

### Shadow DOM Encapsulation
```html
<html-components>
  <styled-component fragment="true">
    <style>
      .component-style { color: blue; }
    </style>
    <div class="component-style">@{self.data}</div>
  </styled-component>
</html-components>
```

### Component References
```html
<interactive-counter ref="counter1" value="0"></interactive-counter>

<script>
const counter = htmlCompo.getComponent('counter1');
counter.attr('value', '10');
</script>
```

## 💾 TypeScript Support

HTML-COMPO.js includes full TypeScript support:

```typescript
// Type-safe component access
const component = window.htmlCompo.getComponent('my-ref');
if (component) {
  const content: string = component.html();
  component.attr('class', 'new-class');
}
```

See [TypeScript documentation](./TYPESCRIPT.md) for complete setup instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 👨‍💻 Author

**Sarthak Pokharel**
- GitHub: [@SarthakWhenever](https://github.com/SarthakWhenever)
- NPM: [html-compo](https://www.npmjs.com/package/html-compo)

