import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWindowSize } from "../../hooks/useWindowSize";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0A",
      fontFamily: "'Space Grotesk', sans-serif",
    }}>

      {/* TOPBAR */}
      <div style={{
        background: "#0A0A0A",
        borderBottom: "0.5px solid #1E1E1E",
        padding: isMobile ? "0 16px" : "0 24px",
        height: 54,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30,
            background: "#E8FF47",
            borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#0A0A0A"/>
              <path d="M9 12l2 2 4-4" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* En móvil solo muestra el logo, en desktop muestra el texto */}
          {!isMobile && (
            <div>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 15, color: "#fff", margin: 0 }}>
                Sistema de Votación
              </p>
              <p style={{ color: "#444", fontSize: 10, margin: 0, letterSpacing: "0.8px", textTransform: "uppercase" }}>
                Portal Estudiantil
              </p>
            </div>
          )}
        </div>

        {/* Usuario + logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 7,
            padding: "4px 10px 4px 4px",
            border: "0.5px solid #222",
            borderRadius: 20,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: "#E8FF47",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9, fontWeight: 700, color: "#0A0A0A",
            }}>
              {user?.nombre?.charAt(0)?.toUpperCase() ?? "E"}
            </div>
            {/* En móvil solo muestra la inicial, en desktop el nombre completo */}
            {!isMobile && (
              <span style={{ fontSize: 11, color: "#888", fontWeight: 500 }}>
                {user?.nombre ?? "Estudiante"}
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: isMobile ? "7px 10px" : "7px 12px",
              background: "transparent",
              border: "0.5px solid #2A2A2A",
              borderRadius: 6,
              color: "#555",
              fontSize: 11,
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff444430"; e.currentTarget.style.color = "#ff6666"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#555"; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {/* En móvil solo muestra el ícono, en desktop el texto */}
            {!isMobile && "Cerrar sesión"}
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
      <main style={{ padding: isMobile ? "16px 12px" : "28px 24px" }}>
        <Outlet />
      </main>
    </div>
  );
}