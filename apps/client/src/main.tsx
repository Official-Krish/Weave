import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Footer from './components/Footer.tsx';
import Navbar from './components/Navbar.tsx';

createRoot(document.getElementById("root")!).render(
    <>  
        <Navbar />
        <App />
        <Footer />
    </>
);
