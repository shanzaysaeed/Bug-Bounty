import { Button, Card, Chip, Dialog, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSnackbar } from "./SnackBar";
import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "../utils/csrf";

const StatusMap: Record<string, "default" | "error" | "info" | "success" | "warning"> = {
    "created": "default",
    "submitted": "info",
    "rejected": "error",
    "approved": "success",
    "archived": "warning"
};

type PostingProp = {
    id: number,
    company: string,
    datePosted: string,
    title: string,
    detailedDescription: string,
    previewDescription: string,
    responsibleDisclosureUrl: string,
    state: string,
    tags: string[],
    refetch: () => void,
}

function OrgPosting(props: PostingProp) {
    const { title, previewDescription, state, datePosted, tags, refetch, id } = props;
    const [open, setOpen] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);
    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleConfirm = (confirmSubmission: boolean) => {
        if (confirmSubmission) {
            setConfirmSubmit(true);
        } else {
            setConfirmSubmit(false);
        }
        setOpen(true);
    }

    const handleAction = async () => {
        try {
            let message = "";
            if (confirmSubmit) {
                const response = await axios.post("/api/requests/submit-for-approval", {
                    request_id: id,
                    csrf_token: await getCsrfToken(),
                });
                message = response.data.message;
            } else {
                const response = await axios.post("/api/requests/archive", {
                    request_id: id,
                    csrf_token: await getCsrfToken(),
                });
                message = response.data.message;
            }
            showSnackbar(message, "success");
            setOpen(false);
            refetch();
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Unexpected error occured. Please try again later", "error");
        }
    }

    return <Card sx={{ m: 2, p: 2, borderRadius: 2 }} elevation={4}>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <div style={{ padding: "24px" }}>
                <Typography variant="h5">{confirmSubmit ? "Submission" : "Archive"} Confirmation</Typography>
                <br />
                <Typography>Are you sure you want to {confirmSubmit ? "Submission" : "Archive"} this post?</Typography>
                <br />
                <div style={{ display: "flex", flexDirection: "row-reverse" }}>
                    <Button variant="contained" color={confirmSubmit ? "primary" : "error"} onClick={handleAction}>{confirmSubmit ? "Submit" : "Archive"}</Button>
                    <Button sx={{ marginRight: 1 }} variant="outlined" onClick={() => setOpen(false)}>Exit</Button>
                </div>
            </div>
        </Dialog>
        <Typography align="left" variant="h6">{title}</Typography>

        <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography align="left" variant="body2">{previewDescription}</Typography>
            <Typography variant="body2">Last Updated On: {datePosted}</Typography>
        </div>
        <div style={{ display: "flex", justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
            <div>
                {
                    tags.map(tag => {
                        return <Chip sx={{ marginRight: "8px" }} size="small" label={tag} color="secondary" variant="outlined" />
                    })
                }
            </div>
            <Chip sx={{ marginLeft: "8px" }} size="small" label={state.toUpperCase()} color={StatusMap[state] || "default"} />
        </div>
        <div style={{ display: "flex", flexDirection: "row-reverse", paddingTop: 16 }}>
            {
                state === "archived" ? <Button variant="contained" color="primary" disabled>Archived</Button> :
                    <>
                        <Button variant="contained" color="primary" disabled={state === "submitted"} onClick={() => handleConfirm(true)}>{state === "submitted" ? "Submitted" : "Submit"}</Button>
                        <Button disabled={state === "submitted"} sx={{ marginX: 1 }} variant="outlined" color="primary" onClick={() => navigate(`/org/dashboard/create-edit/${id}`)}>Edit</Button>
                        <Button variant="outlined" color="error" onClick={() => handleConfirm(false)}>Archive</Button>
                    </>
            }
        </div>
    </Card>
}

export default function OrgPostingList() {
    const [postings, setPostings] = useState<PostingProp[]>([]);
    const { showSnackbar } = useSnackbar();

    const fetchPostings = async () => {
        try {
            const response = await axios.get("/api/requests/get-all");
            setPostings(response.data.requests);
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error fetching postings right now. Try again later", "error");
        }
    };

    useEffect(() => {
        fetchPostings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    return <div style={{ padding: "64px 0" }}>
        <Typography sx={{ p: 2 }} align="left" variant="h4">Your bounty postings</Typography>
        {
            postings.length > 0 ? postings.map(data => {
                return <OrgPosting {...data} refetch={fetchPostings} />
            }) :
                <>
                    <Typography align="center">You have no posting requests so far, go create some!</Typography>
                </>
        }
    </div>;
}
