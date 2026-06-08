import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BookOpen, Newspaper, Inbox, FileText, Shield, AlertTriangle,
  CheckCircle, X, ChevronRight, ChevronLeft, Activity, Clock,
  RefreshCw, Eye, Trash2, Zap, Target, Users, TrendingUp,
  AlertOctagon, Sparkles, Timer, Ban, Radio, BrainCircuit,
  FileCode2, Gauge, Coins, Layers
} from "lucide-react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const RISK_COMPONENTS = [
  { key: "riesgoEquipo", label: "Team Risk", low: "Anónimo", high: "Doxxeado" },
  { key: "riesgoTecnologia", label: "Tech Risk", low: "Rug Pull", high: "Auditado" },
  { key: "riesgoMercado", label: "Market Risk", low: "Baja Demanda", high: "High Demand" },
  { key: "riesgoRegulatorio", label: "Regulatory Risk", low: "Ilegal", high: "Cumple" },
  { key: "riesgoLiquidez", label: "Liquidity Risk", low: "Sin Liquidez", high: "Profundo" },
];

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : "";
}

function riskColor(val) {
  if (val <= 3) return "text-mikoko-crimson bg-mikoko-crimson/10 border-mikoko-crimson/30";
  if (val <= 6) return "text-mikoko-amber bg-mikoko-amber/10 border-mikoko-amber/30";
  return "text-mikoko-emerald bg-mikoko-emerald/10 border-mikoko-emerald/30";
}

function riskBarColor(val) {
  if (val <= 3) return "bg-mikoko-crimson";
  if (val <= 6) return "bg-mikoko-amber";
  return "bg-mikoko-emerald";
}

