import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Select from 'react-select';
import {
  getCountries,
  getFacilities,
  getProvidersByFacility,
  searchAppointments,
  getAppointmentDetails // <-- ✨ 1. Importar la nueva función
} from '../../services/apiService';
import styled, { keyframes } from 'styled-components';
import logoAlmaGrande from '../../assets/images/logo_alma_grande.png';
import { formatApptStatus } from '../../utils/formatters.js';
import { validateRut } from '../../utils/validation.js';

// --- Estilos Básicos ---
const PageWrapper = styled.div`
  /* 1rem arriba, 2rem a los lados, 2rem abajo */
  padding: 1rem 2rem 2rem 2rem; 
  font-family: Arial, sans-serif;
  position: relative; /* <--- Necesario para el overlay */
`;

const FormContainer = styled.form`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  label { font-weight: bold; font-size: 0.9rem; color: #333; }
  input, select { padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem; }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  grid-column: 1 / -1;
  justify-self: end;
  &:hover { background-color: #0056b3; }
  &:disabled { background-color: #a0a0a0; cursor: not-allowed; }
`;

// --- ESTILOS DE TABLA MEJORADOS ---
const ResultsContainer = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  overflow-x: auto;
`;

const ResultsTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  margin-top: 1rem;
  font-size: 0.9rem;
  th, td { padding: 1rem 0.75rem; text-align: left; vertical-align: middle; }
  th {
    background-color: #f8f9fa;
    font-weight: 600;
    font-size: 0.8rem;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #dee2e6;
  }
  td { border-bottom: 1px solid #dee2e6; color: #495057; }
  tbody tr td:last-child { text-align: center; }
  tbody tr:hover { background-color: #f1f1f1; }
`;

const InfoButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 50%; /* Círculo perfecto */
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  font-style: italic;
  font-family: 'Georgia', serif;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
`;

// --- ESTILOS DEL SPINNER ---
const spin = keyframes` 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } `;
const LoadingOverlay = styled.div`
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex; align-items: center; justify-content: center;
  z-index: 10;
  transition: opacity 0.2s ease-in-out;
`;
const CustomSpinner = styled.div`
  position: relative; width: 120px; height: 120px;
  display: flex; align-items: center; justify-content: center;
`;
const SpinnerRing = styled.div`
  position: absolute; width: 100%; height: 100%;
  border: 7px solid rgba(0, 123, 255, 0.2); 
  border-top: 7px solid #007bff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;
const SpinnerLogo = styled.img` width: 70px; height: auto; `;

// --- ESTILOS PARA EL CHECKBOX --- 
const CheckboxFormGroup = styled(FormGroup)`
  /* Cambia la dirección a horizontal */
  flex-direction: row; 
  align-items: center; /* Alinea verticalmente */
  
  /* Se alinea con los otros campos que tienen label arriba */
  padding-top: 1.9rem; /* Ajusta este valor si es necesario */
  gap: 0.5rem;

  label {
    margin-bottom: 0; /* Quita el margen inferior del label */
    font-weight: normal; /* Lo hace ver como texto normal */
  }

  input {
    width: auto; /* Evita que el checkbox ocupe 100% */
    height: auto;
    margin-top: -2px; /* Ajuste fino vertical */
  }
`;

// --- ESTILOS PARA REACT-SELECT (BUSCADOR) ---
const searchableSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    width: '100%',
    minHeight: 'calc(1.5em + 1.5rem + 2px)', // Ajusta la altura al de tus otros inputs
    fontSize: '1rem',
    color: '#495057',
    backgroundColor: state.isDisabled ? '#e9ecef' : '#fff',
    border: state.isFocused ? '1px solid #007bff' : '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(0, 123, 255, 0.25)' : 'none',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    '&:hover': {
      borderColor: state.isFocused ? '#007bff' : '#ccc',
    },
    opacity: state.isDisabled ? '0.7' : '1',
  }),
  option: (provided, state) => ({
    ...provided,
    fontSize: '1rem',
    backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f0f0f0' : 'white',
    color: state.isSelected ? 'white' : '#333',
    '&:active': {
      backgroundColor: '#007bff',
      color: 'white',
    },
  }),
  menu: (provided) => ({ ...provided, borderRadius: '4px', zIndex: 5 }),
  placeholder: (provided) => ({ ...provided, color: '#6c757d' }),
  singleValue: (provided) => ({ ...provided, color: '#495057' }),
};

