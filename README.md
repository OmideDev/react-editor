# 🚀 @omidtz/react-editor

> A production-ready Rich Text Editor for React powered by Lexical.

Modern • Lightweight • Responsive • TypeScript Ready • SSR Safe • Mobile Friendly

---

## ✨ Features

* 🎯 Rich Text Editing
* 📝 Headings (H1–H6)
* **Bold**
* *Italic*
* Underline
* Strikethrough
* Inline Code
* Text Highlight
* Text Color
* Background Color
* Bullet List
* Numbered List
* Checklist
* Blockquote
* Divider
* Hyperlinks
* Image Upload
* Drag & Drop Images
* Image Resize
* Image Caption
* Slash Commands
* Markdown Shortcuts
* Auto Save
* Word Count
* Character Count
* Emoji Picker
* Tables
* File Upload
* Video Embed
* Responsive Toolbar
* Dark Mode
* RTL / LTR
* Accessibility Ready
* Semantic HTML Output
* React 18+
* React 19+
* JavaScript Support
* TypeScript Support
* SSR Compatible
* Vite Ready
* Next.js Ready

---

# Installation

```bash
npm install @omidtz/react-editor
```

---

# Quick Start

```jsx
import { Editor } from "@omidtz/react-editor";

export default function App() {
  return (
    <Editor />
  );
}
```

---

# Basic Example

```jsx
import { Editor } from "@omidtz/react-editor";

function App() {

  const handleChange = ({ html, json }) => {
    console.log(html);
    console.log(json);
  };

  return (
    <Editor
      placeholder="Start writing..."
      onChange={handleChange}
    />
  );
}

export default App;
```

---

# Image Upload

The editor does not upload images by itself.

You provide an upload function and return the final image URL.

```jsx
<Editor
  onImageUpload={async (file) => {

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    return data.url;

  }}
/>
```

After the Promise resolves, the editor automatically inserts the image.

---

# File Upload

```jsx
<Editor
  onFileUpload={async(file)=>{

      const result = await uploadFile(file);

      return {
          url:result.url,
          name:result.name,
          size:result.size
      }

  }}
/>
```

---

# Themes

```jsx
<Editor theme="light" />
```

```jsx
<Editor theme="dark" />
```

---

# RTL

```jsx
<Editor direction="rtl" />
```

---

# LTR

```jsx
<Editor direction="ltr" />
```

---

# Read Only

```jsx
<Editor readOnly />
```

---

# Auto Save

```jsx
<Editor autoSave />
```

---

# Placeholder

```jsx
<Editor placeholder="Write your article..." />
```

---

# Props

| Prop          | Type         | Default | Description           |
| ------------- | ------------ | ------- | --------------------- |
| value         | string       | ""      | Initial content       |
| placeholder   | string       | ""      | Placeholder text      |
| theme         | light | dark | light   | Editor theme          |
| direction     | rtl | ltr    | ltr     | Text direction        |
| readOnly      | boolean      | false   | Read-only mode        |
| autoSave      | boolean      | false   | Enable auto save      |
| onChange      | function     | —       | Returns HTML and JSON |
| onImageUpload | function     | —       | Upload image callback |
| onFileUpload  | function     | —       | Upload file callback  |

---

# onChange

```jsx
const handleChange = ({ html, json }) => {

    console.log(html);

    console.log(json);

}
```

---

# HTML Output

```html
<h1>Hello World</h1>

<p>This is a paragraph.</p>

<ul>
  <li>React</li>
  <li>Lexical</li>
</ul>

<blockquote>
A beautiful editor.
</blockquote>

<figure>
    <img src="/image.jpg" alt="Image" />
    <figcaption>Image Caption</figcaption>
</figure>
```

---

# JSON Output

```json
{
  "root": {
    "children": []
  }
}
```

---

# Browser Support

* Chrome
* Firefox
* Safari
* Edge

---

# Requirements

* React 18+
* React 19+
* Node.js 18+

---

# Works With

* React
* Next.js
* Vite
* Remix
* Create React App

---

# Bundle

Optimized for production.

* Tree Shaking
* Code Splitting
* Lazy Loading
* Dynamic Imports

---

# Accessibility

* Keyboard Navigation
* ARIA Labels
* Screen Reader Friendly
* Focus Management

---

# Roadmap

* AI Writing Assistant
* Comments
* Collaboration
* Revision History
* Plugin API
* Custom Toolbar
* Custom Nodes

---

# Contributing

Contributions, issues and feature requests are welcome.

Feel free to open an issue or submit a pull request.

---

# License

MIT License

---

# Author

Developed with ❤️ by **Omid Taziki**

GitHub:
https://github.com/OmideDev

npm:
https://www.npmjs.com/package/@omidtz/react-editor
