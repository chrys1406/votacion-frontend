import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { useWindowSize } from "../../hooks/useWindowSize";


export default function StudentVotoExito() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/estudiante"), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Space Grotesk', sans-serif",
    }}>
      <div style={{
        background: "#111",
        border: "0.5px solid #1E1E1E",
        borderRadius: 20,
        padding: isMobile ? 24 : 48,
        textAlign: "center",
        maxWidth: 420,
        width: "100%",
      }}>
        {/* ROBOT */}
        <Player
          autoplay
          loop
          src="/robot-final.json"
          style={{ width: 200, height: 200, margin: "0 auto 16px" }}
        />

        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, color: "#fff", margin: "0 0 8px" }}>
          ¡Voto emitido!
        </h1>
        <p style={{ fontSize: 13, color: "#444", margin: "0 0 24px", lineHeight: 1.6 }}>
          Tu voto ha sido registrado correctamente. Gracias por participar en el proceso electoral.
        </p>
        <div style={{
          background: "#34D39910",
          border: "0.5px solid #34D39930",
          borderRadius: 10,
          padding: "10px 16px",
          marginBottom: 24,
          fontSize: 11,
          color: "#34D399",
        }}>
          Serás redirigido automáticamente en 5 segundos...
        </div>
        <button
          onClick={() => navigate("/estudiante")}
          style={{
            width: "100%", padding: "12px",
            background: "#E8FF47", border: "none",
            borderRadius: 10, color: "#0A0A0A",
            fontSize: 13, fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}