import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile, updatePassword } from "firebase/auth";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [stats, setStats] = useState({ total: 0, avgScore: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const initials = (user?.displayName || user?.email || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    const fetchStats = async () => {
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) setStats(snap.data().stats || { total: 0, avgScore: 0 });
    };
    fetchStats();
  }, [user]);

  const saveProfile = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateProfile(user, { displayName });
      await setDoc(doc(db, "users", user.uid), { displayName, email: user.email }, { merge: true });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await updatePassword(user, newPassword);
      setMessage("Password changed successfully!");
      setNewPassword("");
    } catch (err) {
      setMessage("Error: " + err.message);
    }
    setSaving(false);
  };

  const card = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem"
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: "0 1rem" }}>

      {/* Avatar + Info */}
      <div style={{ ...card, display: "flex", alignItems: "center", gap: "1.5rem" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0
        }}>{initials}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>
            {user?.displayName || "User"}
          </div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginTop: 4 }}>
            {user?.email}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#a78bfa" }}>{stats.total}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Analyses</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#a78bfa" }}>{stats.avgScore}%</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Avg Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Name */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
          Display Name
        </div>
        <input
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          style={{
            width: "100%", padding: "0.75rem",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8, color: "#fff", fontSize: 14,
            boxSizing: "border-box", marginBottom: 12
          }}
        />
        <button onClick={saveProfile} disabled={saving} style={{
          background: "#7c3aed", border: "none", borderRadius: 8,
          padding: "0.6rem 1.5rem", color: "#fff", fontSize: 14,
          fontWeight: 500, cursor: "pointer"
        }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Change Password */}
      {user?.providerData?.[0]?.providerId === "password" && (
        <div style={card}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
            Change Password
          </div>
          <input
            type="password" value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password (min 6 characters)"
            style={{
              width: "100%", padding: "0.75rem",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, color: "#fff", fontSize: 14,
              boxSizing: "border-box", marginBottom: 12
            }}
          />
          <button onClick={changePassword} disabled={saving} style={{
            background: "#4f46e5", border: "none", borderRadius: 8,
            padding: "0.6rem 1.5rem", color: "#fff", fontSize: 14,
            fontWeight: 500, cursor: "pointer"
          }}>
            Update Password
          </button>
        </div>
      )}

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes("Error") ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
          border: `1px solid ${message.includes("Error") ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`,
          borderRadius: 8, padding: "0.75rem",
          color: message.includes("Error") ? "#f87171" : "#4ade80",
          fontSize: 14, marginBottom: "1rem"
        }}>{message}</div>
      )}

      {/* Logout */}
      <button onClick={logout} style={{
        width: "100%", padding: "0.75rem",
        background: "rgba(239,68,68,0.1)",
        border: "1px solid rgba(239,68,68,0.3)",
        borderRadius: 8, color: "#f87171",
        fontSize: 14, fontWeight: 500, cursor: "pointer"
      }}>
        Logout
      </button>

    </div>
  );
}
