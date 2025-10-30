// src/components/ModuleSidebar/ModuleSidebar.js
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { modules } from '../../data/modules';
import { FiX } from 'react-icons/fi'; // Icono de cerrar

// -------------------- Estilos --------------------
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 99;
  opacity: ${props => props.$isOpen ? '1' : '0'};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease-in-out, visibility 0.3s;
`;

const SidebarContainer = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: linear-gradient(180deg, #ffffff, #f8f9fa);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  z-index: 100;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
  color: #495057;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #495057;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 50%;
  transition: color 0.2s, background-color 0.2s;

  &:hover {
    color: #c92a2a;
    background-color: #f8f9fa;
  }
`;

const ModuleList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
`;

const ModuleLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
  transition: all 0.25s ease;

  .icon {
    margin-right: 16px;
    display: flex;
    align-items: center;
    color: #adb5bd;
    transition: transform 0.2s ease, color 0.25s ease;
    font-size: 1.5rem; /* 24px */
  }

  &:hover {
    background-color: #e9ecef;
    transform: scale(1.03);
  }

  &.active {
    background: linear-gradient(90deg, #5a67d8, #4c51bf);
    color: #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);

    .icon {
      color: #fff;
      transform: scale(1.1);
    }
  }
`;

// -------------------- Componente --------------------
const ModuleSidebar = ({ isOpen, onClose }) => {
  // Efecto para cerrar el menú con la tecla ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <>
      <Backdrop $isOpen={isOpen} onClick={onClose} />
      <SidebarContainer $isOpen={isOpen}>
        <TitleWrapper>
          <Title>Módulos</Title>
          <CloseButton onClick={onClose} aria-label="Cerrar menú">
            <FiX />
          </CloseButton>
        </TitleWrapper>

        <ModuleList>
          {modules.map(module => (
            <li key={module.name}>
              <ModuleLink to={module.href} onClick={onClose}>
                <div className="icon">{module.icon}</div>
                <span>{module.name}</span>
              </ModuleLink>
            </li>
          ))}
        </ModuleList>
      </SidebarContainer>
    </>
  );
};

export default ModuleSidebar;