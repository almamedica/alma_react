import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  getFacilities, 
  getAllSpecialties, // Nueva función API (debes crearla)
  getProvidersByFacility, // Reutilizamos esta
  getBoxesByFacility, // Nueva función API (debes crearla)
  createCapacity // Nueva función API
} from '../../services/apiService';

const MySwal = withReactContent(Swal);

// --- Estilos de Componentes ---

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FormLabel = styled.label`
  font-weight: 600;
  color: #344767;
  font-size: 0.9rem;
`;

// Estilo base para inputs y selects
const inputStyles = `
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  border: 1px solid #d2d6da;
  border-radius: 8px;
  box-sizing: border-box;
  background-color: #fff;
  color: #495057;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;

  &:focus, &:focus-within {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(90, 103, 216, 0.2);
    outline: none;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const Input = styled.input`
  ${inputStyles}
`;

// Estilos para react-select
const selectStyles = {
  control: (provided, state) => ({
    ...provided,
    ...inputStyles,
    minHeight: 'calc(1.5em + 1.5rem + 2px)', // Ajuste de altura
    padding: '0.25rem', // react-select maneja el padding interno diferente
    borderColor: state.isFocused ? 'var(--primary-color)' : '#d2d6da',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(90, 103, 216, 0.2)' : 'none',
    '&:hover': {
      borderColor: state.isFocused ? 'var(--primary-color)' : '#adb5bd',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'var(--primary-color)' : state.isFocused ? '#f0f2f5' : '#fff',
    color: state.isSelected ? '#fff' : '#344767',
    fontSize: '0.9rem',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#495057',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#adb5bd',
  }),
};

const TimeWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const RepetitionWrapper = styled.div`
  grid-column: 1 / -1;
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 1.25em;
  height: 1.25em;
  accent-color: var(--primary-color);
`;

const DaysOfWeekGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding-left: 1rem;
  margin-top: 1rem;
`;

const DayLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.9rem;
  cursor: pointer;
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
`;

const Button = styled.button`
  grid-column: 1 / -1;
  justify-self: end;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-hover);
  }

  &:disabled {
    background-color: #adb5bd;
    cursor: not-allowed;
  }
