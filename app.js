const storageKeys = {
  theme: "direct_theme",
  settings: "direct_settings",
  diarists: "direct_diaristas",
  demands: "direct_demandas",
  stores: "direct_lojas_redes",
  sectors: "direct_setores",
  sectorRates: "direct_diarias_setor",
  companyRates: "direct_diarias_empresas",
};

const backendResourceByStorageKey = {
  [storageKeys.diarists]: "diarists",
  [storageKeys.demands]: "demands",
  [storageKeys.stores]: "stores",
  [storageKeys.sectors]: "sectors",
  [storageKeys.sectorRates]: "sectorRates",
  [storageKeys.companyRates]: "companyRates",
};

let backendReady = false;
const backendSyncTimers = {};

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

const fallbackDiarists = [
  { id: "diarist-maria-oliveira", name: "Maria Oliveira", phone: "(85) 99991-1001", cpf: "123.456.789-00", sectors: "Operador de caixa, Repositor de Mercearia", status: "Ativa" },
  { id: "diarist-jessica-lima", name: "Jéssica Lima", phone: "(85) 99992-1002", cpf: "987.654.321-00", sectors: "Balconista de Frios", status: "Ativa" },
  { id: "diarist-patricia-sousa", name: "Patrícia Sousa", phone: "(85) 99993-1003", cpf: "-", sectors: "Repositor de Hortifruti", status: "Reserva" },
];

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

const fallbackDemands = [
  { id: "demand-rede-norte-caixa", storeId: "store-rede-norte", startDate: "2026-06-18", endDate: "2026-06-18", sector: "Operador de caixa", spots: 4, workerCost: 120, assignedDiaristIds: ["diarist-maria-oliveira"], status: "Aberta" },
  { id: "demand-mix-mercearia", storeId: "store-mix-atacado", startDate: "2026-06-20", endDate: "2026-06-20", sector: "Repositor de Mercearia", spots: 6, workerCost: 120, assignedDiaristIds: [], status: "Em escala" },
  { id: "demand-urban-padaria", storeId: "store-urban-market", startDate: "2026-06-22", endDate: "2026-06-22", sector: "Balconista de Padaria", spots: 2, workerCost: 130, assignedDiaristIds: [], status: "Concluída" },
];

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
  financeNetworkFilter: "",
  financeStoreFilter: "",
  selectedDiaristSectors: [],
  settings: readStore(storageKeys.settings, fallbackSettings),
  theme: localStorage.getItem(storageKeys.theme) || "light",
  diarists: readStore(storageKeys.diarists, fallbackDiarists),
  stores: readStore(storageKeys.stores, fallbackStores),
  demands: readStore(storageKeys.demands, fallbackDemands),
  sectors: readStore(storageKeys.sectors, requiredSectors),
  sectorRates: readStore(storageKeys.sectorRates, fallbackSectorRates),
  companyRates: readStore(storageKeys.companyRates, fallbackCompanyRates),
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
persistCoreData();

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
  return `${prefix}-${crypto.randomUUID()}`;
}

function readStore(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  queueBackendSync(key, value);
}

function persistCoreData() {
  writeStore(storageKeys.stores, state.stores);
  writeStore(storageKeys.diarists, state.diarists);
  writeStore(storageKeys.demands, state.demands);
  writeStore(storageKeys.sectors, state.sectors);
  writeStore(storageKeys.sectorRates, state.sectorRates);
  writeStore(storageKeys.companyRates, state.companyRates);
}

function getResourceCollection(resource) {
  return {
    diarists: state.diarists,
    demands: state.demands,
    stores: state.stores,
    sectors: state.sectors,
    sectorRates: state.sectorRates,
    companyRates: state.companyRates,
  }[resource];
}

