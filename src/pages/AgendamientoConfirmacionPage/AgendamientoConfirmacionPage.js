import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import { Appointment } from '../../services/apiService'; 

// --- ESTILOS ---
const PageHeader = styled.div`
  background-color: #FFA726;
  color: white;
  padding: 24px;
  margin-bottom: 24px;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.8rem;
`;

const CardContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
`;

const SectionTitle = styled.h3`
  color: #344767;
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
`;

const DataGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
`;

const DataField = styled.div`
  display: flex;
  flex-direction: column;
`;

const DataLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #6c757d;
  margin-bottom: 5px;
  text-transform: uppercase;
`;

const DataValue = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #d2d6da;
  padding: 10px 12px;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
  min-height: 40px;
  display: flex;
  align-items: center;
  white-space: pre-wrap;
`;

const CommentArea = styled.textarea`
  background-color: #f8f9fa;
  border: 1px solid #d2d6da;
  padding: 10px 12px;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  color: #495057;
  min-height: 120px;
  resize: vertical;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.25);
  }
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: right;
`;

const FinalizeButton = styled.button`
  font-weight: bold;
  font-size: 1rem;
  padding: 12px 30px;
  border-radius: 0.5rem;
  color: white;
  background-color: #FFA726;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;

  &:hover {
    background-color: #FB8C00;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  &:disabled {
    background-color: #9E9E9E;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #dc3545;
  font-weight: bold;
  text-align: center;
  margin-top: 15px;
`;

