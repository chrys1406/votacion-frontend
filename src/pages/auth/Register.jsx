import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import Camera from "../../components/common/Camera";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { plexusParticlesConfig } from "../../utils/particlesConfig";
import { sparksParticles } from "../../utils/particlesSparks";
import { registroService } from "../../services/authService";

function AnimatedTitle() {
  const text = "Crear Cuenta";
  return (
    <h1 className="text-3xl font-extrabold text-white tracking-tight flex justify-center gap-[2px] flex-wrap">
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            animation: `waveLetter 2s ease-in-out infinite`,
            animationDelay: `${i * 0.08}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h1>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nombre: "", registro: "", correo: "", cedula: "" });
  const [foto, setFoto] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFocus = (e) =>
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.registro || !form.correo || !form.cedula) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!foto) {
      setError("Debes tomar una foto para continuar.");
      return;
    }

    setLoading(true);
    setError("");
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const resultado = await registroService(form, foto);
      console.log("Registro exitoso:", resultado);
      navigate("/");
    } catch (err) {
      console.error("Error registro:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setFoto(null);
    setStep(1);
  };

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const inputClass = (name) =>
    `w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all backdrop-blur-md ${
      touched[name]
        ? "bg-white text-black border-white placeholder:text-gray-400 focus:ring-white/60"
        : "bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus:ring-white/30"
    }`;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden bg-black">

      <style>{`
        @keyframes waveLetter {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease forwards;
        }
      `}</style>

      {/* FONDO */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 opacity-40"
        style={{ backgroundImage: "url('/imagenes/upea.jpeg')" }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      {/* PARTÍCULAS */}
      <div className="absolute inset-0 z-20">
        <Particles id="particles" init={particlesInit} options={plexusParticlesConfig} className="w-full h-full" />
      </div>
      <div className="absolute inset-0 z-20">
        <Particles id="particles2" init={particlesInit} options={sparksParticles} className="w-full h-full" />
      </div>

      {/* CARD */}
      <div className="relative z-30 w-full max-w-md animate-fadeInUp">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/10">

          <div className="text-center mb-4">
            <AnimatedTitle />
            <p className="text-gray-300 text-[11px] mt-1.5 uppercase tracking-widest opacity-70">
              Paso {step} de 2 — {step === 1 ? "Datos personales" : "Verificación facial"}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 1 ? "bg-white/50" : "bg-white/10"}`} />
            <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${step >= 2 ? "bg-white/50" : "bg-white/10"}`} />
          </div>

          {step === 1 && (
            <form onSubmit={handleNextStep} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Nombre completo", name: "nombre", placeholder: "Juan Pérez", col: "col-span-2" },
                  { label: "Registro Univ.", name: "registro", placeholder: "12345678" },
                  { label: "Cédula de Identidad", name: "cedula", placeholder: "Tu CI" },
                  { label: "Correo institucional", name: "correo", placeholder: "correo@upea.bo", col: "col-span-2" },
                ].map((field) => (
                  <div key={field.name} className={field.col || ""}>
                    <label className="text-[10px] font-bold text-gray-300 uppercase ml-1 opacity-60 block mb-1">
                      {field.label}
                    </label>
                    <input
                      name={field.name}
                      value={form[field.name]}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      placeholder={field.placeholder}
                      className={inputClass(field.name)}
                    />
                  </div>
                ))}
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button
                type="submit"
                className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 border border-white/20 mt-1"
              >
                Siguiente →
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-gray-300 text-center">
                Necesitamos una foto para verificar tu identidad al votar.
              </p>

              <Camera onCapture={(dataUrl) => setFoto(dataUrl)} onBack={handleBack} />

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              {foto && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-green-500/80 hover:bg-green-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all active:scale-95 border border-green-400/30"
                >
                  {loading ? "⏳ Analizando rostro con IA..." : "✓ Completar registro"}
                </button>
              )}

              <button onClick={handleBack} className="text-xs text-gray-400 underline">
                ← Volver a los datos
              </button>
            </div>
          )}

          <p className="text-center text-sm text-gray-400 mt-5">
            ¿Ya tienes cuenta?{" "}
            <Link to="/" className="text-white font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-white/30 mt-4 uppercase tracking-widest font-mono">
          © 2026 Facultad de Ingeniería - Sistemas
        </p>
      </div>

      {/* MODAL PROCESANDO IA */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, border: "4px solid rgba(255,255,255,0.1)", borderTop: "4px solid #E8FF47", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ color: "white", fontSize: 16, fontWeight: "bold" }}> Analizando rostro...</p>
          <p style={{ color: "#888", fontSize: 12, textAlign: "center", maxWidth: 260 }}>Esto puede tardar unos segundos, por favor espera</p>
        </div>
      )}

    </div>
  );
}