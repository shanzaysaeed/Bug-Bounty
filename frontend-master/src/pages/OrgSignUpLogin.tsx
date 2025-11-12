import { useEffect, useState } from "react";
import { Container, TextField, Button, Paper, Tabs, Tab, Typography, Link } from "@mui/material";
import QRCode from "../components/QRCode";
import axios from "axios";
import { useSnackbar } from "../components/SnackBar";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function UserSignUpLogin() {
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState({ orgname: "", email: "", password: "" });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [mfaStage, setMFAStage] = useState(false);
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

    if (tab === 0) {
      try {
        await axios.post("/api/users/login-password", {
          email: form.email,
          password: form.password,
        });
        setMFAStage(true);
      } catch (e: any) {
        showSnackbar(e?.response?.data?.error || "Error Logging in. Try again later", "error");
      }
    } else {
      try {
        await axios.post("/api/users/register-org", {
          name: form.orgname,
          email: form.email,
          password: form.password,
        });
        setMFAStage(true);
      } catch (e: any) {
        showSnackbar(e?.response?.data?.error || "Error Registering. Try again later", "error");
      }
    }
  };

  return (
    <Container>
      <Typography sx={{ padding: 4 }} variant="h2" align="center"><span style={{ color: "darkblue" }}>Byte</span><span style={{
        color: "purple"
      }}>Breakers</span></Typography>
      <h4>Bug bounty platform for your organization to hire top security talents</h4>
      <div style={{ height: "auto", minHeight: "500px" }}>
        <Paper elevation={3} sx={{ width: "100%", maxWidth: 500, p: 4, margin: "40px auto" }}>
          {
            !mfaStage ? <><Tabs value={tab} onChange={(_e, newValue) => setTab(newValue)} centered>
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>
              <Typography align='center' sx={{ m: 1 }}>Click <Link href="/">here</Link> to {tab === 0 ? "log in" : "sign up"} as User</Typography>
              <form onSubmit={handleSubmit} style={{ width: 300, margin: 'auto' }}>
                {
                  tab === 1 && <TextField
                    label="Company Name"
                    type="text"
                    name="orgname"
                    fullWidth
                    margin="normal"
                    value={form.orgname}
                    onChange={handleChange}
                    required
                    size="small"
                  />
                }
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
                  {tab === 1 ? "Sign Up" : "Login"}
                </Button>
              </form>
            </> : <QRCode type={tab === 0 ? "login" : "signup"} goBack={() => setMFAStage(false)} onSuccess={() => navigate("/org/dashboard/")} />
          }
        </Paper>
      </div>
    </Container>
  );
}
