# toast-ninja

A lightweight, customizable React toast notification library built with TypeScript.

[![npm](https://img.shields.io/npm/v/toast-ninja)](https://www.npmjs.com/package/toast-ninja)
[![license](https://img.shields.io/npm/l/toast-ninja)](./LICENSE)

**[Live Demo →](https://toast-ninja.vercel.app/)** | **[NPM →](https://www.npmjs.com/package/toast-ninja)** | **[GitHub →](https://github.com/saurabhjaykar1603/toast-ninja)**

## Installation

```bash
npm install toast-ninja
```

## Quick Start

Wrap your app with `ToastProvider`, then use the `useToast` hook anywhere inside it.

```tsx
import { ToastProvider, useToast } from "toast-ninja";

function DemoButton() {
  const { showToast } = useToast();

  return (
    <button
      onClick={() =>
        showToast({ message: "Saved successfully!", type: "success" })
      }
    >
      Show Toast
    </button>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <DemoButton />
    </ToastProvider>
  );
}
```
Default styles are included automatically by the package build.

## Toast Types

```tsx
showToast({ message: "Success!", type: "success" });
showToast({ message: "Oops!",    type: "error" });
showToast({ message: "Heads up", type: "warning" });
showToast({ message: "FYI",      type: "info" });
```

## Promise Toast

```tsx
const { toast } = useToast();

toast.promise(fetchData(), {
  loading: "Loading...",
  success: "Data loaded!",
  error: "Something went wrong",
});
```

## Configuration

```tsx
<ToastProvider
  duration={3000}
  position="top-right"
  animation="slide"
  theme="dark"
  maxVisibleToasts={4}
>
  <App />
</ToastProvider>
```

| Option               | Type                                                              | Default       |
| -------------------- | ----------------------------------------------------------------- | ------------- |
| `duration`           | `number`                                                          | `2000`        |
| `position`           | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left"`   | `"top-right"` |
| `animation`          | `"slide" \| "fade"`                                               | `"slide"`     |
| `theme`              | `"auto" \| "light" \| "dark"`                                     | `"auto"`      |
| `maxVisibleToasts`   | `number`                                                          | `4`           |

## Custom Styling

Override CSS variables to match your brand:

```css
:root {
  --toast-success: #15803d;
  --toast-error:   #b91c1c;
  --toast-warning: #b45309;
  --toast-info:    #0369a1;
  --toast-bg:      #111827;
  --toast-text:    #f8fafc;
}
```

## License

MIT
