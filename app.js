const storageKeys = {
  session: "direct_admin_session",
  sidebar: "direct_sidebar_collapsed",
  theme: "direct_theme_v2",
  settings: "direct_settings",
  diarists: "direct_diaristas",
  demands: "direct_demandas",
  stores: "direct_lojas_redes",
  sectors: "direct_setores",
  sectorRates: "direct_diarias_setor",
  companyRates: "direct_diarias_empresas",
  financialRecords: "direct_registros_financeiros",
};

const backendResourceByStorageKey = {
  [storageKeys.diarists]: "diarists",
  [storageKeys.demands]: "demands",
  [storageKeys.stores]: "stores",
  [storageKeys.sectors]: "sectors",
  [storageKeys.sectorRates]: "sectorRates",
  [storageKeys.companyRates]: "companyRates",
  [storageKeys.financialRecords]: "financialRecords",
};

let backendReady = false;
let appStarted = false;
const backendSyncTimers = {};
const backendPendingPrefix = "direct_pending_";
const backendDeletedPrefix = "direct_deleted_";
const adminAccess = {
  user: "marcosvinidirect@gmail.com",
  email: "marcosvinidirect@gmail.com",
  passwordHash: "097097bdcff0343f93665cb124613e664f2f2a7894bdc752b9cbec66aa5e8db8",
};

const requiredSectors = [
  "Operador de caixa",
  "Balconista de Frios",
  "Balconista de Padaria",
  "Balconista de Açougue",
  "Forneiro",
  "Açougueiro",
  "Repositor de Frios",
  "Repositor de Hortifruti",
  "Repositor de Mercearia",
];

const fallbackSettings = {
  companyName: "Direct Promoções",
  monthlyGoal: 720000,
  defaultTheme: "light",
};

const fallbackSectorRates = requiredSectors.map((sector) => ({
  id: `rate-${normalizeTextForSeed(sector)}`,
  sector,
  minValue: 80,
  maxValue: 90,
}));

const fallbackCompanyRates = [
  { id: "company-rate-frangolandia", company: "Frangolândia", value: 109.25 },
  { id: "company-rate-hipermarket", company: "Hipermarket", value: 124.5 },
];

const fallbackDiarists = [];

const fallbackStores = [
  { id: "store-rede-norte", name: "Rede Norte", network: "Rede Norte", type: "Rede", owner: "Ana", city: "Fortaleza", address: "", health: "Alta" },
  { id: "store-mix-atacado", name: "Mix Atacado", network: "Mix Atacado", type: "Rede", owner: "Marcos", city: "Caucaia", address: "", health: "Média" },
  { id: "store-urban-market", name: "Urban Market", network: "Urban Market", type: "Loja", owner: "Clara", city: "Fortaleza", address: "", health: "Alta" },
  { id: "store-rota-express", name: "Rota Express", network: "Rota Express", type: "Loja", owner: "Bruno", city: "Maracanaú", address: "", health: "Baixa" },
];

const requiredStores = [
  { id: "store-frangolandia-varjota", name: "Varjota", network: "Frangolândia", type: "Loja", owner: "Direct Promoções", city: "Fortaleza", address: "Rua Frei Mansueto, 909, Varjota, Fortaleza - CE", health: "Alta" },
  { id: "store-hipermarket-vila-uniao", name: "Vila União", network: "Hipermarket", type: "Loja", owner: "Direct Promoções", city: "Fortaleza", address: "Rua Livreiro Gualter, 123, Vila União, Fortaleza - CE", health: "Alta" },
  { id: "store-hipermarket-jardim-cearense", name: "Jardim Cearense", network: "Hipermarket", type: "Loja", owner: "Direct Promoções", city: "Fortaleza", address: "Rua Rubens Monte, 380, Jardim Cearense, Fortaleza - CE", health: "Alta" },
  { id: "store-hipermarket-serrinha", name: "Serrinha", network: "Hipermarket", type: "Loja", owner: "Direct Promoções", city: "Fortaleza", address: "Rua Freire Alemão, 356, Serrinha, Fortaleza - CE", health: "Alta" },
  { id: "store-hipermarket-mondubim", name: "Mondubim", network: "Hipermarket", type: "Loja", owner: "Direct Promoções", city: "Fortaleza", address: "Av. Benjamim Brasil, 1099, Mondubim, Fortaleza - CE", health: "Alta" },
  { id: "store-hipermarket-eusebio", name: "Eusébio", network: "Hipermarket", type: "Loja", owner: "Direct Promoções", city: "Eusébio", address: "Rua Embaúba, 5, Eusébio - CE", health: "Alta" },
];

const fallbackDemands = [];

const baseWeeks = [
  { label: "S1", value: 68000 },
  { label: "S2", value: 82000 },
  { label: "S3", value: 76000 },
  { label: "S4", value: 114000 },
  { label: "S5", value: 132000 },
  { label: "S6", value: 149000 },
  { label: "S7", value: 141000 },
  { label: "S8", value: 168000 },
];

const viewMeta = {
  dashboard: ["Operação em tempo real", "Direct Promoções"],
  jarvis: ["Inteligencia operacional", "Jarvis"],
  diaristas: ["Equipe operacional", "Diaristas"],
  demandas: ["Fila de trabalho", "Demandas"],
  lojas: ["Rede comercial", "Lojas & Redes"],
  financeiro: ["Controle financeiro", "Financeiro"],
  configuracoes: ["Preferências", "Configurações"],
};

const state = {
  view: "dashboard",
  period: 30,
  query: "",
  diaristQuery: "",
  demandStoreQuery: "",
  demandStatusTab: "all",
  financialQuery: "",
  collapsedDemandNetworks: new Set(),
  collapsedDemandStores: new Set(),
  collapsedFinanceNetworks: new Set(),
  collapsedFinanceStores: new Set(),
  collapsedStoreNetworks: new Set(),
  financeNetworkFilter: "",
  financeStoreFilter: "",
  selectedDiaristSectors: [],
  sidebarCollapsed: localStorage.getItem(storageKeys.sidebar) === "true",
  settings: readStore(storageKeys.settings, fallbackSettings),
  theme: localStorage.getItem(storageKeys.theme) || "dark",
  diarists: readStore(storageKeys.diarists, fallbackDiarists),
  stores: readStore(storageKeys.stores, fallbackStores),
  demands: readStore(storageKeys.demands, fallbackDemands),
  sectors: readStore(storageKeys.sectors, requiredSectors),
  sectorRates: readStore(storageKeys.sectorRates, fallbackSectorRates),
  companyRates: readStore(storageKeys.companyRates, fallbackCompanyRates),
  financialRecords: readStore(storageKeys.financialRecords, []),
  access: {
    role: "operador",
    canViewFinance: false,
    canViewFullCpf: false,
  },
  tasks: [
    { title: "Confirmar escala de diaristas", meta: "Hoje, 10:30 - Operação", done: false },
    { title: "Atualizar previsão financeira", meta: "Hoje, 14:00 - Financeiro", done: false },
    { title: "Follow-up com Rede Norte", meta: "Amanhã, 09:15 - Supervisão", done: true },
  ],
};

