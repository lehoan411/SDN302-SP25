import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // FIXED IMPORT ✅

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:9999/auth/sign-in",
        { email, password },
        { withCredentials: true }
      );

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem("token", token);

        // Decode token
        const decodedToken = jwtDecode(token);
        const userRoles = decodedToken.roles || [];

        toast.success("Login successful!");

        setTimeout(() => {
          if (userRoles.includes("admin")) {
            navigate("/management/account");
          } else {
            navigate("/");
          }
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";

      // Kiểm tra nếu tài khoản bị vô hiệu hóa
      if (error.response?.status === 403) {
        toast.error("Your account is inactive.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnterLogin = (event) => {
    if (event.key === "Enter") {
      handleLogin(event);
    }
  };

  return (
    <div className="app">
      <div className="background"></div>
      <div className="overlay"></div>
      <div className="login-form-container">
        <form onKeyDown={handleEnterLogin} className="login-form">
          <h2>Welcome back</h2>
          <div className="divider">Sign in with your Account</div>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="name@email.com"
            className="input-field"
          />
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            placeholder="Password"
            className="input-field"
          />
          <a href="/forgot-password" className="forgot-password">
            Forgot your password?
          </a>
          <button onClick={handleLogin} className="sign-in-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
