import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import { ToastContainer } from 'react-toastify';
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
            <ToastContainer
        position="bottom-left"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
        </BrowserRouter>
    );
}

export default App;