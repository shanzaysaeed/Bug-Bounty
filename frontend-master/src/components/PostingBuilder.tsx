import { Autocomplete, Button, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import MarkdownWrapper from "./MarkdownWrapper";
import { useSnackbar } from "./SnackBar";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { getCsrfToken } from "../utils/csrf";

const INITIAL_STATE = {
    title: "",
    detailedDescription: "",
    summary: "",
    responsibleDisclosureUrl: "",
    tags: [] as string[]
};

export default function PostingBuilder() {
    const [form, setForm] = useState({ ...INITIAL_STATE });
    const { id } = useParams();
    const { showSnackbar } = useSnackbar();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPostingForEdit = async () => {
            try {
                const response = await axios.get("/api/requests/get-by-id", {
                    params: {
                        request_id: id
                    }
                });
                const data = response.data.request;
                setForm({
                    detailedDescription: data.detailedDescription,
                    title: data.title,
                    responsibleDisclosureUrl: data.responsibleDisclosureUrl,
                    tags: data.tags,
                    summary: data.previewDescription
                });
            } catch (e: any) {
                showSnackbar(e?.response?.data?.message || "Error fetching data right now. Try again later", "error");
            }
        }
        if (id) {
            fetchPostingForEdit();
        }
    }, [id, showSnackbar]);

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();

        if (!form.title) {
            showSnackbar("Title to a posting is required", "error");
            return;
        } else if (!form.responsibleDisclosureUrl) {
            showSnackbar("Responsible Disclosure URL of a posting is required", "error");
            return;
        } else if (!form.summary) {
            showSnackbar("Summary of a posting is required", "error");
            return;
        } else if (!form.detailedDescription) {
            showSnackbar("Detailed Descriptions to a posting is required", "error");
            return;
        }

        try {
            if (id) {
                // update request posting
                await axios.post("/api/requests/update-request", {
                    request_id: id,
                    title: form.title,
                    summary: form.summary,
                    description: form.detailedDescription,
                    disclosure_policy_url: form.responsibleDisclosureUrl,
                    tags: form.tags,
                    csrf_token: await getCsrfToken(),
                });
                showSnackbar("Posting edited successfully", "success");
            } else {
                // creating request posting
                await axios.post("/api/requests/create-request", {
                    title: form.title,
                    summary: form.summary,
                    description: form.detailedDescription,
                    disclosure_policy_url: form.responsibleDisclosureUrl,
                    tags: form.tags,
                    csrf_token: await getCsrfToken(),
                });
                showSnackbar("Posting created successfully", "success");
            }
            navigate("/org/dashboard/")
            setForm({ ...INITIAL_STATE });
        } catch (e: any) {
            showSnackbar(e?.response?.data?.error || "Error creating. Try again later", "error");
        }
    }

    return <div style={{ padding: 12, paddingTop: "72px" }}>
        <form>
            <TextField
                fullWidth
                variant="standard"
                label="Posting Title"
                required
                size="small"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Give a short descriptive title for your job request posting"
            ></TextField>
            <TextField
                sx={{ textAlign: "left", marginTop: 2, marginBottom: 2 }}
                variant="standard"
                label="Summary"
                required
                size="small"
                value={form.summary}
                type="text"
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Write a short summary on what this posting is about"
                fullWidth
            ></TextField>
            <TextField
                sx={{ textAlign: "left", marginBottom: 2 }}
                variant="standard"
                label="responsible Disclosure URL"
                required
                size="small"
                value={form.responsibleDisclosureUrl}
                type="text"
                onChange={(e) => setForm({ ...form, responsibleDisclosureUrl: e.target.value })}
                placeholder="Enter your company's Responsible Disclosure Site Link Here"
                fullWidth
            ></TextField>
            <Autocomplete
                sx={{ minWidth: 400, marginY: 2 }}
                multiple
                freeSolo
                options={[]} // No predefined options, since it's free text input
                value={form.tags}
                onChange={(_event, newValue) => setForm({ ...form, tags: newValue })}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    // @ts-ignore
                    <TextField {...params} variant="outlined" label="Tags or Keywords" />
                )}
            />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <textarea
                    style={{ resize: "none", width: 500, height: 300 }}
                    placeholder="Enter your detailed description in markdown here, the rendered results will show up to the right"
                    value={form.detailedDescription}
                    required
                    onChange={(e) => setForm({ ...form, detailedDescription: e.target.value })}
                ></textarea>
                <div style={{ flex: 1, marginLeft: 8, border: "1px solid black", overflow: "auto", height: 300 }}>
                    <MarkdownWrapper value={form.detailedDescription}></MarkdownWrapper>
                </div>
            </div>
            <br />
            <Button fullWidth variant="contained" type="submit" onClick={handleSubmit}>{id ? "Edit" : "Create"} Posting</Button>
        </form>
    </div>
}