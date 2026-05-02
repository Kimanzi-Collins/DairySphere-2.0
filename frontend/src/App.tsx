import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import FarmersList from './pages/farmers/FarmersList.tsx';
import FarmerProfile from './pages/farmers/FarmerProfile.tsx';
import Agents from './pages/Agents.tsx';
import Factories from './pages/Factories';
import FactoryProfile from './pages/FactoryProfile.tsx';
import AgentProfile from './pages/AgentProfile.tsx';
import MilkQuality from './pages/MilkQuality.tsx';
import Inputs from './pages/Inputs.tsx';
import Deliveries from './pages/Deliveries.tsx';
import Loans from './pages/Loans.tsx';
import Purchases from './pages/Purchases.tsx';
import Sales from './pages/Sales.tsx';
import FarmersReport from './pages/reports/FarmersReport.tsx';
import AgentsCommissionReport from './pages/reports/AgentsCommissionReport.tsx';
import DeliveriesReport from './pages/reports/DeliveriesReport.tsx';
import LoansReport from './pages/reports/LoansReport.tsx';
import PurchasesReport from './pages/reports/PurchasesReport.tsx';
import StatementsReport from './pages/reports/StatementsReport.tsx';





function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/farmers" element={<FarmersList />} />
                <Route path="/farmers/:id" element={<FarmerProfile />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/factories" element={<Factories />} />
                <Route path="/agents/:id" element={<AgentProfile />} />
                <Route path="/factories/:id" element={<FactoryProfile />} />
                <Route path="/inputs" element={<Inputs />} />
                <Route path="/milk-quality" element={<MilkQuality />} />
                <Route path="/inputs" element={<Inputs />} />
                <Route path="/milk-quality" element={<MilkQuality />} />
                <Route path="/deliveries" element={<Deliveries />} />
                <Route path="/loans" element={<Loans />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/reports/farmers-list" element={<FarmersReport />} />
                <Route path="/reports/agents-commission" element={<AgentsCommissionReport />} />
                <Route path="/reports/deliveries" element={<DeliveriesReport />} />
                <Route path="/reports/loans" element={<LoansReport />} />
                <Route path="/reports/purchases" element={<PurchasesReport />} />
                <Route path="/reports/statements" element={<StatementsReport />} />
            </Route>
        </Routes>
    );
}

export default App;