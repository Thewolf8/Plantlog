import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from '@/context/ThemeContext';
import { I18nProvider } from '@/i18n/I18nContext';
import BottomNav from '@/components/BottomNav';
import Onboarding from '@/components/Onboarding';
import DashboardPage from '@/pages/DashboardPage';
import PlantDetailPage from '@/pages/PlantDetailPage';
import AddPlantPage from '@/pages/AddPlantPage';
import EditPlantPage from '@/pages/EditPlantPage';
import TimelinePage from '@/pages/TimelinePage';
import ComparisonPage from '@/pages/ComparisonPage';
import TagsPage from '@/pages/TagsPage';
import ExportPage from '@/pages/ExportPage';
import SettingsPage from '@/pages/SettingsPage';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function AnimatedRoutes() {
  const location = useLocation();
  const hideNav = ['/plant/add', '/plant/'].some((p) => location.pathname.startsWith(p) && location.pathname !== '/');
  const showNav = !hideNav && !location.pathname.includes('/compare') && !location.pathname.includes('/edit');

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/plant/add" element={<AddPlantPage />} />
            <Route path="/plant/:id" element={<PlantDetailPage />} />
            <Route path="/plant/:id/edit" element={<EditPlantPage />} />
            <Route path="/plant/:id/compare" element={<ComparisonPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/export" element={<ExportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      {showNav && <BottomNav />}
    </>
  );
}

function App() {
  const [onboardingDone, setOnboardingDone] = useState(() => {
    return localStorage.getItem('plantlog_onboarding') === 'done';
  });

  const handleOnboardingComplete = () => {
    localStorage.setItem('plantlog_onboarding', 'done');
    setOnboardingDone(true);
  };

  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground max-w-lg mx-auto relative">
            {!onboardingDone && <Onboarding onComplete={handleOnboardingComplete} />}
            <AnimatedRoutes />
            <Toaster position="top-center" richColors />
          </div>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;
