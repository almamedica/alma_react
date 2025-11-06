// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createGlobalStyle } from 'styled-components';

// Importa los componentes y páginas
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage/LoginPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import AgendaPage from './pages/AgendaPage/AgendaPage';
import AccionesPage from './pages/AccionesPage/AccionesPage'; // <-- 1. IMPORTAR
import AgendamientoConsultaPage from './pages/AgendamientoConsultaPage/AgendamientoConsultaPage';
import AgendamientoConfirmacionPage from './pages/AgendamientoConfirmacionPage/AgendamientoConfirmacionPage';

// Estilos globales completos (Sin cambios)
const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #5A67D8;
    --primary-hover: #4C51BF;
    --text-color: #2D3748;
    --card-bg: rgba(255, 255, 255, 0.2);
    --border-color: rgba(255, 255, 255, 0.3);
    --shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --input-placeholder-color: rgba(255, 255, 255, 0.6);
    --input-text-color: #FFFFFF;
  }

  body {
    font-family: 'Poppins', sans-serif;
    color: var(--text-color);
    margin: 0;
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginPage />} />

          {/* Ruta del Dashboard (no usa el MainLayout con sidebar) */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Rutas que usan el MainLayout con la barra lateral */}
          <Route 
            path="/agenda" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AgendaPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* Aquí añadirías las otras rutas que usen el MainLayout, ej: /buscador-citas */}
          <Route 
            path="/acciones/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AccionesPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          {/* ------------------------------------- */}

          {/* --- Añadir la ruta para la página de agendamiento --- */}
          <Route 
            path="/agendamiento/consulta/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AgendamientoConsultaPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />

          {/* 2. Registrar la ruta de confirmación */}
          <Route 
            path="/agendamiento/confirmacion/:id" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AgendamientoConfirmacionPage />
                </MainLayout>
              </ProtectedRoute>
            } 
          />


          {/* Ruta por defecto: redirige a /login */}
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
