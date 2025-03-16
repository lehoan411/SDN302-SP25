import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
function App() {
    return (
        <BrowserRouter>
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    {/* <Route path="active-account/:token" element={<Page.ActiveAccount />} />
                    <Route path="/forgot-password" ></Route> */}
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/login" element={<Login />} />
                </Routes>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;