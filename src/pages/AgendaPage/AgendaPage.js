import React, { useState, useEffect } from 'react';
// --- 1. IMPORTAR useNavigate ---
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

import {
  searchPatientByRut,
  createNewPatient,
  updatePatient
} from '../../services/apiService';

import PatientSearchForm from '../../components/PatientSearchForm/PatientSearchForm';
import NewPatientForm from '../../components/NewPatientForm/NewPatientForm';
import PatientDataForm from '../../components/PatientDataForm/PatientDataForm';

// Mantenemos MySwal porque handleSaveNewPatient SÍ lo usa
const MySwal = withReactContent(Swal); 

// --- Estilos (Sin cambios) ---
const Card = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
  margin-bottom: 24px;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;
const ResultCard = styled.div`
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.06);
  margin-bottom: 24px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;
const Breadcrumb = styled.nav`
  max-width: 700px;
  margin: 0 auto 24px auto;
  font-size: 0.9rem;
  color: #6c757d;
`;
const NotFoundMessage = styled.p`
  color: #ef4444; /* Rojo */
  font-weight: bold;
  text-align: center;
  max-width: 700px; /* Alineado con la tarjeta de búsqueda */
  margin: -10px auto 20px auto; /* Espaciado ajustado */
`;
const ErrorMessage = styled.p`
  color: #dc3545; /* Rojo más oscuro */
  font-weight: bold;
  text-align: center;
  max-width: 700px;
  margin: -10px auto 20px auto;
`;
const LoadingMessage = styled.p`
  text-align: center;
