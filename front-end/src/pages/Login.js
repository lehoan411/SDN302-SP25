import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error("Please enter username and password");
      return;
    }

    // Fake user authentication
    const fakeUser = {
      email: "test@example.com",
      password: "password123",
      name: "Test User"
    };

    if (email === fakeUser.email && password === fakeUser.password) {
      toast.success("Login successful!");
      navigate("/");
    } else {
      toast.error("Invalid email or password");
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
          <button onClick={handleLogin} className="sign-in-button">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;