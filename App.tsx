import React from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DetailPage from './pages/DetailPage';
import BackToTopButton from './components/BackToTopButton';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import SettingsPage from './pages/admin/SettingsPage';
import ContentListPage from './pages/admin/ContentListPage';
import { MOCK_DATA } from './constants';
import { ItemType } from './types';
import SeriesEditPage from './pages/admin/SeriesEditPage';
import AdManagementPage from './pages/admin/AdManagementPage';
import MovieEditPage from './pages/admin/MovieEditPage';
import TmdbImporterPage from './pages/admin/TmdbImporterPage';
import DirectLinkAdHandler from './components/DirectLinkAdHandler';
import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/admin/ProtectedRoute';
import SecuritySettingsPage from './pages/admin/SecuritySettingsPage';

// Layout for the user-facing website
const MainLayout: React.FC = () => (
  <div className="min-h-screen flex flex-col">
    <DirectLinkAdHandler />
    <Header />
    <main className="flex-grow">
      <Outlet /> {/* Child routes will render here */}
    </main>
    <Footer />
    <BackToTopButton />
  </div>
);


const App: React.FC = () => {
  const movies = MOCK_DATA.filter(item => item.type === ItemType.Movie);
  const series = MOCK_DATA.filter(item => item.type === ItemType.Series);
  const anime = MOCK_DATA.filter(item => item.type === ItemType.Anime);
  const kdrama = MOCK_DATA.filter(item => item.type === ItemType.Kdrama);

  return (
    <HashRouter>
      <Routes>
        {/* User-facing website routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="item/:slug" element={<DetailPage />} />
        </Route>

        {/* Admin Login Route (Public) */}
        <Route path="/admin/login" element={<LoginPage />} />
        
        {/* Protected Admin Panel routes */}
        <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="movies" element={<ContentListPage title="Movies" items={movies} />} />
              <Route path="movies/edit/:id" element={<MovieEditPage />} />
              <Route path="series" element={<ContentListPage title="Series" items={series} />} />
              <Route path="series/edit/:id" element={<SeriesEditPage />} />
              <Route path="anime" element={<ContentListPage title="Anime" items={anime} />} />
              <Route path="kdrama" element={<ContentListPage title="K-Drama" items={kdrama} />} />
              <Route path="import" element={<TmdbImporterPage />} />
              <Route path="ads" element={<AdManagementPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/security" element={<SecuritySettingsPage />} />
            </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;