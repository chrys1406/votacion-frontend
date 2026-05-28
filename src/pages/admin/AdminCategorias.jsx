import { useState, useEffect } from "react";
import { getCategorias, crearCategoria, editarCategoria, eliminarCategoria } from "../../services/categoriasService";
import { getElecciones } from "../../services/eleccionesService";
import { useWindowSize } from "../../hooks/useWindowSize";

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

export default function AdminCategorias() {
  const { isMobile } = useWindowSize();
  const [categorias, setCategorias] = useState([]);
  const [elecciones, setElecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: "", eleccion_id: "" });
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [filtro, setFiltro] = useState("Todas");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cats, elecs] = await Promise.all([getCategorias(), getElecciones()]);
      setCategorias(cats);
      setElecciones(elecs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNueva = () => {
    setEditando(null);
    setForm({ nombre: "", eleccion_id: "" });
    setError("");
    setShowModal(true);
  };

  const handleEditar = (cat) => {
    setEditando(cat.id);
    setForm({ nombre: cat.nombre, eleccion_id: cat.eleccion_id });
    setError("");
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.eleccion_id) {
      setError("Completa todos los campos");
      return;
    }
    try {
      setGuardando(true);
      setError("");
      if (editando) {
        const updated = await editarCategoria(editando, form);
        setCategorias(categorias.map((c) => c.id === editando ? updated : c));
      } else {
        const nueva = await crearCategoria(form);
        setCategorias([...categorias, nueva]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarCategoria(id);
      setCategorias(categorias.filter((c) => c.id !== id));
      setConfirmarEliminar(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const nombreEleccion = (eleccion_id) => {
    const el = elecciones.find((e) => e.id === eleccion_id);
    return el ? el.nombre : "Sin elección";
  };

  const filtradas = filtro === "Todas"
    ? categorias
    : categorias.filter((c) => c.eleccion_id === filtro);

  const agrupadas = filtradas.reduce((acc, cat) => {
    const key = cat.eleccion_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(cat);
    return acc;
  }, {});

  return (
    <div style={{ padding: "22px 24px", fontFamily: "'Space Grotesk', sans-serif", color: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
            Gestión de{" "}
            <em style={{ color: "#E8FF47", fontStyle: "italic" }}>Categorías</em>
          </h1>
          <p style={{ fontSize: 12, color: "#444", margin: "5px 0 0" }}>
            {categorias.length} categorías creadas en total
          </p>
        </div>
        <button onClick={handleNueva} style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "8px 16px", background: "#E8FF47", color: "#0A0A0A",
          border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva categoría
        </button>
      </div>

      {/* ERROR */}
      {error && !showModal && (
        <div style={{ background: "#ff444415", border: "0.5px solid #ff444440", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#ff6666" }}>
          {error}
        </div>
      )}

      {/* FILTROS */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={() => setFiltro("Todas")} style={{
          padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
          fontFamily: "'Space Grotesk', sans-serif",
          background: filtro === "Todas" ? "#E8FF4715" : "#111",
          color: filtro === "Todas" ? "#E8FF47" : "#444",
          border: filtro === "Todas" ? "0.5px solid #E8FF4730" : "0.5px solid #1E1E1E",
        }}>Todas</button>
        {elecciones.map((e) => (
          <button key={e.id} onClick={() => setFiltro(e.id)} style={{
            padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
            background: filtro === e.id ? "#E8FF4715" : "#111",
            color: filtro === e.id ? "#E8FF47" : "#444",
            border: filtro === e.id ? "0.5px solid #E8FF4730" : "0.5px solid #1E1E1E",
          }}>{e.nombre}</button>
        ))}
      </div>

      {/* LOADING */}
      {loading && (
        <div style={{ padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          Cargando categorías...
        </div>
      )}

      {/* VACÍO */}
      {!loading && categorias.length === 0 && (
        <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          No hay categorías creadas aún
        </div>
      )}

      {/* CATEGORÍAS AGRUPADAS */}
      {Object.entries(agrupadas).map(([eleccion_id, cats]) => (
        <div key={eleccion_id} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {nombreEleccion(eleccion_id)}
            </span>
            <div style={{ flex: 1, height: "0.5px", background: "#1A1A1A" }} />
            <span style={{ fontSize: 9, color: "#333", background: "#181818", border: "0.5px solid #222", padding: "2px 8px", borderRadius: 20 }}>
              {cats.length} categorías
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {cats.map((cat) => (
              <div key={cat.id}
                style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 16, transition: "border-color 0.15s" }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = "#E8FF4720"}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "#1E1E1E"}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#181818", border: "0.5px solid #222", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, color: "#E8FF47" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 6h16M4 10h16M4 14h8"/>
                  </svg>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#ccc", margin: "0 0 14px" }}>{cat.nombre}</p>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => handleEditar(cat)} style={{
                    flex: 1, padding: "6px 0", borderRadius: 6,
                    background: "#181818", border: "0.5px solid #2A2A2A",
                    color: "#555", fontSize: 11, cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E8FF4730"; e.currentTarget.style.color = "#E8FF47"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#555"; }}
                  >Editar</button>
                  <button onClick={() => setConfirmarEliminar(cat)} style={{
                    flex: 1, padding: "6px 0", borderRadius: 6,
                    background: "#181818", border: "0.5px solid #2A2A2A",
                    color: "#555", fontSize: 11, cursor: "pointer",
                    fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff444430"; e.currentTarget.style.color = "#ff6666"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#555"; }}
                  >Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: "#111", border: "0.5px solid #2A2A2A", borderRadius: 14, padding: 24, width: 380 }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff", margin: "0 0 18px" }}>
              {editando ? "Editar categoría" : "Nueva categoría"}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Nombre de la categoría</label>
                <input name="nombre" value={form.nombre} onChange={handleChange}
                  placeholder="Ej: Presidente, Vicepresidente..." style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Elección</label>
                <select name="eleccion_id" value={form.eleccion_id} onChange={handleChange}
                  style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="" style={{ background: "#111" }}>Selecciona una elección</option>
                  {elecciones.map((e) => (
                    <option key={e.id} value={e.id} style={{ background: "#111" }}>{e.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && <p style={{ fontSize: 11, color: "#ff6666", margin: "10px 0 0", textAlign: "center" }}>{error}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: "9px", borderRadius: 8, background: "transparent",
                border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} style={{
                flex: 1, padding: "9px", borderRadius: 8, background: "#E8FF47",
                border: "none", color: "#0A0A0A", fontSize: 12, fontWeight: 700,
                cursor: guardando ? "not-allowed" : "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear categoría"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {confirmarEliminar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setConfirmarEliminar(null)}>
          <div style={{ background: "#111", border: "0.5px solid #2A2A2A", borderRadius: 14, padding: 24, width: 360 }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ff444412", border: "0.5px solid #ff444430", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ff6666" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 15, color: "#fff", margin: "0 0 6px", fontWeight: 600 }}>¿Eliminar categoría?</h2>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 20px", lineHeight: 1.5 }}>
              Se eliminará <strong style={{ color: "#ccc" }}>{confirmarEliminar.nombre}</strong> permanentemente.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmarEliminar(null)} style={{
                flex: 1, padding: "9px", borderRadius: 8, background: "transparent",
                border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>Cancelar</button>
              <button onClick={() => handleEliminar(confirmarEliminar.id)} style={{
                flex: 1, padding: "9px", borderRadius: 8, background: "#ff444420",
                border: "0.5px solid #ff444440", color: "#ff6666", fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif",
              }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}