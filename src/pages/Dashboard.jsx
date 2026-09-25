import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../utils/formatters";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  ArrowRightLeft,
  CalendarCheck,
  Search,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const [limiteInfo, setLimiteInfo] = useState(null);
  const [recentTrx, setRecentTrx] = useState([]);
  const [summary, setSummary] = useState({ ingresos: 0, egresos: 0, balance: 0 });
  const [loading, setLoading] = useState(true);

  /* Carga los datos en tiempo real del panel principal */
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      if (user?.id) {
        const [limiteRes, trxRes, consultasRes] = await Promise.all([
          api.get(`/usuarios/${user.id}/limite-status`),
          api.get("/transacciones?limit=5&page=1"),
          api.get("/consultas"),
        ]);

        const limData = limiteRes.data?.data || {};
        setLimiteInfo(limData);

        const trxList = trxRes.data?.data?.transacciones || [];
        setRecentTrx(Array.isArray(trxList) ? trxList : []);

        const resData = consultasRes.data?.data?.resumen || {};
        setSummary({
          ingresos: resData.total_ingresos || 0,
          egresos: resData.total_egresos || 0,
          balance: resData.balance_neto || 0,
        });
      }
    } catch {
      // Manejado en interceptor
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const safeRecentTrx = Array.isArray(recentTrx) ? recentTrx : [];

  return (
    <div className="space-y-6">
      {/* Saludo y bienvenida */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">¡Hola, {user?.nombre}!</h1>
          <p className="text-sm text-base-content/60">
            Resumen de tu salud financiera para el periodo activo.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/transacciones" className="btn btn-primary btn-sm gap-2">
            <ArrowRightLeft className="w-4 h-4" /> Nueva Transacción
          </Link>
          <Link to="/cortes" className="btn btn-outline btn-sm gap-2">
            <CalendarCheck className="w-4 h-4" /> Realizar Corte
          </Link>
        </div>
      </div>

      {/* Alerta Destacada si superó el límite mensual */}
      {limiteInfo?.supero_limite && (
        <div className="alert alert-error shadow-md text-error-content">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <div>
            <h3 className="font-bold text-lg">Alerta de Límite de Egresos Excedido</h3>
            <div className="text-sm">
              Has gastado{" "}
              <span className="font-bold">
                {formatCurrency(limiteInfo.total_gastado)}
              </span>{" "}
              de tu límite de{" "}
              <span className="font-bold">
                {formatCurrency(limiteInfo.limite_egresos)}
              </span>{" "}
              (Exceso de {formatCurrency(limiteInfo.exceso)} -{" "}
              {limiteInfo.porcentaje_consumido}% consumido).
            </div>
          </div>
        </div>
      )}

      {/* Tarjeta de Límite Mensual con Barra de Progreso */}
      {limiteInfo && (
        <div className="card bg-base-100 shadow-sm border border-base-300">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-base-content flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" /> Límite de Egresos del Periodo
              </span>
              <span className="text-sm text-base-content/60">
                Corte mensual el día {user?.fecha_corte || 30}
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Consumido: <strong className="text-error">{formatCurrency(limiteInfo.total_gastado)}</strong></span>
                <span>Límite: <strong>{formatCurrency(limiteInfo.limite_egresos)}</strong></span>
              </div>

              <progress
                className={`progress w-full h-3 ${
                  limiteInfo.supero_limite
                    ? "progress-error"
                    : limiteInfo.porcentaje_consumido > 80
                    ? "progress-warning"
                    : "progress-primary"
                }`}
                value={Math.min(limiteInfo.porcentaje_consumido || 0, 100)}
                max="100"
              ></progress>

              <div className="flex justify-between items-center text-xs text-base-content/60 pt-1">
                <span>
                  {limiteInfo.supero_limite
                    ? `Sobrepasado por ${formatCurrency(limiteInfo.exceso)}`
                    : `Disponible: ${formatCurrency(limiteInfo.saldo_restante)}`}
                </span>
                <span className="font-bold">{limiteInfo.porcentaje_consumido || 0}% utilizado</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tarjetas de Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 shadow-sm rounded-box border border-base-200">
          <div className="stat-figure text-success">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title font-medium">Ingresos del Periodo</div>
          <div className="stat-value text-success text-2xl">
            {formatCurrency(summary.ingresos)}
          </div>
          <div className="stat-desc">Acumulado transacciones aplicadas</div>
        </div>

        <div className="stat bg-base-100 shadow-sm rounded-box border border-base-200">
          <div className="stat-figure text-error">
            <TrendingDown className="w-8 h-8" />
          </div>
          <div className="stat-title font-medium">Egresos del Periodo</div>
          <div className="stat-value text-error text-2xl">
            {formatCurrency(summary.egresos)}
          </div>
          <div className="stat-desc">Gastos acumulados</div>
        </div>

        <div className="stat bg-base-100 shadow-sm rounded-box border border-base-200">
          <div className="stat-figure text-primary">
            <DollarSign className="w-8 h-8" />
          </div>
          <div className="stat-title font-medium">Balance Neto</div>
          <div className={`stat-value text-2xl ${summary.balance >= 0 ? "text-primary" : "text-error"}`}>
            {formatCurrency(summary.balance)}
          </div>
          <div className="stat-desc">Diferencia Ingresos - Egresos</div>
        </div>
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/transacciones" className="btn btn-outline border-base-300 flex flex-col h-auto py-4 gap-2 bg-base-100 hover:bg-base-200">
          <ArrowRightLeft className="w-6 h-6 text-primary" />
          <span>Transacciones</span>
        </Link>
        <Link to="/cortes" className="btn btn-outline border-base-300 flex flex-col h-auto py-4 gap-2 bg-base-100 hover:bg-base-200">
          <CalendarCheck className="w-6 h-6 text-secondary" />
          <span>Cortes Mensuales</span>
        </Link>
        <Link to="/consultas" className="btn btn-outline border-base-300 flex flex-col h-auto py-4 gap-2 bg-base-100 hover:bg-base-200">
          <Search className="w-6 h-6 text-accent" />
          <span>Consultas</span>
        </Link>
        <Link to="/reportes" className="btn btn-outline border-base-300 flex flex-col h-auto py-4 gap-2 bg-base-100 hover:bg-base-200">
          <CheckCircle2 className="w-6 h-6 text-info" />
          <span>Reportes</span>
        </Link>
      </div>

      {/* Tabla de Útimas Transacciones Registradas */}
      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Últimas Transacciones</h3>
            <Link to="/transacciones" className="btn btn-ghost btn-xs text-primary gap-1">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {safeRecentTrx.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-base-content/50">
                      No hay transacciones recientes registradas.
                    </td>
                  </tr>
                ) : (
                  safeRecentTrx.map((t) => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs font-semibold">{t.numero_transaccion}</td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold ${
                            t.tipo_transaccion === "INGRESO" ? "badge-success text-success-content" : "badge-error text-error-content"
                          }`}
                        >
                          {t.tipo_transaccion}
                        </span>
                      </td>
                      <td className="text-sm">{formatDate(t.fecha_transaccion)}</td>
                      <td className="font-bold text-sm">
                        {formatCurrency(t.monto)}
                      </td>
                      <td>
                        <span
                          className={`badge badge-sm badge-outline ${
                            t.estado === "APLICADA"
                              ? "badge-success"
                              : t.estado === "PENDIENTE"
                              ? "badge-warning"
                              : "badge-error"
                          }`}
                        >
                          {t.estado}
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
  );
};
