import { QRCodeSVG } from "qrcode.react";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Link,
  CircularProgress
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { useSnackbar } from "./SnackBar";

type Props = {
  goBack: () => void,
  type: "login" | "signup",
  onSuccess: () => void,
}

const QRCodeGenerator = ({ type, goBack, onSuccess }: Props) => {
  const [oneTimeCode, setOneTimeCode] = useState("");
  const [qrCode, setQRCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const { showSnackbar } = useSnackbar();
  const [activeStep, setActiveStep] = useState(type === "login" ? 2 : 0);
  const [isLoading, setIsLoading] = useState(false);

  // Steps for 2FA setup
  const steps = [
    'Setup',
    'Scan',
    'Verify'
  ];

  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/users/register-mfa");
      setQRCode(response.data.uri);
      setActiveStep(1);
    } catch {
      showSnackbar("Failed to generate QR code. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFromStep0 = () => {
    fetchQRCode();
  };

  const handleBack = () => {
    if (activeStep === 2 && type === "signup") {
      setActiveStep(1);
    } else {
      goBack();
    }
  };

  const handleSubmit = async () => {
    if (!oneTimeCode) {
      setCodeErr("Verification code is required");
      return;
    }

    setCodeErr("");
    setIsLoading(true);

    try {
      await axios.post("/api/users/login-mfa", {
        code: oneTimeCode
      });
      showSnackbar("Authentication successful", "success");
      onSuccess();
    } catch (e: any) {
      showSnackbar(e?.response?.data?.error || "Invalid verification code", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        maxWidth: 480,
        mx: "auto",
        p: 3,
        pb: 0,
        borderRadius: '8px'
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500, textAlign: "center" }}>
        {type === "signup" ? "Two-Factor Authentication Setup" : "Two-Factor Authentication"}
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 3 }} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>
              <Box sx={{ width: '100%', textAlign: 'center' }}>
                {label}
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <CardContent sx={{ p: 0 }}>
        {type === "signup" && activeStep === 0 && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              For security, we require two-factor authentication. Please download an authenticator app:
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Link href="https://apps.apple.com/us/app/google-authenticator/id388497605" target="_blank" underline="none">
                Google Authenticator (iOS)
              </Link>
              <Link href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" underline="none">
                Google Authenticator (Android)
              </Link>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                onClick={goBack}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleContinueFromStep0}
                disabled={isLoading}
                sx={{ textTransform: 'none' }}
              >
                {isLoading ? "Loading..." : "Continue"}
              </Button>
            </Box>
          </Box>
        )}

        {qrCode && type === "signup" && activeStep === 1 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Open your authenticator app and scan this QR code:
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <QRCodeSVG
                value={qrCode}
                size={180}
                level="M"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                onClick={() => setActiveStep(0)}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={() => setActiveStep(2)}
                sx={{ textTransform: 'none' }}
              >
                Continue
              </Button>
            </Box>
          </Box>
        )}

        {(activeStep === 2 || type === "login") && (
          <Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Enter the 6-digit code from your authenticator app:
            </Typography>

            <TextField
              placeholder="000000"
              type="text"
              fullWidth
              size="small"
              margin="normal"
              value={oneTimeCode}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                setOneTimeCode(value);
                if (value) setCodeErr("");
              }}
              error={!!codeErr}
              helperText={codeErr}
              inputProps={{
                maxLength: 6,
                inputMode: 'numeric',
                style: { letterSpacing: '0.25em', textAlign: 'center' }
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                onClick={handleBack}
                variant="outlined"
                sx={{ textTransform: 'none' }}
              >
                {type === "signup" ? "Back" : "Cancel"}
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={isLoading}
                sx={{ textTransform: 'none' }}
              >
                {isLoading ? <CircularProgress size={20} /> : "Verify"}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeGenerator;
