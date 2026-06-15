(function () {
  const config = window.DIRECT_BACKEND_CONFIG || {};
  const tableMap = {
    diarists: "diaristas",
    demands: "demandas",
    stores: "lojas_redes",
    sectors: "setores",
    sectorRates: "diarias_setor",
    companyRates: "diarias_empresas",
  };

  const enabled = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const client = enabled ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;

  function normalizeId(value) {
    return String(value || "item")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "item";
  }

  function resolveId(resource, record) {
    if (resource === "sectors") return `sector-${normalizeId(record?.name || record)}`;
    return record?.id;
  }

  function serialize(resource, record) {
    if (resource === "sectors") return { id: resolveId(resource, record), name: String(record?.name || record) };
    if (resource === "demands") {
      return {
        id: record.id,
        store_id: record.storeId,
        date: record.startDate || record.date,
        end_date: record.endDate || record.startDate || record.date,
        sector: record.sector,
        spots: Number(record.spots || 1),
        daily_rate: Number(record.dailyRate || 0),
        worker_cost: Number(record.workerCost || 0),
        assigned_diarist_ids: record.assignedDiaristIds || [],
        status: record.status || "Aberta",
      };
    }
    if (resource === "sectorRates") {
      return {
        id: record.id,
        sector: record.sector,
        min_value: Number(record.minValue || 0),
        max_value: Number(record.maxValue || 0),
      };
    }
    if (resource === "companyRates") {
      return {
        id: record.id,
        company: record.company,
        value: Number(record.value || 0),
      };
    }
    return record;
  }

  function deserialize(resource, row) {
    if (resource === "sectors") return row.name;
    if (resource === "demands") {
      return {
        id: row.id,
        storeId: row.store_id,
        date: row.date,
        startDate: row.date,
        endDate: row.end_date || row.date,
        sector: row.sector,
        spots: Number(row.spots || 1),
        dailyRate: Number(row.daily_rate || 0),
        workerCost: Number(row.worker_cost || 0),
        assignedDiaristIds: Array.isArray(row.assigned_diarist_ids) ? row.assigned_diarist_ids : [],
        status: row.status || "Aberta",
      };
    }
    if (resource === "sectorRates") {
      return {
        id: row.id,
        sector: row.sector,
        minValue: Number(row.min_value || 0),
        maxValue: Number(row.max_value || 0),
      };
    }
    if (resource === "companyRates") {
      return {
        id: row.id,
        company: row.company,
        value: Number(row.value || 0),
      };
    }
    return row;
  }

  async function list(resource) {
    if (!enabled) return null;
    const table = tableMap[resource];
    if (!table) throw new Error(`Recurso sem tabela Supabase: ${resource}`);
    const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => deserialize(resource, row));
  }

  async function upsert(resource, record) {
    if (!enabled) return null;
    const table = tableMap[resource];
    if (!table) throw new Error(`Recurso sem tabela Supabase: ${resource}`);
    const { data, error } = await client.from(table).upsert(serialize(resource, record)).select().single();
    if (error) throw error;
    return deserialize(resource, data);
  }

  async function remove(resource, id) {
    if (!enabled) return null;
    const table = tableMap[resource];
    if (!table) throw new Error(`Recurso sem tabela Supabase: ${resource}`);
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  window.directBackend = {
    provider: "supabase",
    enabled,
    client,
    tableMap,
    resolveId,
    list,
    upsert,
    remove,
  };
})();
