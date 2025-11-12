import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import InboxIcon from "@mui/icons-material/Inbox";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { userService, User } from "../services/userService";

const drawerWidth = 280;

const ROUTE_MAP = {
  Opportunities: "/user/dashboard/opportunities",
  Inbox: "/user/dashboard/inbox",
  Settings: "/user/dashboard/settings"
} as const;

export default function UserSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await userService.getCurrentUser();
        setUserData(user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get current tab from URL
  const getCurrentTab = () => {
    if (location.pathname.includes("/opportunities")) return "Opportunities";
    if (location.pathname.includes("/inbox")) return "Inbox";
    if (location.pathname.includes("/settings")) return "Settings";
    return "Opportunities";
  };

  const selectedItem = getCurrentTab();

  // Navigation items - removed badge count as requested
  const navItems = [
    { text: "Opportunities", icon: <TrackChangesIcon /> },
    { text: "Inbox", icon: <InboxIcon /> },
  ];

  // Handle tab change
  const handleTabChange = (tab: string) => {
    // Don't do anything if clicking the current tab
    if (tab === selectedItem) return;

    // Navigate based on selected item
    const path = ROUTE_MAP[tab as keyof typeof ROUTE_MAP];
    if (path) {
      navigate(path);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const success = await userService.logout();
      if (success) {
        // Redirect to login page after logout
        navigate("/");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          paddingTop: 0,
          border: "none",
          borderRight: "1px solid #eaecef",
          boxShadow: "0 0 20px rgba(0,0,0,0.03)",
          background: "#FFFFFF",
          borderRadius: 0,
        },
      }}
    >
      {/* Logo */}
      <Box sx={{ px: 2, py: 1.5, mb: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer"
          }}
          onClick={() => handleTabChange("Opportunities")}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "8px",
              background: "linear-gradient(135deg, #3B82F6, #2563EB)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrackChangesIcon sx={{ color: "#fff", fontSize: "1.1rem" }} />
          </Box>
          <Typography
            variant="subtitle1"
            fontWeight="600"
            sx={{
              fontSize: "0.95rem",
              color: "#111827",
            }}
          >
            ByteBreakers
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: "#eaecef", mb: 1.5 }} />

      {/* Navigation */}
      <Box sx={{ px: 2 }}>
        <List sx={{ p: 0 }}>
          {navItems.map(({ text, icon }) => (
            <ListItem key={text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleTabChange(text)}
                selected={text === selectedItem}
                sx={{
                  height: "40px",
                  borderRadius: "6px",
                  transition: "all 0.2s ease",
                  px: 1.5,
                  "&.Mui-selected": {
                    backgroundColor: "#F3F4F6",
                    "& .MuiListItemText-primary": {
                      color: "#111827",
                      fontWeight: 600
                    },
                    "& .MuiListItemIcon-root": {
                      color: "#111827"
                    },
                  },
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                  },
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ListItemIcon
                    sx={{
                      color: text === selectedItem ? "#111827" : "#6B7280",
                      minWidth: 32,
                      mr: 0,
                    }}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={text}
                    sx={{
                      "& .MuiListItemText-primary": {
                        fontSize: "0.875rem",
                        color: text === selectedItem ? "#111827" : "#4B5563",
                      }
                    }}
                  />
                </Box>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Divider sx={{ borderColor: "#eaecef", mt: "auto", mb: 0 }} />

      <Box
        ref={profileRef}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          py: 1.5,
          cursor: "pointer",
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: "#F9FAFB",
          },
        }}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-controls="profile-menu"
        aria-haspopup="true"
        aria-expanded={menuOpen ? "true" : "false"}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            mr: 1.5,
            bgcolor: "#3B82F6",
          }}
        >
          {loading ? "..." : getInitials(userData?.name || "")}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            fontWeight="500"
            fontSize="0.875rem"
            lineHeight={1.25}
            noWrap
            sx={{ color: "#111827" }}
          >
            {loading ? "Loading..." : userData?.name || "User"}
          </Typography>
          <Typography
            fontSize="0.75rem"
            color="text.secondary"
            lineHeight={1.25}
            noWrap
          >
            {loading ? "Loading..." : userData?.email || ""}
          </Typography>
        </Box>
        <IconButton size="small" sx={{ ml: 0.5 }}>
          <MoreVertIcon fontSize="small" sx={{ color: "#9CA3AF" }} />
        </IconButton>
      </Box>

      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={profileRef.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        slotProps={{
          paper: {
            elevation: 2,
            sx: {
              width: 200,
              borderRadius: 2,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              "& .MuiMenuItem-root": {
                fontSize: "0.875rem",
                py: 1.2,
                fontWeight: 400,
              },
              "& .MuiListItemText-primary": {
                fontSize: "0.875rem"
              }
            },
          }
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
        marginThreshold={0}
        sx={{
          "& .MuiMenu-paper": {
            ml: 1, // Add margin so it doesn't touch the sidebar
          }
        }}
      >
        <MenuItem onClick={() => { 
          setMenuOpen(false);
          handleTabChange("Settings");
        }}>
          <ListItemIcon>
            <SettingsOutlinedIcon fontSize="small" sx={{ color: "#4B5563" }} />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider sx={{ my: 1 }} />
        <MenuItem onClick={() => { 
          setMenuOpen(false); 
          handleLogout(); 
        }}>
          <ListItemIcon>
            <LogoutOutlinedIcon fontSize="small" sx={{ color: "#EF4444" }} />
          </ListItemIcon>
          Sign Out
        </MenuItem>
      </Menu>
    </Drawer>
  );
}
