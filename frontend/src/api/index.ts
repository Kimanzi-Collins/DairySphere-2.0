const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const BASE_URL = RAW_API_BASE.replace(/\/api\/?$/, '').replace(/\/$/, '');
const API_BASE = RAW_API_BASE.replace(/\/$/, '');
 
type ApiEnvelope<T> = {
    success?: boolean;
    message?: string;
    count?: number;
    data?: T;
    [key: string]: unknown;
};

type RequestOptions = {
    method?: string;
    body?: BodyInit | null;
    skipAuth?: boolean;
};

const KEY_MAP: Record<string, string> = {
    USERIDNUM: 'UserIdNum',
    USERID: 'UserId',
    USERNAME: 'Username',
    EMAIL: 'Email',
    PASSWORDHASH: 'PasswordHash',
    ROLE: 'Role',
    ISACTIVE: 'IsActive',
    LASTLOGIN: 'LastLogin',
    CREATEDAT: 'CreatedAt',
    UPDATEDAT: 'UpdatedAt',

    FARMERIDNUM: 'FarmerIdNum',
    FARMERID: 'FarmerId',
    FARMERNAME: 'FarmerName',
    DATEOFBIRTH: 'DateOfBirth',
    AGE: 'Age',
    GENDER: 'Gender',
    LOCATION: 'Location',
    CONTACT: 'Contact',
    ENROLMENTDATE: 'EnrolmentDate',
    PROFILEPICURL: 'ProfilePicUrl',

    AGENTID: 'AgentId',
    AGENTNAME: 'AgentName',
    FACTORYID: 'FactoryId',
    FACTORYNAME: 'FactoryName',
    INPUTID: 'InputId',
    INPUTNAME: 'InputName',
    INPUTPRICE: 'InputPrice',

    QUALITYID: 'QualityId',
    GRADE: 'Grade',
    PRICEPERLITRE: 'PricePerLitre',
    RATEPERLITRE: 'RatePerLitre',

    LOANID: 'LoanId',
    LOANAMOUNT: 'LoanAmount',
    REPAYMENTPERIOD: 'RepaymentPeriod',
    DATEBORROWED: 'DateBorrowed',
    LOANSTATUS: 'LoanStatus',
    OUTSTANDINGBALANCE: 'OutstandingBalance',
    TOTALREPAID: 'TotalRepaid',
    TOTALREPAYABLE: 'TotalRepayable',

    REPAYMENTID: 'RepaymentId',
    REPAYMENTMONTH: 'RepaymentMonth',
    SCHEDULEDDATE: 'ScheduledDate',
    PAIDDATE: 'PaidDate',
    REMAININGBALANCE: 'RemainingBalance',
    REPAYMENTDATE: 'RepaymentDate',
    REPAYMENTAMOUNT: 'RepaymentAmount',
    REPAYMENTSTATUS: 'RepaymentStatus',
    NOTES: 'Notes',

    DELIVERYID: 'DeliveryId',
    BATCHREF: 'BatchRef',
    MILKQUANTITY: 'MilkQuantity',
    DELIVERYDATE: 'DeliveryDate',
    AMOUNT: 'Amount',

    PURCHASEID: 'PurchaseId',
    PURCHASEAMOUNT: 'PurchaseAmount',
    DATEOFPURCHASE: 'DateOfPurchase',
    QUANTITY: 'Quantity',

    SALEID: 'SaleId',
    SALEDATE: 'SaleDate',
    SALEAMOUNT: 'SaleAmount',
    COMMISSION: 'Commission',

    SUMMARYMONTH: 'SummaryMonth',
    MONTHDISPLAY: 'MonthDisplay',
    TXNMONTH: 'TxnMonth',
    TXNYEAR: 'TxnYear',
    TXNMONTHNUM: 'TxnMonthNum',
    NETPAYMENT: 'NetPayment',
    PAYMENTSTATUS: 'PaymentStatus',
    TOTALDEDUCTIONS: 'TotalDeductions',
    TOTALDELIVERIES: 'TotalDeliveries',
    TOTALLITRES: 'TotalLitres',
    TOTALREVENUE: 'TotalRevenue',
    TOTALFARMERS: 'TotalFarmers',
    TOTALSALEAMOUNT: 'TotalSaleAmount',
    TOTALCOMMISSION: 'TotalCommission',
    TOTALSALES: 'TotalSales',

    LITRES: 'MilkQuantity',
    Litres: 'MilkQuantity',
    QUALITYGRADE: 'Grade',
    QualityGrade: 'Grade',
    TOTALAMOUNT: 'Amount',
    TotalAmount: 'Amount',
    UNITPRICE: 'InputPrice',
    UnitPrice: 'InputPrice',
    TOTALCOST: 'PurchaseAmount',
    TotalCost: 'PurchaseAmount',
    PURCHASEDATE: 'DateOfPurchase',
    PurchaseDate: 'DateOfPurchase',
    MONTHS: 'RepaymentPeriod',
    Months: 'RepaymentPeriod',
    MONTHLYDEDUCTION: 'MonthlyDeduction',
    MonthlyDeduction: 'MonthlyDeduction',
    PERCENTREPAID: 'PercentRepaid',
    PercentRepaid: 'PercentRepaid',
    SUMMARYID: 'SummaryId',
    MILKSALESAMOUNT: 'DeliveryAmount',
    MilkSalesAmount: 'DeliveryAmount',
    DELIVERYAMOUNT: 'DeliveryAmount',
    DeliveryAmount: 'DeliveryAmount',
    AGENTCOMMISSION: 'CommissionDeduction',
    AgentCommission: 'CommissionDeduction',
    LOANDEDUCTIONS: 'LoanDeduction',
    LoanDeductions: 'LoanDeduction',
    LOAN_DEDUCTIONS: 'LoanDeduction',
    LoanDeductionsAmount: 'LoanDeduction',
    INPUTSPURCHASED: 'InputsDeduction',
    InputsPurchased: 'InputsDeduction',
    INPUTS_PURCHASED: 'InputsDeduction',
    InputsDeduction: 'InputsDeduction',
    NETEARNINGS: 'NetPayment',
    NetEarnings: 'NetPayment',
    NET_PAYMENT: 'NetPayment',
    TOTAL_DEDUCTIONS: 'TotalDeductions',
    PREVMONTHNET: 'PrevMonthNet',
    PrevMonthNet: 'PrevMonthNet',
    MONTHLYCHANGE: 'MonthlyChange',
    MonthlyChange: 'MonthlyChange',
    LASTUPDATED: 'LastUpdated',
    LastUpdated: 'LastUpdated',
    ACTIVEMONTHS: 'ActiveMonths',
    LIFETIMEDELIVERIES: 'LifetimeDeliveries',
    LIFETIMECOMMISSION: 'LifetimeCommission',
    LIFETIMECOMMISSIONPAID: 'LifetimeCommission',
    LIFETIMEINPUTSPURCHASED: 'LifetimeInputsPurchased',
    LIFETIMELITRES: 'LifetimeLitres',
    LIFETIMEDELIVERYAMOUNT: 'LifetimeDeliveryAmount',
    LIFETIMEMILKSALES: 'LifetimeDeliveryAmount',
    LIFETIMENETEARNINGS: 'LifetimeNetEarnings',
    LIFETIMETOTALDEDUCTIONS: 'LifetimeTotalDeductions',
    LIFETIMELOANDEDUCTIONS: 'LifetimeLoanDeductions',
    AVGMONTHLYNETPAYMENT: 'AvgMonthlyNetPayment',
    FARMERLOCATION: 'FarmerLocation',
    FARMERCONTACT: 'FarmerContact',
    FARMEREMAIL: 'FarmerEmail',
    OUTSTANDINGLOANBALANCE: 'OutstandingBalance',
    TOTALAGENTS: 'TotalAgents',
    TOTALFACTORIES: 'TotalFactories',
    TOTALINPUTTYPES: 'TotalInputTypes',
    TOTALLITRESALLTIME: 'TotalLitres',
    TOTALMILKREVENUEALLTIME: 'TotalDeliveryRevenue',
    TOTALCOMMISSIONALLTIME: 'TotalCommissionPaid',
    TOTALLOANDEDUCTIONSALLTIME: 'TotalLoanCollected',
    TOTALINPUTSALLTIME: 'TotalInputsSold',
    TOTALNETEARNINGSALLTIME: 'TotalNetEarnings',
    TOTALLOANSISSUED: 'TotalDisbursed',
    TOTALOUTSTANDINGLOANS: 'TotalOutstanding',
    TOTALLITRESDELIVERED: 'TotalLitres',
    TOTALMILKREVENUE: 'TotalDeliveryRevenue',
    TOTALCOMMISSIONPAID: 'TotalCommissionPaid',
    TOTALLOANDEDUCTIONS: 'TotalLoanCollected',
    TOTALINPUTSPURCHASED: 'TotalInputsSold',
    TOTALNETEARNINGS: 'TotalNetEarnings',
    FMT_MILKREVENUE: 'FMT_MilkRevenue',
    FMT_COMMISSION: 'FMT_Commission',
    FMT_LOANS: 'FMT_Loans',
    FMT_INPUTS: 'FMT_Inputs',
    FMT_NETEARNINGS: 'FMT_NetEarnings',
    ACTIVELOANS: 'ActiveLoans',
    COMPLETEDLOANS: 'CompletedLoans',
    DEFAULTEDLOANS: 'DefaultedLoans',
    FACTORYIDNUM: 'FactoryIdNum',
    BESTMONTHEARNING: 'BestMonthEarning',
    WORSTMONTHEARNING: 'WorstMonthEarning',
    MONTHSINCREDIT: 'MonthsInCredit',
    MONTHSINDEFICIT: 'MonthsInDeficit',
    AVGMONTHLYPAYMENT: 'AvgMonthlyPayment',
};

