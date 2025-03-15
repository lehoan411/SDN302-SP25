import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home/Home';
import WallpaperDetail from './pages/WallpaperDetail/WallpaperDetail';
import Profile from './pages/Profile/Profile';
import AlbumWallpaper from './pages/AlbumWallpaper/AlbumWallpaper';
import EditProfile from './pages/Profile/EditProfile';

function App() {
    return (
        <BrowserRouter>
            <div>
                {/* Header */}
                <Header />

                {/* Nội dung chính */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/wallpaper/:wallpaperId" element={<WallpaperDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path='/profile/edit-profile' element={<EditProfile/>}/>
                        <Route path="/profile/album/:albumId" element={<AlbumWallpaper />} />
                    </Routes>

                {/* Footer */}
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;