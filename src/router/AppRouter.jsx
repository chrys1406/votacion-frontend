import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminHome from "../pages/admin/AdminHome";
import AdminElecciones from "../pages/admin/AdminElecciones";
import AdminCandidatos from "../pages/admin/AdminCandidatos";
import AdminCategorias from "../pages/admin/AdminCategorias";
import AdminResultados from "../pages/admin/AdminResultados";
import AdminEstudiantes from "../pages/admin/AdminEstudiantes";

{/* estudiante */}

import StudentDashboard from "../pages/student/StudentDashboard";
import StudentHome from "../pages/student/StudentHome";
import StudentEleccion from "../pages/student/StudentEleccion";
import StudentVotoExito from "../pages/student/StudentVotoExito";

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (role && user.rol !== role) return <Navigate to="/" />;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="elecciones" element={<AdminElecciones />} />
          <Route path="candidatos" element={<AdminCandidatos />} />
          <Route path="categorias" element={<AdminCategorias />} />
          <Route path="resultados" element={<AdminResultados />} />
          <Route path="estudiantes" element={<AdminEstudiantes />} />
        </Route>

        {/* ESTUDIANTE */}
        <Route
          path="/estudiante"
          element={
            <ProtectedRoute role="estudiante">
              <StudentDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentHome />} />
          <Route path="eleccion/:id" element={<StudentEleccion />} />
          <Route path="voto-exitoso" element={<StudentVotoExito />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
