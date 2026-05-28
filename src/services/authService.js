const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const loginService = async (registro, cedula) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registro, cedula }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Credenciales incorrectas");
    }

    return await res.json();
  } catch (err) {
    // Si es error de red (backend apagado)
    if (err.message === "Failed to fetch") {
      throw new Error("No se puede conectar con el servidor");
    }
    throw err;
  }
};


export const registroService = async (form, fotoBase64) => {
  console.log("1. Iniciando registro...");
  console.log("2. Mandando foto al microservicio IA...");

  // 1. Validar foto y extraer embeddings
  let iaData;
  try {
    const iaRes = await fetch("http://127.0.0.1:8001/extract-embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagen: fotoBase64 }),
    });
    console.log("3. Respuesta microservicio IA:", iaRes.status);

    if (!iaRes.ok) {
      const error = await iaRes.json();
      throw new Error(error.detail || "Error al procesar la foto");
    }

    iaData = await iaRes.json();
    console.log("4. Embedding extraído correctamente, dimensiones:", iaData.embedding?.length);
  } catch (err) {
    console.error("ERROR en microservicio IA:", err);
    throw new Error("Error en reconocimiento facial: " + err.message);
  }

  console.log("5. Mandando datos al backend...");

  // 2. Mandar todo al backend
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

    const res = await fetch("http://localhost:8000/auth/registro", {
      method: "POST",
      body: formData,
    });

    console.log("6. Respuesta backend:", res.status);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || "Error al registrarse");
    }

    const data = await res.json();
    console.log("7. Registro exitoso:", data);
    return data;

  } catch (err) {
    console.error("ERROR en backend:", err);
    throw err;
  }
};