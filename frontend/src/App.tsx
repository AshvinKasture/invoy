import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import { NotificationContainer } from './components/NotificationContainer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Parties from './pages/Parties';
import Items from './pages/Items';
import Invoices from './pages/Invoices';
import Banks from './pages/Banks';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        
        {/* Private Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/parties" element={
          <PrivateRoute>
            <Layout>
              <Parties />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/items" element={
          <PrivateRoute>
            <Layout>
              <Items />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/invoices" element={
          <PrivateRoute>
            <Layout>
              <Invoices />
            </Layout>
          </PrivateRoute>
        } />
        
        <Route path="/banks" element={
          <PrivateRoute>
            <Layout>
              <Banks />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
      
      {/* Global Notification Container */}
      <NotificationContainer />
    </Router>
  );
}

export default App;