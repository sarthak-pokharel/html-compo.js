# HTML-COMPO.js Quick Reference

## 📥 Installation

```html
<!-- CDN -->
<script src="https://cdn.jsdelivr.net/npm/html-compo@latest/src/main.js"></script>

<!-- NPM -->
npm install html-compo
```

## 🏗️ Basic Structure

```html
<!-- 1. Define components -->
<html-components>
  <my-component>
    <div>@{self.data}</div>
  </my-component>
</html-components>

<!-- 2. Use components -->
<my-component>Hello World</my-component>
```

## 🔧 Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `@{self.data}` | Content inside component tags | `<comp>text</comp>` → "text" |
| `@{self.componentName}` | Component tag name | `<my-comp>` → "my-comp" |
| `@{attributeName}` | Attribute values | `name="John"` → `@{name}` → "John" |

## 📝 Component Attributes

```html
<!-- Define which attributes to watch -->
<html-components>
  <user-card compo-attrs="name,role,status=active">
    <div>
      <h3>@{name}</h3>
      <p>Role: @{role}</p>
      <p>Status: @{status}</p>
    </div>
  </user-card>
</html-components>

<!-- Use with attributes -->
<user-card name="John" role="Admin"></user-card>
<user-card name="Jane" role="User" status="inactive"></user-card>
```

## 🌓 Shadow DOM

```html
<!-- Enable Shadow DOM encapsulation -->
<html-components>
  <styled-component fragment="true">
    <style>
      .private-style { color: blue; }
    </style>
    <div class="private-style">@{self.data}</div>
  </styled-component>
</html-components>
```

## 🔗 Component References

```html
<!-- Add ref attribute -->
<counter ref="myCounter" value="0"></counter>

<script>
// Access component
const counter = htmlCompo.getComponent('myCounter');

// Get/set content
const content = counter.html();
counter.html('New content');

// Get/set attributes
const value = counter.attr('value');
counter.attr('value', '10');
</script>
```

## 🎯 API Reference

### Global Object
```javascript
window.htmlCompo.getComponent(ref) // Returns HtmlCompoFunc | null
```

### HtmlCompoFunc Methods
```javascript
component.html()              // Get HTML content
component.html(content)       // Set HTML content
component.attr(name)          // Get attribute value
component.attr(name, value)   // Set attribute value
```

## 🏷️ Container Tags

| Tag | Description |
|-----|-------------|
| `<html-components>` | Standard component definition container |
| `<h-c>` | Short alias for `<html-components>` |

## ⚡ Quick Examples

### Simple Component
```html
<html-components>
  <hello-world>
    <h1>Hello, @{self.data}!</h1>
  </hello-world>
</html-components>

<hello-world>Universe</hello-world>
```

### With Attributes
```html
<html-components>
  <button-comp compo-attrs="type=button,disabled=false">
    <button type="@{type}" @{disabled === 'true' ? 'disabled' : ''}>
      @{self.data}
    </button>
  </button-comp>
</html-components>

<button-comp type="submit">Submit</button-comp>
<button-comp disabled="true">Disabled</button-comp>
```

### Interactive Component
```html
<html-components>
  <click-counter compo-attrs="count=0">
    <div>
      <p>Count: @{count}</p>
      <button onclick="increment('@{self.componentName}')">+</button>
    </div>
  </click-counter>
</html-components>

<click-counter ref="counter1"></click-counter>

<script>
function increment(componentName) {
  const counter = htmlCompo.getComponent('counter1');
  const current = parseInt(counter.attr('count'));
  counter.attr('count', (current + 1).toString());
}
</script>
```

## 🎨 Styling Tips

### Global Styles
```css
/* Target all instances of a component */
my-component {
  display: block;
  margin: 10px 0;
}
```

### Encapsulated Styles (Shadow DOM)
```html
<html-components>
  <styled-card fragment="true">
    <style>
      /* These styles won't leak outside */
      .card { 
        background: white;
        border: 1px solid #ddd;
        padding: 20px;
      }
    </style>
    <div class="card">@{self.data}</div>
  </styled-card>
</html-components>
```

## 🚨 Common Pitfalls

1. **Missing compo-attrs**: Attributes won't be available as variables
   ```html
   <!-- ❌ Wrong -->
   <my-comp>
     <div>@{name}</div> <!-- name is undefined -->
   </my-comp>
   
   <!-- ✅ Correct -->
   <my-comp compo-attrs="name">
     <div>@{name}</div>
   </my-comp>
   ```

2. **Case sensitivity**: Component names are case-insensitive, but follow conventions
   ```html
   <!-- ✅ Recommended -->
   <user-card></user-card>
   
   <!-- ❌ Avoid -->
   <UserCard></UserCard>
   ```

3. **Circular references**: Don't reference a component within itself
   ```html
   <!-- ❌ Don't do this -->
   <html-components>
     <bad-component>
       <bad-component>@{self.data}</bad-component>
     </bad-component>
   </html-components>
   ```

## 📚 TypeScript

```typescript
// Type definitions available
interface HtmlCompoAPI {
  getComponent(reference: string): HtmlCompoFunc | null;
}

declare global {
  interface Window {
    htmlCompo: HtmlCompoAPI;
  }
}

// Usage
const component = window.htmlCompo.getComponent('my-ref');
if (component) {
  const content: string = component.html();
  component.attr('class', 'new-class');
}
```

## 🔄 Best Practices

1. **Define components early** in your HTML for optimal performance
2. **Use kebab-case** for component names (`user-card`, not `UserCard`)
3. **Provide default values** for optional attributes (`compo-attrs="name,age=18"`)
4. **Use ref attributes** for components you need to manipulate with JavaScript
5. **Consider Shadow DOM** when you need style encapsulation
6. **Keep components simple** - one responsibility per component

---

For complete documentation visit: [HTML-COMPO.js Documentation](./docs/documentation.html)
