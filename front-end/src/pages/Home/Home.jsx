import React, { useState, useEffect } from "react";
import axios from "axios";
import { HeartOutlined, UserOutlined, HeartFilled } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import styles from "../Home/Home.module.scss"; // Import SCSS

const Home = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [favoritedImages, setFavoritedImages] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const handleNavigate = (e, wallpaperId) => {
    if (!e.target.closest("button")) {
      navigate(`/wallpaper/${wallpaperId}`);
    }
  };

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const response = await axios.get("http://localhost:9999/wallpapers/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setWallpapers(response.data);

        const allTags = response.data.reduce((acc, wallpaper) => {
          wallpaper.tags.forEach((tag) => {
            if (!acc.includes(tag)) acc.push(tag);
          });
          return acc;
        }, ["All"]);
        setCategories(allTags);
      } catch (error) {
        console.error("Error fetching wallpapers:", error);
      }
    };

    const fetchUserFavorites = async () => {
      if (token) {
        try {
          const response = await axios.get("http://localhost:9999/users/get-by-id", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setFavoritedImages(response.data.favorited || []);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchWallpapers();
    fetchUserFavorites();
  }, [token]);

  const handleLike = async (wallpaperId) => {
    if (!token) {
      alert("Please login to use this function!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:9999/wallpapers/${wallpaperId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFavoritedImages((prev) =>
        prev.some((w) => w._id === wallpaperId)
          ? prev.filter((w) => w._id !== wallpaperId)
          : [...prev, { _id: wallpaperId }]
      );

      setWallpapers((prev) =>
        prev.map((wp) =>
          wp._id === wallpaperId ? { ...wp, likes: response.data.likes } : wp
        )
      );
    } catch (error) {
      console.error("Error when liking image:", error);
    }
  };

  const isFavorited = (wallpaperId) => favoritedImages.some((w) => w._id === wallpaperId);

  const filteredWallpapers = wallpapers.filter((wallpaper) => {
    const matchesSearch = wallpaper.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || wallpaper.tags.includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleDownload = async (imageUrl, description) => {
    if (!token) {
      alert('Please Login to download this image!');
      return;
    }
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = description ? `${description}.jpg` : "wallpaper.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  return (
    <div className={styles.container}>
      {/* Banner */}
      <div className={styles.banner} style={{ backgroundImage: "url('/homeBackground.jpg')" }}>
        <h2>The best free images shared by creators.</h2>
        <input
          type="text"
          placeholder="Search ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Filter Buttons */}
      <div className={styles.filterButtons}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`${styles.categoryButton} ${selectedCategory === category ? styles.active : ""}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Danh sách ảnh */}
      <div className={styles.wallpaperGrid}>
        {filteredWallpapers.map((wallpaper) => (
          <div
            key={wallpaper._id}
            className={styles.wallpaperCard}
            onClick={(e) => handleNavigate(e, wallpaper._id)}
            style={{ cursor: "pointer" }}
          >
            <img src={wallpaper.imageUrl} alt={wallpaper.description} className={styles.wallpaperImage} />
            {/* Overlay */}
            <div className={styles.overlay}>
              {/* Yêu thích */}
              <button className={styles.iconButton} onClick={(e) => {
                e.stopPropagation();
                handleLike(wallpaper._id);
              }}>
                {isFavorited(wallpaper._id) ? (
                  <HeartFilled style={{ fontSize: "18px", color: "red" }} />
                ) : (
                  <HeartOutlined style={{ fontSize: "18px", color: "#aaa" }} />
                )}
              </button>

              {/* Thông tin */}
              <div className={styles.userInfo}>
                <button className={styles.downloadButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(wallpaper.imageUrl, wallpaper.description);
                  }}
                >Download</button>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{wallpaper.createdBy?.name || "Unknown"}</span>
                  {wallpaper.createdBy?.avatar ? (
                    <img
                      src={wallpaper.createdBy.avatar}
                      alt={wallpaper.createdBy.name}
                      className={styles.userAvatar}
                    />
                  ) : (
                    <UserOutlined style={{ fontSize: "24px", color: "#aaa" }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
