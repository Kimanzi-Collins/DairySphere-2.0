const API_BASE = 'http://localhost:3001/api';

async function fetchAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
}

async function postAPI<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
}

async function putAPI<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
}

async function deleteAPI<T>(endpoint: string): Promise<T> {
    const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    return res.json();
}

// CRUD APIs
export const farmersAPI = {
    getAll: () => fetchAPI('/farmers'),
    getOne: (id: string) => fetchAPI(`/farmers/${id}`),
    create: (data: Record<string, unknown>) => postAPI('/farmers', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/farmers/${id}`, data),
    delete: (id: string) => deleteAPI(`/farmers/${id}`),
    uploadProfilePic: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('profilePic', file);

        const res = await fetch(`${API_BASE}/farmers/${id}/profile-pic`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return res.json();
    },
};

export const agentsAPI = {
    getAll: () => fetchAPI('/agents'),
    getOne: (id: string) => fetchAPI(`/agents/${id}`),
    create: (data: Record<string, unknown>) => postAPI('/agents', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/agents/${id}`, data),
    delete: (id: string) => deleteAPI(`/agents/${id}`)
};

export const factoriesAPI = {
    getAll: () => fetchAPI('/factories'),
    getOne: (id: string) => fetchAPI(`/factories/${id}`),
    create: (data: Record<string, unknown>) => postAPI('/factories', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/factories/${id}`, data),
    delete: (id: string) => deleteAPI(`/factories/${id}`)
};

export const inputsAPI = {
    getAll: () => fetchAPI('/inputs'),
    getOne: (id: string) => fetchAPI(`/inputs/${id}`),
    create: (data: Record<string, unknown>) => postAPI('/inputs', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/inputs/${id}`, data),
    delete: (id: string) => deleteAPI(`/inputs/${id}`)
};

export const milkQualityAPI = {
    getAll: () => fetchAPI('/milk-quality'),
    getOne: (id: string) => fetchAPI(`/milk-quality/${id}`),
    create: (data: Record<string, unknown>) => postAPI('/milk-quality', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/milk-quality/${id}`, data),
    delete: (id: string) => deleteAPI(`/milk-quality/${id}`)
};

export const loansAPI = {
    getAll: () => fetchAPI('/loans'),
    getOne: (id: string) => fetchAPI(`/loans/${id}`),
    getByFarmer: (farmerId: string) => fetchAPI(`/loans/farmer/${farmerId}`),
    create: (data: Record<string, unknown>) => postAPI('/loans', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/loans/${id}`, data),
    delete: (id: string) => deleteAPI(`/loans/${id}`)
};

export const deliveriesAPI = {
    getAll: () => fetchAPI('/deliveries'),
    getOne: (id: string) => fetchAPI(`/deliveries/${id}`),
    getByFarmer: (farmerId: string) => fetchAPI(`/deliveries/farmer/${farmerId}`),
    getRate: (qualityId: string) => fetchAPI(`/deliveries/rate/${qualityId}`),
    create: (data: Record<string, unknown>) => postAPI('/deliveries', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/deliveries/${id}`, data),
    delete: (id: string) => deleteAPI(`/deliveries/${id}`)
};

export const inputPurchasesAPI = {
    getAll: () => fetchAPI('/input-purchases'),
    getOne: (id: string) => fetchAPI(`/input-purchases/${id}`),
    getByFarmer: (farmerId: string) => fetchAPI(`/input-purchases/farmer/${farmerId}`),
    getInputDetails: (inputId: string) => fetchAPI(`/input-purchases/input-details/${inputId}`),
    create: (data: Record<string, unknown>) => postAPI('/input-purchases', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/input-purchases/${id}`, data),
    delete: (id: string) => deleteAPI(`/input-purchases/${id}`)
};

export const salesAPI = {
    getAll: () => fetchAPI('/sales'),
    getOne: (id: string) => fetchAPI(`/sales/${id}`),
    getByAgent: (agentId: string) => fetchAPI(`/sales/agent/${agentId}`),
    getByFarmer: (farmerId: string) => fetchAPI(`/sales/farmer/${farmerId}`),
    create: (data: Record<string, unknown>) => postAPI('/sales', data),
    update: (id: string, data: Record<string, unknown>) => putAPI(`/sales/${id}`, data),
    delete: (id: string) => deleteAPI(`/sales/${id}`)
};

// Report APIs
export const reportsAPI = {
    farmersList: () => fetchAPI('/reports/farmers-list'),
    farmersListSummary: () => fetchAPI('/reports/farmers-list/summary'),
    agentsCommission: () => fetchAPI('/reports/agents-commission'),
    agentsCommissionSummary: () => fetchAPI('/reports/agents-commission/summary'),
    agentDetail: (id: string) => fetchAPI(`/reports/agents-commission/agent/${id}`),
    agentsTrends: () => fetchAPI('/reports/agents-commission/trends'),
    deliveries: () => fetchAPI('/reports/deliveries'),
    deliveriesOverview: () => fetchAPI('/reports/deliveries/overview'),
    deliveriesMonthly: () => fetchAPI('/reports/deliveries/monthly-totals'),
    deliveriesFarmer: (id: string) => fetchAPI(`/reports/deliveries/farmer/${id}`),
    deliveriesFarmerDetail: (id: string) => fetchAPI(`/reports/deliveries/farmer/${id}/details`),
    loans: () => fetchAPI('/reports/loans'),
    loansMonthly: () => fetchAPI('/reports/loans/monthly'),
    loansFarmerOverview: () => fetchAPI('/reports/loans/farmer-overview'),
    loansActive: () => fetchAPI('/reports/loans/active'),
    loansFarmer: (id: string) => fetchAPI(`/reports/loans/farmer/${id}`),
    loansPortfolio: () => fetchAPI('/reports/loans/portfolio'),
    purchases: () => fetchAPI('/reports/purchases'),
    purchasesMonthly: () => fetchAPI('/reports/purchases/monthly-totals'),
    purchasesFarmerOverview: () => fetchAPI('/reports/purchases/farmer-overview'),
    purchasesPopular: () => fetchAPI('/reports/purchases/popular-inputs'),
    purchasesFarmer: (id: string) => fetchAPI(`/reports/purchases/farmer/${id}`),
    purchasesPortfolio: () => fetchAPI('/reports/purchases/portfolio'),
    statements: () => fetchAPI('/reports/farmer-statements'),
    statementFarmer: (id: string) => fetchAPI(`/reports/farmer-statements/farmer/${id}`),
    statementLifetime: () => fetchAPI('/reports/farmer-statements/lifetime'),
    statementProfile: (id: string) => fetchAPI(`/reports/farmer-statements/farmer/${id}/profile`),
    statementTrends: () => fetchAPI('/reports/farmer-statements/monthly-trends'),
    statementSociety: () => fetchAPI('/reports/farmer-statements/society-summary')
};