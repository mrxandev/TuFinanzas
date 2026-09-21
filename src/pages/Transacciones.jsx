import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";
import { formatCurrency, formatDate } from "../utils/formatters";
import { Plus, Search, Filter, Ban, Trash2, Edit } from "lucide-react";

export const Transacciones = () => {
  const { isAdmin } = useAuth();
  const [transacciones, setTransacciones] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Listas auxiliares para selectores en formulario de creación */
  const [conceptosEgresos, setConceptosEgresos] = useState([]);
  const [conceptosIngresos, setConceptosIngresos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);

  /* Filtros de búsqueda */
  const [filters, setFilters] = useState({
    tipo_transaccion: "",
    estado: "",
    tipo_pago_id: "",
    fecha_desde: "",
    fecha_hasta: "",
    busqueda: "",
  });

  /* Estado para Modal de Creación / Edición */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    tipo_transaccion: "EGRESO",
    concepto_egreso_id: "",
    concepto_ingreso_id: "",
    tipo_pago_id: "",
    fecha_transaccion: new Date().toISOString().split("T")[0],
    monto: "",
    numero_tarjeta_credito: "",
    comentario: "",
    estado: "APLICADA",
  });

  /* Carga de la lista paginada de transacciones */
  const fetchTransacciones = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(filters.tipo_transaccion && { tipo_transaccion: filters.tipo_transaccion }),
        ...(filters.estado && { estado: filters.estado }),
        ...(filters.tipo_pago_id && { tipo_pago_id: filters.tipo_pago_id }),
        ...(filters.fecha_desde && { fecha_desde: filters.fecha_desde }),
        ...(filters.fecha_hasta && { fecha_hasta: filters.fecha_hasta }),
        ...(filters.busqueda && { busqueda: filters.busqueda }),
      });

      const res = await api.get(`/transacciones?${params.toString()}`);
      const dataObj = res.data?.data || {};
      const dataList = Array.isArray(dataObj.transacciones) ? dataObj.transacciones : Array.isArray(dataObj) ? dataObj : [];
      setTransacciones(dataList);
      setPagination(dataObj.pagination || { page: 1, limit: 10, totalPages: 1, total: dataList.length });
    } catch {
      setTransacciones([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  /* Carga de datos auxiliares para catálogos de selectores */
  const fetchAuxiliaryData = async () => {
    try {
      const [egrRes, ingRes, pagoRes] = await Promise.all([
        api.get("/conceptos-egresos?limit=100"),
        api.get("/conceptos-ingresos?limit=100"),
        api.get("/tipos-pago?limit=100"),
      ]);

      const egrData = egrRes.data?.data || {};
      const ingData = ingRes.data?.data || {};
      const pagoData = pagoRes.data?.data || {};

      const egrList = egrData.conceptos_egresos || egrData.conceptos || (Array.isArray(egrData) ? egrData : []);
      const ingList = ingData.conceptos_ingresos || ingData.conceptos || (Array.isArray(ingData) ? ingData : []);
      const pagoList = pagoData.tipos_pago || pagoData.tipos || (Array.isArray(pagoData) ? pagoData : []);

      setConceptosEgresos(Array.isArray(egrList) ? egrList : []);
      setConceptosIngresos(Array.isArray(ingList) ? ingList : []);
      setTiposPago(Array.isArray(pagoList) ? pagoList : []);
    } catch {
      setConceptosEgresos([]);
      setConceptosIngresos([]);
      setTiposPago([]);
    }
  };

  useEffect(() => {
    fetchTransacciones(1);
    fetchAuxiliaryData();
  }, [fetchTransacciones]);

  /* Abrir modal para nueva transacción */
  const openNewModal = () => {
    setEditingId(null);
    const egrList = Array.isArray(conceptosEgresos) ? conceptosEgresos : [];
    const ingList = Array.isArray(conceptosIngresos) ? conceptosIngresos : [];
    const pagoList = Array.isArray(tiposPago) ? tiposPago : [];

    setFormData({
      tipo_transaccion: "EGRESO",
      concepto_egreso_id: egrList[0]?.id || "",
      concepto_ingreso_id: ingList[0]?.id || "",
      tipo_pago_id: pagoList[0]?.id || "",
      fecha_transaccion: new Date().toISOString().split("T")[0],
      monto: "",
      numero_tarjeta_credito: "",
      comentario: "",
      estado: "APLICADA",
    });
    setModalOpen(true);
  };

  /* Abrir modal para editar */
  const openEditModal = (trx) => {
    setEditingId(trx.id);
    setFormData({
      tipo_transaccion: trx.tipo_transaccion,
      concepto_egreso_id: trx.concepto_egreso_id || "",
      concepto_ingreso_id: trx.concepto_ingreso_id || "",
      tipo_pago_id: trx.tipo_pago_id || "",
      fecha_transaccion: trx.fecha_transaccion ? trx.fecha_transaccion.split("T")[0] : "",
      monto: trx.monto,
      numero_tarjeta_credito: trx.numero_tarjeta_credito || "",
      comentario: trx.comentario || "",
      estado: trx.estado,
    });
    setModalOpen(true);
  };

  /* Enviar creación / edición de transacción con protección contra doble envío */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/transacciones/${editingId}`, {
          monto: Number(formData.monto),
          comentario: formData.comentario,
          tipo_pago_id: formData.tipo_pago_id,
        });
        Swal.fire("Actualizada", "La transacción ha sido actualizada.", "success");
      } else {
        const payload = {
          tipo_transaccion: formData.tipo_transaccion,
          monto: Number(formData.monto),
          tipo_pago_id: formData.tipo_pago_id,
          fecha_transaccion: formData.fecha_transaccion,
          comentario: formData.comentario,
          numero_tarjeta_credito: formData.numero_tarjeta_credito,
          estado: formData.estado,
          ...(formData.tipo_transaccion === "EGRESO"
            ? { concepto_egreso_id: formData.concepto_egreso_id }
            : { concepto_ingreso_id: formData.concepto_ingreso_id }),
        };

        const res = await api.post("/transacciones", payload);
        const warning = res.data.data?.warning;

        /* Requisito 12: Notificación SweetAlert2 si se sobrepasa el límite mensual */
        if (warning?.supero_limite) {
          Swal.fire({
            icon: "warning",
            title: "Atención: Límite Excedido",
            html: `
              <div className="text-left space-y-2">
                <p>${warning.mensaje}</p>
                <hr className="my-2"/>
                <p><strong>Límite establecido:</strong> ${formatCurrency(warning.limite_egresos)}</p>
                <p><strong>Total acumulado:</strong> ${formatCurrency(warning.total_egresos_periodo)}</p>
                <p><strong>Exceso:</strong> ${formatCurrency(warning.exceso)} (${warning.porcentaje_consumido}%)</p>
              </div>
            `,
            confirmButtonColor: "#a78bfa",
          });
        } else {
          Swal.fire("Registrada", "Transacción registrada exitosamente.", "success");
        }
      }

      setModalOpen(false);
      fetchTransacciones(pagination.page);
    } catch {
      // Manejado en interceptor
    } finally {
      setSubmitting(false);
    }
  };

  /* Proceso de anulación lógica con motivo */
  const handleAnular = async (id) => {
    const { value: motivo } = await Swal.fire({
      title: "Anular Transacción",
      input: "text",
      inputLabel: "Motivo de la anulación",
      inputPlaceholder: "Ej: Error en digitación del monto",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) {
          return "Debes ingresar un motivo para anular";
        }
      },
    });

    if (motivo) {
      try {
        await api.patch(`/transacciones/${id}/anular`, { motivo });
        Swal.fire("Anulada", "La transacción ha sido basada y anulada exitosamente", "success");
        fetchTransacciones(pagination.page);
      } catch {
        // Interceptor
      }
    }
  };

  /* Eliminación física (solo ADMIN) */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar definitivamente?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/transacciones/${id}`);
        Swal.fire("Eliminada", "La transacción fue eliminada.", "success");
        fetchTransacciones(pagination.page);
      } catch {
        // Interceptor
      }
    }
  };

  const safeTransacciones = Array.isArray(transacciones) ? transacciones : [];
  const safeConceptosEgresos = Array.isArray(conceptosEgresos) ? conceptosEgresos : [];
  const safeConceptosIngresos = Array.isArray(conceptosIngresos) ? conceptosIngresos : [];
  const safeTiposPago = Array.isArray(tiposPago) ? tiposPago : [];

  return (
    <div className="space-y-6">
      {/* Encabezado y botón de creación */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Registro de Transacciones</h1>
          <p className="text-sm text-base-content/60">
            Administra tus ingresos y egresos diarios.
          </p>
        </div>
        <button onClick={openNewModal} className="btn btn-primary gap-2">
          <Plus className="w-5 h-5" /> Nueva Transacción
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Tipo</label>
              <select
                className="select select-bordered select-sm"
                value={filters.tipo_transaccion}
                onChange={(e) => setFilters({ ...filters, tipo_transaccion: e.target.value })}
              >
                <option value="">Todos los tipos</option>
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Estado</label>
              <select
                className="select select-bordered select-sm"
                value={filters.estado}
                onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              >
                <option value="">Todos los estados</option>
                <option value="APLICADA">Aplicada</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="ANULADA">Anulada</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Desde</label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={filters.fecha_desde}
                onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Hasta</label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={filters.fecha_hasta}
                onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Buscar por folio o comentario..."
                className="input input-bordered input-sm w-full pl-9"
                value={filters.busqueda}
                onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>
            <button onClick={() => fetchTransacciones(1)} className="btn btn-secondary btn-sm gap-1">
              <Filter className="w-4 h-4" /> Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Transacciones */}
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
                  <th>Folio</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Concepto / Descripción</th>
                  <th>Medio Pago</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {safeTransacciones.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-base-content/50">
                      No se encontraron transacciones registradas.
                    </td>
                  </tr>
                ) : (
                  safeTransacciones.map((t) => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs font-semibold">{t.numero_transaccion}</td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold ${
                            t.tipo_transaccion === "INGRESO" ? "badge-success text-white" : "badge-error text-white"
                          }`}
                        >
                          {t.tipo_transaccion}
                        </span>
                      </td>
                      <td className="text-sm">
                        {formatDate(t.fecha_transaccion)}
                      </td>
                      <td className="text-sm">
                        <div className="font-semibold">
                          {t.concepto_descripcion || t.comentario || "Sin concepto"}
                        </div>
                        {t.comentario && <div className="text-xs text-base-content/60">{t.comentario}</div>}
                      </td>
                      <td className="text-sm">{t.tipo_pago_descripcion || "Efectivo"}</td>
                      <td className="font-bold text-sm">
                        {formatCurrency(t.monto)}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            t.estado === "APLICADA"
                              ? "badge-success text-white"
                              : t.estado === "PENDIENTE"
                              ? "badge-warning"
                              : "badge-error text-white"
                          }`}
                        >
                          {t.estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          {t.estado !== "ANULADA" && (
                            <>
                              <button
                                onClick={() => openEditModal(t)}
                                className="btn btn-ghost btn-xs text-info"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAnular(t.id)}
                                className="btn btn-ghost btn-xs text-warning"
                                title="Anular"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="btn btn-ghost btn-xs text-error"
                              title="Eliminar (Admin)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Paginador */}
        <div className="flex justify-between items-center p-4 border-t border-base-200">
          <span className="text-xs text-base-content/60">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
          </span>
          <div className="join">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchTransacciones(pagination.page - 1)}
              className="join-item btn btn-xs"
            >
              Anterior
            </button>
            <button className="join-item btn btn-xs">{pagination.page}</button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchTransacciones(pagination.page + 1)}
              className="join-item btn btn-xs"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Registro / Edición */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">
              {editingId ? "Editar Transacción" : "Registrar Transacción"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              {!editingId && (
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Tipo de Transacción</label>
                  <div className="flex gap-4">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="radio"
                        name="tipo_transaccion"
                        className="radio radio-error radio-sm"
                        value="EGRESO"
                        checked={formData.tipo_transaccion === "EGRESO"}
                        onChange={(e) => setFormData({ ...formData, tipo_transaccion: e.target.value })}
                        disabled={submitting}
                      />
                      <span className="label-text">Egreso (Gasto)</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="radio"
                        name="tipo_transaccion"
                        className="radio radio-success radio-sm"
                        value="INGRESO"
                        checked={formData.tipo_transaccion === "INGRESO"}
                        onChange={(e) => setFormData({ ...formData, tipo_transaccion: e.target.value })}
                        disabled={submitting}
                      />
                      <span className="label-text">Ingreso</span>
                    </label>
                  </div>
                </div>
              )}

              {!editingId && formData.tipo_transaccion === "EGRESO" && (
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Concepto de Egreso</label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={formData.concepto_egreso_id}
                    onChange={(e) => setFormData({ ...formData, concepto_egreso_id: e.target.value })}
                    disabled={submitting}
                    required
                  >
                    <option value="">-- Selecciona Concepto --</option>
                    {safeConceptosEgresos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.descripcion} ({c.tipo_egreso_descripcion || "Egreso"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!editingId && formData.tipo_transaccion === "INGRESO" && (
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Concepto de Ingreso</label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={formData.concepto_ingreso_id}
                    onChange={(e) => setFormData({ ...formData, concepto_ingreso_id: e.target.value })}
                    disabled={submitting}
                    required
                  >
                    <option value="">-- Selecciona Concepto --</option>
                    {safeConceptosIngresos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.descripcion} {c.institucion ? `- ${c.institucion}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Monto (RD$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="input input-bordered input-sm w-full font-bold"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Medio de Pago</label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={formData.tipo_pago_id}
                    onChange={(e) => setFormData({ ...formData, tipo_pago_id: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="">-- Seleccionar --</option>
                    {safeTiposPago.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.descripcion}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {!editingId && (
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Fecha Transacción</label>
                  <input
                    type="date"
                    className="input input-bordered input-sm w-full"
                    value={formData.fecha_transaccion}
                    onChange={(e) => setFormData({ ...formData, fecha_transaccion: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
              )}

              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Tarjeta Crédito / Débito (últimos 4 dígitos si aplica)</label>
                <input
                  type="text"
                  placeholder="4532********9876"
                  className="input input-bordered input-sm w-full"
                  value={formData.numero_tarjeta_credito}
                  onChange={(e) => setFormData({ ...formData, numero_tarjeta_credito: e.target.value })}
                  disabled={submitting}
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Comentario / Nota</label>
                <textarea
                  className="textarea textarea-bordered textarea-sm w-full"
                  placeholder="Detalle o justificación de la transacción..."
                  value={formData.comentario}
                  onChange={(e) => setFormData({ ...formData, comentario: e.target.value })}
                  disabled={submitting}
                ></textarea>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="btn btn-ghost btn-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-sm flex items-center gap-2"
                >
                  {submitting && <span className="loading loading-spinner loading-xs"></span>}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