const NUMERIC_KEYS = new Set([
    'Age', 'MilkRank', 'RepaymentPeriod', 'TxnYear', 'TxnMonthNum',
    'TotalSales', 'TotalFarmers', 'TotalDeliveries', 'DeliveryCount',
    'ActiveMonths', 'MonthsInCredit', 'MonthsInDeficit',
    'TotalFarmers', 'TotalAgents', 'TotalFactories', 'TotalInputTypes', 'TotalLitres',
    'LoanAmount', 'RepaymentAmount', 'SaleAmount', 'Commission',
    'InputPrice', 'Quantity', 'PurchaseAmount', 'Amount', 'RatePerLitre',
    'PricePerLitre', 'MilkQuantity', 'TotalLitres', 'TotalEarnings',
    'TotalRevenue', 'TotalOutstanding', 'OutstandingBalance', 'TotalRepayable',
    'TotalRepaid', 'TotalPrincipal', 'DeliveryAmount', 'LoanDeduction',
    'InputsDeduction', 'CommissionDeduction', 'TotalDeductions', 'NetPayment',
    'TotalDeliveryRevenue', 'TotalCommissionPaid', 'TotalLoanCollected', 'TotalInputsSold', 'TotalNetEarnings', 'TotalDisbursed', 'TotalOutstanding',
    'AvgAge', 'AvgMonthlyPayment', 'AvgMonthlyNetPayment', 'BestMonthEarning',
    'WorstMonthEarning', 'LifetimeDeliveries', 'LifetimeLitres',
    'LifetimeDeliveryAmount', 'LifetimeCommission', 'LifetimeLoanDeductions',
    'LifetimeInputsPurchased', 'LifetimeTotalDeductions', 'LifetimeNetEarnings',
    'TotalSaleAmount', 'TotalCommission', 'TotalDisbursed', 'TotalTransactions',
    'ActiveLoans', 'CompletedLoans', 'TotalLoans', 'FarmersInCredit',
    'FarmersInDeficit', 'TotalNetPayments', 'MonthlyDeduction', 'PercentRepaid',
    'RemainingBalance', 'RepaymentAmount', 'DeliveryAmount', 'CommissionDeduction', 'LoanDeduction', 'InputsDeduction', 'NetPayment', 'PrevMonthNet', 'MonthlyChange', 'FactoryIdNum',
    'TotalLitresDelivered', 'TotalMilkRevenue', 'TotalCommissionPaid', 'TotalLoanDeductions', 'TotalInputsPurchased', 'TotalNetEarnings',
]);

