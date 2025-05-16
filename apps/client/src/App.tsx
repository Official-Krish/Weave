import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Test from "./components/test";
import SignIn from "./pages/Signin";
import SignUp from "./pages/Signup";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
        <Route path="*" element={<NotFound />} />
        <Route path="/test" element={<Test />} /> 
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
