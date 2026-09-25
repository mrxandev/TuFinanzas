import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatters";
import { Search, Filter, RefreshCw, TrendingUp, TrendingDown, DollarSign, ListFilter, Download } from "lucide-react";
import { exportConsultaPDF } from "../utils/pdfExport";

export const Consultas = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [resumen, setResumen] = useState({ total_ingresos: 0, total_egresos: 0, balance_neto: 0, total_registros: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);

  /* Listas auxiliares para selects */
  const [tiposEgresos, setTiposEgresos] = useState([]);
  const [tiposIngresos, setTiposIngresos] = useState([]);
  const [renglones, setRenglones] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);

  /* Criterios de consulta multidimensional */
  const [query, setQuery] = useState({
    fecha_desde: "",
    fecha_hasta: "",
    tipo_transaccion: "",
    tipo_egreso_id: "",
    tipo_ingreso_id: "",
    renglon_egreso_id: "",
    tipo_pago_id: "",
    estado: "",
    monto_min: "",
    monto_max: "",
    busqueda: "",
  });

  /* Ejecución de la consulta multidimensional */
  const runConsulta = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(query.fecha_desde && { fecha_desde: query.fecha_desde }),
        ...(query.fecha_hasta && { fecha_hasta: query.fecha_hasta }),
        ...(query.tipo_transaccion && { tipo_transaccion: query.tipo_transaccion }),
        ...(query.tipo_egreso_id && { tipo_egreso_id: query.tipo_egreso_id }),
        ...(query.tipo_ingreso_id && { tipo_ingreso_id: query.tipo_ingreso_id }),
        ...(query.renglon_egreso_id && { renglon_egreso_id: query.renglon_egreso_id }),
        ...(query.tipo_pago_id && { tipo_pago_id: query.tipo_pago_id }),
        ...(query.estado && { estado: query.estado }),
        ...(query.monto_min && { monto_min: query.monto_min }),
        ...(query.monto_max && { monto_max: query.monto_max }),
        ...(query.busqueda && { busqueda: query.busqueda }),
      });

      const res = await api.get(`/consultas?${params.toString()}`);
      const data = res.data.data;
      setTransacciones(data.transacciones || []);
      setResumen(data.resumen || { total_ingresos: 0, total_egresos: 0, balance_neto: 0, total_registros: 0 });
      setPagination(data.pagination || { page: 1, limit: 10, totalPages: 1 });
    } catch {
      // Interceptor
    } finally {
      setLoading(false);
    }
  }, [query, pagination.limit]);

  /* Carga de catálogos para filtros */
  const fetchAuxiliaryData = async () => {
    try {
      const [te, ti, re, tp] = await Promise.all([
        api.get("/tipos-egresos?limit=100"),
        api.get("/tipos-ingresos?limit=100"),
        api.get("/renglones-egresos?limit=100"),
        api.get("/tipos-pago?limit=100"),
      ]);
      setTiposEgresos(te.data.data.tipos_egresos || te.data.data.tipos || te.data.data || []);
      setTiposIngresos(ti.data.data.tipos_ingresos || ti.data.data.tipos || ti.data.data || []);
      setRenglones(re.data.data.renglones_egresos || re.data.data.renglones || re.data.data || []);
      setTiposPago(tp.data.data.tipos_pago || tp.data.data.tipos || tp.data.data || []);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    runConsulta(1);
    fetchAuxiliaryData();
  }, [runConsulta]);

  /* Limpiar filtros */
  const handleReset = () => {
    setQuery({
      fecha_desde: "",
      fecha_hasta: "",
      tipo_transaccion: "",
      tipo_egreso_id: "",
      tipo_ingreso_id: "",
      renglon_egreso_id: "",
      tipo_pago_id: "",
      estado: "",
      monto_min: "",
      monto_max: "",
      busqueda: "",
    });
  };

  /* Exportar a PDF */
  const handleExportPDF = () => {
    exportConsultaPDF(transacciones, resumen, query);
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consulta Multidimensional</h1>
          <p className="text-sm text-base-content/60">
            Filtra y analiza transacciones cruzando múltiples criterios financieros.
          </p>
        </div>

        <button
          onClick={handleExportPDF}
          disabled={loading || transacciones.length === 0}
          className="btn btn-primary btn-sm gap-2 shadow-sm"
          title="Exportar los resultados de la consulta a PDF"
        >
          <Download className="w-4 h-4" /> Exportar PDF
        </button>
      </div>

      {/* Formulario de Búsqueda Multicriterio */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-4 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-sm text-primary">
            <ListFilter className="w-4 h-4" /> Criterios de Selección
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Tipo Transacción</label>
              <select
                className="select select-bordered select-sm"
                value={query.tipo_transaccion}
                onChange={(e) => setQuery({ ...query, tipo_transaccion: e.target.value })}
              >
                <option value="">Todos los tipos</option>
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Tipo de Egreso</label>
              <select
                className="select select-bordered select-sm"
                value={query.tipo_egreso_id}
                onChange={(e) => setQuery({ ...query, tipo_egreso_id: e.target.value })}
              >
                <option value="">Todos los tipos de egreso</option>
                {tiposEgresos.map((te) => (
                  <option key={te.id} value={te.id}>
                    {te.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Tipo de Ingreso</label>
              <select
                className="select select-bordered select-sm"
                value={query.tipo_ingreso_id}
                onChange={(e) => setQuery({ ...query, tipo_ingreso_id: e.target.value })}
              >
                <option value="">Todos los tipos de ingreso</option>
                {tiposIngresos.map((ti) => (
                  <option key={ti.id} value={ti.id}>
                    {ti.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Renglón Presupuestario</label>
              <select
                className="select select-bordered select-sm"
                value={query.renglon_egreso_id}
                onChange={(e) => setQuery({ ...query, renglon_egreso_id: e.target.value })}
              >
                <option value="">Todos los renglones</option>
                {renglones.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Medio de Pago</label>
              <select
                className="select select-bordered select-sm"
                value={query.tipo_pago_id}
                onChange={(e) => setQuery({ ...query, tipo_pago_id: e.target.value })}
              >
                <option value="">Todos los medios</option>
                {tiposPago.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.descripcion}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Fecha Desde</label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={query.fecha_desde}
                onChange={(e) => setQuery({ ...query, fecha_desde: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Fecha Hasta</label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={query.fecha_hasta}
                onChange={(e) => setQuery({ ...query, fecha_hasta: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Monto Mínimo (RD$)</label>
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered input-sm"
                value={query.monto_min}
                onChange={(e) => setQuery({ ...query, monto_min: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label py-1 text-xs font-semibold">Monto Máximo (RD$)</label>
              <input
                type="number"
                placeholder="999999.00"
                className="input input-bordered input-sm"
                value={query.monto_max}
                onChange={(e) => setQuery({ ...query, monto_max: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Búsqueda libre por concepto o nota..."
                className="input input-bordered input-sm w-full pl-9"
                value={query.busqueda}
                onChange={(e) => setQuery({ ...query, busqueda: e.target.value })}
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            </div>

            <button onClick={handleReset} className="btn btn-ghost btn-sm gap-1">
              <RefreshCw className="w-4 h-4" /> Limpiar
            </button>

            <button onClick={() => runConsulta(1)} className="btn btn-primary btn-sm gap-1">
              <Filter className="w-4 h-4" /> Consultar
            </button>
          </div>
        </div>
      </div>

      {/* Tarjetas Analíticas de Totales de la Consulta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 shadow-sm rounded-box border border-base-200">
          <div className="stat-figure text-success">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div className="stat-title text-xs font-medium">Total Ingresos Filtrados</div>
          <div className="stat-value text-success text-xl font-bold">
            {formatCurrency(resumen.total_ingresos)}
          </div>
        </div>

        <div className="stat bg-base-100 shadow-sm rounded-box border border-base-200">
          <div className="stat-figure text-error">
            <TrendingDown className="w-7 h-7" />
          </div>
          <div className="stat-title text-xs font-medium">Total Egresos Filtrados</div>
          <div className="stat-value text-error text-xl font-bold">
            {formatCurrency(resumen.total_egresos)}
          </div>
        </div>

        <div className="stat bg-base-100 shadow-sm rounded-box border border-base-200">
          <div className="stat-figure text-primary">
            <DollarSign className="w-7 h-7" />
          </div>
          <div className="stat-title text-xs font-medium">Balance Neto Resultante</div>
          <div className={`stat-value text-xl font-bold ${resumen.balance_neto >= 0 ? "text-primary" : "text-error"}`}>
            {formatCurrency(resumen.balance_neto)}
          </div>
        </div>
      </div>

      {/* Tabla de Resultados */}
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
                  <th>Concepto</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {transacciones.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-base-content/50">
                      No hay registros que coincidan con la consulta.
                    </td>
                  </tr>
                ) : (
                  transacciones.map((t) => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs font-semibold">{t.numero_transaccion}</td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            t.tipo_transaccion === "INGRESO" ? "badge-success text-success-content" : "badge-error text-error-content"
                          }`}
                        >
                          {t.tipo_transaccion}
                        </span>
                      </td>
                      <td className="text-sm">{formatDate(t.fecha_transaccion)}</td>
                      <td className="text-sm">{t.concepto_descripcion || t.comentario || "-"}</td>
                      <td className="font-bold text-sm">
                        {formatCurrency(t.monto)}
                      </td>
                      <td>
                        <span className="badge badge-sm badge-outline">{t.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t border-base-200">
          <span className="text-xs text-base-content/60">
            Página {pagination.page} de {pagination.totalPages} ({resumen.total_registros} resultados)
          </span>
          <div className="join">
            <button
              disabled={pagination.page <= 1}
              onClick={() => runConsulta(pagination.page - 1)}
              className="join-item btn btn-xs"
            >
              Anterior
            </button>
            <button className="join-item btn btn-xs">{pagination.page}</button>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => runConsulta(pagination.page + 1)}
              className="join-item btn btn-xs"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
