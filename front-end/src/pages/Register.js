import "./Register.scss"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-toastify";

const Register = () => {
    const navigate = useNavigate();

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.\".+\")@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleRegister = (event) => {
        event.preventDefault();
        
        if (newUser.password !== newUser.confirmPassword) {
            toast.error("Confirm password didn't match");
            return;
        }
        
        if (!validateEmail(newUser.email)) {
            toast.error("Please enter a valid email: example@gmail.com");
            return;
        }
        
        // Fake response simulation
        const response = { status: 201, message: "Registration successful!" };
        
        if (response.status === 201) {
            toast.success(response.message);
            navigate('/login');
        } else {
            toast.error(response.message);
        }
    }

    return (
        <div className="register">
            <div className="login-form">
                <h2 className="text-white">New to wallpaper</h2>
                <div className="divider text-white">Register your Account</div>
                <input onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} value={newUser.name} type="text" placeholder="Username" className="input-field" />
                <input onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} value={newUser.email} type="email" placeholder="Email" className="input-field" />
                <input onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} value={newUser.password} type="password" placeholder="Password" className="input-field" />
                <input onChange={(event) => setNewUser({ ...newUser, confirmPassword: event.target.value })} value={newUser.confirmPassword} type="password" placeholder="Confirm Password" className="input-field" />
                <Link to="/login" className="forgot-password fs-6 text-white">Already have an account? Login here</Link>
                <button onClick={handleRegister} className="sign-in-button">Register</button>
            </div>
        </div>
    );
}

export default Register;