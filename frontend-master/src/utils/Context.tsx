import { JSX } from "@emotion/react/jsx-runtime";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type MeType = {
    auth_stage: "password" | "pending_mfa" | "mfa_verified" | "email_verified",
    email: string,
    name: string,
    role: "organization" | "researcher" | "admin",
    metadata: {
        approved: boolean,
        logo_url?: string
    }
}

const DEFAULT = {
    auth_stage: "password",
    email: "",
    name: "",
    role: "researcher",
    metadata: {
        approved: false,
    }
} satisfies MeType;

// Create the context
const MyContext = createContext<MeType>(DEFAULT);

// this is the context provider for the current logged in user
export const UserInfoProvider = ({ children }: { children: JSX.Element }) => {
    const [value, setValue] = useState<MeType>(DEFAULT);
    const location = useLocation(); // Get the current route info
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMe() {
            // do not fetch on signup/signin pages
            if (["/", "/org", "/user", "/admin"].includes(location.pathname)) {
                return;
            }

            const response = await axios.get("/api/users/me");
            setValue(response.data);

            if (response.data?.role !== "organization") {
                return;
            }

            if (!location.pathname.includes("/org/pending") && !response.data?.metadata?.approved) {
                navigate("/org/pending");
            }
            if (location.pathname.includes("/org/pending") && response.data?.metadata?.approved) {
                navigate("/org/dashboard");
            }
        }

        fetchMe();
    }, [location]);

    return (
        <MyContext.Provider value={value}>
            {children}
        </MyContext.Provider>
    );
};

// Custom hook to use the context
export const useUserInfoContext = () => {
    return useContext(MyContext);
};
