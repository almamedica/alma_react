// src/Footer.js
import React from 'react';
import styled from 'styled-components';

// --- COMPONENTES ESTILIZADOS PARA EL FOOTER ---

const FooterWrapper = styled.footer`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  color: #ecf0f1;
  z-index: 100;
  box-sizing: border-box; /* Previene desbordamiento por padding */
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  max-width: 1200px; /* Limita el ancho en pantallas grandes */
  margin: 0 auto;  /* Centra el contenido */
  
  /* Media query para pantallas más grandes */
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const FooterText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;

  & a {
    color: #3498db;
    text-decoration: none;
    font-weight: bold;
    transition: color 0.3s ease;
  }

  & a:hover {
    color: #2980b9;
    text-decoration: underline;
  }

  & .fa-heart {
    color: #e74c3c;
  }
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 15px 0 0;
  display: flex;
  gap: 15px;

  & a {
    color: #ecf0f1;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  & a:hover {
    color: #bdc3c7;
  }
  
  @media (min-width: 768px) {
    margin: 0;
  }
`;

// --- COMPONENTE REACT DEL FOOTER ---

function Footer() {
  return (
    <FooterWrapper>
      <FooterContent>
        <FooterText>
          Desarrollado con <i className="fas fa-heart"></i> por <a href="https://tuweb.com" target="_blank" rel="noopener noreferrer">Almamedica</a>.
        </FooterText>
        <FooterLinks>
          <li><a href="/privacidad">Privacidad</a></li>
          <li><a href="/terminos">Términos</a></li>
          <li><a href="/contacto">Contacto</a></li>
        </FooterLinks>
      </FooterContent>
    </FooterWrapper>
  );
}

export default Footer;