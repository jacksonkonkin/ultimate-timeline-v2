import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import SignUp from "./components/auth/SignUp";
import SignIn from "./components/auth/SignIn";
import Dashboard from "./components/auth/Dashboard";
import SimplePrivateRoute from "./components/auth/SimplePrivateRoute";
import PendingApproval from "./components/auth/PendingApproval";
import TradingDashboard from "./components/TradingDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <SignIn />
      }
    ]
  },
  {
    path: "/signin",
    element: <SignIn />
  },
  {
    path: "/signup", 
    element: <SignUp />
  },
  {
    path: "/pending-approval",
    element: (
      <SimplePrivateRoute>
        <PendingApproval />
      </SimplePrivateRoute>
    )
  },
  {
    path: "/dashboard",
    element: (
      <SimplePrivateRoute>
        <Dashboard />
      </SimplePrivateRoute>
    )
  },
  {
    path: "/trading",
    element: (
      <SimplePrivateRoute>
        <TradingDashboard />
      </SimplePrivateRoute>
    )
  }
]);