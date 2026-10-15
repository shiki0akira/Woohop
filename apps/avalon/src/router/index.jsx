import React from 'react';
import { Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Game from '../pages/Game';
import Rules from '../pages/Rules';

export function getAppRoutes(lang) {
  return [
    { path: '/', element: <Home /> },
    { path: 'game', element: <Game /> },
    { path: 'rules', element: <Rules /> },
    { path: '*', element: <Navigate to={`/${lang}`} replace /> },
  ];
}
