import axios from "axios";

export async function getCsrfToken() {
    const response = await axios.get("/api/users/get-csrf");
    if (!response.data.csrf_token) {
        throw {
            response: {
                data: {
                    error: "Cannot obtain CSRF token"
                }
            }
        }
    }
    return response.data.csrf_token;
}
