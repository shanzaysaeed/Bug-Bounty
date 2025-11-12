import { Box, Container, Typography, Breadcrumbs, Link } from "@mui/material";
import UserSidebar from "../UserSidebar";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useNavigate, useParams, useLocation, Outlet } from "react-router-dom";
import EmailUs from "../EmailUs";

export default function UDLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { opportunityId } = useParams<{ opportunityId?: string }>();

  // Get current tab from URL for breadcrumb display
  const getCurrentTab = () => {
    if (location.pathname.includes("/opportunities")) return "Opportunities";
    if (location.pathname.includes("/inbox")) return "Inbox";
    if (location.pathname.includes("/settings")) return "Settings";
    return "Opportunities";
  };

  const currentTab = getCurrentTab();

  const commonTypographyStyles = {
    fontSize: "0.875rem",
    display: "flex",
    alignItems: "center"
  };

  const breadcrumbStyles = {
    ...commonTypographyStyles,
    fontWeight: 500,
    color: "text.secondary",
  };

  const activeBreadcrumbStyles = {
    ...commonTypographyStyles,
    fontWeight: 600,
    color: "text.primary",
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <UserSidebar />
      <Box
        id="main-content-area"
        key={location.pathname} // Add key that changes with the route
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          padding: 3,
          bgcolor: "#f9f9fb",
        }}
      >
        <Container sx={{ paddingLeft: 0, paddingRight: 0 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{
              mb: 3,
              "& .MuiBreadcrumbs-ol": {
                alignItems: "center"
              }
            }}
          >
            <Typography sx={breadcrumbStyles}>
              Dashboard
            </Typography>
            
            {opportunityId && currentTab === "Opportunities" ? (
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/user/dashboard/opportunities")}
                sx={{
                  ...breadcrumbStyles,
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    color: "primary.main"
                  }
                }}
              >
                Opportunities
              </Link>
            ) : (
              <Typography sx={opportunityId ? breadcrumbStyles : activeBreadcrumbStyles}>
                {currentTab}
              </Typography>
            )}
            
            {opportunityId && currentTab === "Opportunities" && (
              <Typography sx={activeBreadcrumbStyles}>
                Details
              </Typography>
            )}
          </Breadcrumbs>
          
          <Outlet context={{ opportunityId }} />

          <EmailUs />
        </Container>
      </Box>
    </Box>
  );
}
