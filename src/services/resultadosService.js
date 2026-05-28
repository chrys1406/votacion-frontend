const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getResultados = async (eleccionId) => {
  const res = await fetch(`${BASE_URL}/votos/resultados/${eleccionId}`, { headers: headers() });
  if (!res.ok) throw new Error("Error al obtener resultados");
  return await res.json();
};