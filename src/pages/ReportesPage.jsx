import { LoaderCircle } from "lucide-react";

export default function ReportesPage() {
  //mostrar mensaje que diga en desarrollo
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <LoaderCircle className="animate-spin h-16 w-16 text-gray-400" />
      <p> Funcionalidad está en desarrollo.</p>
    </div>
  );
}
