// src/components/Login/Login.js
import React from 'react';
// Importamos los componentes de estilo desde nuestro archivo local
import { LoginContainer, Logo, Title, FormGroup, Label, InputWrapper, Icon, Input, LoginButton, Message } from './styles';

// Este componente recibe todo como props, no tiene lógica propia.
const Login = ({
  handleSubmit,
  username,
  setUsername,
  password,
  setPassword,
  loading,
  message,
  messageType,
  logoSrc
}) => {
  return (
    <LoginContainer>
      <Title>Bienvenido</Title>
      <Logo src={logoSrc} alt="Logo de la empresa" />
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">Usuario</Label>
          <InputWrapper>
            <Icon className="fas fa-user" />
            <Input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Introduce tu usuario"
              required
            />
          </InputWrapper>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">Contraseña</Label>
          <InputWrapper>
            <Icon className="fas fa-lock" />
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce tu contraseña"
              required
            />
          </InputWrapper>
        </FormGroup>
        <LoginButton type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </LoginButton>
      </form>
      <Message className={messageType}>{message}</Message>
    </LoginContainer>
  );
};

export default Login;