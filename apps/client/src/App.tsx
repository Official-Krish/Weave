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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meeting/create" element={<CreateMeeting />} />
        <Route path="/meeting/join" element={<JoinMeeting />} />
        <Route path="/recording/:id" element={<MeetingDetail/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
