import { Paper } from "@mui/material";

export default function PendingSignUp() {
    return <div style={{ height: "100vh", width: "100vw", padding: "100px" }}>
        <Paper elevation={3} sx={{ p: 8, width: 600, marginX: "auto" }}>
            <h2>Your account has been created and will be reviewed</h2>
            <p>Our team will be contacting you shortly to verify you and your organization's identity, using contacts
                you provided during sign up. Refresh this page when we inform you your onboarding has been approved.
            </p>
        </Paper>
    </div>
}