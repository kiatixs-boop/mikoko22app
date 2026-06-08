import { useState, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown, Shield, AlertTriangle, CheckCircle, RefreshCw, Lock, FileCheck, X } from "lucide-react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const AXES_CONFIG = [
  {
    key: "eje1_accounting",
    code: "EJE-1",
    label: "Contabilidad",
    compute: (metrics) => {
      const total = metrics?.totalGlobalUSD || 0;
      return { value: total, max: 1, unit: "$", dangerZone: total <= 0 };
    }
  },
  {
    key: "eje2_prices",
    code: "EJE-2",
    label: "Precios",
    compute: (metrics) => {
      const staleCount = metrics?.stalePriceAssets?.length || 0;
      return { value: staleCount, max: 1, unit: " obs", dangerZone: staleCount > 0 };
    }
  },
  {
    key: "eje3_audit",
    code: "EJE-3",
    label: "Auditoría",
    compute: (metrics) => {
      const days = metrics?.daysSinceAudit;
      return { value: days ?? 999, max: 30, unit: "d", dangerZone: days === null || days > 30 };
    }
  },
  {
    key: "eje4_psychology",
    code: "EJE-4",
    label: "Psicología",
    compute: (metrics, checksum) => {
      const score = checksum?.metrics ? 0 : 0;
      const axis = checksum?.axisResults?.eje4_psychology;
      return { value: 0, max: 1, unit: "", dangerZone: axis?.light === "ORANGE" };
    }
  },
  {
    key: "ejePiramidal",
    code: "EJE-P",
    label: "Pirámide",
    compute: (metrics) => {
      const highRisk = metrics?.capitalInHighRiskPct || 0;
      return { value: highRisk, max: 30, unit: "%", dangerZone: highRisk > 30 };
    }
  },
  {
    key: "ejeLiquidity",
    code: "EJE-L",
    label: "Liquidez",
    compute: (metrics) => {
      const dry = metrics?.liquidityPct || 0;
      return { value: dry, max: 10, unit: "%", dangerZone: dry < 10 };
    }
  }
];

function useReconciliationHandler() {
  const { checksum, forceSyncBd0, refreshMarketPrices, addReconciliation, addSnapshot, resolveReconciliation } = useMikokoContext();
  const [reconOpen, setReconOpen] = useState(false);
  const [reconStep, setReconStep] = useState(0);
  const [sealing, setSealing] = useState(false);
  const [sealed, setSealed] = useState(false);
  const [reconId, setReconId] = useState(null);

  const isBlocked = checksum?.verdict === "BLOCKED";

  const openReconciliation = useCallback(async () => {
    const recon = await addReconciliation({
      tipo: "EMERGENCIA",
      ejesAfectados: Object.entries(checksum?.axisResults || {})
        .filter(([, a]) => a.blocksOperation)
        .map(([k]) => k),
      estado: "ABIERTA"
    });
    if (recon) setReconId(recon.internalId);
    setReconStep(0);
    setReconOpen(true);
    setSealed(false);
  }, [checksum, addReconciliation]);

  const handleAutoFix = useCallback(async (axisKey) => {
    if (axisKey === "eje2_prices") await refreshMarketPrices();
    if (axisKey === "eje1_accounting") await forceSyncBd0();
    setReconStep((s) => Math.min(s + 1, 3));
  }, [refreshMarketPrices, forceSyncBd0]);

  const handleSeal = useCallback(async () => {
    setSealing(true);
    const snap = await addSnapshot();
    if (reconId) await resolveReconciliation(reconId);
    setSealed(true);
    setTimeout(() => setSealing(false), 600);
  }, [addSnapshot, reconId, resolveReconciliation]);

  return {
    reconOpen,
    reconStep,
    setReconStep,
    sealing,
    sealed,
    isBlocked,
    openReconciliation,
    handleAutoFix,
    handleSeal,
    setReconOpen
  };
}

