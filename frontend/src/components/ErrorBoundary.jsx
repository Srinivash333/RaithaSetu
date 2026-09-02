import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs space-y-1">
          <p className="font-extrabold">Section temporarily unavailable.</p>
          <p className="text-[11px] font-medium">{this.state.error?.message || 'A render error occurred in this section.'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
