const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getCategorias = async () => {
  const res = await fetch(`${BASE_URL}/categorias/`, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener categorías");
  return await res.json();
};

export const getCategoriasPorEleccion = async (eleccionId) => {
  const res = await fetch(`${BASE_URL}/categorias/eleccion/${eleccionId}`, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener categorías");
  return await res.json();
};

export const crearCategoria = async (data) => {
  const res = await fetch(`${BASE_URL}/categorias/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al crear categoría");
  }
  return await res.json();
};

export const editarCategoria = async (id, data) => {
  const res = await fetch(`${BASE_URL}/categorias/${id}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Error al editar categoría");
  }
  return await res.json();
};

export const eliminarCategoria = async (id) => {
  const res = await fetch(`${BASE_URL}/categorias/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al eliminar categoría");
  return await res.json();
};