import "./Register.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Modal, Button } from "react-bootstrap"; // Import Modal từ Bootstrap

const Register = () => {
    const navigate = useNavigate();

    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const [showModal, setShowModal] = useState(false); // State để hiển thị modal
    const [loading, setLoading] = useState(false); // Trạng thái loading khi đăng ký

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        if (!newUser.name || !newUser.email || !newUser.password || !newUser.confirmPassword) {
            toast.error("Please fill in all required fields.");
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            toast.error("Confirm password didn't match.");
            return;
        }

        if (!validateEmail(newUser.email)) {
            toast.error("Please enter a valid email: example@gmail.com");
            return;
        }

        setLoading(true); // Bắt đầu trạng thái loading

        try {
            const response = await fetch("http://localhost:9999/auth/sign-up", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: newUser.name,
                    email: newUser.email,
                    password: newUser.password,
                    confirmPassword: newUser.confirmPassword
                }),
            });

            const data = await response.json();
            setLoading(false); // Tắt trạng thái loading

            if (response.status === 201) {
                toast.success(data.message);
                setShowModal(true); // Hiển thị modal sau khi đăng ký thành công
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            setLoading(false);
            console.error("Registration Error:", error);
            toast.error("Something went wrong! Please try again.");
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        navigate('/login'); // Chuyển hướng sau khi bấm OK
    };

    return (
        <div className="register">
            <div className="login-form">
                <h2 className="text-white">New to wallpaper</h2>
                <div className="divider text-white">Register your Account</div>
                <input
                    onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
                    value={newUser.name}
                    type="text"
                    placeholder="Username"
                    className="input-field"
                />
                <input
                    onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                    value={newUser.email}
                    type="email"
                    placeholder="Email"
                    className="input-field"
                />
                <input
                    onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                    value={newUser.password}
                    type="password"
                    placeholder="Password"
                    className="input-field"
                />
                <input
                    onChange={(event) => setNewUser({ ...newUser, confirmPassword: event.target.value })}
                    value={newUser.confirmPassword}
                    type="password"
                    placeholder="Confirm Password"
                    className="input-field"
                />
                <Link to="/login" className="forgot-password fs-6 text-white">
                    Already have an account? Login here
                </Link>
                <button onClick={handleRegister} className="sign-in-button" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </div>

            {/* Modal đăng ký thành công */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Registration Successful!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Your account has been created successfully.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleCloseModal}>
                        OK
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Register;