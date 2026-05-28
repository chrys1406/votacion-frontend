import { useState, useEffect } from "react";
import {
  getEstudiantes,
  buscarEstudiante,
  eliminarEstudiante,
} from "../../services/estudiantesService";
import { useWindowSize } from "../../hooks/useWindowSize";

export default function AdminEstudiantes() {
  const { isMobile } = useWindowSize();
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [verEstudiante, setVerEstudiante] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEstudiantes();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (busqueda.trim()) {
        handleBuscar();
      } else {
        cargarEstudiantes();
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [busqueda]);

  const cargarEstudiantes = async () => {
    try {
      setLoading(true);
      const data = await getEstudiantes();
      setEstudiantes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBuscar = async () => {
    try {
      setBuscando(true);
      const data = await buscarEstudiante(busqueda);
      setEstudiantes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBuscando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarEstudiante(id);
      setEstudiantes(estudiantes.filter((e) => e.id !== id));
      setConfirmarEliminar(null);
      setVerEstudiante(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const totalVotaron = estudiantes.filter((e) => e.ha_votado).length;
  const pctParticipacion =
    estudiantes.length > 0
      ? Math.round((totalVotaron / estudiantes.length) * 100)
      : 0;

  return (
    <div
      style={{
        padding: "22px 24px",
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: 20 }}>
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 26,
            color: "#fff",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Gestión de{" "}
          <em style={{ color: "#E8FF47", fontStyle: "italic" }}>Estudiantes</em>
        </h1>
        <p style={{ fontSize: 12, color: "#444", margin: "5px 0 0" }}>
          {estudiantes.length} estudiantes registrados
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div
          style={{
            background: "#ff444415",
            border: "0.5px solid #ff444440",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: 12,
            color: "#ff6666",
          }}
        >
          {error}
        </div>
      )}

      {/* STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Total registrados",
            value: estudiantes.length,
            color: "#E8FF47",
          },
          { label: "Ya votaron", value: totalVotaron, color: "#34D399" },
          {
            label: "Pendientes",
            value: estudiantes.length - totalVotaron,
            color: "#F59E0B",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "#111",
              border: "0.5px solid #1E1E1E",
              borderRadius: 10,
              padding: "14px 16px",
            }}
          >
            <p
              style={{
                fontSize: 10,
                color: "#444",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                margin: "0 0 6px",
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 28,
                color: s.color,
                margin: 0,
                lineHeight: 1,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* BARRA PARTICIPACIÓN */}
      <div
        style={{
          background: "#111",
          border: "0.5px solid #1E1E1E",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 11, color: "#555" }}>
            Participación general
          </span>
          <span style={{ fontSize: 11, color: "#E8FF47", fontWeight: 600 }}>
            {pctParticipacion}%
          </span>
        </div>
        <div
          style={{
            height: 4,
            background: "#1A1A1A",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${pctParticipacion}%`,
              height: "100%",
              background: "#E8FF47",
              borderRadius: 4,
              opacity: 0.8,
            }}
          />
        </div>
      </div>

      {/* BÚSQUEDA */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <div
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#444",
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre, CI o registro..."
          style={{
            width: "100%",
            background: "#111",
            border: "0.5px solid #2A2A2A",
            borderRadius: 8,
            padding: "9px 12px 9px 34px",
            color: "#fff",
            fontSize: 12,
            outline: "none",
            fontFamily: "'Space Grotesk', sans-serif",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* TABLA */}
      <div
        style={{
          background: "#111",
          border: "0.5px solid #1E1E1E",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        {/* HEAD */}
        {!isMobile && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 60px",
              padding: "10px 18px",
              borderBottom: "0.5px solid #1A1A1A",
              background: "#0E0E0E",
            }}
          >
            {["Estudiante", "Registro", "Correo", "Registrado", ""].map((h) => (
              <span
                key={h}
                style={{
                  fontSize: 10,
                  color: "#444",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                }}
              >
                {h}
              </span>
            ))}
          </div>
        )}

        {/* LOADING */}
        {(loading || buscando) && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#333",
              fontSize: 13,
            }}
          >
            {buscando ? "Buscando..." : "Cargando estudiantes..."}
          </div>
        )}

        {/* VACÍO */}
        {!loading && !buscando && estudiantes.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#333",
              fontSize: 13,
            }}
          >
            No se encontraron estudiantes
          </div>
        )}

        {/* FILAS */}
        {!loading &&
          !buscando &&
          estudiantes.map((e, i) => (
            <div
              key={e.id}
              style={{
                display: isMobile ? "flex" : "grid",
                flexDirection: isMobile ? "column" : undefined,
                gridTemplateColumns: isMobile
                  ? undefined
                  : "2fr 1fr 1fr 1fr 60px",
                padding: "12px 18px",
                borderBottom:
                  i < estudiantes.length - 1 ? "0.5px solid #181818" : "none",
                alignItems: "center",
                transition: "background 0.12s",
                cursor: "pointer",
              }}
              onMouseEnter={(ev) =>
                (ev.currentTarget.style.background = "#141414")
              }
              onMouseLeave={(ev) =>
                (ev.currentTarget.style.background = "transparent")
              }
              onClick={() => setVerEstudiante(e)}
            >
              {/* Avatar + nombre */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "#181818",
                    border: "0.5px solid #2A2A2A",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#E8FF47",
                    fontWeight: 600,
                  }}
                >
                  {e.nombre?.charAt(0)}
                </div>
                <p
                  style={{
                    fontSize: 12,
                    color: "#ccc",
                    fontWeight: 500,
                    margin: 0,
                  }}
                >
                  {e.nombre}
                </p>
              </div>

              <span style={{ fontSize: 11, color: "#555" }}>{e.registro}</span>
              <span
                style={{
                  fontSize: 11,
                  color: "#555",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {e.correo}
              </span>
              <span style={{ fontSize: 10, color: "#444" }}>
                {new Date(e.created_at).toLocaleDateString("es-BO")}
              </span>

              {/* Eliminar */}
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    setConfirmarEliminar(e);
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "#181818",
                    border: "0.5px solid #2A2A2A",
                    color: "#555",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(ev) => {
                    ev.currentTarget.style.borderColor = "#ff444430";
                    ev.currentTarget.style.color = "#ff6666";
                  }}
                  onMouseLeave={(ev) => {
                    ev.currentTarget.style.borderColor = "#2A2A2A";
                    ev.currentTarget.style.color = "#555";
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* MODAL VER ESTUDIANTE */}
      {verEstudiante && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setVerEstudiante(null)}
        >
          <div
            style={{
              background: "#111",
              border: "0.5px solid #2A2A2A",
              borderRadius: 16,
              padding: 24,
              width: 360,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "#E8FF4715",
                  border: "0.5px solid #E8FF4730",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  color: "#E8FF47",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {verEstudiante.nombre?.charAt(0)}
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontSize: 20,
                    color: "#fff",
                    margin: 0,
                  }}
                >
                  {verEstudiante.nombre}
                </p>
                <p style={{ fontSize: 11, color: "#444", margin: "2px 0 0" }}>
                  Estudiante
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {[
                { label: "Registro", value: verEstudiante.registro },
                { label: "Correo", value: verEstudiante.correo },
                {
                  label: "Registrado",
                  value: new Date(verEstudiante.created_at).toLocaleDateString(
                    "es-BO",
                  ),
                },
              ].map((d) => (
                <div
                  key={d.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: "#0E0E0E",
                    border: "0.5px solid #1A1A1A",
                    borderRadius: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: "#444",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                    }}
                  >
                    {d.label}
                  </span>
                  <span style={{ fontSize: 12, color: "#888" }}>{d.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setVerEstudiante(null)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "0.5px solid #2A2A2A",
                  color: "#555",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Cerrar
              </button>
              <button
                onClick={() => setConfirmarEliminar(verEstudiante)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  background: "#ff444415",
                  border: "0.5px solid #ff444430",
                  color: "#ff6666",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {confirmarEliminar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setConfirmarEliminar(null)}
        >
          <div
            style={{
              background: "#111",
              border: "0.5px solid #2A2A2A",
              borderRadius: 14,
              padding: 24,
              width: 360,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: "#ff444412",
                border: "0.5px solid #ff444430",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 14,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff6666"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </div>
            <h2
              style={{
                fontSize: 15,
                color: "#fff",
                margin: "0 0 6px",
                fontWeight: 600,
              }}
            >
              ¿Eliminar estudiante?
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#555",
                margin: "0 0 20px",
                lineHeight: 1.5,
              }}
            >
              Se eliminará a{" "}
              <strong style={{ color: "#ccc" }}>
                {confirmarEliminar.nombre}
              </strong>{" "}
              y todos sus datos permanentemente.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => setConfirmarEliminar(null)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "0.5px solid #2A2A2A",
                  color: "#555",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminar(confirmarEliminar.id)}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  background: "#ff444420",
                  border: "0.5px solid #ff444440",
                  color: "#ff6666",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
