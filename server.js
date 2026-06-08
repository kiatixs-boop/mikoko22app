const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const fssync = require("node:fs");
const path = require("node:path");
const express = require("express");
const cors = require("cors");

const HOST = "127.0.0.1";
const PORT = 5000;
const FRONTEND_ORIGIN = "http://localhost:3001";
const STORAGE_DIR = path.join(process.cwd(), ".obsidian", "mikoko-moster");
const SCHEMA_VERSION = "27.0";

const DB_CATALOG = [
  ["bd0", "Central de Datos", []],
  ["bd1", "Portfolio Actual", ["bd0", "bd2", "bd3", "bd11", "bd12"]],
  ["bd2", "Transacciones", ["bd1", "bd3", "bd11"]],
  ["bd3", "Activos Cripto", ["bd1"]],
  ["bd4", "Parametros Piramide", ["bd0", "bd1"]],
  ["bd5", "Estrategias DeFi", ["bd3", "bd11"]],
  ["bd6", "Tareas y Alertas", ["bd0"]],
  ["bd7", "Proyectos y Protocolos", ["bd3", "bd8"]],
  ["bd8", "Notas y Analisis", ["bd3", "bd7"]],
  ["bd9", "Campanas Airdrop", ["bd3", "bd11"]],
  ["bd10", "Glosario Cripto", []],
  ["bd11", "Ubicaciones", ["bd1"]],
  ["bd12", "Posiciones Activas", ["bd1", "bd5"]],
  ["bd13", "NFTs", ["bd14"]],
  ["bd14", "Diario Cripto", ["bd0", "bd15"]],
  ["bd15", "Estado del Operador", ["bd0"]],
  ["bd16", "Pitacoras Inbox", ["bd6", "bd7", "bd8"]],
  ["bd17", "Prensa y Research", ["bd3", "bd5", "bd7", "bd8"]],
  ["bd18", "Herramientas", ["bd5", "bd7", "bd8"]],
  ["bd19", "Contactos", ["bd2", "bd5", "bd7"]],
  ["bd20", "Reconciliaciones", ["bd0", "bd1", "bd2"]],
  ["bd21", "Snapshots Contables", ["bd0", "bd1", "bd20"]]
];

const DB_NAMES = new Set(DB_CATALOG.map(([name]) => name));
const writeQueues = new Map();

function nowIso() {
  return new Date().toISOString();
}

function dbPath(name) {
  if (!DB_NAMES.has(name)) {
    throw new Error("Unknown database name.");
  }
  return path.join(STORAGE_DIR, `${name}.json`);
}

