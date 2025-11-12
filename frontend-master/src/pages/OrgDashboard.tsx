import { useState } from "react";
import { AppBar, Toolbar, Tabs, Tab, IconButton, Menu, MenuItem, Typography, Box, Avatar, Badge } from "@mui/material";
import OrgProfile from "../components/OrgProfile";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUserInfoContext } from "../utils/Context";
import axios from "axios";
import { useSnackbar } from "../components/SnackBar";
import EmailUs from "../components/EmailUs";
import { getCsrfToken } from "../utils/csrf";

export default function OrgDashboard() {
    const location = useLocation();
    const tabPaths = ["/org/dashboard/overview", "/org/dashboard/create-edit", "/org/dashboard/submissions"];
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const [orgProfile, setOrgProfile] = useState(false);
    const currentTab = tabPaths.findIndex(path => location.pathname.startsWith(path));
    const meData = useUserInfoContext();
    const { showSnackbar } = useSnackbar();

    const handleProfileClick = (event: any) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTabChange = (_e: any, value: number) => {
        // fall back to the overview page for invalid tab indices
        navigate(tabPaths[value] || "/org/dashboard/overview"); // Navigate to new tab path
    }

    const handleLogOut = async () => {
        try {
            await axios.post("/api/users/logout", {
                csrf_token: await getCsrfToken(),
            });
        } catch (e) {
            console.log(e);
        }
        showSnackbar("Successfully logged out", "success");
        navigate("/org");
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <OrgProfile open={orgProfile} onClose={() => setOrgProfile(false)} />
            <AppBar position="fixed">
                <Toolbar>
                    <Tabs value={currentTab} onChange={handleTabChange} textColor="inherit" indicatorColor="primary">
                        <Tab label="Overview" />
                        <Tab label="Create/Edit" />
                        <Tab label="Submissions" />
                    </Tabs>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography>Welcome back, {meData.name}</Typography>
                    <IconButton color="inherit" onClick={handleProfileClick} size="large">
                        <Badge invisible={meData.auth_stage === "email_verified"} color="warning" badgeContent="!" anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                            <Avatar src={meData.metadata.logo_url || ""} alt={meData.name}></Avatar>
                        </Badge>
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
                        <MenuItem onClick={() => setOrgProfile(true)}>Profile</MenuItem>
                        <MenuItem onClick={handleLogOut}>Logout</MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <div style={{ flexGrow: 1 }}>
                <Outlet />
            </div>
            <EmailUs />
        </Box>
    );
}
