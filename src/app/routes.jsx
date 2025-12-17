import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout";
import Dashboard from "../pages/Dashboard";
import Deals from "../pages/Deals";
import DealDetail from "../pages/DealDetail";
import Reps from "../pages/Reps";
import Accounts from "../pages/Accounts";
import RepDetail from "../pages/RepDetail";
import AccountDetail from "../pages/AccountDetail";



export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "deals", element: <Deals /> },
      { path: "deals/:id", element: <DealDetail /> },
      { path: "reps", element: <Reps /> },
      { path: "/reps/:id", element: <RepDetail /> },
      { path: "accounts", element: <Accounts /> },
      { path: "/accounts/:id", element: <AccountDetail /> },
    ],
  },
]);
