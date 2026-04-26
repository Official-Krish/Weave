import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { EditorPage } from "../pages/EditorPage";
import { LandingPage } from "../pages/LandingPage";
import { LiveMeetingPage } from "../pages/LiveMeetingPage";
import { Dashboard } from "../pages/Dashboard";
import { NotFoundPage } from "../pages/NotFoundPage";
import { MeetingSetupPage } from "../pages/MeetingSetupPage";
import { FinalRecordingPage } from "../pages/FinalRecordingPage";
import { SignInPage } from "../pages/SignInPage";
import { SignUpPage } from "../pages/SignUpPage";
import { PublicAuth } from "./PublicAuth";
import { Pricing } from "@/pages/Pricing";
import { BlogPage, ChangelogPage, FeaturesPage, PrivacyPage, SecurityPage, SupportPage, TermsPage } from "@/pages/StaticPages";
import ProfilePage from "@/pages/Profile";
import NotificationsPage from "@/pages/Notification";
import { ScheduleMeetingPage } from "@/pages/ScheduleMeetingPage";
import { AuthCallbackPage } from "@/pages/GoogleAuthCallback";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "meetingSetup",
        element: <MeetingSetupPage />,
      },
      {
        path: "meeting/live/:meetingId",
        element: <LiveMeetingPage />,
      },
      {
        path: "recordings/:recordingId",
        element: <FinalRecordingPage />,
      },
      {
        path: "recordings/:recordingId/final",
        element: <FinalRecordingPage />,
      },
      {
        path: "signin",
        element: <PublicAuth><SignInPage /></PublicAuth>,
      },
      {
        path: "signup",
        element: <PublicAuth><SignUpPage /></PublicAuth>,
      },
      {
        path: "auth/callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "pricing",
        element: <Pricing />,
      },
      {
        path: "features",
        element: <FeaturesPage />,
      },
      {
        path: "security",
        element: <SecurityPage/>,
      },
      {
        path: "changelog",
        element: <ChangelogPage/>,
      },
      {
        path: "privacy",
        element: <PrivacyPage/>,
      },
      {
        path: "terms",
        element: <TermsPage/>,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "support",
        element: <SupportPage/>,
      }, 
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "meeting/schedule",
        element: <ScheduleMeetingPage />,
      },
      {
        path: "edit/:meetingId",
        element: <EditorPage />
      }
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