function buildEnvelope(name, records) {
  const entry = DB_CATALOG.find(([db]) => db === name);
  return {
    database: name,
    moduleName: entry[1],
    schemaVersion: SCHEMA_VERSION,
    storage: {
      mode: "LOCALHOST_ONLY",
      path: ".obsidian/mikoko-moster",
      remoteAuth: false,
      telemetry: false
    },
    dependencies: entry[2],
    checksum: {
      status: records.length === 0 ? "EMPTY" : "PENDING_RECALCULATION",
      calculatedAt: null,
      note: "Computed fields are recalculated by the application and are never persisted."
    },
    records,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

function seedBd0() {
  return buildEnvelope("bd0", [
    {
      systemName: "SISTEMA MIKOKO",
      createdAt: nowIso(),
      totalGlobalUSD: 0,
      bridgeValueUSD: 0,
      dryPowderUSD: 0,
      capitalTier1USD: 0,
      capitalTier2USD: 0,
      capitalTier3USD: 0,
      capitalTier4USD: 0,
      operatorScore: 0,
      lastAuditDate: null,
      auditNotes: "",
      portfolioLinks: []
    }
  ]);
}

function seedBd1() {
  return buildEnvelope("bd1", []);
}

function seedBd2() {
  return {
    ...buildEnvelope("bd2", []),
    immutableLedger: true,
    transactionTaxonomy: {
      categories: [
        "ENTRADA_DE_CAPITAL",
        "SALIDA_DE_CAPITAL",
        "MOVIMIENTO_INTERNO",
        "CAMBIO_DE_ESTADO",
        "REGISTRO_TECNICO"
      ],
      subtypes: [
        "COMPRA_FIAT_CRIPTO",
        "AIRDROP",
        "REWARD_STAKING",
        "RETORNO_LP",
        "DEPOSITO_EXTERNO",
        "VENTA_CRIPTO_FIAT",
        "VENTA_CRIPTO_CRIPTO",
        "RETIRO_BANCO",
        "TRANSFERENCIA",
        "SWAP",
        "AJUSTE_SOBRE",
        "ABRIR_POSICION",
        "STAKE",
        "APORTAR_LP",
        "PRESTAMO",
        "CERRAR_POSICION",
        "UNSTAKE",
        "RETIRAR_LP",
        "COLATERAL",
        "GAS_PURO",
        "FIRMA_CONTRATO",
        "TX_FALLIDA",
        "AJUSTE_MANUAL",
        "LIQUIDACION",
        "FUNDING_PAYMENT",
        "HARVEST_REWARDS",
        "BRIDGE",
        "NFT_COMPRA_VENTA"
      ]
    }
  };
}

function seedBd3() {
  return buildEnvelope("bd3", []);
}

function seedDatabase(name) {
  if (name === "bd0") return seedBd0();
  if (name === "bd1") return seedBd1();
  if (name === "bd2") return seedBd2();
  if (name === "bd3") return seedBd3();
  return buildEnvelope(name, []);
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

function validatePayload(name, payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ok: false, error: "Payload must be a JSON object." };
  }
  if (payload.database !== name) {
    return { ok: false, error: `Payload database must be "${name}".` };
  }
  if (!Array.isArray(payload.records)) {
    return { ok: false, error: "Payload must contain a records array." };
  }
  if (name === "bd0") {
    if (payload.records.length !== 1) {
      return { ok: false, error: "BD0 must contain exactly one sovereign node record." };
    }
    if (payload.records[0].systemName !== "SISTEMA MIKOKO") {
      return { ok: false, error: 'BD0 systemName must be "SISTEMA MIKOKO".' };
    }
  }
  return { ok: true };
}

async function fsyncDirectory(directory) {
  const handle = await fs.open(directory, fssync.constants.O_RDONLY);
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function atomicWriteJson(name, payload) {
  const file = dbPath(name);
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  const backup = `${file}.bak`;
  const cleanPayload = stripComputed({
    ...payload,
    updatedAt: nowIso()
  });
  const json = `${JSON.stringify(cleanPayload, null, 2)}\n`;

  let handle;
  try {
    if (fssync.existsSync(file)) {
      await fs.copyFile(file, backup);
    }
    handle = await fs.open(tmp, "w");
    await handle.writeFile(json, "utf8");
    await handle.sync();
    await handle.close();
    handle = null;
    await fs.rename(tmp, file);
    await fsyncDirectory(STORAGE_DIR);
    return cleanPayload;
  } catch (error) {
    if (handle) await handle.close().catch(() => undefined);
    await fs.unlink(tmp).catch(() => undefined);
    throw error;
  }
}

function enqueueWrite(name, payload) {
  const previous = writeQueues.get(name) || Promise.resolve();
  const next = previous.then(() => atomicWriteJson(name, payload));
  writeQueues.set(
    name,
    next.catch(() => undefined).finally(() => {
      if (writeQueues.get(name) === next) writeQueues.delete(name);
    })
  );
  return next;
}

async function readJson(name) {
  const raw = await fs.readFile(dbPath(name), "utf8");
  return JSON.parse(raw);
}

async function initializeDatabases() {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  for (const [name] of DB_CATALOG) {
    const file = dbPath(name);
    if (!fssync.existsSync(file)) {
      await atomicWriteJson(name, seedDatabase(name));
    }
  }
}

function extractCoinGeckoId(asset) {
  if (typeof asset.coingeckoId === "string" && asset.coingeckoId.trim()) {
    return asset.coingeckoId.trim().toLowerCase();
  }
  const url = asset.enlaceCoinGecko || asset.coinGeckoUrl || "";
  const match = String(url).match(/coingecko\.com\/(?:[a-z-]+\/)?coins\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]).toLowerCase() : null;
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "MIKOKO-v27-localhost-price-reader"
    }
  });
  if (!response.ok) {
    throw new Error(`CoinGecko responded with HTTP ${response.status}.`);
  }
  return response.json();
}

async function resolveTickerToCoinGeckoId(ticker) {
  const safeTicker = encodeURIComponent(String(ticker).trim().toLowerCase());
  if (!safeTicker) return null;
  const data = await fetchJson(`https://api.coingecko.com/api/v3/search?query=${safeTicker}`);
  const coins = Array.isArray(data.coins) ? data.coins : [];
  const exact = coins.find((coin) => String(coin.symbol).toLowerCase() === safeTicker);
  return (exact || coins[0])?.id || null;
}

