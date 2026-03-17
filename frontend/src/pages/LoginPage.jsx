import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "var(--bg, #0f0a1e)"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "400px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ color: "#a78bfa", fontSize: "1.8rem", margin: 0 }}>ResumeAI</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
            {isSignup ? "Create your account" : "Welcome back"}
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "8px", padding: "0.75rem", color: "#f87171",
            fontSize: "0.85rem", marginBottom: "1rem"
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email" placeholder="Email" value={email}
            onChange={(e) => setEmail(e.target.value)} required
            style={{
              width: "100%", padding: "0.75rem", marginBottom: "0.75rem",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px", color: "#fff", fontSize: "0.95rem", boxSizing: "border-box"
            }}
          />
          <input
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)} required
            style={{
              width: "100%", padding: "0.75rem", marginBottom: "1rem",
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "8px", color: "#fff", fontSize: "0.95rem", boxSizing: "border-box"
            }}
          />
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "0.75rem", background: "#7c3aed",
            border: "none", borderRadius: "8px", color: "#fff",
            fontSize: "1rem", fontWeight: "500", cursor: "pointer"
          }}>
            {loading ? "Please wait..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: "center", margin: "1rem 0", color: "rgba(255,255,255,0.3)" }}>or</div>

        <button onClick={handleGoogle} style={{
          width: "100%", padding: "0.75rem", background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
          color: "#fff", fontSize: "0.95rem", cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", gap: "0.5rem"
        }}>
          <span>Continue with Google</span>
        </button>

        <p style={{ textAlign: "center", marginTop: "1.5rem", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
          {isSignup ? "Already have an account? " : "Don't have an account? "}
          <span onClick={() => setIsSignup(!isSignup)} style={{ color: "#a78bfa", cursor: "pointer" }}>
            {isSignup ? "Sign In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}
