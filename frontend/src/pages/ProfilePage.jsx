import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../hooks/useTheme";
import { db } from "../firebase";
import { doc, getDoc, setDoc, collection, query, orderBy, getDocs } from "firebase/firestore";
import { updateProfile, updatePassword, deleteUser } from "firebase/auth";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0, jobsTargeted: 0 });
  const [topSkills, setTopSkills] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [badges, setBadges] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({ displayName: user?.displayName || "", location: "", linkedin: "" });
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const settingsRef = useRef(null);

  const initials = (user?.displayName || user?.email || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setEditForm(f => ({ ...f, displayName: data.displayName || user?.displayName || "", location: data.location || "", linkedin: data.linkedin || "" }));
        }
        const q = query(collection(db, "users", user.uid, "history"), orderBy("created_at", "desc"));
        const snap = await getDocs(q);
        const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (history.length > 0) {
          const scores = history.map(h => h.score);
          const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
          const best = Math.max(...scores);
          const jobs = new Set(history.map(h => h.job_title)).size;
          setStats({ total: history.length, avgScore: avg, bestScore: best, jobsTargeted: jobs });
          const recent = history.slice(0, 3).map(h => ({
            title: h.job_title,
            score: h.score,
            grade: h.grade,
            date: h.created_at?.toDate ? h.created_at.toDate() : new Date()
          }));
          setRecentActivity(recent);
          const skillCount = {};
          history.forEach(h => (h.matched_skills || []).forEach(s => { skillCount[s] = (skillCount[s] || 0) + 1; }));
          const sorted = Object.entries(skillCount).sort((a, b) => b[1] - a[1]).slice(0, 4);
          const max = sorted[0]?.[1] || 1;
          setTopSkills(sorted.map(([skill, count]) => ({ skill, pct: Math.round((count / max) * 100) })));
          const earned = [];
          if (history.length >= 1) earned.push({ icon: "★", label: "First Analysis", color: "#fbbf24", bg: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.2)" });
          if (best >= 80) earned.push({ icon: "↑", label: "High Scorer", color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)" });
          if (history.length >= 5) earned.push({ icon: "◈", label: "Pro Analyzer", color: "#a78bfa", bg: "rgba(124,107,255,0.1)", border: "rgba(124,107,255,0.2)" });
          while (earned.length < 4) earned.push({ icon: "⬡", label: "Locked", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.06)", locked: true });
          setBadges(earned);
        }
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => { if (settingsRef.current && !settingsRef.current.contains(e.target)) setShowSettings(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      await updateProfile(user, { displayName: editForm.displayName });
      await setDoc(doc(db, "users", user.uid), { displayName: editForm.displayName, location: editForm.location, linkedin: editForm.linkedin, email: user.email }, { merge: true });
      setMessage({ text: "Profile updated!", type: "success" });
      setShowEditModal(false);
    } catch (err) { setMessage({ text: "Error: " + err.message, type: "error" }); }
    setSaving(false);
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setMessage({ text: "Min 6 characters required", type: "error" }); return; }
    setSaving(true);
    try {
      await updatePassword(user, newPassword);
      setMessage({ text: "Password changed!", type: "success" });
      setNewPassword(""); setShowPasswordModal(false);
    } catch (err) { setMessage({ text: "Error: " + err.message, type: "error" }); }
    setSaving(false);
  };

  const deleteAccount = async () => {
    try { await deleteUser(user); } 
    catch (err) { setMessage({ text: "Error: " + err.message, type: "error" }); setShowDeleteConfirm(false); }
  };

  const gradeColor = (g) => ({ "Excellent": "#10b981", "Good": "#a78bfa", "Fair": "#fbbf24", "Needs Work": "#f87171" }[g] || "#a78bfa");
  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - date) / 86400000);
    if (diff === 0) return "Today"; if (diff === 1) return "Yesterday"; return `${diff} days ago`;
  };

  const inputStyle = { width: "100%", padding: "0.7rem 0.9rem", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "var(--text)", fontSize: 13, boxSizing: "border-box", marginBottom: 10, fontFamily: "var(--font-body)" };
  const modalStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
  const modalCardStyle = { background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem", width: "100%", maxWidth: 400, margin: "0 1rem" };

  return (
    <div style={{ maxWidth: 720, margin: "1.5rem auto", padding: "0 1rem" }}>

      {/* Cover Banner */}
      <div style={{ background: "linear-gradient(135deg,#1a0a2e,#0a1628,#0f2340)", borderRadius: 16, height: 110, position: "relative", marginBottom: 56 }}>
        <div style={{ position: "absolute", bottom: -40, left: 24, width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", border: "4px solid var(--bg)", flexShrink: 0 }}>{initials}</div>
        <div style={{ position: "absolute", bottom: -44, left: 120 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{user?.displayName || "User"}</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{user?.email}</div>
          <div style={{ display: "flex", gap: 12, marginTop: 5 }}>
            {editForm.location && <span style={{ fontSize: 11, color: "var(--text-3)" }}>📍 {editForm.location}</span>}
            {editForm.linkedin && <span style={{ fontSize: 11, color: "var(--violet-2)", cursor: "pointer" }} onClick={() => window.open("https://" + editForm.linkedin.replace("https://", ""), "_blank")}>in {editForm.linkedin.replace("https://", "").replace("linkedin.com/in/", "")}</span>}
          </div>
        </div>
        {/* Top right buttons */}
        <div style={{ position: "absolute", top: 10, right: 12, display: "flex", gap: 8 }}>
          <button onClick={() => setShowEditModal(true)} style={{ background: "rgba(124,107,255,0.2)", border: "1px solid rgba(124,107,255,0.3)", borderRadius: 8, padding: "5px 12px", color: "#a78bfa", fontSize: 11, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-body)" }}>✎ Edit Profile</button>
          <div ref={settingsRef} style={{ position: "relative" }}>
            <button onClick={() => setShowSettings(s => !s)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, width: 30, height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>⋯</button>
            {showSettings && (
              <div style={{ position: "absolute", top: 34, right: 0, background: "var(--bg-2)", border: "1px solid var(--border-2)", borderRadius: 10, padding: 6, minWidth: 180, zIndex: 100 }}>
                {user?.providerData?.[0]?.providerId === "password" && (
                  <div onClick={() => { setShowPasswordModal(true); setShowSettings(false); }} style={{ padding: "8px 12px", fontSize: 12, color: "var(--text)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>⚿ &nbsp;Change password</div>
                )}
                <div onClick={toggleTheme} style={{ padding: "8px 12px", fontSize: 12, color: "var(--text)", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <span>{theme === "dark" ? "☀️" : "🌙"} &nbsp;{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </div>
                <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                <div onClick={() => { setShowDeleteConfirm(true); setShowSettings(false); }} style={{ padding: "8px 12px", fontSize: 12, color: "#f87171", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>🗑 &nbsp;Delete account</div>
                <div onClick={logout} style={{ padding: "8px 12px", fontSize: 12, color: "#f87171", borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }} onMouseEnter={e => e.currentTarget.style.background = "rgba(248,113,113,0.08)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>⏻ &nbsp;Logout</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{ background: message.type === "error" ? "rgba(248,113,113,0.1)" : "rgba(16,185,129,0.1)", border: `1px solid ${message.type === "error" ? "rgba(248,113,113,0.3)" : "rgba(16,185,129,0.3)"}`, borderRadius: 8, padding: "0.75rem 1rem", color: message.type === "error" ? "#f87171" : "#4ade80", fontSize: 13, marginBottom: "1rem" }}>{message.text}</div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Analyses", value: stats.total, color: "#a78bfa", bg: "rgba(124,107,255,0.1)", border: "rgba(124,107,255,0.2)" },
          { label: "Avg Score", value: stats.avgScore + "%", color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.2)" },
          { label: "Best Score", value: stats.bestScore, color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
          { label: "Jobs Targeted", value: stats.jobsTargeted, color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 10px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Skills + Badges */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1rem" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 12 }}>Top skills</div>
          {topSkills.length === 0 ? <div style={{ fontSize: 12, color: "var(--text-3)" }}>No analyses yet</div> : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {topSkills.map((s, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: "var(--text)" }}>{s.skill}</span>
                    <span style={{ fontSize: 10, color: "var(--violet-2)" }}>{s.pct}%</span>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, height: 4 }}>
                    <div style={{ background: "var(--violet)", width: s.pct + "%", height: 4, borderRadius: 4, transition: "width 1s ease" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1rem" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 12 }}>Achievements</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {badges.map((b, i) => (
              <div key={i} style={{ background: b.bg, border: `1px solid ${b.border}`, borderRadius: 10, padding: "8px", textAlign: "center", opacity: b.locked ? 0.4 : 1 }}>
                <div style={{ fontSize: 18, marginBottom: 3 }}>{b.icon}</div>
                <div style={{ fontSize: 9, color: b.color, fontWeight: 600 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 14, padding: "1rem" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)", marginBottom: 12 }}>Recent activity</div>
        {recentActivity.length === 0 ? <div style={{ fontSize: 12, color: "var(--text-3)" }}>No analyses yet</div> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentActivity.map((a, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: gradeColor(a.grade), flexShrink: 0 }} />
                <div style={{ flex: 1, fontSize: 12, color: "var(--text)" }}>{a.title} — <span style={{ color: gradeColor(a.grade) }}>{a.score}% {a.grade}</span></div>
                <div style={{ fontSize: 10, color: "var(--text-3)" }}>{timeAgo(a.date)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={modalStyle} onClick={e => e.target === e.currentTarget && setShowEditModal(false)}>
          <div style={modalCardStyle}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Edit Profile</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Display name</div>
            <input style={inputStyle} value={editForm.displayName} onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Your name" />
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>Location</div>
            <input style={inputStyle} value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Hyderabad, India" />
            <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>LinkedIn URL</div>
            <input style={inputStyle} value={editForm.linkedin} onChange={e => setEditForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="linkedin.com/in/yourname" />
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={saveProfile} disabled={saving} style={{ flex: 1, background: "#7c3aed", border: "none", borderRadius: 8, padding: "0.7rem", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{saving ? "Saving..." : "Save Changes"}</button>
              <button onClick={() => setShowEditModal(false)} style={{ flex: 1, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.7rem", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={modalStyle} onClick={e => e.target === e.currentTarget && setShowPasswordModal(false)}>
          <div style={modalCardStyle}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>Change Password</div>
            <input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 characters)" />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={changePassword} disabled={saving} style={{ flex: 1, background: "#4f46e5", border: "none", borderRadius: 8, padding: "0.7rem", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{saving ? "Saving..." : "Update Password"}</button>
              <button onClick={() => setShowPasswordModal(false)} style={{ flex: 1, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.7rem", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div style={modalStyle} onClick={e => e.target === e.currentTarget && setShowDeleteConfirm(false)}>
          <div style={modalCardStyle}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>Delete Account</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20 }}>This will permanently delete your account and all your analysis history. This cannot be undone.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={deleteAccount} style={{ flex: 1, background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "0.7rem", color: "#f87171", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Yes, Delete</button>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 8, padding: "0.7rem", color: "var(--text-2)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
