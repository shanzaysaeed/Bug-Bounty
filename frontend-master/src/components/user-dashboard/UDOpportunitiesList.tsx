import { useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Skeleton,
  Alert,
  Button,
  Paper,
  InputBase,
  IconButton,
  Chip,
  keyframes,
} from "@mui/material";
import UDOpportunityCard from "./UDOpportunityCard";
import {
  Opportunity,
  opportunityService,
} from "../../services/opportunityService";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SecurityIcon from "@mui/icons-material/Security";
import CloseIcon from "@mui/icons-material/Close";
import ShieldIcon from "@mui/icons-material/Shield";
import BugReportIcon from "@mui/icons-material/BugReport";
import BlurOnIcon from "@mui/icons-material/BlurOn";
import { useNavigate } from "react-router-dom";
import { useSearchParam } from "../../utils/useSearchParam";

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const SKELETON_COUNT = 4;

function OpportunityBanner({ opportunityCount }: { opportunityCount: number }) {
  return (
    <Box
      sx={{
        position: "relative",
        mb: 3,
        borderRadius: 3,
        overflow: "hidden",
        height: 180,
        background: "linear-gradient(135deg, #0052D4, #4364F7, #6FB1FC)",
        boxShadow: "0 8px 20px rgba(0, 82, 212, 0.12)",
      }}
    >
      {/* Background Elements */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.08,
          background: 'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 50%)',
        }}
      />
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

      {/* Floating Icons */}
      <Box
        sx={{
          position: "absolute",
          top: "25%",
          right: "10%",
          color: "rgba(255, 255, 255, 0.2)",
          animation: `${float} 6s ease-in-out infinite`,
        }}
      >
        <ShieldIcon sx={{ fontSize: 40 }} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "25%",
          right: "20%",
          color: "rgba(255, 255, 255, 0.15)",
          animation: `${float} 8s ease-in-out infinite 1s`,
        }}
      >
        <BugReportIcon sx={{ fontSize: 30 }} />
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
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
            <SecurityIcon sx={{ fontSize: 24 }} />
          </Box>
          <Typography
            variant="h5"
            fontWeight="700"
            sx={{
              letterSpacing: "-0.5px",
              textShadow: "0 1px 5px rgba(0,0,0,0.1)",
            }}
          >
            Security Opportunities
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
          Discover the latest security research opportunities from top
          companies. Help make the internet safer.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Chip
            label={`${opportunityCount} Active Programs`}
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
  );
}

export default function UDOpportunitiesList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useSearchParam('q');
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await opportunityService.getAll();
      setOpportunities(data);
    } catch (err) {
      setError("Failed to load opportunities. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleOpportunityClick = (id: string) => {
    navigate(`/user/dashboard/opportunities/${id}`);
  };

  // Filter opportunities based on search query
  const filteredOpportunities = opportunities.filter((opportunity) => {
    return searchQuery === "" ||
      opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.previewDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opportunity.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );
  });

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchOpportunities}
              startIcon={<RefreshIcon />}
            >
              Retry
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        {/* Banner skeleton */}
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 3 }} />
        
        {/* Search bar skeleton */}
        <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2, mb: 3 }} />
        
        {/* Opportunity cards skeleton */}
        <Stack spacing={2} sx={{ width: "100%" }}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Box
              key={index}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                p: "16px",
                bgcolor: "white",
                borderRadius: "10px",
                border: "1px solid #eaecef",
                width: "100%"
              }}
            >
              {/* Logo skeleton */}
              <Skeleton 
                variant="rectangular" 
                width={48} 
                height={48} 
                sx={{ 
                  borderRadius: "8px",
                  flexShrink: 0
                }}
              />

              {/* Content skeleton */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Title row */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.25 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
                    <Skeleton width="30%" height={22} />
                    <Skeleton width={60} height={16} />
                  </Box>
                </Box>

                {/* Company name */}
                <Skeleton width="20%" height={18} sx={{ mt: 0.1, mb: 0.75 }} />

                {/* Description */}
                <Skeleton width="90%" height={34} sx={{ mb: 0.75 }} />

                {/* Tags */}
                <Box sx={{ display: "flex", gap: 0.75 }}>
                  <Skeleton width={60} height={24} />
                  <Skeleton width={60} height={24} />
                </Box>
              </Box>

              {/* Arrow skeleton */}
              <Skeleton width={16} height={16} sx={{ mt: 0.75, ml: 1 }} />
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <OpportunityBanner opportunityCount={opportunities.length} />

      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "100%",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <Box sx={{ p: "10px", color: 'action.active', display: 'flex' }}>
            <SearchIcon />
          </Box>
          <InputBase
            sx={{ ml: 0.5, flex: 1 }}
            placeholder="Search opportunities by title, company, or keywords..."
            inputProps={{ "aria-label": "search opportunities" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <IconButton
              sx={{ p: "10px" }}
              aria-label="clear search"
              onClick={() => setSearchQuery("")}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>
      </Box>

      {/* Opportunities List */}
      <Box sx={{ mt: 3 }}>
        {filteredOpportunities.length === 0 ? (
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
            <Box sx={{ width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}>
              <BlurOnIcon sx={{ fontSize: 80, color: "#757575", opacity: 0.8 }} />
            </Box>

            <Typography variant="h6" sx={{ mb: 1, color: "#424242", fontWeight: 500 }}>
              No matching opportunities found
            </Typography>

            <Typography variant="body2" sx={{ color: "#757575", maxWidth: "450px" }}>
              Try adjusting your search or filters to find what you're looking for.
            </Typography>

            {searchQuery && (
              <Button
                variant="text"
                size="small"
                onClick={() => setSearchQuery("")}
                sx={{
                  mt: 3,
                  color: "#616161",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)",
                  }
                }}
              >
                Clear Search
              </Button>
            )}
          </Paper>
        ) : (
          <Stack spacing={2}>
            {filteredOpportunities.map((opportunity) => (
              <UDOpportunityCard
                key={opportunity.id}
                {...opportunity}
                onClick={handleOpportunityClick}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
