import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Swal from "sweetalert2";
import { User, Key, Save } from "lucide-react";
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
    setLoadingProfile(true);
    try {
      const res = await api.put(`/usuarios/${user.id}`, {
        nombre: profileForm.nombre,
        limite_egresos: Number(profileForm.limite_egresos),
        tipo_persona: profileForm.tipo_persona,
        fecha_corte: Number(profileForm.fecha_corte),
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
      // Interceptor
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
      // Interceptor
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-sm text-base-content/60">
          Gestiona tu información personal, límites y credenciales de acceso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Formulario de Información de Perfil */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Datos Personales
            </h2>

            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Cédula</label>
                <input
                  type="text"
                  className="input input-bordered input-sm bg-base-200 font-mono"
                  value={formatCedula(user?.cedula || "")}
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Correo Electrónico</label>
                <input
                  type="email"
                  className="input input-bordered input-sm bg-base-200"
                  value={user?.email || ""}
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Nombre Completo</label>
                <input
                  type="text"
                  className="input input-bordered input-sm"
                  value={profileForm.nombre}
                  onChange={(e) => setProfileForm({ ...profileForm, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Límite Egresos (RD$)</label>
                  <input
                    type="number"
                    className="input input-bordered input-sm"
                    value={profileForm.limite_egresos}
                    onChange={(e) => setProfileForm({ ...profileForm, limite_egresos: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1 text-xs font-semibold">Día de Corte Mensual</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="input input-bordered input-sm"
                    value={profileForm.fecha_corte}
                    onChange={(e) => setProfileForm({ ...profileForm, fecha_corte: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loadingProfile}
                className="btn btn-primary btn-sm w-full mt-4 flex items-center justify-center gap-2"
              >
                {loadingProfile ? <span className="loading loading-spinner"></span> : <Save className="w-4 h-4" />}
                Guardar Cambios
              </button>
            </form>
          </div>
        </div>

        {/* Formulario de Cambio de Contraseña */}
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-secondary" /> Cambiar Contraseña
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Contraseña Actual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered input-sm"
                  value={passwordForm.password_actual}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_actual: e.target.value })}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1 text-xs font-semibold">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered input-sm"
                  value={passwordForm.password_nueva}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_nueva: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loadingPassword}
                className="btn btn-secondary btn-sm w-full mt-4 flex items-center justify-center gap-2"
              >
                {loadingPassword ? <span className="loading loading-spinner"></span> : <Key className="w-4 h-4" />}
                Actualizar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
