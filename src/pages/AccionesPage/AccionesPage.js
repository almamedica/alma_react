import React, { useState, useEffect } from 'react';
// --- 1. IMPORTAR HOOKS ---
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
// --- 2. IMPORTAR API ---
import { getPatientById } from '../../services/apiService'; 

// --- Estilos (sin cambios) ---
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
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 24px;
  color: white;
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
  min-height: 40px;
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

const ErrorMessage = styled.p`
  color: #dc3545;
  font-weight: bold;
  text-align: center;
`;
// --- FIN Estilos ---


// --- COMPONENTE ---
const AccionesPage = () => {
  // --- 3. LEER DATOS ---
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate(); // (Se mantiene por si se usa en 'catch')
  
  // --- ✨ LÓGICA DE ESTADO REFACTORIZADA ---
  
  // 1. (Temporal) Nombre pasado desde la navegación (ej: "Anton")
  // Esto es una variable normal, no un estado.
  const tempName = location.state?.patientName || '';
  
  // 2. (Fuente de Verdad) Datos completos del paciente desde la API.
  const [patientData, setPatientData] = useState(null); 
  
  // 3. Estados de Carga
  const [loading, setLoading] = useState(true); // Inicia en true para el fetch inicial
  const [error, setError] = useState('');

  useEffect(() => {
    // --- 4. LÓGICA DE CARGA LIMPIA ---
    // Este efecto SÓLO depende de 'id'. Si el id cambia, busca al paciente.
    
    setLoading(true); // Inicia la carga
    setError('');
    
    const fetchPatientData = async () => {
      try {
        const response = await getPatientById(id); 
        
        let data = response.data;
        if (Array.isArray(data)) {
          data = data[0]; // Tomamos el primer resultado si es un array
        }

        if (data) {
          setPatientData(data); // Guardamos el objeto completo
        } else {
          setError('Error: Paciente no encontrado.');
          console.error("Respuesta de API vacía o sin 'data'", response);
        }

      } catch (error) {
        console.error("Error al buscar datos del paciente por ID:", error);
        setError('Error al cargar datos del paciente.');
        // Opcional: si el error es 404, redirigir
        // if (error.status === 404) navigate('/agenda');
      } finally {
        setLoading(false); // Termina la carga
      }
    };
    
    fetchPatientData();

  // --- ✨ DEPENDENCIAS CORRECTAS (¡SIN WARNING!) ---
  // El 'useEffect' SÓLO depende de 'id'.
  // 'navigate' se incluye por la regla de 'eslint', pero es estable.
  }, [id, navigate]); 

  
  // --- ✨ LÓGICA DE DISPLAY (RENDERIZADO) ---

  // 1. Construir el nombre a mostrar
  let displayName = '';
  
  if (patientData) {
    // Caso 1: Ya tenemos los datos de la API (la "fuente de la verdad")
    // (Ajusta las propiedades si tu API las llama diferente)
    const nombre = patientData.nombre || '';
    const apePaterno = patientData.paterno || '';
    const apeMaterno = patientData.materno || ''; // (Ajusta esto si es materno)
    
    displayName = `${nombre} ${apePaterno} ${apeMaterno}`.replace(/\s+/g, ' ').trim();
  
  } else if (tempName) {
    // Caso 2: Aún no hay API, pero venimos de navegación (ej: "Anton")
    displayName = tempName;
  }
  
  // 2. Manejar el estado de carga
  // (Muestra "Cargando..." SÓLO si estamos cargando Y AÚN NO tenemos un nombre)
  if (loading && !displayName) {
    return <p>Cargando datos del paciente...</p>;
  }

  // 3. Renderizado final
  return (
    <div>
      <Breadcrumb>
        Páginas / <strong>Acciones del Paciente</strong>
      </Breadcrumb>
      
      {/* El error se muestra si existe */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Title>
        {/* Esto funciona en todos los casos:
            - Navegación: Muestra "Anton" (rápido) -> actualiza a "Anton Pérez" (API)
            - Recarga F5: Muestra "Cargando..." -> actualiza a "Anton Pérez" (API)
        */}
        Acciones para: {displayName}
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
            <Button to={`/agendamiento/consulta/${id}`} color="#4CAF50" 
            state={{ patient: patientData }}>
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
            <Button to={`/agendamiento/examen/${id}`} color="#FB8C00" 
            state={{ patient: patientData }} >
              INGRESAR
            </Button>
            <Button to={`/agendamiento/multiprestacion/${id}`} color="#FB8C00"
            state={{ patient: patientData }} >
              MULTIPRESTACIÓN
            </Button>
          </CardBody>
        </ActionCard>
      </CardsContainer>
    </div>
  );
};

export default AccionesPage;