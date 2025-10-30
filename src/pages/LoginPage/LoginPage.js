import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/apiService';
import Login from '../../components/Login/Login';
import Footer from '../../components/Footer/Footer';
import backgroundImage from '../../assets/images/bg-pricing.jpg';
import logoImage from '../../assets/images/logo_alma_grande.png';

const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
`;

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Llamamos a loginUser (devuelve la respuesta completa de la API)
      const responseData = await loginUser(username, password);
      
      // --- ¡CAMBIO AQUÍ! ---
      // 2. Guardamos la RESPUESTA COMPLETA en localStorage
      //    (loginUser ya la guarda internamente, pero por claridad la guardamos aquí también
      //     asegurándonos de que sea la misma estructura que espera getAccessToken)
      localStorage.setItem('userSession', JSON.stringify(responseData)); 
      
      // (Opcional) Puedes añadir un log para verificar
      // console.log('Login Page: Sesión guardada en localStorage:', responseData);
      // ---------------------

      setMessage('¡Inicio de sesión exitoso!');
      setMessageType('success');
      
      // Redirigimos al dashboard
      navigate('/dashboard'); 

    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageContainer>
        <Login
          handleSubmit={handleSubmit}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          loading={loading}
          message={message}
          messageType={messageType}
          logoSrc={logoImage}
        />
      </PageContainer>
      <Footer />
    </>
  );
};

export default LoginPage;