import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { EspeciesPage } from "./pages/EspeciesPage";
import { PresentacionesPage } from "./pages/PresentacionesPage";
import { Login } from "./components/auth/Login";
import { Register } from "./components/auth/Register";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";
import "./index.css";

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/especies"
          element={
            <ProtectedRoute>
              <Layout>
                <EspeciesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/presentaciones"
          element={
            <ProtectedRoute>
              <Layout>
                <PresentacionesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
