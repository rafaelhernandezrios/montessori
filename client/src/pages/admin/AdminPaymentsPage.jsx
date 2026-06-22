import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { PageHeader } from "../../components/AppShell";
import { formatMxn } from "../../utils/format";

export default function AdminPaymentsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.adminRevenue().then(setData).catch(() => {});
  }, []);

  if (!data) return <div className="panel">Cargando…</div>;

  const { revenue, recentPayments } = data;
  const maxChart = Math.max(...revenue.chart.map((c) => c.total), 1);

  return (
    <div className="scr">
      <PageHeader eyebrow="Finanzas" title="Ingresos y pagos" />

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        <div className="metric-card">
          <div className="metric-card-label">Ingresos del mes</div>
          <b>{formatMxn(revenue.monthRevenue)}</b>
          {revenue.monthGrowth !== 0 && (
            <div className="metric-card-hint" style={{ color: revenue.monthGrowth > 0 ? "var(--sage)" : "var(--clay)" }}>
              {revenue.monthGrowth > 0 ? "▲" : "▼"} {Math.abs(revenue.monthGrowth)}% vs. mes anterior
            </div>
          )}
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Ingreso recurrente (mes)</div>
          <b>{formatMxn(revenue.mrr)}</b>
          <div className="metric-card-hint">{revenue.subscriptionCount} suscripciones</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Ventas únicas (mes)</div>
          <b>{formatMxn(revenue.oneTimeMonth)}</b>
          <div className="metric-card-hint">sesiones y paquetes</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-label">Pendiente por cobrar</div>
          <b style={{ color: "var(--clay)" }}>{formatMxn(revenue.pendingAmount)}</b>
          <div className="metric-card-hint">{revenue.pendingCount} pagos</div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.2rem" }}>
          <h3 style={{ fontFamily: "var(--display)" }}>Ingresos · últimos 6 meses</h3>
          <span className="panel-muted" style={{ fontSize: ".82rem" }}>recurrente vs. único</span>
        </div>
        <div className="revenue-chart">
          {revenue.chart.map((m) => (
            <div key={`${m.label}-${m.year}`} className="revenue-chart-col">
              <div className="revenue-chart-bars" style={{ height: 130 }}>
                <div
                  className="revenue-bar one-time"
                  style={{ height: `${Math.max(4, (m.oneTime / maxChart) * 100)}%` }}
                  title={formatMxn(m.oneTime)}
                />
                <div
                  className="revenue-bar recurring"
                  style={{ height: `${Math.max(4, (m.recurring / maxChart) * 100)}%` }}
                  title={formatMxn(m.recurring)}
                />
              </div>
              <span className="revenue-chart-label">{m.label}</span>
            </div>
          ))}
        </div>
        <div className="revenue-legend">
          <span><i className="dot recurring" /> Recurrente</span>
          <span><i className="dot one-time" /> Único</span>
        </div>
      </div>

      <div className="panel">
        <h3 style={{ fontFamily: "var(--display)", marginBottom: "1rem" }}>Pagos recientes</h3>
        {recentPayments.length === 0 ? (
          <p className="empty">Aún no hay pagos registrados. Se guardan automáticamente al completar un checkout de Stripe.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Familia</th>
                  <th>Concepto</th>
                  <th>Monto</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.paidAt).toLocaleDateString("es-MX")}</td>
                    <td>{p.userId?.name || "—"}</td>
                    <td>{p.description || p.packageId}</td>
                    <td><b style={{ color: "var(--sage-deep)" }}>{formatMxn(p.amount)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