`;

// --- Constantes y Lógica del Componente ---

const initialFormData = {
  centroId: null,
  proveedorId: null,
  especialidadId: null,
  eventoCatId: 2, // Fijo para "Apertura de agenda"
  fechaInicio: new Date().toISOString().split('T')[0],
  horaInicio: '08:00:00',
  horaFin: '09:00:00',
  numeroBoxId: null,
  estado: '^',
  informacion: '',
  repetition: null,
};

const daysOfWeekMap = [
  { label: 'Do', value: 1 },
  { label: 'Lu', value: 2 },
  { label: 'Ma', value: 3 },
  { label: 'Mi', value: 4 },
  { label: 'Ju', value: 5 },
  { label: 'Vi', value: 6 },
  { label: 'Sa', value: 7 },
];

const repetitionUnits = [
  { label: 'día', value: 0 },
  { label: 'semana', value: 1 },
  { label: 'mes', value: 2 },
  { label: 'año', value: 3 },
];

// --- Componente Principal ---
const CapacityForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para los Selects
  const [facilities, setFacilities] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [providers, setProviders] = useState([]);
  const [boxes, setBoxes] = useState([]);

  // Estados de carga de Selects
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [loadingBoxes, setLoadingBoxes] = useState(false);

  // Estados de repetición
  const [useRepetition, setUseRepetition] = useState(false);
  const [repetitionType, setRepetitionType] = useState('DAYS_OF_WEEK'); // STANDARD | DAYS_OF_WEEK
  const [repEndDate, setRepEndDate] = useState('');
  const [repDaysOfWeek, setRepDaysOfWeek] = useState([]);
  const [repFrequency, setRepFrequency] = useState(1);
  const [repUnit, setRepUnit] = useState(repetitionUnits[1]); // 'semana'

  // Carga inicial de datos (Centros y Especialidades)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingFacilities(true);
        const facRes = await getFacilities();
        setFacilities(facRes.data.map(f => ({ label: f.name, value: f.id })));
      } catch (error) {
        console.error("Error cargando sucursales:", error);
      } finally {
        setLoadingFacilities(false);
      }
      
      try {
        setLoadingSpecialties(true);
        // Debes crear este endpoint en NestJS
        const specRes = await getAllSpecialties(); 
        setSpecialties(specRes.data.map(s => ({ label: s.title, value: parseInt(s.option_id, 10) })));
      } catch (error) {
        console.error("Error cargando especialidades:", error);
      } finally {
        setLoadingSpecialties(false);
      }
    };
    loadInitialData();
  }, []);

  // Carga de Proveedores (cuando cambia el centro)
  useEffect(() => {
    if (formData.centroId) {
      const loadProviders = async () => {
        try {
          setLoadingProviders(true);
          setProviders([]); // Limpiar proveedores
          setFormData(f => ({ ...f, proveedorId: null })); // Limpiar selección
          
          // Esta función ya la tienes en apiService.js
          const provRes = await getProvidersByFacility(formData.centroId);
          setProviders(provRes.data.map(p => ({ label: p.name, value: p.id })));
        } catch (error) {
          console.error("Error cargando proveedores:", error);
        } finally {
          setLoadingProviders(false);
        }
      };
      loadProviders();
    } else {
      setProviders([]);
      setFormData(f => ({ ...f, proveedorId: null }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.centroId]);

  // Carga de Boxes (cuando cambia el centro)
  useEffect(() => {
    if (formData.centroId) {
      const loadBoxes = async () => {
        try {
          setLoadingBoxes(true);
          setBoxes([]); // Limpiar boxes
          setFormData(f => ({ ...f, numeroBoxId: null })); // Limpiar selección

          // Debes crear este endpoint en NestJS
          const boxRes = await getBoxesByFacility(formData.centroId); 
          setBoxes(boxRes.data.map(b => ({ label: b.nombre, value: b.id })));
        } catch (error) {
          console.error("Error cargando boxes:", error);
        } finally {
          setLoadingBoxes(false);
        }
      };
      loadBoxes();
    } else {
      setBoxes([]);
      setFormData(f => ({ ...f, numeroBoxId: null }));
    }
    // eslint-disable-charlie react-hooks/exhaustive-deps
  }, [formData.centroId]);


  // Handlers
  const handleSelectChange = (name) => (selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption ? selectedOption.value : null }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (dayValue) => {
    setRepDaysOfWeek(prev => 
      prev.includes(dayValue) 
        ? prev.filter(d => d !== dayValue) 
        : [...prev, dayValue].sort() // Ordena los días
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    let payload = { ...formData };
    
    // Construir el objeto 'repetition' si está activado
    if (useRepetition) {
      if (!repEndDate) {
        MySwal.fire('Error', 'Debe seleccionar una fecha "Hasta día" para la repetición.', 'error');
        setIsLoading(false);
        return;
      }
      
      payload.repetition = {
        type: repetitionType,
        endDate: repEndDate,
      };

      if (repetitionType === 'DAYS_OF_WEEK') {
        if (repDaysOfWeek.length === 0) {
          MySwal.fire('Error', 'Debe seleccionar al menos un día de la semana para la repetición.', 'error');
          setIsLoading(false);
          return;
        }
        payload.repetition.daysOfWeek = repDaysOfWeek;
      } else { // STANDARD
        payload.repetition.frequency = repFrequency;
        payload.repetition.unit = repUnit.value;
      }
    } else {
      delete payload.repetition; // Asegurarse que sea nulo si no se usa
    }
    
    // Limpieza de campos nulos opcionales
    if (!payload.especialidadId) delete payload.especialidadId;
    if (!payload.categoriaPrefId) delete payload.categoriaPrefId;
    
    try {
      const result = await createCapacity(payload);
      MySwal.fire({
        title: '¡Éxito!',
        text: `Capacidad instalada creada exitosamente (ID Apertura: ${result.aperturaEventId})`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      // --- 👇 ESTAS SON LAS LÍNEAS QUE RESETEAN EL FORMULARIO ---
      setFormData(initialFormData);
      setUseRepetition(false);
      setRepEndDate('');
      setRepDaysOfWeek([]);
      setRepFrequency(1);
      setRepUnit(repetitionUnits[1]);
      
    } catch (error) {
      console.error('Error al crear capacidad:', error);
      MySwal.fire(
        'Error',
        `No se pudo crear la capacidad: ${error.message}`,
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Fila 1 */}
      <FormGroup>
        <FormLabel>Centro (Sucursal)</FormLabel>
        <Select
          name="centroId"
          options={facilities}
          isLoading={loadingFacilities}
          onChange={handleSelectChange('centroId')}
          // --- 👇 AQUÍ ESTÁ LA CORRECCIÓN 1 ---
          value={facilities.find(f => f.value === formData.centroId) || null}
          placeholder="Seleccione un centro..."
          isClearable
          styles={selectStyles}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <FormLabel>Especialidad</FormLabel>
        <Select
          name="especialidadId"
          options={specialties}
          isLoading={loadingSpecialties}
          onChange={handleSelectChange('especialidadId')}
          // --- 👇 AQUÍ ESTÁ LA CORRECCIÓN 2 ---
          value={specialties.find(s => s.value === formData.especialidadId) || null}
          placeholder="Seleccione especialidad..."
          isClearable
          styles={selectStyles}
        />
      </FormGroup>

      {/* Fila 2 */}
      <FormGroup>
        <FormLabel>Proveedor (Médico)</FormLabel>
        <Select
          name="proveedorId"
          options={providers}
          isLoading={loadingProviders}
          onChange={handleSelectChange('proveedorId')}
          // --- 👇 AQUÍ ESTÁ LA CORRECCIÓN 3 ---
          value={providers.find(p => p.value === formData.proveedorId) || null}
          placeholder={!formData.centroId ? "Seleccione un centro primero" : "Seleccione un proveedor..."}
          isDisabled={!formData.centroId || loadingProviders}
          isClearable
          styles={selectStyles}
          required
        />
      </FormGroup>
      
      <FormGroup>
        <FormLabel>Número de Box</FormLabel>
        <Select
          name="numeroBoxId"
          options={boxes}
          isLoading={loadingBoxes}
          onChange={handleSelectChange('numeroBoxId')}
          // --- 👇 AQUÍ ESTÁ LA CORRECCIÓN 4 ---
          value={boxes.find(b => b.value === formData.numeroBoxId) || null}
          placeholder={!formData.centroId ? "Seleccione un centro primero" : "Seleccione un box..."}
          isDisabled={!formData.centroId || loadingBoxes}
          isClearable
          styles={selectStyles}
          required
        />
      </FormGroup>

      {/* Fila 3 */}
      <FormGroup>
        <FormLabel>Fecha</FormLabel>
        <Input 
          type="date" 
          name="fechaInicio"
          value={formData.fechaInicio}
          onChange={handleInputChange}
        />
      </FormGroup>
      
      <TimeWrapper>
        <FormGroup>
          <FormLabel>Hora Inicio</FormLabel>
          <Input 
            type="time" 
            name="horaInicio"
            value={formData.horaInicio}
            onChange={handleInputChange}
            step="1" // Para mostrar segundos
          />
        </FormGroup>
        <FormGroup>
          <FormLabel>Hora Fin</FormLabel>
          <Input 
            type="time" 
            name="horaFin"
            value={formData.horaFin}
            onChange={handleInputChange}
            step="1"
          />
        </FormGroup>
      </TimeWrapper>

      {/* Fila 4: Repetición */}
      <RepetitionWrapper>
        <CheckboxGroup>
          <Checkbox 
            type="checkbox" 
            id="useRepetition" 
            checked={useRepetition}
            onChange={(e) => setUseRepetition(e.target.checked)}
          />
          <FormLabel htmlFor="useRepetition">Repite</FormLabel>
        </CheckboxGroup>

        {useRepetition && (
          <Form> {/* Formulario anidado para layout */}
            <FormGroup>
              <FormLabel>Tipo de Repetición</FormLabel>
              <Select
                options={[
                  { label: 'Días de la semana', value: 'DAYS_OF_WEEK' },
                  { label: 'Repetición estándar', value: 'STANDARD' },
                ]}
                value={{ label: repetitionType === 'DAYS_OF_WEEK' ? 'Días de la semana' : 'Repetición estándar', value: repetitionType }}
                onChange={(opt) => setRepetitionType(opt.value)}
                styles={selectStyles}
              />
            </FormGroup>
            
            <FormGroup>
              <FormLabel>Hasta día</FormLabel>
              <Input
                type="date"
                value={repEndDate}
                onChange={(e) => setRepEndDate(e.target.value)}
              />
            </FormGroup>

            {repetitionType === 'DAYS_OF_WEEK' && (
              <FullWidthGroup>
                <FormLabel>Días de la semana:</FormLabel>
                <DaysOfWeekGroup>
                  {daysOfWeekMap.map(day => (
                    <DayLabel key={day.value}>
                      <Checkbox
                        type="checkbox"
                        checked={repDaysOfWeek.includes(day.value)}
                        onChange={() => handleDayToggle(day.value)}
                      />
                      {day.label}
                    </DayLabel>
                  ))}
                </DaysOfWeekGroup>
              </FullWidthGroup>
            )}

            {repetitionType === 'STANDARD' && (
              <TimeWrapper> {/* Reutilizando el layout de 2 columnas */}
                <FormGroup>
                  <FormLabel>Cada</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    value={repFrequency}
                    onChange={(e) => setRepFrequency(parseInt(e.target.value, 10))}
                  />
                </FormGroup>
                <FormGroup>
                  <FormLabel>Unidad</FormLabel>
                  <Select
                    options={repetitionUnits}
                    value={repUnit}
                    onChange={(opt) => setRepUnit(opt)}
                    styles={selectStyles}
                  />
                </FormGroup>
              </TimeWrapper>
            )}
          </Form>
        )}
      </RepetitionWrapper>
      
      {/* Fila 5: Información */}
      <FullWidthGroup>
        <FormLabel>Información / Comentarios</FormLabel>
        <Input 
          as="textarea"
          name="informacion"
          value={formData.informacion}
          onChange={handleInputChange}
          rows="3"
          placeholder="Información adicional para la apertura (ej: Ecografías Generales)"
        />
      </FullWidthGroup>

      <Button type="submit" disabled={isLoading || loadingFacilities || loadingSpecialties}>
        {isLoading ? 'Guardando...' : 'Guardar Capacidad'}
      </Button>
    </Form>
  );
};

export default CapacityForm;