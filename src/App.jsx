import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import DashboardPage from "./pages/DashboardPage";
import { EspeciesPage } from "./pages/EspeciesPage";
import { PresentacionesPage } from "./pages/PresentacionesPage";
import CatalogosPage from "./pages/CatalogosPage";
import VariantesPage from "./pages/VariantesPage";
import IngresosPage from "./pages/IngresosPage";
import SalidasPage from "./pages/SalidasPage";
import StockPage from "./pages/StockPage";
import ReportesPage from "./pages/ReportesPage";
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
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <Layout>
                <ReportesPage />
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
          path="/catalogos"
          element={
            <ProtectedRoute>
              <Layout>
                <CatalogosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/variantes"
          element={
            <ProtectedRoute>
              <Layout>
                <VariantesPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingresos"
          element={
            <ProtectedRoute>
              <Layout>
                <IngresosPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/salidas"
          element={
            <ProtectedRoute>
              <Layout>
                <SalidasPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stock"
          element={
            <ProtectedRoute>
              <Layout>
                <StockPage />
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
