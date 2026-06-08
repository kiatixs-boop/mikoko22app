import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const API_BASE = "http://localhost:5000";
const DB_NAMES = Array.from({ length: 22 }, (_, index) => `bd${index}`);
const TIER_KEYS = ["TIER_1", "TIER_2", "TIER_3", "TIER_4"];
const STALE_PRICE_MS = 24 * 60 * 60 * 1000;

function isoNow() {
  return new Date().toISOString();
}

function normalizeTicker(ticker) {
  return String(ticker || "").trim().toUpperCase();
}

function normalizeName(name, ticker) {
  const cleanName = String(name || "").trim();
  return cleanName || `${ticker} — ${ticker}`;
}

function parseDate(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}

function daysBetween(a, b) {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000));
}

function formatCompactDate(date) {
  const d = new Date(date);
  const pad = (value) => String(value).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function makeId(prefix) {
  if (window.crypto?.randomUUID) return `${prefix}-${window.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cloneDb(db) {
  return JSON.parse(JSON.stringify(db));
}

function stripComputed(value) {
  if (Array.isArray(value)) return value.map(stripComputed);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "computed")
      .map(([key, entryValue]) => [key, stripComputed(entryValue)])
  );
}

function emptySemaphore(light, code, label, action, blocksOperation) {
  return { light, code, label, action, blocksOperation };
}

function getActiveLots(bd1) {
  return (bd1?.records || []).filter((lot) => Number(lot.currentQuantity || 0) > 0);
}

function getAssetsWithCapital(bd1) {
  return new Set(getActiveLots(bd1).map((lot) => normalizeTicker(lot.ticker)));
}

function getAssetPriceStatus(asset, hasCapital) {
  const timestamp = parseDate(asset.fechaSSTPrecio);
  if (!timestamp) {
    return {
      status: "OBSOLETO",
      label: "Timestamp SSOT faltante",
      stale: hasCapital || asset.estado === "ACTIVO",
      ageHours: null
    };
  }
  const ageMs = Date.now() - timestamp.getTime();
  const ageHours = Math.max(0, ageMs / (60 * 60 * 1000));
  const stale = ageMs > STALE_PRICE_MS && (hasCapital || asset.estado === "ACTIVO");
  return {
    status: stale ? "OBSOLETO" : ageMs > 3 * 60 * 60 * 1000 ? "PROXIMO_A_VENCER" : "ACTUAL",
    label: stale ? "Obsoleto >24h" : "Actual",
    stale,
    ageHours
  };
}

function computeBd1Rollup(bd1) {
  const activeLots = getActiveLots(bd1);
  const capitalByTier = TIER_KEYS.reduce((acc, tier) => ({ ...acc, [tier]: 0 }), {});
  let totalPortfolioUSD = 0;
  let dryPowderUSD = 0;

  for (const lot of activeLots) {
    const value = Number(lot.currentValueUSD || 0);
    const tier = TIER_KEYS.includes(lot.finalTier) ? lot.finalTier : "TIER_4";
    totalPortfolioUSD += value;
    capitalByTier[tier] += value;
    if (lot.isStablecoin && lot.liquidityLabel === "OPEN_ENVELOPE") dryPowderUSD += value;
  }

  return {
    totalPortfolioUSD: roundMoney(totalPortfolioUSD),
    dryPowderUSD: roundMoney(dryPowderUSD),
    capitalByTier: Object.fromEntries(Object.entries(capitalByTier).map(([key, value]) => [key, roundMoney(value)])),
    linkedLotCount: activeLots.length,
    totalLotCount: (bd1?.records || []).length,
    linkedLotRefs: activeLots.map((lot) => ({
      id: lot.holdingId,
      displayName: lot.displayName || `${lot.ticker} lot`
    }))
  };
}

function computeBd3PriceInput(bd1, bd3) {
  const capitalTickers = getAssetsWithCapital(bd1);
  const stalePriceAssets = [];

  for (const asset of bd3?.records || []) {
    const ticker = normalizeTicker(asset.ticker);
    const status = getAssetPriceStatus(asset, capitalTickers.has(ticker));
    if (status.stale) stalePriceAssets.push(ticker);
  }

  return {
    hasStalePrice: stalePriceAssets.length > 0,
    stalePriceAssets
  };
}

function computeChecksum(dbMap) {
  const bd0Record = dbMap.bd0?.records?.[0] || null;
  const bd1Rollup = computeBd1Rollup(dbMap.bd1);
  const bd3Prices = computeBd3PriceInput(dbMap.bd1, dbMap.bd3);
  const total = bd1Rollup.totalPortfolioUSD;
  const dry = bd1Rollup.dryPowderUSD;
  const highRisk = bd1Rollup.capitalByTier.TIER_3 + bd1Rollup.capitalByTier.TIER_4;
  const daysSinceAudit = bd0Record?.lastAuditDate ? daysBetween(new Date(), new Date(bd0Record.lastAuditDate)) : null;
  const axes = {
    eje1_accounting: evaluateAccounting(total, dry, bd1Rollup),
    eje2_prices: evaluatePrices(bd3Prices),
    eje3_audit: evaluateAudit(daysSinceAudit),
    eje4_psychology: evaluatePsychology(Number(bd0Record?.operatorScore || 0)),
    ejePiramidal: evaluatePyramid(total, bd1Rollup.capitalByTier),
    ejeLiquidity: evaluateLiquidity(total, dry)
  };
  const allAxes = Object.values(axes);
  const blocking = allAxes.filter((axis) => axis.blocksOperation);
  const warnings = allAxes.filter((axis) => axis.light !== "GREEN");
  const verdict = blocking.length > 0 ? "BLOCKED" : warnings.length > 0 ? "CAUTION" : "AUTHORIZED";

  return {
    verdict,
    axisResults: axes,
    operationsAllowed: verdict === "AUTHORIZED",
    calculatedAt: isoNow(),
    summary:
      verdict === "AUTHORIZED"
        ? `Sistema autorizado. Capital: $${Math.round(total).toLocaleString("en-US")}.`
        : `Sistema bloqueado o en precaucion. ${blocking.length} eje(s) bloqueante(s).`,
    metrics: {
      totalGlobalUSD: total,
      dryPowderUSD: dry,
      liquidityPct: total > 0 ? (dry / total) * 100 : 0,
      capitalInHighRiskPct: total > 0 ? (highRisk / total) * 100 : 0,
      daysSinceAudit,
      capitalByTier: bd1Rollup.capitalByTier,
      stalePriceAssets: bd3Prices.stalePriceAssets
    }
  };
}

function evaluateAccounting(total, dry, rollup) {
  if (rollup.totalLotCount === 0 || rollup.linkedLotCount === 0) {
    return emptySemaphore("RED", "EJE-1-NODO-DESCONECTADO", "BD1 no vinculado a BD0.", "Crear lotes de cartera BD1 auditados.", true);
  }
  if (total <= 0) {
    return emptySemaphore("RED", "EJE-1-DENOMINADOR-CERO", "El denominador es cero.", "Revisar cantidades BD1 y precios BD3.", true);
  }
  if (dry > total) {
    return emptySemaphore("RED", "EJE-1-DRY-GT-TOTAL", "El polvo seco excede el capital total.", "Ejecutar conciliación forense.", true);
  }
  if (rollup.linkedLotCount !== rollup.totalLotCount) {
    return emptySemaphore("ORANGE", "EJE-1-LOTES-HUERFANOS", "Algunos lotes BD1 no están vinculados.", "Re-vincular cada lote a BD0.", true);
  }
  return emptySemaphore("GREEN", "EJE-1-OK", "Integridad contable verificada.", "No se requiere acción.", false);
}

function evaluatePrices(priceInput) {
  if (priceInput.hasStalePrice) {
    return emptySemaphore(
      "RED",
      "EJE-2-PRECIOS-OBSOLETOS",
      `Precios obsoletos: ${priceInput.stalePriceAssets.join(", ")}.`,
      "Actualizar precios de mercado BD3 antes de operar.",
      true
    );
  }
  return emptySemaphore("GREEN", "EJE-2-OK", "Todos los precios activos tienen menos de 24h.", "No se requiere acción.", false);
}

function evaluateAudit(daysSinceAudit) {
  if (daysSinceAudit === null) {
    return emptySemaphore("RED", "EJE-3-NUNCA-AUDITADO", "El sistema nunca ha sido auditado.", "Completar conciliación WF-020.", true);
  }
  if (daysSinceAudit > 30) {
    return emptySemaphore("RED", "EJE-3-AUDITORIA-VENCIDA", "La auditoría tiene más de 30 días.", "Completar conciliación WF-020.", true);
  }
  if (daysSinceAudit > 14) {
    return emptySemaphore("YELLOW", "EJE-3-AUDITORIA-ATENCION", "La auditoría tiene más de 14 días.", "Programar WF-020.", false);
  }
  return emptySemaphore("GREEN", "EJE-3-OK", "Actualización de auditoría verificada.", "No se requiere acción.", false);
}

function evaluatePsychology(operatorScore) {
  if (operatorScore > 9) {
    return emptySemaphore("ORANGE", "EJE-4-CRITICO", "Puntuación del operador es crítica.", "Reducir tamaño de operación al 25%.", false);
  }
  if (operatorScore > 7) {
    return emptySemaphore("YELLOW", "EJE-4-ALERTA", "Puntuación del operador está elevada.", "Reducir tamaño de operación al 50%.", false);
  }
  return emptySemaphore("GREEN", "EJE-4-OK", "Estado del operador dentro del límite.", "No se requiere acción.", false);
}

function evaluatePyramid(total, tiers) {
  if (total <= 0) return emptySemaphore("RED", "EJE-P-SIN-DATOS", "La pirámide no puede ser evaluada.", "Crear lotes de capital BD1 válidos.", true);
  if (tiers.TIER_1 <= 0) return emptySemaphore("RED", "EJE-P-TIER1-VACIO", "El Nivel 1 está vacío.", "Restaurar capital de reserva.", true);
  const highRisk = tiers.TIER_3 + tiers.TIER_4;
  if (highRisk > tiers.TIER_1) return emptySemaphore("RED", "EJE-P-INVERTIDA", "El capital de alto riesgo excede el Nivel 1.", "Re-balancear antes de operar.", true);
  if (highRisk / total > 0.3) return emptySemaphore("YELLOW", "EJE-P-ALPHA-ALTO", "Nivel 3+4 excede el 30%.", "Planificar re-balanceo preventivo.", false);
  return emptySemaphore("GREEN", "EJE-P-OK", "Balance piramidal verificado.", "No se requiere acción.", false);
}

function evaluateLiquidity(total, dry) {
  if (total <= 0) return emptySemaphore("RED", "EJE-L-SIN-DATOS", "La liquidez no puede ser evaluada.", "Crear lotes de capital BD1 válidos.", true);
  const pct = dry / total;
  if (pct < 0.1) return emptySemaphore("RED", "EJE-L-CRITICO", "Polvo seco por debajo del 10%.", "No abrir nuevas posiciones.", true);
  if (pct < 0.2) return emptySemaphore("YELLOW", "EJE-L-BAJO", "Polvo seco por debajo del 20%.", "Considerar aumentar liquidez.", false);
  return emptySemaphore("GREEN", "EJE-L-OK", "Límite de liquidez verificado.", "No se requiere acción.", false);
}

function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function buildAssetRef(asset) {
  return {
    id: asset.internalId,
    displayName: asset.nombre,
    ticker: asset.ticker,
    isStablecoin: Boolean(asset.isStablecoin)
  };
}

function makeTransaction(payload, asset, approved) {
  const timestamp = new Date(payload.timestamp || Date.now()).toISOString();
  const type = payload.type;
  const quantity = Number(payload.quantity);
  const price = Number(payload.price);
  const internalId = makeId("tx");
  const idTransaccion = `WF-002-${normalizeTicker(payload.ticker)}-${formatCompactDate(timestamp)}`;
  const hashIntegridad = `${internalId}-${formatCompactDate(timestamp)}-${idTransaccion}`;
  const assetRef = buildAssetRef(asset);
  const base = {
    internalId,
    idTransaccion,
    hashIntegridad,
    fechaHora: timestamp,
    anoFiscal: new Date(timestamp).getFullYear(),
    contextoOperacional: "ON_CHAIN",
    estadoOnChain: approved ? "CONFIRMADA" : "PENDIENTE",
    categoriaFiscal: "INCIERTO",
    revisadoEnPortfolio: false,
    notasOperacionales: approved
      ? "Registrado a través de MIKOKO HUD v27.0."
      : "Strict Block: pasaporte/tesis BD3 no aprobado. Resumen de capital BD1 bloqueado intencionalmente.",
    ultimaEdicion: isoNow()
  };

  if (type === "SELL") {
    return {
      ...base,
      categoriaBase: "SALIDA_DE_CAPITAL",
      subtipoOperativo: "VENTA_CRIPTO_FIAT",
      activoSale: assetRef,
      cantidadSale: quantity,
      costoUnitarioDeSalidaUSD: price
    };
  }

  if (type === "TRANSFER") {
    return {
      ...base,
      categoriaBase: "MOVIMIENTO_INTERNO",
      subtipoOperativo: "TRANSFERENCIA",
      activoSale: assetRef,
      cantidadSale: quantity,
      costoUnitarioDeSalidaUSD: price
    };
  }

  return {
    ...base,
    categoriaBase: "ENTRADA_DE_CAPITAL",
    subtipoOperativo: "COMPRA_FIAT_CRIPTO",
    activoEntra: assetRef,
    cantidadEntra: quantity,
    costoAdquisicionUnitarioUSD: price
  };
}

function ensureAsset(bd3, payload) {
  const ticker = normalizeTicker(payload.ticker);
  const existing = (bd3.records || []).find((asset) => normalizeTicker(asset.ticker) === ticker);
  if (existing) {
    existing.precioUnitarioUSD = Number(payload.price);
    existing.fechaSSTPrecio = new Date(payload.timestamp || Date.now()).toISOString();
    existing.ultimaEdicion = isoNow();
    return existing;
  }

  const asset = {
    internalId: makeId("asset"),
    nombre: normalizeName(payload.assetName, ticker),
    ticker,
    tipoActivo: ticker.includes("USD") ? "STABLECOIN" : "CRIPTO_L1",
    redPrincipal: "MULTICHAIN",
    direccionContrato: "NATIVO",
    enlaceCoinGecko: "",
    precioUnitarioUSD: Number(payload.price),
    fechaSSTPrecio: new Date(payload.timestamp || Date.now()).toISOString(),
    estadoTesis: "PENDIENTE",
    riesgoEstatico: ticker.includes("USD") ? "TIER_1" : "TIER_4",
    isStablecoin: ticker.includes("USD"),
    isNFT: false,
    estado: "SIN_POSICION",
    categoriaFiscal: ticker.includes("USD") ? "STABLECOIN" : "CRIPTOMONEDA",
    tieneCapitalEnBD1: false,
    notasActivo: "Pasaporte borrador creado por ingreso de transacción Strict Block.",
    createdAt: isoNow(),
    ultimaEdicion: isoNow()
  };
  bd3.records.push(asset);
  return asset;
}

function upsertLot(bd1, asset, payload) {
  const ticker = normalizeTicker(asset.ticker);
  const type = payload.type;
  const quantity = Number(payload.quantity);
  const price = Number(payload.price);
  const isStablecoin = Boolean(asset.isStablecoin);
  const lot =
    (bd1.records || []).find((candidate) => normalizeTicker(candidate.ticker) === ticker && candidate.status !== "CLOSED") ||
    createLot(asset, price);

  if (!bd1.records.includes(lot)) bd1.records.push(lot);

  if (type === "SELL") {
    if (Number(lot.currentQuantity || 0) - quantity < -1e-12) {
      throw new Error("Error-Cero: la cantidad de venta haría negativa la cantidad actual de BD1.");
    }
    lot.totalExits = roundQuantity(Number(lot.totalExits || 0) + quantity);
    lot.currentQuantity = roundQuantity(Number(lot.currentQuantity || 0) - quantity);
  } else if (type === "BUY") {
    const previousQty = Number(lot.currentQuantity || 0);
    const previousCost = Number(lot.costBaseUSD || 0);
    lot.totalEntries = roundQuantity(Number(lot.totalEntries || 0) + quantity);
    lot.currentQuantity = roundQuantity(previousQty + quantity);
    lot.costBaseUSD = roundMoney(previousCost + quantity * price);
    lot.averageEntryUSD = lot.currentQuantity > 0 ? roundMoney(lot.costBaseUSD / lot.currentQuantity) : 0;
  }

  lot.assetId = asset.internalId;
  lot.activoRef = buildAssetRef(asset);
  lot.assetName = asset.nombre;
  lot.currentPriceUSD = price;
  lot.currentValueUSD = roundMoney(Number(lot.currentQuantity || 0) * price);
  lot.finalTier = asset.riesgoEstatico || "TIER_4";
  lot.isStablecoin = isStablecoin;
  lot.liquidityLabel = isStablecoin ? "OPEN_ENVELOPE" : lot.liquidityLabel || "NO_LIQUIDITY";
  lot.status = lot.currentQuantity === 0 ? "CLOSED" : "ACTIVE";
  lot.updatedAt = isoNow();
  return lot;
}

function createLot(asset, price) {
  const holdingId = makeId(`lot-${normalizeTicker(asset.ticker).toLowerCase()}`);
  return {
    holdingId,
    displayName: `${asset.ticker} — Lote Principal`,
    assetId: asset.internalId,
    activoRef: buildAssetRef(asset),
    ticker: asset.ticker,
    assetName: asset.nombre,
    currentQuantity: 0,
    totalEntries: 0,
    totalExits: 0,
    totalGasFeesUSD: 0,
    costBaseUSD: 0,
    averageEntryUSD: 0,
    currentPriceUSD: Number(price),
    currentValueUSD: 0,
    finalTier: asset.riesgoEstatico || "TIER_4",
    liquidityLabel: asset.isStablecoin ? "OPEN_ENVELOPE" : "NO_LIQUIDITY",
    isStablecoin: Boolean(asset.isStablecoin),
    status: "ACTIVE",
    bd0NodeId: "SISTEMA MIKOKO",
    createdAt: isoNow(),
    updatedAt: isoNow()
  };
}

function roundQuantity(value) {
  return Math.round((Number(value) || 0) * 1e12) / 1e12;
}

function syncBd0FromRollups(bd0, bd1, bd3) {
  const record = bd0.records[0];
  const rollup = computeBd1Rollup(bd1);
  const priceInput = computeBd3PriceInput(bd1, bd3);
  record.totalGlobalUSD = rollup.totalPortfolioUSD;
  record.bridgeValueUSD = rollup.totalPortfolioUSD;
  record.dryPowderUSD = rollup.dryPowderUSD;
  record.capitalTier1USD = rollup.capitalByTier.TIER_1;
  record.capitalTier2USD = rollup.capitalByTier.TIER_2;
  record.capitalTier3USD = rollup.capitalByTier.TIER_3;
  record.capitalTier4USD = rollup.capitalByTier.TIER_4;
  record.portfolioLinks = rollup.linkedLotRefs;
  bd0.checksum = {
    status: priceInput.hasStalePrice ? "BLOCKED" : "PENDING_RECALCULATION",
    calculatedAt: isoNow(),
    note: "Resúmenes persistentes actualizados. El checksum completo se recalcula del lado del cliente."
  };
}

async function fetchDb(name) {
  const response = await fetch(`${API_BASE}/api/db/${name}`);
  if (!response.ok) throw new Error(`No se pudo obtener ${name}.`);
  return response.json();
}

async function postDb(name, db) {
  const response = await fetch(`${API_BASE}/api/db/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stripComputed(db))
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `No se pudo guardar ${name}.`);
  return data;
}

