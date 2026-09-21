import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { formatCurrency, formatDate } from "../utils/formatters";
import { CalendarCheck, Play, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Cortes = () => {
  const { user, isAdmin } = useAuth();
  const [cortes, setCortes] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Estado de Modal para Procesar Corte */
  const [procesarModalOpen, setProcesarModalOpen] = useState(false);
  const [procesarForm, setProcesarForm] = useState({
    anio: new Date().getFullYear(),
    mes: new Date().getMonth() + 1,
    todos: false,
  });

  /* Estado de Modal de Detalle de Corte */
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCorte, setSelectedCorte] = useState(null);

  /* Cargar historial de cortes mensuales */
  const fetchCortes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/cortes?page=${page}&limit=10`);
      const dataObj = res.data?.data || {};
      const list = dataObj.cortes || (Array.isArray(dataObj) ? dataObj : []);
      setCortes(Array.isArray(list) ? list : []);
      setPagination(dataObj.pagination || { page: 1, limit: 10, totalPages: 1 });
    } catch {
      setCortes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCortes(1);
  }, [fetchCortes]);

  /* Ejecución del proceso de cierre de corte mensual con protección contra doble envío */
  const handleProcesarCorte = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const confirmResult = await Swal.fire({
      title: "¿Procesar Corte Mensual?",
      text: `Se calcularán balances acumulados y cierre contable para ${procesarForm.mes}/${procesarForm.anio}.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#a78bfa",
      confirmButtonText: "Sí, procesar",
    });

    if (confirmResult.isConfirmed) {
      setSubmitting(true);
      try {
        const payload = {
          anio: Number(procesarForm.anio),
          mes: Number(procesarForm.mes),
          todos: procesarForm.todos,
          ...(!procesarForm.todos && { usuario_id: user.id }),
        };

        const res = await api.post("/cortes/procesar", payload);
        Swal.fire({
          icon: "success",
          title: "Corte Procesado",
          text: res.data.message || "El proceso de corte ha finalizado exitosamente.",
        });
        setProcesarModalOpen(false);
        fetchCortes(1);
      } catch {
        // Interceptor
      } finally {
        setSubmitting(false);
      }
    }
  };

  /* Ver detalle de un corte específico */
  const handleViewDetail = async (id) => {
    try {
      const res = await api.get(`/cortes/${id}`);
      setSelectedCorte(res.data.data);
      setDetailModalOpen(true);
    } catch {
      // Interceptor
    }
  };

  const safeCortes = Array.isArray(cortes) ? cortes : [];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cortes Mensuales</h1>
          <p className="text-sm text-base-content/60">
            Cierres contables mensuales, arrastre de balances y evaluación de límites.
          </p>
        </div>
        <button onClick={() => setProcesarModalOpen(true)} className="btn btn-primary gap-2">
          <Play className="w-4 h-4" /> Procesar Nuevo Corte
        </button>
      </div>

      {/* Historial de Cortes */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-0 overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-8">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : (
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Periodo (Año/Mes)</th>
                  <th>Fecha Corte</th>
                  <th>Balance Inicial</th>
                  <th>Total Ingresos</th>
                  <th>Total Egresos</th>
                  <th>Balance al Corte</th>
                  <th>Estado Límite</th>
                  <th className="text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {safeCortes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-base-content/50">
                      No hay cortes mensuales registrados.
                    </td>
                  </tr>
                ) : (
                  safeCortes.map((c) => (
                    <tr key={c.id}>
                      <td className="font-bold text-sm">
                        {c.anio} - {String(c.mes).padStart(2, "0")}
                      </td>
                      <td className="text-sm">{formatDate(c.fecha_corte)}</td>
                      <td className="text-sm">
                        {formatCurrency(c.balance_inicial)}
                      </td>
                      <td className="text-sm font-semibold text-success">
                        + {formatCurrency(c.total_ingresos)}
                      </td>
                      <td className="text-sm font-semibold text-error">
                        - {formatCurrency(c.total_egresos)}
                      </td>
                      <td className="font-bold text-sm text-primary">
                        {formatCurrency(c.balance_al_corte)}
                      </td>
                      <td>
                        {c.supero_limite ? (
                          <span className="badge badge-error text-white gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Excedido
                          </span>
                        ) : (
                          <span className="badge badge-success text-white gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Ok
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <button
                          onClick={() => handleViewDetail(c.id)}
                          className="btn btn-ghost btn-xs text-primary"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" /> Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal para Procesar Corte */}
      {procesarModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-primary" /> Procesar Cierre Contable Mensual
            </h3>

            <form onSubmit={handleProcesarCorte} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Año</label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={procesarForm.anio}
                    onChange={(e) => setProcesarForm({ ...procesarForm, anio: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Mes (1-12)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    className="input input-bordered input-sm"
                    value={procesarForm.mes}
                    onChange={(e) => setProcesarForm({ ...procesarForm, mes: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {isAdmin && (
                <div className="form-control border border-base-200 p-3 rounded-lg bg-base-200/50">
                  <label className="label cursor-pointer justify-start gap-3 p-0">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary checkbox-sm"
                      checked={procesarForm.todos}
                      onChange={(e) => setProcesarForm({ ...procesarForm, todos: e.target.checked })}
                      disabled={submitting}
                    />
                    <div>
                      <span className="label-text font-semibold">Procesar masivamente (Todos los Usuarios)</span>
                      <p className="text-xs text-base-content/60">Opción exclusiva de administrador</p>
                    </div>
                  </label>
                </div>
              )}

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setProcesarModalOpen(false)}
                  disabled={submitting}
                  className="btn btn-ghost btn-sm"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm gap-2">
                  {submitting ? <span className="loading loading-spinner loading-xs"></span> : <Play className="w-4 h-4" />}
                  Iniciar Corte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalle de Corte Mensual */}
      {detailModalOpen && selectedCorte && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="font-bold text-lg mb-2">
              Detalle del Corte: {selectedCorte.corte?.anio} - Mes {selectedCorte.corte?.mes}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-3 bg-base-200 rounded-lg text-center">
              <div>
                <div className="text-xs text-base-content/60">Balance Inicial</div>
                <div className="font-bold text-sm">
                  {formatCurrency(selectedCorte.corte?.balance_inicial)}
                </div>
              </div>
              <div>
                <div className="text-xs text-base-content/60">Ingresos</div>
                <div className="font-bold text-sm text-success">
                  + {formatCurrency(selectedCorte.corte?.total_ingresos)}
                </div>
              </div>
              <div>
                <div className="text-xs text-base-content/60">Egresos</div>
                <div className="font-bold text-sm text-error">
                  - {formatCurrency(selectedCorte.corte?.total_egresos)}
                </div>
              </div>
              <div>
                <div className="text-xs text-base-content/60">Balance Corte</div>
                <div className="font-bold text-sm text-primary">
                  {formatCurrency(selectedCorte.corte?.balance_al_corte)}
                </div>
              </div>
            </div>

            <h4 className="font-semibold text-sm mb-2">Transacciones asociadas al periodo:</h4>
            <div className="max-h-60 overflow-y-auto border border-base-200 rounded-lg">
              <table className="table table-xs w-full">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCorte.transacciones?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-base-content/50">
                        No hay transacciones registradas en este periodo.
                      </td>
                    </tr>
                  ) : (
                    selectedCorte.transacciones?.map((t) => (
                      <tr key={t.id}>
                        <td className="font-mono">{t.numero_transaccion}</td>
                        <td>
                          <span
                            className={`badge badge-xs ${
                              t.tipo_transaccion === "INGRESO" ? "badge-success text-white" : "badge-error text-white"
                            }`}
                          >
                            {t.tipo_transaccion}
                          </span>
                        </td>
                        <td className="font-bold">
                          {formatCurrency(t.monto)}
                        </td>
                        <td>{formatDate(t.fecha_transaccion)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-action">
              <button onClick={() => setDetailModalOpen(false)} className="btn btn-primary btn-sm">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
