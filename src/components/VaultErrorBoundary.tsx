import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class VaultErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Vault Error Boundary caught an exception:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950 text-white select-none">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 backdrop-blur-2xl shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-cyan-400" /> Vault Security Shield
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                An unexpected exception was caught by Memory Vault's protection layer. Your encrypted vault memories remain safe in cloud storage.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/20 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-24">
              {this.state.error?.message || 'Unknown WebGL rendering exception'}
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Restore & Reload Vault Session
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
