import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

// 💅 ESTILOS CORREGIDOS
const NavContainer = styled.nav`
  background-color: white;
  padding: 0 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 16px;
  border-top: 1px solid #e9ecef;
  
  /* --- CAMBIOS PARA RESPONSIVE --- */
  overflow-x: auto; /* Permite scroll horizontal en móvil */
  white-space: nowrap; /* Evita que los ítems salten de línea */
  
  /* Ocultar la barra de scroll (opcional pero elegante) */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;  /* IE y Edge */
  scrollbar-width: none;  /* Firefox */
  /* ------------------------------ */

  /* ❌ ELIMINADO: margin-top: 64px; */
`;

const StyledNavLink = styled(NavLink)`
  padding: 16px 8px;
  text-decoration: none;
  color: #6c757d;
  font-weight: 600;
  font-size: 0.9rem;
  border-bottom: 3px solid transparent;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0; /* Evita que los ítems se encojan */

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  &:hover {
    color: var(--primary-color);
  }
`;

const HorizontalNav = () => {
  const menuItems = [
    { name: 'Inicio', path: '/agenda' },
    { name: 'Buscador de Citas', path: '/buscador-citas' },
    { name: 'Buscador de Exámenes', path: '/buscador-examenes' },
    // Agrega aquí los demás ítems del menú
  ];

  return (
    <NavContainer>
      {menuItems.map(item => (
        <StyledNavLink key={item.name} to={item.path}>
          {item.name}
        </StyledNavLink>
      ))}
    </NavContainer>
  );
};

export default HorizontalNav;