// --- HELPER ---
const getFormattedDateTime = (date, time) => {
  if (!date || !time) return 'N/A';
  const dateTime = new Date(`${date}T${time}`);
  const dateStr = dateTime.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = dateTime.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${dateStr} ${timeStr}`;
};

const getSession = () => {
  const sessionJSON = localStorage.getItem('userSession');
  try {
    // Parsea el JSON guardado en el login
    return sessionJSON ? JSON.parse(sessionJSON) : null;
  } catch (e) {
    console.error("Error parseando la sesión de usuario desde localStorage", e);
    return null;
  }
};

// --- COMPONENTE ---
const AgendamientoConfirmacionPage = () => {
  const { id: patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const initialState = location.state;
  const selectedSlot = initialState?.slot;
  const patientDetails = initialState?.patient;
  const prestationName = initialState?.prestationName;
  const branchName = initialState?.branchName;

  // Estados locales
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Validación al recargar la página
  useEffect(() => {
    if (!selectedSlot) {
      Swal.fire({
        title: 'Sesión expirada',
        text: 'El resumen de agendamiento se perdió. Por favor, seleccione la hora nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      }).then(() => navigate(`/agendamiento/consulta/${patientId}`, { replace: true }));
    }
  }, [patientId, navigate, selectedSlot]);

  // Datos renderizados
  const rutPatient = patientDetails?.['Rut/DNI'] || 'Cargando...';
  const namePatient = `${patientDetails?.nombre || ''} ${patientDetails?.paterno || ''} ${patientDetails?.materno || ''}`.trim() || 'Cargando...';
  const dateHour = getFormattedDateTime(selectedSlot?.date, selectedSlot?.hour);
  const professionalName = selectedSlot?.professional_name || 'N/A';
  const preparation = selectedSlot?.preparation || 'No requiere preparación.';
  const info = selectedSlot?.professional_info || 'Información no disponible.';

  // Función de Finalización
  const handleFinalize = async () => {
    if (loading || !selectedSlot) return;
    setLoading(true);
    setError('');

    // --- INICIO DE LA MODIFICACIÓN ---
    
    // 1. Obtener la sesión actual
    const session = getSession(); 
    
    // 2. Extraer el user_id de la sesión
    // Basado en tu LoginPage, la sesión se guarda completa.
    // Asumo que el user_id está en session.data.user_id
    const loggedInUserId = session?.data?.user_id; 

    // 3. Validar que el user_id exista
    if (!loggedInUserId) {
      console.error("Error: No se encontró user_id en la sesión de localStorage.");
      await Swal.fire({
        title: '❌ Error de Sesión',
        text: 'No se pudo encontrar tu ID de usuario. Por favor, inicia sesión de nuevo.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#f27474',
      });
      setLoading(false);
      navigate('/login', { replace: true }); // Envía al login si no hay ID
      return; 
    }
    // --- FIN DE LA MODIFICACIÓN ---

    const platformId = process.env.REACT_APP_PLATFORM_ID || 6; 

    // 1. Define el payload base (sin el comentario)
    const payload = {
      rut: rutPatient,
      professional_id: selectedSlot.professional_id,
      date: selectedSlot.date,
      hour: selectedSlot.hour,
      facility_id: selectedSlot.facility_id,
      categorie_id: selectedSlot.categorie_id,
      platform_id: platformId,
      user_id: loggedInUserId, // <-- ¡CORREGIDO! Usamos el ID de la sesión
    };

   // 2. Limpia el comentario de espacios al inicio/final
   const trimmedComment = comment.trim();

   // 3. Añade la propiedad 'comment' SOLO si no está vacía
   if (trimmedComment) {
     payload.comment = trimmedComment;
   }

    try {
      const response = await Appointment(payload);

      if (response.status === 'success') {
        await Swal.fire({
          title: '✅ Agendamiento exitoso',
          text: response.message || 'Cita agendada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          confirmButtonColor: '#3085d6',
        });
        navigate('/agenda', { replace: true });
      } else {
        await Swal.fire({
          title: '⚠️ No se pudo agendar',
          text: response.message || 'No fue posible concretar la reserva.',
          icon: 'warning',
          confirmButtonText: 'Volver',
          confirmButtonColor: '#f27474',
        });
        navigate(`/agendamiento/consulta/${patientId}`, { replace: true });
      }
    } catch (err) {
      console.error('Error al finalizar agendamiento:', err);
      await Swal.fire({
        title: '❌ Error',
        text: err.message || 'Error al conectar con el servidor.',
        icon: 'error',
        confirmButtonText: 'Volver',
        confirmButtonColor: '#f27474',
      });
      navigate(`/agendamiento/consulta/${patientId}`, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSlot || !patientDetails) {
    return <p>Cargando datos de confirmación...</p>;
  }

  return (
    <CardContainer>
      <PageHeader>
        <PageTitle>Agendamiento</PageTitle>
      </PageHeader>

      <SectionTitle>Datos del agendamiento</SectionTitle>

      <DataGrid>
        <DataField>
          <DataLabel>Rut/DNI Paciente</DataLabel>
          <DataValue>{rutPatient}</DataValue>
        </DataField>

        <DataField>
          <DataLabel>Nombre Paciente</DataLabel>
          <DataValue>{namePatient}</DataValue>
        </DataField>

        <DataField>
          <DataLabel>Fecha y Hora Agendamiento</DataLabel>
          <DataValue>{dateHour}</DataValue>
        </DataField>

        <DataField>
          <DataLabel>Sucursal</DataLabel>
          <DataValue>{branchName}</DataValue>
        </DataField>

        <DataField>
          <DataLabel>Prestación</DataLabel>
          <DataValue>{prestationName}</DataValue>
        </DataField>

        <DataField>
          <DataLabel>Profesional</DataLabel>
          <DataValue>{professionalName}</DataValue>
        </DataField>

        <DataField style={{ gridColumn: 'span 1' }}>
          <DataLabel htmlFor="comment">Comentario</DataLabel>
          <CommentArea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escriba aquí cualquier nota o comentario adicional..."
            disabled={loading}
          />
        </DataField>

        <DataField style={{ gridColumn: 'span 1' }}>
          <DataLabel>Información</DataLabel>
          <DataValue>{info}</DataValue>
        </DataField>

        <DataField style={{ gridColumn: 'span 1' }}>
          <DataLabel>Preparación</DataLabel>
          <DataValue>{preparation}</DataValue>
        </DataField>
      </DataGrid>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Footer>
        <FinalizeButton onClick={handleFinalize} disabled={loading}>
          {loading ? 'Finalizando...' : 'Finalizar'}
        </FinalizeButton>
      </Footer>
    </CardContainer>
  );
};

export default AgendamientoConfirmacionPage;