function parseNumberish(value: unknown): unknown {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value !== 'string') {
        return value;
    }

    const trimmed = value.trim();
    if (!trimmed) return 0;

    // Extract numeric portion starting from first digit (handles currency prefixes like "Ksh.")
    const m = trimmed.match(/[0-9][0-9,\.\s-]*/);
    if (!m || !m[0]) return 0;
    // Remove thousands separators and spaces, keep decimal dot
    const digitsOnly = m[0].replace(/[,\s]/g, '');
    if (!digitsOnly) return 0;
    const parsed = Number(digitsOnly);
    const result = Number.isFinite(parsed) ? parsed : 0;

    return result;
}

function normalizeMonthlyStatementRow(row: Record<string, unknown>) {
    const deliveryAmount = safeNumber(row.DeliveryAmount ?? row.MilkSalesAmount ?? row.MILKSALESAMOUNT ?? 0);
    
    // Ensure all deduction types are extracted and fallback to 0
    const commissionDeduction = safeNumber(row.CommissionDeduction ?? row.AgentCommission ?? row.AGENTCOMMISSION ?? row.Commission ?? row.COMMISSION ?? 0);
    const loanDeduction = safeNumber(row.LoanDeduction ?? row.LoanDeductions ?? row.LOANDEDUCTIONS ?? row.LoanDeductionsAmount ?? 0);
    const inputsDeduction = safeNumber(row.InputsDeduction ?? row.InputsPurchased ?? row.INPUTSPURCHASED ?? 0);
    
    // Calculate total deductions from parts, as a fallback
    const calculatedTotal = commissionDeduction + loanDeduction + inputsDeduction;
    const totalDeductions = safeNumber(row.TotalDeductions ?? (calculatedTotal > 0 ? calculatedTotal : 0));
    
    const netPayment = safeNumber(row.NetPayment ?? row.NetEarnings ?? row.NETEARNINGS ?? 0);

    return {
        ...row,
        MonthDisplay: row.MonthDisplay ?? row.SummaryMonth ?? row.SUMMARYMONTH ?? '',
        DeliveryAmount: deliveryAmount,
        CommissionDeduction: commissionDeduction,
        LoanDeduction: loanDeduction,
        InputsDeduction: inputsDeduction,
        TotalDeductions: totalDeductions,
        NetPayment: netPayment,
        TotalLitres: safeNumber(row.TotalLitres ?? row.Totallitres ?? row.TOTALLITRES ?? 0),
        DeliveryCount: safeNumber(row.DeliveryCount ?? 1),
        PaymentStatus: row.PaymentStatus ?? (netPayment >= 0 ? 'Credit' : 'Deficit'),
    };
}

function normalizeApiData<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map((item) => normalizeApiData(item)) as T;
    }

    if (value && typeof value === 'object') {
        const record = value as Record<string, unknown>;
        const normalized: Record<string, unknown> = {};
        Object.entries(record).forEach(([key, item]) => {
            const mappedKey = KEY_MAP[key] || key;
            const normalizedItem = normalizeApiData(item);
            normalized[mappedKey] = NUMERIC_KEYS.has(mappedKey)
                ? parseNumberish(normalizedItem)
                : normalizedItem;
        });
        // Always normalize monthly statement rows if they have delivery or net payment data
        if (normalized.DeliveryAmount !== undefined || normalized.NetPayment !== undefined) {
            return normalizeMonthlyStatementRow(normalized as Record<string, unknown>) as T;
        }
        return normalized as T;
    }

    return value;
}

function getAuthToken() {
    return localStorage.getItem('dairysphere_token');
}

function clearSessionAndRedirectToSignIn() {
    localStorage.removeItem('dairysphere_token');
    localStorage.removeItem('dairysphere_user');

    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/signin')) {
        window.location.assign('/signin');
    }
}

async function requestJSON<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
    const headers: Record<string, string> = {};

    if (!options.skipAuth) {
        const token = getAuthToken();
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && options.body !== undefined && options.body !== null) {
        headers['Content-Type'] = 'application/json';
    }

    let res: Response;
    try {
        res = await fetch(`${API_BASE}${endpoint}`, {
            method: options.method || 'GET',
            headers,
            body: options.body ?? null,
        });
    } catch {
        throw new Error(`Unable to reach API at ${API_BASE}. Ensure backend server is running and VITE_API_BASE_URL is correct.`);
    }

    const payload = await res.json().catch(() => ({}));

    

    if (!res.ok) {
        const status = res.status;
        if (!options.skipAuth && (status === 401 || status === 403)) {
            clearSessionAndRedirectToSignIn();
        }

        throw new Error(payload?.message || `API Error: ${status} on ${endpoint}`);
    }

    return normalizeApiData(payload) as ApiEnvelope<T>;
}

function unwrapList<T>(payload: ApiEnvelope<T[]> | T[] | unknown): T[] {
    if (Array.isArray(payload)) return payload;
    const maybe = payload as ApiEnvelope<T[]>;
    if (Array.isArray(maybe?.data)) return maybe.data;
    return [];
}

function unwrapItem<T>(payload: ApiEnvelope<T> | T): T {
    const maybe = payload as ApiEnvelope<T>;
    return (maybe?.data as T) ?? (payload as T);
}

