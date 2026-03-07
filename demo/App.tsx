import { useCallback, useMemo, useRef, useState } from "react";
import {
  ToastProvider,
  useToast,
  type ToastAnimation,
  type ToastPosition,
  type ToastType
} from "toast-ninja";
import "./demo.css";

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPES: ToastType[]     = ["success", "error", "info", "warning"];
const POSITIONS: ToastPosition[] = ["top-right", "top-left", "bottom-right", "bottom-left"];
const ANIMATIONS: ToastAnimation[] = ["slide", "fade"];

// ─── useCopy ──────────────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const copy = useCallback((text: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    });
  }, []);

  return { copied, copy };
}

// ─── CodeBlock ────────────────────────────────────────────────────────────────

function highlight(raw: string): string {
  let s = raw.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // strings first (to avoid re-highlighting their contents)
  s = s.replace(/`([^`]*)`/g, "`<span class='tok-s'>$1</span>`");
  s = s.replace(/"([^"]*)"/g, '"<span class="tok-s">$1</span>"');
  s = s.replace(/'([^']*)'/g, "'<span class=\"tok-s\">$1</span>'");
  // numbers
  s = s.replace(/\b(\d+)\b/g, "<span class='tok-n'>$1</span>");
  // keywords
  s = s.replace(
    /\b(import|export|from|const|let|function|return|type|void|async|await|new|Promise|true|false)\b/g,
    "<span class='tok-k'>$1</span>"
  );
  // JSX component names
  s = s.replace(/(&lt;\/?)(([A-Z][A-Za-z]*))/g, "$1<span class='tok-c'>$2</span>");
  // comments
  s = s.replace(/(\/\/[^\n]*)/g, "<span class='tok-cmnt'>$1</span>");

  return s;
}

function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  const { copied, copy } = useCopy();
  const html = useMemo(() => highlight(code), [code]);

  return (
    <div className="code-block">
      <div className="code-block-bar">
        <span className="code-lang">{lang}</span>
        <button
          type="button"
          className={`copy-btn${copied ? " copied" : ""}`}
          onClick={() => copy(code)}
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
              Copied
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="code-pre" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

// ─── PillGroup ────────────────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options,
  value,
  onChange,
  colorType
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  colorType?: boolean;
}) {
  return (
    <div className="pill-group">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          data-active={value === opt ? "true" : undefined}
          data-type={colorType ? opt : undefined}
          className={`pill${value === opt ? " active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── DurationSlider ───────────────────────────────────────────────────────────

const TICKS = [500, 1000, 2000, 4000, 6000, 8000];

function DurationSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const pct = ((value - 500) / 7500) * 100;

  return (
    <div>
      <div className="slider-row">
        <div className="slider-track">
          {/* Filled portion */}
          <div
            className="slider-fill"
            style={{ width: `${pct}%` }}
          />
          <input
            type="range"
            className="slider-input"
            min={500}
            max={8000}
            step={100}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
        <span className="slider-value">
          {value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}s` : `${value}ms`}
        </span>
      </div>
      <div className="slider-ticks">
        {TICKS.map((t) => (
          <span key={t} className="slider-tick">
            {t >= 1000 ? `${t / 1000}s` : `${t}ms`}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Code snippet ─────────────────────────────────────────────────────────────

function buildSnippet(
  type: ToastType,
  position: ToastPosition,
  animation: ToastAnimation,
  duration: number
) {
  return `// Wrap your app once
import { ToastProvider, useToast } from 'toast-ninja';

function App() {
  return (
    <ToastProvider
      position="${position}"
      animation="${animation}"
      duration={${duration}}
    >
      <YourApp />
    </ToastProvider>
  );
}

// Then call from your component
function Component() {
  const { showToast, toast } = useToast();

  // Simple toast
  showToast({ message: 'It works!', type: '${type}' });

  // Promise toast
  const data = fetch('/api/data');
  await toast.promise(data, {
    loading: 'Fetching...',
    success: 'Loaded!',
    error: 'Failed',
  });
}`;
}

// ─── FirePanel (needs toast context) ─────────────────────────────────────────

function FirePanel({
  type, position, animation, duration
}: { type: ToastType; position: ToastPosition; animation: ToastAnimation; duration: number }) {
  const { showToast, toast } = useToast();

  const fire = () =>
    showToast({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} · ${position} · ${animation}`,
      type,
      duration
    });

  const firePromise = () => {
    const req = new Promise<string>((resolve) =>
      setTimeout(() => resolve("Promise resolved successfully"), 1200)
    );
    void toast.promise(req, {
      loading: "Running promise...",
      success: (v) => v,
      error: "Promise rejected"
    });
  };

  return (
    <div className="action-row">
      <button type="button" className="btn btn-primary" onClick={fire}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        Fire toast
      </button>
      <button type="button" className="btn btn-ghost" onClick={firePromise}>
        Promise toast
      </button>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [type, setType]           = useState<ToastType>("success");
  const [position, setPosition]   = useState<ToastPosition>("top-right");
  const [animation, setAnimation] = useState<ToastAnimation>("slide");
  const [duration, setDuration]   = useState(2000);
  const [theme, setTheme]         = useState<"dark" | "light">("dark");

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const snippet = useMemo(
    () => buildSnippet(type, position, animation, duration),
    [type, position, animation, duration]
  );

  return (
    <ToastProvider
      duration={duration}
      position={position}
      animation={animation}
      theme={theme}
    >
      <div className="demo-root" data-theme={theme}>

        {/* Theme toggle — fixed top-right */}
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === "dark" ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              Light
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Dark
            </>
          )}
        </button>

        <div className="demo-container">

          {/* Header */}
          <header className="demo-header">
            <div className="demo-eyebrow">
              <span className="eyebrow-dot" />
              Interactive playground
            </div>
            <h1 className="demo-title">toast‑ninja</h1>
            <p className="demo-desc">
              Zero-dependency toast notifications for React.
              Lightweight, accessible, and easy to drop in.
            </p>
            <CodeBlock code="npm install toast-ninja" lang="bash" />
          </header>

          <div className="demo-divider" />

          {/* Config */}
          <section className="demo-section">
            <h2 className="section-label">Configure</h2>

            <div className="config-block">
              <span className="config-key">Type</span>
              <PillGroup options={TYPES} value={type} onChange={setType} colorType />
            </div>

            <div className="config-block">
              <span className="config-key">Position</span>
              <PillGroup options={POSITIONS} value={position} onChange={setPosition} />
            </div>

            <div className="config-block">
              <span className="config-key">Animation</span>
              <PillGroup options={ANIMATIONS} value={animation} onChange={setAnimation} />
            </div>

            <div className="config-block">
              <span className="config-key">Duration</span>
              <DurationSlider value={duration} onChange={setDuration} />
            </div>
          </section>

          <div className="demo-divider" />

          {/* Try */}
          <section className="demo-section">
            <h2 className="section-label">Try it</h2>
            <FirePanel type={type} position={position} animation={animation} duration={duration} />
          </section>

          <div className="demo-divider" />

          {/* Code */}
          <section className="demo-section">
            <h2 className="section-label">Your code</h2>
            <p className="section-desc">Updates live as you change the config above.</p>
            <CodeBlock code={snippet} lang="tsx" />
          </section>

          {/* Footer */}
          <footer className="demo-footer">
            Made with care · MIT ·{" "}
            <a href="https://github.com/saurabhjaykar1603/toast-ninja" target="_blank" rel="noreferrer">GitHub</a>
            {" · "}
            <a href="https://www.linkedin.com/in/saurabh-jaykar/" target="_blank" rel="noreferrer">LinkedIn</a>
            {" · "}
            <a href="https://www.npmjs.com/package/toast-ninja" target="_blank" rel="noreferrer">npm</a>
          </footer>

        </div>
      </div>
    </ToastProvider>
  );
}
