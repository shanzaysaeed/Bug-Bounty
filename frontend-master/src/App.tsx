import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import NotFound from "./pages/NotFound";
import UserSignUpLogin from "./pages/UserSignUpLogin";
import OrgSignUpLogin from "./pages/OrgSignUpLogin";
import UDLayout from "./components/user-dashboard/UDLayout";
import PendingSignUp from "./pages/PendingSignUp";
import OrgDashboard from "./pages/OrgDashboard";
import UDOpportunitiesList from "./components/user-dashboard/UDOpportunitiesList";
import UDOpportunityDetail from "./components/user-dashboard/UDOpportunityDetail";
import UDInboxDisclosureList from "./components/user-dashboard/UDInboxDisclosureList";
import UDInboxDisclosureThread from "./components/user-dashboard/UDInboxDisclosureThread";
import UDSettings from "./components/user-dashboard/UDSettings";
import { SnackbarProvider } from "./components/SnackBar";
import OrgPostingList from "./components/OrgPostingList";
import PostingBuilder from "./components/PostingBuilder";
import UserSubmissions from "./components/UserSubmissions";
import { UserInfoProvider } from "./utils/Context";
import AxiosInterceptorSetup from "./utils/AxiosInterceptor";
import AdminDashBoard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <SnackbarProvider>
      <AxiosInterceptorSetup />
      <UserInfoProvider>
        <Routes>
          {/* 
            for all users pages, prepend with /user
            for all company pages, prepend with /org
          */}
          <Route path="/" element={<UserSignUpLogin />} />
          <Route path="/user" element={<UserSignUpLogin />} />

        {/* User dashboard routes */}
        <Route path="/user/dashboard" element={<UDLayout />}>
          <Route index element={<Navigate to="opportunities" replace />} />
          <Route path="opportunities" element={<UDOpportunitiesList />} />
          <Route
            path="opportunities/:opportunityId"
            element={<UDOpportunityDetail />}
          />
         <Route path="inbox" element={<UDInboxDisclosureList />} />
         <Route path="inbox/:disclosureId" element={<UDInboxDisclosureThread />} />
          <Route path="settings" element={<UDSettings />} />
        </Route>

          <Route path="/org" element={<OrgSignUpLogin />} />
          <Route path="/org/dashboard" element={<OrgDashboard />}>
            <Route index element={<Navigate to="/org/dashboard/overview" replace />}></Route>
            <Route path="overview" element={<OrgPostingList />}></Route>
            <Route path="create-edit/:id?" element={<PostingBuilder />}></Route>
            <Route path="submissions" element={<UserSubmissions />}></Route>
          </Route>
          <Route path="/org/pending" element={<PendingSignUp />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/admin" element={<AdminLogin />}></Route>
          <Route path="/admin/dashboard" element={<AdminDashBoard />}></Route>
        </Routes>
      </UserInfoProvider>
    </SnackbarProvider>
  );
}

export default App;
