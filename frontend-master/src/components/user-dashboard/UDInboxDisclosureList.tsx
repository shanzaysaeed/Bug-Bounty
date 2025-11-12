import { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  Alert,
  Button,
  Paper,
  Chip,
  keyframes,
} from "@mui/material";
import UDInboxDisclosureCard from "./UDInboxDisclosureCard";
import { Disclosure, disclosureService } from "../../services/disclosureService";
import RefreshIcon from "@mui/icons-material/Refresh";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import { useNavigate } from "react-router-dom";

// Define animations outside component to prevent recreation on each render
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Banner styles to reduce inline CSS complexity
const bannerStyles = {
  banner: {
    position: "relative",
    mb: 3,
    borderRadius: 3,
    overflow: "hidden",
    height: 180,
    background: "linear-gradient(135deg, #5E35B1, #7E57C2, #9575CD)",
    boxShadow: "0 8px 20px rgba(94, 53, 177, 0.12)",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.08,
    background: `radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%)`,
  }
};

export default function UDInboxDisclosureList() {
  const navigate = useNavigate();
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDisclosures = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await disclosureService.getAll();
      
      // Sort disclosures by unread status (no timestamps to sort by now)
      const sortedDisclosures = [...data].sort((a, b) => {
        // Sort by unread status
        if (a.unread !== b.unread) {
          return a.unread ? -1 : 1;
        }
        
        // If both have the same unread status, sort by ID (newest first)
        return b.id - a.id;
      });
      
      setDisclosures(sortedDisclosures);
    } catch (err) {
      setError("Failed to load disclosures. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisclosures();
  }, []);

  const handleDisclosureClick = (id: number) => {
    navigate(`/user/dashboard/inbox/${id}`);
  };

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchDisclosures}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        {/* Banner skeleton */}
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 3 }} />
        
        {/* Disclosure cards skeleton */}
        <Stack spacing={2}>
          {[1, 2, 3].map((item) => (
            <Paper
              key={item}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box sx={{ display: "flex", gap: 2.5 }}>
                {/* Logo skeleton */}
                <Skeleton 
                  variant="rectangular" 
                  width={48} 
                  height={48} 
                  sx={{ 
                    borderRadius: 2,
                    flexShrink: 0
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  {/* Header row */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    {/* Organization name */}
                    <Skeleton variant="text" width={120} height={24} />
                    {/* Status indicators */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3 }} />
                      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3 }} />
                    </Box>
                  </Box>
                  
                  {/* Message preview */}
                  <Skeleton variant="text" width="90%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="75%" height={20} />
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Banner section */}
      <Box sx={bannerStyles.banner}>
        <Box sx={bannerStyles.overlay} />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.05,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "25%",
            right: "10%",
            color: "rgba(255, 255, 255, 0.2)",
            animation: `${float} 6s ease-in-out infinite`,
          }}
        >
          <MarkEmailReadIcon sx={{ fontSize: 40 }} />
        </Box>

        {/* Content */}
        <Box
          sx={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p: 3,
            color: "white",
            zIndex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                borderRadius: "10px",
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                mr: 2,
              }}
            >
              <MarkEmailReadIcon sx={{ fontSize: 24 }} />
            </Box>
            <Typography
              variant="h5"
              fontWeight="700"
              sx={{
                letterSpacing: "-0.5px",
                textShadow: "0 1px 5px rgba(0,0,0,0.1)",
              }}
            >
              Security Disclosures
            </Typography>
          </Box>
          <Typography
            variant="body1"
            sx={{
              maxWidth: "60%",
              mb: 2,
              fontWeight: 400,
              opacity: 0.9,
              fontSize: "0.95rem",
            }}
          >
            Track and manage all your security disclosures with organizations.
            Communicate securely and efficiently.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
            }}
          >
            <Chip
              label={`${disclosures.length} Disclosures`}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                color: "white",
                fontWeight: 500,
                backdropFilter: "blur(10px)",
                height: 28,
                fontSize: "0.8rem",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                transition: "all 0.2s ease",
                width: "fit-content",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.25)",
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Disclosures List */}
      <Box sx={{ mt: 3 }}>
        {disclosures.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              py: 8,
              px: 3,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #f0f0f0",
              borderRadius: 2,
              width: "100%",
              backgroundColor: "#fafafa",
            }}
          >
            <Box
              sx={{
                width: 100,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}
            >
              <BlurOnIcon sx={{ fontSize: 80, color: "#757575", opacity: 0.8 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: "#424242",
                fontWeight: 500,
              }}
            >
              No disclosures found
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#757575",
                maxWidth: "450px",
                textAlign: "center",
                mx: "auto",
                px: 2
              }}
            >
              You don't have any disclosures yet. Submit a security disclosure through an opportunity to get started.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2} sx={{ width: "100%" }}>
            {disclosures.map((disclosure) => (
              <UDInboxDisclosureCard
                key={disclosure.id}
                {...disclosure}
                onClick={handleDisclosureClick}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}