import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Swal from "sweetalert2";
import { User, Key, Save, Lock, Mail, CreditCard, Calendar, ShieldCheck, Briefcase } from "lucide-react";
import { formatCedula } from "../utils/formatters";

export const Perfil = () => {
  const { user, updateUserData } = useAuth();

  /* Formulario de información de perfil */
  const [profileForm, setProfileForm] = useState({
    nombre: user?.nombre || "",
    limite_egresos: user?.limite_egresos || 0,
    tipo_persona: user?.tipo_persona || "FISICA",
    fecha_corte: user?.fecha_corte || 30,
  });

  /* Formulario de cambio de contraseña */
  const [passwordForm, setPasswordForm] = useState({
    password_actual: "",
    password_nueva: "",
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  /* Guardar cambios de perfil */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const lim = Number(profileForm.limite_egresos);
    if (isNaN(lim) || lim < 0) {
      Swal.fire({
        icon: "warning",
        title: "Límite Inválido",
        text: "El límite mensual de egresos debe ser un monto numérico mayor o igual a RD$ 0.00.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    if (lim > 999999999999.99) {
      Swal.fire({
        icon: "warning",
        title: "Límite Excedido",
        text: "El límite mensual de egresos no puede superar los RD$ 999,999,999,999.99.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    const corte = Number(profileForm.fecha_corte);
    if (isNaN(corte) || corte < 1 || corte > 31) {
      Swal.fire({
        icon: "warning",
        title: "Día de Corte Inválido",
        text: "El día de corte debe ser un número entero entre 1 y 31.",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setLoadingProfile(true);
    try {
      const res = await api.put(`/usuarios/${user.id}`, {
        nombre: profileForm.nombre,
        limite_egresos: lim,
        tipo_persona: profileForm.tipo_persona,
        fecha_corte: corte,
      });

      const updated = res.data.data.usuario || res.data.data;
      updateUserData(updated);

      Swal.fire({
        icon: "success",
        title: "Perfil Actualizado",
        text: "Tus datos personales fueron guardados con éxito.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      // Manejado en interceptor
    } finally {
      setLoadingProfile(false);
    }
  };

  /* Guardar cambio de contraseña */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.password_actual || !passwordForm.password_nueva) {
      Swal.fire({
        icon: "warning",
        title: "Campos Incompletos",
        text: "Ingresa tu contraseña actual y la nueva contraseña.",
      });
      return;
    }

    setLoadingPassword(true);
    try {
      await api.post("/auth/change-password", passwordForm);
      Swal.fire({
        icon: "success",
        title: "Contraseña Cambiada",
        text: "Tu contraseña ha sido actualizada exitosamente.",
      });
      setPasswordForm({ password_actual: "", password_nueva: "" });
    } catch {
      // Manejado en interceptor
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-10">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-base-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-base-content flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <User className="w-7 h-7" />
            </div>
            Mi Perfil
          </h1>
          <p className="text-sm text-base-content/70 mt-1">
            Gestiona tu información personal, parámetros de corte financiero y credenciales de acceso.
          </p>
        </div>
      </div>

      {/* Grid Responsivo Amplio */}
      <div className="max-w-4xl">
        {/* Tarjeta de Datos Personales */}
        <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
          <div className="card-body p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-base-200 pb-4">
              <h2 className="font-bold text-xl text-base-content flex items-center gap-3">
                <User className="w-5 h-5 text-primary" /> Datos Personales
              </h2>
              <span className="text-xs text-base-content/50 font-medium">Información de la Cuenta</span>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Fila 1: Cédula y Correo (Solo Lectura) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70 flex items-center justify-between">
                    <span>Cédula / Identificación</span>
                    <Lock className="w-3.5 h-3.5 text-base-content/40" />
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input input-bordered input-md w-full bg-base-200/60 font-mono text-sm text-base-content/80 cursor-not-allowed pl-10 rounded-xl"
                      value={formatCedula(user?.cedula || "")}
                      disabled
                    />
                    <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70 flex items-center justify-between">
                    <span>Correo Electrónico</span>
                    <Lock className="w-3.5 h-3.5 text-base-content/40" />
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className="input input-bordered input-md w-full bg-base-200/60 text-sm text-base-content/80 cursor-not-allowed pl-10 rounded-xl"
                      value={user?.email || ""}
                      disabled
                    />
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                </div>
              </div>

              {/* Fila 2: Nombre Completo y Tipo Persona */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input input-bordered input-md w-full text-sm pl-10 rounded-xl"
                      value={profileForm.nombre}
                      onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
                      required
                    />
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Tipo de Persona
                  </label>
                  <div className="relative">
                    <select
                      className="select select-bordered select-md w-full text-sm pl-10 rounded-xl"
                      value={profileForm.tipo_persona}
                      onChange={(e) => setProfileForm({ ...profileForm, tipo_persona: e.target.value })}
                    >
                      <option value="FISICA">Física (Individual)</option>
                      <option value="JURIDICA">Jurídica (Empresa / RNC)</option>
                    </select>
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                </div>
              </div>

              {/* Fila 3: Límite Egresos y Día de Corte */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Límite Mensual de Egresos
                  </label>
                  <div className="join w-full">
                    <span className="join-item btn btn-md btn-neutral no-animation font-bold text-xs px-4 rounded-l-xl">
                      RD$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="999999999999.99"
                      className="join-item input input-bordered input-md w-full text-sm font-semibold rounded-r-xl"
                      value={profileForm.limite_egresos}
                      onChange={(e) => setProfileForm({ ...profileForm, limite_egresos: e.target.value })}
                      required
                    />
                  </div>
                  <span className="text-[11px] text-base-content/50 mt-1">
                    Máx: RD$ 999,999,999,999.99 (0 para sin límite)
                  </span>
                </div>

                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Día de Corte Mensual (1 a 31)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className="input input-bordered input-md w-full text-sm pl-10 font-semibold rounded-xl"
                      value={profileForm.fecha_corte}
                      onChange={(e) => setProfileForm({ ...profileForm, fecha_corte: e.target.value })}
                      required
                    />
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                  <span className="text-[11px] text-base-content/50 mt-1">
                    Día en que cierra la facturación mensual
                  </span>
                </div>
              </div>

              {/* Botón de Envio */}
              <div className="flex justify-end pt-4 border-t border-base-200">
                <button
                  type="submit"
                  disabled={loadingProfile}
                  className="btn btn-primary px-8 h-11 rounded-xl font-semibold gap-2"
                >
                  {loadingProfile ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar Datos Personales
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Tarjeta de Cambio de Contraseña (Oculta visualmente en la UI, lógica preservada) */}
        {false && (
          <div className="card bg-base-100 border border-base-200 shadow-sm rounded-2xl">
            <div className="card-body p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-base-200 pb-4">
                <h2 className="font-bold text-xl text-base-content flex items-center gap-3">
                  <Key className="w-5 h-5 text-primary" /> Seguridad
                </h2>
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>

              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered input-md w-full text-sm pl-10 rounded-xl"
                      value={passwordForm.password_actual}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_actual: e.target.value })}
                      required
                    />
                    <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold uppercase tracking-wider text-base-content/70">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered input-md w-full text-sm pl-10 rounded-xl"
                      value={passwordForm.password_nueva}
                      onChange={(e) => setPasswordForm({ ...passwordForm, password_nueva: e.target.value })}
                      required
                    />
                    <ShieldCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                </div>

                <div className="pt-4 border-t border-base-200">
                  <button
                    type="submit"
                    disabled={loadingPassword}
                    className="btn btn-primary w-full h-11 rounded-xl font-semibold gap-2 shadow-sm"
                  >
                    {loadingPassword ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Actualizar Contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
