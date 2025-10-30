// src/components/Login/styles.js
import styled from 'styled-components';

export const LoginContainer = styled.div`
  background-color: var(--card-bg);
  backdrop-filter: blur(10px);
  padding: 40px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  width: 90%;
  max-width: 420px;
  text-align: center;
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 1;

  &:hover {
    transform: translateY(-5px);
  }
`;

export const Logo = styled.img`
  max-width: 150px;
  height: auto;
  margin-bottom: 25px;
`;

export const Title = styled.h2`
  margin-bottom: 20px;
  font-size: 2rem;
  font-weight: 600;
  color: #FFFFFF;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
  text-align: left;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #FFFFFF;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const Icon = styled.i`
  position: absolute;
  left: 15px;
  color: #2D3748;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 12px 12px 40px; /* Padding izquierdo para el ícono */
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--input-text-color);

  &:focus {
    outline: none;
    border-color: #FFFFFF;
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
  }

  &::placeholder {
    color: var(--input-placeholder-color);
  }
`;

export const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;

  &:disabled {
    background-color: #A0AEC0;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

export const Message = styled.div`
  margin-top: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  min-height: 20px;
  color: #FFFFFF;

  &.success {
    color: #48BB78;
  }
  
  &.error {
    color: #FC8181;
  }
`;