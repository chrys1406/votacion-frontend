const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const IA_URL = import.meta.env.VITE_IA_URL || "http://127.0.0.1:8001";

export const loginService = async (registro, cedula) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registro, cedula }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Registro o cédula incorrectos");
    }

    return await res.json();
  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("No se pudo conectar. Verifica tu conexión a internet.");
    }
    throw err;
  }
};


export const registroService = async (form, fotoBase64) => {

  // 1. Extraer embedding del rostro
  let iaData;
  try {
    const iaRes = await fetch(`${IA_URL}/extract-embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagen: fotoBase64 }),
    });

    if (!iaRes.ok) {
      const error = await iaRes.json();
      // Mensajes del microservicio más amigables
      const mensaje = error.detail || "No se pudo procesar la foto";
      if (mensaje.includes("No se detectó ningún rostro")) {
        throw new Error("No se detectó ningún rostro. Asegúrate de tener buena iluminación y mirar directo a la cámara.");
      }
      if (mensaje.includes("ojos")) {
        throw new Error("No se detectaron los ojos. Por favor quítate los lentes oscuros o la gorra.");
      }
      if (mensaje.includes("oscura")) {
        throw new Error("La imagen está muy oscura. Busca mejor iluminación.");
      }
      if (mensaje.includes("foto o pantalla")) {
        throw new Error("Se detectó una foto en pantalla. Por favor usa tu rostro real frente a la cámara.");
      }
      throw new Error(mensaje);
    }

    iaData = await iaRes.json();
  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("No se pudo conectar con el servicio de reconocimiento facial. Intenta de nuevo en unos segundos.");
    }
    throw err;
  }

  // 2. Registrar en el backend
  try {
    const formData = new FormData();
    formData.append("nombre", form.nombre);
    formData.append("registro", form.registro);
    formData.append("correo", form.correo);
    formData.append("cedula", form.cedula);
    formData.append("embedding", JSON.stringify(iaData.embedding));

    const base64 = fotoBase64.split(",")[1];
    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "image/jpeg" });
    formData.append("foto", blob, "foto.jpg");

    const res = await fetch(`${BASE_URL}/auth/registro`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      const mensaje = error.detail || "No se pudo completar el registro";
      if (mensaje.includes("registro, correo o cédula")) {
        throw new Error("Ya existe una cuenta con ese registro, correo o cédula.");
      }
      if (mensaje.includes("rostro ya está registrado")) {
        throw new Error("Este rostro ya tiene una cuenta registrada en el sistema.");
      }
      throw new Error(mensaje);
    }

    return await res.json();

  } catch (err) {
    if (err.message === "Failed to fetch") {
      throw new Error("No se pudo conectar con el servidor. Verifica tu conexión.");
    }
    throw err;
  }
};