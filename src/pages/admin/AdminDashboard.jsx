import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/admin/Sidebar";
import { useWindowSize } from "../../hooks/useWindowSize";

const navLinks = [
  { to: "/admin", label: "Inicio", end: true },
  { to: "/admin/elecciones", label: "Elecciones" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/candidatos", label: "Candidatos" },
  { to: "/admin/resultados", label: "Resultados" },
  { to: "/admin/estudiantes", label: "Estudiantes" },
];

const navIcons = {
  "Inicio": (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  "Elecciones": (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
    </svg>
  ),
  "Categorías": (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 10h16M4 14h8"/>
    </svg>
  ),
  "Candidatos": (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  "Resultados": (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  "Estudiantes": (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 14l9-5-9-5-9 5 9 5z"/>
    </svg>
  ),
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { isMobile } = useWindowSize();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const today = new Date().toLocaleDateString("es-BO", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      background: "#0A0A0A",
      fontFamily: "'Space Grotesk', sans-serif",
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        background: "#0A0A0A",
        borderBottom: "0.5px solid #1E1E1E",
        padding: "0 16px",
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 200,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Hamburguesa en móvil */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none", border: "none", color: "#555",
                cursor: "pointer", padding: 4, marginRight: 4,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
          )}

          <div style={{
            width: 30, height: 30, background: "#E8FF47", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#0A0A0A"/>
              <path d="M9 12l2 2 4-4" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: isMobile ? 13 : 15, color: "#fff", margin: 0 }}>
              Sistema de Votación
            </p>
            {!isMobile && (
              <p style={{ color: "#444", fontSize: 10, margin: 0, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                Panel Administrativo
              </p>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isMobile && (
            <span style={{ fontSize: 11, color: "#444" }}>{today}</span>
          )}
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "4px 10px 4px 4px",
            border: "0.5px solid #222", borderRadius: 20,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: "#E8FF47",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "#0A0A0A",
            }}>
              {user?.registro?.slice(0, 2)?.toUpperCase() ?? "AD"}
            </div>
            {!isMobile && (
              <span style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>
                {user?.registro ?? "Admin"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── NAVBAR — solo en desktop ── */}
      {!isMobile && <div style={{
        background: "#0E0E0E",
        borderBottom: "0.5px solid #1A1A1A",
        padding: "0 16px",
        height: 42,
        display: "flex",
        alignItems: "center",
        gap: 0,
        flexShrink: 0,
        overflowX: "auto",
        scrollbarWidth: "none",
      }}>
        {navLinks.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} style={{ textDecoration: "none", flexShrink: 0 }}>
            {({ isActive }) => (
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 12px", height: 42,
                fontSize: isMobile ? 11 : 12,
                color: isActive ? "#E8FF47" : "#444",
                fontWeight: isActive ? 500 : 400,
                borderBottom: isActive ? "2px solid #E8FF47" : "2px solid transparent",
                cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
              }}>
                {navIcons[link.label]}
                {link.label}
              </div>
            )}
          </NavLink>
        ))}
      </div>}

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* Overlay móvil */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 150,
              background: "rgba(0,0,0,0.7)",
            }}
          />
        )}

        {/* SIDEBAR */}
        <div style={{
          position: isMobile ? "fixed" : "relative",
          left: isMobile ? (sidebarOpen ? 0 : -260) : "auto",
          top: isMobile ? 0 : "auto",
          height: isMobile ? "100vh" : "auto",
          zIndex: isMobile ? 200 : "auto",
          transition: "left 0.25s ease",
          flexShrink: 0,
        }}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <main style={{
          flex: 1,
          overflowY: "auto",
          background: "#0A0A0A",
          padding: isMobile ? "16px 12px" : 0,
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}