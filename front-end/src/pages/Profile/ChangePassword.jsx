import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChangePassword = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChangePassword = async (e) => {
        e.preventDefault();

        // Validate mật khẩu phải từ 6 ký tự trở lên
        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        //  Validate mật khẩu mới khác mật khẩu cũ
        if (oldPassword === newPassword) {
            setError("New password cannot be the same as the old password.");
            return;
        }

        //  Validate không chứa khoảng trắng
        if (/\s/.test(newPassword)) {
            setError("Password cannot contain spaces.");
            return;
        }

        //  Validate mật khẩu nhập lại trùng với mật khẩu mới
        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match");
            return;
        }

        try {
            const token = localStorage.getItem("token"); // Lấy token từ localStorage
            const response = await axios.put(
                "http://localhost:9999/users/change-password",
                { oldPassword, newPassword },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessage(response.data.message);
            setError("");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
            setMessage("");
        }
    };

    return (
        <div className="container mt-4" style={{ marginBottom: '50px' }}>
            <h2 style={{ margin: "30px 0" }}>Change Password</h2>
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                    <label className="form-label">Old Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3" >
                    <label className="form-label">Confirm New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" style={{ marginTop: '20px' }} className="btn btn-primary">Change Password</button>
                <button style={{ marginTop: '20px', marginLeft: '20px' }} className="btn btn-secondary" onClick={() => navigate("/profile/edit-profile")}>Go back</button>
            </form>
        </div>
    );
};

export default ChangePassword;
