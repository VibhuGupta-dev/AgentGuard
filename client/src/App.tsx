import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import PromptInput from './pages/PromptInput';
import ScenarioSelection from './pages/ScenarioSelection';
import LiveExecution from './pages/LiveExecution';
import TraceDetail from './pages/TraceDetail';
import Scorecard from './pages/Scorecard';
import Compare from './pages/Compare';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = localStorage.getItem('user');
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/auth" element={<Auth />} />

        {/* Protected — wrapped in Layout (sidebar + tabs) */}
        <Route
          path="/*"
          element={
            <RequireAuth>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/thread/new" element={<PromptInput />} />
                  <Route path="/thread/:id/setup" element={<PromptInput />} />
                  <Route path="/thread/:id/run/:runId/scenarios" element={<ScenarioSelection />} />
                  <Route path="/thread/:id/run/:runId/execute" element={<LiveExecution />} />
                  <Route path="/thread/:id/run/:runId/trace/:scenarioId" element={<TraceDetail />} />
                  <Route path="/thread/:id/run/:runId/scorecard" element={<Scorecard />} />
                  <Route path="/thread/:id/compare" element={<Compare />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
