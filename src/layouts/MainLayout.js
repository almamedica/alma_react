// src/layouts/MainLayout.js
import React, { useState } from 'react';
import styled from 'styled-components';

import Header from '../components/Header/Header';
import SubHeader from '../components/SubHeader/SubHeader';
import ModuleSidebar from '../components/ModuleSidebar/ModuleSidebar';

const MainContentContainer = styled.div`
  background-color: #f0f2f5;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  /* Espacio superior para compensar los 2 headers fijos */
  padding-top: 114px; /* 64px del Header + 50px del SubHeader */
`;

const Content = styled.main`
  /* Centra el contenido y le da un ancho máximo */
  max-width: 1200px;
  margin: 0 auto;
  /* Reducimos el padding superior para que todo suba */
  padding: 24px;
`;

const MainLayout = ({ children }) => {
  const [isModuleSidebarOpen, setModuleSidebarOpen] = useState(false);

  const toggleModuleSidebar = () => {
    setModuleSidebarOpen(!isModuleSidebarOpen);
  };

  return (
    <>
      <Header onToggleModuleSidebar={toggleModuleSidebar} />
      <ModuleSidebar 
        isOpen={isModuleSidebarOpen} 
        onClose={() => setModuleSidebarOpen(false)} 
      />
      <SubHeader />

      <MainContentContainer>
        <Content>
          {children}
        </Content>
      </MainContentContainer>
    </>
  );
};

export default MainLayout;