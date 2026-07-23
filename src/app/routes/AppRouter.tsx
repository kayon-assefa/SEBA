import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import MainLayout from "../../shared/layouts/MainLayout";

import ProtectedRoute from "../../features/auth/components/ProtectedRoute";

import Home from "../../features/Home/pages/Home";
import Login from "../../features/auth/pages/Login";
import Register from "../../features/auth/pages/Register";

import Dashboard from "../../features/Dashboard/pages/Dashboard";
import Businesses from "../../features/businesses/pages/Businesses";
import Categories from "../../features/Categories/pages/Categories";

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/businesses",
        element: <Businesses />,
      },
      {
        path: "/categories",
        element: <Categories />,
      },
    ],
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/register",
    element: <Register />,
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  {
    path: "*",
    element: <h1>404 - Page Not Found</h1>,
  },
]);

function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;