function replaceResourceCollection(resource, records) {
  if (resource === "diarists") state.diarists = normalizeDiarists(records);
  if (resource === "demands") state.demands = normalizeDemands(records);
  if (resource === "stores") state.stores = mergeRequiredStores(normalizeStores(records));
  if (resource === "sectors") state.sectors = mergeRequiredSectors(records);
  if (resource === "sectorRates") state.sectorRates = normalizeSectorRates(records);
  if (resource === "companyRates") state.companyRates = normalizeCompanyRates(records);
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
  const remote = await backend.list(resource);
  const currentIds = new Set(current.map((record) => backend.resolveId(resource, record)).filter(Boolean));
  await Promise.all((remote || []).map((record) => {
    const id = backend.resolveId(resource, record);
    return id && !currentIds.has(id) ? backend.remove(resource, id) : Promise.resolve();
  }));
  await Promise.all(current.map((record) => backend.upsert(resource, record)));
}

async function hydrateFromBackend() {
  const backend = window.directBackend;
  if (!backend?.enabled) return;

  const resources = ["stores", "diarists", "sectors", "sectorRates", "companyRates", "demands"];
  for (const resource of resources) {
    const remote = await backend.list(resource);
    if (remote?.length) {
      replaceResourceCollection(resource, remote);
    } else {
      await syncResourceToBackend(resource, getResourceCollection(resource));
    }
  }

  backendReady = false;
  persistCoreData();
  backendReady = true;
  await Promise.all(resources.map((resource) => syncResourceToBackend(resource, getResourceCollection(resource))));
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
  return String(value || "")
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
    name: store.name || "Loja sem nome",
    network: store.network || (store.type === "Rede" ? store.name : ""),
    type: store.type || "Loja",
    owner: store.owner || "Direct Promoções",
    city: store.city || "",
    address: store.address || "",
    health: store.health || "Alta",
  }));
}

function normalizeDiarists(diarists) {
  return diarists.map((diarist) => ({
    id: diarist.id || uid("diarist"),
    name: diarist.name || "Diarista sem nome",
    phone: diarist.phone || "",
    cpf: diarist.cpf || "",
    sectors: diarist.sectors || "",
    status: diarist.status || "Ativa",
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
      sector: demand.sector || requiredSectors[0],
      spots: Number(demand.spots || 1),
      workerCost: parseMoney(demand.workerCost || 120),
      assignedDiaristIds: Array.isArray(demand.assignedDiaristIds) ? demand.assignedDiaristIds : [],
      status: demand.status || "Aberta",
    };
  });
}

function normalizeSectorRates(rates) {
  const normalized = rates.map((item) => ({
    id: item.id || uid("rate"),
    sector: typeof item.sector === "string" ? item.sector : String(item.sector?.sector || item.sector?.name || ""),
    minValue: parseMoney(item.minValue ?? 80),
    maxValue: parseMoney(item.maxValue ?? 90),
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
    company: typeof item.company === "string" ? item.company : String(item.company?.network || item.company?.name || ""),
    value: parseMoney(item.value ?? 0),
  })).filter((item) => item.company);

  const existing = new Set(normalized.map((item) => normalizeText(item.company)));
  fallbackCompanyRates.forEach((rate) => {
    if (!existing.has(normalizeText(rate.company))) normalized.push(rate);
  });

  return normalized;
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
  return Number(demand.spots || 0) * demandDays(demand) * supermarketDailyRate(demand);
}

function demandCost(demand) {
  return demandRequestedCount(demand) * parseMoney(demand.workerCost || 0);
}

function demandMargin(demand) {
  return demandRevenue(demand) - demandCost(demand);
}

