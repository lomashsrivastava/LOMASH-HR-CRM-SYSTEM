import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Candidates from './pages/Candidates';
import Interviews from './pages/Interviews';
import Employees from './pages/Employees';
import Analytics from './pages/Analytics';
import Sidebar from './components/Sidebar';
import AIHub from './pages/AIHub';

// New Pages
import Assessments from './pages/Assessments';
import TalentPool from './pages/TalentPool';
import Offers from './pages/Offers';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#0f0f1a] text-white">Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-[#0f0f1a] text-white font-sans">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto h-screen custom-scrollbar">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/candidates" element={<Candidates />} />
              <Route path="/interviews" element={<Interviews />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* Advanced Modules */}
              <Route path="/ai-hub" element={<AIHub />} />
              <Route path="/assessments" element={<Assessments />} />
              <Route path="/talent-pool" element={<TalentPool />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
