import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props { children: ReactNode; fallback?: ReactNode; section?: string }
interface State { hasError: boolean; error?: Error }

/**
 * AdminErrorBoundary — catches errors in admin sub-pages
 * Prevents a single broken page from crashing the entire admin panel.
 */
export default class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[AdminErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-white text-sm font-medium mb-1">
            {this.props.section
              ? `"${this.props.section}" section is temporarily unavailable.`
              : "This section is temporarily unavailable."}
          </p>
          <p className="text-white/40 text-xs mb-4">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-[#C9A96E] text-[#0A0A0A] rounded-lg text-xs font-bold hover:bg-[#D4A853]"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
