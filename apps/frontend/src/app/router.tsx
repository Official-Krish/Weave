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
        path: "editor",
        element: <EditorPage />,
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
        path: "pricing",
        element: <Pricing />,
      }
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
