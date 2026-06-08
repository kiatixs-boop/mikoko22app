import { useState, useMemo } from "react";
import { BarChart3, Target, SlidersHorizontal, TrendingUp, ArrowUpDown } from "lucide-react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const pct = (v) => `${(v * 100).toFixed(1)}%`;

const TIERS = [
  { key: "TIER_1", label: "Reserva Nivel 1", color: "text-mikoko-emerald", bar: "bg-mikoko-emerald", targetMin: 0.3, targetMax: 0.5, desc: "Stablecoins, efectivo, valor refugio" },
  { key: "TIER_2", label: "Rendimiento Nivel 2", color: "text-mikoko-cyan", bar: "bg-mikoko-cyan", targetMin: 0.2, targetMax: 0.3, desc: "Staking, LPs, yield farming" },
  { key: "TIER_3", label: "Alpha Nivel 3", color: "text-mikoko-gold", bar: "bg-mikoko-gold", targetMin: 0.1, targetMax: 0.25, desc: "BTC, ETH, large caps" },
  { key: "TIER_4", label: "Especulación Nivel 4", color: "text-mikoko-crimson", bar: "bg-mikoko-crimson", targetMin: 0.05, targetMax: 0.15, desc: "Small caps, alts, NFTs" }
];

export default function AnalysisView() {
  const { checksum } = useMikokoContext();
  const targets = useMemo(() => ({}), []);

  const total = checksum?.metrics?.totalGlobalUSD || 0;
  const capitalByTier = checksum?.metrics?.capitalByTier || {};

  const currentAlloc = useMemo(() => {
    return TIERS.map((t) => ({
      ...t,
      value: Number(capitalByTier[t.key] || 0),
      pct: total > 0 ? Number(capitalByTier[t.key] || 0) / total : 0
    }));
  }, [capitalByTier, total]);

  const [targetPcts, setTargetPcts] = useState({ TIER_1: 0.4, TIER_2: 0.25, TIER_3: 0.2, TIER_4: 0.1 });

  const rebalancePlan = useMemo(() => {
    if (total <= 0) return null;
    const plan = TIERS.map((t) => {
      const targetPct = targetPcts[t.key] || 0;
      const currentValue = Number(capitalByTier[t.key] || 0);
      const targetValue = total * targetPct;
      const diff = targetValue - currentValue;
      return { ...t, currentValue, targetValue, diff };
    });
    return plan;
  }, [capitalByTier, total, targetPcts]);

  function handleSlider(key, value) {
    const num = Number(value) / 100;
    setTargetPcts((prev) => {
      const next = { ...prev, [key]: num };
      const sum = Object.values(next).reduce((a, b) => a + b, 0);
      if (sum > 0.99) {
        const adjusted = { ...next };
        const keys = Object.keys(adjusted);
        for (const k of keys) {
          if (k !== key) {
            adjusted[k] = Math.max(0.01, adjusted[k] - (sum - 1) * 0.5);
          }
        }
        return adjusted;
      }
      return next;
    });
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-mikoko-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-mikoko-text">Estación de Análisis</h1>
          <p className="mt-1 text-sm text-mikoko-muted">Asignación por niveles de riesgo y calculadora de rebalanceo.</p>
        </div>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-mikoko-text">
              <BarChart3 className="h-5 w-5 text-mikoko-cyan" /> Asignación Actual
            </h2>
            <p className="mt-1 text-sm text-mikoko-muted">Capital total: {money.format(total)}</p>
            <div className="mt-6 space-y-5">
              {currentAlloc.map((t) => (
                <div key={t.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className={`font-medium ${t.color}`}>{t.label}</span>
                    <span className="text-mikoko-muted">{money.format(t.value)} · {(t.pct * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-mikoko-line">
                    <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${Math.min(100, t.pct * 100)}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-mikoko-muted">{t.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-mikoko-text">
              <Target className="h-5 w-5 text-mikoko-gold" /> Calculadora de Rebalanceo
            </h2>
            <p className="mt-1 text-sm text-mikoko-muted">Ajusta los porcentajes objetivo por nivel.</p>
            <div className="mt-6 space-y-6">
              {TIERS.map((t) => (
                <div key={t.key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className={t.color}>{t.label}</span>
                    <span className="text-mikoko-muted">{(targetPcts[t.key] * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="80"
                    value={Math.round((targetPcts[t.key] || 0) * 100)}
                    onChange={(e) => handleSlider(t.key, e.target.value)}
                    className="w-full cursor-pointer accent-[#C47B3B]"
                  />
                </div>
              ))}
            </div>

            {rebalancePlan && (
              <div className="mt-6 rounded-lg border border-mikoko-line bg-mikoko-panel2 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mikoko-cyan">
                  <TrendingUp className="h-4 w-4" /> Plan de Acción
                </h3>
                <div className="space-y-2 text-xs">
                  {rebalancePlan.map((item) => {
                    const needBuy = item.diff > 0;
                    return (
                      <div key={item.key} className="flex items-center justify-between rounded border border-mikoko-line bg-mikoko-panel2 px-3 py-2">
                        <span className={item.color}>{item.label}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-mikoko-muted">{money.format(item.currentValue)}</span>
                          <ArrowUpDown className={`h-3 w-3 ${needBuy ? "text-mikoko-emerald" : "text-mikoko-crimson"}`} />
                          <span className={needBuy ? "text-mikoko-emerald" : "text-mikoko-crimson"}>
                            {needBuy ? "+" : ""}{money.format(item.diff)}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-mikoko-muted">Rebalanceo estimado. Ejecutar WF-010 para aplicar cambios.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
