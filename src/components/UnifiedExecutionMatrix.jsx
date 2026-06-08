import { useState, useMemo, useCallback } from "react";
import {
  Activity, Shield, AlertTriangle, CheckCircle, X, ChevronRight,
  Target, TrendingUp, ArrowUpDown, Layers, GitBranch, Crosshair,
  Radio, Gauge, FileCode2, Ban, Coins, Zap, Search,
  RefreshCw, Wallet, Unlink, ExternalLink, BarChart3
} from "lucide-react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });

function normalizeTicker(t) {
  return String(t || "").trim().toUpperCase();
}

function isoNow() {
  return new Date().toISOString();
}

const DIRECTIVES = [
  {
    key: "defi",
    label: "DeFi / Futures / Lending",
    icon: Coins,
    desc: "Aportar liquidez, abrir futuros, prestar/colateralizar en protocolos DeFi",
    color: "text-mikoko-cyan",
    borderColor: "border-mikoko-cyan/40",
    bgColor: "bg-mikoko-cyan/10",
    hoverBg: "hover:bg-mikoko-cyan/20"
  },
  {
    key: "exit_rebalance",
    label: "Exit Plan / Rebalance",
    icon: TrendingUp,
    desc: "Vender posiciones o rebalancear entre niveles de riesgo según la Constitución BD4",
    color: "text-mikoko-gold",
    borderColor: "border-mikoko-gold/40",
    bgColor: "bg-mikoko-gold/10",
    hoverBg: "hover:bg-mikoko-gold/20"
  }
];

const PROTOCOL_OPTIONS = [
  "Uniswap", "Curve", "Aave", "Compound", "MakerDAO",
  "Lido", "Rocket Pool", "GMX", "dYdX", "Morpho",
  "Balancer", "PancakeSwap", "Trader Joe", "Quickswap", "Otro"
];

const NETWORK_OPTIONS = [
  "Ethereum", "Arbitrum", "Optimism", "Base", "Polygon",
  "Solana", "Avalanche", "BNB Chain", "Fantom", "Celestia"
];

function formatDate(v) {
  if (!v) return "";
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toLocaleDateString() : "";
}

