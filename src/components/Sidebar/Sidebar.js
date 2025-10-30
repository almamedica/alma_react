// src/components/Sidebar/Sidebar.js
import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { MdTableView, MdManageSearch, MdMedicalInformation, MdSummarize, MdCalendarMonth, MdFreeCancellation, MdPhoneIphone } from 'react-icons/md';

const SidebarContainer = styled.aside`
  background-image: linear-gradient(195deg, #42424a 0%, #191919 100%);
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 20;
  transform: translateX(${props => props.isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease-in-out;
  color: white;
  padding: 20px 10px;
  display: flex;
  flex-direction: column;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 24px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  text-decoration: none;
  color: white;
  border-radius: 0.375rem;
  transition: background-color 0.2s;

  &.active {
    background-image: linear-gradient(195deg, #49a3f1 0%, #1A73E8 100%);
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
  }

  &:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
`;

const LinkText = styled.span`
  font-weight: 500;
`;

const menuItems = [
  { name: 'Inicio', path: '/agenda', icon: <MdTableView size={20} /> },
  { name: 'Buscador de Citas', path: '/buscador-citas', icon: <MdManageSearch size={20} /> },
  { name: 'Buscador de Exámenes', path: '/buscador-examenes', icon: <MdMedicalInformation size={20} /> },
  { name: 'Informe Agendamiento', path: '/informe-agendamiento', icon: <MdSummarize size={20} /> },
  { name: 'Confirmación Paciente', path: '/confirmacion-paciente', icon: <MdCalendarMonth size={20} /> },
  { name: 'Horas Anuladas', path: '/horas-anuladas', icon: <MdFreeCancellation size={20} /> },
  { name: 'Buscador Llamadas', path: '/buscador-llamadas', icon: <MdPhoneIphone size={20} /> },
];

const Sidebar = ({ isOpen }) => {
  return (
    <SidebarContainer isOpen={isOpen}>
      {/* Aquí podrías añadir el header del sidebar si lo necesitas */}
      <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <NavList>
        {menuItems.map(item => (
          <li key={item.name}>
            <StyledNavLink to={item.path}>
              <IconWrapper>{item.icon}</IconWrapper>
              <LinkText>{item.name}</LinkText>
            </StyledNavLink>
          </li>
        ))}
      </NavList>
    </SidebarContainer>
  );
};

export default Sidebar;