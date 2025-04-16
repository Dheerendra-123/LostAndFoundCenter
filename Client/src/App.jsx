import React, { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet
} from 'react-router-dom';
import Home from './Components/Home';
import Display from './Components/Display';
import Login from './Components/Login';
import Signup from './Components/SignUp';
import ReportLostItemForm from './Components/ItemForm';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BlogPost from './Components/postDisplay';
import Statistics from './Components/Statics';

// Protected route component for authenticated users
const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
};

const AuthRoute = () => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <Outlet />;
};

const App = () => {

  
  const router = createBrowserRouter([
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          element: <Home />,
          children: [
            {
              index: true,
              element: <Display />
            },
            {
              path: 'reportForm',
              element: <ReportLostItemForm />
            },
            {
              path:"/blog-post/:id" ,
              element:<BlogPost />
            }
            ,
            {
              path:"/statics" ,
              element:<Statistics />
            }
          ]
        }
      ]
    },
    {
      element: <AuthRoute />,
      children: [
        {
          path: '/login',
          element: <Login />
        },
        {
          path: '/signup',
          element: <Signup />
        }
      ]
    },
    // Catch-all route for any unmatched routes
    {
      path: '*',
      element: <Navigate to="/" replace />
    }
  ]);

 
  return (
    <>
      <RouterProvider router={router} />
      <ToastContainer />
    </>
  );

};

export default App;