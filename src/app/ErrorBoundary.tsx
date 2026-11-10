import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#161920',
            color: '#f0f3f6',
            padding: '24px',
            fontFamily: 'monospace',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              maxWidth: '680px',
              width: '100%',
              background: '#20242e',
              border: '1px solid #e5534b',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <h2 style={{ color: '#ff7b72', marginBottom: '12px' }}>Simulation or Render Error</h2>
            <p style={{ marginBottom: '16px', color: '#c9d1d9', fontSize: '14px' }}>
              Creaturebound encountered an unexpected error during scene initialization or rendering.
            </p>
            <pre
              style={{
                background: '#0d1117',
                padding: '12px',
                borderRadius: '6px',
                overflowX: 'auto',
                fontSize: '12px',
                color: '#ff7b72',
                marginBottom: '16px',
                whiteSpace: 'pre-wrap',
                maxHeight: '200px',
              }}
            >
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={this.handleReload}
              style={{
                background: '#238636',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              Restart Simulation
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