function monthKey(dateValue: string) {
    if (!dateValue) return 'Unknown';
    const value = String(dateValue).trim();
    if (/^\d{4}-\d{2}/.test(value)) return value.slice(0, 7);

    const dayMonthYear = value.match(/^\d{1,2}-([A-Za-z]{3})-(\d{4})/);
    if (dayMonthYear) {
        const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            .indexOf(dayMonthYear[1].toLowerCase()) + 1;
        if (month > 0) return `${dayMonthYear[2]}-${String(month).padStart(2, '0')}`;
    }

    const monthYear = value.match(/^([A-Za-z]{3,})\s+(\d{4})/);
    if (monthYear) {
        const month = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
            .indexOf(monthYear[1].slice(0, 3).toLowerCase()) + 1;
        if (month > 0) return `${monthYear[2]}-${String(month).padStart(2, '0')}`;
    }

    return value.slice(0, 7);
}

function monthDisplay(dateValue: string) {
    if (!dateValue) return 'Unknown';
    const key = monthKey(dateValue);
    const date = new Date(key === 'Unknown' ? dateValue : `${key}-01T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateValue.slice(0, 7);
    return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(date);
}

function safeNumber(value: unknown) {
    const num = Number(value ?? 0);
    return Number.isFinite(num) ? num : 0;
}

function normalizeFarmerRecord(raw: Record<string, unknown>) {
    const farmerId = String(raw.FarmerId ?? raw.farmerId ?? '').trim();
    return {
        ...raw,
        FarmerId: farmerId,
        FarmerName: String(raw.FarmerName ?? raw.farmerName ?? 'Unknown Farmer').trim(),
        Location: String(raw.Location ?? raw.FarmerLocation ?? raw.location ?? 'Unknown').trim(),
        Contact: String(raw.Contact ?? raw.FarmerContact ?? raw.contact ?? '').trim(),
        Email: (raw.Email ?? raw.FarmerEmail ?? raw.email ?? null) as string | null,
        DateOfBirth: String(raw.DateOfBirth ?? raw.dateOfBirth ?? ''),
        EnrolmentDate: String(raw.EnrolmentDate ?? raw.enrolmentDate ?? ''),
        ProfilePicUrl: (raw.ProfilePicUrl ?? raw.profilePicUrl ?? null) as string | null,
        Gender: String(raw.Gender ?? raw.gender ?? 'Unknown'),
        Age: safeNumber(raw.Age ?? raw.age ?? 0),
        CreatedAt: String(raw.CreatedAt ?? raw.createdAt ?? ''),
    };
}

function emptyMonthlyRow(key: string, display: string) {
    return {
        SummaryMonth: key,
        MonthDisplay: display,
        TotalLitres: 0,
        DeliveryCount: 0,
        DeliveryAmount: 0,
        CommissionDeduction: 0,
        LoanDeduction: 0,
        InputsDeduction: 0,
        TotalDeductions: 0,
        NetPayment: 0,
        PaymentStatus: 'Zero',
    };
}

function getMonthlyBucket(map: Map<string, ReturnType<typeof emptyMonthlyRow>>, dateValue: unknown) {
    const key = monthKey(String(dateValue || ''));
    const display = monthDisplay(String(dateValue || ''));
    const existing = map.get(key);
    if (existing) return existing;

    const row = emptyMonthlyRow(key, display);
    map.set(key, row);
    return row;
}

async function buildMonthlyStatementsFromTransactions(farmerId: string) {
    const [deliveriesResult, salesResult, purchasesResult, repaymentsResult] = await Promise.allSettled([
        deliveriesAPI.getByFarmer(farmerId),
        salesAPI.getByFarmer(farmerId),
        inputPurchasesAPI.getByFarmer(farmerId),
        loanRepaymentsAPI.getAll({ farmerId, status: 'Paid' }),
    ]);

    const deliveries = deliveriesResult.status === 'fulfilled' ? deliveriesResult.value as any[] : [];
    const sales = salesResult.status === 'fulfilled' ? salesResult.value as any[] : [];
    const purchases = purchasesResult.status === 'fulfilled' ? purchasesResult.value as any[] : [];
    const repayments = repaymentsResult.status === 'fulfilled' ? repaymentsResult.value as any[] : [];

    const monthly = new Map<string, ReturnType<typeof emptyMonthlyRow>>();

    deliveries.forEach((delivery) => {
        const row = getMonthlyBucket(monthly, delivery.DeliveryDate);
        row.TotalLitres += safeNumber(delivery.MilkQuantity ?? delivery.Litres);
        row.DeliveryCount += 1;
        row.DeliveryAmount += safeNumber(delivery.Amount ?? delivery.DeliveryAmount ?? delivery.TotalAmount);
    });

    sales.forEach((sale) => {
        const row = getMonthlyBucket(monthly, sale.SaleDate);
        row.CommissionDeduction += safeNumber(sale.Commission);
    });

    purchases.forEach((purchase) => {
        const row = getMonthlyBucket(monthly, purchase.DateOfPurchase ?? purchase.PurchaseDate);
        row.InputsDeduction += safeNumber(purchase.PurchaseAmount ?? purchase.TotalCost);
    });

    repayments.forEach((repayment) => {
        const row = getMonthlyBucket(monthly, repayment.RepaymentMonth ?? repayment.PaidDate ?? repayment.ScheduledDate);
        row.LoanDeduction += safeNumber(repayment.RepaymentAmount);
    });

    return Array.from(monthly.values()).map((row) => {
        row.TotalDeductions = row.CommissionDeduction + row.LoanDeduction + row.InputsDeduction;
        row.NetPayment = row.DeliveryAmount - row.TotalDeductions;
        row.PaymentStatus = row.NetPayment > 0 ? 'Credit' : row.NetPayment < 0 ? 'Deficit' : 'Zero';
        return row;
    }).sort((a, b) => b.SummaryMonth.localeCompare(a.SummaryMonth));
}

function buildSummaryFromProfileAndMonthly(profile: Record<string, unknown>, monthly: any[]) {
    const netPayments = monthly.map((row) => safeNumber(row.NetPayment));
    const totalNet = netPayments.reduce((acc, value) => acc + value, 0);
    return {
        FarmerId: profile.FarmerId,
        FarmerName: profile.FarmerName,
        FarmerLocation: profile.Location,
        FarmerContact: profile.Contact,
        FarmerEmail: profile.Email,
        ProfilePicUrl: profile.ProfilePicUrl,
        Age: safeNumber(profile.Age),
        Gender: profile.Gender,
        EnrolmentDate: profile.EnrolmentDate,
        ActiveMonths: monthly.length,
        LifetimeDeliveries: monthly.reduce((acc, row) => acc + safeNumber(row.DeliveryCount), 0),
        LifetimeLitres: monthly.reduce((acc, row) => acc + safeNumber(row.TotalLitres), 0),
        LifetimeDeliveryAmount: monthly.reduce((acc, row) => acc + safeNumber(row.DeliveryAmount), 0),
        LifetimeCommission: monthly.reduce((acc, row) => acc + safeNumber(row.CommissionDeduction), 0),
        LifetimeLoanDeductions: monthly.reduce((acc, row) => acc + safeNumber(row.LoanDeduction), 0),
        LifetimeInputsPurchased: monthly.reduce((acc, row) => acc + safeNumber(row.InputsDeduction), 0),
        LifetimeTotalDeductions: monthly.reduce((acc, row) => acc + safeNumber(row.TotalDeductions), 0),
        LifetimeNetEarnings: totalNet,
        AvgMonthlyNetPayment: monthly.length ? totalNet / monthly.length : 0,
        BestMonthEarning: monthly.length ? Math.max(...netPayments) : 0,
        WorstMonthEarning: monthly.length ? Math.min(...netPayments) : 0,
        MonthsInCredit: netPayments.filter((value) => value > 0).length,
        MonthsInDeficit: netPayments.filter((value) => value < 0).length,
    };
}

async function getFarmerStatementData(farmerId: string) {
    const profile = await farmersAPI.getOne(farmerId) as Record<string, unknown>;

    let monthlyStatements: any[] = [];
    try {
        monthlyStatements = await farmersAPI.getMonthlyEarnings(farmerId) as any[];
    } catch {
        monthlyStatements = await buildMonthlyStatementsFromTransactions(farmerId);
    }

    let summary: Record<string, unknown>;
    try {
        summary = await farmersAPI.getSummary(farmerId) as Record<string, unknown>;
    } catch {
        summary = buildSummaryFromProfileAndMonthly(profile, monthlyStatements);
    }

    return { profile, summary, monthlyStatements };
}

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
    const map = new Map<string, T[]>();
    items.forEach((item) => {
        const key = keyFn(item);
        const list = map.get(key) || [];
        list.push(item);
        map.set(key, list);
    });
    return map;
}

export const authAPI = {
    login: async (username: string, password: string) => requestJSON('/auth/login', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ username, password }),
    }),
    register: async (username: string, email: string, password: string) => requestJSON('/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: JSON.stringify({ username, email, password }),
    }),
    me: async () => requestJSON('/auth/me'),
    changePassword: async (currentPassword: string, newPassword: string) => requestJSON('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export const farmersAPI = {
    getAll: async () => {
        const list = unwrapList(await requestJSON('/farmers')) as Array<Record<string, unknown>>;
        return list.map(normalizeFarmerRecord);
    },
    getOne: async (id: string) => {
        const item = unwrapItem(await requestJSON(`/farmers/${id}`)) as Record<string, unknown>;
        return normalizeFarmerRecord(item);
    },
    getSummary: async (id: string) => unwrapItem(await requestJSON(`/farmers/${id}/summary`)),
    getMonthlyEarnings: async (id: string) => unwrapList(await requestJSON(`/farmers/${id}/monthly-earnings`)),
    getTransactions: async (id: string) => unwrapList(await requestJSON(`/farmers/${id}/transactions`)),
    create: async (data: Record<string, unknown>) => {
        const created = unwrapItem(await requestJSON('/farmers', {
            method: 'POST',
            body: JSON.stringify(data),
        })) as Record<string, unknown>;
        // Backend returns farmerId in lower camel case; normalize to FarmerId for callers.
        return {
            ...created,
            FarmerId: String(created.FarmerId ?? created.farmerId ?? ''),
        };
    },
    update: async (id: string, data: Record<string, unknown>) => unwrapItem(await requestJSON(`/farmers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/farmers/${id}`, { method: 'DELETE' })),
    uploadProfilePic: async (id: string, file: File) => {
        const formData = new FormData();
        formData.append('profilePic', file);
        return unwrapItem(await requestJSON(`/farmers/${id}/profile-pic`, {
            method: 'PUT',
            body: formData,
        }));
    },
};

export const agentsAPI = {
    getAll: async () => unwrapList(await requestJSON('/agents')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/agents/${id}`)),
    getPerformance: async (id: string) => unwrapItem(await requestJSON(`/agents/${id}/performance`)),
    getSales: async (id: string) => unwrapList(await requestJSON(`/agents/${id}/sales`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/agents', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    update: async (id: string, data: Record<string, unknown>) => unwrapItem(await requestJSON(`/agents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/agents/${id}`, { method: 'DELETE' })),
};

export const factoriesAPI = {
    getAll: async () => unwrapList(await requestJSON('/factories')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/factories/${id}`)),
    getDeliveries: async (id: string) => unwrapList(await requestJSON(`/factories/${id}/deliveries`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/factories', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    update: async (id: string, data: Record<string, unknown>) => unwrapItem(await requestJSON(`/factories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/factories/${id}`, { method: 'DELETE' })),
};

export const inputsAPI = {
    getAll: async () => unwrapList(await requestJSON('/inputs')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/inputs/${id}`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/inputs', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    update: async (id: string, data: Record<string, unknown>) => unwrapItem(await requestJSON(`/inputs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/inputs/${id}`, { method: 'DELETE' })),
};

export const milkQualityAPI = {
    getAll: async () => unwrapList(await requestJSON('/milk-quality')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/milk-quality/${id}`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/milk-quality', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    update: async (id: string, data: Record<string, unknown>) => unwrapItem(await requestJSON(`/milk-quality/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/milk-quality/${id}`, { method: 'DELETE' })),
};

export const loansAPI = {
    getAll: async () => unwrapList(await requestJSON('/loans')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/loans/${id}`)),
    getByFarmer: async (farmerId: string) => unwrapList(await requestJSON(`/loans/farmer/${farmerId}`)),
    getSchedule: async (id: string) => unwrapList(await requestJSON(`/loans/${id}/schedule`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/loans', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/loans/${id}`, { method: 'DELETE' })),
};

export const loanRepaymentsAPI = {
    getAll: async (params?: { status?: string; farmerId?: string; month?: string }) => {
        const query = new URLSearchParams();
        if (params?.status) query.set('status', params.status);
        if (params?.farmerId) query.set('farmerId', params.farmerId);
        if (params?.month) query.set('month', params.month);
        return unwrapList(await requestJSON(`/loan-repayments${query.toString() ? `?${query.toString()}` : ''}`));
    },
    getByLoan: async (loanId: string) => unwrapList(await requestJSON(`/loan-repayments/${loanId}`)),
    processMonthly: async (month?: string) => unwrapItem(await requestJSON('/loan-repayments/process', {
        method: 'POST',
        body: JSON.stringify({ month }),
    })),
};

export const deliveriesAPI = {
    getAll: async () => unwrapList(await requestJSON('/deliveries')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/deliveries/${id}`)),
    getByFarmer: async (farmerId: string) => unwrapList(await requestJSON(`/deliveries/farmer/${farmerId}`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/deliveries', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    update: async (id: string, data: Record<string, unknown>) => unwrapItem(await requestJSON(`/deliveries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/deliveries/${id}`, { method: 'DELETE' })),
};

export const inputPurchasesAPI = {
    getAll: async () => unwrapList(await requestJSON('/purchases')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/purchases/${id}`)),
    getByFarmer: async (farmerId: string) => unwrapList(await requestJSON(`/purchases/farmer/${farmerId}`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/purchases', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/purchases/${id}`, { method: 'DELETE' })),
};

export const salesAPI = {
    getAll: async () => unwrapList(await requestJSON('/sales')),
    getOne: async (id: string) => unwrapItem(await requestJSON(`/sales/${id}`)),
    getByAgent: async (agentId: string) => unwrapList(await requestJSON(`/sales/agent/${agentId}`)),
    getByFarmer: async (farmerId: string) => unwrapList(await requestJSON(`/sales/farmer/${farmerId}`)),
    create: async (data: Record<string, unknown>) => unwrapItem(await requestJSON('/sales', {
        method: 'POST',
        body: JSON.stringify(data),
    })),
    update: async (id: string, data: Record<string, unknown>) => unwrapItem(await requestJSON(`/sales/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })),
    delete: async (id: string) => unwrapItem(await requestJSON(`/sales/${id}`, { method: 'DELETE' })),
};

export const dashboardAPI = {
    lifetime: async () => unwrapItem(await requestJSON('/dashboard/lifetime')),
    monthly: async () => unwrapList(await requestJSON('/dashboard/monthly')),
    topFarmers: async (limit = 5) => unwrapList(await requestJSON(`/dashboard/top-farmers?limit=${limit}`)),
    agentPerformance: async () => unwrapList(await requestJSON('/dashboard/agent-performance')),
    loanOverview: async () => unwrapList(await requestJSON('/dashboard/loan-overview')),
};

function aggregateFarmersByLocation(farmers: Array<{ Location?: string; Age?: number; Gender?: string }>) {
    const groups = groupBy(farmers, (farmer) => farmer.Location || 'Unknown');
    return Array.from(groups.entries()).map(([Location, items]) => ({
        Location,
        TotalFarmers: items.length,
        AvgAge: items.length ? items.reduce((acc, farmer) => acc + safeNumber(farmer.Age), 0) / items.length : 0,
        Males: items.filter((farmer) => String(farmer.Gender || '').toLowerCase() === 'male').length,
        Females: items.filter((farmer) => String(farmer.Gender || '').toLowerCase() === 'female').length,
    })).sort((a, b) => b.TotalFarmers - a.TotalFarmers);
}

function aggregateMonthly<T>(items: T[], getDate: (item: T) => string, reducer: (acc: any, item: T) => void) {
    const grouped = new Map<string, any>();
    items.forEach((item) => {
        const date = getDate(item);
        const key = monthKey(date);
        const existing = grouped.get(key) || { key, display: monthDisplay(date) };
        reducer(existing, item);
        grouped.set(key, existing);
    });
    return Array.from(grouped.values()).sort((a, b) => a.key.localeCompare(b.key));
}

async function buildStatementSeries() {
    const farmers = await farmersAPI.getAll() as Array<{ FarmerId: string }>;
    const settled = await Promise.allSettled(farmers.map(async (farmer) => {
        const { profile, summary, monthlyStatements } = await getFarmerStatementData(farmer.FarmerId);
        return { profile: profile as any, summary: summary as any, monthly: monthlyStatements as any[] };
    }));

    const results = settled
        .filter((item): item is PromiseFulfilledResult<{ profile: any; summary: any; monthly: any[] }> => item.status === 'fulfilled')
        .map((item) => item.value);

    const statements = results.flatMap(({ profile, monthly }) => monthly.map((row: any) => ({
        FarmerId: profile.FarmerId,
        FarmerName: profile.FarmerName,
        FarmerLocation: profile.Location,
        ProfilePicUrl: profile.ProfilePicUrl,
        MonthDisplay: row.MonthDisplay || row.SummaryMonth || '',
        DeliveryAmount: safeNumber(row.DeliveryAmount ?? 0),
        TotalDeductions: safeNumber(row.TotalDeductions ?? 0),
        NetPayment: safeNumber(row.NetPayment ?? 0),
        PaymentStatus: row.PaymentStatus || 'Unknown',
    })));

    return { farmers, results, statements };
}

export const reportsAPI = {
    farmersList: async () => farmersAPI.getAll(),
    farmersListSummary: async () => aggregateFarmersByLocation(await farmersAPI.getAll() as Array<{ Location?: string; Age?: number; Gender?: string }>),

    agentsCommissionSummary: async () => dashboardAPI.agentPerformance(),
    agentsTrends: async () => {
        const sales = await salesAPI.getAll();
        return aggregateMonthly(sales as Array<{ SaleDate: string; SaleAmount: number; Commission: number }>,
            (item) => item.SaleDate,
            (acc, item) => {
                acc.SaleMonthDisplay = acc.display;
                acc.TotalSales = safeNumber(acc.TotalSales) + safeNumber(item.SaleAmount);
                acc.TotalCommission = safeNumber(acc.TotalCommission) + safeNumber(item.Commission);
            });
    },

    deliveries: async () => deliveriesAPI.getAll(),
    deliveriesOverview: async () => {
        const deliveries = await deliveriesAPI.getAll();
        const grouped = groupBy(deliveries as Array<any>, (row) => row.FarmerId || 'Unknown');
        return Array.from(grouped.entries()).map(([FarmerId, rows]) => ({
            FarmerId,
            FarmerName: rows[0]?.FarmerName || 'Unknown',
            FarmerLocation: rows[0]?.FarmerLocation || rows[0]?.Location || 'Unknown',
            TotalDeliveries: rows.length,
            TotalLitres: rows.reduce((acc, row) => acc + safeNumber(row.MilkQuantity), 0),
            TotalRevenue: rows.reduce((acc, row) => acc + safeNumber(row.Amount), 0),
        })).sort((a, b) => b.TotalRevenue - a.TotalRevenue);
    },
    deliveriesMonthly: async () => {
        const deliveries = await deliveriesAPI.getAll();
        return aggregateMonthly(deliveries as Array<any>, (item) => item.DeliveryDate, (acc, item) => {
            acc.DeliveryMonthDisplay = acc.display;
            acc.ActiveFarmers = acc.ActiveFarmers || 0;
            acc.TotalDeliveries = safeNumber(acc.TotalDeliveries) + 1;
            acc.TotalLitres = safeNumber(acc.TotalLitres) + safeNumber(item.MilkQuantity);
            acc.TotalRevenue = safeNumber(acc.TotalRevenue) + safeNumber(item.Amount);
            acc.__farmerSet = acc.__farmerSet || new Set<string>();
            if (item.FarmerId) acc.__farmerSet.add(item.FarmerId);
            acc.ActiveFarmers = acc.__farmerSet.size;
        }).map((row) => {
            delete row.__farmerSet;
            return row;
        });
    },
    deliveriesFarmer: async (id: string) => deliveriesAPI.getByFarmer(id),
    deliveriesFarmerDetail: async (id: string) => deliveriesAPI.getByFarmer(id),

    loans: async () => loansAPI.getAll(),
    loansMonthly: async () => {
        const loans = await loansAPI.getAll();
        return aggregateMonthly(loans as Array<any>, (item) => item.DateBorrowed, (acc, item) => {
            acc.BorrowedMonthDisplay = acc.display;
            acc.TotalPrincipal = safeNumber(acc.TotalPrincipal) + safeNumber(item.LoanAmount);
            acc.TotalOutstanding = safeNumber(acc.TotalOutstanding) + safeNumber(item.OutstandingBalance || item.TotalOutstanding || (safeNumber(item.LoanAmount) - safeNumber(item.TotalRepaid)));
            acc.ActiveLoans = safeNumber(acc.ActiveLoans) + (String(item.LoanStatus || '').toLowerCase() === 'active' ? 1 : 0);
        });
    },
    loansFarmerOverview: async () => dashboardAPI.loanOverview(),
    loansActive: async () => {
        const loans = await dashboardAPI.loanOverview();
        return (loans as Array<any>)
            .filter((loan) => String(loan.LoanStatus || '').toLowerCase() === 'active')
            .sort((a, b) => safeNumber(b.OutstandingBalance || b.TotalOutstanding) - safeNumber(a.OutstandingBalance || a.TotalOutstanding))
            .map((loan) => ({
                LoanId: loan.LoanId,
                FarmerName: loan.FarmerName,
                LoanAmount: safeNumber(loan.LoanAmount),
                TotalRepayable: safeNumber(loan.TotalRepayable || loan.LoanAmount),
                OutstandingBalance: safeNumber(loan.OutstandingBalance || loan.TotalOutstanding),
                DueDateDisplay: loan.DueDateDisplay || loan.EstimatedCompletion || loan.CompletionDate || '—',
            }));
    },
    loansFarmer: async (id: string) => loansAPI.getByFarmer(id),
    loansPortfolio: async () => {
        const loans = await dashboardAPI.loanOverview();
        const rows = loans as Array<any>;
        return {
            TotalLoans: rows.length,
            ActiveLoans: rows.filter((loan) => String(loan.LoanStatus || '').toLowerCase() === 'active').length,
            CompletedLoans: rows.filter((loan) => String(loan.LoanStatus || '').toLowerCase() === 'completed').length,
            TotalOutstanding: rows.reduce((acc, loan) => acc + safeNumber(loan.OutstandingBalance || loan.TotalOutstanding), 0),
            TotalInterestEarned: rows.reduce((acc, loan) => acc + Math.max(0, safeNumber(loan.LoanAmount) * 0.1 * (safeNumber(loan.RepaymentPeriod) / 12)), 0),
            TotalDisbursed: rows.reduce((acc, loan) => acc + safeNumber(loan.LoanAmount), 0),
        };
    },

    purchases: async () => inputPurchasesAPI.getAll(),
    purchasesMonthly: async () => {
        const purchases = await inputPurchasesAPI.getAll();
        return aggregateMonthly(purchases as Array<any>, (item) => item.DateOfPurchase, (acc, item) => {
            acc.PurchaseMonthDisplay = acc.display;
            acc.TotalTransactions = safeNumber(acc.TotalTransactions) + 1;
            acc.TotalSpent = safeNumber(acc.TotalSpent) + safeNumber(item.PurchaseAmount);
        });
    },
    purchasesFarmerOverview: async () => inputPurchasesAPI.getAll(),
    purchasesPopular: async () => {
        const purchases = await inputPurchasesAPI.getAll();
        const grouped = groupBy(purchases as Array<any>, (row) => row.InputId || 'Unknown');
        return Array.from(grouped.entries()).map(([InputId, rows]) => ({
            InputId,
            InputName: rows[0]?.InputName || 'Unknown',
            TimesPurchased: rows.length,
            TotalRevenue: rows.reduce((acc, row) => acc + safeNumber(row.PurchaseAmount), 0),
            UniqueBuyers: new Set(rows.map((row) => row.FarmerId).filter(Boolean)).size,
        })).sort((a, b) => b.TotalRevenue - a.TotalRevenue);
    },
    purchasesFarmer: async (id: string) => inputPurchasesAPI.getByFarmer(id),
    purchasesPortfolio: async () => {
        const purchases = await inputPurchasesAPI.getAll();
        return {
            TotalTransactions: purchases.length,
            TotalBuyers: new Set((purchases as Array<any>).map((row) => row.FarmerId).filter(Boolean)).size,
            UniqueInputs: new Set((purchases as Array<any>).map((row) => row.InputId).filter(Boolean)).size,
            TotalRevenue: (purchases as Array<any>).reduce((acc, row) => acc + safeNumber(row.PurchaseAmount), 0),
        };
    },

    statements: async () => (await buildStatementSeries()).statements,
    statementFarmer: async (id: string) => {
        const { profile, summary, monthlyStatements } = await getFarmerStatementData(id);
        return {
            profile: {
                ...profile,
                ...summary,
            },
            monthlyStatements,
        };
    },
    statementLifetime: async () => {
        const farmers = await farmersAPI.getAll() as Array<{ FarmerId: string }>;
        const results = await Promise.allSettled(farmers.map(async (farmer) => {
            const { summary } = await getFarmerStatementData(farmer.FarmerId);
            return summary;
        }));
        return results
            .filter((item): item is PromiseFulfilledResult<Record<string, unknown>> => item.status === 'fulfilled')
            .map((item) => item.value);
    },
    statementProfile: async (id: string) => {
        const { profile, summary, monthlyStatements } = await getFarmerStatementData(id);
        
        // Calculate performance analytics from monthly data (track NetPayment, not just delivery)
        let bestMonthEarning = monthlyStatements.length > 0 ? safeNumber(monthlyStatements[0].NetPayment ?? 0) : 0;
        let worstMonthEarning = bestMonthEarning;
        let totalNetPayment = 0;
        let monthsInCredit = 0;
        let monthsInDeficit = 0;
        
        monthlyStatements.forEach((m: any) => {
            const net = safeNumber(m.NetPayment ?? 0);
            
            totalNetPayment += net;
            bestMonthEarning = Math.max(bestMonthEarning, net);
            worstMonthEarning = Math.min(worstMonthEarning, net);
            
            if (net >= 0) monthsInCredit++;
            else monthsInDeficit++;
        });
        
        const avgMonthlyNetPayment = monthlyStatements.length > 0 ? totalNetPayment / monthlyStatements.length : 0;
        
        return {
            profile: {
                ...profile,
                ...summary,
                FarmerLocation: profile.Location,
                FarmerContact: profile.Contact,
                BestMonthEarning: bestMonthEarning,
                WorstMonthEarning: worstMonthEarning,
                AvgMonthlyNetPayment: avgMonthlyNetPayment,
                MonthsInCredit: monthsInCredit,
                MonthsInDeficit: monthsInDeficit,
            },
            monthlyStatements,
        };
    },
    statementTrends: async () => {
        const series = await buildStatementSeries();
        const grouped = new Map<string, any>();
        
        // Group statements by month and track farmer credit/deficit status
        series.statements.forEach((item: any) => {
            const date = item.MonthDisplay || '';
            const key = monthKey(date);
            const display = monthDisplay(date);
            
            if (!grouped.has(key)) {
                grouped.set(key, {
                    key,
                    MonthDisplay: display,
                    TotalDeliveries: 0,
                    TotalAllDeductions: 0,
                    TotalNetPayments: 0,
                    FarmersInCredit: 0,
                    FarmersInDeficit: 0,
                    __farmerStatus: new Map<string, boolean>(), // true = credit, false = deficit
                });
            }
            
            const month = grouped.get(key)!;
            month.TotalDeliveries = safeNumber(month.TotalDeliveries) + safeNumber(item.DeliveryAmount);
            month.TotalAllDeductions = safeNumber(month.TotalAllDeductions) + safeNumber(item.TotalDeductions);
            month.TotalNetPayments = safeNumber(month.TotalNetPayments) + safeNumber(item.NetPayment);
            
            // Track if this farmer is in credit or deficit for this month
            const isCredit = safeNumber(item.NetPayment) >= 0;
            month.__farmerStatus.set(item.FarmerId, isCredit);
        });
        
        // Calculate final credit/deficit counts
        const result = Array.from(grouped.values())
            .map((month: any) => {
                month.FarmersInCredit = Array.from(month.__farmerStatus.values()).filter(v => v).length;
                month.FarmersInDeficit = Array.from(month.__farmerStatus.values()).filter(v => !v).length;
                delete month.__farmerStatus;
                return month;
            })
            .sort((a, b) => a.key.localeCompare(b.key));
        
        return result;
    },
    statementSociety: async () => unwrapItem(await requestJSON('/dashboard/lifetime')),
};
