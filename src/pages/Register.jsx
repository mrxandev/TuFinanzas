import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { UserPlus, Wallet } from "lucide-react";

export const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cedula: "",
    nombre: "",
    email: "",
    password: "",
    limite_egresos: 10000,
    tipo_persona: "FISICA",
    fecha_corte: 30,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "limite_egresos" || name === "fecha_corte" ? Number(value) : value,
    }));
  };

  /* Envío de registro de nuevo usuario */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      Swal.fire({
        icon: "success",
        title: "Registro Exitoso",
        text: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
        confirmButtonColor: "#a78bfa",
      });
      navigate("/login");
    } catch {
      // El error HTTP ya se maneja en el interceptor de Axios
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-xl border border-base-300">
        <div className="card-body p-8">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-2">
              <Wallet className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-base-content">Crear Cuenta</h1>
            <p className="text-sm text-base-content/60">Únete a TuFinanzas y controla tus gastos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold">Cédula / RNC</span>
                </label>
                <input
                  type="text"
                  name="cedula"
                  placeholder="001-0000000-0"
                  className="input input-bordered input-sm w-full"
                  value={formData.cedula}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold">Nombre Completo</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Juan Pérez"
                  className="input input-bordered input-sm w-full"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Correo Electrónico</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                className="input input-bordered input-sm w-full"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Contraseña</span>
              </label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="input input-bordered input-sm w-full"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold">Tipo Persona</span>
                </label>
                <select
                  name="tipo_persona"
                  className="select select-bordered select-sm w-full"
                  value={formData.tipo_persona}
                  onChange={handleChange}
                >
                  <option value="FISICA">Física</option>
                  <option value="JURIDICA">Jurídica</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold">Límite Egresos (RD$)</span>
                </label>
                <input
                  type="number"
                  name="limite_egresos"
                  className="input input-bordered input-sm w-full"
                  value={formData.limite_egresos}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold">Día de Corte</span>
                </label>
                <input
                  type="number"
                  name="fecha_corte"
                  className="input input-bordered input-sm w-full"
                  value={formData.fecha_corte}
                  onChange={handleChange}
                  min="1"
                  max="31"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-4 btn-sm flex items-center justify-center gap-2"
            >
              {loading ? <span className="loading loading-spinner"></span> : <UserPlus className="w-4 h-4" />}
              Registrarse
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-sm text-base-content/60">¿Ya tienes cuenta? </span>
            <Link to="/login" className="link link-primary font-semibold text-sm">
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
