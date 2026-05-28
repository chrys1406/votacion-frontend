const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getDashboardStats = async () => {
  const [estudiantesRes, eleccionesRes, candidatosRes, votosRes] = await Promise.all([
    fetch(`${BASE_URL}/estudiantes/`, { headers: headers() }),
    fetch(`${BASE_URL}/elecciones/`, { headers: headers() }),
    fetch(`${BASE_URL}/candidatos/`, { headers: headers() }),
    fetch(`${BASE_URL}/votos/total`, { headers: headers() }),
  ]);

  const estudiantes = await estudiantesRes.json();
  const elecciones = await eleccionesRes.json();
  const candidatos = await candidatosRes.json();

  return {
    totalEstudiantes: estudiantes.length,
    eleccionesActivas: elecciones.filter((e) => e.activa).length,
    totalCandidatos: candidatos.length,
    totalVotos: 0, // se conectará cuando haya votos
    elecciones: elecciones.slice(0, 3), // últimas 3
  };
};