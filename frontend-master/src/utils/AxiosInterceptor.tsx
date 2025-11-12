import { useEffect } from "react";
import axios from "axios";
import { useUserInfoContext } from "./Context";
import { useLocation, useNavigate } from "react-router-dom";

const AxiosInterceptorSetup = () => {
    const meData = useUserInfoContext();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.request.responseURL.endsWith("/me")) {
                    return Promise.reject(error);
                }

                if ([400, 401, 403].includes(error.response?.status) && (error.response?.data?.message === "Unauthorized" || ["Invalid session", "Invalid permission"].includes(error.response?.data?.error))) {
                    if (location.pathname.startsWith("/admin")) {
                        navigate("/admin?noSession=1");
                    } else if (location.pathname.startsWith("/org")) {
                        navigate("/org?noSession=1");
                    } else {
                        navigate("/?noSession=1");
                    }
                    return new Promise(() => { });
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor); // Cleanup on unmount
        };
    }, [meData]);

    return null; // This component does not render anything
};

export default AxiosInterceptorSetup;