function demandRequestedCount(demand) {
  return Number(demand.spots || 0) * demandDays(demand);
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

function renderFinanceFilters(filteredDemands) {
  const networkSelect = document.getElementById("financeNetworkFilter");
  const storeSelect = document.getElementById("financeStoreFilter");
  const networks = Array.from(new Set(state.stores.map((store) => store.network || store.name).filter(Boolean))).sort((a, b) => a.localeCompare(b, "pt-BR"));

  if (networkSelect) {
    networkSelect.innerHTML = `<option value="">Todas as redes</option>${networks.map((network) => `<option value="${escapeHTML(network)}">${escapeHTML(network)}</option>`).join("")}`;
    if (networks.some((network) => normalizeText(network) === normalizeText(state.financeNetworkFilter))) {
      networkSelect.value = state.financeNetworkFilter;
    } else {
      state.financeNetworkFilter = "";
      networkSelect.value = "";
    }
  }

  const stores = state.stores
    .filter((store) => !state.financeNetworkFilter || normalizeText(store.network || store.name) === normalizeText(state.financeNetworkFilter))
    .sort((a, b) => storeDisplayName(a).localeCompare(storeDisplayName(b), "pt-BR"));

  if (storeSelect) {
    storeSelect.innerHTML = `<option value="">Todas as lojas</option>${stores.map((store) => `<option value="${escapeHTML(store.id)}">${escapeHTML(storeDisplayName(store))}</option>`).join("")}`;
    if (stores.some((store) => store.id === state.financeStoreFilter)) {
      storeSelect.value = state.financeStoreFilter;
    } else {
      state.financeStoreFilter = "";
      storeSelect.value = "";
    }
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
    button.innerHTML = `<i data-lucide="${isDark ? "sun" : "moon"}"></i><span>${isDark ? "Modo claro" : "Modo escuro"}</span>`;
  }

  const meta = document.getElementById("themeColorMeta");
  if (meta) meta.setAttribute("content", cssVar("--sidebar-bg") || (state.theme === "dark" ? "#f7fbff" : "#051a46"));
}

function switchView(view) {
  state.view = viewMeta[view] ? view : "dashboard";
  state.query = "";
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

function aggregateDemandsBy(getKey, getValue) {
  const map = new Map();
  state.demands.forEach((demand) => {
    const key = getKey(demand) || "Sem classificação";
    map.set(key, (map.get(key) || 0) + getValue(demand));
  });
  return Array.from(map, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
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

function renderRecordList(containerId, records, template) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const filtered = records.filter(matchesQuery);
  container.innerHTML = filtered.length
    ? filtered.map(template).join("")
    : `<div class="record-item"><div><strong>Nenhum registro encontrado</strong><span>A busca atual não retornou resultados.</span></div></div>`;
}

function actionButtons(entity, id) {
  return `
    <button class="icon-btn compact" type="button" data-action="edit" data-entity="${entity}" data-id="${escapeHTML(id)}" title="Editar" aria-label="Editar"><i data-lucide="pencil"></i></button>
    <button class="icon-btn compact danger" type="button" data-action="delete" data-entity="${entity}" data-id="${escapeHTML(id)}" title="Excluir" aria-label="Excluir"><i data-lucide="trash-2"></i></button>
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
        <span>${escapeHTML(item.phone)} · CPF ${escapeHTML(item.cpf || "-")} · ${escapeHTML(item.sectors || "Sem setor")}</span>
      </div>
      <div class="record-actions">
        <select class="status-select" data-diarist-status="${escapeHTML(item.id)}">
          ${["Ativa", "Reserva", "Inativa"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        ${actionButtons("diarist", item.id)}
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

function renderDemands() {
  const open = state.demands.filter((item) => item.status !== "Concluída").length;
  const filteredDemands = state.demands.filter((item) => {
    const store = getStore(item.storeId);
    return normalizeText(storeDisplayName(store)).includes(normalizeText(state.demandStoreQuery));
  });
  setText("demandCount", `${filteredDemands.length}/${open} abertas`);
  renderRecordList("demandList", filteredDemands, (item) => {
    const store = getStore(item.storeId);
    const filled = item.assignedDiaristIds.length;
    const options = availableDiaristsForDemand(item);
    const compatibleCount = options.filter((diarist) => isDiaristCompatible(diarist, item)).length;
    const companyRate = supermarketDailyRate(item);
    const companyRateLabel = companyRate ? `${formatMoney(companyRate)}/dia` : "Nao configurado";
    return `
      <div class="record-item demand-card">
        <div>
          <strong>${escapeHTML(storeDisplayName(store))}</strong>
          <span>${escapeHTML(formatDemandPeriod(item))} - ${escapeHTML(item.sector)} - ${filled}/${item.spots} vagas - ${compatibleCount} compativeis disponiveis - Recebimento ${companyRateLabel} - Paga diarista ${formatMoney(item.workerCost)}</span>
          <div class="assignment-row">
            <div class="chip-list">${renderAssignedDiarists(item)}</div>
            <div class="assign-control">
              <select class="status-select" data-assign-demand="${escapeHTML(item.id)}" ${filled >= item.spots || !options.length ? "disabled" : ""}>
                <option value="">Escalar diarista</option>
                ${options.map((diarist) => `<option value="${escapeHTML(diarist.id)}">${isDiaristCompatible(diarist, item) ? "✓" : "•"} ${escapeHTML(diarist.name)} · ${escapeHTML(diarist.sectors || "Sem setor")}</option>`).join("")}
              </select>
              <small>${filled >= item.spots ? "Vagas preenchidas" : options.length ? "Compatíveis aparecem primeiro" : "Nenhuma diarista ativa disponível"}</small>
            </div>
          </div>
        </div>
        <div class="record-actions">
          <select class="status-select" data-demand-status="${escapeHTML(item.id)}">
            ${["Aberta", "Em escala", "Concluída"].map((status) => `<option ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
          ${actionButtons("demand", item.id)}
        </div>
      </div>
    `;
  });
}

function renderStores() {
  setText("storeCount", `${state.stores.length} registros`);
  renderRecordList("storeList", state.stores, (item) => `
    <div class="record-item">
      <div>
        <strong>${escapeHTML(storeDisplayName(item))}</strong>
        <span>${escapeHTML(item.type)} · ${escapeHTML(item.address || item.city || "Sem endereço")} · Responsável: ${escapeHTML(item.owner)}</span>
      </div>
      <div class="record-actions">
        ${addressCopyButton(item)}
        ${actionButtons("store", item.id)}
      </div>
    </div>
  `);
}

async function copyText(text) {
  if (!text) return false;
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
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

function renderFinance() {
  renderFinanceFilters(state.demands);
  const demands = financeFilteredDemands();
  renderFinanceFilters(demands);
  const total = demands.reduce((sum, demand) => sum + demandRevenue(demand), 0);
  const cost = demands.reduce((sum, demand) => sum + demandCost(demand), 0);
  const profit = total - cost;
  const requested = demands.reduce((sum, demand) => sum + demandRequestedCount(demand), 0);
  const attended = demands.reduce((sum, demand) => sum + demandAttendedCount(demand), 0);
  const missing = demands.reduce((sum, demand) => sum + demandMissingCount(demand), 0);
  const margin = total ? (profit / total) * 100 : 0;
  const average = demands.length ? total / demands.length : 0;
  setText("financeTotal", formatMoney(total));
  setText("financeCost", formatMoney(cost));
  setText("financeProfit", formatMoney(profit));
  setText("financeMargin", `${margin.toFixed(1).replace(".", ",")}%`);
  setText("financeRequested", String(requested));
  setText("financeAttended", String(attended));
  setText("financeAbsences", String(missing));
  setText("financeAverage", formatMoney(average));
  renderRecordList("financeList", demands, (demand) => {
    const store = getStore(demand.storeId);
    const companyRate = supermarketDailyRate(demand);
    const companyRateLabel = companyRate ? formatMoney(companyRate) : "Nao configurado";
    return `
      <div class="record-item">
        <div>
          <strong>${escapeHTML(storeDisplayName(store))}</strong>
          <span>${escapeHTML(formatDemandPeriod(demand))} - ${escapeHTML(demand.sector)} - ${demandRequestedCount(demand)} solicitadas - ${demandAttendedCount(demand)} atendidas - ${demandMissingCount(demand)} pendentes - Recebe ${companyRateLabel}/dia - Receita ${formatMoney(demandRevenue(demand))} - Custo ${formatMoney(demandCost(demand))} - Lucro ${formatMoney(demandMargin(demand))}</span>
        </div>
        <span class="health ${demandMargin(demand) >= 0 ? "alta" : "baixa"}">${escapeHTML(demand.status)}</span>
      </div>
    `;
  });
  const totalLabel = document.querySelector("#financeTotal + small");
  if (totalLabel) totalLabel.textContent = `recebimento das empresas`;
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

function resetForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.reset();
  const id = form.querySelector('[name="id"]');
  if (id) id.value = "";
  if (formId === "diaristForm") {
    state.selectedDiaristSectors = [];
    syncDiaristSectorInput();
    renderDiaristSectorPicker();
  }
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
  }
  if (entity === "demand") {
    const demand = state.demands.find((item) => item.id === id) || {};
    fillForm("demandForm", demand);
    const sectorSelect = document.getElementById("sectorSelect");
    if (sectorSelect && demand.sector) sectorSelect.value = demand.sector;
  }
  if (entity === "store") fillForm("storeForm", state.stores.find((item) => item.id === id) || {});
  if (entity === "sectorRate") fillForm("sectorRateForm", state.sectorRates.find((item) => item.id === id) || {});
  if (entity === "companyRate") fillForm("companyRateForm", state.companyRates.find((item) => item.id === id) || {});
}

function deleteRecord(entity, id) {
  if (entity === "diarist") {
    state.diarists = state.diarists.filter((item) => item.id !== id);
    state.demands = state.demands.map((demand) => ({ ...demand, assignedDiaristIds: demand.assignedDiaristIds.filter((diaristId) => diaristId !== id) }));
    writeStore(storageKeys.diarists, state.diarists);
    writeStore(storageKeys.demands, state.demands);
  }
  if (entity === "demand") {
    state.demands = state.demands.filter((item) => item.id !== id);
    writeStore(storageKeys.demands, state.demands);
  }
  if (entity === "store") {
    state.stores = state.stores.filter((item) => item.id !== id);
    state.demands = state.demands.filter((demand) => demand.storeId !== id);
    writeStore(storageKeys.stores, state.stores);
    writeStore(storageKeys.demands, state.demands);
  }
  if (entity === "sectorRate") {
    state.sectorRates = state.sectorRates.filter((item) => item.id !== id);
    writeStore(storageKeys.sectorRates, state.sectorRates);
  }
  if (entity === "companyRate") {
    state.companyRates = state.companyRates.filter((item) => item.id !== id);
    writeStore(storageKeys.companyRates, state.companyRates);
  }
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
  document.getElementById("diaristForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const record = { id: data.id || uid("diarist"), name: data.name, phone: data.phone, cpf: data.cpf, sectors: data.sectors, status: data.status || "Ativa" };
    state.diarists = data.id ? state.diarists.map((item) => (item.id === data.id ? { ...item, ...record } : item)) : [record, ...state.diarists];
    writeStore(storageKeys.diarists, state.diarists);
    resetForm("diaristForm");
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
      spots: Number(data.spots || 1),
      workerCost: parseMoney(data.workerCost || 0),
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
    render();
  });

  document.getElementById("sectorRateForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const minValue = parseMoney(data.minValue || 0);
    const maxValue = parseMoney(data.maxValue || 0);
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
      value: parseMoney(data.value || 0),
    };
    state.companyRates = data.id ? state.companyRates.map((item) => (item.id === data.id ? record : item)) : [record, ...state.companyRates.filter((item) => normalizeText(item.company) !== normalizeText(record.company))];
    writeStore(storageKeys.companyRates, state.companyRates);
    resetForm("companyRateForm");
    render();
  });
}

function bindEvents() {
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

  document.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, entity, id, demandId, diaristId } = actionButton.dataset;
    if (action === "edit") editRecord(entity, id);
    if (action === "delete") deleteRecord(entity, id);
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

window.addEventListener("DOMContentLoaded", () => {
  applyTheme(state.theme || state.settings.defaultTheme);
  bindEvents();
  switchView("dashboard");
  hydrateFromBackend()
    .then(() => render())
    .catch((error) => console.warn("Falha ao carregar dados do Supabase. Usando dados locais.", error));
});
