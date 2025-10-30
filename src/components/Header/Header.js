// src/components/Header/Header.js
import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import useOnClickOutside from '../../hooks/useOnClickOutside';
import logoImage from '../../assets/images/logo_alma_grande.png';
import { MdMenu } from 'react-icons/md';

// --- ESTILOS ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const HeaderContainer = styled.header`
  background-color: #7dd3fc;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 50;
  color: white;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: white;
`;

const ClinicName = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
`;

const UserMenuContainer = styled.div`
  position: relative;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  border-radius: 9999px;
  transition: background-color 0.2s;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  &:hover { background-color: rgba(255, 255, 255, 0.1); }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 48px;
  right: 0;
  background-color: white;
  color: #1f2937;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  padding: 8px 0;
  width: 192px;
  animation: ${fadeIn} 0.2s ease-out;
  z-index: 50;
`;

const UserInfo = styled.div`
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
`;

const LogoutButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;
  color: #1f2937;
  &:hover { background-color: #f3f4f6; }
  svg { color: #ef4444; }
`;

// --- COMPONENTE HEADER ---

const Header = ({ onToggleModuleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const userDropdownRef = useRef(null);
  useOnClickOutside(userDropdownRef, () => setUserMenuOpen(false));

  const clinicName = process.env.REACT_APP_CLINIC_NAME || 'Clínica React';

  useEffect(() => {
    setMounted(true);
    const sessionJSON = localStorage.getItem('userSession');
    if (sessionJSON) {
      setUserSession(JSON.parse(sessionJSON));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userSession');
    navigate('/');
  };
  
  if (!mounted) return null;

  return (
    <HeaderContainer>
      <LeftSection>
        {/* El botón de menú solo se muestra si NO estamos en el dashboard */}
        {location.pathname !== '/dashboard' && (
          <IconButton onClick={onToggleModuleSidebar}>
            <MdMenu size={28} />
          </IconButton>
        )}

        <LogoLink to="/dashboard">
          <img src={logoImage} alt="Logo" style={{ width: '110px', height: '65px' }} />
          <ClinicName>{clinicName}</ClinicName>
        </LogoLink>
      </LeftSection>

      <UserMenuContainer ref={userDropdownRef}>
        <IconButton onClick={() => setUserMenuOpen(!userMenuOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </IconButton>
        
        {userMenuOpen && (
          <DropdownMenu>
            <UserInfo>
              <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                Hola, {userSession?.data?.user_fname || ''} {userSession?.data?.user_lname || ''}
              </p>
            </UserInfo>
            <LogoutButton onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </LogoutButton>
          </DropdownMenu>
        )}
      </UserMenuContainer>
    </HeaderContainer>
  );
};

export default Header;