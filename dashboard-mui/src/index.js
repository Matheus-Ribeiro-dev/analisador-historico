// src/index.js - VERSÃO DEFINITIVA

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';

// CSS Legacy (vamos continuar com isso que funciona)
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

// Módulos do AG Grid
import { ModuleRegistry } from 'ag-grid-community';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { TextFilterModule } from 'ag-grid-community';
import { NumberFilterModule } from 'ag-grid-community';
import { ValidationModule } from 'ag-grid-community';
import { CsvExportModule } from 'ag-grid-community';


ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  TextFilterModule,
  NumberFilterModule,
  ValidationModule,
   CsvExportModule
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);