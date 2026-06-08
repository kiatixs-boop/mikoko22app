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
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "text-mikoko-cyan" },
  { key: "workflows", label: "Workflows", icon: GitPullRequest, color: "text-mikoko-emerald" },
  { key: "execution", label: "Matriz Ejecución", icon: Crosshair, color: "text-mikoko-crimson" },
  { key: "intelligence", label: "Inteligencia", icon: BrainCircuit, color: "text-mikoko-gold" },
  { key: "analysis", label: "Análisis", icon: BarChart3, color: "text-mikoko-cyan" },
  { key: "pyramid", label: "Pirámide", icon: Triangle, color: "text-mikoko-emerald" },
  { key: "dataconsole", label: "Consola BD", icon: Database, color: "text-mikoko-crimson" }
];

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { checksum, isSimulation, toggleSimulationMode } = useMikokoContext();

  function verdictColor(verdict) {
    if (verdict === "AUTHORIZED") return "bg-mikoko-emerald shadow-[0_0_0_1px_rgba(91,140,106,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]";
    if (verdict === "CAUTION") return "bg-mikoko-amber shadow-[0_0_0_1px_rgba(212,160,85,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]";
    return "bg-mikoko-crimson shadow-[0_0_0_1px_rgba(196,69,69,0.3),inset_0_1px_0_rgba(255,255,255,0.3)]";
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
    <div className="flex min-h-screen text-mikoko-text">
      <div className={`flex flex-col shadow-[inset_-1px_0_0_rgba(0,0,0,0.04)] bg-mikoko-panel transition-all duration-200 ${sidebarOpen ? "w-56" : "w-14"}`}>
        <div className="flex h-14 items-center border-b border-mikoko-line px-3 shadow-bevel-light">
          {sidebarOpen ? (
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-mikoko-cyan">MIKOKO</span>
              <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-mikoko-muted hover:text-mikoko-text">
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setSidebarOpen(true)} className="mx-auto rounded p-1 text-mikoko-muted hover:text-mikoko-text">
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
                    ? "bg-mikoko-panel2 shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)] text-mikoko-text"
                    : "text-mikoko-muted hover:bg-mikoko-panel2/60 hover:text-mikoko-text"
                }`}
                title={node.label}
              >
                <Icon className={`h-4 w-4 shrink-0 ${node.color}`} />
                {sidebarOpen && <span className="truncate font-medium">{node.label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-mikoko-line px-3 py-3">
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
        <header className="flex h-14 items-center justify-between border-b border-mikoko-line bg-mikoko-panel px-6 shadow-bevel-light">
          <div className="flex items-center gap-4">
            <Radio className="h-4 w-4 text-mikoko-crimson" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-mikoko-cyan">
              MIKOKO v27.0
            </span>
            <span className="hidden text-xs tracking-[0.2em] text-mikoko-muted md:inline">// SECURE PROTOCOL</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 shadow-panel bg-mikoko-panel2">
              <ShieldCheck className={`h-3.5 w-3.5 ${checksum?.verdict === "AUTHORIZED" ? "text-mikoko-emerald" : checksum?.verdict === "CAUTION" ? "text-mikoko-amber" : "text-mikoko-crimson"}`} />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${checksum?.verdict === "AUTHORIZED" ? "text-mikoko-emerald" : checksum?.verdict === "CAUTION" ? "text-mikoko-amber" : "text-mikoko-crimson"}`}>
                {checksum?.verdict || "N/A"}
              </span>
            </div>

            <button
              onClick={toggleSimulationMode}
              className={`inline-flex min-h-8 items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition shadow-button ${
                isSimulation
                  ? "border border-mikoko-gold/60 bg-mikoko-gold/10 text-mikoko-gold hover:bg-mikoko-gold/20"
                  : "border border-mikoko-crimson/60 bg-mikoko-crimson/10 text-mikoko-crimson hover:bg-mikoko-crimson/20"
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
