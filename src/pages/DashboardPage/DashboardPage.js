// src/pages/DashboardPage/DashboardPage.js
import React from 'react';
import styled from 'styled-components';
import Header from '../../components/Header/Header'; // Usa solo el Header principal
import ModuleGrid from '../../components/ModuleGrid/ModuleGrid';
import { modules } from '../../data/modules';

const PageWrapper = styled.div`
  padding-top: 64px;
  background-color: #f4f7f6;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
`;

const DashboardPage = () => {
  return (
    <PageWrapper>
      <Header />
      <MainContent>
        <h2>Módulos del Sistema</h2>
        <ModuleGrid modules={modules} />
      </MainContent>
    </PageWrapper>
  );
};

export default DashboardPage;