export default function IntelligenceAirlock() {
  const { dbs, addProject, addThesisNote, addAlert, dismissAlert, updateProject, getInactiveProjects } = useMikokoContext();
  const [tab, setTab] = useState("feed");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardSource, setWizardSource] = useState(null);
  const [radarRefresh, setRadarRefresh] = useState(0);

  const notes = useMemo(() => dbs?.bd8?.records || [], [dbs]);
  const inbox = useMemo(() => dbs?.bd16?.records || [], [dbs]);
  const research = useMemo(() => dbs?.bd17?.records || [], [dbs]);
  const diary = useMemo(() => dbs?.bd14?.records || [], [dbs]);
  const projects = useMemo(() => dbs?.bd7?.records || [], [dbs]);
  const alerts = useMemo(() => dbs?.bd6?.records || [], [dbs]);
  const inactiveProjects = useMemo(() => getInactiveProjects(), [dbs, getInactiveProjects, radarRefresh]);

  useEffect(() => {
    if (!dbs || !inactiveProjects.length) return;
    for (const proj of inactiveProjects) {
      const existingAlert = alerts.find(
        (a) => a.tipo === "INACTIVIDAD_PROYECTO" && a.proyectoId === proj.internalId && !a.resuelta
      );
      if (!existingAlert) {
        addAlert({
          tipo: "INACTIVIDAD_PROYECTO",
          proyectoId: proj.internalId,
          nombreProyecto: proj.nombreEstrategia || proj.nombre || proj.internalId,
          mensaje: `Proyecto inactivo por más de 90 días. ${proj.ciclosRevision >= 3 ? "ÚLTIMA OPORTUNIDAD antes de descarte automático." : `Ciclo de revisión #${proj.ciclosRevision + 1}.`}`,
          severity: proj.ciclosRevision >= 3 ? "CRITICA" : "ALTA",
        });
      }
    }
  }, [inactiveProjects, alerts, dbs, addAlert]);

  const inactiveAlerts = useMemo(
    () => alerts.filter((a) => a.tipo === "INACTIVIDAD_PROYECTO" && !a.resuelta),
    [alerts]
  );

  const handleLaunchDD = useCallback((item) => {
    setWizardSource(item);
    setWizardOpen(true);
  }, []);

  const handleExtendProject = useCallback(async (projId) => {
    await updateProject(projId, { ultimaTransaccion: new Date().toISOString(), ciclosRevision: 0 });
    const alert = alerts.find((a) => a.tipo === "INACTIVIDAD_PROYECTO" && a.proyectoId === projId);
    if (alert) await dismissAlert(alert.internalId);
    setRadarRefresh((r) => r + 1);
  }, [updateProject, alerts, dismissAlert]);

  const handleIncrementCycle = useCallback(async (projId) => {
    const proj = projects.find((p) => p.internalId === projId);
    const nextCycle = (proj?.ciclosRevision || 0) + 1;
    await updateProject(projId, { ciclosRevision: nextCycle });
    const alert = alerts.find((a) => a.tipo === "INACTIVIDAD_PROYECTO" && a.proyectoId === projId);
    if (alert) await dismissAlert(alert.internalId);
    setRadarRefresh((r) => r + 1);
  }, [updateProject, alerts, dismissAlert, projects]);

  const handleDiscardProject = useCallback(async (projId) => {
    await updateProject(projId, { estado: "DISCARDED" });
    const alert = alerts.find((a) => a.tipo === "INACTIVIDAD_PROYECTO" && a.proyectoId === projId);
    if (alert) await dismissAlert(alert.internalId);
    setRadarRefresh((r) => r + 1);
  }, [updateProject, alerts, dismissAlert]);

  const allItems = useMemo(() => {
    const items = [];
    for (const r of notes) items.push({ ...r, source: "bd8", sourceLabel: "Notas y Análisis", icon: BookOpen });
    for (const r of inbox) items.push({ ...r, source: "bd16", sourceLabel: "Bandeja Inbox", icon: Inbox });
    for (const r of research) items.push({ ...r, source: "bd17", sourceLabel: "Prensa y Research", icon: Newspaper });
    for (const r of diary) items.push({ ...r, source: "bd14", sourceLabel: "Diario Cripto", icon: FileText });
    items.sort((a, b) => {
      const da = a.fecha || a.createdAt || "";
      const db = b.fecha || b.createdAt || "";
      return db.localeCompare(da);
    });
    return items;
  }, [notes, inbox, research, diary]);

  const canLaunchDD = useMemo(
    () => new Set([...inbox.map((i) => i.internalId), ...research.map((r) => r.internalId)]),
    [inbox, research]
  );

  const approvedProjects = useMemo(
    () => projects.filter((p) => p.estado === "ACTIVO"),
    [projects]
  );

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-mikoko-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-mikoko-text">
            <Radio className="h-6 w-6 text-mikoko-gold" /> Intelligence Airlock
          </h1>
          <p className="mt-1 text-sm text-mikoko-muted">
            Centro de ingesta, due diligence y monitoreo de proyectos sobre BD6, BD7, BD8, BD16 y BD17.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-6">
          <StatCard label="Notas BD8" value={notes.length} icon={BookOpen} color="cyan" />
          <StatCard label="Inbox BD16" value={inbox.length} icon={Inbox} color="gold" />
          <StatCard label="Research BD17" value={research.length} icon={Newspaper} color="emerald" />
          <StatCard label="Diario BD14" value={diary.length} icon={FileText} color="crimson" />
          <StatCard label="Proyectos BD7" value={approvedProjects.length} icon={Layers} color="muted" />
          <StatCard
            label="Alertas Radar"
            value={inactiveAlerts.length}
            icon={AlertTriangle}
            color={inactiveAlerts.length > 0 ? "crimson" : "muted"}
          />
        </div>

        <div className="flex gap-1 rounded-lg border border-mikoko-line bg-mikoko-panel2 p-1">
          {[
            { key: "feed", label: "Feed de Inteligencia", icon: BookOpen },
            { key: "radar", label: "Radar de Inactividad", icon: Activity },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition ${
                  tab === t.key
                    ? "bg-mikoko-panel text-mikoko-text shadow-[inset_0_0_0_1px_rgba(0,224,255,0.2)]"
                    : "text-mikoko-muted hover:text-mikoko-text"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
                {t.key === "radar" && inactiveAlerts.length > 0 && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-mikoko-crimson px-1.5 text-[9px] font-bold text-mikoko-text">
                    {inactiveAlerts.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {tab === "feed" && (
          <div className="space-y-3">
            {allItems.length === 0 ? (
              <div className="rounded-lg border border-mikoko-line bg-mikoko-panel p-8 text-center">
                <BrainCircuit className="mx-auto mb-3 h-8 w-8 text-mikoko-muted" />
                <p className="text-sm text-mikoko-muted">No hay registros en las bases de inteligencia.</p>
                <p className="mt-2 text-xs text-mikoko-muted">Agrega registros desde la Consola de Datos para activar el DD Wizard.</p>
              </div>
            ) : (
              allItems.map((item, i) => {
                const Icon = item.icon || FileText;
                const isSignal = canLaunchDD.has(item.internalId);
                return (
                  <div
                    key={item.internalId || i}
                    className="rounded-lg border border-mikoko-line bg-mikoko-panel p-4 transition hover:border-mikoko-cyan/20"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-mikoko-line bg-mikoko-panel2 text-mikoko-muted">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <p className="text-sm font-semibold text-mikoko-text">
                            {item.titulo || item.asunto || item.nombre || item.ticker || `Entrada #${i + 1}`}
                          </p>
                          <span className="rounded border border-mikoko-line bg-mikoko-panel2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-mikoko-muted">
                            {item.sourceLabel}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-mikoko-muted">
                          {item.contenido || item.notas || item.descripcion || item.cuerpo || "—"}
                        </p>
                        <p className="mt-2 text-[10px] text-mikoko-muted">{formatDate(item.fecha || item.createdAt)}</p>
                      </div>
                      {isSignal && (
                        <button
                          onClick={() => handleLaunchDD(item)}
                          className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border border-mikoko-gold/40 bg-mikoko-gold/10 px-3 py-1.5 text-[10px] font-semibold text-mikoko-gold transition hover:bg-mikoko-gold/20"
                        >
                          <Zap className="h-3.5 w-3.5" /> DD Wizard
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {tab === "radar" && (
          <InactivityRadar
            projects={approvedProjects}
            inactiveIds={new Set(inactiveProjects.map((p) => p.internalId))}
            alerts={inactiveAlerts}
            onExtend={handleExtendProject}
            onIncrementCycle={handleIncrementCycle}
            onDiscard={handleDiscardProject}
            onRefresh={() => setRadarRefresh((r) => r + 1)}
          />
        )}
      </div>

      {wizardOpen && (
        <DueDiligenceWizard
          sourceItem={wizardSource}
          onClose={() => { setWizardOpen(false); setWizardSource(null); }}
          onComplete={() => { setWizardOpen(false); setWizardSource(null); }}
        />
      )}
    </main>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = {
    cyan: "border-mikoko-cyan/30 text-mikoko-cyan",
    gold: "border-mikoko-gold/30 text-mikoko-gold",
    emerald: "border-mikoko-emerald/30 text-mikoko-emerald",
    crimson: "border-mikoko-crimson/30 text-mikoko-crimson",
    muted: "border-mikoko-line text-mikoko-muted",
  };
  return (
    <div className={`rounded-lg border bg-mikoko-panel p-4 ${colors[color] || "border-mikoko-line text-mikoko-muted"}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.15em] opacity-80">{label}</span>
      </div>
      <p className={`mt-2 text-2xl font-semibold ${value > 0 ? "text-mikoko-text" : "text-mikoko-muted"}`}>{value}</p>
    </div>
  );
}

function InactivityRadar({ projects, inactiveIds, alerts, onExtend, onIncrementCycle, onDiscard, onRefresh }) {
  const [showAll, setShowAll] = useState(false);
  const filtered = showAll ? projects : projects.filter((p) => inactiveIds.has(p.internalId));

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aCrit = (a.ciclosRevision || 0) >= 3 ? 1 : 0;
      const bCrit = (b.ciclosRevision || 0) >= 3 ? 1 : 0;
      return bCrit - aCrit || (b.ciclosRevision || 0) - (a.ciclosRevision || 0);
    });
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-mikoko-text">
            <Activity className="h-5 w-5 text-mikoko-crimson" /> Radar de Inactividad
          </h2>
          <p className="mt-1 text-sm text-mikoko-muted">
            Proyectos aprobados en BD7 sin actividad por más de 90 días.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-mikoko-line bg-mikoko-panel2 px-3 py-1.5 text-xs text-mikoko-muted transition hover:text-mikoko-text"
          >
            <Eye className="h-3.5 w-3.5" />
            {showAll ? "Solo inactivos" : `Ver todos (${projects.length})`}
          </button>
          <button
            onClick={onRefresh}
            className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-mikoko-line bg-mikoko-panel2 px-3 py-1.5 text-xs text-mikoko-muted transition hover:text-mikoko-text"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refrescar
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-mikoko-emerald/30 bg-mikoko-emerald/10 p-6 text-center">
          <Shield className="mx-auto mb-3 h-8 w-8 text-mikoko-emerald" />
          <p className="text-sm font-semibold text-mikoko-emerald">Todos los proyectos están activos.</p>
          <p className="mt-1 text-xs text-mikoko-muted">No hay proyectos con inactividad superior a 90 días en BD7.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((proj) => {
            const isInactive = inactiveIds.has(proj.internalId);
            const alert = alerts.find((a) => a.proyectoId === proj.internalId);
            const cycles = proj.ciclosRevision || 0;
            const isLastChance = cycles >= 3;
            return (
              <div
                key={proj.internalId}
                className={`relative overflow-hidden rounded-lg border bg-mikoko-panel p-5 transition ${
                  isLastChance
                    ? "border-mikoko-crimson/60"
                    : isInactive
                      ? "border-mikoko-amber/40"
                      : "border-mikoko-line"
                }`}
              >
                {isLastChance && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-mikoko-crimson via-mikoko-amber to-mikoko-crimson" />
                    <div className="absolute inset-0 animate-pulse rounded-lg bg-mikoko-crimson/[0.03] pointer-events-none" />
                  </>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-mikoko-text">
                      {proj.nombreEstrategia || proj.nombre || proj.internalId}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-mikoko-muted">
                      {proj.estado || "ACTIVO"} · Ciclo #{cycles}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {isLastChance && (
                      <span className="inline-flex animate-pulse items-center gap-1 rounded-full bg-mikoko-crimson/20 px-2 py-1 text-[9px] font-bold text-mikoko-crimson">
                        <AlertOctagon className="h-3 w-3" /> LAST CHANCE
                      </span>
                    )}
                    {isInactive && !isLastChance && (
                      <Clock className="h-4 w-4 text-mikoko-amber" />
                    )}
                  </div>
                </div>
                {proj.descripcion && (
                  <p className="mt-2 line-clamp-2 text-xs text-mikoko-muted">{proj.descripcion}</p>
                )}
                {proj.riesgoCompuesto && (
                  <div className="mt-2 flex items-center gap-2">
                    <Gauge className="h-3 w-3 text-mikoko-muted" />
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-semibold ${riskColor(proj.riesgoCompuesto)}`}>
                      Risk: {proj.riesgoCompuesto}/10
                    </span>
                  </div>
                )}
                {alert && (
                  <div className="mt-3 rounded-lg border border-mikoko-amber/30 bg-mikoko-amber/5 px-3 py-2">
                    <p className="text-[10px] leading-4 text-mikoko-amber">{alert.mensaje}</p>
                  </div>
                )}
                {isInactive && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onExtend(proj.internalId)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-mikoko-cyan/40 bg-mikoko-cyan/10 px-3 py-2 text-[10px] font-semibold text-mikoko-cyan transition hover:bg-mikoko-cyan/20"
                    >
                      <Timer className="h-3 w-3" /> Extender
                    </button>
                    {!isLastChance && (
                      <button
                        onClick={() => onIncrementCycle(proj.internalId)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-mikoko-amber/40 bg-mikoko-amber/10 px-3 py-2 text-[10px] font-semibold text-mikoko-amber transition hover:bg-mikoko-amber/20"
                      >
                        <RefreshCw className="h-3 w-3" /> Siguiente ciclo
                      </button>
                    )}
                    {isLastChance && (
                      <button
                        onClick={() => onDiscard(proj.internalId)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-mikoko-crimson/40 bg-mikoko-crimson/10 px-3 py-2 text-[10px] font-semibold text-mikoko-crimson transition hover:bg-mikoko-crimson/20"
                      >
                        <Trash2 className="h-3 w-3" /> Descartar
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DueDiligenceWizard({ sourceItem, onClose, onComplete }) {
  const { addProject, addThesisNote } = useMikokoContext();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [risks, setRisks] = useState({
    riesgoEquipo: 5,
    riesgoTecnologia: 5,
    riesgoMercado: 5,
    riesgoRegulatorio: 5,
    riesgoLiquidez: 5,
  });
  const [contractAddress, setContractAddress] = useState("");
  const [volume, setVolume] = useState("");
  const [thesis, setThesis] = useState({
    equipo: "",
    catalizadores: "",
    riesgos: "",
    condicionSalida: "",
  });

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const riskScore = Math.round(
        RISK_COMPONENTS.reduce((sum, rc) => sum + risks[rc.key], 0) / RISK_COMPONENTS.length
      );
      const project = await addProject({
        nombre: sourceItem?.titulo || sourceItem?.asunto || "Proyecto sin título",
        descripcion: sourceItem?.contenido || sourceItem?.cuerpo || "",
        ticker: sourceItem?.ticker || "",
        tipo: "CRYPTO",
        riesgoCompuesto: riskScore,
        contrato: contractAddress,
        volumenUSD: volume ? Number(volume) : 0,
        origenSignal: sourceItem?.source || "unknown",
        signalId: sourceItem?.internalId || null,
      });
      if (project) {
        await addThesisNote({
          proyectoId: project.internalId,
          titulo: `Tesis: ${sourceItem?.titulo || sourceItem?.asunto || "Proyecto"}`,
          contenido: JSON.stringify({
            equipo: thesis.equipo,
            catalizadores: thesis.catalizadores,
            riesgos: thesis.riesgos,
            condicionSalida: thesis.condicionSalida,
            riskComponents: risks,
            riskScore,
            contractAddress,
            volume: volume ? Number(volume) : 0,
            signalSource: sourceItem?.source,
            signalContent: sourceItem?.contenido || sourceItem?.cuerpo || "",
          }, null, 2),
        });
      }
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [risks, thesis, contractAddress, volume, sourceItem, addProject, addThesisNote, onComplete]);

  const steps = [
    {
      title: "Evaluación de Riesgo",
      desc: "Puntúa cada componente del proyecto en escala 1-10",
      content: (
        <div className="space-y-5">
          {RISK_COMPONENTS.map((rc) => (
            <div key={rc.key}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-mikoko-text">{rc.label}</span>
                <span className={`rounded-md border px-2 py-0.5 font-mono text-xs ${riskColor(risks[rc.key])}`}>
                  {risks[rc.key]}/10
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-24 text-right text-[10px] text-mikoko-muted">{rc.low}</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={risks[rc.key]}
                  onChange={(e) => setRisks({ ...risks, [rc.key]: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="w-24 text-[10px] text-mikoko-muted">{rc.high}</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-mikoko-line">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${riskBarColor(risks[rc.key])}`}
                  style={{ width: `${(risks[rc.key] / 10) * 100}%` }}
                />
              </div>
            </div>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-mikoko-muted">
                Dirección del Contrato
              </label>
              <input
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                className="field w-full font-mono text-xs"
                placeholder="0x..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-mikoko-muted">
                Volumen Estimado (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-mikoko-muted">$</span>
                <input
                  type="number"
                  min="0"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  className="field w-full pl-6"
                  placeholder="100,000"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tesis de Inversión",
      desc: "Documenta los fundamentos del proyecto en BD8",
      content: (
        <div className="space-y-4">
          {[
            { key: "equipo", label: "Equipo", icon: Users, placeholder: "¿Quién está detrás del proyecto? Experiencia, track record, transparencia..." },
            { key: "catalizadores", label: "Catalizadores", icon: TrendingUp, placeholder: "¿Qué eventos impulsarán el valor? Roadmap, partnerships, narrativas de mercado..." },
            { key: "riesgos", label: "Riesgos Identificados", icon: AlertTriangle, placeholder: "¿Qué puede salir mal? Competencia, riesgos técnicos, regulatorios, de liquidez..." },
            { key: "condicionSalida", label: "Condición de Salida", icon: Target, placeholder: "¿Cuándo y cómo salir? Price target, horizonte temporal, stop-loss, take-profit..." },
          ].map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.key}>
                <label className="mb-1.5 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-mikoko-muted">
                  <Icon className="h-3.5 w-3.5" /> {field.label}
                </label>
                <textarea
                  value={thesis[field.key]}
                  onChange={(e) => setThesis({ ...thesis, [field.key]: e.target.value })}
                  className="field min-h-[80px] w-full resize-none text-sm"
                  placeholder={field.placeholder}
                  rows={3}
                />
              </div>
            );
          })}
        </div>
      ),
    },
    {
      title: "Confirmación y Sellado",
      desc: "Revisa todos los datos antes de guardar en BD7 y BD8",
      content: (
        <div className="space-y-4">
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel2 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mikoko-cyan">
              <Gauge className="h-3.5 w-3.5" /> Perfil de Riesgo
            </h4>
            <div className="grid gap-3 sm:grid-cols-5">
              {RISK_COMPONENTS.map((rc) => (
                <div key={rc.key} className="rounded-lg border border-mikoko-line bg-mikoko-panel p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-mikoko-muted">{rc.label}</p>
                  <p className={`mt-1 text-lg font-bold ${riskColor(risks[rc.key]).split(" ")[0]}`}>
                    {risks[rc.key]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {contractAddress && (
              <div className="rounded-lg border border-mikoko-line bg-mikoko-panel2 p-3">
                <p className="text-[10px] uppercase tracking-wider text-mikoko-muted">Contrato</p>
                <p className="mt-1 truncate font-mono text-xs text-mikoko-text">{contractAddress}</p>
              </div>
            )}
            {volume && (
              <div className="rounded-lg border border-mikoko-line bg-mikoko-panel2 p-3">
                <p className="text-[10px] uppercase tracking-wider text-mikoko-muted">Volumen</p>
                <p className="mt-1 text-sm font-semibold text-mikoko-text">${Number(volume).toLocaleString()}</p>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel2 p-4">
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-mikoko-cyan">
              <FileCode2 className="h-3.5 w-3.5" /> Tesis
            </h4>
            {Object.entries(thesis).map(([key, val]) => (
              <div key={key} className={`${val ? "mb-2" : "hidden"}`}>
                <p className="text-[10px] uppercase tracking-wider text-mikoko-muted">
                  {{ equipo: "Equipo", catalizadores: "Catalizadores", riesgos: "Riesgos", condicionSalida: "Condición de Salida" }[key] || key}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-xs text-mikoko-text line-clamp-3">{val || "—"}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-mikoko-gold/30 bg-mikoko-gold/5 p-3">
            <p className="text-center text-xs text-mikoko-gold">
              Se creará un proyecto en <strong>BD7</strong> y una nota de tesis estructurada en <strong>BD8</strong>.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-mikoko-text/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl border-2 border-mikoko-gold/50 bg-mikoko-panel shadow-retro-lg">
        <div className="border-b border-mikoko-line px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-mikoko-gold/40 bg-mikoko-gold/10 text-mikoko-gold">
                <FileCode2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-mikoko-text">Due Diligence Wizard</h2>
                <p className="text-[10px] text-mikoko-muted">
                  {sourceItem?.titulo || sourceItem?.asunto || "Nuevo proyecto"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 text-mikoko-muted transition hover:bg-mikoko-panel2 hover:text-mikoko-text">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-4 flex items-center gap-2">
            {steps.map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    step === i
                      ? "border-2 border-mikoko-gold bg-mikoko-gold/20 text-mikoko-gold"
                      : step > i
                        ? "border-2 border-mikoko-emerald bg-mikoko-emerald/20 text-mikoko-emerald"
                        : "border border-mikoko-line bg-mikoko-panel2 text-mikoko-muted"
                  }`}
                >
                  {step > i ? <CheckCircle className="h-3 w-3" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`h-px w-6 ${step > i ? "bg-mikoko-emerald" : "bg-mikoko-line"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="mb-3">
            <h3 className="text-sm font-semibold text-mikoko-text">{steps[step].title}</h3>
            <p className="text-[10px] text-mikoko-muted">{steps[step].desc}</p>
          </div>

          <div className="min-h-[280px] py-3">{steps[step].content}</div>
        </div>

        <div className="flex items-center justify-between border-t border-mikoko-line px-6 py-4">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="inline-flex min-h-9 items-center gap-1.5 rounded px-3 text-xs text-mikoko-muted transition hover:text-mikoko-text disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(Math.min(step + 1, steps.length - 1))}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-mikoko-gold/40 bg-mikoko-gold/10 px-5 text-xs font-semibold text-mikoko-gold transition hover:bg-mikoko-gold/20"
            >
              Siguiente <ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-mikoko-emerald/50 bg-mikoko-emerald/15 px-6 text-sm font-semibold text-mikoko-emerald transition hover:bg-mikoko-emerald/25 disabled:opacity-50"
            >
              {submitting ? (
                <>Guardando...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Guardar Proyecto + Tesis</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
