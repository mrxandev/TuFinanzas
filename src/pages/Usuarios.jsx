import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import Swal from "sweetalert2";
import { formatCurrency } from "../utils/formatters";
import { Plus, Edit, Trash2, Shield, Eye, AlertTriangle } from "lucide-react";

export const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* Modal de creación/edición */
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    email: "",
    password: "",
    limite_egresos: 10000,
    tipo_persona: "FISICA",
    fecha_corte: 30,
    role: "USER",
    estado: "ACTIVO",
  });

  /* Modal para ver estado de límite */
  const [limiteModalOpen, setLimiteModalOpen] = useState(false);
  const [selectedUserLimite, setSelectedUserLimite] = useState(null);

  /* Cargar lista de usuarios */
  const fetchUsuarios = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/usuarios?page=${page}&limit=10`);
      const dataObj = res.data?.data || {};
      const list = dataObj.usuarios || (Array.isArray(dataObj) ? dataObj : []);
      setUsuarios(Array.isArray(list) ? list : []);
      setPagination(dataObj.pagination || { page: 1, limit: 10, totalPages: 1 });
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsuarios(1);
  }, [fetchUsuarios]);

  /* Restablecer formulario para nuevo usuario */
  const openNewModal = () => {
    setEditingId(null);
    setFormData({
      cedula: "",
      nombre: "",
      email: "",
      password: "",
      limite_egresos: 10000,
      tipo_persona: "FISICA",
      fecha_corte: 30,
      role: "USER",
      estado: "ACTIVO",
    });
    setModalOpen(true);
  };

  /* Modal para editar usuario */
  const openEditModal = (u) => {
    setEditingId(u.id);
    setFormData({
      cedula: u.cedula || "",
      nombre: u.nombre || "",
      email: u.email || "",
      password: "",
      limite_egresos: u.limite_egresos || 0,
      tipo_persona: u.tipo_persona || "FISICA",
      fecha_corte: u.fecha_corte || 30,
      role: u.role || "USER",
      estado: u.estado || "ACTIVO",
    });
    setModalOpen(true);
  };

  /* Enviar datos de usuario con protección de doble clic */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/usuarios/${editingId}`, {
          nombre: formData.nombre,
          limite_egresos: Number(formData.limite_egresos),
          tipo_persona: formData.tipo_persona,
          fecha_corte: Number(formData.fecha_corte),
          role: formData.role,
          estado: formData.estado,
        });
        Swal.fire("Actualizado", "El usuario ha sido modificado.", "success");
      } else {
        await api.post("/usuarios", formData);
        Swal.fire("Creado", "El usuario ha sido registrado.", "success");
      }
      setModalOpen(false);
      fetchUsuarios(pagination.page);
    } catch {
      // Interceptor
    } finally {
      setSubmitting(false);
    }
  };

  /* Consultar estado de límite de cualquier usuario */
  const handleViewLimiteStatus = async (id) => {
    try {
      const res = await api.get(`/usuarios/${id}/limite-status`);
      setSelectedUserLimite(res.data.data);
      setLimiteModalOpen(true);
    } catch {
      // Interceptor
    }
  };

  /* Eliminar usuario */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar usuario?",
      text: "Se eliminarán sus transacciones y cortes asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/usuarios/${id}`);
        Swal.fire("Eliminado", "El usuario ha sido eliminado.", "success");
        fetchUsuarios(pagination.page);
      } catch {
        // Interceptor
      }
    }
  };

  const safeUsuarios = Array.isArray(usuarios) ? usuarios : [];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-sm text-base-content/60">
            Administra roles, límites de egreso y días de corte.
          </p>
        </div>
        <button onClick={openNewModal} className="btn btn-primary gap-2">
          <Plus className="w-5 h-5" /> Nuevo Usuario
        </button>
      </div>

      {/* Tabla de Usuarios */}
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
                  <th>Cédula / RNC</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Límite Egresos</th>
                  <th>Día Corte</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {safeUsuarios.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-base-content/50">
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  safeUsuarios.map((u) => (
                    <tr key={u.id}>
                      <td className="font-mono text-xs">{u.cedula}</td>
                      <td className="font-bold text-sm">{u.nombre}</td>
                      <td className="text-sm">{u.email}</td>
                      <td>
                        <span className={`badge badge-sm ${u.role === "ADMIN" ? "badge-secondary" : "badge-outline"}`}>
                          <Shield className="w-3 h-3 mr-1" /> {u.role}
                        </span>
                      </td>
                      <td className="font-bold text-sm">
                        {formatCurrency(u.limite_egresos)}
                      </td>
                      <td className="text-sm font-semibold">Día {u.fecha_corte}</td>
                      <td>
                        <span
                          className={`badge badge-sm ${
                            u.estado === "ACTIVO"
                              ? "badge-success text-white"
                              : u.estado === "INACTIVO"
                              ? "badge-ghost"
                              : "badge-error text-white"
                          }`}
                        >
                          {u.estado}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleViewLimiteStatus(u.id)}
                            className="btn btn-ghost btn-xs text-secondary"
                            title="Ver Estado Límite"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(u)}
                            className="btn btn-ghost btn-xs text-info"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
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

      {/* Modal Crear/Editar Usuario */}
      {modalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg">
            <h3 className="font-bold text-lg mb-4">{editingId ? "Editar Usuario" : "Nuevo Usuario"}</h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Cédula / RNC</label>
                  <input
                    type="text"
                    placeholder="001-0000000-0"
                    className="input input-bordered input-sm"
                    value={formData.cedula}
                    onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                    disabled={!!editingId || submitting}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Nombre Completo</label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
              </div>

              {!editingId && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-1 text-xs font-semibold">Correo Electrónico</label>
                    <input
                      type="email"
                      className="input input-bordered input-sm"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={submitting}
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1 text-xs font-semibold">Contraseña</label>
                    <input
                      type="password"
                      className="input input-bordered input-sm"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Límite Egresos (RD$)</label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={formData.limite_egresos}
                    onChange={(e) => setFormData({ ...formData, limite_egresos: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Día Corte</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="input input-bordered input-sm"
                    value={formData.fecha_corte}
                    onChange={(e) => setFormData({ ...formData, fecha_corte: e.target.value })}
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Rol</label>
                  <select
                    className="select select-bordered select-sm"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Estado</label>
                <select
                  className="select select-bordered select-sm"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  disabled={submitting}
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                  <option value="SUSPENDIDO">SUSPENDIDO</option>
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

      {/* Modal Estado de Límite de Usuario */}
      {limiteModalOpen && selectedUserLimite && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              {selectedUserLimite.supero_limite ? (
                <AlertTriangle className="w-5 h-5 text-error animate-pulse" />
              ) : null}
              Estado de Límite de Gasto
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-base-200">
                <span>Límite Configurado:</span>
                <strong className="text-primary">
                  {formatCurrency(selectedUserLimite.limite_egresos)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-base-200">
                <span>Total Egresos Periodo:</span>
                <strong className="text-error">
                  {formatCurrency(selectedUserLimite.total_gastado)}
                </strong>
              </div>
              <div className="flex justify-between py-1 border-b border-base-200">
                <span>Consumido:</span>
                <strong className="font-bold">{selectedUserLimite.porcentaje_consumido}%</strong>
              </div>

              <progress
                className={`progress w-full h-3 ${
                  selectedUserLimite.supero_limite ? "progress-error" : "progress-primary"
                }`}
                value={Math.min(selectedUserLimite.porcentaje_consumido, 100)}
                max="100"
              ></progress>
            </div>

            <div className="modal-action">
              <button onClick={() => setLimiteModalOpen(false)} className="btn btn-primary btn-sm">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