`;
// --- Fin de Estilos ---


// --- Función Helper (Sin cambios) ---
const parseNumber = (value) => {
  const num = Number(value);
  if (isNaN(num) || num === 0) {
    return undefined; 
  }
  return num;
};

const AgendaPage = () => {
  const [searchResult, setSearchResult] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 
  const [notFoundRut, setNotFoundRut] = useState(''); 
  const [resetKey, setResetKey] = useState(0); 

  const location = useLocation();
  // --- 2. INICIALIZAR useNavigate ---
  const navigate = useNavigate();

  useEffect(() => {
    setSearchResult(null);
    setError('');
    setNotFoundRut('');
    setResetKey(prevKey => prevKey + 1);
  }, [location]);

  
  // (handlePatientSearch sin cambios)
  const handlePatientSearch = async (rut, isForeigner, country) => // country es { value: isonum, label: nombre }
  {
    setLoading(true);
    setError('');
    setNotFoundRut('');
    setSearchResult(null); 

    try {
      const result = await searchPatientByRut(rut); 
      
      if (result && Array.isArray(result.data) && result.data.length > 0) {
        setSearchResult({ 
          exists: true, 
          data: result.data, 
          isForeigner: isForeigner, 
          country: country        
        });
      } else {
        console.warn("API devolvió éxito pero sin datos para el RUT:", rut);
        setNotFoundRut(rut); 
        setSearchResult({ 
          exists: false, 
          rut: rut,
          isForeigner: isForeigner,
          country: country 
        }); 
      }
    } catch (err) {
      if (err.status === 404 || err.message === 'Paciente no encontrado') {
        setNotFoundRut(rut); 
        setSearchResult({
          exists: false, 
          rut: rut,
          isForeigner: isForeigner,
          country: country
        }); 
      } else if (err.message.startsWith('SESSION_EXPIRED')) {
        setError('La sesión ha expirado. Por favor, inicie sesión de nuevo.');
        setSearchResult(null); 
      }
      else {
        const statusMsg = err.status ? `(Código: ${err.status})` : '';
        setError(`Error: ${err.message} ${statusMsg}`);
        setSearchResult(null); 
      }
    } finally {
      setLoading(false);
    }
  };

  // --- handleSaveNewPatient (CORREGIDO) ---
  const handleSaveNewPatient = async (patientData) => {
    setLoading(true);
    setError('');
    setNotFoundRut('');
    try {
      // Idealmente, aquí también deberías "traducir" patientData a dtoPayload
      const newPatient = await createNewPatient(patientData); // (Asegúrate que NewPatientForm envíe el DTO correcto)
      setLoading(false);
      setSearchResult({ 
        exists: true, 
        data: [newPatient.data],
        isForeigner: searchResult.isForeigner,
        country: searchResult.country
      }); 
      
      // --- 3. MANTENER ESTA ALERTA ---
      MySwal.fire('¡Éxito!', 'Paciente guardado correctamente.', 'success');
      
      // (NO HAY REDIRECCIÓN AQUÍ)
      
    } catch (err) {
      setLoading(false);
      const statusMsg = err.status ? `(Código: ${err.status})` : '';
      setError(`Error al guardar: ${err.message} ${statusMsg}`);
    }
  };


  // --- handleUpdatePatient (CORREGIDO) ---
  const handleUpdatePatient = async (patientId, patientData) => {
    // 'patientData' viene de PatientDataForm.
    // Contiene: { ..., state: 101 (ComunaID), city: 13 (RegionID) }
    
    setLoading(true);
    setError('');
    setNotFoundRut('');

    const rut = searchResult?.data?.[0]?.['Rut/DNI'];
    const dbId = patientId;
    if (!rut) {
      setError('Error crítico: No se pudo encontrar el "Rut/DNI" del paciente.');
      setLoading(false);
      return;
    }

    try {
      // 1. Determinar Nacionalidad (ISONUM)
      let nacionalidadId;
      if (searchResult?.isForeigner) {
        if (searchResult.country && searchResult.country.value) {
          nacionalidadId = parseNumber(searchResult.country.value); // Toma el 'isonum' (ej: 862)
        }
        if (!nacionalidadId) {
           throw new Error(`Es extranjero pero no se pudo obtener el 'isonum' del país.`);
        }
      } else {
        nacionalidadId = 152; // ISONUM de Chile
      }
      
      // 2. "Traducir" el objeto 'patientData' (formato DB) 
      //    al objeto 'dtoPayload' (formato DTO)
      const dtoPayload = {
        // Mapeo directo
        nombre: patientData.nombre,
        paterno: patientData.paterno,
        materno: patientData.materno,
        celular: patientData.celular,
        direccion: patientData.direccion,
        sexo: patientData.sexo,
        correo: patientData.email, 
        
        // Enviar el string 'YYYY-MM-DD' directamente
        fecha_nacimiento: patientData.fecha_de_nacimiento, 
        
        // Mapeo de IDs (usando parseNumber)
        prevision: parseNumber(patientData.prevision),
        ocupacion: parseNumber(patientData.occupation),
        
        // Mapeo Invertido (DB -> DTO)
        // (DB 'city' es Región, DB 'state' es Comuna)
        region: parseNumber(patientData.city),   // DTO 'region' = DB 'city' (Región ID)
        comuna: parseNumber(patientData.state),  // DTO 'comuna' = DB 'state' (Comuna ID)

        // Lógica de Nacionalidad
        nacionalidad: nacionalidadId, // (envía el ISONUM)
      };

      // 3. Llamamos a la API con el payload DTO correcto
      await updatePatient(rut, dtoPayload); 

      setLoading(false);

      // (Actualización de UI opcional, ya que vamos a redirigir)
      const existingData = searchResult.data[0];
      const mergedData = { ...existingData, ...patientData };
      setSearchResult({ 
        ...searchResult, 
        data: [mergedData] 
      }); 

      // MySwal.fire('¡Éxito!', 'Datos actualizados correctamente.', 'success'); // <-- ELIMINADO

      // --- 4. AÑADIR REDIRECCIÓN ---
      const patientName = dtoPayload.nombre;
      navigate(`/acciones/${dbId}`, { state: { patientName: patientName } });
    
    } catch (err) {
      setLoading(false);
      const statusMsg = err.status ? `(Código: ${err.status})` : '';
      setError(`Error al actualizar: ${err.message} ${statusMsg}`);
    }
  };


  // --- RETURN (Renderizado) ---
  return (
    <div>
      <Breadcrumb>
        <p>Páginas / <strong>Datos Paciente</strong></p>
      </Breadcrumb>

      <Card>
        <PatientSearchForm
            onSearch={handlePatientSearch}
            resetTrigger={resetKey}
        />
      </Card>

      {/* Mensajes de Carga y Errores */}
      {loading && <LoadingMessage>Procesando...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {notFoundRut && !error && <NotFoundMessage>Paciente con RUT "{notFoundRut}" no encontrado.</NotFoundMessage>}

      {/* Caso 1: Paciente SÍ existe */}
      {searchResult?.exists === true && (
        <ResultCard>
          <PatientDataForm
            key={searchResult.data?.[0]?.id || 'edit-form'}
            initialData={searchResult.data} 
            onSave={handleUpdatePatient} // <-- Llama a la función corregida
          />
        </ResultCard>
      )}

      {/* Caso 2: Paciente NO existe */}
      {searchResult?.exists === false && (
        <ResultCard>
          <NewPatientForm
            key={searchResult.rut || 'new-form'}
            initialRut={searchResult.rut}
            isForeigner={searchResult.isForeigner}
            country={searchResult.country}
            onSave={handleSaveNewPatient}
          />
        </ResultCard>
      )}
    </div>
  );
};

export default AgendaPage;