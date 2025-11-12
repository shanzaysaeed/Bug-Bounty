import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Opportunity } from "../../services/opportunityService";
import { getRelativeTimeString } from "../../utils/timeUtils";

interface OpportunityCardProps extends Opportunity {
  onClick: (id: string) => void;
}

export default function UDOpportunityCard({
  id,
  title,
  company,
  datePosted,
  previewDescription,
  logo,
  tags,
  onClick,
}: OpportunityCardProps) {
  // Display at most 2 tags in the card
  const displayTags = tags.slice(0, 2);

  // Calculate relative time
  const relativeTime = getRelativeTimeString(datePosted);

  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "16px",
        borderRadius: "10px",
        borderColor: "#eaecef",
        transition: "all 0.15s ease",
        cursor: "pointer",
        backgroundColor: "#ffffff",
        "&:hover": {
          boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
          borderColor: "#c2e0ff",
          backgroundColor: "#fafcff",
          "& .arrow-icon": {
            transform: "translateX(3px)",
            opacity: 1,
            color: "#0073e6",
          },
        },
      }}
      onClick={() => onClick(id)}
    >
      {/* Left: Logo + Main Info */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexShrink: 0,
            borderRadius: "8px",
            backgroundColor: "#f5f7fa",
            padding: "8px",
          }}
        >
          <img
            src={logo}
            alt={company}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        </Box>

        <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          {/* Title and Company */}
          <Box sx={{ mb: 0.25 }}>
            {/* Title row with timestamp */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  fontWeight="600"
                  fontSize="1rem"
                  noWrap
                  sx={{ color: "#1a2027" }}
                >
                  {title}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <AccessTimeIcon
                    sx={{ color: "#94a3b8", fontSize: "0.85rem" }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.8rem" }}
                  >
                    {relativeTime}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Company name */}
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{
                fontSize: "0.875rem",
                fontWeight: 500,
                mt: 0.1,
                mb: 0.5,
              }}
            >
              {company}
            </Typography>
          </Box>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              height: "40px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              lineHeight: "1.3",
              color: "#637381",
              mb: 0.75,
              fontSize: "0.875rem",
            }}
          >
            {previewDescription}
          </Typography>

          {/* Tags */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {displayTags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{
                  height: 26,
                  fontSize: "0.8rem",
                  backgroundColor: "transparent",
                  color: "#94a3b8",
                  fontWeight: 500,
                  border: "1px solid",
                  borderColor: "#e5e7eb",
                  px: 0.75,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right: Arrow */}
      <ArrowForwardIcon
        className="arrow-icon"
        sx={{
          color: "#94a3b8",
          opacity: 0.7,
          transition: "all 0.15s ease",
          fontSize: "1.1rem",
          mt: 0.75,
          ml: 1,
        }}
      />
    </Card>
  );
}
