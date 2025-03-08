import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import WallpaperDetail from './components/WallpaperDetail';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile';
import AlbumWallpaper from './components/AlbumWallpaper';

function App() {
    return (
        <BrowserRouter>
            <div>
                {/* Header */}
                <Header />

                {/* Nội dung chính */}
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/wallpaper/:id" element={<WallpaperDetail />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path='/profile/edit-profile' element={<EditProfile/>}/>
                        <Route path="/profile/album/:id" element={<AlbumWallpaper />} />
                    </Routes>

                {/* Footer */}
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;