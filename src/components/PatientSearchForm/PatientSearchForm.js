import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Select from 'react-select';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { getCountries } from '../../services/apiService';
import { validateRut } from '../../utils/validation';

const MySwal = withReactContent(Swal);

// --- Estilos (Sin cambios) ---
const FormContainer = styled.div`
  padding: 24px;
`;
const Title = styled.h3`
  margin: 0;
  text-align: center;
  font-size: 1.25rem;
  color: #344767;
  margin-bottom: 24px;
`;
const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d2d6da;
  border-radius: 0.375rem;
  font-size: 1rem;
`;
const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 16px;
  color: #344767;
`;
const Button = styled.button`
  background-image: linear-gradient(195deg, #49a3f1 0%, #1A73E8 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;
  width: 100%;
  font-size: 0.9rem;
`;
// Estilos para arreglar el z-index de react-select
const customSelectStyles = {
  menu: (provided) => ({
    ...provided,
    zIndex: 100
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 100
  })
};

// --- Componente ---
const PatientSearchForm = ({ onSearch, resetTrigger }) => {
  const [rut, setRut] = useState('');
  const [isForeigner, setIsForeigner] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);

  // Carga de países
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const data = await getCountries(); 
        if (data && data.data) {
          const mappedCountries = data.data.map(c => ({ 
            value: c.isonum, // <-- El 'value' es el isonum
            label: c.nombre 
          }));
          setCountries(mappedCountries);
        } else {
          console.warn('No se encontró data.data en la respuesta de países.');
        }
      } catch (error) {
        console.error("Error cargando países:", error);
        MySwal.fire('Error de Red', 'No se pudieron cargar los países.', 'error');
      } finally {
        setIsLoadingCountries(false);
      }
    };
    fetchCountries();
  }, []);

  // useEffect para limpiar el input (Sin cambios)
  useEffect(() => {
    if (resetTrigger > 0) { 
      console.log("Reset Trigger detectado en PatientSearchForm, limpiando RUT."); // DEBUG
      setRut(''); 
      setIsForeigner(false); 
      setSelectedCountry(null); 
    }
  }, [resetTrigger]); 

  // --- ¡¡FUNCIÓN MODIFICADA!! ---
  const handleSearchClick = (e) => {
    e.preventDefault(); 
    
    // 1. Validación (Esta lógica ya es correcta)
    // Solo valida si NO es extranjero
    if (!isForeigner && !validateRut(rut)) {
      MySwal.fire({
        title: 'RUT Inválido',
        text: 'Por favor, ingrese un RUT chileno válido (Ej: 12345678-9).',
        icon: 'error',
        confirmButtonColor: 'var(--primary-color)'
      });
      return; 
    }

    // 2. Lógica para crear el identificador final
    let identifierToSearch = rut; // Valor por defecto

    // Si es extranjero Y ha seleccionado un país...
    if (isForeigner && selectedCountry) {
        // ...anexamos el 'isonum' (guardado en 'value')
        identifierToSearch = rut + selectedCountry.value;
    }

    // 3. Llamar a onSearch con el identificador (modificado o no)
    onSearch(identifierToSearch, isForeigner, selectedCountry);
  };

  return (
    <FormContainer as="form" onSubmit={handleSearchClick}>
      <Title>Buscar Paciente</Title>
      
      <Input 
        type="text" 
        placeholder="Ingresar cédula de identidad, pasaporte o DNI"
        value={rut} 
        onChange={(e) => setRut(e.target.value)}
        required
        autoFocus 
      />

      {isForeigner && (
        <div style={{ marginTop: '16px' }}>
          <Select
            styles={customSelectStyles}
            menuPortalTarget={document.body}
            options={countries}
            placeholder={isLoadingCountries ? "Cargando países..." : "Seleccione País"}
            value={selectedCountry}
            onChange={setSelectedCountry}
            isClearable
            isDisabled={isLoadingCountries}
          />
        </div>
      )}

      <CheckboxContainer>
        <input 
          type="checkbox" 
          id="isForeigner" 
          checked={isForeigner}
          onChange={(e) => {
            setIsForeigner(e.target.checked);
            setSelectedCountry(null); 
          }}
        />
        <label htmlFor="isForeigner" style={{ marginLeft: '8px' }}>Extranjero</label>
      </CheckboxContainer>

      <Button type="submit">Buscar</Button>
    </FormContainer>
  );
};

export default PatientSearchForm;