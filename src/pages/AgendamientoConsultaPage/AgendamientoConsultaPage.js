import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';

import { 
  getConsultationSpecialties,
  getPrestationsBySpecialty,
  getFacilitiesByPrestation,
  getPatientById,
  getAvailability
} from '../../services/apiService'; 

// --- ESTILOS (sin cambios) ---
const Breadcrumb = styled.nav`
  margin: 24px 0;
  font-size: 0.9rem;
  color: #6c757d;
`;
const FormContainer = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
  overflow: hidden;
`;
const FormHeader = styled.div`
  padding: 24px;
  color: white;
  background: linear-gradient(195deg, #66BB6A 0%, #43A047 100%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
  
  h2 {
    margin: 0;
    font-size: 1.5rem;
    color: white;
  }
`;
const FormBody = styled.div`
  padding: 24px;
`;
const FormGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr;
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const FormField = styled.div`
  display: flex;
  flex-direction: column;
`;
const FormLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #344767;
  margin-bottom: 8px;
`;
const baseInputStyles = `
  width: 100%;
  padding: 10px 12px;
  font-size: 0.9rem;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #d2d6da;
  border-radius: 0.5rem;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.25);
  }

  &:disabled {
    background-color: #e9ecef;
    opacity: 1;
  }
`;
const FormSelect = styled.select`
  ${baseInputStyles}
`;
const FormInput = styled.input`
  ${baseInputStyles}
`;
const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
`;
const SubmitButton = styled.button`
  text-decoration: none;
  font-weight: bold;
  font-size: 0.8rem;
  padding: 10px 20px;
  border-radius: 0.5rem;
  color: white;
  background-color: #4CAF50;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  &:disabled {
    background-color: #9E9E9E;
    cursor: not-allowed;
  }
`;
const FormMessage = styled.p`
  font-size: 0.9rem;
  text-align: center;
  padding: 10px;
`;
const ErrorMessage = styled(FormMessage)`
  color: #dc3545;
  font-weight: bold;
`;

// --- ESTILOS DE CALENDARIO Y MODAL (sin cambios) ---
const AvailabilityContainer = styled.div`
  margin-top: 24px;
  border-top: 1px solid #e0e0e0;
  padding-top: 24px;
`;

const CalendarContainer = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  user-select: none;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f4f4f4;
  border-radius: 0.5rem 0.5rem 0 0;
`;

const CalendarTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const CalendarNavButton = styled.button`
  background: #e0e0e0;
  border: none;
  padding: 5px 10px;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: bold;
  &:hover {
    background: #c0c0c0;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  background-color: #e0e0e0;
  border: 1px solid #e0e0e0;
`;

const CalendarDayHeader = styled.div`
  text-align: center;
  font-weight: bold;
  background-color: white;
  padding: 8px 0;
  font-size: 0.8rem;
`;

const CalendarDay = styled.div`
  position: relative;
  min-height: 50px;
  background-color: white;
  padding: 8px;
  font-size: 0.9rem;
  color: ${props => props.isOtherMonth ? '#aaa' : '#333'};
  
  ${props => props.isAvailable && css`
    cursor: pointer;
    background-color: #e8f5e9;
    font-weight: bold;

    &:hover {
      background-color: #c8e6c9;
    }
    
    &::after {
      content: '';
      position: absolute;
      bottom: 6px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #4CAF50;
    }
  `}
  
  ${props => props.isSelected && css`
    background-color: #4CAF50;
    color: white;
    &::after {
      background-color: white;
    }
  `}
  
  ${props => props.isToday && css`
    border: 2px solid #4CAF50;
    padding: 6px;
  `}
`;

const TimeSlotsContainer = styled.div`
  margin-top: 24px;
`;

const TimeSlotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
`;

const TimeSlotButton = styled.button`
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1976D2;
  }
  
  div {
    font-size: 0.9rem;
  }
  strong {
    font-size: 1.2rem;
    display: block;
    margin-top: 4px;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 0.75rem;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
`;

const ModalHeader = styled.h3`
  margin-top: 0;
  color: #344767;
`;

const ModalInfo = styled.div`
  font-size: 1rem;
  color: #6c757d;
  line-height: 1.6;
  
  p {
    margin: 10px 0;
  }
  
  strong {
    color: #344767;
  }
`;

const ModalFooter = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const ModalButton = styled.button`
  font-weight: bold;
  font-size: 0.8rem;
  padding: 10px 20px;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-transform: uppercase;
  
  ${props => props.primary ? css`
    color: white;
    background-color: #FFA726;
    &:hover { background-color: #FB8C00; }
  ` : css`
    color: #344767;
    background-color: #e0e0e0;
    &:hover { background-color: #c0c0c0; }
  `}
`;
// --- FIN ESTILOS ---


// --- COMPONENTE DE PÁGINA ---
const AgendamientoConsultaPage = () => {
  const { id: patientId } = useParams();
  const location = useLocation();
  const patientFromState = location.state?.patient;

  const [formData, setFormData] = useState({
    specialtyId: '',
    prestationId: '',
    branchId: '',
    age: patientFromState?.edad || '', 
  });

  // --- ESTADOS DE DATOS ---
  const [specialties, setSpecialties] = useState([]);
  const [prestations, setPrestations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [patientData, setPatientData] = useState(patientFromState || null); 
  
  // --- ESTADOS DE DISPONIBILIDAD ---
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [availableDates, setAvailableDates] = useState(new Set());
  const [slotsForSelectedDay, setSlotsForSelectedDay] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- ESTADOS DE CARGA ---
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingPrestations, setLoadingPrestations] = useState(false);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [error, setError] = useState('');

  // --- 1. DESTRUCTURAR VALORES DE 'formData' ---
  // Hacemos esto para que los 'useCallback' solo dependan
  // de los valores primitivos (string, number) y no del objeto 'formData' entero.
  const { specialtyId, prestationId } = formData;
  
  // --- 2. ENVOLVER FUNCIONES CON useCallback ---
  
  const loadSpecialties = useCallback(async () => {
    setLoadingSpecialties(true); setError('');
    try {
      const response = await getConsultationSpecialties();
      setSpecialties(response.data || []);
    } catch (err) { setError("No se pudieron cargar las especialidades."); }
    finally { setLoadingSpecialties(false); }
  }, []); // Dependencias: [] (ninguna)
  
  const loadPrestations = useCallback(async () => {
    setPrestations([]);
    if (!specialtyId) return; // Si no hay ID, no hagas nada
    
    setLoadingPrestations(true); setError('');
    try {
      const response = await getPrestationsBySpecialty(specialtyId);
      setPrestations(response.data || []);
    } catch (err) { setError("No se pudieron cargar las prestaciones."); }
    finally { setLoadingPrestations(false); }
  }, [specialtyId]); // --- 3. USAR EL VALOR DESTRUCTURADO ---
  
  const loadFacilities = useCallback(async () => {
    setFacilities([]);
    if (!prestationId) return; // Si no hay ID, no hagas nada
    
    setLoadingFacilities(true); setError('');
    try {
      const response = await getFacilitiesByPrestation(prestationId);
      setFacilities(response.data || []);
    } catch (err) { setError("No se pudieron cargar las sucursales."); }
    finally { setLoadingFacilities(false); }
  }, [prestationId]); // --- 3. USAR EL VALOR DESTRUCTURADO ---
  
  const loadPatientOnRefresh = useCallback(async () => {
    if (patientFromState) {
      setPatientData(patientFromState);
      return;
    }
    setLoadingPatient(true);
    try {
      const response = await getPatientById(patientId);
      let data = response.data?.[0];
      if (data) {
        setPatientData(data);
        setFormData(prev => ({ ...prev, age: data.edad }));
      }
    } catch (err) { console.error("Error al cargar paciente (F5):", err); }
    finally { setLoadingPatient(false); }
  }, [patientId, patientFromState]);

  // --- 4. ACTUALIZAR useEffects ---
  // (Sin cambios, pero ahora están 100% correctos)
  useEffect(() => { loadSpecialties() }, [loadSpecialties]);
  useEffect(() => { loadPrestations() }, [loadPrestations]);
  useEffect(() => { loadFacilities() }, [loadFacilities]);
  useEffect(() => { loadPatientOnRefresh() }, [loadPatientOnRefresh]);
  

  // --- EFECTO 5: Procesar disponibilidad (sin cambios) ---
  useEffect(() => {
    if (availabilitySlots.length === 0) {
      setAvailableDates(new Set());
      return;
    }
    const firstDate = new Date(`${availabilitySlots[0].date}T00:00:00`);
    setCurrentMonth(new Date(firstDate.getFullYear(), firstDate.getMonth(), 1));
    const datesWithSlots = new Set(availabilitySlots.map(slot => slot.date));
    setAvailableDates(datesWithSlots);
  }, [availabilitySlots]);


  // --- EFECTO 6: Filtrar horas (sin cambios) ---
  useEffect(() => {
    if (!selectedDate) {
      setSlotsForSelectedDay([]);
      return;
    }
    const slots = availabilitySlots.filter(slot => slot.date === selectedDate);
    setSlotsForSelectedDay(slots);
  }, [selectedDate, availabilitySlots]);
  

  // --- MANEJADOR DE CAMBIOS (sin cambios) ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAvailabilitySlots([]);
    setSelectedDate(null);
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'specialtyId') {
        newState.prestationId = '';
        newState.branchId = '';
      }
      if (name === 'prestationId') {
        newState.branchId = '';
      }
      return newState;
    });
  };

  // --- BUSCAR DISPONIBILIDAD (sin cambios) ---
  const handleSearchAvailability = async (e) => {
    e.preventDefault();
    setLoadingAvailability(true);
    setError('');
    setAvailabilitySlots([]);
    setSelectedDate(null);
    
    const { prestationId, age, branchId } = formData;
    
    try {
      const response = await getAvailability(prestationId, age, branchId);
      if (response.data && response.data.length > 0) {
        setAvailabilitySlots(response.data);
      } else {
        setError("No se encontraron horas disponibles para esta búsqueda.");
      }
    } catch (err) {
      console.error("Error al buscar disponibilidad:", err);
      setError("Error al buscar disponibilidad. Intente más tarde.");
    } finally {
      setLoadingAvailability(false);
    }
  };

  // --- MANEJADORES DEL MODAL (sin cambios) ---
  const handleTimeSlotClick = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSlot(null);
  };
  
  const handleConfirmBooking = () => {
    console.log("Reservando hora:", selectedSlot);
    handleCloseModal();
  };


  // --- LÓGICA DEL CALENDARIO (sin cambios) ---
  const LOCALE = 'es-CL';
  const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  const getMonthName = (date) => {
    return date.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
  };
  
  const getFormattedDate = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00`);
    return date.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const getFormattedTime = (isoTime) => {
    const [hour, minute] = isoTime.split(':');
    return `${hour}:${minute}`;
  };

  const changeMonth = (amount) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + amount, 1));
  };
  
  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<CalendarDay key={`empty-${i}`} isOtherMonth />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isAvailable = availableDates.has(dateStr);
      days.push(
        <CalendarDay 
          key={dateStr}
          isToday={dateStr === todayStr}
          isSelected={dateStr === selectedDate}
          isAvailable={isAvailable}
          onClick={isAvailable ? () => setSelectedDate(dateStr) : undefined}
        >
          {day}
        </CalendarDay>
      );
    }
    return (
      <CalendarContainer>
        <CalendarHeader>
          <CalendarNavButton onClick={() => changeMonth(-1)}>{"<"}</CalendarNavButton>
          <CalendarTitle>{getMonthName(currentMonth)}</CalendarTitle>
          <CalendarNavButton onClick={() => changeMonth(1)}>{">"}</CalendarNavButton>
        </CalendarHeader>
        <CalendarGrid>
          {DAY_NAMES.map(day => <CalendarDayHeader key={day}>{day}</CalendarDayHeader>)}
          {days}
        </CalendarGrid>
      </CalendarContainer>
    );
  };
  
  // --- LÓGICA DE RENDERIZADO (sin cambios) ---
  let displayName = '';
  if (patientData) {
    displayName = `${patientData.nombre} ${patientData.paterno} ${patientData.materno}`.trim();
  } else if (loadingPatient) {
    displayName = 'Cargando...';
  }

  const isSearchDisabled = loadingSpecialties || loadingPrestations || loadingFacilities || loadingPatient || loadingAvailability ||
                           !formData.specialtyId || !formData.prestationId || !formData.branchId || !formData.age;

  return (
    <div>
      <Breadcrumb>
        Páginas / <Link to={`/acciones/${patientId}`}>Acciones</Link> / <strong>Consulta Médica</strong>
      </Breadcrumb>

      {isModalOpen && selectedSlot && (
        <ModalOverlay>
          <ModalContent>
            <ModalHeader>Confirmar Reserva</ModalHeader>
            <ModalInfo>
              <p><strong>Paciente:</strong> {displayName}</p>
              <p><strong>Profesional:</strong> {selectedSlot.professional_name}</p>
              <p><strong>Prestación:</strong> {selectedSlot.categorie_name}</p>
              <p><strong>Fecha:</strong> {getFormattedDate(selectedSlot.date)}</p>
              <p><strong>Hora:</strong> {getFormattedTime(selectedSlot.hour)}</p>
            </ModalInfo>
            <ModalFooter>
              <ModalButton onClick={handleCloseModal}>Cerrar</ModalButton>
              <ModalButton primary onClick={handleConfirmBooking}>Reservar Hora</ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      <FormContainer>
        <FormHeader>
          <h2>Consultas Médicas: {displayName}</h2>
        </FormHeader>

        <FormBody>
          <p>Ingrese la información requerida para buscar disponibilidad.</p>
          
          <form onSubmit={handleSearchAvailability}>
            
            <FormGrid>
              {/* --- Campo Especialidad --- */}
              <FormField>
                <FormLabel htmlFor="specialtyId">Especialidad</FormLabel>
                <FormSelect
                  id="specialtyId"
                  name="specialtyId"
                  value={formData.specialtyId}
                  onChange={handleChange}
                  disabled={loadingSpecialties}
                >
                  <option value="">Seleccione una opción</option>
                  {loadingSpecialties && <option>Cargando...</option>}
                  {!loadingSpecialties && specialties.map(spec => (
                    <option key={spec.option_id} value={spec.option_id}>
                      {spec.title}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              {/* --- Campo Prestación --- */}
              <FormField>
                <FormLabel htmlFor="prestationId">Prestación</FormLabel>
                <FormSelect
                  id="prestationId"
                  name="prestationId"
                  value={formData.prestationId}
                  onChange={handleChange}
                  disabled={!formData.specialtyId || loadingPrestations}
                >
                  <option value="">Seleccione una opción</option>
                  {loadingPrestations && <option>Cargando...</option>}
                  {!loadingPrestations && prestations.map(pres => (
                    <option key={pres.pc_catid} value={pres.pc_catid}>
                      {pres.pc_catname}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              {/* --- Campo Sucursal --- */}
              <FormField>
                <FormLabel htmlFor="branchId">Sucursal</FormLabel>
                <FormSelect
                  id="branchId"
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  disabled={!formData.prestationId || loadingFacilities}
                >
                  <option value="">Seleccione una opción</option>
                  {loadingFacilities && <option>Cargando sucursales...</option>}
                  {/* (Asumiendo 'fac.id' y 'fac.name') */}
                  {!loadingFacilities && facilities.map(fac => (
                    <option key={fac.id} value={fac.id}>
                      {fac.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>

              {/* --- Campo Edad --- */}
              <FormField>
                <FormLabel htmlFor="age">Edad</FormLabel>
                <FormInput
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age} 
                  onChange={handleChange}
                  disabled={loadingPatient}
                />
              </FormField>
            </FormGrid>

            <ButtonContainer>
              <SubmitButton type="submit" disabled={isSearchDisabled}>
                {loadingAvailability ? 'Buscando...' : 'Buscar Disponibilidad'}
              </SubmitButton>
            </ButtonContainer>

          </form>

          {availabilitySlots.length > 0 && (
            <AvailabilityContainer>
              {renderCalendar()}
              
              {selectedDate && (
                <TimeSlotsContainer>
                  <h3>Horas disponibles para {getFormattedDate(selectedDate)}</h3>
                  {slotsForSelectedDay.length > 0 ? (
                    <TimeSlotGrid>
                      {slotsForSelectedDay.map((slot, index) => (
                        <TimeSlotButton key={index} onClick={() => handleTimeSlotClick(slot)}>
                          <div>{slot.professional_name}</div>
                          <strong>{getFormattedTime(slot.hour)}</strong>
                        </TimeSlotButton>
                      ))}
                    </TimeSlotGrid>
                  ) : (
                    <p>No hay más horas para este día (esto no debería pasar, revisa el filtro).</p>
                  )}
                </TimeSlotsContainer>
              )}
            </AvailabilityContainer>
          )}

          {error && !loadingSpecialties && !loadingPrestations && !loadingFacilities && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

        </FormBody>
      </FormContainer>
    </div>
  );
};

export default AgendamientoConsultaPage;