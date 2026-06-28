import { Component, type ReactNode } from "react";

/**
 * App-wide safety net. If any page throws during render, show a branded
 * fallback instead of a blank white screen. Admin pages keep their own
 * finer-grained AdminErrorBoundary inside this one.
 */
export default class RootErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    console.error("[ui] Render error:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          background: "#F6F2E9",
          color: "#2E2A25",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: 24,
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 22, margin: 0, fontWeight: 700 }}>Bir xəta baş verdi</h1>
        <p style={{ maxWidth: 440, margin: 0, opacity: 0.8, lineHeight: 1.6 }}>
          Səhifə yüklənərkən problem yarandı. Zəhmət olmasa yenidən cəhd edin.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: "10px 22px", background: "#9D7C38", color: "#fff", border: 0, borderRadius: 10, fontWeight: 600, cursor: "pointer" }}
          >
            Yenilə
          </button>
          <a
            href="/"
            style={{ padding: "10px 22px", background: "transparent", color: "#9D7C38", border: "1px solid #9D7C38", borderRadius: 10, fontWeight: 600, textDecoration: "none" }}
          >
            Ana səhifə
          </a>
        </div>
      </div>
    );
  }
}
