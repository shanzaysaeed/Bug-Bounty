import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Skeleton,
  Alert,
  Chip,
  Container,
  useTheme,
  alpha
} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SecurityIcon from "@mui/icons-material/Security";
import { Opportunity, opportunityService } from "../../services/opportunityService";
import { getRelativeTimeString } from "../../utils/timeUtils";
import { useNavigate, useParams } from "react-router-dom";
import DisclosureModal from "./DisclosureModal";

export default function UDOpportunityDetail() {
  const { opportunityId } = useParams<{ opportunityId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disclosureModalOpen, setDisclosureModalOpen] = useState(false);

  const fetchOpportunityData = useCallback(async () => {
    if (!opportunityId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await opportunityService.getById(opportunityId);
      if (data) {
        setOpportunity(data);
      } else {
        setError("Opportunity not found");
      }
    } catch (err) {
      setError("Failed to load opportunity details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    fetchOpportunityData();
  }, [fetchOpportunityData]);

  const handleOpenDisclosureModal = useCallback(() => {
    setDisclosureModalOpen(true);
  }, []);

  const handleCloseDisclosureModal = useCallback(() => {
    setDisclosureModalOpen(false);
  }, []);

  if (loading) {
    return (
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        <Container maxWidth="md" sx={{ py: 3 }}>
          {/* Back button skeleton */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={160} height={36} sx={{ borderRadius: 1 }} />
          </Box>

          {/* Header card skeleton */}
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              p: { xs: 2.5, sm: 3 }
            }}
          >
            <Box sx={{ display: "flex", alignItems: "flex-start" }}>
              <Skeleton 
                variant="rectangular" 
                width={56} 
                height={56} 
                sx={{ 
                  borderRadius: 2,
                  mr: 2.5,
                  flexShrink: 0
                }} 
              />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="70%" height={36} sx={{ mb: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 3 }} />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Tags skeleton */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
            {[1, 2, 3, 4].map((_, index) => (
              <Skeleton 
                key={index}
                variant="rectangular" 
                width={80} 
                height={24} 
                sx={{ borderRadius: 3 }} 
              />
            ))}
          </Box>

          {/* Description content skeleton */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Skeleton variant="text" width="90%" height={24} />
              <Skeleton variant="text" width="95%" height={24} />
              <Skeleton variant="text" width="85%" height={24} />
              <Skeleton variant="text" width="88%" height={24} />
              <Box sx={{ my: 2 }}>
                <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1 }} />
              </Box>
              <Skeleton variant="text" width="92%" height={24} />
              <Skeleton variant="text" width="87%" height={24} />
              <Skeleton variant="text" width="83%" height={24} />
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)"
            }}
          >
            {error}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 500
            }}
          >
            Back to Opportunities
          </Button>
        </Container>
      </Box>
    );
  }

  if (!opportunity) return null;

  const relativeTime = getRelativeTimeString(opportunity.datePosted);

  return (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Back button and submit vulnerability button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            variant="text"
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 500,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            Back to opportunities
          </Button>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<SecurityIcon sx={{ fontSize: '1.1rem' }} />}
              onClick={handleOpenDisclosureModal}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                py: 0.75,
                px: 2,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                },
                transition: 'all 0.2s ease'
              }}
            >
              Submit Disclosure
            </Button>
          </Box>
        </Box>

        {/* Header with logo and title */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            p: { xs: 2.5, sm: 3 }
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start" }}>
            <Box
              sx={{
                minWidth: 56,
                height: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mr: 2.5,
                borderRadius: "10px",
                backgroundColor: "#f5f7fa",
                padding: "10px",
                border: "1px solid",
                borderColor: "divider",
                flexShrink: 0,
                alignSelf: "center"
              }}
            >
              <img
                src={opportunity.logo}
                alt={opportunity.company}
                style={{
                  maxWidth: "100%",
                  width: 36,
                  height: 36,
                  objectFit: "contain"
                }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                fontWeight="600"
                sx={{
                  color: "#1a2027",
                  mb: 0.75,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" },
                  letterSpacing: "-0.01em",
                  lineHeight: 1.3
                }}
              >
                {opportunity.title}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#4B5563",
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {opportunity.company}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6B7280',
                    bgcolor: 'transparent',
                    border: '1px solid',
                    borderColor: '#E5E7EB',
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '12px',
                    height: 24,
                    '&:hover': {
                      backgroundColor: alpha('#6B7280', 0.04),
                    },
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: '0.75rem', mr: 0.5, color: '#9CA3AF' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      color: '#6B7280',
                      lineHeight: 1.2,
                    }}
                  >
                    Posted {relativeTime}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Tags/Categories */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
          {opportunity.tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{
                backgroundColor: 'transparent',
                color: '#6B7280',
                fontWeight: 500,
                fontSize: '0.75rem',
                height: 24,
                border: '1px solid',
                borderColor: '#E5E7EB',
                px: 0.75,
                '&:hover': {
                  backgroundColor: alpha('#6B7280', 0.04),
                }
              }}
            />
          ))}
        </Box>

        {/* Description markdown */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
          }}
        >
          <Box
            sx={{
              textAlign: 'left',
              '& h1, & h2, & h3, & h4, & h5, & h6': {
                fontWeight: 600
              },
              '& h1': { fontSize: '1.5rem' },
              '& h2': { fontSize: '1.3rem' },
              '& h3': { fontSize: '1.1rem' },
              '& h4, & h5, & h6': { fontSize: '1rem' }
            }}
          >
            <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
              {opportunity.detailedDescription}
            </ReactMarkdown>
          </Box>
        </Paper>

        {/* Disclosure Modal */}
        <DisclosureModal
          open={disclosureModalOpen}
          onClose={handleCloseDisclosureModal}
          opportunityId={opportunityId || ''}
          companyName={opportunity.company}
          responsibleDisclosureUrl={opportunity.responsibleDisclosureUrl}
        />
      </Container>
    </Box>
  );
}
