import React, { useState, useEffect } from 'react';
// --- 1. IMPORTAR HOOKS ---
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
// --- 2. IMPORTAR API (para recargar) ---
// (Debes crear este endpoint en tu API y apiService.js)
// import { getPatientById } from '../../services/apiService'; 

// --- Estilos (copiados de tu imagen) ---
const Breadcrumb = styled.nav`
  margin: 24px 0;
  font-size: 0.9rem;
  color: #6c757d;
`;

const Title = styled.h2`
  color: #344767;
  font-size: 1.5rem;
  margin-bottom: 24px;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const ActionCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
  overflow: hidden; // Para que el header se ajuste a los bordes
`;

const CardHeader = styled.div`
  padding: 24px;
  color: white;
  /* (Ajusta los colores a los de tu imagen) */
  background: ${props => props.color === 'green' 
    ? 'linear-gradient(195deg, #66BB6A 0%, #43A047 100%)' 
    : 'linear-gradient(195deg, #FFA726 0%, #FB8C00 100%)'};
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
`;

const CardBody = styled.div`
  padding: 24px;
`;

const CardDescription = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  min-height: 40px; // Espacio para la descripción
`;

const Button = styled(Link)`
  display: inline-block;
  text-decoration: none;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 10px 20px;
  border-radius: 0.5rem;
  color: white;
  background-color: ${props => props.color || '#4CAF50'};
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
`;

// --- COMPONENTE ---
const AccionesPage = () => {
  // --- 3. LEER DATOS ---
  const { id } = useParams(); // Lee el ID de la URL
  const location = useLocation(); // Lee el 'state' de navegación
  const navigate = useNavigate();
  
  // El nombre viene del 'state' (rápido)
  const [patientName, setPatientName] = useState(location.state?.patientName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // --- 4. LÓGICA DE RECARGA (F5) ---
    // Si el usuario refresca la página, el 'state' (patientName) se pierde
    if (!patientName) {
      setLoading(true);
      setError('');
      
      const fetchPatientData = async () => {
        try {
          // --- ¡ACCIÓN REQUERIDA! ---
          // Necesitarás un endpoint en tu API: 'GET /patients/id/:id'
          // Y una función en apiService.js: getPatientById(id)
          // const response = await getPatientById(id); 
          // const patient = response.data[0];
          
          // --- Simulación (reemplaza esto con tu llamada a la API) ---
          console.warn(`Simulación: Buscando paciente con ID ${id}. Debes implementar esta API.`);
          // Simulación de una llamada de 1 segundo
          await new Promise(resolve => setTimeout(resolve, 1000));
          const patient = { nombre: 'Paciente (Recargado)' }; // Simulación
          // --- Fin Simulación ---

          setPatientName(patient.nombre);
        } catch (error) {
          console.error("Error al buscar datos del paciente por ID:", error);
          setError('Error al cargar datos del paciente.');
          // Opcional: redirigir si el ID no existe
          // navigate('/agenda');
        } finally {
          setLoading(false);
        }
      };
      
      fetchPatientData();
    }
  }, [id, patientName, navigate]); // Se ejecuta si cambia el ID o si patientName está vacío

  if (loading) return <p>Cargando datos del paciente...</p>;

  // Simple 'ErrorMessage' (puedes usar el tuyo)
  const ErrorMessage = styled.p`
    color: #dc3545;
    font-weight: bold;
    text-align: center;
  `;

  return (
    <div>
      <Breadcrumb>
        Páginas / <strong>Acciones del Paciente</strong>
      </Breadcrumb>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Title>
        {/* Mostramos el nombre (cargado del state o de la API) */}
        Acciones para: {patientName} (ID: {id})
      </Title>

      <CardsContainer>
        {/* Card 1: Consultas Médicas */}
        <ActionCard>
          <CardHeader color="green">
            <CardTitle>Consultas Médicas</CardTitle>
          </CardHeader>
          <CardBody>
            <CardDescription>
              Especialidades de consultas médicas.
            </CardDescription>
            {/* El link debe llevar el ID del paciente */}
            <Button to={`/agendamiento/consulta/${id}`} color="#4CAF50">
              INGRESAR
            </Button>
          </CardBody>
        </ActionCard>

        {/* Card 2: Exámenes Médicos */}
        <ActionCard>
          <CardHeader color="orange">
            <CardTitle>Exámenes Médicos</CardTitle>
          </CardHeader>
          <CardBody>
            <CardDescription>
              Especialidades de exámenes médicos.
            </CardDescription>
            <Button to={`/agendamiento/examen/${id}`} color="#FB8C00">
              INGRESAR
            </Button>
            <Button to={`/agendamiento/multiprestacion/${id}`} color="#FB8C00">
              MULTIPRESTACIÓN
            </Button>
          </CardBody>
        </ActionCard>
      </CardsContainer>
    </div>
  );
};

export default AccionesPage;