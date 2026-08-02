import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Orion View Error Caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-[#111622] rounded-2xl border border-red-500/20 text-center space-y-4 my-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {this.props.fallbackTitle || 'Module Runtime Exception'}
            </h3>
            <p className="text-sm text-gray-400 max-w-md mt-1">
              An unexpected error occurred while rendering this module view.
            </p>
          </div>
          {this.state.error && (
            <pre className="text-xs font-mono bg-black/40 text-red-300 p-3 rounded-lg max-w-xl overflow-x-auto text-left w-full border border-red-500/10">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-blue-500/20"
          >
            <RefreshCw className="w-4 h-4" />
            Reload Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