state.stores = mergeRequiredStores(normalizeStores(state.stores));
state.diarists = normalizeDiarists(state.diarists);
state.demands = normalizeDemands(state.demands);
state.sectors = mergeRequiredSectors(state.sectors);
state.sectorRates = normalizeSectorRates(state.sectorRates);
state.companyRates = normalizeCompanyRates(state.companyRates);
state.financialRecords = normalizeFinancialRecords(state.financialRecords);
persistCoreData({ pending: false });

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const currencyWithCents = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function uid(prefix) {
  const random = globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${random}`;
}

async function sha256Hex(value) {
  if (!globalThis.crypto?.subtle) return "";
  const buffer = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(value || "")));
  return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function isAuthenticated() {
  return ["authenticated", adminAccess.passwordHash].includes(sessionStorage.getItem(storageKeys.session));
}

function setLoginError(message) {
  const error = document.getElementById("loginError");
  if (!error) return;
  error.textContent = message;
  error.hidden = !message;
}

function showLogin() {
  document.getElementById("loginScreen")?.removeAttribute("hidden");
  document.getElementById("appShell")?.setAttribute("hidden", "");
  document.getElementById("loginUser")?.focus();
  if (window.lucide) window.lucide.createIcons();
}

function showApp() {
  document.getElementById("loginScreen")?.setAttribute("hidden", "");
  document.getElementById("appShell")?.removeAttribute("hidden");
}

function bindAuth() {
  const form = document.getElementById("loginForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const user = normalizeText(data.user).trim();
    if (window.directBackend?.enabled && window.directBackend?.signIn) {
      try {
        await window.directBackend.signIn(user, data.password);
      } catch (error) {
        console.warn("Supabase Auth recusou o acesso.", error);
        setLoginError("E-mail ou senha incorretos.");
        return;
      }
      sessionStorage.setItem(storageKeys.session, "authenticated");
      setLoginError("");
      startApp();
      return;
    }
    const passwordHash = await sha256Hex(data.password);
    if (user === adminAccess.user && passwordHash === adminAccess.passwordHash) {
      state.access = { role: "admin", canViewFinance: true, canViewFullCpf: true };
      sessionStorage.setItem(storageKeys.session, "authenticated");
      setLoginError("");
      startApp();
      return;
    }
    setLoginError("Login ou senha incorretos.");
  });
}

function readStore(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function writeStore(key, value, options = {}) {
  const { pending = true } = options;
  writeLocalStore(key, value);
  const resource = backendResourceByStorageKey[key];
  if (pending && resource) markBackendPending(resource, value);
  queueBackendSync(key, value);
}

function persistCoreData(options = {}) {
  writeStore(storageKeys.stores, state.stores, options);
  writeStore(storageKeys.diarists, state.diarists, options);
  writeStore(storageKeys.demands, state.demands, options);
  writeStore(storageKeys.sectors, state.sectors, options);
  writeStore(storageKeys.sectorRates, state.sectorRates, options);
  writeStore(storageKeys.companyRates, state.companyRates, options);
  writeStore(storageKeys.financialRecords, state.financialRecords, options);
}

function pendingKey(resource) {
  return `${backendPendingPrefix}${resource}`;
}

function deletedKey(resource) {
  return `${backendDeletedPrefix}${resource}`;
}

function readBackendPending(resource) {
  try {
    return JSON.parse(localStorage.getItem(pendingKey(resource)) || "null");
  } catch {
    return null;
  }
}

function readBackendDeleted(resource) {
  try {
    const deleted = JSON.parse(localStorage.getItem(deletedKey(resource)) || "[]");
    return Array.isArray(deleted) ? deleted : [];
  } catch {
    return [];
  }
}

function markBackendDeleted(resource, id) {
  if (!resource || !id) return;
  const deleted = new Set(readBackendDeleted(resource));
  deleted.add(id);
  writeLocalStore(deletedKey(resource), Array.from(deleted));
  syncDeletedToBackend(resource).catch((error) => console.warn(`Falha ao remover ${resource} no Supabase`, error));
}

function clearBackendDeleted(resource, id) {
  const remaining = readBackendDeleted(resource).filter((item) => item !== id);
  if (remaining.length) {
    writeLocalStore(deletedKey(resource), remaining);
  } else {
    localStorage.removeItem(deletedKey(resource));
  }
}

function markBackendPending(resource, records) {
  writeLocalStore(pendingKey(resource), {
    records: Array.isArray(records) ? records : [],
    updatedAt: new Date().toISOString(),
  });
}

function clearBackendPending(resource, syncedRecords) {
  const pending = readBackendPending(resource);
  if (!pending) return;
  if (JSON.stringify(pending.records || []) === JSON.stringify(syncedRecords || [])) {
    localStorage.removeItem(pendingKey(resource));
  }
}

function getResourceCollection(resource) {
  return {
    diarists: state.diarists,
    demands: state.demands,
    stores: state.stores,
    sectors: state.sectors,
    sectorRates: state.sectorRates,
    companyRates: state.companyRates,
    financialRecords: state.financialRecords,
  }[resource];
}

function replaceResourceCollection(resource, records) {
  if (resource === "diarists") state.diarists = normalizeDiarists(records);
  if (resource === "demands") state.demands = normalizeDemands(records);
  if (resource === "stores") state.stores = mergeRequiredStores(normalizeStores(records));
  if (resource === "sectors") state.sectors = mergeRequiredSectors(records);
  if (resource === "sectorRates") state.sectorRates = normalizeSectorRates(records);
  if (resource === "companyRates") state.companyRates = normalizeCompanyRates(records);
  if (resource === "financialRecords") state.financialRecords = normalizeFinancialRecords(records);
}

function resourceForEntity(entity) {
  return {
    diarist: "diarists",
    demand: "demands",
    store: "stores",
    sectorRate: "sectorRates",
    companyRate: "companyRates",
    financialRecord: "financialRecords",
  }[entity];
}

function queueBackendSync(key, value) {
  const resource = backendResourceByStorageKey[key];
  if (!backendReady || !resource || !window.directBackend?.enabled) return;
  clearTimeout(backendSyncTimers[resource]);
  backendSyncTimers[resource] = setTimeout(() => {
    syncResourceToBackend(resource, value).catch((error) => console.warn(`Falha ao sincronizar ${resource} no Supabase`, error));
  }, 180);
}

async function syncResourceToBackend(resource, records) {
  const backend = window.directBackend;
  if (!backend?.enabled) return;
  const current = Array.isArray(records) ? records : [];
  await Promise.all(current.map((record) => backend.upsert(resource, record)));
  await syncDeletedToBackend(resource);
  clearBackendPending(resource, current);
}

async function syncDeletedToBackend(resource) {
  const backend = window.directBackend;
  if (!backendReady || !backend?.enabled) return;
  const deletedIds = readBackendDeleted(resource);
  for (const id of deletedIds) {
    await backend.remove(resource, id);
    clearBackendDeleted(resource, id);
  }
}

async function hydrateFromBackend() {
  const backend = window.directBackend;
  if (!backend?.enabled) return;

  const resources = ["stores", "diarists", "sectors", "sectorRates", "companyRates", "demands"];
  if (state.access.canViewFinance) resources.push("financialRecords");
  for (const resource of resources) {
    const pending = readBackendPending(resource);
    if (pending?.records) {
      replaceResourceCollection(resource, pending.records);
      await syncResourceToBackend(resource, getResourceCollection(resource));
      continue;
    }

    const remote = await backend.list(resource);
    if (remote?.length) {
      replaceResourceCollection(resource, remote);
    } else {
      await syncResourceToBackend(resource, getResourceCollection(resource));
    }
  }

  backendReady = false;
  persistCoreData({ pending: false });
  backendReady = true;
  await Promise.all(resources.map((resource) => syncResourceToBackend(resource, getResourceCollection(resource))));
  await Promise.all(resources.map((resource) => syncDeletedToBackend(resource)));
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function formatCPF(value) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function isValidCPF(value) {
  const digits = onlyDigits(value);
  const knownFictional = new Set(["01234567890", "12345678909", "98765432100"]);
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits) || knownFictional.has(digits)) return false;
  const calculateDigit = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(digits[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10]);
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d{1,2})/, "($1");
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, "($1) $2");
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, "($1) $2-$3");
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
}

function isValidPhone(value) {
  const digits = onlyDigits(value);
  if (!/^\d{10,11}$/.test(digits) || digits.startsWith("00")) return false;
  return digits.length === 10 || digits[2] === "9";
}

function cpfForDisplay(value) {
  const formatted = formatCPF(value);
  if (!formatted) return "Nao informado";
  if (state.access.canViewFullCpf) return formatted;
  return `***.***.***-${onlyDigits(value).slice(-2).padStart(2, "*")}`;
}

function repairText(value) {
  let text = String(value ?? "");
  text = text
    .replaceAll("âœ“", "__DIRECT_CHECK__")
    .replaceAll("â€¢", "__DIRECT_BULLET__")
    .replaceAll("Â·", "__DIRECT_DOT__")
    .replaceAll("Ã—", "__DIRECT_TIMES__");

  const restoreSymbols = (current) => current
    .replaceAll("__DIRECT_CHECK__", "✓")
    .replaceAll("__DIRECT_BULLET__", "•")
    .replaceAll("__DIRECT_DOT__", "·")
    .replaceAll("__DIRECT_TIMES__", "×");

  if (!/[ÃÂ]/.test(text)) return restoreSymbols(text);
  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff);
    const repaired = new TextDecoder("utf-8").decode(bytes);
    return restoreSymbols(repaired.includes("�") ? text : repaired);
  } catch {
    return restoreSymbols(text);
  }
}

function normalizeDemandStatus(status) {
  const normalized = normalizeText(repairText(status));
  if (normalized.includes("falta")) return "Falta";
  if (normalized.includes("concluida")) return "Concluída";
  if (normalized.includes("escala")) return "Em escala";
  return "Aberta";
}

function normalizeDiaristStatus(status) {
  const normalized = normalizeText(repairText(status));
  if (normalized.includes("inativa")) return "Inativa";
  if (normalized.includes("reserva")) return "Reserva";
  return "Ativa";
}

function normalizeTextForSeed(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function isValidSectorName(sector) {
  const normalized = normalizeText(sector);
  return Boolean(normalized) && !["object object", "[object object]"].includes(normalized);
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function storeIdentity(store) {
  return normalizeText(`${store.network || store.owner || ""}|${store.name}|${store.address || store.city || ""}`);
}

function mergeRequiredStores(stores) {
  const merged = [...stores];
  const existing = new Set(merged.map(storeIdentity));
  requiredStores.forEach((store) => {
    const identity = storeIdentity(store);
    if (!existing.has(identity)) {
      merged.push(store);
      existing.add(identity);
    }
  });
  return merged;
}

function mergeRequiredSectors(sectors) {
  const cleaned = sectors
    .map((sector) => (typeof sector === "string" ? sector : sector?.sector || sector?.name || ""))
    .map(repairText)
    .map((sector) => sector.trim())
    .filter(isValidSectorName);
  const merged = [...new Set(cleaned)];
  const existing = new Set(merged.map(normalizeText));
  requiredSectors.forEach((sector) => {
    const identity = normalizeText(sector);
    if (!existing.has(identity)) {
      merged.push(sector);
      existing.add(identity);
    }
  });
  return merged;
}

function parseSectorList(value) {
  return repairText(value)
    .split(",")
    .map((sector) => sector.trim())
    .filter(Boolean);
}

function syncDiaristSectorInput() {
  const input = document.getElementById("diaristSectorsInput");
  if (input) input.value = state.selectedDiaristSectors.join(", ");
}

function addSectorToSelection(sector) {
  const clean = String(sector || "").trim();
  if (!isValidSectorName(clean)) return;
  if (!state.selectedDiaristSectors.some((item) => normalizeText(item) === normalizeText(clean))) {
    state.selectedDiaristSectors.push(clean);
  }
  syncDiaristSectorInput();
  renderDiaristSectorPicker();
}

function createSector(sector) {
  const clean = String(sector || "").trim();
  if (!isValidSectorName(clean)) return;
  if (!state.sectors.some((item) => normalizeText(item) === normalizeText(clean))) {
    state.sectors.push(clean);
    state.sectors.sort((a, b) => a.localeCompare(b, "pt-BR"));
    writeStore(storageKeys.sectors, state.sectors);
  }
  addSectorToSelection(clean);
}

function normalizeStores(stores) {
  return stores.map((store) => ({
    id: store.id || uid("store"),
    name: repairText(store.name || "Loja sem nome"),
    network: repairText(store.network || (store.type === "Rede" ? store.name : "")),
    type: repairText(store.type || "Loja"),
    owner: repairText(store.owner || "Direct Promoções"),
    city: repairText(store.city || ""),
    address: repairText(store.address || ""),
    health: repairText(store.health || "Alta"),
  }));
}

function normalizeDiarists(diarists) {
  return diarists.map((diarist) => ({
    id: diarist.id || uid("diarist"),
    name: repairText(diarist.name || "Diarista sem nome"),
    phone: repairText(diarist.phone || ""),
    cpf: repairText(diarist.cpf || ""),
    neighborhood: repairText(diarist.neighborhood || diarist.bairro || ""),
    sectors: repairText(diarist.sectors || ""),
    status: normalizeDiaristStatus(diarist.status),
  }));
}

function normalizeDemands(demands) {
  return demands.map((demand) => {
    const store = demand.storeId ? getStore(demand.storeId) : findStoreByName(demand.store);
    const startDate = demand.startDate || demand.date || new Date().toISOString().slice(0, 10);
    const endDate = demand.endDate || demand.finishDate || startDate;
    return {
      id: demand.id || uid("demand"),
      storeId: demand.storeId || store?.id || state?.stores?.[0]?.id || "",
      date: startDate,
      startDate,
      endDate,
      startTime: demand.startTime || demand.horario || "08:00",
      sector: repairText(demand.sector || requiredSectors[0]),
      spots: positiveInt(demand.spots, 1),
      workerCost: nonNegativeMoney(demand.workerCost || 120),
      assignedDiaristIds: Array.isArray(demand.assignedDiaristIds) ? demand.assignedDiaristIds : [],
      status: normalizeDemandStatus(demand.status),
    };
  });
}

function normalizeSectorRates(rates) {
  const normalized = rates.map((item) => ({
    id: item.id || uid("rate"),
    sector: repairText(typeof item.sector === "string" ? item.sector : String(item.sector?.sector || item.sector?.name || "")),
    minValue: nonNegativeMoney(item.minValue ?? 80),
    maxValue: nonNegativeMoney(item.maxValue ?? 90),
  })).filter((item) => item.sector);

  const existing = new Set(normalized.map((item) => normalizeText(item.sector)));
  requiredSectors.forEach((sector) => {
    if (!existing.has(normalizeText(sector))) {
      normalized.push({ id: `rate-${normalizeTextForSeed(sector)}`, sector, minValue: 80, maxValue: 90 });
    }
  });

  return normalized;
}

function normalizeCompanyRates(rates) {
  const normalized = rates.map((item) => ({
    id: item.id || uid("company-rate"),
    company: repairText(typeof item.company === "string" ? item.company : String(item.company?.network || item.company?.name || "")),
    value: nonNegativeMoney(item.value ?? 0),
  })).filter((item) => item.company);

  const existing = new Set(normalized.map((item) => normalizeText(item.company)));
  fallbackCompanyRates.forEach((rate) => {
    if (!existing.has(normalizeText(rate.company))) normalized.push(rate);
  });

  return normalized;
}

function normalizeFinancialRecords(records) {
  return (Array.isArray(records) ? records : []).map((record) => ({
    id: record.id || uid("financial"),
    diaristId: record.diaristId || "",
    diaristName: repairText(record.diaristName || ""),
    store: repairText(record.store || ""),
    date: record.date || new Date().toISOString().slice(0, 10),
    startTime: record.startTime || "",
    endTime: record.endTime || "",
    sector: repairText(record.sector || ""),
    dailyValue: nonNegativeMoney(record.dailyValue || 0),
    transport: nonNegativeMoney(record.transport || 0),
    advance: nonNegativeMoney(record.advance || 0),
    extraCosts: nonNegativeMoney(record.extraCosts || 0),
    paid: Boolean(record.paid),
    paidAt: record.paidAt || null,
    notes: repairText(record.notes || ""),
    createdAt: record.createdAt || new Date().toISOString(),
  }));
}

function formatShort(value) {
  return currency.format(Number(value || 0)).replace(/\s/g, " ");
}

function formatMoney(value) {
  return currencyWithCents.format(Number(value || 0)).replace(/\s/g, " ");
}

function parseMoney(value) {
  if (typeof value === "number") return value;
  const raw = String(value || "").trim();
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nonNegativeMoney(value) {
  return Math.max(0, parseMoney(value));
}

function positiveInt(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function getStore(id) {
  return state.stores.find((store) => store.id === id);
}

function findStoreByName(name) {
  return state.stores.find((store) => normalizeText(store.name) === normalizeText(name) || normalizeText(store.network) === normalizeText(name));
}

function getDiarist(id) {
  return state.diarists.find((diarist) => diarist.id === id);
}

function storeDisplayName(store) {
  if (!store) return "Loja não definida";
  return store.network && store.network !== store.name ? `${store.network} - ${store.name}` : store.name;
}

function demandRevenue(demand) {
  return positiveInt(demand.spots, 0) * demandDays(demand) * supermarketDailyRate(demand);
}

function demandCost(demand) {
  return demandRequestedCount(demand) * nonNegativeMoney(demand.workerCost || 0);
}

function demandMargin(demand) {
  return demandRevenue(demand) - demandCost(demand);
}

function demandRequestedCount(demand) {
  return positiveInt(demand.spots, 0) * demandDays(demand);
}

function demandAttendedCount(demand) {
  const filled = Number(demand.assignedDiaristIds?.length || 0) * demandDays(demand);
  return Math.min(demandRequestedCount(demand), filled);
}

function demandMissingCount(demand) {
  return Math.max(0, demandRequestedCount(demand) - demandAttendedCount(demand));
}

function totalFinance() {
  return state.demands.reduce((sum, demand) => sum + demandRevenue(demand), 0);
}

function dateToTime(value) {
  const time = new Date(`${value || ""}T00:00:00`).getTime();
  return Number.isFinite(time) ? time : Date.now();
}

function demandDays(demand) {
  const start = dateToTime(demand.startDate || demand.date);
  const end = dateToTime(demand.endDate || demand.startDate || demand.date);
  return Math.max(1, Math.round((end - start) / 86400000) + 1);
}

function supermarketDailyRate(demand) {
  return parseMoney(companyRateForDemand(demand)?.value || 0);
}

function companyRateForDemand(demand) {
  const store = getStore(demand.storeId);
  const candidates = [store?.network, store?.name, store ? storeDisplayName(store) : ""]
    .filter(Boolean)
    .map((item) => normalizeText(item));
  return state.companyRates.find((item) => candidates.includes(normalizeText(item.company))) || null;
}

function formatDemandPeriod(demand) {
  const start = demand.startDate || demand.date;
  const end = demand.endDate || start;
  return start === end ? start : `${start} ate ${end}`;
}

function normalizeDemandPeriod(startDate, endDate) {
  const start = startDate || new Date().toISOString().slice(0, 10);
  const end = endDate && dateToTime(endDate) >= dateToTime(start) ? endDate : start;
  return { start, end };
}

function demandNetworkName(demand) {
  const store = getStore(demand.storeId);
  return store?.network || store?.name || "Sem rede";
}

function demandInFinancePeriod(demand) {
  const today = dateToTime(new Date().toISOString().slice(0, 10));
  const windowEnd = today + Math.max(1, Number(state.period || 30)) * 86400000;
  const start = dateToTime(demand.startDate || demand.date);
  const end = dateToTime(demand.endDate || demand.startDate || demand.date);
  return end >= today && start <= windowEnd;
}

function financeFilteredDemands() {
  return state.demands.filter((demand) => {
    const store = getStore(demand.storeId);
    const network = demandNetworkName(demand);
    const networkMatches = !state.financeNetworkFilter || normalizeText(network) === normalizeText(state.financeNetworkFilter);
    const storeMatches = !state.financeStoreFilter || store?.id === state.financeStoreFilter;
    return demandInFinancePeriod(demand) && networkMatches && storeMatches;
  });
}

function normalizeFinanceFilterState() {
  const networks = Array.from(new Set(state.stores.map((store) => store.network || store.name).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
  if (state.financeNetworkFilter && !networks.some((network) => normalizeText(network) === normalizeText(state.financeNetworkFilter))) {
    state.financeNetworkFilter = "";
  }
  const stores = state.stores
    .filter((store) => !state.financeNetworkFilter || normalizeText(store.network || store.name) === normalizeText(state.financeNetworkFilter))
    .sort((a, b) => storeDisplayName(a).localeCompare(storeDisplayName(b), "pt-BR"));
  if (state.financeStoreFilter && !stores.some((store) => store.id === state.financeStoreFilter)) {
    state.financeStoreFilter = "";
  }
  return { networks, stores };
}

function renderFinanceFilters(filteredDemands) {
  const networkSelect = document.getElementById("financeNetworkFilter");
  const storeSelect = document.getElementById("financeStoreFilter");
  const { networks, stores } = normalizeFinanceFilterState();
  if (networkSelect) {
    networkSelect.innerHTML = `<option value="">Todas as redes</option>${networks.map((network) => `<option value="${escapeHTML(network)}">${escapeHTML(network)}</option>`).join("")}`;
    networkSelect.value = state.financeNetworkFilter;
  }
  if (storeSelect) {
    storeSelect.innerHTML = `<option value="">Todas as lojas</option>${stores.map((store) => `<option value="${escapeHTML(store.id)}">${escapeHTML(storeDisplayName(store))}</option>`).join("")}`;
    storeSelect.value = state.financeStoreFilter;
  }

  setText("financeFilterSummary", `${state.period} dias - ${filteredDemands.length} demandas`);
}

function applyTheme(theme) {
  state.theme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem(storageKeys.theme, state.theme);

  const button = document.getElementById("themeToggle");
  if (button) {
    const isDark = state.theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("aria-label", isDark ? "Alternar para modo claro" : "Alternar para modo escuro");
    button.setAttribute("title", isDark ? "Ativar modo claro" : "Ativar modo escuro");
    button.classList.toggle("is-dark", isDark);
    button.classList.toggle("is-light", !isDark);
  }

  const meta = document.getElementById("themeColorMeta");
  if (meta) meta.setAttribute("content", cssVar("--sidebar-bg") || "#051a46");
}

function applySidebarState(collapsed) {
  state.sidebarCollapsed = Boolean(collapsed);
  localStorage.setItem(storageKeys.sidebar, String(state.sidebarCollapsed));
  const shell = document.getElementById("appShell");
  const button = document.getElementById("sidebarToggle");
  shell?.classList.toggle("sidebar-collapsed", state.sidebarCollapsed);
  if (button) {
    button.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
    button.setAttribute("aria-label", state.sidebarCollapsed ? "Expandir menu" : "Recolher menu");
    button.setAttribute("title", state.sidebarCollapsed ? "Expandir menu" : "Recolher menu");
    button.innerHTML = `<i data-lucide="${state.sidebarCollapsed ? "panel-left-open" : "panel-left-close"}"></i>`;
  }
  if (window.lucide) window.lucide.createIcons();
}

function switchView(view) {
  const requestedView = viewMeta[view] ? view : "dashboard";
  state.view = requestedView === "financeiro" && !state.access.canViewFinance ? "dashboard" : requestedView;
  state.query = "";
  document.body.classList.toggle("jarvis-active", state.view === "jarvis");
  const [eyebrow, title] = viewMeta[state.view];
  setText("pageEyebrow", eyebrow);
  setText("pageTitle", title);

  const searchWrapper = document.getElementById("globalSearchWrapper");
  const search = document.getElementById("searchInput");
  const showSearch = ["diaristas", "demandas"].includes(state.view);
  if (searchWrapper) searchWrapper.hidden = !showSearch;
  if (search) {
    search.value = "";
    search.placeholder = showSearch ? {
      diaristas: "Buscar diarista, CPF, telefone ou setor",
      demandas: "Buscar demanda, loja, setor ou status",
    }[state.view] : "";
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });

  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === state.view);
  });

  const periodFilter = document.getElementById("periodFilter");
  if (periodFilter) {
    periodFilter.hidden = !["dashboard", "financeiro"].includes(state.view);
  }

  if (state.view === "jarvis") {
    window.requestAnimationFrame(initJarvisOrb);
  }

  render();
}

function filteredWeeks() {
  if (state.period === 30) return baseWeeks.slice(-4);
  if (state.period === 60) return baseWeeks.slice(-5);
  if (state.period === 90) return baseWeeks.slice(-6);
  return baseWeeks;
}

function periodFactor() {
  return state.period / 30;
}

function renderKpis() {
  const factor = periodFactor();
  const revenue = totalFinance() * Math.min(factor, 2.2);
  const attended = countAssignedDiarists();
  const closedDemands = state.demands.filter((item) => item.status === "Concluída").length;
  const conversion = state.demands.length ? Math.round((closedDemands / state.demands.length) * 100) : 0;
  const margin = state.demands.reduce((sum, demand) => sum + demandMargin(demand), 0);
  const goalProgress = Math.min(99, Math.round((totalFinance() / Number(state.settings.monthlyGoal || 1)) * 100));

  setText("revenueValue", formatShort(revenue));
  setText("revenueTrend", `${state.demands.length} demandas no período`);
  setText("attendedValue", attended);
  setText("attendedTrend", attended === 1 ? "diária atendida" : "diárias atendidas");
  setText("conversionValue", `${conversion}%`);
  setText("conversionTrend", `${closedDemands} demandas concluídas`);
  setText("marginValue", formatShort(margin));
  setText("marginTrend", margin >= 0 ? "resultado positivo" : "resultado negativo");
  setText("sidebarGoal", `${goalProgress}% concluída`);
}

function countAssignedDiarists() {
  return state.demands.reduce((sum, demand) => sum + (demand.assignedDiaristIds?.length || 0), 0);
}

function chartColor(index) {
  return [cssVar("--brand-blue"), cssVar("--success"), cssVar("--yellow"), cssVar("--danger"), cssVar("--violet"), cssVar("--brand-blue-deep")][index % 6];
}

function drawDonutChart(canvasId, legendId, rows, options = {}) {
  const canvas = document.getElementById(canvasId);
  const legend = document.getElementById(legendId);
  if (!canvas || !legend) return;

  const ctx = canvas.getContext("2d");
  const center = canvas.width / 2;
  const total = rows.reduce((sum, item) => sum + Number(item.value || 0), 0);
  let start = -Math.PI / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!total) {
    ctx.beginPath();
    ctx.arc(center, center, 86, 0, Math.PI * 2);
    ctx.lineWidth = 34;
    ctx.strokeStyle = cssVar("--line");
    ctx.stroke();
    ctx.fillStyle = cssVar("--muted");
    ctx.font = "800 22px Segoe UI, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("0", center, center + 8);
    ctx.textAlign = "start";
    legend.innerHTML = `<div class="legend-item empty">Sem dados no período</div>`;
    return;
  }

  rows.forEach((item, index) => {
    const angle = (Number(item.value || 0) / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(center, center, 86, start, start + angle);
    ctx.lineWidth = 34;
    ctx.strokeStyle = item.color || chartColor(index);
    ctx.stroke();
    start += angle;
  });

  ctx.beginPath();
  ctx.arc(center, center, 48, 0, Math.PI * 2);
  ctx.fillStyle = cssVar("--surface");
  ctx.fill();
  ctx.fillStyle = cssVar("--ink");
  ctx.font = "800 22px Segoe UI, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(options.centerLabel || String(total), center, center + 8);
  ctx.textAlign = "start";

  legend.innerHTML = rows
    .map((item, index) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${item.color || chartColor(index)}"></span>
        <span>${escapeHTML(item.label)}</span>
        <strong>${options.formatValue ? options.formatValue(item.value) : item.value}</strong>
      </div>
    `)
    .join("");
}

