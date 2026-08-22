import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Loading } from "@/components/common";
import { Login, Register, ProtectedRoute } from "@/components/auth";
import { useAuthStore } from "@/stores";
import "@/index.css";

// Las paginas se importan por modulo y no desde @/pages porque el barrel
// arrastraria todas al chunk principal y anularia la division de codigo.
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const CatalogosPage = lazy(() => import("@/pages/CatalogosPage"));
const VariantesPage = lazy(() => import("@/pages/VariantesPage"));
const StockPage = lazy(() => import("@/pages/StockPage"));
const ReportesPage = lazy(() => import("@/pages/ReportesPage"));
const IngresosPage = lazy(() => import("@/pages/ingresos/IngresosPage"));
const IngresoDetallePage = lazy(
  () => import("@/pages/ingresos/IngresoDetallePage"),
);
const EditarIngresosPage = lazy(
  () => import("@/pages/ingresos/EditarIngresosPage"),
);
const SalidasPage = lazy(() => import("@/pages/salidas/SalidasPage"));
const SalidaDetallePage = lazy(
  () => import("@/pages/salidas/SalidaDetallePage"),
);
const EditarSalidasPage = lazy(
  () => import("@/pages/salidas/EditarSalidasPage"),
);
const NewPartePage = lazy(() => import("@/pages/partes/NewPartePage"));
const NewControlPage = lazy(() => import("@/pages/control/NewControlPage"));

// EspeciesPage y PresentacionesPage son exportaciones nombradas, y lazy() exige
// un modulo con export default.
const EspeciesPage = lazy(() =>
  import("@/pages/EspeciesPage").then((modulo) => ({
    default: modulo.EspeciesPage,
  })),
);
const PresentacionesPage = lazy(() =>
  import("@/pages/PresentacionesPage").then((modulo) => ({
    default: modulo.PresentacionesPage,
  })),
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Suspense fallback={<Loading fullScreen />}>
        <Routes>
          {/* Rutas públicas */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <Register />
            }
          />

          {/* Rutas protegidas */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
            path="/ingresos/:id/editar"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditarIngresosPage />
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
            path="/salidas/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <SalidaDetallePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/salidas/:id/editar"
            element={
              <ProtectedRoute>
                <Layout>
                  <EditarSalidasPage />
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
          <Route path="/*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
