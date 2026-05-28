const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getCandidatos = async () => {
  const res = await fetch(`${BASE_URL}/candidatos/`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener candidatos");
  return await res.json();
};

export const getCandidatosPorEleccion = async (eleccionId) => {
  const res = await fetch(`${BASE_URL}/candidatos/eleccion/${eleccionId}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Error al obtener candidatos");
  return await res.json();
};

export const crearCandidato = async (formData) => {
  const res = await fetch(`${BASE_URL}/candidatos/`, {
    method: "POST",
    headers: authHeaders(),
    body: formData, // FormData con foto y video
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al crear candidato");
  }
  return await res.json();
};

export const editarCandidato = async (id, formData) => {
  const res = await fetch(`${BASE_URL}/candidatos/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al editar candidato");
  }
  return await res.json();
};

export const eliminarCandidato = async (id) => {
  const res = await fetch(`${BASE_URL}/candidatos/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Error al eliminar candidato");
  return await res.json();
};