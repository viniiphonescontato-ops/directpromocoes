(function () {
  const config = window.DIRECT_BACKEND_CONFIG || {};
  const tableMap = {
    diarists: "diaristas",
    demands: "demandas",
    stores: "lojas_redes",
    sectors: "setores",
    sectorRates: "diarias_setor",
    companyRates: "diarias_empresas",
    financialRecords: "registros_financeiros",
  };

  const enabled = Boolean(config.supabaseUrl && config.supabaseAnonKey && window.supabase);
  const client = enabled ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
  let accessContext = { role: "operador", canViewFinance: false, canViewFullCpf: false };

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
    if (resource === "diarists") {
      const payload = {
        id: record.id,
        name: record.name,
        phone: record.phone || "",
        neighborhood: record.neighborhood || "",
        sectors: record.sectors || "",
        status: record.status || "Ativa",
      };
      if (!String(record.cpf || "").includes("*")) payload.cpf = record.cpf || "";
      return payload;
    }
    if (resource === "demands") {
      return {
        id: record.id,
        store_id: record.storeId,
        date: record.startDate || record.date,
        end_date: record.endDate || record.startDate || record.date,
        start_time: record.startTime || "08:00",
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
    if (resource === "financialRecords") {
      return {
        id: record.id,
        diarist_id: record.diaristId || null,
        diarist_name: record.diaristName,
        store: record.store,
        date: record.date,
        start_time: record.startTime || null,
        end_time: record.endTime || null,
        sector: record.sector,
        daily_value: Number(record.dailyValue || 0),
        transport: Number(record.transport || 0),
        advance: Number(record.advance || 0),
        extra_costs: Number(record.extraCosts || 0),
        paid: Boolean(record.paid),
        paid_at: record.paidAt || null,
        notes: record.notes || "",
        created_at: record.createdAt || new Date().toISOString(),
      };
    }
    return record;
  }

  function deserialize(resource, row) {
    if (resource === "sectors") return row.name;
    if (resource === "diarists") {
      return {
        id: row.id,
        name: row.name,
        phone: row.phone || "",
        cpf: row.cpf || "",
        neighborhood: row.neighborhood || "",
        sectors: row.sectors || "",
        status: row.status || "Ativa",
      };
    }
    if (resource === "demands") {
      return {
        id: row.id,
        storeId: row.store_id,
        date: row.date,
        startDate: row.date,
        endDate: row.end_date || row.date,
        startTime: row.start_time || "08:00",
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
    if (resource === "financialRecords") {
      return {
        id: row.id,
        diaristId: row.diarist_id || "",
        diaristName: row.diarist_name || "",
        store: row.store || "",
        date: row.date,
        startTime: row.start_time || "",
        endTime: row.end_time || "",
        sector: row.sector || "",
        dailyValue: Number(row.daily_value || 0),
        transport: Number(row.transport || 0),
        advance: Number(row.advance || 0),
        extraCosts: Number(row.extra_costs || 0),
        paid: Boolean(row.paid),
        paidAt: row.paid_at || null,
        notes: row.notes || "",
        createdAt: row.created_at,
      };
    }
    return row;
  }

  async function list(resource) {
    if (!enabled) return null;
    if (resource === "financialRecords" && !accessContext.canViewFinance) return [];
    const table = resource === "diarists" && !accessContext.canViewFullCpf ? "diaristas_masked" : tableMap[resource];
    if (!table) throw new Error(`Recurso sem tabela Supabase: ${resource}`);
    const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data.map((row) => deserialize(resource, row));
  }

  async function upsert(resource, record) {
    if (!enabled) return null;
    if (resource === "financialRecords" && !accessContext.canViewFinance) throw new Error("Sem permissão para acessar o financeiro.");
    const table = tableMap[resource];
    if (!table) throw new Error(`Recurso sem tabela Supabase: ${resource}`);
    const payload = serialize(resource, record);
    if (resource === "diarists") {
      const { error } = await client.rpc("upsert_diarista", { payload });
      if (error) throw error;
      return record;
    }
    let fallbackPayload = { ...payload };
    let data;
    let error;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      ({ data, error } = await client.from(table).upsert(fallbackPayload).select().single());
      if (!error) break;
      const missingColumn = String(error.message || "").match(/'([^']+)' column/)?.[1];
      if (error.code !== "PGRST204" || !missingColumn || !(missingColumn in fallbackPayload)) break;
      delete fallbackPayload[missingColumn];
    }
    if (error) throw error;
    return deserialize(resource, data);
  }

  async function remove(resource, id) {
    if (!enabled) return null;
    if (resource === "diarists") throw new Error("Diaristas devem ser inativadas, não excluídas.");
    if (resource === "financialRecords" && !accessContext.canViewFinance) throw new Error("Sem permissão para acessar o financeiro.");
    const table = tableMap[resource];
    if (!table) throw new Error(`Recurso sem tabela Supabase: ${resource}`);
    const { error } = await client.from(table).delete().eq("id", id);
    if (error) throw error;
    return true;
  }

  async function signIn(email, password) {
    if (!enabled) return null;
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    try {
      await refreshAccessContext();
    } catch (accessError) {
      console.warn("Perfis de acesso ainda não estão disponíveis.", accessError);
    }
    await logAccess("login");
    return data;
  }

  async function signOut() {
    if (!enabled) return null;
    await logAccess("logout");
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return true;
  }

  async function refreshAccessContext() {
    if (!enabled) return accessContext;
    const { data: userData } = await client.auth.getUser();
    const user = userData?.user;
    if (!user) {
      accessContext = { role: "operador", canViewFinance: false, canViewFullCpf: false };
      return accessContext;
    }
    const { data, error } = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (error) throw error;
    const role = data?.role || "operador";
    accessContext = {
      role,
      canViewFinance: ["admin", "financeiro"].includes(role),
      canViewFullCpf: ["admin", "rh"].includes(role),
    };
    return accessContext;
  }

  async function logAccess(event) {
    if (!enabled) return;
    const { error } = await client.rpc("log_app_access", {
      event_name: event,
      client_user_agent: navigator.userAgent,
    });
    if (error) console.warn("Não foi possível registrar o acesso.", error);
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
    signIn,
    signOut,
    refreshAccessContext,
    getAccessContext: () => ({ ...accessContext }),
  };
})();
