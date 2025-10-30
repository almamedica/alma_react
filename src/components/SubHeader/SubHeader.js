// src/components/SubHeader/SubHeader.js
import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { NavLink } from 'react-router-dom';
import { MdArrowDropDown } from 'react-icons/md';
import useOnClickOutside from '../../hooks/useOnClickOutside';

const fadeIn = keyframes`
  from { opacity: 0; transform: scaleY(0.9); }
  to { opacity: 1; transform: scaleY(1); }
`;

// --- INICIO DE LA CORRECCIÓN ---
const SubHeaderContainer = styled.nav`
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  height: 50px;
  width: 100%;
  position: fixed; /* <-- Clave: Hacerlo fijo */
  top: 64px;       /* <-- Clave: Posicionarlo debajo del Header principal */
  left: 0;
  z-index: 20;
`;
// --- FIN DE LA CORRECCIÓN ---

const MenuItemGroup = styled.div`
  position: relative;
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  height: 50px;
  padding: 0 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  color: #344767;
  font-weight: 600;
  font-size: 0.9rem;
  font-family: 'Poppins', sans-serif;

  &.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
  }

  &:hover {
    color: var(--primary-color);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-left: auto;
  margin-right: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
  padding: 8px 0;
  min-width: 220px;
  width: max-content;
  z-index: 35;
  animation: ${fadeIn} 0.2s ease-out;
  transform-origin: top center;
`;

const DropdownLink = styled(NavLink)`
  display: block;
  padding: 10px 20px;
  text-decoration: none;
  color: #344767;
  font-size: 0.9rem;

  &:hover { background-color: #f8f9fa; }
  &.active { color: var(--primary-color); font-weight: bold; background-color: #f0f2f5; }
`;

const NavGroup = ({ group }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const isGroupActive = group.items.some(item => window.location.pathname.startsWith(item.path));

  return (
    <MenuItemGroup ref={ref}>
      <MenuButton onClick={() => setIsOpen(!isOpen)} className={isGroupActive ? 'active' : ''}>
        {group.name}
        <MdArrowDropDown size={24} />
      </MenuButton>
      {isOpen && (
        <Dropdown>
          {group.items.map(item => (
            <DropdownLink key={item.name} to={item.path} onClick={() => setIsOpen(false)}>
              {item.name}
            </DropdownLink>
          ))}
        </Dropdown>
      )}
    </MenuItemGroup>
  );
};

const SubHeader = () => {
  const menuGroups = [
    {
      name: 'Agendamiento',
      items: [
        { name: 'Inicio (Datos Paciente)', path: '/agenda' },
        { name: 'Confirmación Paciente', path: '/confirmacion-paciente' },
        { name: 'Horas Anuladas', path: '/horas-anuladas' },
      ],
    },
    {
      name: 'Buscadores',
      items: [
        { name: 'Buscador de Citas', path: '/buscador-citas' },
        { name: 'Buscador de Exámenes', path: '/buscador-examenes' },
        { name: 'Buscador de Llamadas', path: '/buscador-llamadas' },
      ],
    },
     {
      name: 'Informes',
      items: [
        { name: 'Informe Agendamiento', path: '/informe-agendamiento' },
      ],
    },
  ];

  return (
    <SubHeaderContainer>
      {menuGroups.map(group => (
        <NavGroup key={group.name} group={group} />
      ))}
    </SubHeaderContainer>
  );
};

export default SubHeader;