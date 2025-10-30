// src/data/modules.js
import React from 'react';
import { 
  FiCalendar, 
  FiHeart, 
  FiArchive, 
  FiBriefcase, 
  FiTrendingUp, 
  FiSettings 
} from 'react-icons/fi';

// Ahora, en lugar de SVG, simplemente usamos los componentes importados.
export const modules = [
  { 
    name: 'Agenda', 
    color: '#0284c7', 
    href: '/agenda', 
    icon: <FiCalendar /> 
  },
  { 
    name: 'EMR', 
    color: '#0891b2', 
    href: '/emr', 
    icon: <FiHeart /> 
  },
  { 
    name: 'Caja', 
    color: '#16a34a', 
    href: '/caja', 
    icon: <FiArchive /> 
  },
  { 
    name: 'Administración', 
    color: '#047857', 
    href: '/administracion', 
    icon: <FiBriefcase /> 
  },
  { 
    name: 'Marketing', 
    color: '#f59e0b', 
    href: '/marketing', 
    icon: <FiTrendingUp /> 
  },
  { 
    name: 'Configuración', 
    color: '#475569', 
    href: '/configuracion', 
    icon: <FiSettings /> 
  },
];