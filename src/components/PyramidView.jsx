import { Triangle, TrendingUp, AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TIER_CONFIG = [
  { key: "TIER_1", label: "Reserva Nivel 1", color: "text-mikoko-emerald", border: "border-mikoko-emerald", bg: "bg-mikoko-emerald/10", bar: "bg-mikoko-emerald", desc: "Store of Value", w: "w-full" },
  { key: "TIER_2", label: "Rendimiento Nivel 2", color: "text-mikoko-cyan", border: "border-mikoko-cyan", bg: "bg-mikoko-cyan/10", bar: "bg-mikoko-cyan", desc: "Yield Generation", w: "w-4/5" },
  { key: "TIER_3", label: "Alpha Nivel 3", color: "text-mikoko-gold", border: "border-mikoko-gold", bg: "bg-mikoko-gold/10", bar: "bg-mikoko-gold", desc: "Growth", w: "w-3/5" },
  { key: "TIER_4", label: "Especulación Nivel 4", color: "text-mikoko-crimson", border: "border-mikoko-crimson", bg: "bg-mikoko-crimson/10", bar: "bg-mikoko-crimson", desc: "Speculation", w: "w-2/5" }
];

export default function PyramidView() {
  const { checksum } = useMikokoContext();

  const total = checksum?.metrics?.totalGlobalUSD || 0;
  const capitalByTier = checksum?.metrics?.capitalByTier || {};
  const pyramidResult = checksum?.axisResults?.ejePiramidal;

  const tiers = useMemo(() => {
    return TIER_CONFIG.map((t) => ({
      ...t,
      value: Number(capitalByTier[t.key] || 0),
      pct: total > 0 ? ((Number(capitalByTier[t.key] || 0) / total) * 100).toFixed(1) : "0.0"
    }));
  }, [capitalByTier, total]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-mikoko-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Triangle className="h-6 w-6 text-mikoko-gold" /> Panel de la Pirámide
          </h1>
          <p className="mt-1 text-sm text-mikoko-muted">Estructura de capitalización por niveles de riesgo.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="flex flex-col items-center justify-center rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-6">
            <div className="flex flex-col items-center gap-1.5">
              {tiers.map((t) => (
                <div key={t.key} className={`flex items-center justify-center ${t.w}`}>
                  <div className={`flex w-full items-center justify-between rounded-sm border-l-4 ${t.border} ${t.bg} px-4 py-3`}>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wider ${t.color}`}>{t.label}</p>
                      <p className="text-[10px] text-mikoko-muted">{t.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-white">{money.format(t.value)}</p>
                      <p className="text-[10px] text-mikoko-muted">{t.pct}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-mikoko-muted">Capital Total</p>
              <p className="text-2xl font-bold text-white">{money.format(total)}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <TrendingUp className="h-4 w-4 text-mikoko-cyan" /> Salud de la Pirámide
              </h2>
              <div className="mt-4 space-y-3">
                {[
                  { label: "Base (Tier 1)", ok: (capitalByTier.TIER_1 || 0) > 0, msg: "Capital de reserva presente" },
                  { label: "Proporción Alto Riesgo", ok: (checksum?.metrics?.capitalInHighRiskPct || 0) <= 30, msg: `Tier 3+4: ${(checksum?.metrics?.capitalInHighRiskPct || 0).toFixed(1)}%` },
                  { label: "Liquidez", ok: (checksum?.metrics?.liquidityPct || 0) >= 10, msg: `${(checksum?.metrics?.liquidityPct || 0).toFixed(1)}% liquidez` }
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between rounded border px-3 py-2 text-xs ${item.ok ? "border-mikoko-emerald/30 text-mikoko-emerald" : "border-mikoko-crimson/30 text-mikoko-crimson"}`}>
                    <span>{item.label}</span>
                    <span className="flex items-center gap-1.5">
                      {item.msg}
                      {item.ok ? <span className="h-2 w-2 rounded-full bg-mikoko-emerald" /> : <AlertTriangle className="h-3 w-3" />}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                <AlertTriangle className="h-4 w-4 text-mikoko-gold" /> Diagnóstico Eje Piramidal
              </h2>
              {pyramidResult ? (
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-mikoko-muted">Estado:</span>
                    <span className={pyramidResult.light === "GREEN" ? "text-mikoko-emerald" : "text-mikoko-crimson"}>{pyramidResult.light}</span>
                  </div>
                  <p className="text-mikoko-muted">{pyramidResult.label}</p>
                  <p className="text-mikoko-muted">{pyramidResult.action}</p>
                </div>
              ) : (
                <p className="mt-4 text-xs text-mikoko-muted">No hay datos disponibles.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
