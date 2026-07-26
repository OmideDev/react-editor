# @omidtz/react-editor

A modern Lexical-based rich text editor for React.

**v0.2.1** · React 18 / 19 · JavaScript & TypeScript · Vite · Next.js · SSR-friendly

```bash
npm install @omidtz/react-editor
```

```jsx
import { Editor } from "@omidtz/react-editor";

export default function App() {
  return <Editor direction="rtl" onChange={({ html, json }) => console.log(html, json)} />;
}
```

Styles load automatically with the package import. Optional explicit import:

```js
import "@omidtz/react-editor/style.css";
```

---

## Features

### Editing
- Headings H1–H6, paragraph
- Bold, italic, underline, strikethrough
- Text color, highlight, background color
- Bullet / numbered / checklist
- Quote, divider, links
- Undo / redo
- Slash commands (`/`)
- Markdown shortcuts (`# `, `## `, `> `, `- `, `1. `, `` ``` ``, `**bold**`, `_italic_`)
- Mentions (`@`)
- Emoji picker
- Code blocks
- Tables (insert, add/delete rows & columns)
- File attachments (PDF, DOC, DOCX, ZIP, TXT)
- Video embed (YouTube, Vimeo, generic embed URL)

### Media
- **Media Library** (WordPress-style): Library + Upload tabs, search, details (title / alt), delete, insert
- Local browser storage by default
- Optional `onImageUpload` / `onFileUpload` for your API
- Image resize & caption in the editor

### UX / UI
- Responsive toolbar (desktop / tablet / mobile)
- Mobile sticky toolbar + More menu
- **RTL / LTR toggle** in the toolbar (desktop & mobile)
- Direction-aware placeholder: RTL → `بنویسید` · LTR → `Write`
- Light / dark / custom theme (CSS variables)
- Loading overlay
- Auto-save with status indicator
- Word / character count & reading time
- Character limit (`maxCharacters`)
- Floating UI tooltips
- Keyboard navigation & ARIA

### Output
- Semantic HTML (`h1–h6`, `p`, `ul`/`ol`, `blockquote`, `a`, `img`/`figure`, `table`, …)
- Lexical JSON
- `onChange({ html, json })`

---

## Quick start

```jsx
import { Editor } from "@omidtz/react-editor";

function App() {
  return (
    <Editor
      direction="rtl"
      theme="light"
      onChange={({ html, json }) => {
        // persist html / json
      }}
    />
  );
}
```

---

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `object \| string \| null` | — | Initial Lexical JSON (or HTML string) |
| `placeholder` | `string` | auto | Custom placeholder; if omitted, uses `بنویسید` (RTL) or `Write` (LTR) |
| `theme` | `"light" \| "dark" \| object` | `"light"` | Theme preset or custom tokens (`primary`, `radius`, `mode`, …) |
| `direction` | `"ltr" \| "rtl" \| "auto"` | `"ltr"` | Initial text direction (toggleable in toolbar) |
| `loading` | `boolean` | `false` | Full-surface loading overlay |
| `loadingLabel` | `string` | `"Loading…"` | Overlay label |
| `onChange` | `({ html, json }) => void` | — | Fires on every content update |
| `onJSONChange` | `(json) => void` | — | JSON-only callback |
| `onHTMLChange` | `(html) => void` | — | HTML-only callback |
| `autoSave` | `{ enabled?, delay?, onSave }` | — | Debounced save (see below) |
| `mentions` | `{ id, name, username }[]` | `[]` | Users for `@` mention menu |
| `maxCharacters` | `number` | — | Soft character limit + stats display |
| `video` | `boolean` | `true` | Enable video paste/embed |
| `files` | `boolean` | `true` | Enable file attachments |
| `showStats` | `boolean` | `true` | Word / character / reading-time bar |
| `onImageUpload` | `(file) => Promise<string>` | — | Returns image URL for Media Library uploads |
| `onFileUpload` | `(file) => Promise<string \| FileInfo>` | — | Returns URL or file info |
| `toolbar` | `ReactNode \| false` | default | Custom toolbar or `false` to hide |
| `mobileToolbar` | `ReactNode \| false` | default | Custom mobile toolbar or `false` |
| `className` | `string` | — | Container class |
| `contentClassName` | `string` | — | ContentEditable class |

---

## Examples

### Controlled / persisted content

```jsx
<Editor
  value={savedJson}
  onChange={({ json, html }) => {
    localStorage.setItem("doc", JSON.stringify(json));
  }}
/>
```

### Auto save

```jsx
<Editor
  autoSave={{
    enabled: true,
    delay: 2000,
    onSave: async ({ json, html }) => {
      await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json, html }),
      });
    },
  }}