function aggregateDemandsBy(getKey, getValue, demands = state.demands) {
  const map = new Map();
  demands.forEach((demand) => {
    const key = getKey(demand) || "Sem classificação";
    map.set(key, (map.get(key) || 0) + getValue(demand));
  });
  return Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function drawFinanceTimeline(rows) {
  const canvas = document.getElementById("financeTimelineCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 24, right: 24, bottom: 44, left: 118 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.revenue, row.cost, row.profit]));
  const series = [
    { key: "revenue", label: "Faturamento", color: cssVar("--brand-blue") },
    { key: "cost", label: "Custo", color: cssVar("--danger") },
    { key: "profit", label: "Lucro", color: cssVar("--success") },
  ];

  ctx.clearRect(0, 0, width, height);
  ctx.font = "12px Segoe UI, Arial, sans-serif";
  ctx.lineWidth = 1;
  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (chartHeight / 4) * index;
    const value = maxValue * (1 - index / 4);
    ctx.strokeStyle = cssVar("--line");
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillStyle = cssVar("--muted");
    ctx.textAlign = "right";
    ctx.fillText(formatMoney(value), padding.left - 10, y + 4);
  }

  if (!rows.length) {
    ctx.fillStyle = cssVar("--muted");
    ctx.textAlign = "center";
    ctx.fillText("Nenhum dado no período selecionado", padding.left + chartWidth / 2, padding.top + chartHeight / 2);
    return;
  }

  const xFor = (index) => padding.left + (rows.length === 1 ? chartWidth / 2 : (chartWidth / (rows.length - 1)) * index);
  const yFor = (value) => padding.top + chartHeight - (Number(value || 0) / maxValue) * chartHeight;
  series.forEach((item) => {
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    rows.forEach((row, index) => {
      const x = xFor(index);
      const y = yFor(row[item.key]);
      if (index === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    rows.forEach((row, index) => {
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(xFor(index), yFor(row[item.key]), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  const labelStep = Math.max(1, Math.ceil(rows.length / 6));
  rows.forEach((row, index) => {
    if (index % labelStep && index !== rows.length - 1) return;
    ctx.fillStyle = cssVar("--muted");
    ctx.textAlign = "center";
    ctx.fillText(formatDateLabel(row.date), xFor(index), height - 16);
  });

  let legendX = padding.left;
  series.forEach((item) => {
    ctx.fillStyle = item.color;
    ctx.fillRect(legendX, 4, 12, 3);
    ctx.fillStyle = cssVar("--muted");
    ctx.textAlign = "left";
    ctx.fillText(item.label, legendX + 18, 9);
    legendX += 112;
  });
}

function formatDateLabel(value) {
  if (!value) return "Sem data";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
}

function renderDashboardCharts() {
  const revenueRows = aggregateDemandsBy((demand) => storeDisplayName(getStore(demand.storeId)).split(" - ")[0], demandRevenue);
  const attendedRows = aggregateDemandsBy((demand) => storeDisplayName(getStore(demand.storeId)).split(" - ")[0], (demand) => demand.assignedDiaristIds?.length || 0);
  const sectorRows = aggregateDemandsBy((demand) => demand.sector, () => 1);
  const revenueTotal = revenueRows.reduce((sum, item) => sum + item.value, 0);
  const attendedTotal = attendedRows.reduce((sum, item) => sum + item.value, 0);
  const sectorTotal = sectorRows.reduce((sum, item) => sum + item.value, 0);

  setText("revenuePieTotal", formatShort(revenueTotal));
  setText("attendedPieTotal", `${attendedTotal} ${attendedTotal === 1 ? "diária" : "diárias"}`);
  setText("sectorPieTotal", `${sectorTotal} ${sectorTotal === 1 ? "demanda" : "demandas"}`);

  drawDonutChart("revenuePieChart", "revenuePieLegend", revenueRows, {
    centerLabel: formatShort(revenueTotal).replace("R$ ", ""),
    formatValue: formatShort,
  });
  drawDonutChart("attendedPieChart", "attendedPieLegend", attendedRows, {
    centerLabel: String(attendedTotal),
    formatValue: (value) => `${value}x`,
  });
  drawDonutChart("sectorPieChart", "sectorPieLegend", sectorRows, {
    centerLabel: String(sectorTotal),
    formatValue: (value) => `${value}`,
  });
}

function matchesQuery(item) {
  const query = normalizeText(state.query);
  if (!query) return true;
  return Object.values(item).some((value) => normalizeText(Array.isArray(value) ? value.join(" ") : value).includes(query));
}

function renderRecordList(containerId, records, template, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const filtered = options.skipGlobalQuery ? records : records.filter(matchesQuery);
  container.innerHTML = filtered.length
    ? filtered.map(template).join("")
    : `<div class="record-item"><div><strong>Nenhum registro encontrado</strong><span>A busca atual não retornou resultados.</span></div></div>`;
}

function actionButtons(entity, id, options = {}) {
  const destructiveButton = entity === "diarist"
    ? `<button class="icon-btn compact danger" type="button" data-action="deactivate-diarist" data-id="${escapeHTML(id)}" title="Inativar" aria-label="Inativar diarista" ${options.inactive ? "disabled" : ""}><i data-lucide="user-x"></i></button>`
    : `<button class="icon-btn compact danger" type="button" data-action="delete" data-entity="${entity}" data-id="${escapeHTML(id)}" title="Excluir" aria-label="Excluir"><i data-lucide="trash-2"></i></button>`;
  return `
    <button class="icon-btn compact" type="button" data-action="edit" data-entity="${entity}" data-id="${escapeHTML(id)}" title="Editar" aria-label="Editar"><i data-lucide="pencil"></i></button>
    ${destructiveButton}
  `;
}

function addressCopyButton(store) {
  const address = store.address || [store.name, store.city].filter(Boolean).join(" - ");
  const disabled = address ? "" : "disabled";
  return `
    <button class="icon-btn round copy-address-btn" type="button" data-action="copy-address" data-address="${escapeHTML(address)}" ${disabled} title="Copiar endereço" aria-label="Copiar endereço de ${escapeHTML(storeDisplayName(store))}">
      <i data-lucide="copy"></i>
    </button>
  `;
}

function renderDiarists() {
  const filteredDiarists = state.diarists.filter((item) => normalizeText(item.name).includes(normalizeText(state.diaristQuery)));
  setText("diaristCount", `${filteredDiarists.length}/${state.diarists.length} cadastradas`);
  renderRecordList("diaristList", filteredDiarists, (item) => `
    <div class="record-item">
      <div>
        <strong>${escapeHTML(item.name)}</strong>
        <span>${escapeHTML(formatPhone(item.phone))} · CPF ${escapeHTML(cpfForDisplay(item.cpf))} · ${escapeHTML(item.sectors || "Sem setor")}</span>
      </div>
      <div class="record-actions">
        <select class="status-select" data-diarist-status="${escapeHTML(item.id)}">
          ${["Ativa", "Reserva", "Inativa"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        ${actionButtons("diarist", item.id, { inactive: item.status === "Inativa" })}
      </div>
    </div>
  `);
}

function availableDiaristsForDemand(demand) {
  return state.diarists
    .filter((diarist) => {
    const active = diarist.status !== "Inativa";
    const alreadyAssigned = demand.assignedDiaristIds.includes(diarist.id);
    return active && !alreadyAssigned;
  })
    .sort((a, b) => Number(isDiaristCompatible(b, demand)) - Number(isDiaristCompatible(a, demand)) || a.name.localeCompare(b.name, "pt-BR"));
}

function isDiaristCompatible(diarist, demand) {
  return normalizeText(diarist.sectors).includes(normalizeText(demand.sector));
}

function renderAssignedDiarists(demand) {
  if (!demand.assignedDiaristIds.length) return `<span class="muted-line">Nenhuma diarista escalada ainda.</span>`;
  return demand.assignedDiaristIds
    .map((id) => {
      const diarist = getDiarist(id);
      if (!diarist) return "";
      const compatibility = isDiaristCompatible(diarist, demand) ? "Compatível" : "Fora do setor";
      return `<span class="chip removable ${isDiaristCompatible(diarist, demand) ? "" : "warning"}">${escapeHTML(diarist.name)} · ${compatibility} <button type="button" data-action="unassign" data-demand-id="${escapeHTML(demand.id)}" data-diarist-id="${escapeHTML(id)}" aria-label="Remover diarista">×</button></span>`;
    })
    .join("");
}

function demandMatchesTab(demand) {
  const status = normalizeText(demand.status);
  if (state.demandStatusTab === "waiting") return status === "aberta" || status.includes("escala");
  if (state.demandStatusTab === "present") return status.includes("concluida");
  if (state.demandStatusTab === "absent") return status.includes("falta");
  return true;
}

function demandCardTemplate(item) {
  const filled = item.assignedDiaristIds.length;
  const options = availableDiaristsForDemand(item);
  const compatibleCount = options.filter((diarist) => isDiaristCompatible(diarist, item)).length;
  const companyRate = supermarketDailyRate(item);
  const companyRateLabel = companyRate ? `${formatMoney(companyRate)}/dia` : "Nao configurado";
  return `
    <div class="record-item demand-card">
      <div class="demand-card-main">
        <div class="demand-time"><strong>${escapeHTML(item.startTime || "08:00")}</strong><span>${escapeHTML(formatDemandPeriod(item))}</span></div>
        <div>
          <strong>${escapeHTML(item.sector)}</strong>
          <span>${filled}/${item.spots} vagas - ${compatibleCount} compativeis - Recebe ${companyRateLabel} - Paga ${formatMoney(item.workerCost)}</span>
          <div class="assignment-row">
            <div class="chip-list">${renderAssignedDiarists(item)}</div>
            <div class="assign-control">
              <select class="status-select" data-assign-demand="${escapeHTML(item.id)}" ${filled >= item.spots || !options.length ? "disabled" : ""}>
                <option value="">Alocar diarista</option>
                ${options.map((diarist) => `<option value="${escapeHTML(diarist.id)}">${isDiaristCompatible(diarist, item) ? "OK" : "-"} ${escapeHTML(diarist.name)} - ${escapeHTML(diarist.sectors || "Sem setor")}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="record-actions">
        <select class="status-select" data-demand-status="${escapeHTML(item.id)}">
          ${["Aberta", "Em escala", "Concluida", "Falta"].map((status) => `<option ${normalizeText(item.status) === normalizeText(status) ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        ${actionButtons("demand", item.id)}
      </div>
    </div>
  `;
}

function renderDemands() {
  const counts = {
    all: state.demands.length,
    waiting: state.demands.filter((item) => ["aberta", "em escala"].includes(normalizeText(item.status))).length,
    present: state.demands.filter((item) => normalizeText(item.status).includes("concluida")).length,
    absent: state.demands.filter((item) => normalizeText(item.status).includes("falta")).length,
  };
  setText("demandTotalMetric", counts.all);
  setText("demandWaitingMetric", counts.waiting);
  setText("demandPresentMetric", counts.present);
  setText("demandAbsentMetric", counts.absent);
  setText("tabAllCount", counts.all);
  setText("tabWaitingCount", counts.waiting);
  setText("tabPresentCount", counts.present);
  setText("tabAbsentCount", counts.absent);

  const query = normalizeText(`${state.demandStoreQuery} ${state.query}`.trim());
  const filteredDemands = state.demands.filter((item) => {
    const store = getStore(item.storeId);
    const haystack = normalizeText(`${storeDisplayName(store)} ${store?.network || ""} ${item.sector} ${item.status} ${formatDemandPeriod(item)}`);
    return demandMatchesTab(item) && (!query || haystack.includes(query));
  });
  setText("demandCount", `${filteredDemands.length} demanda(s)`);

  const grouped = new Map();
  filteredDemands.forEach((demand) => {
    const store = getStore(demand.storeId);
    const network = store?.network || store?.name || "Sem rede";
    const storeKey = store?.id || `unknown-${demand.storeId}`;
    if (!grouped.has(network)) grouped.set(network, new Map());
    const stores = grouped.get(network);
    if (!stores.has(storeKey)) stores.set(storeKey, { store, demands: [] });
    stores.get(storeKey).demands.push(demand);
  });

  const container = document.getElementById("demandList");
  if (!container) return;
  if (!filteredDemands.length) {
    container.innerHTML = `<div class="record-item empty-state"><span>Nenhuma demanda encontrada.</span></div>`;
    return;
  }

  container.innerHTML = Array.from(grouped.entries()).map(([network, stores]) => {
    const networkCollapsed = state.collapsedDemandNetworks.has(network);
    const networkCount = Array.from(stores.values()).reduce((sum, group) => sum + group.demands.length, 0);
    return `
      <section class="demand-network-group">
        <button class="demand-group-toggle network" type="button" data-action="toggle-demand-network" data-group-key="${escapeHTML(network)}" aria-expanded="${!networkCollapsed}">
          <span><i data-lucide="chevron-${networkCollapsed ? "right" : "down"}"></i><i data-lucide="store"></i><strong>${escapeHTML(network)}</strong></span>
          <em>${networkCount} ${networkCount === 1 ? "demanda" : "demandas"}</em>
        </button>
        <div class="demand-network-content" ${networkCollapsed ? "hidden" : ""}>
          ${Array.from(stores.entries()).map(([storeKey, group]) => {
            const collapseKey = `${network}|${storeKey}`;
            const storeCollapsed = state.collapsedDemandStores.has(collapseKey);
            return `
              <div class="demand-store-group">
                <button class="demand-group-toggle store" type="button" data-action="toggle-demand-store" data-group-key="${escapeHTML(collapseKey)}" aria-expanded="${!storeCollapsed}">
                  <span><i data-lucide="chevron-${storeCollapsed ? "right" : "down"}"></i><strong>${escapeHTML(group.store?.name || "Loja nao definida")}</strong></span>
                  <em>${group.demands.length} ${group.demands.length === 1 ? "diaria" : "diarias"}</em>
                </button>
                <div class="demand-store-content" ${storeCollapsed ? "hidden" : ""}>${group.demands.map(demandCardTemplate).join("")}</div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderStores() {
  setText("storeCount", `${state.stores.length} registros`);
  const container = document.getElementById("storeList");
  if (!container) return;
  const groups = new Map();
  state.stores
    .slice()
    .sort((a, b) => storeDisplayName(a).localeCompare(storeDisplayName(b), "pt-BR"))
    .forEach((store) => {
      const network = store.network || store.name || "Sem rede";
      if (!groups.has(network)) groups.set(network, []);
      groups.get(network).push(store);
    });
  container.innerHTML = groups.size ? Array.from(groups.entries()).map(([network, stores]) => {
    const collapsed = state.collapsedStoreNetworks.has(network);
    return `
      <section class="demand-network-group store-network-group">
        <button class="demand-group-toggle network" type="button" data-action="toggle-store-network" data-group-key="${escapeHTML(network)}" aria-expanded="${!collapsed}">
          <span><i data-lucide="chevron-${collapsed ? "right" : "down"}"></i><i data-lucide="network"></i><strong>${escapeHTML(network)}</strong></span>
          <em>${stores.length} ${stores.length === 1 ? "loja" : "lojas"}</em>
        </button>
        <div class="demand-network-content store-network-content" ${collapsed ? "hidden" : ""}>
          ${stores.map((item) => `
            <div class="record-item">
              <div><strong>${escapeHTML(item.name)}</strong><span>${escapeHTML(item.type)} · ${escapeHTML(item.address || item.city || "Sem endereço")} · Responsável: ${escapeHTML(item.owner)}</span></div>
              <div class="record-actions">${addressCopyButton(item)}${actionButtons("store", item.id)}</div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }).join("") : `<div class="record-item"><div><strong>Nenhuma loja cadastrada</strong><span>Use a opção de adicionar rede ou loja.</span></div></div>`;
}

async function copyText(text) {
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below handles file:// and older mobile browsers.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

function showCopyFeedback(button, success) {
  button.classList.toggle("copied", success);
  button.classList.toggle("copy-failed", !success);
  button.setAttribute("title", success ? "Endereço copiado" : "Não foi possível copiar");
  button.setAttribute("aria-label", success ? "Endereço copiado" : "Não foi possível copiar endereço");
  button.innerHTML = `<i data-lucide="${success ? "check" : "copy-x"}"></i>`;
  if (window.lucide) window.lucide.createIcons();

  window.setTimeout(() => {
    button.classList.remove("copied", "copy-failed");
    button.setAttribute("title", "Copiar endereço");
    button.setAttribute("aria-label", "Copiar endereço");
    button.innerHTML = `<i data-lucide="copy"></i>`;
    if (window.lucide) window.lucide.createIcons();
  }, 1400);
}

function financialRecordAmount(record) {
  return nonNegativeMoney(record.dailyValue) + nonNegativeMoney(record.transport) + nonNegativeMoney(record.extraCosts) - nonNegativeMoney(record.advance);
}

function financeFilteredRecords() {
  const query = normalizeText(state.financialQuery);
  const selectedStore = state.financeStoreFilter ? getStore(state.financeStoreFilter) : null;
  return state.financialRecords.filter((record) => {
    const dateMatches = demandInFinancePeriod({ date: record.date, startDate: record.date, endDate: record.date });
    const haystack = normalizeText(`${record.diaristName} ${record.store} ${record.sector}`);
    const queryMatches = !query || haystack.includes(query);
    const storeMatches = !selectedStore || normalizeText(record.store).includes(normalizeText(selectedStore.name));
    const networkMatches = !state.financeNetworkFilter || normalizeText(record.store).includes(normalizeText(state.financeNetworkFilter));
    return dateMatches && queryMatches && storeMatches && networkMatches;
  });
}

function renderFinanceHistory(demands) {
  const container = document.getElementById("financeList");
  if (!container) return;
  const query = normalizeText(state.financialQuery);
  const visible = demands.filter((demand) => {
    const store = getStore(demand.storeId);
    return !query || normalizeText(`${demandNetworkName(demand)} ${storeDisplayName(store)} ${demand.sector} ${demand.status}`).includes(query);
  });
  const groups = new Map();
  visible.forEach((demand) => {
    const store = getStore(demand.storeId);
    const network = demandNetworkName(demand);
    const storeKey = store?.id || "sem-loja";
    if (!groups.has(network)) groups.set(network, new Map());
    const stores = groups.get(network);
    if (!stores.has(storeKey)) stores.set(storeKey, { store, demands: [] });
    stores.get(storeKey).demands.push(demand);
  });
  container.innerHTML = groups.size ? Array.from(groups.entries()).map(([network, stores]) => {
    const networkCollapsed = state.collapsedFinanceNetworks.has(network);
    const count = Array.from(stores.values()).reduce((sum, group) => sum + group.demands.length, 0);
    return `
      <section class="demand-network-group finance-history-group">
        <button class="demand-group-toggle network" type="button" data-action="toggle-finance-network" data-group-key="${escapeHTML(network)}" aria-expanded="${!networkCollapsed}">
          <span><i data-lucide="chevron-${networkCollapsed ? "right" : "down"}"></i><i data-lucide="network"></i><strong>${escapeHTML(network)}</strong></span>
          <em>${count} ${count === 1 ? "demanda" : "demandas"}</em>
        </button>
        <div class="demand-network-content" ${networkCollapsed ? "hidden" : ""}>
          ${Array.from(stores.entries()).map(([storeKey, group]) => {
            const collapseKey = `${network}|${storeKey}`;
            const storeCollapsed = state.collapsedFinanceStores.has(collapseKey);
            return `
              <div class="demand-store-group">
                <button class="demand-group-toggle store" type="button" data-action="toggle-finance-store" data-group-key="${escapeHTML(collapseKey)}" aria-expanded="${!storeCollapsed}">
                  <span><i data-lucide="chevron-${storeCollapsed ? "right" : "down"}"></i><strong>${escapeHTML(group.store?.name || "Loja não definida")}</strong></span>
                  <em>${group.demands.length} ${group.demands.length === 1 ? "registro" : "registros"}</em>
                </button>
                <div class="demand-store-content finance-history-content" ${storeCollapsed ? "hidden" : ""}>
                  ${group.demands.map((demand) => `
                    <div class="record-item finance-history-row">
                      <div>
                        <strong>${escapeHTML(formatDemandPeriod(demand))} · ${escapeHTML(demand.sector)}</strong>
                        <span>${demandRequestedCount(demand)} solicitadas · ${demandAttendedCount(demand)} atendidas · ${demandMissingCount(demand)} pendentes</span>
                        <span>Faturamento ${formatMoney(demandRevenue(demand))} · Custo ${formatMoney(demandCost(demand))} · Lucro ${formatMoney(demandMargin(demand))}</span>
                      </div>
                      <span class="health ${demandMargin(demand) >= 0 ? "alta" : "baixa"}">${escapeHTML(demand.status)}</span>
                    </div>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }).join("") : `<div class="record-item"><div><strong>Nenhuma demanda encontrada</strong><span>Ajuste os filtros para consultar outro período.</span></div></div>`;
}

function renderFinance() {
  normalizeFinanceFilterState();
  const demands = financeFilteredDemands();
  const records = financeFilteredRecords();
  renderFinanceFilters(demands);
  const total = demands.reduce((sum, demand) => sum + demandRevenue(demand), 0);
  const cost = demands.reduce((sum, demand) => sum + demandCost(demand), 0);
  const profit = total - cost;
  const requested = demands.reduce((sum, demand) => sum + demandRequestedCount(demand), 0);
  const attended = demands.reduce((sum, demand) => sum + demandAttendedCount(demand), 0);
  const absences = demands.filter((demand) => normalizeText(demand.status).includes("falta")).reduce((sum, demand) => sum + demandRequestedCount(demand), 0);
  const missing = demands.reduce((sum, demand) => sum + demandMissingCount(demand), 0);
  const margin = total ? (profit / total) * 100 : 0;
  const average = demands.length ? total / demands.length : 0;
  const transport = records.reduce((sum, record) => sum + nonNegativeMoney(record.transport), 0);
  const advances = records.reduce((sum, record) => sum + nonNegativeMoney(record.advance), 0);
  const extraCosts = records.reduce((sum, record) => sum + nonNegativeMoney(record.extraCosts), 0);
  const paid = records.filter((record) => record.paid).reduce((sum, record) => sum + financialRecordAmount(record), 0);
  const due = records.filter((record) => !record.paid).reduce((sum, record) => sum + financialRecordAmount(record), 0);

  setText("financialRecordCount", String(records.length));
  setText("financeTotal", formatMoney(total));
  setText("financeCost", formatMoney(cost));
  setText("financeProfit", formatMoney(profit));
  setText("financeMargin", `${margin.toFixed(2).replace(".", ",")}%`);
  setText("financeRequested", String(requested));
  setText("financeAttended", String(attended));
  setText("financeAbsences", String(absences + missing));
  setText("financeAverage", formatMoney(average));
  setText("financeTransport", formatMoney(transport));
  setText("financeAdvances", formatMoney(advances));
  setText("financeExtraCosts", formatMoney(extraCosts));
  setText("financePaid", formatMoney(paid));
  setText("financeDue", formatMoney(due));
  setText("financePotentialCount", `${demands.length} ${demands.length === 1 ? "demanda" : "demandas"} no período`);
  setText("financeConfirmedCount", `${requested} ${requested === 1 ? "diária solicitada" : "diárias solicitadas"}`);

  const report = document.getElementById("financeReport");
  if (report) report.innerHTML = `
    <div><span>Receita média por diária solicitada</span><strong>${formatMoney(requested ? total / requested : 0)}</strong></div>
    <div><span>Custo médio por diária solicitada</span><strong>${formatMoney(requested ? cost / requested : 0)}</strong></div>
    <div><span>Lucro médio por demanda</span><strong>${formatMoney(demands.length ? profit / demands.length : 0)}</strong></div>
    <div><span>Taxa de atendimento</span><strong>${requested ? ((attended / requested) * 100).toFixed(2).replace(".", ",") : "0,00"}%</strong></div>
    <div><span>Vagas ainda sem cobertura</span><strong>${missing}</strong></div>
    <div><span>Faltas registradas</span><strong>${absences}</strong></div>
  `;

  const networkRows = aggregateDemandsBy(demandNetworkName, demandRevenue, demands);
  const storeRows = aggregateDemandsBy((demand) => getStore(demand.storeId)?.name || "Loja não definida", demandRevenue, demands);
  const sectorRows = aggregateDemandsBy((demand) => demand.sector, demandRequestedCount, demands);
  drawDonutChart("financeNetworkCanvas", "financeNetworkLegend", networkRows, { centerLabel: String(demands.length), formatValue: formatMoney });
  drawDonutChart("financeStoreCanvas", "financeStoreLegend", storeRows, { centerLabel: String(demands.length), formatValue: formatMoney });
  drawDonutChart("financeSectorCanvas", "financeSectorLegend", sectorRows, { centerLabel: String(requested), formatValue: (value) => `${value} diárias` });

  const timelineMap = new Map();
  demands.forEach((demand) => {
    const date = demand.startDate || demand.date || "";
    const row = timelineMap.get(date) || { date, revenue: 0, cost: 0, profit: 0 };
    row.revenue += demandRevenue(demand);
    row.cost += demandCost(demand);
    row.profit += demandMargin(demand);
    timelineMap.set(date, row);
  });
  drawFinanceTimeline(Array.from(timelineMap.values()).sort((a, b) => a.date.localeCompare(b.date)));
  renderFinanceHistory(demands);
}

function renderSettings() {
  setText("sectorCount", `${state.sectors.length} setores`);
  const sectorOptions = document.getElementById("sectorOptions");
  const sectorSelect = document.getElementById("sectorSelect");
  const diaristSectorSelect = document.getElementById("diaristSectorSelect");
  const sectorRateSelect = document.getElementById("sectorRateSelect");
  const companyRateSelect = document.getElementById("companyRateSelect");
  const storeSelect = document.getElementById("demandStoreSelect");
  const sectorList = document.getElementById("sectorList");

  if (sectorOptions) {
    sectorOptions.innerHTML = state.sectors.map((sector) => `<option value="${escapeHTML(sector)}"></option>`).join("");
  }

  if (sectorSelect) {
    const current = sectorSelect.value;
    sectorSelect.innerHTML = state.sectors.map((sector) => `<option value="${escapeHTML(sector)}">${escapeHTML(sector)}</option>`).join("");
    if (typeof current === "string" && current && state.sectors.includes(current)) sectorSelect.value = current;
  }

  if (diaristSectorSelect) {
    const current = diaristSectorSelect.value;
    diaristSectorSelect.innerHTML = `<option value="">Escolher setor salvo</option>${state.sectors.map((sector) => `<option value="${escapeHTML(sector)}">${escapeHTML(sector)}</option>`).join("")}`;
    if (current && state.sectors.includes(current)) diaristSectorSelect.value = current;
  }

  if (sectorRateSelect) {
    const current = sectorRateSelect.value;
    sectorRateSelect.innerHTML = state.sectors.map((sector) => `<option value="${escapeHTML(sector)}">${escapeHTML(sector)}</option>`).join("");
    if (current && state.sectors.includes(current)) sectorRateSelect.value = current;
  }

  if (companyRateSelect) {
    const current = companyRateSelect.value;
    const companies = getCompanyRateOptions();
    companyRateSelect.innerHTML = companies.map((company) => `<option value="${escapeHTML(company)}">${escapeHTML(company)}</option>`).join("");
    if (current && companies.includes(current)) companyRateSelect.value = current;
  }

  if (storeSelect) {
    const current = storeSelect.value;
    storeSelect.innerHTML = state.stores.map((store) => `<option value="${escapeHTML(store.id)}">${escapeHTML(storeDisplayName(store))}</option>`).join("");
    if (current && state.stores.some((store) => store.id === current)) storeSelect.value = current;
  }

  if (sectorList) {
    sectorList.innerHTML = state.sectors.filter((sector) => matchesQuery({ sector })).map((sector) => `<span class="chip">${escapeHTML(sector)}</span>`).join("");
  }
  renderSectorRates();
  renderCompanyRates();
  renderDiaristSectorPicker();
}

function renderSectorRates() {
  setText("sectorRateCount", `${state.sectorRates.length} valores`);
  renderRecordList("sectorRateList", state.sectorRates, (item) => `
    <div class="record-item">
      <div>
        <strong>${escapeHTML(item.sector)}</strong>
        <span>${formatShort(item.minValue)} a ${formatShort(item.maxValue)}</span>
      </div>
      <div class="record-actions">
        <button class="icon-btn compact" type="button" data-action="edit" data-entity="sectorRate" data-id="${escapeHTML(item.id)}" title="Editar" aria-label="Editar"><i data-lucide="pencil"></i></button>
        <button class="icon-btn compact danger" type="button" data-action="delete" data-entity="sectorRate" data-id="${escapeHTML(item.id)}" title="Excluir" aria-label="Excluir"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `);
}

function getCompanyRateOptions() {
  return Array.from(new Set([
    ...state.companyRates.map((item) => item.company),
    ...state.stores.map((store) => store.network || store.name),
  ].filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function renderCompanyRates() {
  setText("companyRateCount", `${state.companyRates.length} valores`);
  renderRecordList("companyRateList", state.companyRates, (item) => `
    <div class="record-item">
      <div>
        <strong>${escapeHTML(item.company)}</strong>
        <span>${formatMoney(item.value)} por diária recebida</span>
      </div>
      <div class="record-actions">
        <button class="icon-btn compact" type="button" data-action="edit" data-entity="companyRate" data-id="${escapeHTML(item.id)}" title="Editar" aria-label="Editar"><i data-lucide="pencil"></i></button>
        <button class="icon-btn compact danger" type="button" data-action="delete" data-entity="companyRate" data-id="${escapeHTML(item.id)}" title="Excluir" aria-label="Excluir"><i data-lucide="trash-2"></i></button>
      </div>
    </div>
  `);
}

function renderDiaristSectorPicker() {
  const container = document.getElementById("selectedDiaristSectors");
  if (!container) return;
  syncDiaristSectorInput();
  container.classList.toggle("empty", !state.selectedDiaristSectors.length);
  container.innerHTML = state.selectedDiaristSectors.length
    ? state.selectedDiaristSectors.map((sector) => `<span class="chip removable">${escapeHTML(sector)} <button type="button" data-action="remove-selected-sector" data-sector="${escapeHTML(sector)}" aria-label="Remover setor">×</button></span>`).join("")
    : `<span class="muted-line">Nenhum setor selecionado.</span>`;
}

let jarvisOrbRuntime = null;
let jarvisBusy = false;

function initJarvisOrb() {
  const canvas = document.getElementById("jarvisOrbCanvas");
  const stage = canvas?.closest(".jarvis-orb-stage");
  const THREE = window.THREE;
  if (!canvas || !stage || !THREE) return;

  if (jarvisOrbRuntime) {
    jarvisOrbRuntime.resize();
    return;
  }

  try {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.05, 7.4);
    const group = new THREE.Group();
    scene.add(group);

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.38, 96, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0x010106,
        emissive: 0x09000f,
        emissiveIntensity: 0.7,
        metalness: 0.88,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.16,
      }),
    );
    group.add(core);

    const auraUniforms = { time: { value: 0 } };
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(1.63, 128, 128),
      new THREE.ShaderMaterial({
        uniforms: auraUniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexShader: `
          uniform float time;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            float ripple = sin(position.y * 12.0 + time * 2.4) * 0.035;
            ripple += sin(position.x * 9.0 - time * 1.8) * 0.025;
            vec3 displaced = position + normal * ripple;
            vPosition = displaced;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
          }
        `,
        fragmentShader: `
          uniform float time;
          varying vec3 vNormal;
          varying vec3 vPosition;
          void main() {
            float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.7);
            float energy = 0.55 + 0.45 * sin(time * 1.7 + vPosition.y * 8.0 + vPosition.x * 4.0);
            vec3 violet = vec3(0.49, 0.12, 1.0);
            vec3 crimson = vec3(1.0, 0.05, 0.22);
            vec3 color = mix(violet, crimson, energy);
            float alpha = fresnel * (0.58 + energy * 0.32);
            gl_FragColor = vec4(color, alpha);
          }
        `,
      }),
    );
    group.add(aura);

    const ringColors = [0xa45cff, 0xff315f, 0x7138ff];
    const rings = ringColors.map((color, index) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.05 + index * 0.32, 0.018 + index * 0.004, 16, 180),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.42 - index * 0.08, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      ring.rotation.set(0.7 + index * 0.44, 0.25 + index * 0.65, index * 0.38);
      group.add(ring);
      return ring;
    });

    const waves = Array.from({ length: 3 }, (_, index) => {
      const wave = new THREE.Mesh(
        new THREE.TorusGeometry(2.55, 0.008, 10, 160),
        new THREE.MeshBasicMaterial({ color: index % 2 ? 0xff315f : 0x9b5cff, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }),
      );
      wave.rotation.x = Math.PI / 2;
      group.add(wave);
      return wave;
    });

    const particleCount = 920;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const violet = new THREE.Color(0xa56dff);
    const red = new THREE.Color(0xff315f);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.0 + Math.random() * 2.65;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[index * 3 + 1] = radius * Math.cos(phi) * 0.66;
      positions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      const color = violet.clone().lerp(red, Math.random());
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({ size: 0.032, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    group.add(particles);

    scene.add(new THREE.AmbientLight(0x5f2b90, 1.4));
    const purpleLight = new THREE.PointLight(0x8b35ff, 16, 18);
    purpleLight.position.set(-2.8, 1.8, 3.2);
    scene.add(purpleLight);
    const redLight = new THREE.PointLight(0xff204f, 12, 16);
    redLight.position.set(2.7, -1.2, 2.5);
    scene.add(redLight);

    const pointer = { x: 0, y: 0 };
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width - 0.5) * 0.36;
      pointer.y = ((event.clientY - rect.top) / rect.height - 0.5) * 0.22;
    });
    stage.addEventListener("pointerleave", () => {
      pointer.x = 0;
      pointer.y = 0;
    });

    const resize = () => {
      const width = Math.max(1, stage.clientWidth);
      const height = Math.max(1, stage.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(stage);

    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const clock = new THREE.Clock();
    const animate = () => {
      const time = clock.getElapsedTime();
      auraUniforms.time.value = time;
      const breath = 1 + Math.sin(time * 1.45) * 0.035;
      core.scale.setScalar(breath);
      aura.scale.setScalar(1 + Math.sin(time * 1.15) * 0.055);
      particles.rotation.y = time * 0.055;
      particles.rotation.x = Math.sin(time * 0.12) * 0.12;
      rings.forEach((ring, index) => {
        ring.rotation.z += reducedMotion ? 0 : 0.0018 + index * 0.0008;
        ring.rotation.y += reducedMotion ? 0 : 0.001 + index * 0.0005;
      });
      waves.forEach((wave, index) => {
        const cycle = (time * 0.32 + index / waves.length) % 1;
        wave.scale.setScalar(0.72 + cycle * 0.62);
        wave.material.opacity = (1 - cycle) * 0.2;
      });
      group.rotation.y += (pointer.x - group.rotation.y) * 0.025;
      group.rotation.x += (-pointer.y - group.rotation.x) * 0.025;
      purpleLight.intensity = 14 + Math.sin(time * 1.7) * 4;
      redLight.intensity = 11 + Math.cos(time * 1.4) * 3;
      if (state.view === "jarvis") renderer.render(scene, camera);
      window.requestAnimationFrame(animate);
    };
    animate();
    jarvisOrbRuntime = { renderer, scene, camera, resize, resizeObserver };
  } catch (error) {
    console.warn("Falha ao iniciar a orbe Jarvis.", error);
  }
}

function jarvisOperationalResponse(prompt) {
  const normalized = normalizeText(prompt);
  const today = new Date().toISOString().slice(0, 10);
  const todaysDemands = state.demands.filter((demand) => {
    const start = demand.startDate || demand.date;
    const end = demand.endDate || start;
    return start <= today && end >= today;
  });
  const open = state.demands.filter((demand) => demand.status !== "Concluida" && normalizeText(demand.status) !== "concluida");
  const missing = state.demands.reduce((sum, demand) => sum + demandMissingCount(demand), 0);
  const activeDiarists = state.diarists.filter((diarist) => diarist.status !== "Inativa").length;

  if (normalized.includes("resumo") && normalized.includes("demanda")) {
    const requested = todaysDemands.reduce((sum, demand) => sum + demandRequestedCount(demand), 0);
    const attended = todaysDemands.reduce((sum, demand) => sum + demandAttendedCount(demand), 0);
    return `Hoje existem ${todaysDemands.length} demandas ativas no periodo, com ${requested} diarias solicitadas e ${attended} cobertas. Permanecem ${Math.max(0, requested - attended)} posicoes sem escala.`;
  }

  if (normalized.includes("check-in") || normalized.includes("checkin")) {
    const unfilled = open.filter((demand) => demandMissingCount(demand) > 0);
    if (!unfilled.length) return "Todas as demandas abertas estao com as vagas cobertas. O sistema ainda nao registra check-in individual; a analise atual usa as escalas confirmadas.";
    const names = unfilled.slice(0, 4).map((demand) => storeDisplayName(getStore(demand.storeId))).join(", ");
    return `${unfilled.length} demandas ainda possuem vagas sem diarista escalada: ${names}. O controle individual de check-in pode ser conectado na proxima etapa.`;
  }

  if (normalized.includes("loja") && normalized.includes("atras")) {
    const late = open.filter((demand) => (demand.endDate || demand.startDate || demand.date) < today);
    if (!late.length) return "Nao identifiquei lojas com demandas vencidas e ainda abertas neste momento.";
    const stores = Array.from(new Set(late.map((demand) => storeDisplayName(getStore(demand.storeId))))).slice(0, 6);
    return `Atencao: ${late.length} demandas vencidas continuam abertas em ${stores.join(", ")}. Recomendo revisar status e escala imediatamente.`;
  }

  if (normalized.includes("relatorio") || normalized.includes("executivo")) {
    if (!state.access.canViewFinance) {
      return `Relatorio operacional: ${state.demands.length} demandas cadastradas, ${activeDiarists} diaristas disponiveis, ${open.length} demandas abertas e ${missing} diarias sem cobertura. Indicadores financeiros exigem permissao especifica.`;
    }
    const revenue = state.demands.reduce((sum, demand) => sum + demandRevenue(demand), 0);
    const cost = state.demands.reduce((sum, demand) => sum + demandCost(demand), 0);
    return `Relatorio executivo: ${state.demands.length} demandas cadastradas, ${activeDiarists} diaristas disponiveis, faturamento previsto de ${formatMoney(revenue)}, custo previsto de ${formatMoney(cost)} e margem estimada de ${formatMoney(revenue - cost)}.`;
  }

  if (normalized.includes("operacao") || normalized.includes("tempo real") || normalized.includes("analisar")) {
    return `Analise operacional: ${open.length} demandas abertas, ${missing} diarias sem cobertura e ${activeDiarists} diaristas ativos ou em reserva. O principal risco atual esta nas demandas com vagas nao preenchidas.`;
  }

  return `Comando recebido. Posso analisar as ${state.demands.length} demandas, ${state.diarists.length} diaristas e ${state.stores.length} lojas${state.access.canViewFinance ? " e os indicadores financeiros cadastrados no sistema" : ""}.`;
}

function appendJarvisMessage(role, text, typing = false) {
  const container = document.getElementById("jarvisMessages");
  if (!container) return null;
  const item = document.createElement("div");
  item.className = `jarvis-message ${role}`;
  item.innerHTML = `
    <span class="jarvis-avatar"><i data-lucide="${role === "user" ? "user-round" : "brain-circuit"}"></i></span>
    <div class="jarvis-bubble">
      <strong>${role === "user" ? "Voce" : "Jarvis"}</strong>
      ${typing ? '<div class="jarvis-typing"><span></span><span></span><span></span></div>' : `<p>${escapeHTML(text)}</p>`}
    </div>
  `;
  container.appendChild(item);
  container.scrollTop = container.scrollHeight;
  if (window.lucide) window.lucide.createIcons();
  return item;
}

function typeJarvisResponse(item, text) {
  const bubble = item?.querySelector(".jarvis-bubble");
  if (!bubble) return;
  bubble.innerHTML = "<strong>Jarvis</strong><p></p>";
  const paragraph = bubble.querySelector("p");
  let index = 0;
  const timer = window.setInterval(() => {
    index = Math.min(text.length, index + 3);
    paragraph.textContent = text.slice(0, index);
    document.getElementById("jarvisMessages")?.scrollTo({ top: 999999, behavior: "smooth" });
    if (index >= text.length) {
      window.clearInterval(timer);
      jarvisBusy = false;
    }
  }, 12);
}

function sendJarvisMessage(message) {
  const clean = String(message || "").trim();
  if (!clean || jarvisBusy) return;
  jarvisBusy = true;
  appendJarvisMessage("user", clean);
  const typing = appendJarvisMessage("assistant", "", true);
  const input = document.getElementById("jarvisMessageInput");
  if (input) input.value = "";
  window.setTimeout(() => typeJarvisResponse(typing, jarvisOperationalResponse(clean)), 520);
}

function bindJarvisEvents() {
  document.getElementById("jarvisChatForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    sendJarvisMessage(document.getElementById("jarvisMessageInput")?.value);
  });

  document.querySelectorAll("[data-jarvis-prompt]").forEach((button) => {
    button.addEventListener("click", () => sendJarvisMessage(button.dataset.jarvisPrompt));
  });

  const micButton = document.getElementById("jarvisMicButton");
  micButton?.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      sendJarvisMessage("O navegador nao oferece reconhecimento de voz.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "pt-BR";
    recognition.interimResults = false;
    recognition.onstart = () => micButton.classList.add("listening");
    recognition.onend = () => micButton.classList.remove("listening");
    recognition.onerror = () => micButton.classList.remove("listening");
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      const input = document.getElementById("jarvisMessageInput");
      if (input) input.value = transcript;
      sendJarvisMessage(transcript);
    };
    recognition.start();
  });
}

function clearFormState(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const id = form.querySelector('[name="id"]');
  if (id) id.value = "";
  if (formId === "diaristForm") {
    state.selectedDiaristSectors = [];
    syncDiaristSectorInput();
    renderDiaristSectorPicker();
  }
}

function resetForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.reset();
  clearFormState(formId);
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add("modal-open");
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  window.setTimeout(() => modal.querySelector("input:not([type='hidden']), select, button")?.focus(), 0);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove("modal-open");
}

function fillForm(formId, data) {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field) field.value = value ?? "";
  });
}

function editRecord(entity, id) {
  if (entity === "diarist") {
    const diarist = state.diarists.find((item) => item.id === id) || {};
    fillForm("diaristForm", diarist);
    state.selectedDiaristSectors = parseSectorList(diarist.sectors);
    syncDiaristSectorInput();
    renderDiaristSectorPicker();
    openModal("diaristModal");
  }
  if (entity === "demand") {
    const demand = state.demands.find((item) => item.id === id) || {};
    fillForm("demandForm", demand);
    const sectorSelect = document.getElementById("sectorSelect");
    if (sectorSelect && demand.sector) sectorSelect.value = demand.sector;
  }
  if (entity === "store") {
    fillForm("storeForm", state.stores.find((item) => item.id === id) || {});
    const storePanel = document.getElementById("storeCreatePanel");
    if (storePanel) storePanel.open = true;
  }
  if (entity === "sectorRate") fillForm("sectorRateForm", state.sectorRates.find((item) => item.id === id) || {});
  if (entity === "companyRate") fillForm("companyRateForm", state.companyRates.find((item) => item.id === id) || {});
}

function deleteRecord(entity, id) {
  if (entity === "demand") {
    state.demands = state.demands.filter((item) => item.id !== id);
    markBackendDeleted(resourceForEntity(entity), id);
    writeStore(storageKeys.demands, state.demands);
  }
  if (entity === "store") {
    const removedDemandIds = state.demands.filter((demand) => demand.storeId === id).map((demand) => demand.id);
    state.stores = state.stores.filter((item) => item.id !== id);
    state.demands = state.demands.filter((demand) => demand.storeId !== id);
    markBackendDeleted(resourceForEntity(entity), id);
    removedDemandIds.forEach((demandId) => markBackendDeleted("demands", demandId));
    writeStore(storageKeys.stores, state.stores);
    writeStore(storageKeys.demands, state.demands);
  }
  if (entity === "sectorRate") {
    state.sectorRates = state.sectorRates.filter((item) => item.id !== id);
    markBackendDeleted(resourceForEntity(entity), id);
    writeStore(storageKeys.sectorRates, state.sectorRates);
  }
  if (entity === "companyRate") {
    state.companyRates = state.companyRates.filter((item) => item.id !== id);
    markBackendDeleted(resourceForEntity(entity), id);
    writeStore(storageKeys.companyRates, state.companyRates);
  }
  render();
}

function deactivateDiarist(id) {
  state.diarists = state.diarists.map((item) => (item.id === id ? { ...item, status: "Inativa" } : item));
  writeStore(storageKeys.diarists, state.diarists);
  render();
}

function addTask() {
  const nextNumber = state.tasks.length + 1;
  state.tasks.unshift({
    title: `Nova ação operacional ${nextNumber}`,
    meta: "Hoje - Sem responsável",
    done: false,
  });
  render();
}

function exportCsv() {
  const header = ["Rede", "Loja/Rede", "Responsável", "Tipo", "Cidade", "Endereço", "Saúde"];
  const lines = state.stores.map((store) => [store.network || "", store.name, store.owner, store.type, store.city, store.address || "", store.health]);
  const csv = [header, ...lines].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "direct-promocoes-lojas-redes.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function bindForms() {
  ["diaristForm", "demandForm", "storeForm", "sectorRateForm", "companyRateForm"].forEach((formId) => {
    const form = document.getElementById(formId);
    form?.addEventListener("reset", () => window.setTimeout(() => clearFormState(formId), 0));
  });

  const diaristForm = document.getElementById("diaristForm");
  const cpfInput = diaristForm?.elements.cpf;
  const phoneInput = diaristForm?.elements.phone;
  cpfInput?.addEventListener("input", () => {
    if (!cpfInput.value.includes("*")) cpfInput.value = formatCPF(cpfInput.value);
    cpfInput.setCustomValidity("");
  });
  cpfInput?.addEventListener("blur", () => {
    const masked = cpfInput.value.includes("*");
    cpfInput.setCustomValidity(!masked && cpfInput.value && !isValidCPF(cpfInput.value) ? "Informe um CPF válido." : "");
  });
  phoneInput?.addEventListener("input", () => {
    phoneInput.value = formatPhone(phoneInput.value);
    phoneInput.setCustomValidity("");
  });
  phoneInput?.addEventListener("blur", () => {
    phoneInput.setCustomValidity(phoneInput.value && !isValidPhone(phoneInput.value) ? "Informe um telefone brasileiro válido com DDD." : "");
  });

  document.getElementById("diaristForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const current = state.diarists.find((item) => item.id === data.id);
    const cpfIsMasked = String(data.cpf || "").includes("*");
    const cpf = cpfIsMasked ? current?.cpf : formatCPF(data.cpf);
    const phone = formatPhone(data.phone);
    const cpfInput = event.currentTarget.elements.cpf;
    const phoneInput = event.currentTarget.elements.phone;
    cpfInput.setCustomValidity(!cpfIsMasked && !isValidCPF(cpf) ? "Informe um CPF válido." : "");
    phoneInput.setCustomValidity(!isValidPhone(phone) ? "Informe um telefone brasileiro válido com DDD." : "");
    if (!event.currentTarget.reportValidity()) return;
    const record = {
      id: data.id || uid("diarist"),
      name: data.name.trim(),
      phone,
      cpf,
      neighborhood: String(data.neighborhood || "").trim(),
      sectors: data.sectors,
      status: current?.status || "Ativa",
    };
    state.diarists = data.id ? state.diarists.map((item) => (item.id === data.id ? { ...item, ...record } : item)) : [record, ...state.diarists];
    writeStore(storageKeys.diarists, state.diarists);
    resetForm("diaristForm");
    closeModal("diaristModal");
    render();
  });

  document.getElementById("demandForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const current = state.demands.find((item) => item.id === data.id);
    const period = normalizeDemandPeriod(data.startDate || data.date, data.endDate);
    const record = {
      id: data.id || uid("demand"),
      storeId: data.storeId,
      date: period.start,
      startDate: period.start,
      endDate: period.end,
      sector: data.sector,
      spots: positiveInt(data.spots, 1),
      workerCost: nonNegativeMoney(data.workerCost || 0),
      assignedDiaristIds: current?.assignedDiaristIds || [],
      status: current?.status || "Aberta",
    };
    state.demands = data.id ? state.demands.map((item) => (item.id === data.id ? record : item)) : [record, ...state.demands];
    writeStore(storageKeys.demands, state.demands);
    resetForm("demandForm");
    render();
  });

  document.getElementById("storeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const record = { id: data.id || uid("store"), name: data.name, network: data.network, type: data.type, owner: data.owner, city: data.city, address: data.address, health: data.health || "Alta" };
    state.stores = data.id ? state.stores.map((item) => (item.id === data.id ? { ...item, ...record } : item)) : [record, ...state.stores];
    writeStore(storageKeys.stores, state.stores);
    resetForm("storeForm");
    const storePanel = document.getElementById("storeCreatePanel");
    if (storePanel) storePanel.open = false;
    render();
  });

  document.getElementById("sectorRateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const minValue = nonNegativeMoney(data.minValue || 0);
    const maxValue = nonNegativeMoney(data.maxValue || 0);
    const record = {
      id: data.id || uid("rate"),
      sector: data.sector,
      minValue: Math.min(minValue, maxValue),
      maxValue: Math.max(minValue, maxValue),
    };
    state.sectorRates = data.id ? state.sectorRates.map((item) => (item.id === data.id ? record : item)) : [record, ...state.sectorRates.filter((item) => normalizeText(item.sector) !== normalizeText(record.sector))];
    writeStore(storageKeys.sectorRates, state.sectorRates);
    resetForm("sectorRateForm");
    render();
  });

  document.getElementById("companyRateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const record = {
      id: data.id || uid("company-rate"),
      company: data.company,
      value: nonNegativeMoney(data.value || 0),
    };
    state.companyRates = data.id ? state.companyRates.map((item) => (item.id === data.id ? record : item)) : [record, ...state.companyRates.filter((item) => normalizeText(item.company) !== normalizeText(record.company))];
    writeStore(storageKeys.companyRates, state.companyRates);
    resetForm("companyRateForm");
    render();
  });
}

function bindEvents() {
  bindJarvisEvents();

  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.openModal));
  });

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.closeModal));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".modal-panel.modal-open").forEach((modal) => closeModal(modal.id));
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  document.querySelectorAll(".period-btn").forEach((button) => {
    button.addEventListener("click", () => {
      state.period = Number(button.dataset.period);
      document.querySelectorAll(".period-btn").forEach((item) => item.classList.toggle("active", item === button));
      render();
    });
  });

  document.querySelectorAll("[data-demand-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.demandStatusTab = button.dataset.demandTab || "all";
      document.querySelectorAll("[data-demand-tab]").forEach((item) => item.classList.toggle("active", item === button));
      renderDemands();
      if (window.lucide) window.lucide.createIcons();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value;
    render();
  });

  document.getElementById("diaristNameSearch").addEventListener("input", (event) => {
    state.diaristQuery = event.target.value;
    renderDiarists();
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById("demandStoreSearch").addEventListener("input", (event) => {
    state.demandStoreQuery = event.target.value;
    renderDemands();
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById("financialSearch")?.addEventListener("input", (event) => {
    state.financialQuery = event.target.value;
    renderFinance();
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById("financeNetworkFilter").addEventListener("change", (event) => {
    state.financeNetworkFilter = event.target.value;
    state.financeStoreFilter = "";
    renderFinance();
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById("financeStoreFilter").addEventListener("change", (event) => {
    state.financeStoreFilter = event.target.value;
    renderFinance();
    if (window.lucide) window.lucide.createIcons();
  });

  document.getElementById("themeToggle").addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
    render();
  });

  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    applySidebarState(!state.sidebarCollapsed);
  });

  document.getElementById("logoutButton")?.addEventListener("click", () => {
    sessionStorage.removeItem(storageKeys.session);
    window.directBackend?.signOut?.().catch((error) => console.warn("Falha ao encerrar sessao Supabase.", error));
    window.location.reload();
  });

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, entity, id, demandId, diaristId } = actionButton.dataset;
    if (action === "edit") editRecord(entity, id);
    if (action === "delete") deleteRecord(entity, id);
    if (action === "deactivate-diarist") deactivateDiarist(id);
    if (action === "toggle-demand-network") {
      const key = actionButton.dataset.groupKey;
      if (state.collapsedDemandNetworks.has(key)) state.collapsedDemandNetworks.delete(key);
      else state.collapsedDemandNetworks.add(key);
      renderDemands();
      if (window.lucide) window.lucide.createIcons();
    }
    if (action === "toggle-demand-store") {
      const key = actionButton.dataset.groupKey;
      if (state.collapsedDemandStores.has(key)) state.collapsedDemandStores.delete(key);
      else state.collapsedDemandStores.add(key);
      renderDemands();
      if (window.lucide) window.lucide.createIcons();
    }
    if (action === "toggle-finance-network") {
      const key = actionButton.dataset.groupKey;
      if (state.collapsedFinanceNetworks.has(key)) state.collapsedFinanceNetworks.delete(key);
      else state.collapsedFinanceNetworks.add(key);
      renderFinance();
      if (window.lucide) window.lucide.createIcons();
    }
    if (action === "toggle-finance-store") {
      const key = actionButton.dataset.groupKey;
      if (state.collapsedFinanceStores.has(key)) state.collapsedFinanceStores.delete(key);
      else state.collapsedFinanceStores.add(key);
      renderFinance();
      if (window.lucide) window.lucide.createIcons();
    }
    if (action === "toggle-store-network") {
      const key = actionButton.dataset.groupKey;
      if (state.collapsedStoreNetworks.has(key)) state.collapsedStoreNetworks.delete(key);
      else state.collapsedStoreNetworks.add(key);
      renderStores();
      if (window.lucide) window.lucide.createIcons();
    }
    if (action === "copy-address") {
      copyText(actionButton.dataset.address).then((success) => showCopyFeedback(actionButton, success));
    }
    if (action === "remove-selected-sector") {
      state.selectedDiaristSectors = state.selectedDiaristSectors.filter((sector) => normalizeText(sector) !== normalizeText(actionButton.dataset.sector));
      syncDiaristSectorInput();
      renderDiaristSectorPicker();
    }
    if (action === "unassign") {
      state.demands = state.demands.map((demand) => (demand.id === demandId ? { ...demand, assignedDiaristIds: demand.assignedDiaristIds.filter((id) => id !== diaristId) } : demand));
      writeStore(storageKeys.demands, state.demands);
      render();
    }
  });

  document.addEventListener("change", (event) => {
    const diaristId = event.target.dataset.diaristStatus;
    const demandId = event.target.dataset.demandStatus;
    const assignDemandId = event.target.dataset.assignDemand;

    if (diaristId) {
      state.diarists = state.diarists.map((item) => (item.id === diaristId ? { ...item, status: event.target.value } : item));
      writeStore(storageKeys.diarists, state.diarists);
      render();
    }

    if (demandId) {
      state.demands = state.demands.map((item) => (item.id === demandId ? { ...item, status: event.target.value } : item));
      writeStore(storageKeys.demands, state.demands);
      render();
    }

    if (assignDemandId && event.target.value) {
      state.demands = state.demands.map((demand) => {
        if (demand.id !== assignDemandId || demand.assignedDiaristIds.includes(event.target.value) || demand.assignedDiaristIds.length >= demand.spots) return demand;
        return { ...demand, assignedDiaristIds: [...demand.assignedDiaristIds, event.target.value], status: "Em escala" };
      });
      writeStore(storageKeys.demands, state.demands);
      render();
    }
  });

  document.getElementById("addDiaristSectorBtn").addEventListener("click", () => {
    const select = document.getElementById("diaristSectorSelect");
    addSectorToSelection(select.value);
    select.value = "";
  });

  document.getElementById("createSectorBtn").addEventListener("click", () => {
    const input = document.getElementById("newSectorInput");
    createSector(input.value);
    input.value = "";
    render();
  });

  bindForms();
}

function render() {
  renderKpis();
  renderDashboardCharts();
  renderDiarists();
  renderDemands();
  renderStores();
  renderFinance();
  renderSettings();
  if (window.lucide) window.lucide.createIcons();
}

function applyAccessControls() {
  const financeButton = document.querySelector('[data-view="financeiro"]');
  if (financeButton) financeButton.hidden = !state.access.canViewFinance;
  document.querySelector('[data-view-panel="financeiro"]')?.setAttribute("aria-hidden", String(!state.access.canViewFinance));
  document.querySelectorAll("[data-finance-sensitive]").forEach((element) => {
    element.hidden = !state.access.canViewFinance;
  });

  if (!state.access.canViewFinance) {
    state.financialRecords = [];
    localStorage.removeItem(storageKeys.financialRecords);
    localStorage.removeItem(pendingKey("financialRecords"));
  }

  if (!state.access.canViewFullCpf) {
    state.diarists = state.diarists.map((diarist) => ({ ...diarist, cpf: cpfForDisplay(diarist.cpf) }));
    writeLocalStore(storageKeys.diarists, state.diarists);
  }
}

async function startApp() {
  if (appStarted) return;
  appStarted = true;
  if (window.directBackend?.enabled && window.directBackend?.refreshAccessContext) {
    try {
      state.access = await window.directBackend.refreshAccessContext();
    } catch (error) {
      console.warn("Não foi possível carregar as permissões do usuário.", error);
    }
  } else {
    state.access = { role: "admin", canViewFinance: true, canViewFullCpf: true };
  }
  applyAccessControls();
  showApp();
  bindEvents();
  switchView("dashboard");
  try {
    await hydrateFromBackend();
  } catch (error) {
    console.warn("Falha ao carregar dados do Supabase. Usando dados locais.", error);
  }
  applyAccessControls();
  render();
}

window.addEventListener("DOMContentLoaded", () => {
  applyTheme(state.theme || state.settings.defaultTheme);
  applySidebarState(state.sidebarCollapsed);
  bindAuth();
  if (isAuthenticated()) {
    startApp();
  } else {
    showLogin();
  }
});
