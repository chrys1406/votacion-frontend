import { useState, useEffect } from "react";
import { getCandidatos, crearCandidato, editarCandidato, eliminarCandidato } from "../../services/candidatosService";
import { getElecciones } from "../../services/eleccionesService";
import { getCategoriasPorEleccion } from "../../services/categoriasService";
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

const emptyForm = {
  nombre: "",
  eleccion_id: "",
  categoria_id: "",
  descripcion: "",
  partido: "",
  fotoFile: null,
  fotoPreview: null,
  videoTipo: "url",
  videoUrl: "",
  videoFile: null,
  enlace_propuestas: "",
};

export default function AdminCandidatos() {
  const { isMobile } = useWindowSize();
  const [candidatos, setCandidatos] = useState([]);
  const [elecciones, setElecciones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [verCandidato, setVerCandidato] = useState(null);
  const [confirmarEliminar, setConfirmarEliminar] = useState(null);
  const [filtroEleccion, setFiltroEleccion] = useState("Todas");
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cands, elecs] = await Promise.all([getCandidatos(), getElecciones()]);
      setCandidatos(cands);
      setElecciones(elecs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEleccionChange = async (e) => {
    const eleccion_id = e.target.value;
    setForm({ ...form, eleccion_id, categoria_id: "" });
    if (eleccion_id) {
      const cats = await getCategoriasPorEleccion(eleccion_id);
      setCategorias(cats);
    } else {
      setCategorias([]);
    }
  };

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, fotoFile: file, fotoPreview: URL.createObjectURL(file) });
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, videoFile: file });
  };

  const handleNuevo = () => {
    setEditando(null);
    setForm(emptyForm);
    setCategorias([]);
    setError("");
    setShowModal(true);
  };

  const handleEditar = async (c) => {
    setEditando(c.id);
    if (c.eleccion_id) {
      const cats = await getCategoriasPorEleccion(c.eleccion_id);
      setCategorias(cats);
    }
    setForm({
      ...emptyForm,
      nombre: c.nombre,
      eleccion_id: c.eleccion_id,
      categoria_id: c.categoria_id,
      descripcion: c.descripcion || "",
      partido: c.partido || "",
      fotoPreview: c.foto_url || null,
      videoTipo: "url",
      videoUrl: c.video_url || "",
      enlace_propuestas: c.enlace_propuestas || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre || !form.eleccion_id || !form.categoria_id || !form.descripcion) {
      setError("Completa todos los campos obligatorios");
      return;
    }
    try {
      setGuardando(true);
      setError("");
      const formData = new FormData();
      formData.append("nombre", form.nombre);
      formData.append("descripcion", form.descripcion);
      formData.append("categoria_id", form.categoria_id);
      formData.append("eleccion_id", form.eleccion_id);
      if (form.partido) formData.append("partido", form.partido);
      if (form.enlace_propuestas) formData.append("enlace_propuestas", form.enlace_propuestas);
      if (form.videoTipo === "url" && form.videoUrl) formData.append("video_url", form.videoUrl);
      if (form.fotoFile) formData.append("foto", form.fotoFile);
      if (form.videoTipo === "archivo" && form.videoFile) formData.append("video", form.videoFile);

      if (editando) {
        const updated = await editarCandidato(editando, formData);
        setCandidatos(candidatos.map((c) => c.id === editando ? { ...c, ...updated } : c));
      } else {
        const nuevo = await crearCandidato(formData);
        setCandidatos([...candidatos, nuevo]);
      }
      setShowModal(false);
      cargarDatos();
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await eliminarCandidato(id);
      setCandidatos(candidatos.filter((c) => c.id !== id));
      setConfirmarEliminar(null);
      setVerCandidato(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const categoriasFiltro = filtroEleccion !== "Todas"
    ? candidatos.filter((c) => c.eleccion_id === filtroEleccion)
        .map((c) => ({ id: c.categoria_id, nombre: c.categorias?.nombre }))
        .filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i)
    : [];

  const filtrados = candidatos.filter((c) => {
    const porEleccion = filtroEleccion === "Todas" || c.eleccion_id === filtroEleccion;
    const porCategoria = filtroCategoria === "Todas" || c.categoria_id === filtroCategoria;
    return porEleccion && porCategoria;
  });

  const agrupados = filtrados.reduce((acc, c) => {
    const key = `${c.eleccion_id}-${c.categoria_id}`;
    if (!acc[key]) acc[key] = { eleccion: c.elecciones?.nombre, categoria: c.categorias?.nombre, items: [] };
    acc[key].items.push(c);
    return acc;
  }, {});

  return (
    <div style={{ padding: "22px 24px", fontFamily: "'Space Grotesk', sans-serif", color: "#fff", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#fff", margin: 0, letterSpacing: "-0.5px" }}>
            Gestión de <em style={{ color: "#E8FF47", fontStyle: "italic" }}>Candidatos</em>
          </h1>
          <p style={{ fontSize: 12, color: "#444", margin: "5px 0 0" }}>{candidatos.length} candidatos registrados</p>
        </div>
        <button onClick={handleNuevo} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", background: "#E8FF47", color: "#0A0A0A", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer" }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo candidato
        </button>
      </div>

      {error && !showModal && (
        <div style={{ background: "#ff444415", border: "0.5px solid #ff444440", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#ff6666" }}>{error}</div>
      )}

      {/* FILTROS */}
      <div style={{ display: "flex", gap: isMobile ? 8 : 16, marginBottom: 20, flexWrap: "wrap", alignItems: "center", overflowX: isMobile ? "auto" : "visible" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          <button onClick={() => { setFiltroEleccion("Todas"); setFiltroCategoria("Todas"); }} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: filtroEleccion === "Todas" ? "#E8FF4715" : "#111", color: filtroEleccion === "Todas" ? "#E8FF47" : "#444", border: filtroEleccion === "Todas" ? "0.5px solid #E8FF4730" : "0.5px solid #1E1E1E" }}>Todas</button>
          {elecciones.map((e) => (
            <button key={e.id} onClick={() => { setFiltroEleccion(e.id); setFiltroCategoria("Todas"); }} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: filtroEleccion === e.id ? "#E8FF4715" : "#111", color: filtroEleccion === e.id ? "#E8FF47" : "#444", border: filtroEleccion === e.id ? "0.5px solid #E8FF4730" : "0.5px solid #1E1E1E" }}>{e.nombre}</button>
          ))}
        </div>
        {filtroEleccion !== "Todas" && categoriasFiltro.length > 0 && (
          <>
            <div style={{ width: "0.5px", height: 20, background: "#2A2A2A" }} />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={() => setFiltroCategoria("Todas")} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: filtroCategoria === "Todas" ? "#38BDF815" : "#111", color: filtroCategoria === "Todas" ? "#38BDF8" : "#444", border: filtroCategoria === "Todas" ? "0.5px solid #38BDF830" : "0.5px solid #1E1E1E" }}>Todas</button>
              {categoriasFiltro.map((cat) => (
                <button key={cat.id} onClick={() => setFiltroCategoria(cat.id)} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: filtroCategoria === cat.id ? "#38BDF815" : "#111", color: filtroCategoria === cat.id ? "#38BDF8" : "#444", border: filtroCategoria === cat.id ? "0.5px solid #38BDF830" : "0.5px solid #1E1E1E" }}>{cat.nombre}</button>
              ))}
            </div>
          </>
        )}
      </div>

      {loading && <div style={{ padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>Cargando candidatos...</div>}

      {!loading && candidatos.length === 0 && (
        <div style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 10, padding: 40, textAlign: "center", color: "#333", fontSize: 13 }}>
          No hay candidatos registrados aún
        </div>
      )}

      {/* CANDIDATOS AGRUPADOS */}
      {Object.entries(agrupados).map(([key, grupo]) => (
        <div key={key} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 10, color: "#444", textTransform: "uppercase", letterSpacing: "0.8px", whiteSpace: "nowrap" }}>
              {grupo.eleccion} — {grupo.categoria}
            </span>
            <div style={{ flex: 1, height: "0.5px", background: "#1A1A1A" }} />
            <span style={{ fontSize: 9, color: "#333", background: "#181818", border: "0.5px solid #222", padding: "2px 8px", borderRadius: 20 }}>
              {grupo.items.length} candidatos
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {grupo.items.map((c) => (
              <div key={c.id}
                style={{ background: "#111", border: "0.5px solid #1E1E1E", borderRadius: 12, overflow: "hidden", transition: "border-color 0.15s, transform 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E8FF4725"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1E1E1E"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ height: 160, background: "#0E0E0E", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                  {c.foto_url ? (
                    <img src={c.foto_url} alt={c.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2A2A2A" strokeWidth="1.5">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111 0%, transparent 60%)" }} />
                  <div style={{ position: "absolute", top: 10, left: 10, background: "#E8FF4715", border: "0.5px solid #E8FF4730", borderRadius: 20, padding: "3px 10px", fontSize: 9, color: "#E8FF47", fontWeight: 600, textTransform: "uppercase" }}>
                    {c.categorias?.nombre}
                  </div>
                  {/* BADGE PARTIDO */}
                  {c.partido && (
                    <div style={{ position: "absolute", bottom: 10, left: 10, background: "#38BDF815", border: "0.5px solid #38BDF830", borderRadius: 20, padding: "3px 10px", fontSize: 9, color: "#38BDF8", fontWeight: 600 }}>
                      {c.partido}
                    </div>
                  )}
                </div>

                <div style={{ padding: "14px 14px 12px" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#ddd", margin: "0 0 4px" }}>{c.nombre}</p>
                  <p style={{ fontSize: 11, color: "#444", margin: "0 0 12px", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {c.descripcion}
                  </p>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setVerCandidato(c)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, background: "#181818", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#38BDF830"; e.currentTarget.style.color = "#38BDF8"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#555"; }}
                    >Ver perfil</button>
                    <button onClick={() => handleEditar(c)} style={{ flex: 1, padding: "6px 0", borderRadius: 6, background: "#181818", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E8FF4730"; e.currentTarget.style.color = "#E8FF47"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#555"; }}
                    >Editar</button>
                    <button onClick={() => setConfirmarEliminar(c)} style={{ width: 32, height: 32, borderRadius: 6, background: "#181818", border: "0.5px solid #2A2A2A", color: "#555", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ff444430"; e.currentTarget.style.color = "#ff6666"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.color = "#555"; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: "#111", border: "0.5px solid #2A2A2A", borderRadius: 14, padding: 24, width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff", margin: "0 0 18px" }}>
              {editando ? "Editar candidato" : "Nuevo candidato"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* FOTO */}
              <div>
                <label style={labelStyle}>Foto del candidato</label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, background: "#0E0E0E", border: "0.5px solid #2A2A2A", overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {form.fotoPreview ? (
                      <img src={form.fotoPreview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    )}
                  </div>
                  <label style={{ flex: 1, padding: "9px 12px", borderRadius: 8, background: "#0E0E0E", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {form.fotoFile ? form.fotoFile.name : "Subir foto"}
                    <input type="file" accept="image/*" onChange={handleFoto} style={{ display: "none" }} />
                  </label>
                </div>
              </div>

              {/* NOMBRE */}
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Carlos Mamani" style={inputStyle} />
              </div>

              {/* PARTIDO */}
              <div>
                <label style={labelStyle}>Partido / Agrupación</label>
                <input name="partido" value={form.partido} onChange={handleChange} placeholder="Ej: Partido Demócrata" style={inputStyle} />
              </div>

              {/* ELECCIÓN */}
              <div>
                <label style={labelStyle}>Elección</label>
                <select name="eleccion_id" value={form.eleccion_id} onChange={handleEleccionChange} style={{ ...inputStyle, cursor: "pointer" }}>
                  <option value="" style={{ background: "#111" }}>Selecciona una elección</option>
                  {elecciones.map((e) => (
                    <option key={e.id} value={e.id} style={{ background: "#111" }}>{e.nombre}</option>
                  ))}
                </select>
              </div>

              {/* CATEGORÍA */}
              <div>
                <label style={labelStyle}>Categoría</label>
                <select name="categoria_id" value={form.categoria_id} onChange={handleChange}
                  disabled={!form.eleccion_id}
                  style={{ ...inputStyle, cursor: form.eleccion_id ? "pointer" : "not-allowed", opacity: form.eleccion_id ? 1 : 0.4 }}>
                  <option value="" style={{ background: "#111" }}>Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id} style={{ background: "#111" }}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {/* DESCRIPCIÓN */}
              <div>
                <label style={labelStyle}>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                  placeholder="Describe al candidato y sus propuestas..." rows={3}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
              </div>

              {/* VIDEO */}
              <div>
                <label style={labelStyle}>Video de presentación</label>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {["url", "archivo"].map((tipo) => (
                    <button key={tipo} onClick={() => setForm({ ...form, videoTipo: tipo })} style={{ padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", background: form.videoTipo === tipo ? "#38BDF815" : "#0E0E0E", color: form.videoTipo === tipo ? "#38BDF8" : "#444", border: form.videoTipo === tipo ? "0.5px solid #38BDF830" : "0.5px solid #2A2A2A" }}>
                      {tipo === "url" ? "🔗 Enlace" : "📁 Archivo"}
                    </button>
                  ))}
                </div>
                {form.videoTipo === "url" ? (
                  <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." style={inputStyle} />
                ) : (
                  <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: 8, background: "#0E0E0E", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    {form.videoFile ? form.videoFile.name : "Seleccionar video"}
                    <input type="file" accept="video/*" onChange={handleVideo} style={{ display: "none" }} />
                  </label>
                )}
              </div>

              {/* ENLACE PROPUESTAS */}
              <div>
                <label style={labelStyle}>Enlace de propuestas</label>
                <input name="enlace_propuestas" value={form.enlace_propuestas} onChange={handleChange} placeholder="https://drive.google.com/..." style={inputStyle} />
              </div>
            </div>

            {error && <p style={{ fontSize: 11, color: "#ff6666", margin: "10px 0 0", textAlign: "center" }}>{error}</p>}

            <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "transparent", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Cancelar</button>
              <button onClick={handleGuardar} disabled={guardando} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#E8FF47", border: "none", color: "#0A0A0A", fontSize: 12, fontWeight: 700, cursor: guardando ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>
                {guardando ? "Guardando..." : editando ? "Guardar cambios" : "Crear candidato"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VER PERFIL */}
      {verCandidato && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={() => setVerCandidato(null)}>
          <div style={{ background: "#111", border: "0.5px solid #2A2A2A", borderRadius: 16, width: "100%", maxWidth: 420, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{ height: 200, background: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
              {verCandidato.foto_url ? (
                <img src={verCandidato.foto_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="1">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              )}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111 0%, transparent 50%)" }} />
              <div style={{ position: "absolute", top: 12, left: 12, background: "#E8FF4715", border: "0.5px solid #E8FF4730", borderRadius: 20, padding: "3px 12px", fontSize: 9, color: "#E8FF47", fontWeight: 600, textTransform: "uppercase" }}>
                {verCandidato.categorias?.nombre}
              </div>
              {verCandidato.partido && (
                <div style={{ position: "absolute", top: 12, right: 40, background: "#38BDF815", border: "0.5px solid #38BDF830", borderRadius: 20, padding: "3px 12px", fontSize: 9, color: "#38BDF8", fontWeight: 600 }}>
                  {verCandidato.partido}
                </div>
              )}
              <button onClick={() => setVerCandidato(null)} style={{ position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.5)", border: "0.5px solid #2A2A2A", color: "#666", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div style={{ padding: "16px 20px 20px" }}>
              <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#fff", margin: "0 0 2px" }}>{verCandidato.nombre}</p>
              <p style={{ fontSize: 11, color: "#444", margin: "0 0 14px" }}>{verCandidato.elecciones?.nombre}</p>
              <p style={{ fontSize: 12, color: "#666", lineHeight: 1.7, margin: "0 0 16px" }}>{verCandidato.descripcion}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {verCandidato.video_url && (
                  <a href={verCandidato.video_url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, background: "#38BDF810", border: "0.5px solid #38BDF820", textDecoration: "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#38BDF815", display: "flex", alignItems: "center", justifyContent: "center", color: "#38BDF8" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#38BDF8", fontWeight: 600, margin: 0 }}>Video de presentación</p>
                      <p style={{ fontSize: 10, color: "#444", margin: 0 }}>Ver video</p>
                    </div>
                  </a>
                )}
                {verCandidato.enlace_propuestas && (
                  <a href={verCandidato.enlace_propuestas} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 9, background: "#A78BFA10", border: "0.5px solid #A78BFA20", textDecoration: "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: "#A78BFA15", display: "flex", alignItems: "center", justifyContent: "center", color: "#A78BFA" }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "#A78BFA", fontWeight: 600, margin: 0 }}>Plan de propuestas</p>
                      <p style={{ fontSize: 10, color: "#444", margin: 0 }}>Ver documento</p>
                    </div>
                  </a>
                )}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => setVerCandidato(null)} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "transparent", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Cerrar</button>
                <button onClick={() => setConfirmarEliminar(verCandidato)} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#ff444415", border: "0.5px solid #ff444430", color: "#ff6666", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {confirmarEliminar && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center" }}
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
            <h2 style={{ fontSize: 15, color: "#fff", margin: "0 0 6px", fontWeight: 600 }}>¿Eliminar candidato?</h2>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 20px", lineHeight: 1.5 }}>
              Se eliminará a <strong style={{ color: "#ccc" }}>{confirmarEliminar.nombre}</strong> permanentemente.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmarEliminar(null)} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "transparent", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Cancelar</button>
              <button onClick={() => handleEliminar(confirmarEliminar.id)} style={{ flex: 1, padding: "9px", borderRadius: 8, background: "#ff444420", border: "0.5px solid #ff444440", color: "#ff6666", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}