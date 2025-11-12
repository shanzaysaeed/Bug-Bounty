import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Skeleton,
  Alert,
  Container,
  useTheme,
  alpha,
  TextField,
  Avatar,
  CircularProgress,
  Tooltip,
  Tabs,
  Tab,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import SecurityIcon from "@mui/icons-material/Security";
import MarkdownIcon from "@mui/icons-material/Code";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { Disclosure, disclosureService, ThreadMessage } from "../../services/disclosureService";
import { useNavigate, useParams } from "react-router-dom";

// Card-style component for individual messages
const MessageCard = ({ message }: { message: ThreadMessage }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
        overflow: 'hidden'
      }}
    >
      {/* User header */}
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          p: 2,
          borderBottom: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.06),
          bgcolor: "#f5f7fa",
        }}
      >
        <Avatar 
          {...(message.senderAvatar ? { src: message.senderAvatar } : {})}
          sx={{ 
            width: 36, 
            height: 36,
            fontSize: '0.875rem',
            fontWeight: 500,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            border: '1px solid',
            borderColor: alpha(theme.palette.primary.main, 0.15),
            boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.02)}`,
            mr: 2,
          }}
        >
          {!message.senderAvatar && message.senderName.charAt(0)}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontSize: '0.875rem',
              fontWeight: 500,
              color: "#4B5563",
            }}
          >
            {message.senderName}
          </Typography>
        </Box>
      </Box>
      
      {/* Message content */}
      <Box 
        sx={{
          p: { xs: 2.5, sm: 4 },
          bgcolor: alpha(theme.palette.background.paper, 0.7),
          maxWidth: '100%',
          overflowX: 'auto',
          
          // Markdown styling from UDOpportunityDetail
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
          {message.message}
        </ReactMarkdown>
      </Box>
    </Paper>
  );
};

// Component to display the message thread
const MessageThread = ({ messages }: { messages: ThreadMessage[] }) => {
  const theme = useTheme();
  if (messages.length === 0) {
    return (
      <Box sx={{ 
        py: 12,
        px: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
      }}>
        <Box 
          sx={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            mb: 1,
          }}
        >
          <MarkEmailReadIcon sx={{ fontSize: 28 }} />
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: theme.palette.text.primary,
            letterSpacing: '-0.02em',
          }}
        >
          No messages yet
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontSize: '0.875rem',
            maxWidth: 340,
            lineHeight: 1.6,
            textAlign: "center"
          }}
        >
          Start the conversation by sending your first message below.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <MessageCard
          key={`${message.senderName}-${message.timestamp.getTime()}`}
          message={message}
        />
      ))}
    </>
  );
};

export default function UDInboxDisclosureThread() {
  const { disclosureId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [disclosure, setDisclosure] = useState<Disclosure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const messageEndRef = useRef<null | HTMLDivElement>(null);

  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'write' | 'preview') => {
    setActiveTab(newValue);
  };

  const fetchDisclosureData = useCallback(async () => {
    if (!disclosureId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await disclosureService.getById(parseInt(disclosureId, 10));
      if (data) {
        setDisclosure(data);
      } else {
        setError("Disclosure not found");
      }
    } catch (err) {
      setError("Failed to load disclosure details. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [disclosureId]);

  useEffect(() => {
    fetchDisclosureData();
  }, [fetchDisclosureData]);

  useEffect(() => {
    // Auto scroll to bottom of messages when new comments are loaded or added
    if (!loading && messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [disclosure?.comments, loading]);

  const canSendMessage = () => {
    return newMessage.trim() !== '' && !sendingMessage && disclosure !== null;
  };

  const handleSendMessage = async () => {
    if (!canSendMessage()) return;

    const trimmedMessage = newMessage.trim();
    try {
      setSendingMessage(true);
      await disclosureService.sendMessage(disclosure!.id, {
        content: trimmedMessage
      });
      await fetchDisclosureData();
      setNewMessage("");
      setActiveTab('write');
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle keyboard shortcut for sending message
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      if (canSendMessage()) {
        handleSendMessage();
      }
      e.preventDefault();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        {/* Back button skeleton */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Skeleton 
            variant="rectangular" 
            width={120} 
            height={36} 
            sx={{ borderRadius: 1 }} 
          />
          <Skeleton 
            variant="rectangular" 
            width={110} 
            height={36} 
            sx={{ borderRadius: "8px" }} 
          />
        </Box>

        {/* Header skeleton */}
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
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
              <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="30%" height={24} />
            </Box>
          </Box>
        </Paper>

        {/* Message thread skeletons */}
        {[1, 2].map((_, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              overflow: 'hidden'
            }}
          >
            {/* Message header skeleton */}
            <Box sx={{ 
              display: "flex", 
              alignItems: "center", 
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: "#f5f7fa",
            }}>
              <Skeleton 
                variant="circular" 
                width={36} 
                height={36} 
                sx={{ mr: 2 }} 
              />
              <Skeleton variant="text" width={120} />
            </Box>

            {/* Message content skeleton */}
            <Box sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="75%" />
              <Skeleton variant="text" width="60%" />
            </Box>
          </Paper>
        ))}

        {/* Input box skeleton */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: 'hidden'
          }}
        >
          <Box sx={{ p: 2 }}>
            <Skeleton 
              variant="rectangular" 
              height={100} 
              sx={{ 
                borderRadius: 1,
                mb: 2
              }} 
            />
          </Box>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            p: 1.5,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default'
          }}>
            <Skeleton 
              variant="rectangular" 
              width={100} 
              height={36} 
              sx={{ borderRadius: 1 }} 
            />
          </Box>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
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
          onClick={handleBackClick}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontWeight: 500
          }}
        >
          Back to Inbox
        </Button>
      </Container>
    );
  }

  if (!disclosure) return null;
  
  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Back button and status indicator */}
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
          onClick={handleBackClick}
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
          Back to inbox
        </Button>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {disclosure.status === 'ACCEPTED' ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: "8px",
                fontSize: "0.875rem",
                py: 0.75,
                px: 2,
                minWidth: 110,
                borderColor: alpha(theme.palette.success.main, 0.5),
                backgroundColor: alpha(theme.palette.success.main, 0.02),
                color: theme.palette.success.main,
                border: '1px solid',
                fontWeight: 500
              }}
            >
              <CheckCircleIcon sx={{ fontSize: '1.1rem' }} />
              <span>Accepted</span>
            </Box>
          ) : disclosure.status === 'REJECTED' ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: "8px",
                fontSize: "0.875rem",
                py: 0.75,
                px: 2,
                minWidth: 110,
                borderColor: alpha(theme.palette.error.main, 0.5),
                backgroundColor: alpha(theme.palette.error.main, 0.02),
                color: theme.palette.error.main,
                border: '1px solid',
                fontWeight: 500
              }}
            >
              <SecurityIcon sx={{ fontSize: '1.1rem' }} />
              <span>Rejected</span>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                borderRadius: "8px",
                fontSize: "0.875rem",
                py: 0.75,
                px: 2,
                minWidth: 110,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                backgroundColor: alpha(theme.palette.primary.main, 0.02),
                color: theme.palette.primary.main,
                border: '1px solid',
                fontWeight: 500
              }}
            >
              <SecurityIcon sx={{ fontSize: '1.1rem' }} />
              <span>Submitted</span>
            </Box>
          )}
        </Box>
      </Box>

      {/* Header with logo and title - matching UDOpportunityDetail styling */}
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
              src={disclosure.logo || "https://via.placeholder.com/48"}
              alt={disclosure.organization || disclosure.jobRequestTitle}
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
              {disclosure.organization || disclosure.jobRequestTitle}
            </Typography>
            
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
              Security Disclosure
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Display report content */}
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
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
          Report Details
        </Typography>
        <Box 
          sx={{
            // Markdown styling from UDOpportunityDetail
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
            {disclosure.content}
          </ReactMarkdown>
        </Box>
      </Paper>

      {/* Messages container */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
          Comments ({disclosure.commentCount})
        </Typography>
        <MessageThread messages={disclosure.comments || []} />
        <div ref={messageEndRef} />
      </Box>
      
      {/* Message input box with preview */}
      {disclosure.status !== 'REJECTED' && disclosure.status !== 'ACCEPTED' ? (
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
            overflow: 'hidden',
            '&:hover': {
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            },
            '&:focus-within': {
              borderColor: alpha(theme.palette.primary.main, 0.3),
              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
          }}
        >
          {/* Tabs for editor/preview */}
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            aria-label="message editor tabs"
            sx={{
              minHeight: 42,
              borderBottom: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.15),
              '& .MuiTabs-indicator': {
                height: 2,
                backgroundColor: theme.palette.primary.main
              },
              '& .MuiTab-root': {
                minHeight: 42,
                textTransform: 'none',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: alpha(theme.palette.text.secondary, 0.9),
                px: 3,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 600
                }
              }
            }}
          >
            <Tab 
              value="write" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MarkdownIcon sx={{ fontSize: 18 }} />
                  <span>Write</span>
                </Box>
              } 
            />
            <Tab 
              value="preview" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VisibilityIcon sx={{ fontSize: 18 }} />
                  <span>Preview</span>
                </Box>
              } 
            />
          </Tabs>
          
          {/* Write tab */}
          {activeTab === 'write' && (
            <TextField
              multiline
              rows={4}
              fullWidth
              placeholder="Type your message here... (Markdown supported)"
              variant="outlined"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sendingMessage}
              InputProps={{
                sx: {
                  p: 0,
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  p: 2,
                  fontSize: '0.875rem',
                  fontFamily: '"SF Mono", "Menlo", "Monaco", monospace',
                  color: theme.palette.text.primary,
                },
                '& textarea::placeholder': { 
                  opacity: 0.6,
                  fontSize: '0.875rem',
                },
              }}
            />
          )}
          
          {/* Preview tab */}
          {activeTab === 'preview' && (
            <Box
              sx={{
                p: 2,
                minHeight: 160,
                maxHeight: 300,
                overflowY: 'auto',
                // Markdown styling from UDOpportunityDetail
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
              {newMessage ? (
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {newMessage}
                </ReactMarkdown>
              ) : (
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    opacity: 0.6, 
                    fontStyle: 'italic', 
                    fontSize: '0.875rem' 
                  }}
                >
                  Nothing to preview
                </Typography>
              )}
            </Box>
          )}
          
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 1.5,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              borderTop: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.06),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {['**Bold**', '*Italic*', '`Code`', '[Link](url)'].map((format, idx) => (
                <Tooltip key={idx} title={format.replace(/\*/g, '').replace(/`/g, '').replace(/\[|\]|\(url\)/g, '')} arrow placement="top">
                  <Box
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontFamily: '"SF Mono", "Menlo", monospace',
                      color: alpha(theme.palette.text.secondary, 0.8),
                      bgcolor: alpha(theme.palette.background.default, 0.7),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.divider, 0.1),
                      cursor: 'default',
                      userSelect: 'none',
                      display: { xs: idx < 2 ? 'block' : 'none', sm: 'block' },
                    }}
                  >
                    {format}
                  </Box>
                </Tooltip>
              ))}
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              endIcon={sendingMessage ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SendIcon sx={{ fontSize: 18 }} />
              )}
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sendingMessage}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
                py: 0.75,
                px: 2,
                boxShadow: 'none',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.9),
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                },
                transition: 'all 0.2s ease'
              }}
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            py: 3,
            px: 4,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid',
            borderColor: disclosure.status === 'ACCEPTED' ? 
              alpha(theme.palette.success.main, 0.2) : 
              alpha(theme.palette.error.main, 0.2),
            bgcolor: disclosure.status === 'ACCEPTED' ?
              alpha(theme.palette.success.main, 0.05) :
              alpha(theme.palette.error.main, 0.05),
            gap: 2,
          }}
        >
          {disclosure.status === 'ACCEPTED' ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 24, color: theme.palette.success.main }} />
              <Typography sx={{ color: theme.palette.success.dark, fontWeight: 600, fontSize: '0.95rem' }}>
                This disclosure has been accepted
              </Typography>
            </>
          ) : (
            <>
              <SecurityIcon sx={{ fontSize: 24, color: theme.palette.error.main }} />
              <Typography sx={{ color: theme.palette.error.dark, fontWeight: 600, fontSize: '0.95rem' }}>
                This disclosure has been rejected
              </Typography>
            </>
          )}
        </Paper>
      )}
    </Container>
  );
}