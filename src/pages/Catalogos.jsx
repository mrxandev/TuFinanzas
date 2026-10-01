import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { Plus, Edit, Trash2, Tag, Layers, CreditCard, Bookmark, Landmark, Shield } from "lucide-react";

export const Catalogos = () => {
  const [activeTab, setActiveTab] = useState("tipos-egresos");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Listas auxiliares para los conceptos */
  const [tiposEgresos, setTiposEgresos] = useState([]);
  const [tiposIngresos, setTiposIngresos] = useState([]);
  const [renglonesEgresos, setRenglonesEgresos] = useState([]);
  const [tiposPago, setTiposPago] = useState([]);

  /* Modal de formulario */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    descripcion: "",
    estado: "ACTIVO",
    tipo_egreso_id: "",
    renglon_egreso_id: "",
    tipo_pago_defecto_id: "",
    tipo_ingreso_id: "",
    institucion: "",
  });

  /* Carga los elementos del catálogo activo */
  const fetchCatalogData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${activeTab}?limit=100`);
      const dataObj = res.data?.data || {};
      const key = activeTab.replace(/-/g, "_");
      const list = dataObj[key] || dataObj.tipos || dataObj.renglones || dataObj.conceptos || (Array.isArray(dataObj) ? dataObj : []);
      setItems(Array.isArray(list) ? list : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  /* Carga las dependencias para los selects de conceptos */
  const fetchDependencies = async () => {
    try {
      const [te, ti, re, tp] = await Promise.all([
        api.get("/tipos-egresos?limit=100"),
        api.get("/tipos-ingresos?limit=100"),
        api.get("/renglones-egresos?limit=100"),
        api.get("/tipos-pago?limit=100"),
      ]);
      setTiposEgresos(te.data.data.tipos_egresos || te.data.data.tipos || te.data.data || []);
      setTiposIngresos(ti.data.data.tipos_ingresos || ti.data.data.tipos || ti.data.data || []);
      setRenglonesEgresos(re.data.data.renglones_egresos || re.data.data.renglones || re.data.data || []);
      setTiposPago(tp.data.data.tipos_pago || tp.data.data.tipos || tp.data.data || []);
    } catch {
      // Ignorar
    }
  };

  useEffect(() => {
    fetchCatalogData();
    fetchDependencies();
  }, [fetchCatalogData]);

  /* Restablecer estado de formulario modal */
  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      descripcion: "",
      estado: "ACTIVO",
      tipo_egreso_id: tiposEgresos[0]?.id || "",
      renglon_egreso_id: renglonesEgresos[0]?.id || "",
      tipo_pago_defecto_id: tiposPago[0]?.id || "",
      tipo_ingreso_id: tiposIngresos[0]?.id || "",
      institucion: "",
    });
    setModalOpen(true);
  };

  /* Modal para editar registro */
  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      descripcion: item.descripcion || "",
      estado: item.estado || "ACTIVO",
      tipo_egreso_id: item.tipo_egreso_id || "",
      renglon_egreso_id: item.renglon_egreso_id || "",
      tipo_pago_defecto_id: item.tipo_pago_defecto_id || "",
      tipo_ingreso_id: item.tipo_ingreso_id || "",
      institucion: item.institucion || "",
    });
    setModalOpen(true);
  };

  /* Guardar registro en el catálogo activo con protección de doble clic */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/${activeTab}/${editingId}`, formData);
        Swal.fire("Actualizado", "El registro ha sido modificado.", "success");
      } else {
        await api.post(`/${activeTab}`, formData);
        Swal.fire("Guardado", "Nuevo registro agregado al catálogo.", "success");
      }
      setModalOpen(false);
      fetchCatalogData();
    } catch {
      // Interceptor
    } finally {
      setSubmitting(false);
    }
  };

  /* Eliminar elemento */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar registro?",
      text: "No podrás revertir esto si existen referencias activas",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/${activeTab}/${id}`);
        Swal.fire("Eliminado", "El elemento ha sido eliminado.", "success");
        fetchCatalogData();
      } catch {
        // Interceptor
      }
    }
  };

  const tabs = [
    { id: "tipos-egresos", label: "Tipos de Egresos", icon: Tag },
    { id: "tipos-ingresos", label: "Tipos de Ingresos", icon: Landmark },
    { id: "renglones-egresos", label: "Renglones Egresos", icon: Layers },
    { id: "tipos-pago", label: "Tipos de Pago", icon: CreditCard },
    { id: "conceptos-egresos", label: "Conceptos Egresos", icon: Bookmark },
    { id: "conceptos-ingresos", label: "Conceptos Ingresos", icon: Bookmark },
  ];

  const safeItems = Array.isArray(items) ? items : [];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Catálogos Maestros</h1>
            <span className="text-secondary text-xs flex items-center gap-1 font-semibold">
              <Shield className="w-3 h-3" /> Solo Admin
            </span>
          </div>
          <p className="text-sm text-base-content/60">
            Administra las clasificaciones y plantillas del sistema.
          </p>
        </div>
        <button onClick={openNewModal} className="btn btn-primary gap-2">
          <Plus className="w-5 h-5" /> Nuevo Registro
        </button>
      </div>

      {/* Control de Pestañas DaisyUI */}
      <div className="tabs tabs-boxed bg-base-100 p-2 border border-base-300 overflow-x-auto flex-nowrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab tab-md gap-2 whitespace-nowrap ${
                activeTab === tab.id ? "tab-active bg-primary text-primary-content font-bold" : ""
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tabla de Datos del Catálogo */}
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
                  <th>Descripción</th>
                  {activeTab === "conceptos-egresos" && (
                    <>
                      <th>Tipo Egreso</th>
                      <th>Renglón</th>
                      <th>Pago Defecto</th>
                    </>
                  )}
                  {activeTab === "conceptos-ingresos" && (
                    <>
                      <th>Tipo Ingreso</th>
                      <th>Institución</th>
                    </>
                  )}
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {safeItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-base-content/50">
                      No existen registros en este catálogo.
                    </td>
                  </tr>
                ) : (
                  safeItems.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-sm">{item.descripcion}</td>
                      {activeTab === "conceptos-egresos" && (
                        <>
                          <td className="text-xs">{item.tipo_egreso_descripcion || "-"}</td>
                          <td className="text-xs">{item.renglon_egreso_descripcion || "-"}</td>
                          <td className="text-xs">{item.tipo_pago_defecto_descripcion || "-"}</td>
                        </>
                      )}
                      {activeTab === "conceptos-ingresos" && (
                        <>
                          <td className="text-xs">{item.tipo_ingreso_descripcion || "-"}</td>
                          <td className="text-xs">{item.institucion || "-"}</td>
                        </>
                      )}
                      <td>
                        <span
                          className={`font-semibold text-xs ${
                            item.estado === "ACTIVO" ? "text-success" : "text-slate-500"
                          }`}
                        >
                          {item.estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => openEditModal(item)}
                            className="btn btn-ghost btn-xs text-info"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="btn btn-ghost btn-xs text-error"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal para Crear / Editar */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4">
              {editingId ? "Editar Registro" : "Nuevo Registro en Catálogo"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Descripción</label>
                <input
                  type="text"
                  className="input input-bordered input-sm w-full"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  disabled={submitting}
                  required
                />
              </div>

              {/* Formulario adaptativo según la pestaña del catálogo */}
              {activeTab === "conceptos-egresos" && (
                <>
                  <div className="form-control">
                    <label className="label py-1 text-xs font-semibold">Tipo de Egreso</label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={formData.tipo_egreso_id}
                      onChange={(e) => setFormData({ ...formData, tipo_egreso_id: e.target.value })}
                      disabled={submitting}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {tiposEgresos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1 text-xs font-semibold">Renglón de Egreso</label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={formData.renglon_egreso_id}
                      onChange={(e) => setFormData({ ...formData, renglon_egreso_id: e.target.value })}
                      disabled={submitting}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {renglonesEgresos.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1 text-xs font-semibold">Tipo de Pago Defecto</label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={formData.tipo_pago_defecto_id}
                      onChange={(e) => setFormData({ ...formData, tipo_pago_defecto_id: e.target.value })}
                      disabled={submitting}
                    >
                      <option value="">-- Ninguno --</option>
                      {tiposPago.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === "conceptos-ingresos" && (
                <>
                  <div className="form-control">
                    <label className="label py-1 text-xs font-semibold">Tipo de Ingreso</label>
                    <select
                      className="select select-bordered select-sm w-full"
                      value={formData.tipo_ingreso_id}
                      onChange={(e) => setFormData({ ...formData, tipo_ingreso_id: e.target.value })}
                      disabled={submitting}
                      required
                    >
                      <option value="">-- Seleccionar --</option>
                      {tiposIngresos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.descripcion}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label py-1 text-xs font-semibold">Institución / Cliente</label>
                    <input
                      type="text"
                      className="input input-bordered input-sm w-full"
                      value={formData.institucion}
                      onChange={(e) => setFormData({ ...formData, institucion: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                </>
              )}

              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Estado</label>
                <select
                  className="select select-bordered select-sm w-full"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  disabled={submitting}
                >
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
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