async function fetchMarketPrices(assets) {
  const sanitized = assets
    .filter((asset) => asset && typeof asset === "object")
    .slice(0, 100)
    .map((asset) => ({
      ticker: String(asset.ticker || "").trim().toUpperCase(),
      coingeckoId: extractCoinGeckoId(asset)
    }))
    .filter((asset) => asset.ticker);

  const withIds = [];
  for (const asset of sanitized) {
    const coingeckoId = asset.coingeckoId || (await resolveTickerToCoinGeckoId(asset.ticker));
    if (coingeckoId) withIds.push({ ...asset, coingeckoId });
  }

  const ids = [...new Set(withIds.map((asset) => asset.coingeckoId))];
  if (ids.length === 0) {
    return { prices: {}, requestedAt: nowIso(), privacy: "No portfolio quantities or balances were transmitted." };
  }

  const url =
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(","))}` +
    "&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true";
  const data = await fetchJson(url);
  const fetchedAt = nowIso();
  const prices = {};

  for (const asset of withIds) {
    const quote = data[asset.coingeckoId];
    if (quote && typeof quote.usd === "number") {
      prices[asset.ticker] = {
        coingeckoId: asset.coingeckoId,
        usd: quote.usd,
        marketCapUSD: quote.usd_market_cap ?? null,
        volumen24hUSD: quote.usd_24h_vol ?? null,
        change24hPct: quote.usd_24h_change ?? null,
        fetchedAt
      };
    }
  }

  return {
    prices,
    requestedAt: fetchedAt,
    privacy: "Only asset identifiers were transmitted to CoinGecko. No balances, quantities, transactions, or portfolio totals were sent."
  };
}

const app = express();
app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === FRONTEND_ORIGIN) return callback(null, true);
      return callback(new Error("CORS origin not allowed by MIKOKO local bridge."));
    },
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    mode: "LOCALHOST_ONLY",
    host: HOST,
    port: PORT,
    storagePath: ".obsidian/mikoko-moster",
    telemetry: false,
    remoteAuth: false,
    databases: DB_CATALOG.map(([name, moduleName]) => ({ name, moduleName }))
  });
});

app.get("/api/db", async (_req, res) => {
  try {
    const databases = {};
    for (const [name] of DB_CATALOG) databases[name] = await readJson(name);
    res.json(databases);
  } catch (error) {
    res.status(500).json({ error: "Unable to read local databases.", detail: error.message });
  }
});

app.get("/api/db/:name", async (req, res) => {
  const name = String(req.params.name || "").toLowerCase();
  if (!DB_NAMES.has(name)) return res.status(404).json({ error: "Unknown database." });
  try {
    res.json(await readJson(name));
  } catch (error) {
    res.status(500).json({ error: `Unable to read ${name}.`, detail: error.message });
  }
});

app.post("/api/db/:name", async (req, res) => {
  const name = String(req.params.name || "").toLowerCase();
  if (!DB_NAMES.has(name)) return res.status(404).json({ error: "Unknown database." });

  const validation = validatePayload(name, req.body);
  if (!validation.ok) return res.status(400).json({ error: validation.error });

  try {
    const saved = await enqueueWrite(name, req.body);
    res.json({ ok: true, database: name, savedAt: saved.updatedAt });
  } catch (error) {
    res.status(500).json({ error: `Unable to write ${name}. Existing data preserved.`, detail: error.message });
  }
});

app.post("/api/market/prices", async (req, res) => {
  const assets = Array.isArray(req.body?.assets) ? req.body.assets : null;
  if (!assets) return res.status(400).json({ error: "Body must contain an assets array." });
  try {
    res.json(await fetchMarketPrices(assets));
  } catch (error) {
    res.status(502).json({ error: "Unable to fetch CoinGecko prices.", detail: error.message });
  }
});

initializeDatabases()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`MIKOKO v27.0 local bridge listening at http://${HOST}:${PORT}`);
      console.log(`Local storage: ${STORAGE_DIR}`);
      console.log(`Bridge session: ${crypto.randomUUID()}`);
    });
  })
  .catch((error) => {
    console.error("MIKOKO local bridge failed to initialize:", error);
    process.exit(1);
  });
