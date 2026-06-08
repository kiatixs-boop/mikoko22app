import { useState } from "react";
import {
  LayoutDashboard, GitPullRequest, BrainCircuit, BarChart3, Triangle, Database,
  ShieldCheck, Radio, ToggleLeft, ToggleRight, Crosshair
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
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "workflows", label: "Workflows", icon: GitPullRequest },
  { key: "execution", label: "Matriz Ejecución", icon: Crosshair },
  { key: "intelligence", label: "Inteligencia", icon: BrainCircuit },
  { key: "analysis", label: "Análisis", icon: BarChart3 },
  { key: "pyramid", label: "Pirámide", icon: Triangle },
  { key: "dataconsole", label: "Consola BD", icon: Database }
];

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const { checksum, isSimulation, toggleSimulationMode } = useMikokoContext();

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
    <div className="flex min-h-screen font-outfit text-mikoko-text">
      <div className="flex w-52 shrink-0 flex-col border-r-2 border-mikoko-line bg-mikoko-panel shadow-retro">
        <div className="flex h-14 items-center border-b-2 border-mikoko-line px-4">
          <span className="font-silkscreen text-xs tracking-wider text-mikoko-text">MIKOKO</span>
          <span className="ml-auto font-silkscreen text-[8px] text-mikoko-muted">v27</span>
        </div>
        <nav className="flex-1 space-y-1.5 px-3 py-4">
          {NAV_NODES.map((node) => {
            const Icon = node.icon;
            const active = activeView === node.key;
            return (
              <button
                key={node.key}
                onClick={() => setActiveView(node.key)}
                className={`flex w-full items-center gap-3 border-2 px-3 py-2.5 text-xs font-medium transition-all ${
                  active
                    ? "border-mikoko-line bg-mikoko-panel2 text-mikoko-text shadow-retro-inner"
                    : "border-transparent text-mikoko-muted hover:border-mikoko-line hover:bg-mikoko-panel2/50 hover:text-mikoko-text hover:shadow-retro"
                }`}
                title={node.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{node.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t-2 border-mikoko-line px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] text-mikoko-muted">
            <div className={`h-2.5 w-2.5 border-2 border-mikoko-line ${
              checksum?.verdict === "AUTHORIZED" ? "bg-mikoko-emerald" :
              checksum?.verdict === "CAUTION" ? "bg-mikoko-amber" : "bg-mikoko-crimson"
            }`} />
            <span className="truncate font-medium">{checksum?.verdict || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b-2 border-mikoko-line bg-[#A8C5B0] px-6 shadow-retro">
          <div className="flex items-center gap-4">
            <Radio className="h-4 w-4 text-mikoko-text" />
            <span className="font-silkscreen text-xs tracking-wider text-mikoko-text">
              MIKOKO v27.0
            </span>
            <span className="hidden text-xs tracking-wider text-mikoko-text/70 md:inline">// SECURE PROTOCOL</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-none border-2 border-mikoko-line bg-[#F5EDE0] px-3 py-1.5">
              <ShieldCheck className={`h-3.5 w-3.5 ${checksum?.verdict === "AUTHORIZED" ? "text-mikoko-emerald" : checksum?.verdict === "CAUTION" ? "text-mikoko-amber" : "text-mikoko-crimson"}`} />
              <span className={`font-outfit text-[10px] font-semibold uppercase tracking-wider ${checksum?.verdict === "AUTHORIZED" ? "text-mikoko-emerald" : checksum?.verdict === "CAUTION" ? "text-mikoko-amber" : "text-mikoko-crimson"}`}>
                {checksum?.verdict || "N/A"}
              </span>
            </div>

            <button
              onClick={toggleSimulationMode}
              className={`inline-flex min-h-8 items-center gap-2 rounded-none border-2 border-mikoko-line px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-all shadow-retro ${
                isSimulation
                  ? "bg-mikoko-gold/20 text-mikoko-text hover:bg-mikoko-gold/30"
                  : "bg-mikoko-crimson/15 text-mikoko-text hover:bg-mikoko-crimson/25"
              }`}
            >
              {isSimulation ? <ToggleLeft className="h-4 w-4" /> : <ToggleRight className="h-4 w-4" />}
              {isSimulation ? "SIMULACIÓN" : "LIVE"}
            </button>
          </div>
        </header>

        <ImmunologicalCockpit />

        <div className="flex-1 overflow-y-auto p-4">
          {renderView()}
        </div>
      </div>

      <PsychologicalFirewall />
    </div>
  );
}
