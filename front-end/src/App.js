
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import "react-toastify/dist/ReactToastify.css";

import Header from './components/Header';
import Footer from './components/Footer';
import Register from './pages/Register';
import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';
import Home from './pages/Home/Home';
import WallpaperDetail from './pages/WallpaperDetail/WallpaperDetail';
import Profile from './pages/Profile/Profile';
import AlbumWallpaper from './pages/AlbumWallpaper/AlbumWallpaper';
import EditProfile from './pages/Profile/EditProfile';
import { ToastContainer } from 'react-toastify';
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
                    <Route path="/" element={<Home />} />
                    <Route path="/wallpaper/:wallpaperId" element={<WallpaperDetail />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path='/profile/edit-profile' element={<EditProfile />} />
                    <Route path="/profile/album/:albumId" element={<AlbumWallpaper />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="management/account" element={<AccountManagement />} />
                    <Route path="management/report" element={<ReportList />} />
                    <Route path="management/report/:id" element={<ReportDetail />} />
                    <Route path="am" element={<AccountManagement />} />
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