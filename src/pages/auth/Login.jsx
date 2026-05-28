import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginService } from "../../services/authService";
import Particles from "react-particles";
import { loadSlim } from "tsparticles-slim";
import { plexusParticlesConfig } from "../../utils/particlesConfig";
import { sparksParticles } from "../../utils/particlesSparks";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ registro: "", cedula: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!form.registro || !form.cedula) {
    setError("Por favor completa todos los campos.");
    return;
  }

  try {
    const data = await loginService(form.registro, form.cedula);
    login(
      {
        registro: data.registro || form.registro,
        nombre: data.nombre,
        rol: data.rol,
        usuario_id: data.usuario_id,
      },
      data.access_token
    );

    if (data.rol === "admin") {
      navigate("/admin");
    } else {
      navigate("/estudiante");
    }
  } catch (err) {
    setError(err.message);
  }
};

  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  /* ── Configs idénticas a las tuyas pero con colores azul/violeta ── */
  const plexusAzul = {
    ...plexusParticlesConfig,
    particles: {
      ...plexusParticlesConfig.particles,
      color: { value: ["#6384ff", "#a78bfa", "#ffffff"] },
      links: {
        ...plexusParticlesConfig.particles.links,
        color: "#6384ff",
        opacity: 0.2,
      },
      shadow: {
        enable: true,
        color: "#6384ff",
        blur: 4,
      },
    },
  };

  const sparksAzul = {
    ...sparksParticles,
    particles: {
      ...sparksParticles.particles,
      color: { value: ["#6384ff", "#a78bfa", "#38d9f5"] },
    },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 overflow-hidden bg-[#080a16]">

      {/* ── FOTO DE FONDO ── */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: "url('/imagenes/upea.jpeg')",
          filter: "brightness(0.35) saturate(0.6)",
        }}
      />

      {/* ── GRADIENTE OSCURO ENCIMA ── */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#080a16]/80 via-[#080a16]/60 to-[#080a16]/90" />

      {/* ── GRILLA SUTIL ── */}
      <div
        className="absolute inset-0 z-10 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,132,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,132,255,0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── TUS PARTÍCULAS PLEXUS (color azul) ── */}
      <div className="absolute inset-0 z-20">
        <Particles
          id="particles-plexus"
          init={particlesInit}
          options={plexusAzul}
          className="w-full h-full"
        />
      </div>

      {/* ── TUS PARTÍCULAS SPARKS (color azul) ── */}
      <div className="absolute inset-0 z-20">
        <Particles
          id="particles-sparks"
          init={particlesInit}
          options={sparksAzul}
          className="w-full h-full"
        />
      </div>

      {/* ── LÍNEA DE ESCANEO ── */}
      <div className="absolute inset-0 z-20 overflow-hidden pointer-events-none">
        <div className="scan-line" />
      </div>

      {/* ── CARD DE LOGIN ── */}
      <div className="relative z-30 w-full max-w-sm animate-fadeInUp">
        <div
          className="relative rounded-[18px] p-8 border"
          style={{
            background: "rgba(10, 13, 28, 0.82)",
            borderColor: "rgba(99,132,255,0.22)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >

          {/* Corners decorativos */}
          <span className="corner-tl" />
          <span className="corner-tr" />
          <span className="corner-bl" />
          <span className="corner-br" />

          {/* Topbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(99,132,255,0.55)" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(99,132,255,0.25)" }} />
              <div className="w-2 h-2 rounded-full" style={{ background: "rgba(99,132,255,0.1)" }} />
            </div>
            <span className="text-[10px] tracking-widest" style={{ color: "rgba(99,132,255,0.5)", fontFamily: "monospace" }}>
              v2.0.26
            </span>
          </div>

          {/* Logo + título */}
          <div className="flex flex-col items-center mb-7 gap-2.5">
            <div className="relative flex items-center justify-center w-14 h-14">
              {/* Anillos de pulso */}
              <div className="pulse-ring-1" />
              <div className="pulse-ring-2" />
              {/* Hexágono SVG */}
              <svg viewBox="0 0 56 56" fill="none" className="absolute inset-0 w-full h-full">
                <polygon
                  points="28,2 52,15 52,41 28,54 4,41 4,15"
                  fill="rgba(99,132,255,0.13)"
                  stroke="rgba(99,132,255,0.45)"
                  strokeWidth="1.2"
                />
              </svg>
              <span className="relative z-10 text-2xl">🗳️</span>
            </div>

            <div className="text-center">
              <h1
                className="text-sm font-bold tracking-[.09em] uppercase"
                style={{ color: "#dce4ff", fontFamily: "monospace" }}
              >
                Sistema de Votación
              </h1>
              <p
                className="text-[10px] tracking-[.1em] uppercase mt-0.5"
                style={{ color: "rgba(138,148,255,0.5)", fontFamily: "monospace" }}
              >
                Universidad Pública de El Alto
              </p>
            </div>

            {/* Badge sistema activo */}
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] tracking-wider uppercase"
              style={{
                background: "rgba(56,217,140,0.08)",
                border: "1px solid rgba(56,217,140,0.22)",
                color: "#38d98c",
                fontFamily: "monospace",
              }}
            >
              <span className="status-dot" />
              Sistema en línea
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label
                className="block text-[10px] tracking-[.1em] uppercase mb-1.5"
                style={{ color: "rgba(138,148,255,0.5)", fontFamily: "monospace" }}
              >
                Registro Universitario
              </label>
              <div className="relative">
                {/* Ícono usuario */}
                <svg className="field-ico" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="3" stroke="#6384ff" strokeWidth="1.2" />
                  <path d="M1 13c0-3 2.7-5 6-5s6 2 6 5" stroke="#6384ff" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                <input
                  name="registro"
                  value={form.registro}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  className="field-input"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-[10px] tracking-[.1em] uppercase mb-1.5"
                style={{ color: "rgba(138,148,255,0.5)", fontFamily: "monospace" }}
              >
                Cédula de Identidad
              </label>
              <div className="relative">
                {/* Ícono candado */}
                <svg className="field-ico" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="5" width="10" height="8" rx="1.5" stroke="#6384ff" strokeWidth="1.2" />
                  <path d="M5 5V4a2 2 0 114 0v1" stroke="#6384ff" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="7" cy="9" r="1" fill="#6384ff" />
                </svg>
                <input
                  name="cedula"
                  type="password"
                  value={form.cedula}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="field-input"
                />
              </div>
            </div>

            {error && (
              <div
                className="text-xs py-2 px-3 rounded-lg text-center"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  fontFamily: "monospace",
                }}
              >
                {error}
              </div>
            )}

            <button type="submit" className="btn-submit">
              Ingresar al sistema →
            </button>
          </form>

          {/* Divider + registro */}
          <div className="flex items-center gap-2.5 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(99,132,255,0.1)" }} />
            <span className="text-[10px]" style={{ color: "rgba(99,132,255,0.28)", fontFamily: "monospace" }}>o</span>
            <div className="flex-1 h-px" style={{ background: "rgba(99,132,255,0.1)" }} />
          </div>

          <p className="text-center text-[11px]" style={{ color: "rgba(138,148,255,0.4)", fontFamily: "monospace" }}>
            ¿Sin cuenta?{" "}
            <Link
              to="/registro"
              className="font-bold hover:opacity-80 transition-opacity"
              style={{ color: "#6384ff" }}
            >
              Regístrate ahora
            </Link>
          </p>
        </div>

        {/* Copyright */}
        <p
          className="text-center text-[10px] mt-4 tracking-widest uppercase"
          style={{ color: "rgba(99,132,255,0.2)", fontFamily: "monospace" }}
        >
          © 2026 Facultad de Ingeniería · Sistemas
        </p>
      </div>

      {/* ── ESTILOS GLOBALES DEL COMPONENTE ── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.65s ease forwards;
        }

        @keyframes pulseRingAnim {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50%       { transform: scale(1.14); opacity: 0.15; }
        }
        .pulse-ring-1 {
          position: absolute; inset: -8px;
          border-radius: 50%;
          border: 1.5px solid rgba(99,132,255,0.4);
          animation: pulseRingAnim 2.6s ease-in-out infinite;
        }
        .pulse-ring-2 {
          position: absolute; inset: -17px;
          border-radius: 50%;
          border: 1px solid rgba(99,132,255,0.18);
          animation: pulseRingAnim 2.6s ease-in-out infinite 0.9s;
        }

        @keyframes blinkDot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .status-dot {
          width: 5px; height: 5px;
          background: #38d98c;
          border-radius: 50%;
          display: inline-block;
          animation: blinkDot 1.6s ease-in-out infinite;
        }

        @keyframes scanAnim {
          0%   { top: -2px; opacity: 0.35; }
          50%  { opacity: 0.12; }
          100% { top: 100%; opacity: 0; }
        }
        .scan-line {
          position: absolute;
          left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(99,132,255,0.35), transparent);
          animation: scanAnim 5s linear infinite;
        }

        /* Corners decorativos de la card */
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 13px; height: 13px;
          pointer-events: none;
        }
        .corner-tl { top: -1px; left: -1px;
          border-top: 2px solid rgba(99,132,255,0.55);
          border-left: 2px solid rgba(99,132,255,0.55);
          border-radius: 4px 0 0 0; }
        .corner-tr { top: -1px; right: -1px;
          border-top: 2px solid rgba(99,132,255,0.55);
          border-right: 2px solid rgba(99,132,255,0.55);
          border-radius: 0 4px 0 0; }
        .corner-bl { bottom: -1px; left: -1px;
          border-bottom: 2px solid rgba(99,132,255,0.55);
          border-left: 2px solid rgba(99,132,255,0.55);
          border-radius: 0 0 0 4px; }
        .corner-br { bottom: -1px; right: -1px;
          border-bottom: 2px solid rgba(99,132,255,0.55);
          border-right: 2px solid rgba(99,132,255,0.55);
          border-radius: 0 0 4px 0; }

        /* Ícono dentro del input */
        .field-ico {
          position: absolute;
          left: 11px; top: 50%;
          transform: translateY(-50%);
          width: 14px; height: 14px;
          opacity: 0.4;
          pointer-events: none;
        }

        /* Input */
        .field-input {
          width: 100%;
          background: rgba(99,132,255,0.07);
          border: 1px solid rgba(99,132,255,0.16);
          border-radius: 9px;
          color: #c8d0ff;
          font-size: 13px;
          font-family: monospace;
          padding: 11px 13px 11px 34px;
          outline: none;
          box-sizing: border-box;
          transition: border-color .2s, background .2s;
        }
        .field-input::placeholder { color: rgba(99,132,255,0.3); font-size: 12px; }
        .field-input:focus {
          border-color: rgba(99,132,255,0.5);
          background: rgba(99,132,255,0.11);
        }

        /* Botón */
        .btn-submit {
          width: 100%;
          padding: 13px 0;
          background: #6384ff;
          border: none;
          border-radius: 10px;
          color: #07090f;
          font-size: 12px;
          font-weight: 700;
          font-family: monospace;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: opacity .15s, transform .1s;
        }
        .btn-submit:hover { opacity: 0.88; }
        .btn-submit:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
}
