import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import * as faceapi from "face-api.js";

export default function Camera({ onCapture, onBack }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const validacionIntervalRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [rostroValido, setRostroValido] = useState(false);
  const [mensajeRostro, setMensajeRostro] = useState("Posiciona tu rostro frente a la cámara");
  const [modelosCargados, setModelosCargados] = useState(false);

  // Cargar modelos al montar
  useEffect(() => {
    const cargarModelos = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
      setModelosCargados(true);
    };
    cargarModelos();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (fullscreen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [fullscreen]);

  const startCamera = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setStreaming(true);
    });
  };

  const stopCamera = () => {
    clearInterval(validacionIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
    setRostroValido(false);
    setMensajeRostro("Posiciona tu rostro frente a la cámara");
  };

  const iniciarValidacionLocal = useCallback(() => {
    validacionIntervalRef.current = setInterval(async () => {
      const video = videoRef.current;
      if (!video || !modelosCargados || video.readyState < 2) return;

      const deteccion = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!deteccion) {
        setRostroValido(false);
        setMensajeRostro("No se detectó ningún rostro. Mira directo a la cámara");
        return;
      }

      const { box } = deteccion.detection;
      const videoArea = video.videoWidth * video.videoHeight;
      const faceArea = box.width * box.height;
      const faceRatio = faceArea / videoArea;

      if (faceRatio < 0.05) {
        setRostroValido(false);
        setMensajeRostro("Acércate más a la cámara");
        return;
      }

      if (faceRatio > 0.6) {
        setRostroValido(false);
        setMensajeRostro("Aléjate un poco de la cámara");
        return;
      }

      setRostroValido(true);
      setMensajeRostro("Rostro detectado correctamente");
    }, 500); // cada 500ms — muy fluido
  }, [modelosCargados]);

  const handleOpenCamera = () => {
    setFullscreen(true);
    startCamera();
    setTimeout(() => iniciarValidacionLocal(), 1000);
  };

  const handleCapture = () => {
    clearInterval(validacionIntervalRef.current);
    setCapturing(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg");
        stopCamera();
        setFullscreen(false);
        setCapturing(false);
        setPhoto(dataUrl);
        onCapture(dataUrl);
      });
    });
  };

  const retry = () => {
    setPhoto(null);
    setFullscreen(true);
    startCamera();
    setTimeout(() => iniciarValidacionLocal(), 1000);
  };

  const handleBack = () => {
    stopCamera();
    setFullscreen(false);
    if (onBack) onBack();
  };

  const fullscreenPortal = fullscreen && createPortal(
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: 99999, backgroundColor: "black", overflow: "hidden", margin: 0, padding: 0 }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", transform: "scaleX(-1)", margin: 0, padding: 0, display: "block", backgroundColor: "black" }}
      />

      {/* INDICADOR TIEMPO REAL */}
      {!capturing && streaming && (
        <div style={{ position: "absolute", top: 20, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 100000 }}>
          <div style={{
            width: 16, height: 16, borderRadius: "50%",
            backgroundColor: !modelosCargados ? "#888" : rostroValido ? "#22c55e" : "#ef4444",
            boxShadow: !modelosCargados ? "none" : rostroValido ? "0 0 12px #22c55e" : "0 0 12px #ef4444",
            transition: "all 0.3s ease",
          }} />
          <div style={{
            backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 12, padding: "6px 16px",
            color: !modelosCargados ? "#888" : rostroValido ? "#22c55e" : "#ef4444",
            fontSize: 13, fontWeight: "bold", textAlign: "center", maxWidth: "80%",
            transition: "all 0.3s ease",
          }}>
            {!modelosCargados ? "⏳ Cargando detector..." : rostroValido ? "✅ " : "⚠️ "}{modelosCargados && mensajeRostro}
          </div>
        </div>
      )}

      {capturing && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 100001, gap: 16 }}>
          <div style={{ width: 48, height: 48, border: "4px solid rgba(255,255,255,0.2)", borderTop: "4px solid white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Procesando foto...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {!capturing && (
        <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, zIndex: 100000 }}>
          <button
            onClick={handleCapture}
            disabled={!streaming || !rostroValido}
            style={{
              width: 80, height: 80, borderRadius: "50%",
              backgroundColor: rostroValido ? "white" : "rgba(255,255,255,0.3)",
              border: `4px solid ${rostroValido ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
              boxShadow: rostroValido ? "0 0 30px rgba(255,255,255,0.4)" : "none",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: rostroValido ? "pointer" : "not-allowed",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: rostroValido ? "white" : "rgba(255,255,255,0.3)", border: "2px solid #ccc" }} />
          </button>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
            {rostroValido ? "¡Listo! Toca el botón para capturar" : "Esperando rostro válido..."}
          </p>
          <button onClick={handleBack} style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "underline", background: "none", border: "none", cursor: "pointer" }}>
            ← Cancelar y volver
          </button>
        </div>
      )}
    </div>,
    document.body
  );

  return (
    <>
      {fullscreenPortal}
      <div className="flex flex-col items-center gap-3 w-full">
        {!photo && (
          <div className="bg-amber-500/10 border border-amber-400/30 rounded-xl px-4 py-3 w-full text-sm text-amber-300">
            <p className="font-semibold mb-1">📌 Antes de tomar la foto:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              <li>Sin lentes ni accesorios en el rostro</li>
              <li>Buena iluminación, rostro visible</li>
              <li>Sin filtros ni retoques</li>
              <li>Mira directo a la cámara</li>
            </ul>
          </div>
        )}

        {!photo && !fullscreen && (
          <button onClick={handleOpenCamera} className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl border border-white/20 transition-all active:scale-95">
            📷 Abrir cámara
          </button>
        )}

        {photo && (
          <div className="flex flex-col items-center gap-2 w-full">
            <img src={photo} className="rounded-2xl w-full h-64 object-cover border-2 border-green-400/50" />
            <p className="text-green-400 text-sm font-semibold">✅ Foto capturada correctamente</p>
            <button onClick={retry} className="text-xs text-gray-400 underline">🔄 Volver a tomar</button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  );
}