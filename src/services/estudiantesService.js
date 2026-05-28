const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getEstudiantes = async () => {
  const res = await fetch(`${BASE_URL}/estudiantes/`, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener estudiantes");
  return await res.json();
};

export const buscarEstudiante = async (q) => {
  const res = await fetch(`${BASE_URL}/estudiantes/buscar?q=${q}`, { headers: headers() });
  if (!res.ok) throw new Error("Error al buscar estudiantes");
  return await res.json();
};

export const eliminarEstudiante = async (id) => {
  const res = await fetch(`${BASE_URL}/estudiantes/${id}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Error al eliminar estudiante");
  return await res.json();
};