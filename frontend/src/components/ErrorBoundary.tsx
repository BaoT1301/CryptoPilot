import React from "react";

type Props = { children: React.ReactNode };
type State = { error: Error | null };

/**
 * Catches render-time errors anywhere below it.
 *
 * Without a boundary, a single TypeError during render unmounts the entire
 * React tree and the visitor gets a blank white page with no explanation --
 * header and footer included. This converts that into a styled message with a
 * way to recover.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center space-y-5">
          <h1 className="text-2xl font-semibold text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground">
            This page hit an unexpected error. Reloading usually fixes it.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
            >
              Reload page
            </button>
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.assign("/");
              }}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition"
            >
              Go home
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-4 text-left text-xs text-destructive whitespace-pre-wrap break-words">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
