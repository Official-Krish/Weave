import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { RootLayout } from "../layouts/RootLayout";
import { EditorPage } from "../pages/EditorPage";
import { LandingPage } from "../pages/LandingPage";
import { MeetingsPage } from "../pages/MeetingsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProductPage } from "../pages/ProductPage";
import { RecordingsPage } from "../pages/RecordingsPage";
import { SignInPage } from "../pages/SignInPage";

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
        path: "recordings",
        element: <RecordingsPage />,
      },
      {
        path: "editor",
        element: <EditorPage />,
      },
      {
        path: "signin",
        element: <SignInPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
