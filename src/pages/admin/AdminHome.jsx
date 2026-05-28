import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatCard from "../../components/admin/StatCard";
import { getDashboardStats } from "../../services/dashboardService";
import { useWindowSize } from "../../hooks/useWindowSize";

const quickLinks = [
  {
    label: "Nueva elección",
    to: "/admin/elecciones",
    color: "#E8FF47",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    label: "Candidato",
    to: "/admin/candidatos",
    color: "#38BDF8",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <line x1="19" y1="8" x2="19" y2="14"/>
        <line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
  {
    label: "Resultados",
    to: "/admin/resultados",
    color: "#A78BFA",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    label: "Estudiantes",
    to: "/admin/estudiantes",
    color: "#F59E0B",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
      </svg>
    ),
  },
];

const statusBadge = {
  active:  { label: "Activa",    bg: "#E8FF4715", color: "#E8FF47", border: "#E8FF4730" },
  inactive: { label: "Inactiva", bg: "#1E1E1E",   color: "#444",    border: "#282828"   },
};

export default function AdminHome() {
  const { isMobile } = useWindowSize();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarStats();
  }, []);

  const cargarStats = async () => {
    try {
      setLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      label: "Estudiantes registrados",
      value: stats.totalEstudiantes,
      accentColor: "#E8FF47",
      tag: stats.totalEstudiantes === 0 ? "Sin registros" : "Registrados",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 14l9-5-9-5-9 5 9 5z"/>
        </svg>
      ),
    },
    {
      label: "Votos emitidos",
      value: stats.totalVotos,
      accentColor: "#38BDF8",
      tag: stats.totalVotos === 0 ? "En espera" : "Emitidos",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
          <rect x="9" y="3" width="6" height="4" rx="1"/>
          <path d="M9 12l2 2 4-4"/>
        </svg>
      ),
    },
    {
      label: "Elecciones activas",
      value: stats.eleccionesActivas,
      accentColor: "#F59E0B",
      tag: stats.eleccionesActivas === 0 ? "Sin activas" : "Activas",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: "Candidatos totales",
      value: stats.totalCandidatos,
      accentColor: "#A78BFA",
      tag: stats.totalCandidatos === 0 ? "Agregar" : "Registrados",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
  ] : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", padding: "22px 24px", gap: 16, fontFamily: "'Space Grotesk', sans-serif", color: "#fff" }}>

      {/* HEADING */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#fff", margin: 0, lineHeight: 1, letterSpacing: "-0.5px" }}>
            Panel de{" "}
            <em style={{ color: "#E8FF47", fontStyle: "italic" }}>control</em>
          </h1>
          <p style={{ fontSize: 12, color: "#444", margin: "5px 0 0" }}>
            Resumen general del sistema de votación universitaria
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#E8FF4710", border: "0.5px solid #E8FF4730", borderRadius: 20, padding: "5px 12px", fontSize: 11, color: "#E8FF47", fontWeight: 500 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8FF47", animation: "blink 1.4s ease-in-out infinite", display: "inline-block" }} />
          Sistema activo
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ background: "#ff444415", border: "0.5px solid #ff444440", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#ff6666" }}>
          {error}
        </div>
      )}

        {/* STATS */}
        {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          Cargando estadísticas...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 10 }}>
          {statCards.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      )}

      {/* ROW 2 */}
      {!loading && stats && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.6fr 1fr", gap: 12 }}>

          {/* ELECCIONES */}
          <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#666", letterSpacing: "0.3px", textTransform: "uppercase", margin: 0 }}>
                Elecciones recientes
              </p>
              <Link to="/admin/elecciones" style={{ fontSize: 11, color: "#E8FF47", textDecoration: "none" }}>
                Gestionar →
              </Link>
            </div>

            {stats.elecciones.length === 0 ? (
              <p style={{ fontSize: 12, color: "#333", textAlign: "center", padding: "20px 0" }}>
                No hay elecciones creadas aún
              </p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {stats.elecciones.map((el) => {
                    const s = el.activa ? statusBadge.active : statusBadge.inactive;
                    return (
                      <tr key={el.id} style={{ borderBottom: "0.5px solid #181818" }}>
                        <td style={{ padding: "10px 0", verticalAlign: "middle" }}>
                          <p style={{ fontSize: 12, color: "#ccc", fontWeight: 500, margin: 0 }}>{el.nombre}</p>
                          <p style={{ fontSize: 10, color: "#444", margin: "2px 0 0" }}>{el.facultad}</p>
                        </td>
                        <td style={{ padding: "10px 0", verticalAlign: "middle", textAlign: "right" }}>
                          <span style={{ fontSize: 10, padding: "3px 9px", borderRadius: 20, fontWeight: 500, background: s.bg, color: s.color, border: `0.5px solid ${s.border}` }}>
                            {s.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ACCESOS RÁPIDOS */}
          <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 18 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#666", textTransform: "uppercase", margin: "0 0 14px", letterSpacing: "0.3px" }}>
              Accesos rápidos
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
              {quickLinks.map((q) => (
                <Link key={q.to} to={q.to} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#0E0E0E", border: "0.5px solid #1E1E1E", borderRadius: 9, padding: "14px 12px", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, transition: "all 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#141414"; e.currentTarget.style.borderColor = `${q.color}40`; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0E0E0E"; e.currentTarget.style.borderColor = "#1E1E1E"; }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#181818", display: "flex", alignItems: "center", justifyContent: "center", color: q.color }}>
                      {q.icon}
                    </div>
                    <p style={{ fontSize: 11, color: "#666", fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{q.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
    </div>
  );
}