import React from 'react';
import styled from 'styled-components';
// import Breadcrumbs from '../../components/Breadcrumbs/Breadcrumbs'; 
import CapacityForm from '../../components/CapacityForm/CapacityForm';

const PageContainer = styled.div`
  /* Ajusta el padding para dejar espacio al Header (64px) y SubHeader (50px) fijos */
  /*padding-top: calc(64px + 50px + 2rem);  */
  padding-bottom: 2rem;
  padding-left: 2rem;
  padding-right: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  box-sizing: border-box; 
`;

const ContentWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;

  h1 {
    margin: 0;
    color: #344767;
    font-size: 1.25rem;
    font-weight: 600;
  }
`;

const FormContainer = styled.div`
  padding: 2rem;
`;

const CapacidadInstaladaPage = () => {

  // La variable 'breadcrumbPaths' se eliminó porque no se usa.

  return (
    <PageContainer>
      
      {/* La línea de Breadcrumbs se eliminó completamente */}
      
      <ContentWrapper>
        <Header>
          <h1>Crear Capacidad Instalada (Apertura de Agenda)</h1>
        </Header>
        <FormContainer>
          <CapacityForm />
        </FormContainer>
      </ContentWrapper>
    </PageContainer>
  );
};

export default CapacidadInstaladaPage;