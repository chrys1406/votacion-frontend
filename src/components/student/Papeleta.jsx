import { useState } from "react";
import { useWindowSize } from "../../hooks/useWindowSize";

const COLORES_PARTIDO = [
  { bg: "#E8FF4715", border: "#E8FF4740", text: "#E8FF47", glow: "#E8FF47" },
  { bg: "#38BDF815", border: "#38BDF840", text: "#38BDF8", glow: "#38BDF8" },
  { bg: "#A78BFA15", border: "#A78BFA40", text: "#A78BFA", glow: "#A78BFA" },
  { bg: "#F59E0B15", border: "#F59E0B40", text: "#F59E0B", glow: "#F59E0B" },
  { bg: "#34D39915", border: "#34D39940", text: "#34D399", glow: "#34D399" },
];

export default function Papeleta({ candidatos, categorias, onVotoChange }) {
  const [seleccionados, setSeleccionados] = useState({});
  const { isMobile, isTablet } = useWindowSize();

  const partidos = [...new Set(candidatos.map((c) => c.partido))].filter(Boolean);

  const colorPartido = {};
  partidos.forEach((p, i) => {
    colorPartido[p] = COLORES_PARTIDO[i % COLORES_PARTIDO.length];
  });

  // Columnas según pantalla
  const columnas = isMobile ? 1 : isTablet ? Math.min(partidos.length, 2) : partidos.length;

  const handleClick = (categoriaId, candidatoId, partido) => {
    let nuevos;
    if (seleccionados[categoriaId]?.candidatoId === candidatoId) {
      nuevos = { ...seleccionados };
      delete nuevos[categoriaId];
    } else {
      nuevos = { ...seleccionados, [categoriaId]: { candidatoId, partido } };
    }
    setSeleccionados(nuevos);
    if (onVotoChange) onVotoChange(nuevos);
  };

  const partidos_seleccionados = [...new Set(Object.values(seleccionados).map((v) => v.partido))];
  const totalSeleccionados = Object.keys(seleccionados).length;
  const votoValido = partidos_seleccionados.length === 1 && totalSeleccionados === categorias.length;
  const votoMezclado = partidos_seleccionados.length > 1;
  const votoNulo = totalSeleccionados > 0 && (votoMezclado || totalSeleccionados < categorias.length);

  return (
    <div>
      <style>{`
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 8px 2px var(--glow-color); }
          50% { box-shadow: 0 0 18px 6px var(--glow-color); }
        }
      `}</style>

      {/* ESTADO DEL VOTO */}
      {totalSeleccionados > 0 && (
        <div style={{
          marginBottom: 16,
          padding: "10px 16px",
          borderRadius: 10,
          background: votoValido ? "#34D39915" : votoNulo ? "#ff444415" : "#E8FF4710",
          border: `0.5px solid ${votoValido ? "#34D39930" : votoNulo ? "#ff444430" : "#E8FF4720"}`,
          fontSize: 12,
          color: votoValido ? "#34D399" : votoNulo ? "#ff6666" : "#E8FF47",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          {votoValido
            ? `✅ Voto válido — Partido ${partidos_seleccionados[0]}`
            : votoMezclado
            ? "⚠️ Voto mezclado — Se registrará como NULO"
            : `📋 Voto incompleto — Se registrará como NULO`}
        </div>
      )}

      {/* PAPELETA */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columnas}, 1fr)`,
        gap: isMobile ? 8 : 12,
      }}>
        {partidos.map((partido) => {
          const color = colorPartido[partido];
          return (
            <div key={partido} style={{
              background: "#111",
              border: `0.5px solid ${color.border}`,
              borderRadius: 14,
              overflow: "hidden",
            }}>
              {/* HEADER PARTIDO */}
              <div style={{
                background: color.bg,
                borderBottom: `0.5px solid ${color.border}`,
                padding: "12px 16px",
                textAlign: "center",
              }}>
                <p style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: color.text, margin: 0, textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {partido}
                </p>
              </div>

              {/* CANDIDATOS */}
              <div style={{ padding: isMobile ? 8 : 12, display: "flex", flexDirection: "column", gap: 10 }}>
                {categorias.map((cat) => {
                  const candidato = candidatos.find(
                    (c) => c.partido === partido && c.categoria_id === cat.id
                  );
                  if (!candidato) return null;

                  const seleccionado = seleccionados[cat.id]?.candidatoId === candidato.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleClick(cat.id, candidato.id, partido)}
                      style={{
                        background: seleccionado ? color.bg : "#0E0E0E",
                        border: seleccionado ? `1.5px solid ${color.border}` : "0.5px solid #2A2A2A",
                        borderRadius: 12,
                        padding: isMobile ? 10 : 12,
                        cursor: "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                        "--glow-color": color.glow + "60",
                        animation: seleccionado ? "glowPulse 2s ease-in-out infinite" : "none",
                        transform: seleccionado ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      {/* CATEGORÍA */}
                      <p style={{ fontSize: 9, color: color.text, textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 8px", opacity: 0.7 }}>
                        {cat.nombre}
                      </p>

                      {/* FOTO */}
                      <div style={{
                        width: "100%",
                        height: isMobile ? 100 : 120,
                        borderRadius: 8, overflow: "hidden",
                        background: "#181818", marginBottom: 8,
                        border: seleccionado ? `1px solid ${color.border}` : "none",
                      }}>
                        {candidato.foto_url ? (
                          <img src={candidato.foto_url} alt={candidato.nombre}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="1.5">
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* NOMBRE */}
                      <p style={{ fontSize: isMobile ? 11 : 12, fontWeight: 600, color: "#ddd", margin: "0 0 2px", textAlign: "center" }}>
                        {candidato.nombre}
                      </p>

                      {/* DESCRIPCIÓN */}
                      <p style={{ fontSize: 10, color: "#444", margin: "0 0 10px", textAlign: "center", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {candidato.descripcion}
                      </p>

                      {/* CASILLA */}
                      <div style={{
                        width: 36, height: 36,
                        border: seleccionado ? `2px solid ${color.text}` : "1.5px solid #2A2A2A",
                        borderRadius: 6,
                        margin: "0 auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: seleccionado ? color.bg : "transparent",
                        transition: "all 0.2s",
                      }}>
                        {seleccionado && (
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color.text} strokeWidth="3" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}