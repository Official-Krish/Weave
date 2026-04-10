import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { EditorPage } from "../pages/EditorPage";
import { LandingPage } from "../pages/LandingPage";
import { LiveMeetingPage } from "../pages/LiveMeetingPage";
import { MeetingsPage } from "../pages/MeetingsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProductPage } from "../pages/ProductPage";
import { RecordingDetailPage } from "../pages/RecordingDetailPage";
import { RecordingsPage } from "../pages/RecordingsPage";
import { SignInPage } from "../pages/SignInPage";
import { SignUpPage } from "../pages/SignUpPage";

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
        path: "product",
        element: <ProductPage />,
      },
      {
        path: "meetings",
        element: <MeetingsPage />,
      },
      {
        path: "meetings/live/:meetingId",
        element: <LiveMeetingPage />,
      },
      {
        path: "recordings",
        element: <RecordingsPage />,
      },
      {
        path: "recordings/:recordingId",
        element: <RecordingDetailPage />,
      },
      {
        path: "editor",
        element: <EditorPage />,
      },
      {
        path: "signin",
        element: <SignInPage />,
      },
      {
        path: "signup",
        element: <SignUpPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