export default function UnifiedExecutionMatrix() {
  const {
    dbs, checksum, executeDeFiTransaction, addTransaction, isSimulation,
    getConstitutionRules, updateConstitution, simulateExitImpact
  } = useMikokoContext();

  const [directive, setDirective] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [breach, setBreach] = useState(null);

  const assets = useMemo(() => dbs?.bd3?.records || [], [dbs]);
  const positions = useMemo(() => dbs?.bd12?.records || [], [dbs]);
  const strategies = useMemo(() => dbs?.bd5?.records || [], [dbs]);
  const lots = useMemo(() => {
    const records = dbs?.bd1?.records || [];
    return records.filter((r) => r.status === "ACTIVE" && Number(r.currentQuantity) > 0);
  }, [dbs]);
  const constitution = useMemo(() => getConstitutionRules(), [dbs, getConstitutionRules]);

  const totalPortfolio = checksum?.metrics?.totalGlobalUSD || 0;
  const capitalByTier = checksum?.metrics?.capitalByTier || {};
  const tier34Pct = totalPortfolio > 0
    ? ((capitalByTier.TIER_3 || 0) + (capitalByTier.TIER_4 || 0)) / totalPortfolio
    : 0;

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-mikoko-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Crosshair className="h-6 w-6 text-mikoko-crimson" /> Mission Deployment Matrix
          </h1>
          <p className="mt-1 text-sm text-mikoko-muted">
            Matriz de ejecución táctica sobre BD1, BD2, BD4, BD5, BD11, BD12.
          </p>
        </div>

        <div className="grid gap-3">
          {DIRECTIVES.map((dir) => {
            const Icon = dir.icon;
            const active = directive === dir.key;
            return (
              <button
                key={dir.key}
                onClick={() => { setDirective(dir.key); setResult(null); setBreach(null); }}
                className={`flex items-start gap-4 rounded-lg border p-5 text-left transition ${
                  active
                    ? `${dir.borderColor} ${dir.bgColor}`
                    : "border-mikoko-line bg-mikoko-panel/95 hover:border-cyan-500/20"
                }`}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${dir.borderColor} ${dir.bgColor}`}>
                  <Icon className={`h-6 w-6 ${dir.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-base font-semibold ${active ? dir.color : "text-white"}`}>
                    {dir.label}
                  </p>
                  <p className="mt-1 text-sm text-mikoko-muted">{dir.desc}</p>
                </div>
                <div className={`shrink-0 rounded-full border p-1.5 ${active ? dir.borderColor : "border-mikoko-line"}`}>
                  <ChevronRight className={`h-4 w-4 ${active ? dir.color : "text-mikoko-muted"}`} />
                </div>
              </button>
            );
          })}
        </div>

        {directive === "defi" && (
          <DeFiForm
            assets={assets}
            lots={lots}
            strategies={strategies}
            positions={positions}
            constitution={constitution}
            isSimulation={isSimulation}
            submitting={submitting}
            setSubmitting={setSubmitting}
            executeDeFiTransaction={executeDeFiTransaction}
            setResult={setResult}
            totalPortfolio={totalPortfolio}
            capitalByTier={capitalByTier}
            tier34Pct={tier34Pct}
          />
        )}

        {directive === "exit_rebalance" && (
          <ExitRebalanceForm
            assets={assets}
            lots={lots}
            constitution={constitution}
            isSimulation={isSimulation}
            submitting={submitting}
            setSubmitting={setSubmitting}
            addTransaction={addTransaction}
            setResult={setResult}
            breach={breach}
            setBreach={setBreach}
            totalPortfolio={totalPortfolio}
            capitalByTier={capitalByTier}
            tier34Pct={tier34Pct}
            updateConstitution={updateConstitution}
            simulateExitImpact={simulateExitImpact}
          />
        )}

        {result && (
          <div className={`rounded-lg border p-4 text-sm ${
            result.success
              ? "border-mikoko-emerald/40 bg-mikoko-emerald/10 text-mikoko-emerald"
              : "border-mikoko-crimson/40 bg-mikoko-crimson/10 text-mikoko-crimson"
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <div>
                <p className="font-semibold">{result.success ? "Operación desplegada" : "Error en despliegue"}</p>
                <p className="mt-1 text-xs opacity-80">{result.message}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-mikoko-muted">Capital Total</p>
            <p className="mt-2 text-lg font-semibold text-white">{money.format(totalPortfolio)}</p>
          </div>
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-mikoko-muted">Tier 3+4 Proporción</p>
            <p className={`mt-2 text-lg font-semibold ${tier34Pct > 0.3 ? "text-mikoko-crimson" : "text-mikoko-emerald"}`}>
              {(tier34Pct * 100).toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-mikoko-muted">Posiciones Activas BD12</p>
            <p className="mt-2 text-lg font-semibold text-white">{positions.length}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function DeFiForm({
  assets, lots, positions, isSimulation, submitting, setSubmitting,
  executeDeFiTransaction, setResult, constitution, totalPortfolio,
  capitalByTier, tier34Pct
}) {
  const [form, setForm] = useState({
    assetName: "",
    strategyTicker: "",
    protocolo: "Uniswap",
    tipoOperacion: "LP_POOL",
    red: "Ethereum",
    direccionContrato: "",
    colateralTicker: "ETH",
    apalancamiento: 1,
    lpAmount: "",
    colateralUSD: "",
    deudaUSD: "",
    healthFactor: 5,
    riesgoContraparte: 2
  });

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmitDeFi = useCallback(async () => {
    setSubmitting(true);
    setResult(null);
    try {
      await executeDeFiTransaction({
        ...form,
        lpAmount: form.lpAmount || "0",
        colateralUSD: form.colateralUSD ? Number(form.colateralUSD) : 0,
        deudaUSD: form.deudaUSD ? Number(form.deudaUSD) : 0,
        healthFactor: Number(form.healthFactor) || 1
      });
      setResult({ success: true, message: `Estrategia ${form.assetName || form.strategyTicker} desplegada en ${form.protocolo}. Hash escrito en BD2, contraparte en BD11, posicion monitoreada en BD12.` });
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }, [form, executeDeFiTransaction]);

  const ops = ["LP_POOL", "LENDING", "FUTURES", "STAKING", "VAULT"];

  return (
    <div className="rounded-lg border border-mikoko-cyan/30 bg-mikoko-panel/95 p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-mikoko-cyan/40 bg-mikoko-cyan/10 text-mikoko-cyan">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Directiva DeFi / Futures / Lending</h2>
          <p className="text-xs text-mikoko-muted">Colateral, apalancamiento y contrato → BD2, BD1, BD11, BD12</p>
        </div>
      </div>

      {tier34Pct > 0.3 && (
        <div className="mb-4 rounded-lg border border-mikoko-amber/40 bg-mikoko-amber/10 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-mikoko-amber">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-semibold">AVISO:</span> Tier 3+4 actualmente en {(tier34Pct * 100).toFixed(1)}%. Esta operación podría incrementar la exposición a alto riesgo.
          </div>
        </div>
      )}

      {constitution && (
        <div className="mb-4 rounded-lg border border-mikoko-line bg-mikoko-panel2 px-4 py-2">
          <div className="flex items-center gap-2 text-[10px] text-mikoko-muted">
            <Shield className="h-3 w-3 text-mikoko-cyan" />
            Constitución BD4: Hard Cap Alto Riesgo {(constitution.hardCapHighRisk * 100).toFixed(0)}% · Rebalance Threshold {(constitution.rebalanceThreshold * 100).toFixed(0)}%
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Nombre Estrategia">
          <input value={form.assetName} onChange={(e) => handleChange("assetName", e.target.value)} className="field" placeholder="ETH-USDC LP" />
        </Field>
        <Field label="Ticker del Pool / Activo">
          <input required value={form.strategyTicker} onChange={(e) => handleChange("strategyTicker", normalizeTicker(e.target.value))} className="field" placeholder="ETHUSDC" />
        </Field>
        <Field label="Protocolo">
          <select value={form.protocolo} onChange={(e) => handleChange("protocolo", e.target.value)} className="field">
            {PROTOCOL_OPTIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Tipo de Operación">
          <select value={form.tipoOperacion} onChange={(e) => handleChange("tipoOperacion", e.target.value)} className="field">
            {ops.map((o) => <option key={o}>{o}</option>)}
          </select>
        </Field>
        <Field label="Red">
          <select value={form.red} onChange={(e) => handleChange("red", e.target.value)} className="field">
            {NETWORK_OPTIONS.map((n) => <option key={n}>{n}</option>)}
          </select>
        </Field>
        <Field label="Dirección del Contrato">
          <input value={form.direccionContrato} onChange={(e) => handleChange("direccionContrato", e.target.value)} className="field font-mono" placeholder="0x..." />
        </Field>
        <Field label="Colateral (Ticker)">
          <select value={form.colateralTicker} onChange={(e) => handleChange("colateralTicker", e.target.value)} className="field">
            {assets.length > 0 ? assets.map((a) => <option key={a.ticker}>{a.ticker}</option>) : <option>ETH</option>}
          </select>
        </Field>
        <Field label="Apalancamiento (1-10x)">
          <input type="number" min="1" max="10" value={form.apalancamiento} onChange={(e) => handleChange("apalancamiento", Math.min(10, Math.max(1, Number(e.target.value))))} className="field" />
        </Field>
        <Field label="Cantidad LP / Entrada">
          <input type="number" min="0" step="any" value={form.lpAmount} onChange={(e) => handleChange("lpAmount", e.target.value)} className="field" placeholder="1000" />
        </Field>
        <Field label="Colateral USD">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mikoko-muted">$</span>
            <input type="number" min="0" value={form.colateralUSD} onChange={(e) => handleChange("colateralUSD", e.target.value)} className="field pl-6" placeholder="5000" />
          </div>
        </Field>
        <Field label="Deuda USD">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mikoko-muted">$</span>
            <input type="number" min="0" value={form.deudaUSD} onChange={(e) => handleChange("deudaUSD", e.target.value)} className="field pl-6" placeholder="2500" />
          </div>
        </Field>
        <Field label="Health Factor Inicial">
          <input type="number" min="0" step="0.1" value={form.healthFactor} onChange={(e) => handleChange("healthFactor", e.target.value)} className="field" placeholder="1.5" />
        </Field>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-mikoko-muted">Riesgo Contraparte (1-5)</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => handleChange("riesgoContraparte", n)}
                className={`flex h-8 w-8 items-center justify-center rounded text-xs font-bold transition ${
                  form.riesgoContraparte >= n
                    ? "bg-mikoko-crimson/20 text-mikoko-crimson border border-mikoko-crimson/40"
                    : "bg-mikoko-panel2 text-mikoko-muted border border-mikoko-line"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleSubmitDeFi}
          disabled={submitting || !form.strategyTicker}
          className="inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-mikoko-cyan/50 bg-mikoko-cyan/15 px-8 text-sm font-bold text-mikoko-cyan transition hover:border-mikoko-cyan hover:bg-mikoko-cyan/25 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Desplegando...</>
          ) : (
            <><Zap className="h-5 w-5" /> {isSimulation ? "[SIM] Simular DeFi" : "Desplegar Estrategia"}</>
          )}
        </button>
      </div>
    </div>
  );
}

function ExitRebalanceForm({
  assets, lots, constitution, isSimulation, submitting, setSubmitting,
  addTransaction, setResult, breach, setBreach, totalPortfolio,
  capitalByTier, tier34Pct, updateConstitution, simulateExitImpact
}) {
  const [mode, setMode] = useState("exit");
  const [form, setForm] = useState({
    ticker: "",
    type: "SELL",
    quantity: "",
    price: "",
    assetName: "",
    timestamp: isoNow().slice(0, 16)
  });
  const [simulation, setSimulation] = useState(null);

  const selectedLot = useMemo(() => {
    if (!form.ticker) return null;
    return lots.find((l) => normalizeTicker(l.ticker) === normalizeTicker(form.ticker));
  }, [lots, form.ticker]);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "ticker" || field === "quantity" || field === "price") {
      setBreach(null);
      setSimulation(null);
    }
  }, [setBreach]);

  const handleCheckBreach = useCallback(() => {
    if (!form.ticker || !form.quantity || !form.price) return;
    const impact = simulateExitImpact(form.ticker, form.quantity, form.price);
    setSimulation(impact);

    if (!impact || impact.total <= 0) return;

    const newHighRiskPct = impact.highRiskPct;
    const hardCap = constitution?.hardCapHighRisk || 0.3;
    const willBreach = newHighRiskPct > hardCap;
    setBreach(willBreach ? {
      active: true,
      currentPct: tier34Pct,
      newPct: newHighRiskPct,
      cap: hardCap,
      message: `CONSTITUTION BREACH: Tier 3+4 pasarían de ${(tier34Pct * 100).toFixed(1)}% a ${(newHighRiskPct * 100).toFixed(1)}%, excediendo el límite constitucional de ${(hardCap * 100).toFixed(0)}%.`
    } : null);
  }, [form, simulateExitImpact, constitution, tier34Pct]);

  const handleSubmitExit = useCallback(async () => {
    setSubmitting(true);
    setResult(null);
    try {
      await addTransaction({
        ...form,
        ticker: normalizeTicker(form.ticker),
        type: form.type,
        timestamp: new Date(form.timestamp).toISOString()
      });
      setResult({ success: true, message: `Orden de ${mode === "exit" ? "salida" : "rebalanceo"} ejecutada. Transacción inmutable en BD2.` });
      setBreach(null);
      setSimulation(null);
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  }, [form, addTransaction, mode, setBreach]);

  const availableTickers = useMemo(() => {
    const fromLots = lots.map((l) => l.ticker);
    const fromAssets = assets.filter((a) => !fromLots.includes(a.ticker)).map((a) => a.ticker);
    return { fromLots, fromAssets };
  }, [lots, assets]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-mikoko-gold/30 bg-mikoko-panel/95 p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-mikoko-gold/40 bg-mikoko-gold/10 text-mikoko-gold">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Directiva Exit Plan / Rebalance</h2>
            <p className="text-xs text-mikoko-muted">Cruzando reglas BD4 — ejecución sobre BD1, BD2</p>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setMode("exit")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
              mode === "exit"
                ? "border-mikoko-crimson/40 bg-mikoko-crimson/10 text-mikoko-crimson"
                : "border-mikoko-line text-mikoko-muted hover:text-white"
            }`}
          >
            <ArrowUpDown className="h-3.5 w-3.5" /> Exit Position
          </button>
          <button
            onClick={() => setMode("rebalance")}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
              mode === "rebalance"
                ? "border-mikoko-gold/40 bg-mikoko-gold/10 text-mikoko-gold"
                : "border-mikoko-line text-mikoko-muted hover:text-white"
            }`}
          >
            <Layers className="h-3.5 w-3.5" /> Rebalance Portfolio
          </button>
        </div>

        {constitution && (
          <div className="mb-4 rounded-lg border border-mikoko-line bg-mikoko-panel2 p-4">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mikoko-gold">
              <Shield className="h-3.5 w-3.5" /> Reglas Constitucionales BD4
            </h3>
            <div className="grid gap-2 text-xs sm:grid-cols-3">
              <div className="rounded border border-mikoko-line bg-mikoko-void px-3 py-2">
                <span className="text-mikoko-muted">Target T1:</span>{" "}
                <span className="text-white">{((constitution.targetAllocation?.TIER_1 || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="rounded border border-mikoko-line bg-mikoko-void px-3 py-2">
                <span className="text-mikoko-muted">Target T2:</span>{" "}
                <span className="text-white">{((constitution.targetAllocation?.TIER_2 || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="rounded border border-mikoko-line bg-mikoko-void px-3 py-2">
                <span className="text-mikoko-muted">Target T3:</span>{" "}
                <span className="text-white">{((constitution.targetAllocation?.TIER_3 || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="rounded border border-mikoko-line bg-mikoko-void px-3 py-2">
                <span className="text-mikoko-muted">Target T4:</span>{" "}
                <span className="text-white">{((constitution.targetAllocation?.TIER_4 || 0) * 100).toFixed(0)}%</span>
              </div>
              <div className="rounded border border-mikoko-line bg-mikoko-void px-3 py-2">
                <span className="text-mikoko-muted">Hard Cap High Risk:</span>{" "}
                <span className="text-white">{(constitution.hardCapHighRisk * 100).toFixed(0)}%</span>
              </div>
              <div className="rounded border border-mikoko-line bg-mikoko-void px-3 py-2">
                <span className="text-mikoko-muted">Rebalance Threshold:</span>{" "}
                <span className="text-white">{(constitution.rebalanceThreshold * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Activo a vender">
            <select
              value={form.ticker}
              onChange={(e) => handleChange("ticker", e.target.value)}
              className="field"
            >
              <option value="">Seleccionar activo</option>
              <optgroup label="— Con posición activa BD1 —">
                {availableTickers.fromLots.map((t) => <option key={t}>{t}</option>)}
              </optgroup>
              <optgroup label="— Sin posición —">
                {availableTickers.fromAssets.map((t) => <option key={t}>{t}</option>)}
              </optgroup>
            </select>
          </Field>
          <Field label="Tipo de orden">
            <select value={form.type} onChange={(e) => handleChange("type", e.target.value)} className="field">
              <option value="SELL">Venta (SELL)</option>
              <option value="TRANSFER">Transferencia (TRANSFER)</option>
            </select>
          </Field>
          <Field label="Cantidad">
            <input required type="number" min="0" step="any" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} className="field" placeholder="0.5" />
          </Field>
          <Field label="Precio unitario USD">
            <input required type="number" min="0" step="any" value={form.price} onChange={(e) => handleChange("price", e.target.value)} className="field" placeholder="3500" />
          </Field>
          <Field label="Nombre (opcional)">
            <input value={form.assetName} onChange={(e) => handleChange("assetName", e.target.value)} className="field" placeholder={form.ticker || ""} />
          </Field>
          <Field label="Fecha y Hora">
            <input type="datetime-local" value={form.timestamp} onChange={(e) => handleChange("timestamp", e.target.value)} className="field" />
          </Field>
        </div>

        {selectedLot && (
          <div className="mt-4 rounded-lg border border-mikoko-line bg-mikoko-panel2 p-3">
            <div className="flex items-center gap-2 text-xs text-mikoko-muted">
              <Wallet className="h-3.5 w-3.5" />
              Lote: <span className="font-mono text-white">{numberFmt.format(selectedLot.currentQuantity)} {selectedLot.ticker}</span>
              <span className="mx-1">·</span>
              Valor: <span className="font-mono text-white">{money.format(selectedLot.currentValueUSD)}</span>
              <span className="mx-1">·</span>
              Entry avg: <span className="font-mono text-white">{money.format(selectedLot.averageEntryUSD)}</span>
            </div>
          </div>
        )}

        <div className="mt-5 flex items-center gap-4">
          <button
            onClick={handleCheckBreach}
            disabled={!form.ticker || !form.quantity || !form.price}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-mikoko-amber/40 bg-mikoko-amber/10 px-5 text-xs font-semibold text-mikoko-amber transition hover:bg-mikoko-amber/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Search className="h-4 w-4" /> Verificar Impacto Constitucional
          </button>
          <button
            onClick={handleSubmitExit}
            disabled={submitting || !form.ticker || !form.quantity || !form.price || breach?.active}
            className={`inline-flex min-h-12 flex-1 items-center justify-center gap-2.5 rounded-xl border px-8 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              breach?.active
                ? "border-mikoko-crimson/50 bg-mikoko-crimson/15 text-mikoko-crimson"
                : "border-mikoko-emerald/50 bg-mikoko-emerald/15 text-mikoko-emerald hover:border-mikoko-emerald hover:bg-mikoko-emerald/25"
            }`}
          >
            {breach?.active ? (
              <><Ban className="h-5 w-5" /> BLOQUEADO POR CONSTITUCIÓN</>
            ) : submitting ? (
              <><RefreshCw className="h-4 w-4 animate-spin" /> Ejecutando...</>
            ) : (
              <><Zap className="h-5 w-5" /> {isSimulation ? "[SIM] Simular" : "Ejecutar Orden"} → BD2 Immutable</>
            )}
          </button>
        </div>
      </div>

      {simulation && (
        <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mikoko-cyan">
            <BarChart3 className="h-3.5 w-3.5" /> Simulación de Impacto Post-Exit
          </h3>
          <div className="grid gap-3 sm:grid-cols-4">
            {["TIER_1", "TIER_2", "TIER_3", "TIER_4"].map((tier) => (
              <div key={tier} className="rounded border border-mikoko-line bg-mikoko-panel2 px-3 py-2 text-center">
                <p className="text-[9px] uppercase tracking-wider text-mikoko-muted">{tier}</p>
                <p className="mt-1 text-xs font-mono text-white">{money.format(simulation.capitalByTier[tier] || 0)}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="text-mikoko-muted">Nuevo total:</span>
            <span className="font-mono text-white">{money.format(simulation.total)}</span>
            <span className="text-mikoko-muted">·</span>
            <span className="text-mikoko-muted">Tier 3+4:</span>
            <span className={`font-mono ${simulation.highRiskPct > 0.3 ? "text-mikoko-crimson" : "text-mikoko-emerald"}`}>
              {(simulation.highRiskPct * 100).toFixed(1)}%
            </span>
            {simulation.highRiskPct > 0.3 && (
              <span className="inline-flex items-center gap-1 rounded bg-mikoko-crimson/15 px-2 py-0.5 text-[10px] font-bold text-mikoko-crimson">
                <AlertTriangle className="h-3 w-3" /> EXCEDE HARD CAP
              </span>
            )}
          </div>
        </div>
      )}

      {breach?.active && (
        <div className="rounded-lg border-2 border-mikoko-crimson bg-mikoko-crimson/10 p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-mikoko-crimson bg-mikoko-crimson/20">
              <Ban className="h-6 w-6 text-mikoko-crimson" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-mikoko-crimson">⚠ CONSTITUTION BREACH</h3>
              <p className="mt-2 text-sm leading-6 text-mikoko-crimson/90">{breach.message}</p>
              <div className="mt-4 flex gap-3">
                <div className="rounded-lg border border-mikoko-crimson/30 bg-mikoko-void px-4 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-mikoko-muted">Actual Tier 3+4</p>
                  <p className="text-lg font-bold text-white">{(breach.currentPct * 100).toFixed(1)}%</p>
                </div>
                <div className="rounded-lg border border-mikoko-crimson/30 bg-mikoko-void px-4 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-mikoko-muted">Post-Exit Tier 3+4</p>
                  <p className="text-lg font-bold text-mikoko-crimson">{(breach.newPct * 100).toFixed(1)}%</p>
                </div>
                <div className="rounded-lg border border-mikoko-crimson/30 bg-mikoko-void px-4 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-mikoko-muted">Límite Constitucional</p>
                  <p className="text-lg font-bold text-mikoko-amber">{(breach.cap * 100).toFixed(0)}%</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-mikoko-muted">
                La operación está bloqueada. Reduce la cantidad o ajusta los parámetros de la Constitución BD4 antes de continuar.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-mikoko-muted">{label}</span>
      {children}
    </label>
  );
}
