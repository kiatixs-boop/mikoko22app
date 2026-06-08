import { useState, useMemo, useCallback } from "react";
import { Database, Server, List, Plus, Eye, EyeOff } from "lucide-react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const DB_META = [
  ["bd0","Central de Datos"],["bd1","Portfolio Actual"],["bd2","Transacciones"],["bd3","Activos Cripto"],
  ["bd4","Parametros Piramide"],["bd5","Estrategias DeFi"],["bd6","Tareas y Alertas"],["bd7","Proyectos y Protocolos"],
  ["bd8","Notas y Analisis"],["bd9","Campanas Airdrop"],["bd10","Glosario Cripto"],["bd11","Ubicaciones"],
  ["bd12","Posiciones Activas"],["bd13","NFTs"],["bd14","Diario Cripto"],["bd15","Estado del Operador"],
  ["bd16","Pitacoras Inbox"],["bd17","Prensa y Research"],["bd18","Herramientas"],["bd19","Contactos"],
  ["bd20","Reconciliaciones"],["bd21","Snapshots Contables"]
];

function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isFinite(d.getTime()) ? d.toLocaleString() : "—";
}

export default function DataConsoleView() {
  const { dbs, isSimulation } = useMikokoContext();
  const [selectedDb, setSelectedDb] = useState("bd3");
  const [showRaw, setShowRaw] = useState(false);
  const [newRecord, setNewRecord] = useState("");

  const currentDb = useMemo(() => (dbs ? dbs[selectedDb] : null), [dbs, selectedDb]);
  const meta = DB_META.find(([id]) => id === selectedDb);
  const records = currentDb?.records || [];
  const sampleKeys = useMemo(() => {
    if (records.length === 0) return [];
    const keys = new Set();
    for (const r of records.slice(0, 3)) for (const k of Object.keys(r)) keys.add(k);
    return Array.from(keys).slice(0, 8);
  }, [records]);

  const handleAddRecord = useCallback(() => {
    if (!newRecord.trim()) return;
    try {
      const parsed = JSON.parse(newRecord);
      if (!dbs) return;
      const next = { ...dbs };
      next[selectedDb] = { ...currentDb, records: [...records, parsed] };
      setNewRecord("");
    } catch {
      alert("JSON inválido. Revisa el formato.");
    }
  }, [newRecord, dbs, selectedDb, currentDb, records]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-mikoko-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <Server className="h-6 w-6 text-mikoko-cyan" /> Consola de Datos Unificada
          </h1>
          <p className="mt-1 text-sm text-mikoko-muted">Navega y administra las 22 bases de datos del sistema.</p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-64 flex-1">
            <label className="mb-1.5 block text-xs uppercase tracking-[0.18em] text-mikoko-muted">Base de Datos</label>
            <select
              value={selectedDb}
              onChange={(e) => setSelectedDb(e.target.value)}
              className="field w-full"
            >
              {DB_META.map(([id, name]) => (
                <option key={id} value={id}>{id.toUpperCase()} — {name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowRaw(!showRaw)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-mikoko-line bg-mikoko-panel2 px-4 py-2 text-xs text-mikoko-muted transition hover:text-white">
              {showRaw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showRaw ? "Ver limpio" : "Ver raw"}
            </button>
            <div className="rounded-lg border border-mikoko-line bg-mikoko-panel2 px-4 py-2 text-xs text-mikoko-muted">
              {records.length} registros
            </div>
          </div>
        </div>

        {meta && (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
            <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Plus className="h-4 w-4 text-mikoko-emerald" /> Agregar Registro
              </h2>
              <p className="mb-3 text-xs text-mikoko-muted">Ingresa un objeto JSON válido para agregarlo a {meta[0].toUpperCase()}.</p>
              <textarea
                value={newRecord}
                onChange={(e) => setNewRecord(e.target.value)}
                className="field min-h-[120px] w-full font-mono text-xs"
                placeholder='{"internalId": "asset-xxx", "nombre": "Ejemplo", "ticker": "XYZ"}'
              />
              <button
                onClick={handleAddRecord}
                disabled={!newRecord.trim() || isSimulation}
                className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-mikoko-emerald/50 bg-mikoko-emerald/15 px-4 py-2 text-sm font-semibold text-mikoko-emerald transition hover:border-mikoko-emerald hover:bg-mikoko-emerald/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" /> {isSimulation ? "[SIM] Simular alta" : "Agregar a " + meta[0].toUpperCase()}
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-mikoko-line bg-mikoko-panel/95">
              <div className="border-b border-mikoko-line px-5 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                  <List className="h-4 w-4 text-mikoko-gold" /> {meta[0].toUpperCase()} — {meta[1]}
                </h2>
              </div>
              {records.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
                  <Database className="mb-3 h-8 w-8 text-mikoko-muted" />
                  <p className="text-sm text-mikoko-muted">No hay registros en {meta[0].toUpperCase()}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-mikoko-line text-[10px] uppercase tracking-[0.18em] text-mikoko-muted">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        {sampleKeys.map((k) => (
                          <th key={k} className="whitespace-nowrap px-4 py-3">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-mikoko-line">
                      {records.map((record, i) => (
                        <tr key={record.internalId || i} className="transition hover:bg-mikoko-panel2/50">
                          <td className="px-4 py-3 text-mikoko-muted">{i + 1}</td>
                          {sampleKeys.map((k) => {
                            const val = record[k];
                            const display = val === null || val === undefined ? "—" : typeof val === "object" ? JSON.stringify(val).slice(0, 40) + "..." : String(val);
                            return (
                              <td key={k} className="max-w-40 truncate whitespace-nowrap px-4 py-3 text-white">
                                {display}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {showRaw && currentDb && (
          <div className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-5">
            <h2 className="mb-3 text-sm font-semibold text-white">Raw JSON — {selectedDb.toUpperCase()}</h2>
            <pre className="max-h-96 overflow-auto rounded border border-mikoko-line bg-mikoko-void p-4 font-mono text-xs text-mikoko-text">
              {JSON.stringify(currentDb, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
