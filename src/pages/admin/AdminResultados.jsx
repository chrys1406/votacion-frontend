import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getResultados } from "../../services/resultadosService";
import { getElecciones } from "../../services/eleccionesService";
import { useWindowSize } from "../../hooks/useWindowSize";

const COLORS = ["#E8FF47", "#38BDF8", "#A78BFA", "#F59E0B", "#34D399"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1A1A1A", border: "0.5px solid #2A2A2A", borderRadius: 8, padding: "8px 14px", fontFamily: "'Space Grotesk', sans-serif" }}>
      <p style={{ fontSize: 12, color: "#fff", margin: 0, fontWeight: 600 }}>{payload[0].payload.nombre}</p>
      <p style={{ fontSize: 11, color: "#E8FF47", margin: "3px 0 0" }}>{payload[0].value} votos</p>
    </div>
  );
};

export default function AdminResultados() {
  const { isMobile } = useWindowSize();
  const [elecciones, setElecciones] = useState([]);
  const [eleccionActiva, setEleccionActiva] = useState(null);
  const [resultados, setResultados] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarElecciones();
  }, []);

  useEffect(() => {
    if (eleccionActiva) cargarResultados(eleccionActiva);
  }, [eleccionActiva]);

  const cargarElecciones = async () => {
    try {
      setLoading(true);
      const data = await getElecciones();
      setElecciones(data);
      if (data.length > 0) setEleccionActiva(data[0].id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cargarResultados = async (eleccionId) => {
    try {
      setLoadingResultados(true);
      setCategoriaActiva(0);
      const data = await getResultados(eleccionId);
      // Convertir candidatos de objeto a array
      const procesados = data.map((cat) => ({
        ...cat,
        candidatos: Object.values(cat.candidatos),
      }));
      setResultados(procesados);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingResultados(false);
    }
  };

  const categoria = resultados[categoriaActiva];
  const totalVotos = categoria ? categoria.candidatos.reduce((a, c) => a + c.votos, 0) : 0;
  const ganador = categoria
    ? [...categoria.candidatos].filter((c) => c.nombre !== "Nulo").sort((a, b) => b.votos - a.votos)[0]
    : null;

  return (
    <div style={{ padding: "22px 24px", fontFamily: "'Space Grotesk', sans-serif", color: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
          Resultados de{" "}
          <em style={{ color: "#E8FF47", fontStyle: "italic" }}>Votación</em>
        </h1>
        <p style={{ fontSize: 12, color: "#444", margin: "5px 0 0" }}>
          Resultados en tiempo real por candidato
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div style={{ background: "#ff444415", border: "0.5px solid #ff444440", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#ff6666" }}>
          {error}
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div style={{ padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          Cargando elecciones...
        </div>
      )}

      {/* SIN ELECCIONES */}
      {!loading && elecciones.length === 0 && (
        <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          No hay elecciones creadas aún
        </div>
      )}

      {/* SELECTOR ELECCIÓN */}
      {elecciones.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {elecciones.map((e) => (
            <button key={e.id} onClick={() => setEleccionActiva(e.id)} style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 11, cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
              background: eleccionActiva === e.id ? "#E8FF4715" : "#111",
              color: eleccionActiva === e.id ? "#E8FF47" : "#444",
              border: eleccionActiva === e.id ? "0.5px solid #E8FF4730" : "0.5px solid #1E1E1E",
            }}>{e.nombre}</button>
          ))}
        </div>
      )}

      {/* LOADING RESULTADOS */}
      {loadingResultados && (
        <div style={{ padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          Cargando resultados...
        </div>
      )}

      {/* SIN VOTOS */}
      {!loadingResultados && eleccionActiva && resultados.length === 0 && (
        <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          Aún no hay votos registrados en esta elección
        </div>
      )}

      {/* CONTENIDO */}
      {!loadingResultados && resultados.length > 0 && (
        <>
          {/* SELECTOR CATEGORÍA */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {resultados.map((cat, i) => (
              <button key={i} onClick={() => setCategoriaActiva(i)} style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
                background: categoriaActiva === i ? "#38BDF815" : "#111",
                color: categoriaActiva === i ? "#38BDF8" : "#444",
                border: categoriaActiva === i ? "0.5px solid #38BDF830" : "0.5px solid #1E1E1E",
              }}>{cat.categoria}</button>
            ))}
          </div>

          {/* STATS RÁPIDAS */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
            {[
              { label: "Total votos", value: totalVotos, color: "#E8FF47" },
              { label: "Candidatos", value: categoria.candidatos.filter((c) => c.nombre !== "Nulo").length, color: "#38BDF8" },
              { label: "Votos nulos", value: categoria.candidatos.find((c) => c.nombre === "Nulo")?.votos ?? 0, color: "#555" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: "14px 16px" }}>
                <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 6px" }}>{s.label}</p>
                <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 1fr", gap: 12 }}>

            {/* GRÁFICA */}
            <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 20 }}>
              <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 20px" }}>
                Votos por candidato — {categoria.categoria}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoria.candidatos} barSize={32}>
                  <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: "#444", fontFamily: "'Space Grotesk', sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#333", fontFamily: "'Space Grotesk', sans-serif" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="votos" radius={[6, 6, 0, 0]}>
                    {categoria.candidatos.map((entry, i) => (
                      <Cell key={i}
                        fill={entry.nombre === "Nulo" ? "#2A2A2A" : COLORS[i % COLORS.length]}
                        opacity={entry.nombre === "Nulo" ? 0.5 : 1}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* RANKING */}
            <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.8px", margin: "0 0 16px" }}>
                Ranking de candidatos
              </p>

              {[...categoria.candidatos]
                .sort((a, b) => b.votos - a.votos)
                .map((c, i) => {
                  const pct = totalVotos > 0 ? Math.round((c.votos / totalVotos) * 100) : 0;
                  const isNulo = c.nombre === "Nulo";
                  const isGanador = ganador && c.nombre === ganador.nombre;
                  const colorIndex = categoria.candidatos.findIndex((x) => x.nombre === c.nombre);
                  const color = isNulo ? "#333" : COLORS[colorIndex % COLORS.length];

                  return (
                    <div key={c.nombre} style={{
                      background: isGanador ? "#E8FF4706" : "transparent",
                      border: isGanador ? "0.5px solid #E8FF4718" : "0.5px solid transparent",
                      borderRadius: 10, padding: "12px 14px", marginBottom: 4, position: "relative",
                    }}>
                      {isGanador && (
                        <div style={{ position: "absolute", top: 10, right: 12, fontSize: 9, color: "#E8FF47", background: "#E8FF4715", border: "0.5px solid #E8FF4730", borderRadius: 20, padding: "2px 8px", fontWeight: 600 }}>
                          GANANDO
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: "#181818", border: `0.5px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          <span style={{ fontSize: 10, color: "#333" }}>{isNulo ? "∅" : c.nombre.charAt(0)}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12, color: isNulo ? "#444" : "#ccc", fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {c.nombre}
                          </p>
                          <p style={{ fontSize: 10, color: "#333", margin: 0 }}>{c.votos} votos · {pct}%</p>
                        </div>
                      </div>
                      <div style={{ height: 3, background: "#1A1A1A", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, opacity: isNulo ? 0.3 : 0.8 }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }`}</style>
    </div>
  );
}