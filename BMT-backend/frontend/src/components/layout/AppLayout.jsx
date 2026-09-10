import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { ToastProvider } from '../ui/Toast';
import ErrorBoundary from '../common/ErrorBoundary';
import SupportChatbot from '../common/SupportChatbot';

export default function AppLayout() {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 pt-20">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <Footer />
        <SupportChatbot />
      </div>
    </ToastProvider>
  );
}
