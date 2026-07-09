import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import {
  Home,
  DashboardPage,
  EspeciesPage,
  PresentacionesPage,
  CatalogosPage,
  VariantesPage,
  IngresosPage,
  IngresoDetallePage,
  SalidasPage,
  StockPage,
  ReportesPage,
  NewPartePage,
  NewControlPage,
} from "@/pages";
import { Login, Register, ProtectedRoute } from "@/components/auth";
import { useAuthStore } from "@/stores";
import "@/index.css";

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
          path="/ingresos/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <IngresoDetallePage />
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
          path="/partes/nuevo"
          element={
            <ProtectedRoute>
              <Layout>
                <NewPartePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/control/nuevo"
          element={
            <ProtectedRoute>
              <Layout>
                <NewControlPage />
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
