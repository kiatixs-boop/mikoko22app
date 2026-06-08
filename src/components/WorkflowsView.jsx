import { Play, FileText, RefreshCw, Database, CheckCircle, Server } from "lucide-react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const WORKFLOWS = [
  { id: "WF-001", name: "Registrar Activo", desc: "Crear un nuevo pasaporte de activo en BD3", icon: FileText, action: "asset" },
  { id: "WF-002", name: "Nueva Transacción", desc: "Registrar compra/venta/transferencia en BD2", icon: Play, action: "transaction" },
  { id: "WF-010", name: "Rebalanceo de Cartera", desc: "Ejecutar rebalanceo entre niveles de riesgo", icon: RefreshCw, action: "rebalance" },
  { id: "WF-020", name: "Reconciliación Contable", desc: "Conciliar saldos BD1 contra BD0", icon: CheckCircle, action: "reconcile" },
  { id: "WF-030", name: "Actualizar Precios", desc: "Refrescar precios de mercado vía CoinGecko", icon: Database, action: "refreshPrices" },
  { id: "WF-099", name: "Inicializar Bases de Datos", desc: "Recargar todas las BD desde el servidor", icon: Server, action: "reload" }
];

export default function WorkflowsView() {
  const { dbs, reload, refreshMarketPrices } = useMikokoContext();

  async function handleAction(action) {
    if (action === "reload") await reload();
    if (action === "refreshPrices") await refreshMarketPrices();
  }

  return (
    <main className="min-h-screen bg-transparent px-4 py-5 text-mikoko-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-white">Launchpad de Workflows</h1>
          <p className="mt-1 text-sm text-mikoko-muted">Procedimientos operacionales del sistema MIKOKO.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WORKFLOWS.map((wf) => {
            const Icon = wf.icon;
            return (
              <div key={wf.id} className="rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-5 transition hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,224,255,0.08)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-mikoko-gold/40 bg-mikoko-gold/10 text-mikoko-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-mikoko-muted">{wf.id}</p>
                    <p className="text-sm font-semibold text-white">{wf.name}</p>
                  </div>
                </div>
                <p className="mb-5 text-xs leading-5 text-mikoko-muted">{wf.desc}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(wf.action)}
                    className="inline-flex min-h-9 flex-1 items-center justify-center rounded-lg border border-mikoko-cyan/40 bg-mikoko-cyan/10 px-3 py-2 text-xs font-semibold text-mikoko-cyan transition hover:border-mikoko-cyan hover:bg-mikoko-cyan/20"
                  >
                    Ejecutar
                  </button>
                  <button className="inline-flex min-h-9 items-center justify-center rounded-lg border border-mikoko-line bg-mikoko-panel2 px-3 py-2 text-xs text-mikoko-muted transition hover:text-white">
                    Info
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg border border-mikoko-line bg-mikoko-panel/95 p-5">
          <h2 className="text-sm font-semibold text-white">Consola de Sistema</h2>
          <p className="mt-1 text-xs text-mikoko-muted">Estado actual: {dbs ? `${dbs.bd2?.records?.length || 0} transacciones · ${dbs.bd1?.records?.length || 0} lotes · ${dbs.bd3?.records?.length || 0} activos` : "Desconectado"}</p>
          <div className="mt-4 flex gap-3">
            <button onClick={() => handleAction("reload")} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-mikoko-line bg-mikoko-panel2 px-4 py-2 text-xs text-mikoko-muted transition hover:text-white">
              <RefreshCw className="h-3.5 w-3.5" /> Recargar BD
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
