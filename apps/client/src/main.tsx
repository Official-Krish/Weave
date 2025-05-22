import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import Footer from './components/Footer.tsx';
import Navbar from './components/Navbar.tsx';
import { Provider } from 'react-redux'
import { store } from './utils/store.ts';

createRoot(document.getElementById("root")!).render(
    <>  
        <Provider store={store}>
            <Navbar />
            <App />
            <Footer />
        </Provider>
    </>
);
