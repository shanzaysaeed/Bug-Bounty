import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import { IconButton, Tooltip } from "@mui/material";

export default function EmailUs() {
    const onHelpClick = () => {
        window.open("mailto:teambytebreakers@gmail.com");
    };

    return <div>
        <Tooltip title="Need help? Email us!">
            <IconButton size="large"
                onClick={onHelpClick}
                sx={{
                    position: "fixed",
                    bottom: 20,
                    right: 20,
                    backgroundColor: "#007bff",
                    color: "white",
                    "&:hover": { backgroundColor: "#0056b3" },
                    zIndex: 1000, // Ensures it stays above everything
                    boxShadow: 3,
                }}
            >
                <HelpCenterIcon fontSize="large" />
            </IconButton>
        </Tooltip>
    </div>
}
