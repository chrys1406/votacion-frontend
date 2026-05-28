import { useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const quotes = [
  {
    text: ["Tu voz es el ", "instrumento", " más poderoso de la democracia."],
    author: "Voto estudiantil",
  },
  {
    text: ["Cada ", "voto", " cuenta. Cada voz importa."],
    author: "Democracia universitaria",
  },
  {
    text: ["El ", "cambio", " comienza con tu participación."],
    author: "Elecciones 2026",
  },
  {
    text: ["Elige con ", "convicción", ", vota con responsabilidad."],
    author: "Sistema de votación",
  },
];

const systemStatus = [
  { name: "DB", color: "#E8FF47" },
  { name: "Servidor", color: "#E8FF47" },
  { name: "Auth", color: "#E8FF47" },
  { name: "Papeleta", color: "#F59E0B" },
];

const navLinks = [
  { to: "/admin", label: "Inicio", end: true },
  { to: "/admin/elecciones", label: "Elecciones" },
  { to: "/admin/categorias", label: "Categorías" },
  { to: "/admin/candidatos", label: "Candidatos" },
  { to: "/admin/resultados", label: "Resultados" },
  { to: "/admin/estudiantes", label: "Estudiantes" },
];

export default function Sidebar({ onClose }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef(null);
  const isMobile = window.innerWidth < 768;

  const goTo = (idx) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
    }, 300);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % quotes.length);
        setVisible(true);
      }, 300);
    }, 3500);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const q = quotes[current];

  return (
    <aside style={{
      width: 215,
      minWidth: 215,
      background: "#0C0C0C",
      borderRight: "0.5px solid #1A1A1A",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Space Grotesk', sans-serif",
      position: "relative",
      height: isMobile ? "100vh" : "auto",
      overflowY: isMobile ? "auto" : "visible",
    }}>

      {/* HEADER MÓVIL CON BOTÓN CERRAR */}
      {isMobile && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 18px", borderBottom: "0.5px solid #1A1A1A",
        }}>
          <p style={{ fontSize: 12, color: "#555", margin: 0, textTransform: "uppercase", letterSpacing: "0.8px" }}>
            Menú
          </p>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", cursor: "pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      )}

      {/* NAVEGACIÓN EN MÓVIL */}
      {isMobile && (
        <nav style={{ display: "flex", flexDirection: "column", padding: "8px 0", borderBottom: "0.5px solid #1A1A1A" }}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              style={{ textDecoration: "none" }}
              onClick={onClose}
            >
              {({ isActive }) => (
                <div style={{
                  padding: "12px 18px",
                  fontSize: 13,
                  color: isActive ? "#E8FF47" : "#666",
                  fontWeight: isActive ? 600 : 400,
                  background: isActive ? "#E8FF4708" : "transparent",
                  borderLeft: isActive ? "2px solid #E8FF47" : "2px solid transparent",
                  transition: "all 0.15s",
                }}>
                  {link.label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* ILLUSTRATION AREA — solo en desktop */}
      {!isMobile && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "32px 22px",
        }}>
          <div style={{ width: 122, height: 122, marginBottom: 24 }}>
            <svg viewBox="0 0 110 110" width="122" height="122" xmlns="http://www.w3.org/2000/svg">
              <circle cx="55" cy="65" r="38" fill="#E8FF47" opacity="0.15" style={{ animation: "glowPulse 2.8s ease-in-out infinite" }}/>
              <rect x="22" y="50" width="66" height="44" rx="6" fill="#141414"/>
              <rect x="22" y="50" width="66" height="44" rx="6" fill="none" stroke="#2A2A2A" strokeWidth="1.5"/>
              <rect x="16" y="43" width="78" height="10" rx="5" fill="#1E1E1E" stroke="#2A2A2A" strokeWidth="1"/>
              <rect x="46" y="45" width="18" height="4" rx="2" fill="#0A0A0A"/>
              <rect x="46" y="45" width="18" height="4" rx="2" fill="none" stroke="#E8FF4760" strokeWidth="0.5"/>
              <rect x="46" y="64" width="18" height="14" rx="3" fill="#1A1A1A" stroke="#2A2A2A" strokeWidth="1"/>
              <path d="M50 64 v-3 a5 5 0 0 1 10 0 v3" fill="none" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="55" cy="71" r="2" fill="#333"/>
              <line x1="55" y1="73" x2="55" y2="76" stroke="#333" strokeWidth="1.2" strokeLinecap="round"/>
              <g style={{ animation: "paperDrop 2.8s ease-in-out infinite" }}>
                <rect x="46" y="26" width="18" height="22" rx="2" fill="#E8FF47" opacity="0.92"/>
                <line x1="50" y1="32" x2="60" y2="32" stroke="#0A0A0A" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="50" y1="36" x2="60" y2="36" stroke="#0A0A0A" strokeWidth="1.2" strokeLinecap="round"/>
                <line x1="50" y1="40" x2="56" y2="40" stroke="#0A0A0A" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M57 33 l2 2 l4-4" stroke="#0A0A0A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </g>
              <circle cx="18" cy="55" r="1.5" fill="#E8FF47" opacity="0.3"/>
              <circle cx="92" cy="60" r="1.2" fill="#E8FF47" opacity="0.25"/>
              <circle cx="88" cy="48" r="1" fill="#E8FF47" opacity="0.2"/>
              <circle cx="20" cy="70" r="1" fill="#E8FF47" opacity="0.15"/>
            </svg>
          </div>

          <div style={{ textAlign: "center", padding: "0 4px", opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 13, fontStyle: "italic", color: "#555", lineHeight: 1.65, margin: 0 }}>
              "{q.text[0]}
              <em style={{ color: "#E8FF47", fontStyle: "italic" }}>{q.text[1]}</em>
              {q.text[2]}"
            </p>
            <div style={{ width: 24, height: 1, background: "#222", margin: "12px auto" }}/>
            <p style={{ fontSize: 10, color: "#333", letterSpacing: "0.8px", textTransform: "uppercase", margin: 0 }}>
              {q.author}
            </p>
          </div>

          <div style={{ display: "flex", gap: 5, marginTop: 16 }}>
            {quotes.map((_, i) => (
              <div key={i} onClick={() => goTo(i)} style={{
                width: 5, height: 5, borderRadius: "50%",
                background: i === current ? "#E8FF47" : "#222",
                cursor: "pointer", transition: "background 0.2s",
              }}/>
            ))}
          </div>
        </div>
      )}

      {/* SYSTEM STATUS */}
      <div style={{ padding: "16px 18px", borderTop: "0.5px solid #1A1A1A" }}>
        <p style={{ fontSize: 9, letterSpacing: "1.2px", textTransform: "uppercase", color: "#333", margin: "0 0 8px" }}>
          Sistema
        </p>
        {systemStatus.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 0" }}>
            <span style={{ fontSize: 11, color: "#444" }}>{s.name}</span>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }}/>
          </div>
        ))}

        <button
          onClick={handleLogout}
          style={{
            marginTop: 14, width: "100%",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            padding: "7px 10px", background: "transparent",
            border: "0.5px solid #2A2A2A", borderRadius: 6,
            color: "#555", fontSize: 11,
            fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E8FF47"; e.currentTarget.style.color = "#E8FF47"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#555"; }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </button>
      </div>

      <style>{`
        @keyframes paperDrop {
          0%   { transform: translateY(-8px); opacity: 0; }
          40%  { transform: translateY(0px);  opacity: 1; }
          70%  { transform: translateY(0px);  opacity: 1; }
          100% { transform: translateY(4px);  opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.15; }
          50%       { opacity: 0.35; }
        }
      `}</style>
    </aside>
  );
}