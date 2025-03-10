import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import AccountManagement from "./pages/AccountManagement/AccountManagement";
import ReportList from "./pages/ReportList/ReportList";
import ReportDetail from "./pages/ReportDetail/ReportDetail";

function App() {
    return (
        <BrowserRouter>
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="management/account" element={<AccountManagement />} />
                    <Route path="management/report" element={<ReportList />} />
                    <Route path="management/report/:id" element={<ReportDetail />} />
                    <Route path="am" element={<AccountManagement />} />
                </Routes>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;