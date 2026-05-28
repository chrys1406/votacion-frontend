import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getElecciones } from "../../services/eleccionesService";
import { Player } from "@lottiefiles/react-lottie-player";
import { useWindowSize } from "../../hooks/useWindowSize";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function StudentHome() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const [elecciones, setElecciones] = useState([]);
  const [eleccionesVotadas, setEleccionesVotadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bloqueadaModal, setBloqueadaModal] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [data, votosRes] = await Promise.all([
        getElecciones(),
        fetch(`${BASE_URL}/votos/ha-votado-lista/${user.usuario_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const votosData = await votosRes.json();
      setElecciones(data.filter((e) => e.activa));
      setEleccionesVotadas(votosData.elecciones_votadas || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClickEleccion = (el) => {
    if (eleccionesVotadas.includes(el.id)) {
      setBloqueadaModal(el);
    } else {
      navigate(`/estudiante/eleccion/${el.id}`);
    }
  };

  return (
    <div style={{ color: "#fff", maxWidth: 900, margin: "0 auto" }}>
      {/* SALUDO */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 28,
            color: "#fff",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Hola,{" "}
          <em style={{ color: "#E8FF47", fontStyle: "italic" }}>
            {user?.nombre?.split(" ")[0] ?? "Estudiante"}
          </em>{" "}
          👋
        </h1>
        <p style={{ fontSize: 13, color: "#444", margin: "6px 0 0" }}>
          Aquí están las elecciones disponibles para ti
        </p>
      </div>

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

      {loading && (
        <div
          style={{
            padding: 60,
            textAlign: "center",
            color: "#333",
            fontSize: 13,
          }}
        >
          Cargando elecciones...
        </div>
      )}

      {!loading && elecciones.length === 0 && (
        <div
          style={{
            background: "#111",
            border: "0.5px solid #1E1E1E",
            borderRadius: 16,
            padding: 60,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗳️</div>
          <p style={{ fontSize: 14, color: "#444", margin: 0 }}>
            No hay elecciones activas por el momento
          </p>
          <p style={{ fontSize: 12, color: "#333", margin: "6px 0 0" }}>
            Vuelve más tarde cuando el administrador active una elección
          </p>
        </div>
      )}

      {/* ELECCIONES */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {elecciones.map((el) => {
          const yaVoto = eleccionesVotadas.includes(el.id);
          return (
            <div
              key={el.id}
              onClick={() => handleClickEleccion(el)}
              style={{
                background: yaVoto ? "#0D1A0D" : "#111",
                border: yaVoto
                  ? "0.5px solid #34D39930"
                  : "0.5px solid #1E1E1E",
                borderRadius: 16,
                padding: isMobile ? "16px" : "20px 24px",
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: isMobile ? 12 : 0,
                cursor: "pointer",
                transition: "all 0.15s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.borderColor = yaVoto
                  ? "#34D39960"
                  : "#E8FF4730";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = yaVoto
                  ? "#34D39930"
                  : "#1E1E1E";
              }}
            >
              {yaVoto && (
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    background: "#34D399",
                    opacity: 0.06,
                    filter: "blur(20px)",
                    pointerEvents: "none",
                  }}
                />
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: yaVoto ? "#34D39912" : "#E8FF4712",
                    border: yaVoto
                      ? "0.5px solid #34D39930"
                      : "0.5px solid #E8FF4730",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {yaVoto ? (
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34D399"
                      strokeWidth="2"
                    >
                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#E8FF47"
                      strokeWidth="1.5"
                    >
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                      <rect x="9" y="3" width="6" height="4" rx="1" />
                      <path d="M9 12l2 2 4-4" />
                    </svg>
                  )}
                </div>

                <div>
                  <p
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: yaVoto ? "#34D399" : "#ddd",
                      margin: 0,
                    }}
                  >
                    {el.nombre}
                  </p>
                  <p style={{ fontSize: 12, color: "#444", margin: "3px 0 0" }}>
                    {el.facultad}
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: "#555" }}>
                      📅 {el.fecha_inicio} → {el.fecha_fin}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {yaVoto ? (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                      background: "#34D39915",
                      color: "#34D399",
                      border: "0.5px solid #34D39930",
                    }}
                  >
                    ✓ Participaste
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "4px 12px",
                      borderRadius: 20,
                      fontWeight: 600,
                      background: "#E8FF4715",
                      color: "#E8FF47",
                      border: "0.5px solid #E8FF4730",
                    }}
                  >
                    ● Pendiente
                  </span>
                )}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#444"
                  strokeWidth="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          );
        })}
      </div>

      {/* ROBOT ABAJO CENTRADO */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 32,
          gap: 8,
        }}
      >
        <Player
          autoplay
          loop
          src="/robot-elecciones.json"
          style={{ width: 200, height: 200 }}
        />
        <p
          style={{
            fontSize: 12,
            color: "#E8FF47",
            fontWeight: 600,
            margin: "0 0 4px",
          }}
        >
          ¡Tu voto es tu voz!
        </p>
        <p style={{ fontSize: 11, color: "#444", margin: 0, lineHeight: 1.5 }}>
          Participa en las elecciones activas y haz que tu opinión cuente
        </p>
      </div>

      {/* MODAL BLOQUEADA */}
      {bloqueadaModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
          onClick={() => setBloqueadaModal(null)}
        >
          <div
            style={{
              background: "#111",
              border: "0.5px solid #2A2A2A",
              borderRadius: 16,
              padding: 28,
              width: "100%",
              maxWidth: 380,
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "#34D39915",
                border: "0.5px solid #34D39930",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                fontSize: 28,
              }}
            >
              ✅
            </div>
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 22,
                color: "#fff",
                margin: "0 0 8px",
              }}
            >
              Ya participaste
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#555",
                margin: "0 0 6px",
                lineHeight: 1.6,
              }}
            >
              Tu voto en{" "}
              <strong style={{ color: "#ccc" }}>{bloqueadaModal.nombre}</strong>{" "}
              ya fue registrado correctamente.
            </p>
            <p
              style={{
                fontSize: 11,
                color: "#444",
                margin: "0 0 24px",
                lineHeight: 1.5,
              }}
            >
              Por seguridad del proceso electoral, no es posible votar más de
              una vez en la misma elección.
            </p>
            <div
              style={{
                background: "#34D39910",
                border: "0.5px solid #34D39930",
                borderRadius: 10,
                padding: "10px 16px",
                marginBottom: 20,
                fontSize: 11,
                color: "#34D399",
              }}
            >
              🔒 Tu participación está protegida y es anónima
            </div>
            <button
              onClick={() => setBloqueadaModal(null)}
              style={{
                width: "100%",
                padding: "11px",
                borderRadius: 10,
                background: "#1A1A1A",
                border: "0.5px solid #2A2A2A",
                color: "#888",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
