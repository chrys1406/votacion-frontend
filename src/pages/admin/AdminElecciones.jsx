import { useState, useEffect } from "react";
import { useWindowSize } from "../../hooks/useWindowSize";
import {
  getElecciones,
  crearEleccion,
  editarEleccion,
  eliminarEleccion,
  toggleEleccion,
} from "../../services/eleccionesService";

const emptyForm = {
  nombre: "",
  facultad: "",
  fecha_inicio: "",
  fecha_fin: "",
};

const inputStyle = {
  width: "100%",
  background: "#0E0E0E",
  border: "0.5px solid #2A2A2A",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#fff",
  fontSize: 12,
  fontFamily: "'Space Grotesk', sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle = {
  fontSize: 10,
  color: "#555",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  marginBottom: 6,
  display: "block",
};

export default function AdminElecciones() {
  const { isMobile } = useWindowSize();
  const [elecciones, setElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [verCandidatos, setVerCandidatos] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarElecciones();
  }, []);

  const cargarElecciones = async () => {
    try {
      setLoading(true);
      const data = await getElecciones();
      setElecciones(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleNueva = () => {
    setEditando(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const handleEditar = (el) => {
    setEditando(el.id);
    setForm({
      nombre: el.nombre,
      facultad: el.facultad || "",
      fecha_inicio: el.fecha_inicio || "",
      fecha_fin: el.fecha_fin || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (
      !form.nombre ||
      !form.facultad ||
      !form.fecha_inicio ||
      !form.fecha_fin
    ) {
      setError("Completa todos los campos");
      return;
    }
    try {
      setGuardando(true);
      setError("");
      if (editando) {
        const updated = await editarEleccion(editando, form);
        setElecciones(
          elecciones.map((el) => (el.id === editando ? updated : el)),
        );
      } else {
        const nueva = await crearEleccion({ ...form, activa: false });
        setElecciones([nueva, ...elecciones]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const updated = await toggleEleccion(id);
      setElecciones(elecciones.map((el) => (el.id === id ? updated : el)));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarEleccion(id);
      setElecciones(elecciones.filter((el) => el.id !== id));
      setConfirmarEliminar(null);
    } catch (err) {
      setError(err.message);
    }
  };

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
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
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
            <em style={{ color: "#E8FF47", fontStyle: "italic" }}>
              Elecciones
            </em>
          </h1>
          <p style={{ fontSize: 12, color: "#444", margin: "5px 0 0" }}>
            {elecciones.length}/5 elecciones creadas
          </p>
        </div>
        <button
          onClick={handleNueva}
          disabled={elecciones.length >= 5}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 16px",
            background: elecciones.length >= 5 ? "#1A1A1A" : "#E8FF47",
            color: elecciones.length >= 5 ? "#444" : "#0A0A0A",
            border: "none",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "'Space Grotesk', sans-serif",
            cursor: elecciones.length >= 5 ? "not-allowed" : "pointer",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva elección
        </button>
      </div>

      {/* ERROR GLOBAL */}
      {error && !showModal && (
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
              gridTemplateColumns: "2fr 1.5fr 1fr 1fr 80px 120px",
              padding: "10px 18px",
              borderBottom: "0.5px solid #1A1A1A",
              background: "#0E0E0E",
            }}
          >
            {[
              "Elección",
              "Facultad",
              "Inicio",
              "Fin",
              "Estado",
              "Acciones",
            ].map((h) => (
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
        {loading && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#333",
              fontSize: 13,
            }}
          >
            Cargando elecciones...
          </div>
        )}

        {/* VACÍO */}
        {!loading && elecciones.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#333",
              fontSize: 13,
            }}
          >
            No hay elecciones creadas aún
          </div>
        )}

        {/* FILAS */}
        {elecciones.map((el, i) => (
          <div
            key={el.id}
            style={{
              display: isMobile ? "flex" : "grid",
              flexDirection: isMobile ? "column" : undefined,
              gridTemplateColumns: isMobile
                ? undefined
                : "2fr 1.5fr 1fr 1fr 80px 120px",
              padding: "14px 18px",
              borderBottom:
                i < elecciones.length - 1 ? "0.5px solid #181818" : "none",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? 10 : 0,
              transition: "background 0.12s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#141414")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div>
              <p
                style={{
                  fontSize: 12,
                  color: "#ccc",
                  fontWeight: 500,
                  margin: 0,
                }}
              >
                {el.nombre}
              </p>
            </div>
            <span style={{ fontSize: 11, color: "#555" }}>{el.facultad}</span>
            <span style={{ fontSize: 11, color: "#555" }}>
              {el.fecha_inicio}
            </span>
            <span style={{ fontSize: 11, color: "#555" }}>{el.fecha_fin}</span>

            {/* Toggle */}
            <div>
              <button
                onClick={() => handleToggle(el.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "3px 9px",
                  borderRadius: 20,
                  border: el.activa
                    ? "0.5px solid #E8FF4730"
                    : "0.5px solid #2A2A2A",
                  background: el.activa ? "#E8FF4712" : "#181818",
                  color: el.activa ? "#E8FF47" : "#444",
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: el.activa ? "#E8FF47" : "#333",
                  }}
                />
                {el.activa ? "Activa" : "Inactiva"}
              </button>
            </div>

            {/* Acciones */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setVerCandidatos(el)}
                title="Ver candidatos"
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#38BDF830";
                  e.currentTarget.style.color = "#38BDF8";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2A2A2A";
                  e.currentTarget.style.color = "#555";
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
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
              </button>
              <button
                onClick={() => handleEditar(el)}
                title="Editar"
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#E8FF4730";
                  e.currentTarget.style.color = "#E8FF47";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2A2A2A";
                  e.currentTarget.style.color = "#555";
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
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmarEliminar(el)}
                title="Eliminar"
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
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#ff444430";
                  e.currentTarget.style.color = "#ff6666";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#2A2A2A";
                  e.currentTarget.style.color = "#555";
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

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#111",
              border: "0.5px solid #2A2A2A",
              borderRadius: 14,
              padding: 24,
              width: 420,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 20,
                color: "#fff",
                margin: "0 0 18px",
              }}
            >
              {editando ? "Editar elección" : "Nueva elección"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre de la elección</label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Consejo Estudiantil 2026"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Facultad</label>
                <input
                  name="facultad"
                  value={form.facultad}
                  onChange={handleChange}
                  placeholder="Ej: Facultad de Ingeniería"
                  style={inputStyle}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label style={labelStyle}>Fecha inicio</label>
                  <input
                    name="fecha_inicio"
                    type="date"
                    value={form.fecha_inicio}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Fecha fin</label>
                  <input
                    name="fecha_fin"
                    type="date"
                    value={form.fecha_fin}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {error && (
              <p
                style={{
                  fontSize: 11,
                  color: "#ff6666",
                  margin: "10px 0 0",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setShowModal(false)}
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
                onClick={handleGuardar}
                disabled={guardando}
                style={{
                  flex: 1,
                  padding: "9px",
                  borderRadius: 8,
                  background: "#E8FF47",
                  border: "none",
                  color: "#0A0A0A",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: guardando ? "not-allowed" : "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {guardando
                  ? "Guardando..."
                  : editando
                    ? "Guardar cambios"
                    : "Crear elección"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER CANDIDATOS */}
      {verCandidatos && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setVerCandidatos(null)}
        >
          <div
            style={{
              background: "#111",
              border: "0.5px solid #2A2A2A",
              borderRadius: 14,
              padding: 24,
              width: 380,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: 18,
                color: "#fff",
                margin: "0 0 6px",
              }}
            >
              {verCandidatos.nombre}
            </h2>
            <p style={{ fontSize: 11, color: "#444", margin: "0 0 18px" }}>
              Candidatos registrados
            </p>
            <div
              style={{
                background: "#0E0E0E",
                border: "0.5px solid #1A1A1A",
                borderRadius: 8,
                padding: 16,
                textAlign: "center",
                color: "#333",
                fontSize: 12,
              }}
            >
              Ve a la sección de Candidatos para gestionar los candidatos de
              esta elección
            </div>
            <button
              onClick={() => setVerCandidatos(null)}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "9px",
                borderRadius: 8,
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

      {/* MODAL CONFIRMAR ELIMINAR */}
      {confirmarEliminar && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
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
              ¿Eliminar elección?
            </h2>
            <p
              style={{
                fontSize: 12,
                color: "#555",
                margin: "0 0 20px",
                lineHeight: 1.5,
              }}
            >
              Se eliminará{" "}
              <strong style={{ color: "#ccc" }}>
                {confirmarEliminar.nombre}
              </strong>{" "}
              permanentemente.
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
