import { useEffect, useState } from "react";
import { Container, TextField, Button, Paper, Typography } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "../components/SnackBar";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AdminLogin() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();
    const { showSnackbar } = useSnackbar();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("noSession")) {
            showSnackbar("Session expired. Please re-authenticate", "error");
        }
    }, []);

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });

        if (e.target.name === "email") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            setEmailError(emailRegex.test(e.target.value) ? "" : "Invalid email format");
        }

        if (e.target.name === "password") {
            setPasswordError(e.target.value.length >= 10 ? "" : "Password must be at least 10 characters");
        }
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        if (!!emailError || !!passwordError) return;

        try {
            await axios.post("/api/users/login-password", {
                email: form.email,
                password: form.password,
            });
            navigate("/admin/dashboard");
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error Logging in. Try again later", "error");
        }
    };

    return (
        <Container>
            <Typography sx={{ padding: 4 }} variant="h2" align="center"><span style={{ color: "darkblue" }}>Byte</span><span style={{
                color: "purple"
            }}>Breakers</span></Typography>
            <h4>Admin Portal</h4>
            <div style={{ height: "400px" }}>
                <Paper elevation={6} sx={{ width: 400, p: 4, margin: "40px auto" }}>
                    <form onSubmit={handleSubmit} style={{ width: "300px", margin: 'auto' }}>
                        <TextField
                            label="Email"
                            type="email"
                            name="email"
                            fullWidth
                            margin="normal"
                            value={form.email}
                            onChange={handleChange}
                            required
                            error={!!emailError}
                            helperText={emailError}
                            size="small"
                        />
                        <TextField
                            label="Password"
                            type="password"
                            name="password"
                            fullWidth
                            margin="normal"
                            value={form.password}
                            onChange={handleChange}
                            required
                            error={!!passwordError}
                            helperText={passwordError}
                            size="small"
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            Login
                        </Button>
                    </form>
                </Paper>
            </div>
        </Container>
    );
}
