import React from "react";
import { AlertTriangle, RefreshCcw, Home, ShieldAlert } from "lucide-react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Platform Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-6 font-inter">
          <div className="max-w-xl w-full bg-white rounded-[48px] shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 group">
                <ShieldAlert className="text-red-500 group-hover:rotate-12 transition-transform" size={48} />
              </div>
              
              <h1 className="text-4xl font-black text-[#262626] tracking-tighter mb-4">
                platform_crash_detected
              </h1>
              
              <p className="text-gray-400 font-medium leading-relaxed mb-10 px-4">
                A critical logic exception has interrupted the operational flow. 
                Our monitoring systems have been notified of this node failure.
              </p>

              <div className="bg-gray-50 rounded-3xl p-6 mb-10 text-left border border-gray-100 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></div>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Diagnostic Reference</span>
                </div>
                <code className="text-[11px] font-mono text-gray-600 block break-all opacity-70">
                    {this.state.error?.toString() || "Unknown Operational Exception"}
                </code>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-[#262626] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#FF9500] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10"
                >
                  <RefreshCcw size={18} />
                  Restart Module
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-white border border-gray-100 text-[#262626] py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
                >
                  <Home size={18} />
                  Return to Home
                </button>
              </div>
            </div>
            <div className="bg-gray-50/50 py-4 border-t border-gray-100 text-center">
                <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">LevelUp_Hub Security Protocol v2.4</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
