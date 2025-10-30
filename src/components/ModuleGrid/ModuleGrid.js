// src/components/ModuleGrid/ModuleGrid.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const GridContainer = styled.div`
  display: grid;
  gap: 25px;
  width: 100%;
  max-width: 900px; /* Ajustado para que 3 columnas se vean bien */

  /* * 1. DEFAULT (Móviles): 1 columna 
   * (Usamos minmax para que ocupe todo el ancho pero tenga un min.)
  */
  grid-template-columns: 1fr;
  
  /* * 2. TABLETS: 2 columnas 
   * (Puedes ajustar el 600px al breakpoint que prefieras)
  */
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  /* * 3. DESKTOP: 3 columnas 
   * (Puedes ajustar el 900px)
  */
  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ModuleCard = styled.div`
  background-color: ${props => props.$bgColor || 'var(--primary-color)'};
  color: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 140px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
  }

  .icon svg {
    stroke: white;
    stroke-width: 1.5;
    fill: none;
    width: 60px;
    height: 60px;
  }
`;

const ModuleName = styled.h3`
  margin: 10px 0 0 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

// ... el resto de tu componente ModuleGrid sigue igual ...

const ModuleGrid = ({ modules }) => {
  const navigate = useNavigate();

  const handleModuleClick = (href) => {
    navigate(href);
  };

  return (
    <GridContainer>
      {modules.map((module) => (
        <ModuleCard 
          key={module.name} 
          $bgColor={module.color}
          onClick={() => handleModuleClick(module.href)}
          title={module.tooltip}
        >
          <div className="icon">
            {module.icon}
          </div>
          <ModuleName>{module.name}</ModuleName>
        </ModuleCard>
      ))}
    </GridContainer>
  );
};

export default ModuleGrid;