// router.tsx
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Profile from './components/Profile';
import Admin from './components/dashboards/Admin';
import Donor from './components/dashboards/Donor';
import Volunteer from './components/dashboards/Volunteer';
import Organization from './components/dashboards/Organization';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardRedirector from './DashBoardRedirector';
import Unauthorized from './components/unauthorized';


export const router = createBrowserRouter([
  { path: '/', element: <App /> },

  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardRedirector />
      </ProtectedRoute>
    ),
  },

  { path: '/admin-dashboard', element: <Admin /> },
  { path: '/donor-profile', element: <Donor /> },
  { path: '/volunteer-tools', element: <Volunteer /> },
  { path: '/organization-panel', element: <Organization /> },

  { path: '/profile', element: <Profile /> },

  { path: '/unauthorized', element: <Unauthorized /> },
]);
