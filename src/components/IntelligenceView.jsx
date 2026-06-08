import { BookOpen, Newspaper, Inbox, FileText } from "lucide-react";
import { useMemo } from "react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) return "";
  return d.toLocaleString();
}

export default function IntelligenceView() {
  const { dbs } = useMikokoContext();

  const notes = useMemo(() => dbs?.bd8?.records || [], [dbs]);
  const inbox = useMemo(() => dbs?.bd16?.records || [], [dbs]);
  const research = useMemo(() => dbs?.bd17?.records || [], [dbs]);
  const diary = useMemo(() => dbs?.bd14?.records || [], [dbs]);

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

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-mikoko-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Feed de Inteligencia</h1>
          <p className="mt-1 text-sm text-mikoko-muted">Agregación de notas, investigación y bandeja de entrada.</p>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <StatCard label="Notas BD8" value={notes.length} icon={BookOpen} color="cyan" />
          <StatCard label="Inbox BD16" value={inbox.length} icon={Inbox} color="gold" />
          <StatCard label="Research BD17" value={research.length} icon={Newspaper} color="emerald" />
          <StatCard label="Diario BD14" value={diary.length} icon={FileText} color="crimson" />
        </div>

        {allItems.length === 0 ? (
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-8 text-center">
            <BookOpen className="mx-auto mb-3 h-8 w-8 text-mikoko-muted" />
            <p className="text-sm text-mikoko-muted">No hay registros en las bases de datos de inteligencia (BD8, BD14, BD16, BD17).</p>
            <p className="mt-2 text-xs text-mikoko-muted">Agrega registros desde la Consola de Datos para verlos aquí.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allItems.map((item, i) => {
              const Icon = item.icon || FileText;
              return (
                <div key={item.internalId || i} className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-4 transition hover:border-cyan-500/20">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-mikoko-line bg-mikoko-panel2 text-mikoko-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-2">
                        <p className="text-sm font-semibold text-white">{item.titulo || item.asunto || item.nombre || item.ticker || `Entrada #${i + 1}`}</p>
                        <span className="rounded border border-mikoko-line bg-mikoko-panel2 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-mikoko-muted">{item.sourceLabel}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-mikoko-muted">{item.contenido || item.notas || item.descripcion || item.cuerpo || "—"}</p>
                      <p className="mt-2 text-[10px] text-mikoko-muted">{formatDate(item.fecha || item.createdAt)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colors = { cyan: "border-cyan-500/30 text-cyan-400", gold: "border-mikoko-gold/30 text-mikoko-gold", emerald: "border-emerald-500/30 text-emerald-400", crimson: "border-mikoko-crimson/30 text-mikoko-crimson" };
  return (
    <div className={`rounded-lg border bg-mikoko-panel/95 p-4 ${colors[color] || "border-mikoko-line text-mikoko-muted"}`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.15em] opacity-80">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
