import { useState, useEffect, useCallback } from "react";
import { Brain, Moon, AlertTriangle, Waves, Zap, Shield, PenLine, X } from "lucide-react";
import { useMikokoContext } from "../hooks/useMikoko.jsx";

const SLIDERS = [
  { key: "sleep", label: "Sueño", icon: Moon, low: "Insomnio", high: "Descansado", color: "accent-purple-500" },
  { key: "stress", label: "Estrés", icon: Waves, low: "Zen", high: "Pánico", color: "accent-mikoko-crimson" },
  { key: "fomo", label: "FOMO", icon: Zap, low: "Indiferente", high: "Ansiedad", color: "accent-orange-500" },
  { key: "confidence", label: "Confianza", icon: Shield, low: "Inseguro", high: "Invencible", color: "accent-mikoko-emerald" }
];

function sliderColor(key, value) {
  if (key === "sleep") return value <= 3 ? "bg-purple-700" : value <= 6 ? "bg-purple-500" : "bg-purple-400";
  if (key === "stress") return value <= 3 ? "bg-mikoko-emerald" : value <= 6 ? "bg-mikoko-amber" : "bg-mikoko-crimson";
  if (key === "fomo") return value <= 3 ? "bg-mikoko-emerald" : value <= 6 ? "bg-mikoko-amber" : "bg-orange-500";
  if (key === "confidence") return value <= 3 ? "bg-mikoko-crimson" : value <= 6 ? "bg-mikoko-amber" : "bg-mikoko-emerald";
  return "bg-mikoko-cyan";
}

export default function PsychologicalFirewall() {
  const { addOperatorState, addDiaryEntry, getTodayCheckin, getLatestOperatorState, dbs } = useMikokoContext();
  const [open, setOpen] = useState(false);
  const [hazardActive, setHazardActive] = useState(false);
  const [values, setValues] = useState({ sleep: 7, stress: 3, fomo: 3, confidence: 7 });
  const [diaryText, setDiaryText] = useState("");

  useEffect(() => {
    if (!dbs) return;
    const today = getTodayCheckin();
    if (!today) {
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
    if (today.alertaActiva) setHazardActive(true);
  }, [dbs, getTodayCheckin]);

  useEffect(() => {
    const latest = getLatestOperatorState();
    if (latest && latest.alertaActiva) setHazardActive(true);
  }, [dbs, getLatestOperatorState]);

  const handleSubmit = useCallback(async () => {
    const state = await addOperatorState(values);
    if (diaryText.trim()) {
      await addDiaryEntry({
        contenido: diaryText.trim(),
        estadoAnimo: values.stress > 7 ? "ANSIEDAD" : values.confidence >= 7 ? "POSITIVO" : "NEUTRAL",
        operatorStateId: state?.internalId || null
      });
    }
    if (values.stress > 8) setHazardActive(true);
    setOpen(false);
  }, [values, diaryText, addOperatorState, addDiaryEntry]);

  const hazard = getLatestOperatorState();
  const stressLevel = hazard?.stress || 0;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-xl border border-mikoko-cyan/30 bg-mikoko-panel shadow-[0_0_60px_rgba(0,224,255,0.1)]">
            <div className="border-b border-mikoko-line px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-mikoko-cyan/40 bg-mikoko-cyan/10 text-mikoko-cyan">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Check-In Psicológico</h2>
                    <p className="text-xs text-mikoko-muted">Protocolo Fuego Amigo — Evalúa tu estado antes de operar</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 text-mikoko-muted transition hover:bg-mikoko-panel2 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-5">
              {SLIDERS.map((s) => {
                const val = values[s.key];
                const Icon = s.icon;
                return (
                  <div key={s.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-mikoko-muted" />
                        <span className="text-sm font-medium text-white">{s.label}</span>
                      </div>
                      <span className="min-w-[3rem] rounded-md border border-mikoko-line bg-mikoko-panel2 px-2 py-0.5 text-center font-mono text-xs text-mikoko-cyan">
                        {val}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-20 text-right text-[10px] text-mikoko-muted">{s.low}</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={val}
                        onChange={(e) => setValues({ ...values, [s.key]: Number(e.target.value) })}
                        className="w-full"
                      />
                      <span className="w-20 text-[10px] text-mikoko-muted">{s.high}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-mikoko-line">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${sliderColor(s.key, val)}`}
                        style={{ width: `${(val / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
                  <PenLine className="h-4 w-4 text-mikoko-muted" />
                  Nota rápida del día
                </label>
                <textarea
                  value={diaryText}
                  onChange={(e) => setDiaryText(e.target.value)}
                  placeholder="¿Cómo te sientes hoy? Escribe lo que necesites..."
                  className="field min-h-[80px] w-full resize-none text-sm"
                  rows={3}
                />
              </div>
            </div>

            <div className="border-t border-mikoko-line px-6 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[10px] leading-4 text-mikoko-muted">
                  Los datos son confidenciales y solo visibles para ti. El sistema no bloqueará operaciones basado en tu estado.
                </p>
                <button
                  onClick={handleSubmit}
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-mikoko-cyan/50 bg-mikoko-cyan/15 px-5 py-2 text-sm font-semibold text-mikoko-cyan transition hover:border-mikoko-cyan hover:bg-mikoko-cyan/25"
                >
                  <Shield className="h-4 w-4" />
                  Confirmar Estado
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {hazardActive && stressLevel > 8 && (
        <div className="pointer-events-none fixed inset-x-0 top-14 z-50 flex justify-center">
          <div className="pointer-events-auto animate-pulse rounded-b-lg border-x border-b border-mikoko-crimson/50 bg-mikoko-crimson/20 px-6 py-2 backdrop-blur-md">
            <div className="flex items-center gap-3 text-sm">
              <AlertTriangle className="h-4 w-4 text-mikoko-crimson" />
              <span className="font-semibold text-mikoko-crimson">
                ALERTA PSICOLÓGICA — Estrés: {stressLevel}/10
              </span>
              <span className="text-xs text-mikoko-muted">
                | Modo: SOLO VISUAL · No se bloquean operaciones
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
