import { Avatar, Box, Button, Card, CardActionArea, Chip, Drawer, Paper, Tooltip, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MarkdownWrapper from "./MarkdownWrapper";
import axios from "axios";
import { useSnackbar } from "./SnackBar";
import { useUserInfoContext } from "../utils/Context";
import { getCsrfToken } from "../utils/csrf";

type Report = {
    commentCount: number,
    content: string,
    id: number,
    jobRequestTitle: string,
    logo: string,
    status: "submitted" | "rejected" | "accepted",
    unread: true,
    user: string
};

type Comment = {
    message: string,
    senderName: string,
    timestamp: string
}

type Props = {
    report: Report,
    refetch: () => void,
}

function SubmissionChat(props: Props) {
    const { report, refetch } = props;
    const meData = useUserInfoContext();
    const [reportStatus, setReportStatus] = useState<Report["status"]>("submitted");
    const { showSnackbar } = useSnackbar();
    const [comments, setComments] = useState<Comment[]>([]);
    const [message, setMessage] = useState("");
    const chatRef = useRef<HTMLDivElement | null>(null);

    const getDetailedReport = async () => {
        try {
            const response = await axios.get("/api/reports/get-by-id", {
                params: {
                    report_id: report.id
                }
            });
            setComments(response.data.report.comments);
            setReportStatus(response.data.report.status);
            refetch();
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error getting data . Try again later", "error");
        }
    }

    useEffect(() => {
        getDetailedReport();
    }, [report]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [comments]);

    const sendMessage = async () => {
        try {
            await axios.post("/api/reports/comment", {
                report_id: report.id,
                content: message,
                csrf_token: await getCsrfToken(),
            });
            setMessage("");
            getDetailedReport();
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error sending message. Try again later", "error");
        }
    }

    const evaluateReport = async (approve: boolean) => {
        try {
            if (approve) {
                await axios.post('/api/reports/accept-report', {
                    report_id: report.id,
                    csrf_token: await getCsrfToken(),
                });
                showSnackbar("Report Accepted", "success");
            } else {
                await axios.post('/api/reports/reject-report', {
                    report_id: report.id,
                    csrf_token: await getCsrfToken(),
                });
                showSnackbar("Report Rejected", "success");
            }
            refetch();
            getDetailedReport();
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error fetching postings right now. Try again later", "error");
        }
    }

    return <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ flexGrow: 1, padding: "64px 0 16px", overflowY: "auto" }} ref={chatRef}>
            <div style={{ padding: 8 }}>
                <MarkdownWrapper value={report.content} />
            </div>
            <Typography align="center" sx={{ p: 4 }}>Below are the chat history with {report.user}</Typography>
            <hr />
            {
                comments.map(comment => {
                    return <div style={{ display: "flex", flexDirection: comment.senderName === meData.name ? "row-reverse" : "row", padding: "16px" }}>
                        <div style={{ padding: "0 16px" }}>
                            <Tooltip title={comment.senderName}>
                                <Avatar
                                    src={comment.senderName === meData.name ? (meData.metadata.logo_url || "") : ""}
                                    alt={comment.senderName === meData.name ? meData.name : ""}
                                />
                            </Tooltip>
                        </div>
                        <div>
                            <Paper sx={{ flexGrow: 1, overflow: "auto", maxWidth: 600 }} elevation={2}>
                                <Tooltip title={comment.timestamp}>
                                    <div style={{ padding: 8 }}>
                                        <MarkdownWrapper value={comment.message} />
                                    </div>
                                </Tooltip>
                            </Paper>
                        </div>
                        <div style={{ width: "100px" }}></div>
                    </div>
                })
            }
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <textarea
                style={{ resize: "none", width: 500, height: 200 }}
                placeholder="Enter your message here, you can use Markdown and the results are rendered to the right"
                value={message}
                required
                onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            <div style={{ flex: 1, border: "1px solid black", overflow: "auto", height: "200px" }}>
                <MarkdownWrapper value={message}></MarkdownWrapper>
            </div>
        </div>
        <div style={{ display: "flex" }}>
            <Button onClick={sendMessage} variant="contained" sx={{ borderRadius: 0, flexGrow: 1 }}>Send Message</Button>
            <Button onClick={() => evaluateReport(true)} disabled={reportStatus !== 'submitted'} variant="contained" sx={{ borderRadius: 0 }} color="success">Approve</Button>
            <Button onClick={() => evaluateReport(false)} disabled={reportStatus !== 'submitted'} variant="contained" sx={{ borderRadius: 0 }} color="error">Reject</Button>
        </div>
    </div>;
}

export default function UserSubmissions() {
    const [currentReport, setCurrentReport] = useState<null | Report>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const { showSnackbar } = useSnackbar();

    async function getReports() {
        try {
            const response = await axios.get("/api/reports/get-all");
            setReports(response.data.reports.sort((a: Report, b: Report) => a.id - b.id));
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error getting data. Try again later", "error");
        }
    }
    useEffect(() => {
        getReports();
    }, []);

    return <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Sidebar Drawer */}
        <Drawer
            variant="permanent"
            sx={{
                width: 400,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { width: 400, marginTop: "64px" }, // Ensure it aligns with AppBar height
            }}
        >
            {reports.map(report => (
                <Card key={report.id} elevation={0}>
                    <CardActionArea
                        sx={{ border: "1px solid lightgrey", borderRadius: 0, padding: 2 }}
                        onClick={() => setCurrentReport(report)}
                    >
                        <Typography>{report.jobRequestTitle} (By: {report.user})</Typography>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Chip color={report.status === "accepted" ? "success" : (report.status === "rejected" ? "error" : "info")} label={report.status.toUpperCase()} size="small" />
                            {
                                report.unread && <Chip color="error" label={"UNREAD"} size="small"></Chip>
                            }
                        </div>
                    </CardActionArea>
                </Card>
            ))}
        </Drawer>

        {/* Main Content */}
        <Box
            component="main"
            sx={{ flexGrow: 1 }} // Push content to the right
        >
            {currentReport ? (
                <SubmissionChat report={currentReport} refetch={getReports} />
            ) : (
                <>
                    <div style={{ height: "64px" }}></div>
                    <div style={{ margin: 24 }}>Click on a record on the left to see the report</div>
                </>
            )}
        </Box>
    </Box>
}