/>
```

Shows **Saving… / Saved / error** in the editor chrome.

### Theme

```jsx
<Editor theme="dark" />

<Editor
  theme={{
    mode: "light",
    primary: "#6366f1",
    radius: "12px",
  }}
/>
```

### Direction (RTL / LTR)

```jsx
<Editor direction="rtl" />
<Editor direction="ltr" />
```

Users can also toggle **RTL ↔ LTR** from the first control in the toolbar. Placeholder updates automatically unless you pass a custom `placeholder`.

### Mentions

```jsx
<Editor
  mentions={[
    { id: 1, name: "Omid", username: "omid" },
    { id: 2, name: "Admin", username: "admin" },
  ]}
/>
```

Type `@` to open the mention menu (search + keyboard navigation).

### Character limit & stats

```jsx
<Editor maxCharacters={5000} showStats />
```

### Image upload (Media Library → your API)

By default, images stay in the browser (`localStorage` media library). Wire your server like this:

```jsx
<Editor
  onImageUpload={async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();
    return data.url; // Promise<string>
  }}
/>
```

**Flow:** Toolbar Image → Media Library → Upload or pick existing → Insert into editor.

### File upload

```jsx
<Editor
  onFileUpload={async (file) => {
    const uploaded = await uploadFile(file);
    return {
      src: uploaded.url,
      name: uploaded.name,
      size: uploaded.size,
      mimeType: uploaded.mimeType,
    };
  }}
/>
```

Or return a plain URL string.

### Video

Paste a YouTube / Vimeo (or embed) URL — it becomes a responsive video block (replace / remove supported).

Disable with `video={false}`.

### Slash commands

Type `/` for: Heading 1–2, lists, checklist, quote, divider, image, table, code block.

### Markdown shortcuts

While typing: `# `, `## `, `> `, `- `, `1. `, fenced code, `**bold**`, `_italic_`.

---

## Public API

### Main

```js
import {
  Editor,
  EditorProvider,
  Toolbar,
  exportJSON,
  exportHTML,
  exportEditorValue,
  importJSON,
  importHTML,
  importEditorValue,
} from "@omidtz/react-editor";
```

### Hooks & theme (advanced)

Also exported: `useEditorCommands`, `useEditorValue`, `useTheme`, `useDirection`, `useAutoSave`, plugins, nodes, and utils for extension.

---

## HTML output (example)

```html
<h1>Hello</h1>
<p>Paragraph with <strong>bold</strong> and <em>italic</em>.</p>
<ul>
  <li>Item</li>
</ul>
<blockquote>Quote</blockquote>
<figure>
  <img src="https://cdn.example.com/a.jpg" alt="Demo" />
</figure>
```

---

## Framework notes

| Environment | Notes |
| --- | --- |
| **Vite** | Works out of the box |
| **Next.js** | Use in Client Components (`"use client"`). CSS auto-imports; if needed: `import "@omidtz/react-editor/style.css"` |
| **CRA / Remix** | Supported as a normal React dependency |
| **SSR** | Editor UI is client-side; avoid calling browser-only APIs at import time |

Peer dependencies: `react` and `react-dom` `>=18`.

---

## Development (this repo)

```bash
npm install
npm run dev          # playground
npm run build        # library → dist/
npm run build:demo   # demo app → dist-demo/
```

---

## Roadmap

- Server-backed Media Library adapters (folders, pagination API)
- Collaboration / comments
- Revision history
- Stronger public plugin API
- Official TypeScript `.d.ts` packaging polish

---

## License

MIT

## Author

**Omid Taziki**

- GitHub: [https://github.com/OmideDev](https://github.com/OmideDev)
- npm: [https://www.npmjs.com/package/@omidtz/react-editor](https://www.npmjs.com/package/@omidtz/react-editor)
