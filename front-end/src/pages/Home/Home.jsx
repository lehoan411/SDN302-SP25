import React, { useState, useEffect } from "react";
import axios from "axios";
import { HeartOutlined, UserOutlined, HeartFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import styles from "../Home/Home.module.scss"; // Import SCSS

const Home = () => {
  const [wallpapers, setWallpapers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  const [favoritedImages, setFavoritedImages] = useState([]);
  const [userRole, setUserRole] = useState(null); // Ensure correct re-rendering
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchWallpapers = async () => {
      try {
        const response = await axios.get("http://localhost:9999/wallpapers/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setWallpapers(response.data);

        // Collect unique categories (case insensitive)
        const tagMap = new Map();
        response.data.forEach((wallpaper) => {
          wallpaper.tags.forEach((tag) => {
            const normalizedTag = tag.toLowerCase().trim();
            tagMap.set(normalizedTag, tag);
          });
        });

        setCategories(["All", ...Array.from(tagMap.values())]);
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

          setUserRole(response.data.roles); // Ensure role is set
          setFavoritedImages(response.data.favorited || []);
          console.log("User Role:", response.data.roles); // Debugging
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchWallpapers();
    fetchUserFavorites();
  }, [token]);

  const handleNavigate = (e, wallpaperId) => {
    if (!e.target.closest("button")) {
      navigate(`/wallpaper/${wallpaperId}`);
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

      {/* Category Filter */}
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
        {userRole === "admin" && (
          <button
            onClick={() => navigate("/management/account")}
            className={styles.adminButton}
          >
            Go to Management Account
          </button>
        )}
      </div>

      {/* Wallpaper Grid */}
      <div className={styles.wallpaperGrid}>
        {wallpapers.map((wallpaper) => (
          <div
            key={wallpaper._id}
            className={styles.wallpaperCard}
            onClick={(e) => handleNavigate(e, wallpaper._id)}
            style={{ cursor: "pointer" }}
          >
            <img src={wallpaper.imageUrl} alt={wallpaper.description} className={styles.wallpaperImage} />

            {/* Overlay */}
            <div className={styles.overlay}>
              {/* Like Button */}
              <button
                className={styles.iconButton}
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle like function here
                }}
              >
                {favoritedImages.some((w) => w._id === wallpaper._id) ? (
                  <HeartFilled style={{ fontSize: "18px", color: "red" }} />
                ) : (
                  <HeartOutlined style={{ fontSize: "18px", color: "#aaa" }} />
                )}
              </button>

              {/* User Info */}
              <div className={styles.userInfo}>
                <span className={styles.userName}>{wallpaper.createdBy?.name || "Unknown"}</span>
                {wallpaper.createdBy?.avatar ? (
                  <img src={wallpaper.createdBy.avatar} alt={wallpaper.createdBy.name} className={styles.userAvatar} />
                ) : (
                  <UserOutlined style={{ fontSize: "24px", color: "#aaa" }} />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
