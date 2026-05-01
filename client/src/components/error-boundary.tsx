import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Caught render error:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              We hit an unexpected error rendering this page. You can try again, or
              reload the site.
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-sm font-medium rounded-md bg-teal-600 text-white hover:bg-teal-700"
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Reload
              </button>
            </div>
            {import.meta.env.DEV && (
              <pre className="mt-4 text-xs text-left bg-gray-100 p-2 rounded overflow-auto max-h-48">
                {this.state.error.message}
                {"\n"}
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
