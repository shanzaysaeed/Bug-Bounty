import { Button, Card, Chip, Dialog, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSnackbar } from "../components/SnackBar";
import { useUserInfoContext } from "../utils/Context";
import MarkdownWrapper from "../components/MarkdownWrapper";
import { useNavigate } from "react-router-dom";
import { getCsrfToken } from "../utils/csrf";

type SignUp = {
    name: string,
    email: string,
    id: number
}

type JobRequest = {
    id: number,
    company: string,
    datePosted: string,
    title: string,
    detailedDescription: string,
    previewDescription: string,
    responsibleDisclosureUrl: string,
    state: string,
    tags: string[],
}

function PostingDetailPopUp(props: { jobRequest: JobRequest | null }) {
    const { jobRequest } = props;
    if (!jobRequest) return <></>;

    return <Card sx={{ p: 4, height: 600, overflowY: 'auto' }}>
        <Typography variant="h5">{jobRequest.title}</Typography>
        <br />
        <Typography variant="h6">Company</Typography>
        <Typography variant="body1">{jobRequest.company}</Typography>
        <br />
        <Typography variant="h6">Summary</Typography>
        <Typography variant="body1">{jobRequest.previewDescription}</Typography>
        <br />
        <Typography variant="h6">Tags</Typography>
        {
            jobRequest.tags.map(tag => <Chip label={tag} variant="outlined" sx={{ m: 1 }}></Chip>)
        }
        <br />
        <Typography variant="h6">Responsible Disclosure URL</Typography>
        <Typography variant="body1">{jobRequest.responsibleDisclosureUrl}</Typography>
        <br />
        <Typography variant="h6">Detailed Description</Typography>
        <div>
            <MarkdownWrapper value={jobRequest.detailedDescription}></MarkdownWrapper>
        </div>
    </Card>
}

export default function AdminDashBoard() {
    const [pendingSignUps, setPendingSignUps] = useState<SignUp[]>([]);
    const [pendingPostings, setPendingPostings] = useState<JobRequest[]>([]);
    const [detailPosting, setDetailPosting] = useState<JobRequest | null>(null);
    const { showSnackbar } = useSnackbar();
    const meData = useUserInfoContext();
    const navigate = useNavigate();

    const handleLogOut = async () => {
        try {
            await axios.post("/api/users/logout", {
                csrf_token: await getCsrfToken(),
            });
        } catch (e) {
            console.log(e);
        }
        showSnackbar("Successfully logged out", "success");
        navigate("/admin");
    };

    const handleApproveSignup = async (id: number) => {
        try {
            await axios.post("/api/admin/approve-organization", {
                organization_id: id,
                csrf_token: await getCsrfToken(),
            });
            showSnackbar("Organization approved", "success");
            fetchSignups();
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error fetching data. Try again later.", "error");
        }
    };

    const handleApproveRejectPosting = async (approve: boolean, id: number) => {
        try {
            if (approve) {
                await axios.post("/api/admin/approve-request", {
                    request_id: id,
                    csrf_token: await getCsrfToken(),
                });
                showSnackbar("Request approved.", "success");
            } else {
                await axios.post("/api/admin/reject-request", {
                    request_id: id,
                    csrf_token: await getCsrfToken(),
                });
                showSnackbar("Request rejected.", "success");
            }
            fetchRequests();
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error submitting the review. Try again later.", "error");
        }
    };

    const fetchSignups = async () => {
        try {
            const response = await axios.get("/api/admin/organizations");
            setPendingSignUps(response.data.filter((org: any) => org?.metadata.approved === false));
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error fetching data. Try again later.", "error");
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await axios.get("/api/admin/submitted-postings");
            setPendingPostings(response.data);
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error fetching data. Try again later.", "error");
        }
    }

    useEffect(() => {
        fetchSignups();
        fetchRequests();
    }, []);

    return <div style={{ height: "100vh", background: "lightgrey" }}>
        <Card sx={{ display: "flex", background: "lightblue", p: 2, alignItems: "center", borderRadius: 0 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>ByteBreakers Admin Dashboard</Typography>
            <Typography sx={{ marginX: 2 }}>{meData.email}</Typography>
            <Button variant="text" onClick={handleLogOut}>Sign out</Button>
        </Card>

        <Card>
            <Dialog fullWidth maxWidth="md" open={!!detailPosting} onClose={() => setDetailPosting(null)}>
                <PostingDetailPopUp jobRequest={detailPosting} />
            </Dialog>
            <Typography variant="h6" sx={{ flexGrow: 1, background: "grey" }}>Company Sign-up Requests</Typography>
            {pendingSignUps.length > 0 ?
                <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingSignUps.map((signup) => (
                                <TableRow key={signup.email}>
                                    <TableCell>{signup.name}</TableCell>
                                    <TableCell>{signup.email}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="success" onClick={() => handleApproveSignup(signup.id)}>
                                            Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                : <Typography align="center" sx={{ p: 4, marginX: "auto" }}>No pending sign ups at the moment</Typography>}
        </Card>
        <br />
        <Card>
            <Typography variant="h6" sx={{ flexGrow: 1, background: "grey" }}>Company Posting Requests</Typography>
            {pendingPostings.length > 0 ?
                <TableContainer component={Paper} sx={{ maxHeight: 300, overflowY: "auto" }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Copmany</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Preview Description</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingPostings.map((posting) => (
                                <TableRow key={posting.id}>
                                    <TableCell>{posting.company}</TableCell>
                                    <TableCell>{posting.title}</TableCell>
                                    <TableCell>{posting.previewDescription}</TableCell>
                                    <TableCell>
                                        <Button variant="contained" color="primary" onClick={() => setDetailPosting(posting)}>
                                            View Details
                                        </Button>
                                        <Button onClick={() => handleApproveRejectPosting(true, posting.id)} sx={{ marginX: 2 }} variant="contained" color="success">
                                            Approve
                                        </Button>
                                        <Button onClick={() => handleApproveRejectPosting(false, posting.id)} variant="contained" color="error">
                                            Reject
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                : <Typography align="center" sx={{ p: 4, marginX: "auto" }}>No pending posting requests at the moment</Typography>}
        </Card>
    </div>
}