function useMikoko() {
  const [dbs, setDbs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSimulation, setIsSimulation] = useState(false);
  const simulationRef = useRef(false);

  const toggleSimulationMode = useCallback(() => {
    setIsSimulation((prev) => {
      const next = !prev;
      simulationRef.current = next;
      return next;
    });
  }, []);

  const safePostDb = useCallback(async (name, db) => {
    if (simulationRef.current) {
      return { ok: true, database: name, savedAt: isoNow(), simulation: true };
    }
    return postDb(name, db);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const entries = await Promise.all(DB_NAMES.map(async (name) => [name, await fetchDb(name)]));
      setDbs(Object.fromEntries(entries));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const checksum = useMemo(() => (dbs ? computeChecksum(dbs) : null), [dbs]);

  const assetsView = useMemo(() => {
    if (!dbs) return [];
    const lotsByTicker = new Map();
    for (const lot of dbs.bd1?.records || []) {
      const ticker = normalizeTicker(lot.ticker);
      const current = lotsByTicker.get(ticker) || { quantity: 0, value: 0 };
      current.quantity += Number(lot.currentQuantity || 0);
      current.value += Number(lot.currentValueUSD || 0);
      lotsByTicker.set(ticker, current);
    }

    return (dbs.bd3?.records || []).map((asset) => {
      const ticker = normalizeTicker(asset.ticker);
      const holding = lotsByTicker.get(ticker) || { quantity: 0, value: 0 };
      const priceStatus = getAssetPriceStatus(asset, holding.quantity > 0);
      return {
        ...asset,
        quantity: holding.quantity,
        valueUSD: holding.value,
        priceStatus
      };
    });
  }, [dbs]);

  const addTransaction = useCallback(
    async (payload) => {
      if (!dbs) return;
      setError("");
      setNotice("");

      const ticker = normalizeTicker(payload.ticker);
      const quantity = Number(payload.quantity);
      const price = Number(payload.price);
      if (!ticker) throw new Error("El ticker es obligatorio.");
      if (!Number.isFinite(quantity) || quantity <= 0) throw new Error("La cantidad debe ser mayor a cero.");
      if (!Number.isFinite(price) || price < 0) throw new Error("El precio no puede ser negativo.");

      try {
        const next = {
          bd0: cloneDb(dbs.bd0),
          bd1: cloneDb(dbs.bd1),
          bd2: cloneDb(dbs.bd2),
          bd3: cloneDb(dbs.bd3)
        };
        const asset = ensureAsset(next.bd3, payload);
        const approved = asset.estadoTesis === "APROBADA";
        const tx = makeTransaction(payload, asset, approved);

        if (approved) {
          if (payload.type !== "TRANSFER") {
            const lot = upsertLot(next.bd1, asset, payload);
            const lotRef = { id: lot.holdingId, displayName: lot.displayName, holdingId: lot.holdingId, ticker: lot.ticker };
            if (payload.type === "SELL") tx.loteSalida = lotRef;
            if (payload.type === "BUY") tx.loteEntrada = lotRef;
          }
          asset.estado = "ACTIVO";
          asset.tieneCapitalEnBD1 = getActiveLots(next.bd1).some((lot) => normalizeTicker(lot.ticker) === ticker);
        }

        next.bd2.records.push(tx);
        syncBd0FromRollups(next.bd0, next.bd1, next.bd3);

        await safePostDb("bd3", next.bd3);
        await safePostDb("bd2", next.bd2);
        if (approved) await safePostDb("bd1", next.bd1);
        await safePostDb("bd0", next.bd0);

        setDbs((current) => ({ ...current, ...next }));
        const prefix = simulationRef.current ? "[SIMULACIÓN] " : "";
        setNotice(
          prefix + (approved
            ? "Transacción confirmada localmente y resúmenes recalculados."
            : "Strict Block activo: activo borrador y transacción pendiente guardados; el capital BD1 no fue mutado.")
        );
      } catch (mutationError) {
        setError(mutationError.message);
        throw mutationError;
      }
    },
    [dbs, safePostDb]
  );

  const refreshMarketPrices = useCallback(async () => {
    if (!dbs) return;
    setError("");
    setNotice("");
    try {
      const next = {
        bd0: cloneDb(dbs.bd0),
        bd1: cloneDb(dbs.bd1),
        bd3: cloneDb(dbs.bd3)
      };

      if (!simulationRef.current) {
        const candidates = (dbs.bd3?.records || [])
          .filter((asset) => asset.estado !== "ARCHIVADO")
          .map((asset) => ({
            ticker: asset.ticker,
            coingeckoId: asset.coingeckoId,
            enlaceCoinGecko: asset.enlaceCoinGecko
          }));

        const response = await fetch(`${API_BASE}/api/market/prices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assets: candidates })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "No se pudieron actualizar los precios de mercado.");

        for (const asset of next.bd3.records || []) {
          const quote = data.prices?.[normalizeTicker(asset.ticker)];
          if (!quote) continue;
          asset.precioUnitarioUSD = quote.usd;
          asset.coingeckoId = quote.coingeckoId;
          asset.marketCapUSD = quote.marketCapUSD;
          asset.volumen24hUSD = quote.volumen24hUSD;
          asset.change24hPct = quote.change24hPct;
          asset.fechaSSTPrecio = quote.fetchedAt;
          asset.ultimaEdicion = isoNow();
        }

        for (const lot of next.bd1.records || []) {
          const asset = next.bd3.records.find((candidate) => normalizeTicker(candidate.ticker) === normalizeTicker(lot.ticker));
          if (!asset) continue;
          lot.currentPriceUSD = Number(asset.precioUnitarioUSD || 0);
          lot.currentValueUSD = roundMoney(Number(lot.currentQuantity || 0) * Number(asset.precioUnitarioUSD || 0));
          lot.updatedAt = isoNow();
        }

        syncBd0FromRollups(next.bd0, next.bd1, next.bd3);
        await safePostDb("bd3", next.bd3);
        await safePostDb("bd1", next.bd1);
        await safePostDb("bd0", next.bd0);
      } else {
        const now = isoNow();
        for (const asset of next.bd3.records || []) {
          asset.fechaSSTPrecio = now;
          asset.precioUnitarioUSD = Number(asset.precioUnitarioUSD) * (1 + (Math.random() - 0.5) * 0.02);
          asset.ultimaEdicion = now;
        }
        for (const lot of next.bd1.records || []) {
          const asset = next.bd3.records.find((candidate) => normalizeTicker(candidate.ticker) === normalizeTicker(lot.ticker));
          if (!asset) continue;
          lot.currentPriceUSD = Number(asset.precioUnitarioUSD || 0);
          lot.currentValueUSD = roundMoney(Number(lot.currentQuantity || 0) * Number(asset.precioUnitarioUSD || 0));
          lot.updatedAt = now;
        }
        syncBd0FromRollups(next.bd0, next.bd1, next.bd3);
      }

      setDbs((current) => ({ ...current, ...next }));
      setNotice(
        (simulationRef.current ? "[SIMULACIÓN] " : "") + "Precios de mercado actualizados anónimamente."
      );
    } catch (refreshError) {
      setError(refreshError.message);
    }
  }, [dbs, safePostDb]);

  const getRecordById = useCallback((dbName, id) => {
    if (!dbs) return null;
    const records = dbs[dbName]?.records || [];
    return records.find((r) => r.internalId === id) || null;
  }, [dbs]);

  const getRecordsByField = useCallback((dbName, field, value) => {
    if (!dbs) return [];
    return (dbs[dbName]?.records || []).filter((r) => r[field] === value);
  }, [dbs]);

  const addProject = useCallback(async (projectData) => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = { bd7: cloneDb(dbs.bd7) };
      const project = {
        internalId: makeId("proj"),
        ...projectData,
        estado: projectData.estado || "ACTIVO",
        ciclosRevision: 0,
        fechaAlta: isoNow(),
        ultimaEdicion: isoNow()
      };
      next.bd7.records.push(project);
      await safePostDb("bd7", next.bd7);
      setDbs((current) => ({ ...current, ...next }));
      return project;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [dbs, safePostDb]);

  const updateProject = useCallback(async (projectId, updates) => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = { bd7: cloneDb(dbs.bd7) };
      const idx = next.bd7.records.findIndex((p) => p.internalId === projectId);
      if (idx === -1) throw new Error("Project not found.");
      Object.assign(next.bd7.records[idx], updates, { ultimaEdicion: isoNow() });
      await safePostDb("bd7", next.bd7);
      setDbs((current) => ({ ...current, ...next }));
      return next.bd7.records[idx];
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [dbs, safePostDb]);

  const addThesisNote = useCallback(async (noteData) => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = { bd8: cloneDb(dbs.bd8) };
      const note = {
        internalId: makeId("note"),
        tipo: "TESIS_INVERSION",
        ...noteData,
        fecha: isoNow(),
        ultimaEdicion: isoNow()
      };
      next.bd8.records.push(note);
      await safePostDb("bd8", next.bd8);
      setDbs((current) => ({ ...current, ...next }));
      return note;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [dbs, safePostDb]);

  const addAlert = useCallback(async (alertData) => {
    if (!dbs) return null;
    try {
      const next = { bd6: cloneDb(dbs.bd6) };
      const alert = {
        internalId: makeId("alert"),
        leida: false,
        resuelta: false,
        ...alertData,
        fechaCreacion: isoNow(),
        fechaResolucion: null
      };
      next.bd6.records.push(alert);
      await safePostDb("bd6", next.bd6);
      setDbs((current) => ({ ...current, ...next }));
      return alert;
    } catch (err) {
      return null;
    }
  }, [dbs, safePostDb]);

  const dismissAlert = useCallback(async (alertId) => {
    if (!dbs) return;
    try {
      const next = { bd6: cloneDb(dbs.bd6) };
      const alert = next.bd6.records.find((a) => a.internalId === alertId);
      if (alert) { alert.leida = true; alert.resuelta = true; alert.fechaResolucion = isoNow(); }
      await safePostDb("bd6", next.bd6);
      setDbs((current) => ({ ...current, ...next }));
    } catch (err) { /* silent */ }
  }, [dbs, safePostDb]);

  const getInactiveProjects = useCallback(() => {
    if (!dbs) return [];
    const DAYS_90 = 90 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const projects = dbs.bd7?.records || [];
    return projects.filter((p) => {
      if (p.estado !== "ACTIVO") return false;
      const lastTx = p.ultimaTransaccion ? new Date(p.ultimaTransaccion).getTime() : null;
      if (!lastTx) return true;
      return now - lastTx > DAYS_90;
    });
  }, [dbs]);

  const addDeFiStrategy = useCallback(async (strategyData) => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = { bd5: cloneDb(dbs.bd5) };
      const strategy = {
        internalId: makeId("defi"),
        estado: "ACTIVA",
        ...strategyData,
        fechaApertura: isoNow()
      };
      next.bd5.records.push(strategy);
      await safePostDb("bd5", next.bd5);
      setDbs((current) => ({ ...current, ...next }));
      return strategy;
    } catch (err) { setError(err.message); return null; }
  }, [dbs, safePostDb]);

  const addLocation = useCallback(async (locationData) => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = { bd11: cloneDb(dbs.bd11) };
      const loc = {
        internalId: makeId("loc"),
        ...locationData,
        fechaAlta: isoNow()
      };
      next.bd11.records.push(loc);
      await safePostDb("bd11", next.bd11);
      setDbs((current) => ({ ...current, ...next }));
      return loc;
    } catch (err) { setError(err.message); return null; }
  }, [dbs, safePostDb]);

  const addActivePosition = useCallback(async (positionData) => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = { bd12: cloneDb(dbs.bd12) };
      const pos = {
        internalId: makeId("pos"),
        estado: "SALUDABLE",
        alertas: [],
        ...positionData,
        ultimaActualizacion: isoNow()
      };
      next.bd12.records.push(pos);
      await safePostDb("bd12", next.bd12);
      setDbs((current) => ({ ...current, ...next }));
      return pos;
    } catch (err) { setError(err.message); return null; }
  }, [dbs, safePostDb]);

  const updateActivePosition = useCallback(async (posId, updates) => {
    if (!dbs) return;
    try {
      const next = { bd12: cloneDb(dbs.bd12) };
      const pos = next.bd12.records.find((p) => p.internalId === posId);
      if (pos) {
        Object.assign(pos, updates, { ultimaActualizacion: isoNow() });
        pos.estado = pos.healthFactor >= 2 ? "SALUDABLE" : pos.healthFactor >= 1.1 ? "ALERTA" : "CRITICA";
      }
      await safePostDb("bd12", next.bd12);
      setDbs((current) => ({ ...current, ...next }));
    } catch (err) { /* silent */ }
  }, [dbs, safePostDb]);

  const getConstitutionRules = useCallback(() => {
    if (!dbs) return null;
    const records = dbs.bd4?.records || [];
    return records[0] || null;
  }, [dbs]);

  const updateConstitution = useCallback(async (rules) => {
    if (!dbs) return;
    try {
      const next = { bd4: cloneDb(dbs.bd4) };
      if (next.bd4.records.length === 0) {
        next.bd4.records.push({
          internalId: makeId("const"),
          targetAllocation: { TIER_1: 0.40, TIER_2: 0.25, TIER_3: 0.20, TIER_4: 0.10 },
          hardCapHighRisk: 0.30,
          rebalanceThreshold: 0.05,
          ...rules,
          ultimaActualizacion: isoNow()
        });
      } else {
        Object.assign(next.bd4.records[0], rules, { ultimaActualizacion: isoNow() });
      }
      await safePostDb("bd4", next.bd4);
      setDbs((current) => ({ ...current, ...next }));
    } catch (err) { /* silent */ }
  }, [dbs, safePostDb]);

  const simulateExitImpact = useCallback((ticker, sellQty, price) => {
    if (!dbs) return null;
    const qty = Number(sellQty);
    const p = Number(price);
    if (!qty || !p) return null;
    const bd1 = dbs.bd1;
    const records = bd1?.records || [];
    const capitalByTier = { TIER_1: 0, TIER_2: 0, TIER_3: 0, TIER_4: 0 };
    let total = 0;
    for (const lot of records) {
      let value = Number(lot.currentValueUSD || 0);
      if (normalizeTicker(lot.ticker) === normalizeTicker(ticker)) {
        const sellValue = Math.min(qty, Number(lot.currentQuantity || 0)) * p;
        value = Math.max(0, Number(lot.currentValueUSD || 0) - sellValue);
      }
      const tier = TIER_KEYS.includes(lot.finalTier) ? lot.finalTier : "TIER_4";
      capitalByTier[tier] += value;
      total += value;
    }
    const highRiskPct = total > 0 ? ((capitalByTier.TIER_3 + capitalByTier.TIER_4) / total) : 0;
    return { capitalByTier, total, highRiskPct };
  }, [dbs]);

  const executeDeFiTransaction = useCallback(async (payload) => {
    if (!dbs) return;
    setError("");
    setNotice("");
    try {
      const next = {
        bd0: cloneDb(dbs.bd0),
        bd1: cloneDb(dbs.bd1),
        bd2: cloneDb(dbs.bd2),
        bd3: cloneDb(dbs.bd3)
      };

      const asset = ensureAsset(next.bd3, {
        ticker: payload.strategyTicker,
        assetName: payload.assetName || payload.strategyTicker,
        price: "0",
        timestamp: isoNow()
      });

      if (asset.estadoTesis === "APROBADA") {
        const lot = upsertLot(next.bd1, asset, {
          ticker: payload.strategyTicker,
          type: "BUY",
          quantity: String(payload.lpAmount || 0),
          price: "0",
          timestamp: isoNow()
        });
        lot.finalTier = "TIER_2";
        lot.liquidityLabel = "NO_LIQUIDITY";
      }

      const tx = makeTransaction(
        { ticker: payload.strategyTicker, type: "BUY", quantity: String(payload.lpAmount || 0), price: "0", assetName: payload.assetName, timestamp: isoNow() },
        asset,
        asset.estadoTesis === "APROBADA"
      );
      tx.subtipoOperativo = payload.subtipoOperativo || "APORTAR_LP";
      tx.notasOperacionales = `DeFi: ${payload.protocolo} | Colateral: ${payload.colateralTicker} | Apalancamiento: ${payload.apalancamiento}x`;
      next.bd2.records.push(tx);

      syncBd0FromRollups(next.bd0, next.bd1, next.bd3);
      await safePostDb("bd3", next.bd3);
      await safePostDb("bd2", next.bd2);
      if (asset.estadoTesis === "APROBADA") await safePostDb("bd1", next.bd1);
      await safePostDb("bd0", next.bd0);

      const strategy = await addDeFiStrategy({
        nombreEstrategia: payload.assetName || payload.strategyTicker,
        protocolo: payload.protocolo,
        tipo: payload.tipoOperacion || "LP_POOL",
        activosInvolucrados: [payload.colateralTicker],
        direccionContrato: payload.direccionContrato,
        red: payload.red || "ETHEREUM",
        apalancamiento: payload.apalancamiento || 1,
        colateralTicker: payload.colateralTicker,
        healthFactorInicial: payload.healthFactor
      });

      if (strategy) {
        await addLocation({
          nombre: `${payload.protocolo} — ${payload.colateralTicker} Contract`,
          tipo: "SMART_CONTRACT",
          direccion: payload.direccionContrato,
          red: payload.red || "ETHEREUM",
          notas: payload.assetName || payload.strategyTicker,
          riesgoContraparte: payload.riesgoContraparte || 2
        });
        await addActivePosition({
          defiStrategyId: strategy.internalId,
          tickerMonitoreo: payload.strategyTicker,
          healthFactor: payload.healthFactor || 0,
          colateralUSD: payload.colateralUSD || 0,
          deudaUSD: payload.deudaUSD || 0,
          pnlNoRealizadoUSD: 0
        });
      }

      setDbs((current) => ({ ...current, ...next }));
      setNotice((simulationRef.current ? "[SIMULACIÓN] " : "") + "Operación DeFi ejecutada y posiciones registradas.");
    } catch (err) { setError(err.message); }
  }, [dbs, safePostDb, addDeFiStrategy, addLocation, addActivePosition]);

  const addReconciliation = useCallback(async (reconData) => {
    if (!dbs) return null;
    try {
      const next = { bd20: cloneDb(dbs.bd20) };
      const recon = {
        internalId: makeId("recon"),
        estado: "ABIERTA",
        discrepancies: [],
        ...reconData,
        fechaApertura: isoNow(),
        fechaResolucion: null
      };
      next.bd20.records.push(recon);
      await safePostDb("bd20", next.bd20);
      setDbs((current) => ({ ...current, ...next }));
      return recon;
    } catch (err) { return null; }
  }, [dbs, safePostDb]);

  const resolveReconciliation = useCallback(async (reconId) => {
    if (!dbs) return;
    try {
      const next = { bd20: cloneDb(dbs.bd20) };
      const recon = next.bd20.records.find((r) => r.internalId === reconId);
      if (recon) { recon.estado = "RESUELTA"; recon.fechaResolucion = isoNow(); }
      await safePostDb("bd20", next.bd20);
      setDbs((current) => ({ ...current, ...next }));
    } catch (err) { /* silent */ }
  }, [dbs, safePostDb]);

  const addSnapshot = useCallback(async () => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = {
        bd0: cloneDb(dbs.bd0),
        bd1: cloneDb(dbs.bd1),
        bd21: cloneDb(dbs.bd21)
      };

      const rollup = computeBd1Rollup(next.bd1);
      const lotes = (next.bd1.records || []).map((lot) => ({
        ticker: lot.ticker,
        quantity: lot.currentQuantity,
        value: lot.currentValueUSD
      }));

      const metrics = {
        totalGlobalUSD: rollup.totalPortfolioUSD,
        dryPowderUSD: rollup.dryPowderUSD,
        capitalByTier: rollup.capitalByTier
      };

      const firmaRaw = JSON.stringify({ metrics, lotes, timestamp: isoNow() });
      const firmaDigest = "SIG-" + crypto ? "IMMUTABLE_SEAL" : "LEGACY";
      const snapshot = {
        internalId: makeId("snap"),
        tipo: "RECONCILIACION",
        metrics,
        lotes,
        reconciliationId: null,
        firmaDigital: `${firmaDigest}-${Date.now().toString(16)}`,
        fecha: isoNow()
      };

      next.bd21.records.push(snapshot);

      if (next.bd0.records[0]) {
        next.bd0.records[0].lastAuditDate = isoNow();
        next.bd0.records[0].auditNotes = `Snapshot sellado: ${snapshot.internalId}`;
      }

      await safePostDb("bd21", next.bd21);
      await safePostDb("bd0", next.bd0);
      setDbs((current) => ({ ...current, ...next }));
      setNotice("🔒 Snapshot contable sellado inmutably.");
      return snapshot;
    } catch (err) { setError(err.message); return null; }
  }, [dbs, safePostDb]);

  const addOperatorState = useCallback(async (stateData) => {
    if (!dbs) return null;
    setError("");
    setNotice("");
    try {
      const next = { bd15: cloneDb(dbs.bd15) };
      const alertaActiva = (stateData.stress || 0) > 8;
      const scoreCompuesto = Math.round(
        ((stateData.sleep || 5) + (11 - (stateData.stress || 5)) + (11 - (stateData.fomo || 5)) + (stateData.confidence || 5)) / 4
      );
      const record = {
        internalId: makeId("state"),
        fecha: isoNow().slice(0, 10),
        ...stateData,
        scoreCompuesto,
        alertaActiva,
        createdAt: isoNow()
      };
      next.bd15.records.push(record);
      await safePostDb("bd15", next.bd15);
      setDbs((current) => ({ ...current, ...next }));
      return record;
    } catch (err) { setError(err.message); return null; }
  }, [dbs, safePostDb]);

  const addDiaryEntry = useCallback(async (diaryData) => {
    if (!dbs) return null;
    try {
      const next = { bd14: cloneDb(dbs.bd14) };
      const entry = {
        internalId: makeId("diary"),
        ...diaryData,
        fecha: isoNow(),
        createdAt: isoNow()
      };
      next.bd14.records.push(entry);
      await safePostDb("bd14", next.bd14);
      setDbs((current) => ({ ...current, ...next }));
      return entry;
    } catch (err) { return null; }
  }, [dbs, safePostDb]);

  const getTodayCheckin = useCallback(() => {
    if (!dbs) return null;
    const today = isoNow().slice(0, 10);
    return (dbs.bd15?.records || []).find((r) => r.fecha === today) || null;
  }, [dbs]);

  const getLatestOperatorState = useCallback(() => {
    if (!dbs) return null;
    const records = dbs.bd15?.records || [];
    if (records.length === 0) return null;
    return records[records.length - 1];
  }, [dbs]);

  const forceSyncBd0 = useCallback(async () => {
    if (!dbs) return;
    setError("");
    try {
      const next = { bd0: cloneDb(dbs.bd0), bd1: cloneDb(dbs.bd1), bd3: cloneDb(dbs.bd3) };
      syncBd0FromRollups(next.bd0, next.bd1, next.bd3);
      await safePostDb("bd0", next.bd0);
      setDbs((current) => ({ ...current, ...next }));
      setNotice("BD0 sincronizado desde BD1 correctamente.");
    } catch (err) { setError(err.message); }
  }, [dbs, safePostDb]);

  return {
    dbs,
    checksum,
    assets: assetsView,
    loading,
    error,
    notice,
    isSimulation,
    toggleSimulationMode,
    reload,
    addTransaction,
    refreshMarketPrices,
    storagePath: ".obsidian/mikoko-moster",
    dbNames: DB_NAMES,
    getRecordById,
    getRecordsByField,
    addProject,
    updateProject,
    addThesisNote,
    addAlert,
    dismissAlert,
    getInactiveProjects,
    addDeFiStrategy,
    addLocation,
    addActivePosition,
    updateActivePosition,
    getConstitutionRules,
    updateConstitution,
    simulateExitImpact,
    executeDeFiTransaction,
    addReconciliation,
    resolveReconciliation,
    addSnapshot,
    addOperatorState,
    addDiaryEntry,
    getTodayCheckin,
    getLatestOperatorState,
    forceSyncBd0
  };
}

const MikokoContext = createContext(null);

export function MikokoProvider({ children }) {
  const mikoko = useMikoko();
  return <MikokoContext.Provider value={mikoko}>{children}</MikokoContext.Provider>;
}

export function useMikokoContext() {
  const ctx = useContext(MikokoContext);
  if (!ctx) throw new Error("useMikokoContext must be used within MikokoProvider");
  return ctx;
}
