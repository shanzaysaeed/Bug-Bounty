import { useState, useCallback, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  useTheme,
  alpha,
  Paper,
  Fade,
  Tooltip,
  FormControlLabel,
  Checkbox,
  Link,
  Snackbar,
  Tabs,
  Tab,
} from "@mui/material";
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import CloseIcon from "@mui/icons-material/Close";
import MarkdownIcon from "@mui/icons-material/Code";
import SendIcon from "@mui/icons-material/Send";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { disclosureService } from "../../services/disclosureService";

// Initial markdown template for the disclosure submission
const INITIAL_DISCLOSURE_TEMPLATE = `## Vulnerability Description

Describe the vulnerability in detail...

## Steps to Reproduce

1. First step
2. Second step
3. ...

## Impact

Explain the potential impact...

## Suggested Fix

If you have suggestions for fixing the issue...
`;

// LocalStorage key for saving disclosure content
const DISCLOSURE_CONTENT_KEY = "savedDisclosureContent";

interface DisclosureModalProps {
  open: boolean;
  onClose: () => void;
  opportunityId: string;
  companyName: string;
  responsibleDisclosureUrl: string;
}

const DisclosureModal: React.FC<DisclosureModalProps> = ({
  open,
  onClose,
  opportunityId,
  companyName,
  responsibleDisclosureUrl
}) => {
  const theme = useTheme();
  const [disclosureContent, setDisclosureContent] = useState(INITIAL_DISCLOSURE_TEMPLATE);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  // Use unique localStorage key per opportunity
  const localStorageKey = `${DISCLOSURE_CONTENT_KEY}_${opportunityId}`;

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'write' | 'preview') => {
    setActiveTab(newValue);
  };

  // Load saved content from localStorage when modal opens
  useEffect(() => {
    if (open) {
      const savedContent = localStorage.getItem(localStorageKey);
      if (savedContent) {
        setDisclosureContent(savedContent);
      }
    }
  }, [open, localStorageKey]);

  // Handle disclosure modal close with saving content
  const handleClose = useCallback(() => {
    if (!submitting) {
      // Save content to localStorage before closing
      localStorage.setItem(localStorageKey, disclosureContent);

      onClose();

      // Only reset agreed to terms, not content
      setAgreedToTerms(false);
    }
  }, [onClose, submitting, disclosureContent, localStorageKey]);

  // Handle disclosure content change
  const handleDisclosureContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = event.target.value;
    setDisclosureContent(newContent);
    // Save to localStorage on each change
    localStorage.setItem(localStorageKey, newContent);
  }, [localStorageKey]);

  // Handle agreement checkbox change
  const handleAgreementChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setAgreedToTerms(event.target.checked);
  }, []);

  // Handle disclosure submission
  const handleSubmitDisclosure = useCallback(async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Call the disclosureService to submit the disclosure
      await disclosureService.submitDisclosure(opportunityId, disclosureContent);

      // On successful submission, reset the content to the template
      localStorage.setItem(localStorageKey, INITIAL_DISCLOSURE_TEMPLATE);

      // Show success message
      setSuccessMessage(`Disclosure successfully submitted to ${companyName}`);

      // Close modal
      setTimeout(() => {
        onClose();

        // Reset form after close animation completes
        setTimeout(() => {
          setDisclosureContent(INITIAL_DISCLOSURE_TEMPLATE);
          setAgreedToTerms(false);
        }, 300);
      }, 1000);
    } catch (error) {
      console.error('Error submitting disclosure:', error);
      setErrorMessage('There was an error submitting your disclosure. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [opportunityId, disclosureContent, onClose, companyName, localStorageKey]);

  // Handle closing the alert messages
  const handleCloseSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  const handleCloseErrorMessage = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        slots={{ transition: Fade }}
        transitionDuration={250}
        keepMounted={false}
        slotProps={{
          paper: {
            sx: {
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.05)',
              border: '1px solid',
              borderColor: alpha(theme.palette.divider, 0.1),
              height: '85vh',
              maxHeight: '900px',
              m: { xs: 1, sm: 2 },
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
              backdropFilter: 'blur(10px)'
            }
          }
        }}
        sx={{
          '& .MuiBackdrop-root': {
            backdropFilter: 'blur(4px)',
            backgroundColor: alpha('#fff', 0.6),
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: alpha(theme.palette.divider, 0.1),
            px: 3,
            py: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.5),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                borderRadius: '8px',
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                p: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.main
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={600} fontSize="1.1rem" sx={{ letterSpacing: '-0.01em' }}>
                Security Disclosure
              </Typography>
              <Typography color="text.secondary" variant="body2" fontSize="0.85rem">
                {companyName}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close modal"
            size="small"
            sx={{
              color: 'text.secondary',
              borderRadius: '10px',
              '&:hover': { backgroundColor: alpha(theme.palette.divider, 0.1) },
              transition: 'all 0.2s ease'
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: alpha(theme.palette.divider, 0.1) }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: '12px',
                p: 2,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1)
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LightbulbOutlinedIcon sx={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography fontWeight={500} fontSize="0.9rem" mb={0.5}>
                    Create a detailed security disclosure
                  </Typography>
                  <Typography color="text.secondary" fontSize="0.85rem">
                    Provide clear reproduction steps, impact analysis, and any technical details
                    that will help the security team understand and validate the vulnerability.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Tabs for editor/preview */}
          <Tabs 
            value={activeTab}
            onChange={handleTabChange}
            aria-label="disclosure editor tabs"
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
          
          <Box sx={{ flexGrow: 1, height: 'calc(100% - 155px)', overflow: 'hidden' }}>
            {/* Write tab */}
            {activeTab === 'write' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <TextField
                  multiline
                  fullWidth
                  value={disclosureContent}
                  onChange={handleDisclosureContentChange}
                  placeholder="Describe your security finding in detail..."
                  variant="outlined"
                  disabled={submitting}
                  InputProps={{
                    sx: {
                      border: 'none',
                      height: '100%',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    }
                  }}
                  sx={{
                    flexGrow: 1,
                    '& .MuiInputBase-root': {
                      height: '100%',
                      fontFamily: '"SF Mono", "Menlo", "Monaco", monospace',
                      fontSize: '0.875rem',
                      p: 2.5,
                      color: theme.palette.text.primary,
                      overflow: 'auto',
                    },
                    '& .MuiInputBase-inputMultiline': {
                      height: '100% !important',
                      overflow: 'auto !important',
                    },
                    '& textarea': {
                      height: '100% !important',
                    },
                    '& textarea::placeholder': { 
                      opacity: 0.6,
                      fontSize: '0.875rem',
                    },
                  }}
                />
                
                {/* Markdown formatting hints - fixed at the bottom */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    p: 1.5,
                    bgcolor: alpha(theme.palette.background.default, 0.5),
                    borderTop: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.06),
                    flexShrink: 0,
                    flexWrap: 'wrap',
                  }}
                >
                  {['**Bold**', '*Italic*', '`Code`', '## Heading', '[Link](url)', '1. List'].map((format, idx) => (
                    <Tooltip key={idx} title={format.replace(/\*/g, '').replace(/`/g, '').replace(/\[|\]|\(url\)/g, '').replace(/##/, '').replace(/1\./, '')} arrow placement="top">
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
                          display: { xs: idx < 4 ? 'block' : 'none', sm: 'block' },
                          m: 0.25
                        }}
                      >
                        {format}
                      </Box>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            )}
            
            {/* Preview tab */}
            {activeTab === 'preview' && (
              <Box
                sx={{
                  height: '100%',
                  p: 2.5,
                  overflow: 'auto',
                  // Markdown styling
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
                {disclosureContent ? (
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {disclosureContent}
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
          </Box>
        </DialogContent>

        <DialogActions sx={{
          p: 3,
          borderTop: '1px solid',
          borderColor: alpha(theme.palette.divider, 0.1),
          justifyContent: 'space-between',
          backgroundColor: alpha(theme.palette.background.default, 0.3)
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Terms agreement checkbox */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={handleAgreementChange}
                  size="small"
                  sx={{
                    color: alpha(theme.palette.text.secondary, 0.7),
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                    padding: '3px',
                    borderRadius: '3px',
                    width: 20, // 20% larger
                    height: 20, // 20% larger
                    '& .MuiSvgIcon-root': {
                      fontSize: '1.2rem', // 20% larger
                      borderRadius: '3px'
                    }
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{
                    fontSize: '0.9rem', // 20% larger from original 0.75rem
                    lineHeight: 1.5,
                    opacity: 0.9
                  }}>
                    I agree to {companyName}'s{' '}
                    <Link
                      href={responsibleDisclosureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      underline="hover"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        '&:hover': {
                          color: theme.palette.primary.main
                        }
                      }}
                    >
                      responsible disclosure policy
                      <OpenInNewIcon sx={{ fontSize: '0.9rem', ml: 0.5 }} /> {/* 20% larger */}
                    </Link>
                  </Typography>
                </Box>
              }
              sx={{
                margin: 0,
                '.MuiFormControlLabel-label': {
                  fontSize: '0.9rem' // 20% larger
                },
                '& .MuiCheckbox-root': {
                  marginRight: 0.7 // Slightly more space after the larger checkbox
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={submitting}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                borderColor: alpha(theme.palette.divider, 0.5),
                px: 2.5,
                py: 0.75,
                minHeight: '36px',
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                '&:hover': {
                  borderColor: alpha(theme.palette.divider, 0.8),
                  backgroundColor: alpha(theme.palette.divider, 0.08)
                }
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmitDisclosure}
              disabled={submitting || !disclosureContent.trim() || !agreedToTerms}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <SendIcon sx={{ fontSize: '0.9rem' }} />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 500,
                px: 2.5,
                py: 0.75,
                minHeight: '36px',
                fontSize: '0.875rem',
                boxShadow: 'none',
                backgroundColor: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.25)}`
                },
                '&:active': {
                  boxShadow: 'none',
                  transform: 'translateY(1px)'
                },
                transition: 'all 0.15s ease'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Disclosure'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
      {successMessage && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={handleCloseSuccessMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              minWidth: 'auto',
              boxShadow: 'none'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2.2,
              py: 1.1,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.85),
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: '1px solid',
              borderColor: alpha('#E8FEF0', 0.6),
              color: theme.palette.text.primary,
              width: 'auto',
              transition: 'all 0.2s ease-out',
              animation: 'fadeInUp 0.3s ease-out',
              '@keyframes fadeInUp': {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(10px)'
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.main,
                borderRadius: '50%',
                flexShrink: 0
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 10,
                  height: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem'
                }}
              >
                ✓
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: alpha(theme.palette.text.primary, 0.95),
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              {successMessage}
            </Typography>
            <IconButton
              size="small"
              onClick={handleCloseSuccessMessage}
              sx={{
                width: 22,
                height: 22,
                color: alpha(theme.palette.text.secondary, 0.6),
                padding: 0,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.divider, 0.05)
                }
              }}
            >
              <CloseIcon fontSize="small" sx={{ fontSize: '0.75rem' }} />
            </IconButton>
          </Box>
        </Snackbar>
      )}
      {errorMessage && (
        <Snackbar
          open={true}
          autoHideDuration={5000}
          onClose={handleCloseErrorMessage}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{
            '& .MuiSnackbarContent-root': {
              minWidth: 'auto',
              boxShadow: 'none'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
              px: 2.2,
              py: 1.1,
              borderRadius: '8px',
              backdropFilter: 'blur(10px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.85),
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              border: '1px solid',
              borderColor: alpha('#FEE8E8', 0.6),
              color: theme.palette.text.primary,
              width: 'auto',
              transition: 'all 0.2s ease-out',
              animation: 'fadeInUp 0.3s ease-out'
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(theme.palette.error.main, 0.12),
                color: theme.palette.error.main,
                borderRadius: '50%',
                flexShrink: 0
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 10,
                  height: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                !
              </Box>
            </Box>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: alpha(theme.palette.text.primary, 0.95),
                letterSpacing: '-0.01em',
                lineHeight: 1.3,
              }}
            >
              {errorMessage}
            </Typography>
            <IconButton
              size="small"
              onClick={handleCloseErrorMessage}
              sx={{
                width: 22,
                height: 22,
                color: alpha(theme.palette.text.secondary, 0.6),
                padding: 0,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.divider, 0.05)
                }
              }}
            >
              <CloseIcon fontSize="small" sx={{ fontSize: '0.75rem' }} />
            </IconButton>
          </Box>
        </Snackbar>
      )}
    </>
  );
};

export default DisclosureModal;
