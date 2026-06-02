import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";

export default function Camera({ onCapture, onBack, onProcessing }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  };

  const handleOpenCamera = () => {
    setFullscreen(true);
    startCamera();
  };

  const handleCapture = () => {
    setCapturing(true);
    if (onProcessing) onProcessing(true); // ← avisa al padre
    setTimeout(() => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg");
      stopCamera();
      setFullscreen(false);
      setCapturing(false);
      setPhoto(dataUrl);
      onCapture(dataUrl);
    }, 100);
  };

  const retry = () => {
    setPhoto(null);
    setFullscreen(true);
    startCamera();
  };

  const handleBack = () => {
    stopCamera();
    setFullscreen(false);
    if (onBack) onBack();
  };

  const fullscreenPortal =
    fullscreen &&
    createPortal(
      <div
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 99999,
          backgroundColor: "black",
          overflow: "hidden",
          margin: 0,
          padding: 0,
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transform: "scaleX(-1)",
            margin: 0,
            padding: 0,
            display: "block",
            backgroundColor: "black",
          }}
        />

        {capturing && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.85)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100001,
              gap: 16,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                border: "4px solid rgba(255,255,255,0.1)",
                borderTop: "4px solid #E8FF47",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>
               Analizando rostro con ...
            </p>
            <p
              style={{
                color: "#888",
                fontSize: 12,
                textAlign: "center",
                maxWidth: 260,
              }}
            >
              Esto puede tardar unos segundos
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {!capturing && (
          <div
            style={{
              position: "absolute",
              bottom: 40,
              left: 0,
              right: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              zIndex: 100000,
            }}
          >
            <button
              onClick={handleCapture}
              disabled={!streaming}
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: "white",
                border: "4px solid rgba(255,255,255,0.5)",
                boxShadow: "0 0 30px rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  backgroundColor: "white",
                  border: "2px solid #ccc",
                }}
              />
            </button>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              Toca el botón para capturar
            </p>
            <button
              onClick={handleBack}
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              ← Cancelar y volver
            </button>
          </div>
        )}
      </div>,
      document.body,
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
          <button
            onClick={handleOpenCamera}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-bold py-3 rounded-xl border border-white/20 transition-all active:scale-95"
          >
            📷 Abrir cámara
          </button>
        )}

        {photo && (
          <div className="flex flex-col items-center gap-2 w-full">
            <img
              src={photo}
              className="rounded-2xl w-full h-64 object-cover border-2 border-green-400/50"
            />
            <p className="text-green-400 text-sm font-semibold">
              ✅ Foto capturada correctamente
            </p>
            <button onClick={retry} className="text-xs text-gray-400 underline">
              🔄 Volver a tomar
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </>
  );
}
