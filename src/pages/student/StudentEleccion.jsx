import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Papeleta from "../../components/student/Papeleta";
import Camera from "../../components/common/Camera";
import { getCandidatosPorEleccion } from "../../services/candidatosService";
import { getCategoriasPorEleccion } from "../../services/categoriasService";
import { useWindowSize } from "../../hooks/useWindowSize";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function StudentEleccion() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate(); 
  const { isMobile } = useWindowSize();

  const [candidatos, setCandidatos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modales
  const [showReglasModal, setShowReglasModal] = useState(true);
  const [showVerificacionModal, setShowVerificacionModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Votación
  const [seleccionados, setSeleccionados] = useState({});
  const [foto, setFoto] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [votando, setVotando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [cands, cats] = await Promise.all([
        getCandidatosPorEleccion(id),
        getCategoriasPorEleccion(id),
      ]);
      setCandidatos(cands);
      setCategorias(cats);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Validar si el voto es válido
  const partidos_seleccionados = [...new Set(Object.values(seleccionados).map((v) => v.partido))];
  const totalSeleccionados = Object.keys(seleccionados).length;
  const votoValido = partidos_seleccionados.length === 1 && totalSeleccionados === categorias.length;

const handleVotar = () => {
  if (totalSeleccionados === 0) {
    setError("Debes seleccionar al menos un candidato para votar");
    return;
  }
  setError("");
  setShowVerificacionModal(true);
};

  const handleFotoCapturada = (dataUrl) => {
    setFoto(dataUrl);
  };

  const handleVerificarYConfirmar = async () => {
    if (!foto) {
      setError("Debes tomar una foto para verificar tu identidad");
      return;
    }

    try {
      setVerificando(true);
      setError("");

      // Obtener embedding guardado del usuario
      const embeddingRes = await fetch(`${BASE_URL}/auth/embedding/${user.usuario_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!embeddingRes.ok) throw new Error("No se encontró tu registro facial");
      const { embedding } = await embeddingRes.json();

      // Comparar 1:1 con el microservicio IA
      const compareRes = await fetch(`${import.meta.env.VITE_IA_URL}/compare-1v1`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagen: foto, embedding }),
      });

      const resultado = await compareRes.json();

      if (!resultado.coincide) {
        setError("❌ No se pudo verificar tu identidad. Intenta con mejor iluminación.");
        setVerificando(false);
        return;
      }

      // Verificación exitosa → mostrar confirmación
      setShowVerificacionModal(false);
      setShowConfirmModal(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setVerificando(false);
    }
  };

  const handleEmitirVoto = async () => {
    try {
      setVotando(true);
      setError("");

      // Emitir voto por cada categoría
      const votos = Object.entries(seleccionados).map(([categoria_id, val]) => ({
        usuario_id: user.usuario_id,
        candidato_id: val.candidatoId,
        categoria_id,
        eleccion_id: id,
      }));

      for (const voto of votos) {
        const res = await fetch(`${BASE_URL}/votos/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(voto),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Error al emitir voto");
        }
      }

      navigate("/estudiante/voto-exitoso");

    } catch (err) {
      setError(err.message);
      setShowConfirmModal(false);
    } finally {
      setVotando(false);
    }
  };

  if (loading) return (
    <div style={{ color: "#fff", textAlign: "center", padding: 60, fontFamily: "'Space Grotesk', sans-serif" }}>
      Cargando papeleta...
    </div>
  );

  return (
    <div style={{ color: "#fff", fontFamily: "'Space Grotesk', sans-serif", maxWidth: 1100, margin: "0 auto" }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", gap: isMobile ? 12 : 0 }}>
        <div>
          <button onClick={() => navigate("/estudiante")} style={{
            background: "none", border: "none", color: "#444", fontSize: 12,
            cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontFamily: "'Space Grotesk', sans-serif", marginBottom: 8,
          }}>
            ← Volver
          </button>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, color: "#fff", margin: 0 }}>
            Papeleta de <em style={{ color: "#E8FF47", fontStyle: "italic" }}>Votación</em>
          </h1>
          <p style={{ fontSize: 12, color: "#444", margin: "4px 0 0" }}>
            Selecciona un candidato por categoría del mismo partido
          </p>
        </div>
        <button
        onClick={handleVotar}
        disabled={totalSeleccionados === 0}
        style={{
          padding: "12px 24px",
          width: isMobile ? "100%" : "auto",
          background: totalSeleccionados > 0 ? "#E8FF47" : "#1A1A1A",
          color: totalSeleccionados > 0 ? "#0A0A0A" : "#444",
          border: "none", borderRadius: 10,
          fontSize: 13, fontWeight: 700,
          fontFamily: "'Space Grotesk', sans-serif",
          cursor: totalSeleccionados > 0 ? "pointer" : "not-allowed",
          transition: "all 0.2s",
         }}
         >
          🗳️ Votar
          </button>
        </div>

      {/* ERROR */}
      {error && (
        <div style={{ background: "#ff444415", border: "0.5px solid #ff444440", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#ff6666" }}>
          {error}
        </div>
      )}

      {/* PAPELETA */}
      <Papeleta
        candidatos={candidatos}
        categorias={categorias}
        onVotoChange={setSeleccionados}
      />

      {/* ── MODAL REGLAS ── */}
      {showReglasModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111", border: "0.5px solid #2A2A2A", borderRadius: 16, padding: 28, width: "100%", maxWidth: 440 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#E8FF4715", border: "0.5px solid #E8FF4730", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>
              📋
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: "#fff", margin: "0 0 8px" }}>
              Reglas de votación
            </h2>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 20px", lineHeight: 1.6 }}>
              Antes de votar, lee las siguientes reglas:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                { icon: "✅", text: "Debes seleccionar un candidato por cada categoría" },
                { icon: "🏛️", text: "Todos tus candidatos deben ser del mismo partido" },
                { icon: "❌", text: "Si mezclas partidos, tu voto será nulo" },
                { icon: "🔒", text: "Solo puedes votar una vez por elección" },
                { icon: "📸", text: "Se verificará tu identidad con reconocimiento facial antes de votar" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "#0E0E0E", border: "0.5px solid #1A1A1A", borderRadius: 8 }}>
                  <span style={{ fontSize: 14, flexShrink: 0 }}>{r.icon}</span>
                  <p style={{ fontSize: 12, color: "#888", margin: 0, lineHeight: 1.5 }}>{r.text}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowReglasModal(false)}
              style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#E8FF47", border: "none", color: "#0A0A0A", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Entendido, comenzar a votar →
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL VERIFICACIÓN FACIAL ── */}
      {showVerificacionModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111", border: "0.5px solid #2A2A2A", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff", margin: "0 0 6px" }}>
              Verificación de identidad
            </h2>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 20px", lineHeight: 1.5 }}>
              Para confirmar tu voto necesitamos verificar que eres tú. Toma una foto con buena iluminación y sin lentes.
            </p>

            <Camera onCapture={handleFotoCapturada} onBack={() => { setShowVerificacionModal(false); setFoto(null); }} />

            {error && <p style={{ fontSize: 11, color: "#ff6666", margin: "10px 0 0", textAlign: "center" }}>{error}</p>}

            {foto && (
              <button
                onClick={handleVerificarYConfirmar}
                disabled={verificando}
                style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 10, background: "#E8FF47", border: "none", color: "#0A0A0A", fontSize: 13, fontWeight: 700, cursor: verificando ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {verificando ? "⏳ Verificando identidad..." : "✅ Verificar y continuar"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMACIÓN ── */}
      {showConfirmModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111", border: "0.5px solid #2A2A2A", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "#34D39915", border: "0.5px solid #34D39930", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 22 }}>
              ✅
            </div>
            <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, color: "#fff", margin: "0 0 8px" }}>
              ¿Confirmas tu voto?
            </h2>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 16px", lineHeight: 1.5 }}>
              Estás votando por el partido <strong style={{ color: "#E8FF47" }}>{partidos_seleccionados[0]}</strong>. Esta acción no se puede deshacer.
            </p>

            {/* Resumen del voto */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {Object.entries(seleccionados).map(([cat_id, val]) => {
                const cat = categorias.find((c) => c.id === cat_id);
                const cand = candidatos.find((c) => c.id === val.candidatoId);
                return (
                  <div key={cat_id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "#0E0E0E", border: "0.5px solid #1A1A1A", borderRadius: 8 }}>
                    <span style={{ fontSize: 11, color: "#444" }}>{cat?.nombre}</span>
                    <span style={{ fontSize: 11, color: "#ccc", fontWeight: 500 }}>{cand?.nombre}</span>
                  </div>
                );
              })}
            </div>

            {error && <p style={{ fontSize: 11, color: "#ff6666", margin: "0 0 10px", textAlign: "center" }}>{error}</p>}

            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowConfirmModal(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "transparent", border: "0.5px solid #2A2A2A", color: "#555", fontSize: 12, cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>
                Cancelar
              </button>
              <button onClick={handleEmitirVoto} disabled={votando} style={{ flex: 1, padding: "10px", borderRadius: 8, background: "#E8FF47", border: "none", color: "#0A0A0A", fontSize: 13, fontWeight: 700, cursor: votando ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>
                {votando ? "Enviando..." : "✓ Confirmar voto"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}