export default function ImmunologicalCockpit() {
  const { checksum } = useMikokoContext();
  const [collapsed, setCollapsed] = useState(false);
  const recon = useReconciliationHandler();

  const bars = useMemo(() => {
    if (!checksum) return [];
    const axes = checksum.axisResults || {};
    const metrics = checksum.metrics;
    return AXES_CONFIG.map((cfg) => {
      const axis = axes[cfg.key];
      const { value, max, unit, dangerZone } = cfg.compute(metrics, checksum);
      const light = axis?.light || "RED";
      const pct = max > 0 ? Math.min(100, (value / max) * 100) : dangerZone ? 100 : 0;
      return { ...cfg, value, max, unit, pct, light, axis };
    });
  }, [checksum]);

  return (
    <>
      <div
        className={`border-b-2 border-mikoko-line bg-mikoko-panel transition-all duration-200 ${
          collapsed ? "h-9" : "h-14"
        }`}
      >
        <div className="flex h-full items-center px-4">
          <div className="mr-3 flex items-center gap-1.5">
            <Shield
              className={`h-3.5 w-3.5 ${
                checksum?.verdict === "AUTHORIZED"
                  ? "text-mikoko-emerald"
                  : checksum?.verdict === "CAUTION"
                    ? "text-mikoko-amber"
                    : "text-mikoko-crimson"
              }`}
            />
            <span className="font-silkscreen text-[10px] tracking-wider text-mikoko-muted">CHK</span>
          </div>

          <div className="flex flex-1 items-center gap-3 overflow-x-auto">
            {bars.map((bar) => {
              const isRed = bar.light === "RED";
              return (
                <div key={bar.key} className="flex shrink-0 items-center gap-2">
                  <span
                    className={`font-silkscreen text-[9px] tracking-wider ${
                      isRed ? "text-mikoko-crimson" : bar.light === "GREEN" ? "text-mikoko-emerald" : "text-mikoko-amber"
                    }`}
                  >
                    {bar.code}
                  </span>
                  <div className="relative h-2 w-20 overflow-hidden border-2 border-mikoko-line bg-mikoko-panel2">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isRed ? "bg-mikoko-crimson" : bar.light === "GREEN" ? "bg-mikoko-emerald" : "bg-mikoko-amber"
                      }`}
                      style={{ width: `${Math.min(100, bar.pct)}%` }}
                    />
                  </div>
                  {!collapsed && (
                    <span
                      className={`font-mono text-[9px] ${
                        isRed ? "text-mikoko-crimson" : "text-mikoko-muted"
                      }`}
                    >
                      {bar.dangerZone ? (bar.key === "eje4_psychology" ? "!" : "BLOCK") : `${bar.value}${bar.unit}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="ml-3 flex items-center gap-2">
            {recon.isBlocked && (
              <button
                onClick={recon.openReconciliation}
                className="inline-flex min-h-6 animate-pulse items-center gap-1.5 border-2 border-mikoko-crimson/50 px-2.5 py-1 font-silkscreen text-[9px] tracking-wider text-mikoko-crimson transition-all shadow-retro bg-mikoko-crimson/10 hover:bg-mikoko-crimson/20"
              >
                <AlertTriangle className="h-3 w-3" />
                RECON
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="border-2 border-transparent p-1 text-mikoko-muted transition hover:border-mikoko-line hover:bg-mikoko-panel2 hover:text-mikoko-text hover:shadow-retro"
            >
              {collapsed ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {recon.reconOpen && (
        <ReconciliationOverlay
          recon={recon}
          checksum={checksum}
        />
      )}
    </>
  );
}

function ReconciliationOverlay({ recon, checksum }) {
  const { forceSyncBd0, refreshMarketPrices } = useMikokoContext();
  const blockingAxes = Object.entries(checksum?.axisResults || {}).filter(([, a]) => a.blocksOperation);

  const steps = [
    {
      title: "Diagnóstico de Fallo",
      desc: "Identificando ejes bloqueantes del sistema",
      content: (
        <div className="space-y-3">
          {blockingAxes.length === 0 ? (
            <div className="border-2 border-mikoko-emerald/50 px-4 py-3 text-sm text-mikoko-emerald shadow-retro-inner bg-mikoko-emerald/[0.04]">
              No se detectan ejes bloqueantes. Puedes procedir a sellar.
            </div>
          ) : (
            blockingAxes.map(([key, axis]) => (
              <div
                key={key}
                className="border-2 border-mikoko-crimson/50 px-4 py-3 shadow-retro-inner bg-mikoko-crimson/[0.03]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-mikoko-crimson">{axis.code}</p>
                    <p className="mt-1 text-xs text-mikoko-muted">{axis.label}</p>
                    <p className="mt-1 text-xs leading-5 text-mikoko-muted">{axis.action}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {key === "eje2_prices" && (
                      <button
                        onClick={() => refreshMarketPrices()}
                        className="inline-flex min-h-8 items-center gap-1.5 border-2 border-mikoko-cyan/50 px-3 py-1.5 font-silkscreen text-[9px] tracking-wider text-mikoko-cyan transition-all shadow-retro hover:bg-mikoko-cyan/10"
                      >
                        <RefreshCw className="h-3 w-3" /> Actualizar Precios
                      </button>
                    )}
                    {key === "eje1_accounting" && (
                      <button
                        onClick={() => forceSyncBd0()}
                        className="inline-flex min-h-8 items-center gap-1.5 border-2 border-mikoko-emerald/50 px-3 py-1.5 font-silkscreen text-[9px] tracking-wider text-mikoko-emerald transition-all shadow-retro hover:bg-mikoko-emerald/10"
                      >
                        <RefreshCw className="h-3 w-3" /> Sync BD0
                      </button>
                    )}
                    {key === "eje3_audit" && (
                      <button
                        onClick={() => forceSyncBd0()}
                        className="inline-flex min-h-8 items-center gap-1.5 border-2 border-mikoko-gold/50 px-3 py-1.5 font-silkscreen text-[9px] tracking-wider text-mikoko-gold transition-all shadow-retro hover:bg-mikoko-gold/10"
                      >
                        Marcar Auditado
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )
    },
    {
      title: "Verificación Contable",
      desc: "Comparando BD1 vs BD0 y corrigiendo discrepancias",
      content: (
        <div className="space-y-3">
          <div className="border-2 border-mikoko-line px-4 py-3 shadow-retro-inner bg-mikoko-panel2">
            <p className="text-xs text-mikoko-muted">
              Total BD1: <span className="font-mono text-mikoko-text font-semibold">${(checksum?.metrics?.totalGlobalUSD || 0).toLocaleString()}</span>
            </p>
            <p className="mt-1 text-xs text-mikoko-muted">
              Polvo Seco: <span className="font-mono text-mikoko-text font-semibold">${(checksum?.metrics?.dryPowderUSD || 0).toLocaleString()}</span>
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => forceSyncBd0()}
                className="inline-flex min-h-9 flex-1 items-center justify-center gap-2 border-2 border-mikoko-emerald/50 px-4 font-silkscreen text-[10px] tracking-wider text-mikoko-emerald transition-all shadow-retro hover:bg-mikoko-emerald/10"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Forzar Sincronización BD0
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Revisión Final",
      desc: "Verifica que todos los ejes estén verdes antes de sellar",
      content: (
        <div className="space-y-2">
          {Object.entries(checksum?.axisResults || {}).map(([key, axis]) => (
            <div key={key} className="flex items-center justify-between border-2 border-mikoko-line px-4 py-2.5 shadow-retro-inner bg-mikoko-panel2">
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 border-2 border-mikoko-line ${
                    axis.light === "GREEN"
                      ? "bg-mikoko-emerald"
                      : axis.light === "YELLOW" || axis.light === "ORANGE"
                        ? "bg-mikoko-amber"
                        : "bg-mikoko-crimson"
                  }`}
                />
                <span className="font-silkscreen text-[10px] tracking-wider text-mikoko-muted">{axis.code}</span>
                <span className="text-[10px] text-mikoko-muted">{axis.label}</span>
              </div>
              <span
                className={`font-silkscreen text-[9px] tracking-wider ${
                  axis.light === "GREEN"
                    ? "text-mikoko-emerald"
                    : axis.light === "YELLOW" || axis.light === "ORANGE"
                      ? "text-mikoko-amber"
                      : "text-mikoko-crimson"
                }`}
              >
                {axis.light}
              </span>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Sellado Inmutable (Immutable Sealer)",
      desc: "Genera un snapshot contable con firma digital",
      content: (
        <div className="flex flex-col items-center justify-center py-6">
          {recon.sealed ? (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-20 w-20 items-center justify-center border-4 border-mikoko-emerald shadow-retro bg-mikoko-emerald/15">
                <Lock className="h-10 w-10 text-mikoko-emerald" />
              </div>
              <p className="font-silkscreen text-sm tracking-wider text-mikoko-emerald">SNAPSHOT SEALED</p>
              <p className="text-xs text-mikoko-muted">Firma digital generada en BD21</p>
              <button
                onClick={() => recon.setReconOpen(false)}
                className="mt-2 inline-flex min-h-9 items-center gap-2 border-2 border-mikoko-line shadow-retro bg-mikoko-panel2 px-4 text-xs text-mikoko-muted transition hover:text-mikoko-text"
              >
                <X className="h-3.5 w-3.5" /> Cerrar Consola
              </button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-center text-xs leading-5 text-mikoko-muted">
                Al sellar este snapshot, se generará un registro inmutable en BD21 con las métricas actuales
                y una firma digital única. El campo <code className="border-2 border-mikoko-line bg-mikoko-panel2 px-1 py-0.5 font-mono text-mikoko-cyan">lastAuditDate</code> de BD0 se actualizará.
              </p>
              <button
                onClick={recon.handleSeal}
                disabled={recon.sealing}
                className="group inline-flex min-h-12 items-center gap-3 border-2 border-mikoko-emerald/60 px-8 py-3 font-silkscreen text-sm tracking-wider text-mikoko-emerald transition-all shadow-retro hover:bg-mikoko-emerald/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FileCheck className="h-6 w-6" />
                {recon.sealing ? "SELLANDO..." : "SEAL SNAPSHOT"}
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-mikoko-text/70">
      <div className="relative w-full max-w-xl border-2 border-mikoko-line shadow-retro-lg bg-mikoko-panel">
        <div className="border-b-2 border-mikoko-line px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border-2 border-mikoko-crimson/50 text-mikoko-crimson shadow-retro-inner bg-mikoko-crimson/[0.06]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-mikoko-text">Consola de Reconciliación de Emergencia</h2>
                <p className="font-silkscreen text-[9px] tracking-wider text-mikoko-muted">Protocolo de restauración del Sistema de Soporte Vital</p>
              </div>
            </div>
            <button
              onClick={() => recon.setReconOpen(false)}
              className="border-2 border-transparent p-2 text-mikoko-muted transition hover:border-mikoko-line hover:bg-mikoko-panel2 hover:text-mikoko-text hover:shadow-retro"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 flex items-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center text-[10px] font-bold transition-all ${
                    recon.reconStep === i
                      ? "border-2 border-mikoko-cyan bg-mikoko-cyan/15 text-mikoko-cyan shadow-retro"
                      : recon.reconStep > i
                        ? "border-2 border-mikoko-emerald bg-mikoko-emerald/15 text-mikoko-emerald shadow-retro"
                        : "border-2 border-mikoko-line bg-mikoko-panel2 text-mikoko-muted"
                  }`}
                >
                  {recon.reconStep > i ? <CheckCircle className="h-3 w-3" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-px w-6 ${
                      recon.reconStep > i ? "bg-mikoko-emerald" : "bg-mikoko-line"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mb-2">
            <h3 className="text-sm font-semibold text-mikoko-text">{steps[recon.reconStep].title}</h3>
            <p className="font-silkscreen text-[9px] tracking-wider text-mikoko-muted">{steps[recon.reconStep].desc}</p>
          </div>

          <div className="min-h-[200px] py-3">{steps[recon.reconStep].content}</div>
        </div>

        {recon.reconStep < steps.length - 1 && !recon.sealed && (
          <div className="flex items-center justify-between border-t-2 border-mikoko-line px-6 py-3">
            <button
              onClick={() => recon.setReconStep((s) => Math.max(0, s - 1))}
              disabled={recon.reconStep === 0}
              className="inline-flex min-h-8 items-center border-2 border-transparent px-3 text-xs text-mikoko-muted transition hover:border-mikoko-line hover:text-mikoko-text hover:shadow-retro disabled:opacity-30"
            >
              Anterior
            </button>
            <button
              onClick={() => recon.setReconStep((s) => Math.min(s + 1, steps.length - 1))}
              className="inline-flex min-h-8 items-center gap-1.5 border-2 border-mikoko-cyan/50 px-4 font-silkscreen text-[10px] tracking-wider text-mikoko-cyan transition-all shadow-retro hover:bg-mikoko-cyan/10"
            >
              Siguiente <ChevronDown className="h-3 w-3 -rotate-90" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
