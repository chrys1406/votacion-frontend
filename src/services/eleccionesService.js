const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getElecciones = async () => {
  const res = await fetch(`${BASE_URL}/elecciones/`, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener elecciones");
  return await res.json();
};

export const crearEleccion = async (data) => {
  console.log("Creando elección:", data);
  const res = await fetch(`${BASE_URL}/elecciones/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    console.error("Error:", error);
    throw new Error(error.detail || "Error al crear elección");
  }
  return await res.json();
};

export const editarEleccion = async (id, data) => {
  const res = await fetch(`${BASE_URL}/elecciones/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al editar elección");
  }
  return await res.json();
};

export const eliminarEleccion = async (id) => {
  const res = await fetch(`${BASE_URL}/elecciones/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al eliminar elección");
  return await res.json();
};

export const toggleEleccion = async (id) => {
  const res = await fetch(`${BASE_URL}/elecciones/${id}/toggle`, {
    method: "PATCH",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al cambiar estado");
  return await res.json();
};