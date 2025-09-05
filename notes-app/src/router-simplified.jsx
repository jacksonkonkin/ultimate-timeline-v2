import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import LoginForm from "./components/auth/LoginForm";
import SignupForm from "./components/auth/SignupForm";
import TradingDashboard from "./components/TradingDashboard";
import PrivateRoute from "./components/auth/PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <LoginForm />
      },
      {
        path: "signin",
        element: <LoginForm />
      },
      {
        path: "signup",
        element: <SignupForm />
      },
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <TradingDashboard />
          </PrivateRoute>
        )
      },
      {
        path: "trading",
        element: (
          <PrivateRoute>
            <TradingDashboard />
          </PrivateRoute>
        )
      }
    ]
  }
]);