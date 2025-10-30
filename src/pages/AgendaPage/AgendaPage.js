import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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

const MySwal = withReactContent(Swal);

// --- Estilos ---
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

// Mensaje específico para "Paciente no encontrado"
const NotFoundMessage = styled.p`
  color: #ef4444; /* Rojo */
  font-weight: bold;
  text-align: center;
  max-width: 700px; /* Alineado con la tarjeta de búsqueda */
  margin: -10px auto 20px auto; /* Espaciado ajustado */
`;

// Mensaje para otros errores
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

const AgendaPage = () => {
  const [searchResult, setSearchResult] = useState(null); // { exists: boolean, data?: array, rut?: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); // Errores generales (red, 500, sesión expirada)
  const [notFoundRut, setNotFoundRut] = useState(''); // Guarda el RUT que dio 404
  const [resetKey, setResetKey] = useState(0); // Trigger para limpiar PatientSearchForm

  const location = useLocation();

  // Hook para reiniciar al cambiar de ruta
  useEffect(() => {
    setSearchResult(null);
    setError('');
    setNotFoundRut('');
    // Incrementamos la key para disparar el reset en PatientSearchForm
    setResetKey(prevKey => prevKey + 1);
  }, [location]);

  const handlePatientSearch = async (rut, isForeigner, country) => {
    setLoading(true);
    setError('');
    setNotFoundRut('');
    setSearchResult(null); // Limpia resultado anterior ANTES de buscar

    try {
      const result = await searchPatientByRut(rut);
      if (result && Array.isArray(result.data) && result.data.length > 0) {
        setSearchResult({ exists: true, data: result.data }); // Éxito -> Mostrar PatientDataForm
      } else {
         console.warn("API devolvió éxito pero sin datos para el RUT:", rut);
         setNotFoundRut(rut); // Mostrar mensaje "no encontrado"
         setSearchResult({ exists: false, rut: rut }); // Mostrar NewPatientForm
      }
    } catch (err) {
      if (err.status === 404 || err.message === 'Paciente no encontrado') {
        setNotFoundRut(rut); // Mostrar mensaje "no encontrado"
        setSearchResult({
          exists: false, // ¡CLAVE! Indicar que no existe
          rut: rut,
          isForeigner: isForeigner,
          country: country
        }); // Mostrar NewPatientForm
      } else if (err.message.startsWith('SESSION_EXPIRED')) {
         setError('La sesión ha expirado. Por favor, inicie sesión de nuevo.');
         setSearchResult(null); // No mostrar formularios
      }
       else {
        const statusMsg = err.status ? `(Código: ${err.status})` : '';
        setError(`Error: ${err.message} ${statusMsg}`);
        setSearchResult(null); // No mostrar formularios
      }
    } finally {
      setLoading(false);
    }
  };

  // --- handleSaveNewPatient ---
  const handleSaveNewPatient = async (patientData) => {
    setLoading(true);
    setError('');
    setNotFoundRut('');
    try {
      const newPatient = await createNewPatient(patientData);
      setLoading(false);
      setSearchResult({ exists: true, data: [newPatient.data] }); // Mostrar PatientDataForm
      MySwal.fire('¡Éxito!', 'Paciente guardado correctamente.', 'success');
    } catch (err) {
      setLoading(false);
      const statusMsg = err.status ? `(Código: ${err.status})` : '';
      setError(`Error al guardar: ${err.message} ${statusMsg}`);
    }
  };

  // --- handleUpdatePatient ---
  const handleUpdatePatient = async (patientId, patientData) => {
    setLoading(true);
    setError('');
    setNotFoundRut('');
    try {
      const updatedPatient = await updatePatient(patientId, patientData);
      setLoading(false);
      setSearchResult({ exists: true, data: [updatedPatient.data] }); // Actualizar PatientDataForm
      MySwal.fire('¡Éxito!', 'Datos actualizados correctamente.', 'success');
    } catch (err) {
      setLoading(false);
      const statusMsg = err.status ? `(Código: ${err.status})` : '';
      setError(`Error al actualizar: ${err.message} ${statusMsg}`);
    }
  };

  return (
    <div>
      <Breadcrumb>
        <p>Páginas / <strong>Datos Paciente</strong></p>
      </Breadcrumb>

      {/* Formulario de Búsqueda (Siempre visible) */}
      <Card>
        {/* Pasamos resetKey como resetTrigger */}
        <PatientSearchForm
            onSearch={handlePatientSearch}
            resetTrigger={resetKey}
        />
      </Card>

      {/* Mensajes de Carga y Errores */}
      {loading && <LoadingMessage>Procesando...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {notFoundRut && !error && <NotFoundMessage>Paciente con RUT "{notFoundRut}" no encontrado.</NotFoundMessage>}


      {/* --- Renderizado Condicional de Resultados --- */}

      {/* Caso 1: Paciente SÍ existe -> Muestra PatientDataForm */}
      {searchResult?.exists === true && (
        <ResultCard>
          <PatientDataForm
            key={searchResult.data?.[0]?.id || 'edit-form'}
            initialData={searchResult.data} // Pasamos el array [{paciente}]
            onSave={handleUpdatePatient}
          />
        </ResultCard>
      )}

      {/* Caso 2: Paciente NO existe -> Muestra NewPatientForm */}
      {searchResult?.exists === false && (
        <ResultCard>
          <NewPatientForm
            key={searchResult.rut || 'new-form'}
            initialRut={searchResult.rut}
            onSave={handleSaveNewPatient}
          />
        </ResultCard>
      )}
    </div>
  );
};

export default AgendaPage;