// Farmer
export interface Farmer {
    FarmerId: string;
    FarmerName: string;
    DateOfBirth: string;
    Age: number;
    Gender: string;
    Email: string | null;
    Location: string;
    Contact: string;
    EnrolmentDate: string;
    ProfilePicUrl: string | null;
    CreatedAt: string;
}

// Agent
export interface Agent {
    AgentId: string;
    AgentName: string;
    Contact: string;
    Location: string;
    CreatedAt: string;
}

// Factory
export interface Factory {
    FactoryId: string;
    FactoryName: string;
    Location: string;
    Contact: string;
    CreatedAt: string;
}

// Input
export interface Input {
    InputId: string;
    InputName: string;
    InputPrice: number;
    CreatedAt: string;
}

// Milk Quality
export interface MilkQuality {
    QualityId: string;
    Grade: string;
    PricePerLitre: number;
    CreatedAt: string;
}

// Loan
export interface Loan {
    LoanId: string;
    FarmerId: string;
    FarmerName: string;
    LoanAmount: number;
    RepaymentPeriod: number;
    DateBorrowed: string;
    CreatedAt: string;
}

// Delivery
export interface Delivery {
    DeliveryId: string;
    BatchRef: string;
    FarmerId: string;
    FarmerName: string;
    MilkQuantity: number;
    QualityId: string;
    Grade: string;
    RatePerLitre: number;
    FactoryId: string;
    FactoryName: string;
    DeliveryDate: string;
    Amount: number;
    CreatedAt: string;
}

// Input Purchase
export interface InputPurchase {
    PurchaseId: string;
    FarmerId: string;
    FarmerName: string;
    InputId: string;
    InputName: string;
    InputPrice: number;
    Quantity: number;
    PurchaseAmount: number;
    DateOfPurchase: string;
    CreatedAt: string;
}

// Sale
export interface Sale {
    SaleId: string;
    SaleDate: string;
    AgentId: string;
    AgentName: string;
    FarmerId: string;
    FarmerName: string;
    SaleAmount: number;
    Commission: number;
    CreatedAt: string;
}

// Statement
export interface MonthlyStatement {
    FarmerId: string;
    FarmerName: string;
    FarmerLocation: string;
    ProfilePicUrl: string | null;
    MonthDisplay: string;
    TxnMonth: string;
    TxnYear: number;
    TxnMonthNum: number;
    DeliveryCount: number;
    TotalLitres: number;
    DeliveryAmount: number;
    CommissionDeduction: number;
    LoanDeduction: number;
    InputsDeduction: number;
    TotalDeductions: number;
    NetPayment: number;
    PaymentStatus: 'Credit' | 'Deficit' | 'Zero';
}

// Lifetime Earnings
export interface LifetimeEarnings {
    FarmerId: string;
    FarmerName: string;
    FarmerLocation: string;
    FarmerContact: string;
    FarmerEmail: string | null;
    ProfilePicUrl: string | null;
    Age: number;
    Gender: string;
    EnrolmentDate: string;
    ActiveMonths: number;
    LifetimeDeliveries: number;
    LifetimeLitres: number;
    LifetimeDeliveryAmount: number;
    LifetimeCommission: number;
    LifetimeLoanDeductions: number;
    LifetimeInputsPurchased: number;
    LifetimeTotalDeductions: number;
    LifetimeNetEarnings: number;
    AvgMonthlyNetPayment: number;
    BestMonthEarning: number;
    WorstMonthEarning: number;
    MonthsInCredit: number;
    MonthsInDeficit: number;
}