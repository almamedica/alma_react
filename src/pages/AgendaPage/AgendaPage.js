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
  // getPatientById ya no se usa, quitado para limpiar el warning
} from '../../services/apiService';

import PatientSearchForm from '../../components/PatientSearchForm/PatientSearchForm';
import NewPatientForm from '../../components/NewPatientForm/NewPatientForm';
import PatientDataForm from '../../components/PatientDataForm/PatientDataForm';

const MySwal = withReactContent(Swal); 

// --- Estilos (Tus estilos) ---
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
  const navigate = useNavigate();

  useEffect(() => {
    setSearchResult(null);
    setError('');
    setNotFoundRut('');
    setResetKey(prevKey => prevKey + 1);
  }, [location]);

  
  // --- handlePatientSearch (Actualizado) ---
  // Acepta (rut, isForeigner, originalPasaporte)
  const handlePatientSearch = async (rut, isForeigner, originalPasaporte) => {
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
          pasaporte: originalPasaporte // Guardamos el pasaporte original
        });
      } else {
        setNotFoundRut(rut); 
        setSearchResult({ 
          exists: false, 
          rut: rut, // Este es el RUT combinado (ej: A58745862)
          isForeigner: isForeigner,
          pasaporte: originalPasaporte // Este es el DNI/Pasaporte (ej: A58745)
        }); 
      }
    } catch (err) {
      if (err.status === 404) {
        setNotFoundRut(rut); 
        setSearchResult({
          exists: false, 
          rut: rut,
          isForeigner: isForeigner,
          pasaporte: originalPasaporte
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


  // ==========================================================
  // --- handleSaveNewPatient (CON REDIRECCIÓN) ---
  // ==========================================================
  const handleSaveNewPatient = async (patientData) => {
    setLoading(true);
    setError('');
    setNotFoundRut('');
    try {
      // 1. Crear el paciente
      const newPatient = await createNewPatient(patientData); 
      const newPatientId = newPatient.data.id;
      // Obtenemos el nombre del mismo objeto que enviamos a la API
      const patientName = patientData.nombre; 

      MySwal.fire({
        title: '¡Éxito!', 
        text: 'Paciente guardado correctamente.', 
        icon: 'success',
        timer: 1100,
        showConfirmButton: false
      });
      
      // 2. Redirigir a la página de "Acciones"
      navigate(`/acciones/${newPatientId}`, { 
        state: { patientName: patientName } 
      });
      
    } catch (err) {
      setLoading(false);
      const statusMsg = err.status ? `(Código: ${err.status})` : '';
      setError(`Error al guardar: ${err.message} ${statusMsg}`);
    }
  };


  // ==========================================================
  // --- handleUpdatePatient (Lógica de Nacionalidad Corregida) ---
  // ==========================================================
  const handleUpdatePatient = async (patientId, patientData) => {
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
      let nacionalidadId;
      if (searchResult?.isForeigner) {
        const initialNacionalidad = searchResult.data[0]?.country_code;
        nacionalidadId = parseNumber(initialNacionalidad);
        
        if (!nacionalidadId) {
             console.warn(`Extranjero ${rut} no tiene 'country_code' en la BD. Asumiendo 152.`);
             nacionalidadId = 152; // Fallback a Chile
        }
      } else {
        nacionalidadId = 152; // ISONUM de Chile
      }
      
      const dtoPayload = {
        nombre: patientData.nombre,
        paterno: patientData.paterno,
        materno: patientData.materno,
        celular: patientData.celular,
        telefono_casa: patientData.telefono_casa || null,
        direccion: patientData.direccion,
        sexo: patientData.sexo,
        correo: patientData.email, 
        fecha_nacimiento: patientData.fecha_de_nacimiento, 
        prevision: parseNumber(patientData.prevision),
        ocupacion: parseNumber(patientData.occupation),
        region: parseNumber(patientData.city),   // DTO 'region' = DB 'city'
        comuna: parseNumber(patientData.state),  // DTO 'comuna' = DB 'state'
        nacionalidad: nacionalidadId,
      };

      await updatePatient(rut, dtoPayload); 

      MySwal.fire({
        title: '¡Éxito!', 
        text: 'Datos actualizados correctamente.', 
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });

      const patientName = dtoPayload.nombre;
      navigate(`/acciones/${dbId}`, { state: { patientName: patientName } });
    
    } catch (err) {
      setLoading(false);
      const statusMsg = err.status ? `(Código: ${err.status})` : '';
      setError(`Error al actualizar: ${err.message} ${statusMsg}`);
    }
  };


  // ==========================================================
  // --- CÁLCULO DE PROPS PARA NewPatientForm (LA CLAVE DEL BUG) ---
  // ==========================================================
  let newPatientProps = null;
  if (searchResult?.exists === false) {
    
    const rutCompleto = searchResult.rut;       // ej: A58745862
    const pasaporteOriginal = searchResult.pasaporte; // ej: "A58745"
    const isForeigner = searchResult.isForeigner;
    let nacionalidadId;

    if (isForeigner) {
      if (pasaporteOriginal && rutCompleto && rutCompleto.length > pasaporteOriginal.length) {
        // Extraemos el ISONUM del final del RUT combinado
        const isonum = rutCompleto.substring(pasaporteOriginal.length);
        nacionalidadId = parseNumber(isonum); // ej: 862
      } else {
         console.error("Error: Extranjero pero no se pudo extraer ISONUM o pasaporte");
         // Si 'pasaporte' es null/undefined, o es igual al rut, algo falló en la búsqueda
         nacionalidadId = undefined; // Dejará el campo 'nacionalidad' vacío
      }
    } else {
      nacionalidadId = 152; // ISONUM de Chile
      // pasaporteOriginal ya es 'null'
    }

    // Estas son las props que NewPatientForm espera
    newPatientProps = {
      initialRut: rutCompleto,
      initialPasaporte: pasaporteOriginal,
      initialNacionalidad: nacionalidadId 
    };
  }
  
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

      {loading && <LoadingMessage>Procesando...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {notFoundRut && !error && <NotFoundMessage>Paciente con RUT/DNI "{notFoundRut}" no encontrado.</NotFoundMessage>}

      {/* Caso 1: Paciente SÍ existe */}
      {searchResult?.exists === true && (
        <ResultCard>
          <PatientDataForm
            key={searchResult.data?.[0]?.id || 'edit-form'}
            initialData={searchResult.data} 
            onSave={handleUpdatePatient}
          />
        </ResultCard>
      )}

      {/* Caso 2: Paciente NO existe (CORREGIDO) */}
      {/* Renderiza solo si 'newPatientProps' se calculó correctamente */}
      {searchResult?.exists === false && newPatientProps && (
        <ResultCard>
          <NewPatientForm
            key={newPatientProps.initialRut}
            initialRut={newPatientProps.initialRut}
            initialPasaporte={newPatientProps.initialPasaporte}
            initialNacionalidad={newPatientProps.initialNacionalidad}
            onSave={handleSaveNewPatient}
          />
        </ResultCard>
      )}
    </div>
  );
};

export default AgendaPage;