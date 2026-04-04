import { useState } from "react";
import { supabase, supabaseUrl, Logo } from "../shared/aquaCore";

export default function AuthPage({ onAuth, initialMode = "login", onBack }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      let result;
      
      if (mode === "login") {
        result = await supabase.auth.signInWithPassword({ email, password });
        
        if (result.error) {
          // Handle specific Supabase errors
          if (result.error.message.includes("Email not confirmed")) {
            setError("Please confirm your email address. Check your inbox for the confirmation link.");
            setLoading(false);
            return;
          }
          throw result.error;
        }
        
        // Successful login
        onAuth(result.data.user || result.data.session?.user);
        
      } else {
        // Sign up mode
        result = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: `${window.location.origin}`,
          }
        });
        
        if (result.error) throw result.error;
        
        // Check if email confirmation is required
        if (result.data.user && !result.data.session) {
          setSuccess("Account created! Please check your email to confirm your account before signing in.");
          setEmail("");
          setPassword("");
          setMode("login");
          setLoading(false);
          return;
        }
        
        // If auto-confirmed (less common)
        if (result.data.session) {
          onAuth(result.data.user);
        }
      }
      
    } catch (e) {
      console.error("Auth error:", e);
      
      // Handle network errors or when Supabase is not configured
      if (e.message?.includes("fetch") || e.message?.includes("Failed") || supabaseUrl.includes("placeholder")) {
        // Demo fallback mode
        setSuccess("Demo mode activated! Logging in...");
        setTimeout(() => {
          onAuth({ id: "demo-user", email });
        }, 1000);
      } else {
        setError(e.message || "An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B3D91] via-[#1565C0] to-[#0288D1] flex items-center justify-center px-4 relative">
      {/* Back Button */}
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium text-sm">Back to Home</span>
        </button>
      )}

      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Logo size={42} />
          <div>
            <p className="font-bold text-xl text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>ikanDoiT</p>
            <p className="text-blue-200 text-xs">AquaFarmer Dashboard</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <div className="flex gap-2 bg-slate-100 rounded-xl p-1 mb-6">
            {["login", "signup"].map(m => (
              <button 
                key={m} 
                onClick={() => {
                  setMode(m);
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === m ? "bg-white shadow text-[#0B3D91]" : "text-slate-500 hover:text-slate-700"}`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed" 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-[#1565C0] focus:ring-2 focus:ring-blue-100 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
                onKeyDown={e => e.key === "Enter" && !loading && handleSubmit()} 
              />
              {mode === "signup" && (
                <p className="text-xs text-slate-500 mt-1.5">Minimum 6 characters</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <p className="text-emerald-700 text-sm font-medium">{success}</p>
              </div>
            )}

            <button 
              onClick={handleSubmit} 
              disabled={loading || !email || !password}
              className="w-full py-3.5 rounded-xl bg-[#0B3D91] text-white font-bold text-sm hover:bg-[#1565C0] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Please wait…
                </span>
              ) : (
                mode === "login" ? "Sign In →" : "Create Account →"
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-center text-xs text-slate-500">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button 
                    onClick={() => {
                      setMode("signup");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-[#0B3D91] font-semibold hover:underline"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button 
                    onClick={() => {
                      setMode("login");
                      setError("");
                      setSuccess("");
                    }}
                    className="text-[#0B3D91] font-semibold hover:underline"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
