import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Disclosure } from "../../services/disclosureService";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { useTheme, alpha } from "@mui/material";

interface DisclosureCardProps extends Disclosure {
  onClick: (id: number) => void;
}

const commonChipStyles = {
  height: 26,
  fontSize: "0.8rem",
  fontWeight: 500,
  px: 0.75,
};

export default function UDInboxDisclosureCard({
  id,
  unread,
  status,
  organization,
  logo,
  content,
  commentCount,
  jobRequestTitle,
  onClick,
}: DisclosureCardProps) {
  const theme = useTheme();
  
  return (
    <Card
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        p: 2,
        borderRadius: "10px",
        borderColor: unread ? "#d8b9ff" : "#eaecef",
        bgcolor: unread ? "#f8f5ff" : "#ffffff",
        cursor: "pointer",
        transition: "all 0.15s ease",
        "&:hover": {
          boxShadow: "0 3px 10px rgba(0,0,0,0.04)",
          borderColor: "#d8b9ff",
          bgcolor: "#f8f5ff",
          "& .arrow-icon": {
            transform: "translateX(3px)",
            opacity: 1,
            color: "#5E35B1",
          },
        },
      }}
      onClick={() => onClick(id)}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1 }}>
        {/* Logo */}
        <Box
          sx={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            borderRadius: "8px",
            bgcolor: "#f5f7fa",
            p: 1,
          }}
        >
          {logo && (
            <img
              src={logo}
              alt={organization || jobRequestTitle}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              mb: 0.75,
            }}
          >
            {organization || jobRequestTitle}
          </Typography>

          {/* Markdown preview */}
          <Box
            sx={{
              height: "4.2em",
              overflow: "hidden",
              mb: 0.75,
              '& .markdown-preview': {
                textAlign: 'left',
                fontSize: '0.96rem',
                color: alpha(theme.palette.text.primary, 0.9),
                lineHeight: 1.35,
                '& h1, & h2, & h3, & h4, & h5, & h6': {
                  fontWeight: 600,
                  fontSize: '0.96rem',
                  margin: 0,
                },
                '& p': {
                  margin: 0,
                  fontSize: '0.96rem',
                },
                '& *:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6):not(p)': {
                  display: 'none'
                }
              }
            }}
          >
            <div className="markdown-preview">
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                {content || "No content"}
              </ReactMarkdown>
            </div>
          </Box>

          {/* Status chips */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            <Chip
              label={`${commentCount} comment${commentCount !== 1 ? 's' : ''}`}
              size="small"
              sx={{
                ...commonChipStyles,
                bgcolor: "transparent",
                color: "#94a3b8",
                border: "1px solid",
                borderColor: "#e5e7eb",
              }}
            />
            {unread && (
              <Chip
                label="Unread"
                size="small"
                sx={{
                  ...commonChipStyles,
                  bgcolor: "#f1ebff",
                  color: "#5E35B1",
                }}
              />
            )}
            {status && (
              <Chip
                label={status}
                size="small"
                sx={{
                  ...commonChipStyles,
                  bgcolor: status === "SUBMITTED" ? "#f1ebff" : 
                           status === "ACCEPTED" ? "#e8faf0" : 
                           status === "REJECTED" ? "#feeaea" : "#f1ebff",
                  color: status === "SUBMITTED" ? "#5E35B1" :
                         status === "ACCEPTED" ? "#027948" :
                         status === "REJECTED" ? "#d32f2f" : "#5E35B1",
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

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