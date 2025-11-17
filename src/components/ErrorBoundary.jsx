import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: "20px",
            background: "#f5f5f5",
          }}
        >
          <h1 style={{ color: "#dc2626", marginBottom: "16px" }}>
            Something went wrong
          </h1>
          <p style={{ color: "#666", marginBottom: "24px" }}>
            The application encountered an error. Please refresh the page or contact support.
          </p>
          <details style={{ whiteSpace: "pre-wrap", maxWidth: "800px" }}>
            <summary style={{ cursor: "pointer", marginBottom: "12px" }}>
              Error Details
            </summary>
            <div
              style={{
                background: "#fee",
                padding: "16px",
                borderRadius: "8px",
                fontSize: "14px",
                fontFamily: "monospace",
                color: "#c33",
              }}
            >
              <p>
                <strong>Error:</strong> {this.state.error && this.state.error.toString()}
              </p>
              <p>
                <strong>Stack:</strong>
              </p>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </div>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "24px",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              background: "#2563eb",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
