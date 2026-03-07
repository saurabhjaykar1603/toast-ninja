# toast-ninja

`toast-ninja` is a lightweight, customizable React toast notification library built with TypeScript.

## Features

- Typed React API
- Toast provider + hook (`ToastProvider`, `useToast`)
- Toast types: `success`, `error`, `warning`, `info`
- Custom duration, position, and animation
- Auto dismiss with queue support
- Promise-based toasts
- CSS variables for easy theme customization

## Installation

```bash
npm install toast-ninja
```

## Quick Start

```tsx
import { ToastProvider, useToast } from "toast-ninja";

function DemoButton() {
  const { showToast } = useToast();

  return (
    <button
      onClick={() =>
        showToast({
          message: "Saved successfully",
          type: "success"
        })
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

## Promise Toasts

```tsx
const { toast } = useToast();

toast.promise(fetchData(), {
  loading: "Loading...",
  success: "Data loaded",
  error: "Failed"
});
```

## Configuration

```tsx
<ToastProvider
  duration={2000}
  position="top-right"
  animation="slide"
  maxVisibleToasts={4}
>
  <App />
</ToastProvider>
```

| Option             | Type                                                | Default     |
| ------------------ | --------------------------------------------------- | ----------- |
| `duration`         | `number`                                            | `2000`      |
| `position`         | `"top-right" \| "top-left" \| "bottom-right" \| "bottom-left"` | `top-right` |
| `animation`        | `"slide" \| "fade"`                                 | `slide`     |
| `maxVisibleToasts` | `number`                                            | `4`         |

## Styling

Override CSS variables in your app:

```css
:root {
  --toast-success: #15803d;
  --toast-error: #b91c1c;
  --toast-warning: #b45309;
  --toast-info: #0369a1;
  --toast-bg: #111827;
  --toast-text: #f8fafc;
}
```

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

- Library output: `dist/`
- Demo output: `demo-dist/`

## Testing

```bash
npm run test
```

Test coverage includes:

1. Provider render
2. Triggered toast render
3. Auto-remove behavior
4. Multiple stacked toasts
5. Type rendering
6. Queue behavior

## Project Structure

```text
toast-ninja
├─ src
│  ├─ components
│  │  ├─ Toast.tsx
│  │  ├─ ToastContainer.tsx
│  ├─ context
│  │  ├─ ToastContext.tsx
│  ├─ hooks
│  │  ├─ useToast.ts
│  ├─ types
│  │  ├─ toast.types.ts
│  ├─ styles
│  │  ├─ toast.css
│  └─ index.ts
├─ tests
│  ├─ toast.test.tsx
├─ demo
│  ├─ App.tsx
│  └─ main.tsx
├─ package.json
├─ tsconfig.json
├─ vite.config.ts
└─ README.md
```

## Publish to npm

```bash
npm login
npm run build:lib
npm publish
```

`package.json` is configured with `main`, `module`, `types`, and `exports` for npm publishing.

## License

MIT

## Support

If you like `toast-ninja`, consider starring the repository.
