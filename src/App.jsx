import { useState } from "react";
import {
  LayoutDashboard, GitPullRequest, BrainCircuit, BarChart3, Triangle, Database,
  ChevronLeft, ChevronRight, ShieldCheck, Radio, ToggleLeft, ToggleRight, Crosshair
} from "lucide-react";
import { useMikokoContext } from "./hooks/useMikoko.jsx";
import DashboardView from "./components/DashboardView.jsx";
import WorkflowsView from "./components/WorkflowsView.jsx";
import IntelligenceAirlock from "./components/IntelligenceAirlock.jsx";
import AnalysisView from "./components/AnalysisView.jsx";
import PyramidView from "./components/PyramidView.jsx";
import DataConsoleView from "./components/DataConsoleView.jsx";
import UnifiedExecutionMatrix from "./components/UnifiedExecutionMatrix.jsx";
import ImmunologicalCockpit from "./components/ImmunologicalCockpit.jsx";
import PsychologicalFirewall from "./components/PsychologicalFirewall.jsx";

const NAV_NODES = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-mikoko-emerald" },
  { key: "workflows", label: "Workflows", icon: GitPullRequest, color: "text-mikoko-cyan" },
  { key: "execution", label: "Matriz Ejecución", icon: Crosshair, color: "text-mikoko-crimson" },
  { key: "intelligence", label: "Inteligencia", icon: BrainCircuit, color: "text-mikoko-gold" },
  { key: "analysis", label: "Análisis", icon: BarChart3, color: "text-blue-400" },
  { key: "pyramid", label: "Pirámide", icon: Triangle, color: "text-violet-400" },
  { key: "dataconsole", label: "Consola BD", icon: Database, color: "text-mikoko-crimson" }
];

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { checksum, isSimulation, toggleSimulationMode } = useMikokoContext();

  function verdictColor(verdict) {
    if (verdict === "AUTHORIZED") return "bg-mikoko-emerald shadow-[0_0_12px_rgba(0,200,150,0.5)]";
    if (verdict === "CAUTION") return "bg-mikoko-amber shadow-[0_0_12px_rgba(245,166,35,0.5)]";
    return "bg-mikoko-crimson shadow-[0_0_12px_rgba(255,59,92,0.5)]";
  }

  function renderView() {
    switch (activeView) {
      case "dashboard": return <DashboardView />;
      case "workflows": return <WorkflowsView />;
      case "execution": return <UnifiedExecutionMatrix />;
      case "intelligence": return <IntelligenceAirlock />;
      case "analysis": return <AnalysisView />;
      case "pyramid": return <PyramidView />;
      case "dataconsole": return <DataConsoleView />;
      default: return <DashboardView />;
    }
  }

  return (
    <div className="flex min-h-screen bg-mikoko-void text-mikoko-text">
      <div className={`flex flex-col border-r border-cyan-500/10 bg-mikoko-panel/80 backdrop-blur transition-all duration-200 ${sidebarOpen ? "w-56" : "w-14"}`}>
        <div className="flex h-14 items-center border-b border-cyan-500/10 px-3">
          {sidebarOpen ? (
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-mikoko-cyan">MIKOKO</span>
              <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-mikoko-muted hover:text-white">
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto rounded p-1 text-mikoko-muted hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {NAV_NODES.map((node) => {
            const Icon = node.icon;
            const active = activeView === node.key;
            return (
              <button
                key={node.key}
                onClick={() => setActiveView(node.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition-all ${
                  active
                    ? "bg-cyan-500/10 text-white shadow-[inset_0_0_0_1px_rgba(0,224,255,0.2)]"
                    : "text-mikoko-muted hover:bg-mikoko-panel2 hover:text-white"
                }`}
                title={node.label}
              >
                <Icon className={`h-4 w-4 shrink-0 ${node.color}`} />
                {sidebarOpen && <span className="truncate">{node.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-cyan-500/10 px-3 py-3">
          {sidebarOpen ? (
            <div className="flex items-center gap-2 text-[10px] text-mikoko-muted">
              <div className={`h-2 w-2 rounded-full ${verdictColor(checksum?.verdict)}`} />
              <span className="truncate">{checksum?.verdict || "N/A"}</span>
            </div>
          ) : (
            <div className={`mx-auto h-2 w-2 rounded-full ${verdictColor(checksum?.verdict)}`} />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-cyan-500/10 bg-mikoko-panel/80 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <Radio className="h-4 w-4 text-mikoko-crimson" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-mikoko-cyan">
              MIKOKO v27.0
            </span>
            <span className="hidden text-xs tracking-[0.2em] text-mikoko-muted md:inline">// SECURE PROTOCOL</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-mikoko-line bg-mikoko-panel2 px-3 py-1.5">
              <ShieldCheck className={`h-3.5 w-3.5 ${checksum?.verdict === "AUTHORIZED" ? "text-mikoko-emerald" : checksum?.verdict === "CAUTION" ? "text-mikoko-amber" : "text-mikoko-crimson"}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${checksum?.verdict === "AUTHORIZED" ? "text-mikoko-emerald" : checksum?.verdict === "CAUTION" ? "text-mikoko-amber" : "text-mikoko-crimson"}`}>
                {checksum?.verdict || "N/A"}
              </span>
            </div>

            <button
              onClick={toggleSimulationMode}
              className={`inline-flex min-h-8 items-center gap-2 rounded-lg border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition ${
                isSimulation
                  ? "border-mikoko-gold/50 bg-mikoko-gold/15 text-mikoko-gold hover:bg-mikoko-gold/25"
                  : "border-mikoko-crimson/50 bg-mikoko-crimson/15 text-mikoko-crimson hover:bg-mikoko-crimson/25"
              }`}
            >
              {isSimulation ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
              {isSimulation ? "SIMULACIÓN" : "LIVE"}
            </button>
          </div>
        </header>

        <ImmunologicalCockpit />

        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
      </div>

      <PsychologicalFirewall />
    </div>
  );
}
