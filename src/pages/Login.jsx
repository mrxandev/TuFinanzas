import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { LogIn, Mail, Lock } from "lucide-react";

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* Manejo del envio de formulario de inicio de sesión */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      Swal.fire({
        icon: "warning",
        title: "Campos requeridos",
        text: "Por favor completa el correo y la contraseña",
        confirmButtonColor: "#f59e0b",
      });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      Swal.fire({
        icon: "success",
        title: "Bienvenido",
        text: "Sesión iniciada correctamente",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/");
    } catch {
      // El error HTTP ya se notifica mediante el interceptor de Axios
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-base-content">TuFinanzas</h1>
            <p className="text-sm text-base-content/60 mt-1">Gestión de Finanzas Personales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Correo Electrónico</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  className="input input-bordered w-full pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Contraseña</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <span className="loading loading-spinner"></span> : <LogIn className="w-5 h-5" />}
              Iniciar Sesión
            </button>
          </form>

          <div className="divider text-xs text-base-content/40 my-6">¿No tienes cuenta?</div>

          <div className="text-center">
            <Link to="/register" className="btn btn-outline btn-block btn-sm">
              Crear una cuenta nueva
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
