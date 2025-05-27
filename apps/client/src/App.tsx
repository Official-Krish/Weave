import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Dashboard from "./pages/Dashboard";
import JoinMeeting from "./pages/JoinMeeting";
import { CreateMeeting } from "./pages/CreateMeeting";
import MeetingDetail from "./pages/MeetingDetail";
import ProtectedRoute from "./utils/ProtectedRoute";

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster/>
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/meeting/create" element={
          <ProtectedRoute>
            <CreateMeeting />
          </ProtectedRoute>
        } />
        <Route path="/meeting/join" element={
          <ProtectedRoute>
            <JoinMeeting />
          </ProtectedRoute>
        } />
        <Route path="/recording/:id" element={
          <ProtectedRoute>
            <MeetingDetail/>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