// --- ESTILOS PARA EL MODAL DE INFORMACIÓN (MODIFICADOS) ---
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: ${keyframes`from { opacity: 0; } to { opacity: 1; }`} 0.2s ease;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
  animation: ${keyframes`from { transform: scale(0.9); } to { transform: scale(1); }`} 0.2s ease;
`;

const ModalHeader = styled.div`
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  h3 { margin: 0; font-size: 1.25rem; color: #333; font-weight: 600; }
`;

// ✨ ESTE ES EL BOTÓN QUE TE DABA EL WARNING
const CloseButton = styled.button`
  background: transparent; border: none; font-size: 1.75rem; font-weight: bold;
  color: #888; cursor: pointer; padding: 0; line-height: 1;
  &:hover { color: #000; }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 200px; /* Altura mínima para el spinner */
`;

const InfoSection = styled.div`
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
  &:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  padding: 0.4rem 0;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #333;
  margin-right: 1rem;
`;

const InfoValue = styled.span`
  color: #555;
  text-align: right;
`;

const ModalFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: flex-end; /* Botón a la derecha */
`;

const ModalCloseButton = styled.button`
  background-color: #dc3545; /* Color Rojo */
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  text-transform: uppercase;
  &:hover { background-color: #c82333; }
`;

// Spinner para el cuerpo del modal
const ModalSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  font-size: 1rem;
  color: #555;
`;
// --- FIN ESTILOS MODAL ---


// --- Componente Principal ---
const BuscadorCitasPage = () => {
  // Estados del formulario
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    facilityId: 'n',
    providerId: 'n',
    rut: '',
    countryId: '',
  });

  // Estados de los dropdowns
  const [dropdowns, setDropdowns] = useState({
    facilities: [],
    providers: [],
    countries: [],
  });

  // Estados de la búsqueda
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // --- ✨ 2. ESTADOS PARA EL MODAL (RE-INTRODUCIDOS) ---
  const [modalData, setModalData] = useState(null); // Datos básicos de la fila
  const [modalDetails, setModalDetails] = useState(null); // Datos de la API de detalles
  const [modalLoading, setModalLoading] = useState(false); // Spinner del modal
  const [modalError, setModalError] = useState(''); // Error del modal
  const [isExtranjero, setIsExtranjero] = useState(false);

  // --- ✨ FORMATEA OPCIONES PARA EL BUSCADOR ---
  const providerOptions = useMemo(() => {
    // 1. Empezamos con la opción "Todos"
    const options = [{ value: 'n', label: 'Todos' }];
    
    // 2. Mapeamos los proveedores
    const providersList = dropdowns.providers.map(provider => ({
      value: provider.id,
      label: provider.name
    }));

    // 3. Los combinamos y retornamos
    return options.concat(providersList);
  }, [dropdowns.providers]); // Se recalcula solo si la lista de 'providers' cambia


  // --- MANEJADOR PARA EL BUSCADOR DE PROFESIONAL ---
  const handleProviderChange = (selectedOption) => {
    // selectedOption es el objeto { value: ..., label: ... } o null
    const providerId = selectedOption ? selectedOption.value : 'n';
    setFilters(prevFilters => ({
      ...prevFilters,
      providerId: providerId,
    }));
  };

  // --- FORMATEA OPCIONES PARA EL BUSCADOR DE PAÍS ---
  const countryOptions = useMemo(() => {
    const options = [{ value: '', label: 'Seleccione País...' }];
    const countriesList = dropdowns.countries.map(country => ({
      value: country.isonum,
      label: country.nombre
    }));
    return options.concat(countriesList);
  }, [dropdowns.countries]); // Se recalcula si la lista de 'countries' cambia

  // --- MANEJADOR PARA EL BUSCADOR DE PAÍS ---
  const handleCountryChange = (selectedOption) => {
    const countryId = selectedOption ? selectedOption.value : '';
    setFilters(prevFilters => ({
      ...prevFilters,
      countryId: countryId,
    }));
  };

  // --- useEffect de Carga Inicial (Sin cambios) ---
  useEffect(() => {
    const loadPageData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const today = new Date().toISOString().split('T')[0];
        const initialFilters = { start: today, end: today };
        const [facilitiesRes, countriesRes, initialSearchRes] = await Promise.all([
          getFacilities(),
          getCountries(),
          searchAppointments(initialFilters)
        ]);
        setDropdowns(prev => ({ ...prev, facilities: facilitiesRes.data || [], countries: countriesRes.data || [] }));
        setResults(initialSearchRes.data);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
        if (err.status === 404) {
          setError("No se encontraron citas para el día de hoy.");
          setResults(null);
        } else {
          setError("Error al cargar la página. Intente recargar.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadPageData();
  }, []);

  // --- useEffect para cargar profesionales (Sin cambios) ---
  useEffect(() => {
    if (!filters.facilityId || filters.facilityId === 'n') {
      setDropdowns(prev => ({ ...prev, providers: [] })); 
      setFilters(prev => ({ ...prev, providerId: 'n' })); 
      return;
    }
    const loadProviders = async () => {
      try {
        const providersRes = await getProvidersByFacility(filters.facilityId);
        setDropdowns(prev => ({ ...prev, providers: providersRes.data || [] }));
      } catch (err) {
        console.error("Error cargando profesionales:", err);
        setError("Error al cargar lista de profesionales.");
      }
    };
    loadProviders();
  }, [filters.facilityId]);
  
  // Limpia el país si se desmarca "Extranjero"
  useEffect(() => {
    if (!isExtranjero) {
      setFilters(prev => ({ ...prev, countryId: '' }));
    }
  }, [isExtranjero]);

  // --- Manejadores de formulario (Sin cambios) ---
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setIsLoading(true);
    setError(''); // Limpia errores previos
    setResults(null);

    try {
      let rutParaApi = filters.rut; // 1. Asigna el RUT base

      // 2. Comprobar si hay RUT para validar/formatear
      if (filters.rut && filters.rut.trim() !== '') {
        
        if (isExtranjero) {
          // LÓGICA EXTRANJERO: Concatenar si hay país
          if (filters.countryId) {
            rutParaApi = filters.rut + filters.countryId;
          } else {
            // Es extranjero pero no seleccionó país
            setError('Si es extranjero, debe seleccionar un país.');
            setIsLoading(false);
            return; // Detiene la ejecución
          }
        } else {
          // LÓGICA CHILENA: Validar el RUT
          // Usamos tu nueva función 'validateRut'
          if (!validateRut(filters.rut)) { 
            // Si no es válido, mostrar error y detener
            setError('El RUT ingresado no es válido.');
            setIsLoading(false);
            return; // Detiene la ejecución
          }
          // Si es válido, no hacemos nada (rutParaApi ya es filters.rut)
        }
      }

      // --- FIN DE LA LÓGICA DE VALIDACIÓN ---

      const apiFilters = {
        start: filters.startDate,
        end: filters.endDate,
        rut: rutParaApi || undefined, // 3. Usa la nueva variable (validada o concatenada)
        facility_id: filters.facilityId === 'n' ? undefined : filters.facilityId,
        professional_id: filters.providerId === 'n' ? undefined : filters.providerId,
      };

      const response = await searchAppointments(apiFilters);
      setResults(response.data); 

    } catch (err) {
      console.error("Error en la búsqueda:", err);
      if (err.status === 404) {
        setError('No se encontraron agendamientos con esos filtros.');
      } else {
        setError(err.message || "Ocurrió un error en la búsqueda.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- ✨ 3. FUNCIÓN PARA ABRIR MODAL Y CARGAR DETALLES (NUEVA) ---
  const handleViewClick = useCallback(async (app) => {
    setModalData(app);
    setModalDetails(null);
    setModalError('');
    setModalLoading(true);

    try {
      // Usamos el ID de la fila. Asumiré que la API de la tabla (searchAppointments)
      // devuelve 'id_transaccion' o 'pc_eid' como ID único.
      const eventId = app.id_evento || app.pc_eid;
      const response = await getAppointmentDetails(eventId);
      setModalDetails(response.data);
    } catch (error) {
      console.error("Error al cargar detalles del modal:", error);
      setModalError("No se pudieron cargar los detalles de la cita.");
    } finally {
      setModalLoading(false);
    }
  }, []); // useCallback para que la función no se recree

  const closeModal = () => {
    setModalData(null);
    setModalDetails(null);
    setModalError('');
  };

  // --- ✨ 4. FUNCIONES PARA FORMATEAR DATOS DEL MODAL ---
  const formatModalDate = (dateString) => {
    if (!dateString || dateString.startsWith('0000')) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  
  const formatModalTime = (dateString) => {
    if (!dateString || dateString.startsWith('0000')) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };
  
  const formatModalUser = (userName) => {
    if (!userName || userName === '') return 'No Confirmado';
    return userName;
  };

  // --- Renderizado del Componente ---
  return (
    <PageWrapper>
      
      {isLoading && (
        <LoadingOverlay>
          <CustomSpinner>
            <SpinnerRing />
            <SpinnerLogo src={logoAlmaGrande} alt="Cargando..." />
          </CustomSpinner>
        </LoadingOverlay>
      )}

      <h1>Buscador de Citas</h1>

      <FormContainer onSubmit={handleSubmit}>
        {/* --- Fila 1: Fechas --- */}
        <FormGroup>
          <label htmlFor="startDate">Fecha Desde</label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="endDate">Fecha Hasta</label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
            required
          />
        </FormGroup>

        {/* --- Fila 2: Sucursal y Profesional --- */}
        <FormGroup>
          <label htmlFor="facilityId">Sucursal</label>
          <select
            id="facilityId"
            name="facilityId"
            value={filters.facilityId}
            onChange={handleFilterChange}
          >
            <option value="n">Todos</option>
            {dropdowns.facilities.map(facility => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </FormGroup>

        <FormGroup>
          <label htmlFor="providerId">Profesional</label>
          <Select
            id="providerId"
            name="providerId"
            options={providerOptions}
            value={providerOptions.find(opt => opt.value === filters.providerId)}
            onChange={handleProviderChange}
            isDisabled={!filters.facilityId || filters.facilityId === 'n'}
            styles={searchableSelectStyles}
            placeholder="Seleccione o busque..."
            noOptionsMessage={() => 'No se encontraron profesionales'}
          />
        </FormGroup>

        {/* --- Fila 3: RUT y Checkbox Extranjero --- */}
        <FormGroup>
          <label htmlFor="rut">RUT Paciente</label>
          <input
            type="text"
            id="rut"
            name="rut"
            placeholder="12345678-9"
            value={filters.rut}
            onChange={handleFilterChange}
          />
        </FormGroup>

        {/* --- ✨ CHECKBOX EXTRANJERO --- */}
        <CheckboxFormGroup>
          <input
            type="checkbox"
            id="isExtranjero"
            name="isExtranjero"
            checked={isExtranjero}
            onChange={(e) => setIsExtranjero(e.target.checked)}
          />
          <label htmlFor="isExtranjero">Extranjero</label>
        </CheckboxFormGroup>
        
        {/* --- ✨ PAÍS (CONDICIONAL Y CON BUSCADOR) --- */}
        {isExtranjero && (
          <FormGroup>
            <label htmlFor="countryId">País</label>
            <Select
              id="countryId"
              name="countryId"
              options={countryOptions}
              value={countryOptions.find(opt => opt.value === filters.countryId)}
              onChange={handleCountryChange}
              styles={searchableSelectStyles}
              placeholder="Seleccione o busque País..."
              noOptionsMessage={() => 'No se encontraron países'}
            />
          </FormGroup>
        )}

        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Buscando...' : 'Buscar'}
        </SubmitButton>
      </FormContainer>

      {/* --- Área de Resultados --- */}
      <div>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        {results && (
          <ResultsContainer>
            {/* Tabla de Citas Activas */}
            <h3 style={{ marginTop: 0 }}>Citas Agendadas</h3>
            {results.appointments.length > 0 ? (
              <ResultsTable>
                <thead>
                  <tr>
                    <th>N</th> 
                    <th>Sucursal</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Proveedor</th>
                    <th>RUT paciente</th>
                    <th>Nombre Paciente</th>
                    <th>Prestación</th>
                    <th>Status</th>
                    <th>Comentario</th>
                    <th>Info</th>
                  </tr>
                </thead>
                <tbody>
                  {/* --- ✨ 5. TABLA "COMO ESTABA ANTES" --- */}
                  {/* (Usando los campos de la API searchAppointments) */}
                  {results.appointments.map(app => (
                    <tr key={app.id_transaccion || app.pc_eid}>
                      <td>{app.id_transaccion || app.pc_eid}</td>
                      <td>{app.facility_name}</td>
                      <td>{new Date(app.inicio).toLocaleDateString('es-CL')}</td>
                      <td>{new Date(app.inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })}</td>
                      <td>{app.profesional}</td>
                      <td>{app['Rut/DNI']}</td>
                      <td>{app.paciente_nombre}</td>
                      <td>{app.prestacion}</td>
                      <td>{formatApptStatus(app.pc_apptstatus, app.pc_wsp)}</td>
                      <td>{app.comentario}</td>
                      <td>
                        <InfoButton onClick={() => handleViewClick(app)}>
                          i
                        </InfoButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </ResultsTable>
            ) : (
              <p>No se encontraron citas agendadas.</p>
            )}

            {/* Tabla de Citas Anuladas (Sin cambios) */}
            {results.cancellations.length > 0 && (
              <>
                <h3 style={{ marginTop: '2.5rem' }}>Citas Anuladas</h3>
                <ResultsTable>
                  <thead>
                    <tr>
                      <th>RUT</th><th>Nombre Paciente</th><th>Prestación</th>
                      <th>Sucursal</th><th>Fecha y Hora</th><th>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.cancellations.map(cancel => (
                      <tr key={cancel.pc_eid}>
                        <td>{cancel.ss}</td>
                        <td>{`${cancel.fname} ${cancel.lname}`}</td>
                        <td>{cancel.pc_catname}</td>
                        <td>{cancel.facility_name}</td>
                        <td>{new Date(cancel.fecha).toLocaleDateString('es-CL')} {cancel.hora}</td>
                        <td>{cancel.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </ResultsTable>
              </>
            )}
          </ResultsContainer>
        )}
      </div>

      {/* --- ✨ 6. RENDERIZADO DEL MODAL (ACTUALIZADO) --- */}
      {modalData && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <h3>Eventos</h3>
              {/* ✨ AQUÍ SE USA EL BOTÓN Y SE CORRIGE EL WARNING */}
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>
            <ModalBody>
              {modalLoading ? (
                <ModalSpinner>Cargando detalles...</ModalSpinner>
              ) : modalError ? (
                <ErrorMessage>{modalError}</ErrorMessage>
              ) : modalDetails ? (
                /* --- Si hay detalles de la API /details, los mostramos --- */
                <>
                  <InfoSection>
                    <InfoRow>
                      <InfoLabel>Rut paciente:</InfoLabel>
                      <InfoValue>{modalDetails.paciente_rut}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Nombre paciente:</InfoLabel>
                      <InfoValue>{modalDetails.paciente_nombre}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Teléfonos:</InfoLabel>
                      <InfoValue>
                        {modalDetails.phone_cell || 'N/A'}
                        <br />
                        {modalDetails.phone_home || 'N/A'}
                      </InfoValue>
                    </InfoRow>
                  </InfoSection>

                  <InfoSection>
                    <InfoRow>
                      <InfoLabel>Usuario Agenda:</InfoLabel>
                      <InfoValue>{modalDetails.creado_por_usuario}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Fecha:</InfoLabel>
                      <InfoValue>{formatModalDate(modalDetails.pc_fc)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Hora:</InfoLabel>
                      <InfoValue>{formatModalTime(modalDetails.pc_fc)}</InfoValue>
                    </InfoRow>
                  </InfoSection>

                  <InfoSection>
                    <InfoRow>
                      <InfoLabel>Usuario que confirmo:</InfoLabel>
                      <InfoValue>{formatModalUser(modalDetails.modificado_por_usuario)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Fecha:</InfoLabel>
                      <InfoValue>{formatModalDate(modalDetails.pc_fcf)}</InfoValue>
                    </InfoRow>
                    <InfoRow>
                      <InfoLabel>Hora:</InfoLabel>
                      <InfoValue>{formatModalTime(modalDetails.pc_fcf)}</InfoValue>
                    </InfoRow>
                  </InfoSection>
                </>
              ) : (
                 /* --- Fallback: Si la API falla, muestra los datos básicos de la fila --- */
                <InfoSection>
                  <InfoRow><InfoLabel>RUT paciente:</InfoLabel><InfoValue>{modalData['Rut/DNI']}</InfoValue></InfoRow>
                  <InfoRow><InfoLabel>Nombre paciente:</InfoLabel><InfoValue>{`${modalData.fname || ''} ${modalData.lname || ''}`}</InfoValue></InfoRow>
                </InfoSection>
              )}
            </ModalBody>
            <ModalFooter>
              <ModalCloseButton onClick={closeModal}>
                CERRAR
              </ModalCloseButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

    </PageWrapper>
  );
};

export default BuscadorCitasPage;