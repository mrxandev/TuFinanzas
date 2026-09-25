import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatters";
import { BarChart3, ShieldAlert, Calendar, Download, FileText } from "lucide-react";
import {
  exportReporteCortesPDF,
  exportReporteLimitesPDF,
  exportResumenAnualPDF,
} from "../utils/pdfExport";

export const Reportes = () => {
  const [activeTab, setActiveTab] = useState("cortes");
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [reporteCortes, setReporteCortes] = useState(null);
  const [reporteLimites, setReporteLimites] = useState(null);
  const [resumenAnual, setResumenAnual] = useState(null);

  /* Cargar reporte de Cortes Consolidados */
  const fetchReporteCortes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reportes/cortes?anio=${anio}`);
      setReporteCortes(res.data.data);
    } catch {
      // Interceptor
    } finally {
      setLoading(false);
    }
  }, [anio]);

  /* Cargar reporte de Cumplimiento de Límites */
  const fetchReporteLimites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/reportes/limites");
      setReporteLimites(res.data.data);
    } catch {
      // Interceptor
    } finally {
      setLoading(false);
    }
  }, []);

  /* Cargar reporte de Resumen Anual */
  const fetchResumenAnual = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reportes/resumen-anual?anio=${anio}`);
      setResumenAnual(res.data.data);
    } catch {
      // Interceptor
    } finally {
      setLoading(false);
    }
  }, [anio]);

  useEffect(() => {
    if (activeTab === "cortes") fetchReporteCortes();
    if (activeTab === "limites") fetchReporteLimites();
    if (activeTab === "anual") fetchResumenAnual();
  }, [activeTab, fetchReporteCortes, fetchReporteLimites, fetchResumenAnual]);

  /* Manejo de Exportación a PDF */
  const handleExportPDF = () => {
    if (activeTab === "cortes" && reporteCortes) {
      exportReporteCortesPDF(reporteCortes, anio);
    } else if (activeTab === "limites" && reporteLimites) {
      exportReporteLimitesPDF(reporteLimites);
    } else if (activeTab === "anual" && resumenAnual) {
      exportResumenAnualPDF(resumenAnual, anio);
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado y selector de año */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reportes Analíticos</h1>
          <p className="text-sm text-base-content/60">
            Informes consolidados de ejecución presupuestaria y cumplimiento de reglas de negocio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab !== "limites" && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold">Año:</span>
              <select
                className="select select-bordered select-sm font-bold"
                value={anio}
                onChange={(e) => setAnio(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleExportPDF}
            disabled={loading}
            className="btn btn-primary btn-sm gap-2 shadow-sm"
            title="Descargar este reporte en formato PDF"
          >
            <Download className="w-4 h-4" /> Exportar PDF
          </button>
        </div>
      </div>

      {/* Control de Pestañas de Reportes */}
      <div className="tabs tabs-boxed bg-base-100 p-2 border border-base-300">
        <button
          onClick={() => setActiveTab("cortes")}
          className={`tab tab-md gap-2 ${activeTab === "cortes" ? "tab-active bg-primary text-white font-bold" : ""}`}
        >
          <BarChart3 className="w-4 h-4" /> Cortes Consolidados
        </button>
        <button
          onClick={() => setActiveTab("limites")}
          className={`tab tab-md gap-2 ${activeTab === "limites" ? "tab-active bg-primary text-white font-bold" : ""}`}
        >
          <ShieldAlert className="w-4 h-4" /> Cumplimiento de Límites
        </button>
        <button
          onClick={() => setActiveTab("anual")}
          className={`tab tab-md gap-2 ${activeTab === "anual" ? "tab-active bg-primary text-white font-bold" : ""}`}
        >
          <Calendar className="w-4 h-4" /> Resumen Evolución Anual
        </button>
      </div>

      {/* Contenido según reporte seleccionado */}
      {loading ? (
        <div className="flex justify-center p-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          {/* REPORTE 1: CORTES CONSOLIDADOS */}
          {activeTab === "cortes" && reporteCortes && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat bg-base-100 border border-base-200 rounded-box">
                  <div className="stat-title text-xs">Total Cortes</div>
                  <div className="stat-value text-lg font-bold">{reporteCortes.resumen?.total_cortes || 0}</div>
                </div>
                <div className="stat bg-base-100 border border-base-200 rounded-box">
                  <div className="stat-title text-xs">Total Ingresos Anuales</div>
                  <div className="stat-value text-lg font-bold text-success">
                    {formatCurrency(reporteCortes.resumen?.total_ingresos)}
                  </div>
                </div>
                <div className="stat bg-base-100 border border-base-200 rounded-box">
                  <div className="stat-title text-xs">Total Egresos Anuales</div>
                  <div className="stat-value text-lg font-bold text-error">
                    {formatCurrency(reporteCortes.resumen?.total_egresos)}
                  </div>
                </div>
                <div className="stat bg-base-100 border border-base-200 rounded-box">
                  <div className="stat-title text-xs">Cortes Excedidos</div>
                  <div className="stat-value text-lg font-bold text-warning">
                    {reporteCortes.resumen?.cortes_superaron_limite || 0}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body p-0 overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Fecha Corte</th>
                        <th>Balance Inicial</th>
                        <th>Ingresos</th>
                        <th>Egresos</th>
                        <th>Balance al Corte</th>
                        <th>Excedió Límite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteCortes.cortes?.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-6 text-base-content/50">
                            No hay cortes registrados para el año {anio}.
                          </td>
                        </tr>
                      ) : (
                        reporteCortes.cortes?.map((c) => (
                          <tr key={c.id}>
                            <td className="font-bold">Mes {c.mes}</td>
                            <td>{formatDate(c.fecha_corte)}</td>
                            <td>{formatCurrency(c.balance_inicial)}</td>
                            <td className="text-success font-semibold">
                              + {formatCurrency(c.total_ingresos)}
                            </td>
                            <td className="text-error font-semibold">
                              - {formatCurrency(c.total_egresos)}
                            </td>
                            <td className="font-bold text-primary">
                              {formatCurrency(c.balance_al_corte)}
                            </td>
                            <td>
                              <span className={`badge badge-sm ${c.supero_limite ? "badge-error text-white" : "badge-success text-white"}`}>
                                {c.supero_limite ? "SÍ" : "NO"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* REPORTE 2: CUMPLIMIENTO DE LÍMITES */}
          {activeTab === "limites" && reporteLimites && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat bg-base-100 border border-base-200 rounded-box">
                  <div className="stat-title text-xs">Total Evaluaciones</div>
                  <div className="stat-value text-xl font-bold">{reporteLimites.estadisticas?.total_evaluaciones || 0}</div>
                </div>
                <div className="stat bg-base-100 border border-base-200 rounded-box">
                  <div className="stat-title text-xs">Periodos en Regla</div>
                  <div className="stat-value text-xl font-bold text-success">
                    {reporteLimites.estadisticas?.periodos_en_regla || 0}
                  </div>
                </div>
                <div className="stat bg-base-100 border border-base-200 rounded-box">
                  <div className="stat-title text-xs">Periodos Excedidos</div>
                  <div className="stat-value text-xl font-bold text-error">
                    {reporteLimites.estadisticas?.periodos_excedidos || 0}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body p-6">
                  <h3 className="font-bold text-lg mb-4">Historial de Cumplimiento de Límites</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Año/Mes</th>
                          <th>Límite Establecido</th>
                          <th>Total Egresos</th>
                          <th>% Consumido</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteLimites.historial?.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="text-center py-6 text-base-content/50">
                              No hay historial de cumplimiento disponible.
                            </td>
                          </tr>
                        ) : (
                          reporteLimites.historial?.map((h, i) => (
                            <tr key={i}>
                              <td className="font-mono font-semibold">{h.anio} - Mes {h.mes}</td>
                              <td>{formatCurrency(h.limite_egresos_periodo)}</td>
                              <td className="font-bold">{formatCurrency(h.total_egresos)}</td>
                              <td>
                                <progress
                                  className={`progress w-24 h-3 ${h.supero_limite ? "progress-error" : "progress-success"}`}
                                  value={Math.min(h.porcentaje_consumido || 0, 100)}
                                  max="100"
                                ></progress>
                                <span className="text-xs ml-2 font-bold">{h.porcentaje_consumido}%</span>
                              </td>
                              <td>
                                <span className={`badge badge-sm ${h.supero_limite ? "badge-error text-white" : "badge-success text-white"}`}>
                                  {h.supero_limite ? "Excedido" : "Cumplido"}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REPORTE 3: EVOLUCIÓN ANUAL */}
          {activeTab === "anual" && resumenAnual && (
            <div className="card bg-base-100 shadow-sm border border-base-300">
              <div className="card-body p-6">
                <h3 className="font-bold text-lg mb-4">Evolución Mes a Mes ({anio})</h3>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Mes</th>
                        <th>Ingresos</th>
                        <th>Egresos</th>
                        <th>Balance Neto</th>
                        <th>Tendencia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resumenAnual.meses?.map((m) => (
                        <tr key={m.mes}>
                          <td className="font-bold">Mes {m.mes} ({m.nombre_mes})</td>
                          <td className="text-success font-semibold">
                            {formatCurrency(m.ingresos)}
                          </td>
                          <td className="text-error font-semibold">
                            {formatCurrency(m.egresos)}
                          </td>
                          <td className={`font-bold ${m.balance >= 0 ? "text-primary" : "text-error"}`}>
                            {formatCurrency(m.balance)}
                          </td>
                          <td>
                            <div className="w-full bg-base-200 rounded-full h-2.5 max-w-xs">
                              <div
                                className={`h-2.5 rounded-full ${m.balance >= 0 ? "bg-primary" : "bg-error"}`}
                                style={{ width: `${Math.min(Math.abs(m.balance) / 500, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
