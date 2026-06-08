import { Activity, AlertTriangle, Database, RefreshCw, ShieldCheck, UserCheck, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });

function datetimeLocalNow() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function formatMoney(value) { return money.format(Number(value || 0)); }
function formatDate(value) {
  if (!value) return "Nunca";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Fecha inválida";
  return date.toLocaleString();
}
function classForVerdict(v) {
  if (v === "AUTHORIZED") return "border-mikoko-emerald/40 text-mikoko-emerald shadow-panel";
  if (v === "CAUTION") return "border-mikoko-amber/40 text-mikoko-amber shadow-panel";
  return "border-mikoko-crimson/40 text-mikoko-crimson shadow-panel";
}
function statusDot(v) {
  if (v === "AUTHORIZED") return "bg-mikoko-emerald shadow-bevel-light";
  if (v === "CAUTION") return "bg-mikoko-amber shadow-bevel-light";
  return "bg-mikoko-crimson shadow-bevel-light";
}

export default function DashboardView() {
  const { checksum, assets, loading, error, notice, addTransaction, refreshMarketPrices, storagePath, isSimulation } = useMikokoContext();
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ assetName: "", ticker: "", type: "BUY", quantity: "", price: "", timestamp: datetimeLocalNow() });

  const metrics = checksum?.metrics;
  const allocation = useMemo(() => {
    const tiers = metrics?.capitalByTier || {};
    const total = metrics?.totalGlobalUSD || 0;
    return ["TIER_1", "TIER_2", "TIER_3", "TIER_4"].map((tier) => {
      const value = Number(tiers[tier] || 0);
      return { tier, value, pct: total > 0 ? (value / total) * 100 : 0 };
    });
  }, [metrics]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await addTransaction({ ...form, timestamp: new Date(form.timestamp).toISOString() });
      setForm({ assetName: "", ticker: "", type: "BUY", quantity: "", price: "", timestamp: datetimeLocalNow() });
    } finally { setSubmitting(false); }
  }

  async function handleRefresh() {
    setRefreshing(true);
    try { await refreshMarketPrices(); } finally { setRefreshing(false); }
  }

  if (loading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="rounded-lg px-6 py-5 text-center shadow-panel bg-mikoko-panel">
            <Activity className="mx-auto mb-3 h-7 w-7 animate-pulse text-mikoko-cyan" />
            <p className="text-sm uppercase tracking-[0.2em] text-mikoko-muted">Cargando bases de datos locales</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-lg px-4 py-4 shadow-panel bg-mikoko-panel">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-mikoko-cyan font-semibold">MIKOKO v27.0</p>
              <h1 className="mt-1 text-2xl font-semibold text-mikoko-text sm:text-3xl">Panel de Cartera Soberana</h1>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <StatusPill icon={<ShieldCheck className="h-4 w-4" />} label="Checksum" value={checksum?.verdict || "DESCONOCIDO"} className={classForVerdict(checksum?.verdict)} />
              <StatusPill icon={<UserCheck className="h-4 w-4" />} label="Modo" value={isSimulation ? "SIMULACIÓN" : "Usuario Único"} className={isSimulation ? "border-mikoko-gold/40 text-mikoko-gold shadow-panel" : "border-mikoko-cyan/40 text-mikoko-cyan shadow-panel"} />
              <StatusPill icon={<Database className="h-4 w-4" />} label="Almacenamiento" value={storagePath} className="border-mikoko-emerald/40 text-mikoko-emerald shadow-panel" />
              <button type="button" onClick={handleRefresh} disabled={refreshing || assets.length === 0} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-mikoko-gold/40 px-4 py-3 text-sm font-semibold text-mikoko-gold transition shadow-button hover:bg-mikoko-gold/10 disabled:cursor-not-allowed disabled:opacity-50">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Actualizar Precios
              </button>
            </div>
          </div>
        </header>

        {(error || notice) && (
          <section className={`rounded-lg border p-4 text-sm shadow-panel ${error ? "border-mikoko-crimson/40 text-mikoko-crimson" : "border-mikoko-emerald/40 text-mikoko-emerald"} ${error ? "bg-mikoko-crimson/[0.04]" : "bg-mikoko-emerald/[0.04]"}`}>
            {error || notice}
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-4">
          <MetricCard label="Patrimonio Neto" value={formatMoney(metrics?.totalGlobalUSD)} accent="emerald" />
          <MetricCard label="Cambio Cartera 24h" value="Snapshot pendiente" accent="cyan" />
          <MetricCard label="Polvo Seco" value={formatMoney(metrics?.dryPowderUSD)} sub={`${(metrics?.liquidityPct || 0).toFixed(1)}% liquidez`} accent="gold" />
          <MetricCard label="Precios Obsoletos" value={String(metrics?.stalePriceAssets?.length || 0)} sub="Activos bloqueando EJE-2" accent="crimson" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-lg p-5 shadow-panel bg-mikoko-panel">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-mikoko-text">Integridad del Sistema</h2>
                <p className="mt-1 text-sm text-mikoko-muted">{checksum?.summary}</p>
              </div>
              <span className={`h-3 w-3 rounded-full ${statusDot(checksum?.verdict)}`} />
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(checksum?.axisResults || {}).map(([key, axis]) => (
                <div key={key} className="rounded-lg p-4 shadow-bevel-light bg-mikoko-panel2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-mikoko-muted font-semibold">{axis.code}</p>
                      <p className="mt-2 text-sm font-medium text-mikoko-text">{axis.label}</p>
                    </div>
                    <AxisLight light={axis.light} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-mikoko-muted">{axis.action}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg p-5 shadow-panel bg-mikoko-panel">
            <h2 className="text-lg font-semibold text-mikoko-text">Distribución de Asignación</h2>
            <p className="mt-1 text-sm text-mikoko-muted">Resumen BD1 por nivel de riesgo final.</p>
            <div className="mt-5 space-y-4">
              {allocation.map((item) => (
                <div key={item.tier}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-mikoko-text">{tierLabel(item.tier)}</span>
                    <span className="text-mikoko-muted">{formatMoney(item.value)} · {item.pct.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full shadow-bevel-light bg-mikoko-line/50">
                    <div className={`h-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] ${barClass(item.tier)}`} style={{ width: `${Math.min(100, item.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <form onSubmit={handleSubmit} className="rounded-lg p-5 shadow-panel bg-mikoko-panel">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-mikoko-gold/30 text-mikoko-gold shadow-panel-pressed bg-mikoko-gold/[0.06]">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-mikoko-text">Nueva Transacción</h2>
                <p className="text-sm text-mikoko-muted">Activos desconocidos se guardan como borradores y se bloquean de BD1.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre del activo">
                <input value={form.assetName} onChange={(e) => setForm({ ...form, assetName: e.target.value })} className="field" placeholder="Ethereum" />
              </Field>
              <Field label="Ticker">
                <input required value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value.toUpperCase() })} className="field" placeholder="ETH" />
              </Field>
              <Field label="Tipo">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="field">
                  <option value="BUY">Comprar</option>
                  <option value="SELL">Vender</option>
                  <option value="TRANSFER">Transferir</option>
                </select>
              </Field>
              <Field label="Cantidad">
                <input required type="number" min="0" step="any" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="field" placeholder="0.5" />
              </Field>
              <Field label="Precio unitario USD">
                <input required type="number" min="0" step="any" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="field" placeholder="3500" />
              </Field>
              <Field label="Fecha/Hora">
                <input required type="datetime-local" value={form.timestamp} onChange={(e) => setForm({ ...form, timestamp: e.target.value })} className="field" />
              </Field>
            </div>
            <button type="submit" disabled={submitting} className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-mikoko-emerald/50 px-4 py-3 text-sm font-semibold text-mikoko-emerald transition shadow-button hover:bg-mikoko-emerald/10 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Escribiendo Ledger Local..." : isSimulation ? "[SIM] Simular Transacción" : "Confirmar Transacción Local"}
            </button>
          </form>

          <div className="rounded-lg p-5 shadow-panel bg-mikoko-panel">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-mikoko-text">Tabla de Activos</h2>
                <p className="mt-1 text-sm text-mikoko-muted">Estado de pasaporte BD3 con resúmenes de cantidad BD1.</p>
              </div>
              {checksum?.verdict !== "AUTHORIZED" && (
                <div className="hidden items-center gap-2 rounded-lg border border-mikoko-crimson/30 px-3 py-2 text-xs font-medium text-mikoko-crimson shadow-panel sm:flex">
                  <AlertTriangle className="h-4 w-4" />
                  Operaciones bloqueadas
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-mikoko-line text-xs uppercase tracking-[0.18em] text-mikoko-muted">
                  <tr>
                    <th className="px-3 py-3">Activo</th>
                    <th className="px-3 py-3">Cantidad</th>
                    <th className="px-3 py-3">Precio</th>
                    <th className="px-3 py-3">Valor</th>
                    <th className="px-3 py-3">Actualización</th>
                    <th className="px-3 py-3">Tesis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mikoko-line/60">
                  {assets.length === 0 ? (
                    <tr><td colSpan="6" className="px-3 py-8 text-center text-mikoko-muted">No hay activos BD3 aún. La primera transacción creará un pasaporte borrador bajo Strict Block.</td></tr>
                  ) : (
                    assets.map((asset) => (
                      <tr key={asset.internalId} className="transition hover:bg-mikoko-panel2/50">
                        <td className="px-3 py-4">
                          <p className="font-semibold text-mikoko-text">{asset.ticker}</p>
                          <p className="mt-1 max-w-48 truncate text-xs text-mikoko-muted">{asset.nombre}</p>
                        </td>
                        <td className="px-3 py-4 text-mikoko-text">{numberFmt.format(asset.quantity || 0)}</td>
                        <td className="px-3 py-4 text-mikoko-text">{formatMoney(asset.precioUnitarioUSD)}</td>
                        <td className="px-3 py-4 text-mikoko-text">{formatMoney(asset.valueUSD)}</td>
                        <td className="px-3 py-4"><FreshnessBadge status={asset.priceStatus} date={asset.fechaSSTPrecio} /></td>
                        <td className="px-3 py-4"><span className={thesisBadge(asset.estadoTesis)}>{asset.estadoTesis}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatusPill({ icon, label, value, className }) {
  return (
    <div className={`min-h-12 rounded-lg border px-3 py-2 bg-mikoko-panel2/50 ${className}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-[0.68rem] uppercase tracking-[0.18em] opacity-80">{label}</span>
      </div>
      <p className="mt-1 max-w-48 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, sub, accent }) {
  const accents = { emerald: "border-mikoko-emerald/30 text-mikoko-emerald", crimson: "border-mikoko-crimson/30 text-mikoko-crimson", cyan: "border-mikoko-cyan/30 text-mikoko-cyan", gold: "border-mikoko-gold/30 text-mikoko-gold" };
  return (
    <div className={`rounded-lg border shadow-panel bg-mikoko-panel p-5 ${accents[accent]}`}>
      <p className="text-xs uppercase tracking-[0.2em] text-mikoko-muted">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-mikoko-text">{value}</p>
      {sub && <p className="mt-2 text-sm text-mikoko-muted">{sub}</p>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-mikoko-muted">{label}</span>
      {children}
    </label>
  );
}

function AxisLight({ light }) {
  const classes = { GREEN: "bg-mikoko-emerald shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]", YELLOW: "bg-mikoko-amber shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]", ORANGE: "bg-mikoko-gold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]", RED: "bg-mikoko-crimson shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]" };
  return <span className={`mt-1 h-3 w-3 shrink-0 rounded-full ${classes[light] || "bg-mikoko-muted"}`} />;
}

function tierLabel(tier) {
  return { TIER_1: "Reserva Nivel 1", TIER_2: "Rendimiento Nivel 2", TIER_3: "Alpha Nivel 3", TIER_4: "Especulación Nivel 4" }[tier];
}

function barClass(tier) {
  return { TIER_1: "bg-mikoko-emerald", TIER_2: "bg-mikoko-cyan", TIER_3: "bg-mikoko-gold", TIER_4: "bg-mikoko-crimson" }[tier];
}

function FreshnessBadge({ status, date }) {
  const stale = status.status === "OBSOLETO";
  return (
    <div>
      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold shadow-bevel-light ${stale ? "border-mikoko-crimson/40 bg-mikoko-crimson/10 text-mikoko-crimson" : "border-mikoko-emerald/40 bg-mikoko-emerald/10 text-mikoko-emerald"}`}>
        {status.status}
      </span>
      <p className="mt-1 text-xs text-mikoko-muted">{formatDate(date)}</p>
    </div>
  );
}

function thesisBadge(status) {
  if (status === "APROBADA") return "inline-flex rounded-full border border-mikoko-emerald/40 bg-mikoko-emerald/10 px-2.5 py-1 text-xs font-semibold text-mikoko-emerald shadow-bevel-light";
  if (status === "INVALIDADA") return "inline-flex rounded-full border border-mikoko-crimson/40 bg-mikoko-crimson/10 px-2.5 py-1 text-xs font-semibold text-mikoko-crimson shadow-bevel-light";
  return "inline-flex rounded-full border border-mikoko-amber/40 bg-mikoko-amber/10 px-2.5 py-1 text-xs font-semibold text-mikoko-amber shadow-bevel-light";
}
