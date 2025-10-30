import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {
  verifyEmail,
  getRegions,
  getCommunesByRegion,
  getFinancers
} from '../../services/apiService';

const MySwal = withReactContent(Swal);

// --- Funciones Helper de Mapeo ---
/**
 * Mapea datos de la API a la estructura {id, name} que usa el <select>.
 * Esto maneja las inconsistencias de nombres (ej: 'id_region' a 'id', 'nombre' a 'name').
 */
const mapSelectOptions = (data, idKey, nameKey) => {
    if (!Array.isArray(data)) return [];
    
    return data.map(item => ({
        id: item[idKey],
        name: item[nameKey]
    }));
};

// --- Estilos ---
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;
const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;
const Label = styled.label`
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 0.9rem;
  color: #344767;
`;
const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d2d6da;
  border-radius: 0.375rem;
  font-size: 1rem;
  line-height: 1.5; /* Asegura altura consistente */

  &:read-only {
    background-color: #f8f9fa;
  }
`;
const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d2d6da;
  border-radius: 0.375rem;
  font-size: 1rem;
  height: calc(1.5em + 1rem + 2px); /* Altura igual al input (padding 8px * 2 + font-size 1rem + border 1px * 2) */
  box-sizing: border-box; /* Asegura que el padding no añada altura extra */
`;
const Button = styled.button`
  background-image: linear-gradient(195deg, #42424a 0%, #191919 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 0.5rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 16px;
  align-self: flex-end;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// --- ¡ESTILOS DE EMAIL CORREGIDOS! ---
const EmailGroup = styled(FormGroup)`
  /* No se necesita 'position: relative' */
`;

const EmailInputWrapper = styled.div`
  display: flex;
  align-items: center; /* Alinea verticalmente input y botón/badge */
  gap: 8px; /* Espacio entre input y botón/badge */
`;

// Input de Email modificado para que crezca
const EmailInput = styled(Input)`
  flex-grow: 1; /* Ocupa el espacio disponible */
`;

// Ajustamos padding y height para que coincida con el input
const VerifyBadge = styled.span`
  background-color: #4CAF50;
  color: white;
  padding: 8px 10px; /* Padding vertical igual al del input */
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap; /* Evita que el texto se parta */
  height: calc(1.5em + 1rem + 2px); /* Altura igual al input */
  box-sizing: border-box; /* Importante para que el padding no sume */
`;

// Ajustamos padding y height para que coincida con el input
const VerifyButton = styled.button`
  background: #1A73E8;
  color: white;
  border: none;
  padding: 8px 10px; /* Padding vertical igual al del input */
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  height: calc(1.5em + 1rem + 2px); /* Altura igual al input */
  box-sizing: border-box; /* Importante para que el padding no sume */

  &:disabled {
    background: #6c757d;
  }
`;
// --- Fin Estilos Corregidos ---

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const PatientDataForm = ({ initialData, onSave }) => {
  
  // 1. SOLUCIÓN AL WARNING: Usamos useMemo para calcular el objeto 'patient'.
  const patient = useMemo(() => {
    // Si initialData es un array con datos, extraemos el primer objeto.
    return (Array.isArray(initialData) && initialData.length > 0) ? initialData[0] : {};
  }, [initialData]); 

  const [formData, setFormData] = useState({
    rut: '',
    nombre: '',
    paterno: '',
    materno: '',
    email: '',
    celular: '',
    telefono_casa: '',
    sexo: '',
    fecha_de_nacimiento: '',
    region: '',
    comuna: '',
    direccion: '',
    prevision: '',
    conf_verifalia: 0,
  });

  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingSelects, setIsLoadingSelects] = useState(true);

  // Estados para los <select>
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [financers, setFinancers] = useState([]);

  // Rellena el formulario con los datos iniciales del paciente
  useEffect(() => {
    if (patient && patient['Rut/DNI']) {
      setFormData({
        rut: patient['Rut/DNI'] || '',
        nombre: patient.nombre || '',
        paterno: patient.paterno || '',
        materno: patient.materno || '',
        email: patient.email || '',
        celular: patient.celular || '',
        telefono_casa: patient.telefono_casa || '',
        sexo: patient.sexo || '',
        fecha_de_nacimiento: patient.fecha_de_nacimiento ? patient.fecha_de_nacimiento.split('T')[0] : '',
        
        // ¡CORRECCIÓN CLAVE! Mapeo invertido: city -> region, state -> comuna
        region: patient.city || '', 
        comuna: patient.state || '', 
        
        direccion: patient.direccion || '',
        prevision: patient.prevision || '',
        conf_verifalia: patient.conf_verifalia || 0,
      });
    }
  }, [patient]); // Dependencia: 'patient'

  // Carga de datos para los <select> (Regiones y Financiadores)
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        setIsLoadingSelects(true);
        const [regionsData, financersData] = await Promise.all([
          getRegions(),
          getFinancers()
        ]);

        // Mapeo 1. Regiones: API usa 'id_region', 'region'
        const mappedRegions = mapSelectOptions(regionsData?.data, 'id_region', 'region');
        
        // Mapeo 2. Financiadores: API usa 'codigo', 'nombre'
        const mappedFinancers = mapSelectOptions(financersData?.data, 'codigo', 'nombre');

        setRegions(mappedRegions);
        setFinancers(mappedFinancers);

      } catch (error) {
        console.error("Error cargando datos para selectores:", error);
        MySwal.fire('Error', `No se pudieron cargar datos iniciales: ${error.message}`, 'error');
      } finally {
        setIsLoadingSelects(false);
      }
    };
    loadSelectData();
  }, []); 

  // Carga de comunas cuando cambia la región seleccionada
  useEffect(() => {
    if (formData.region) {
      const loadCommunes = async () => {
        try {
          const communesData = await getCommunesByRegion(formData.region);
          
          // Mapeo 3. Comunas: API usa 'id', 'nombre'
          const mappedCommunes = mapSelectOptions(communesData?.data, 'id', 'nombre');

          setCommunes(mappedCommunes);
        } catch (error) {
          console.error("Error cargando comunas:", error);
          setCommunes([]); 
          MySwal.fire('Error', `No se pudieron cargar las comunas: ${error.message}`, 'error');
        }
      };
      loadCommunes();
    } else {
      setCommunes([]); 
    }
  }, [formData.region]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) {
       MySwal.fire('Atención', 'Por favor, ingrese un email para verificar.', 'warning');
       return;
    }
    setIsVerifying(true);
    try {
      await verifyEmail(formData.email, formData.rut);
      setFormData(prev => ({ ...prev, conf_verifalia: 1 }));
      MySwal.fire('¡Verificado!', 'El email es válido.', 'success');
    } catch (error) {
      MySwal.fire('Email no válido', `El email no pudo ser verificado: ${error.message}`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Mapeamos los datos de vuelta a la estructura que espera tu API
    const patientDataApi = {
      'Rut/DNI': formData.rut,
      nombre: formData.nombre,
      paterno: formData.paterno,
      materno: formData.materno,
      email: formData.email,
      celular: formData.celular,
      telefono_casa: formData.telefono_casa,
      sexo: formData.sexo,
      fecha_de_nacimiento: formData.fecha_de_nacimiento,
      
      // ¡Envío Invertido!
      state: formData.comuna, 
      city: formData.region, 
      
      direccion: formData.direccion,
      prevision: formData.prevision,
      conf_verifalia: formData.conf_verifalia,
    };

    // Aseguramos que el ID del paciente exista antes de llamar a onSave
    if (patient.id) {
        onSave(patient.id, patientDataApi); // Llama a 'handleUpdatePatient' de AgendaPage
    } else {
        MySwal.fire('Error', 'ID de paciente no encontrado para actualizar.', 'error');
    }
  };

  return (
    <div>
      <h4>Datos del Paciente (Modo Edición)</h4>
      <p>Editando datos de <strong>{formData.nombre} {formData.paterno}</strong> (RUT: <strong>{formData.rut}</strong>).</p>
      <br/>
      <Form onSubmit={handleSubmit}>

        <FormRow>
          <FormGroup>
            <Label htmlFor="rut">RUT / DNI</Label>
            <Input id="rut" name="rut" type="text" value={formData.rut} readOnly />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="paterno">Apellido Paterno</Label>
            <Input id="paterno" name="paterno" type="text" value={formData.paterno} onChange={handleChange} required />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="materno">Apellido Materno</Label>
            <Input id="materno" name="materno" type="text" value={formData.materno} onChange={handleChange} required />
          </FormGroup>
          
          {/* --- ¡EMAIL GROUP CORREGIDO! --- */}
          <EmailGroup>
            <Label htmlFor="email">Email</Label>
            <EmailInputWrapper> {/* Envolvemos input y botón/badge */}
              <EmailInput 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
              {formData.conf_verifalia === 1 ? (
                <VerifyBadge>
                  <CheckIcon /> VERIFICADO
                </VerifyBadge>
              ) : (
                <VerifyButton type="button" onClick={handleVerifyEmail} disabled={isVerifying}>
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </VerifyButton>
              )}
            </EmailInputWrapper>
          </EmailGroup>
          {/* ----------------------------- */}
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="celular">Teléfono</Label>
            <Input id="celular" name="celular" type="text" value={formData.celular} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="telefono_casa">2° Teléfono</Label>
            <Input id="telefono_casa" name="telefono_casa" type="text" value={formData.telefono_casa} onChange={handleChange} />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="sexo">Sexo</Label>
            <Select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange}>
              <option value="">Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="I">Indefinido</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="fecha_de_nacimiento">Fecha Nacimiento</Label>
            <Input id="fecha_de_nacimiento" name="fecha_de_nacimiento" type="date" value={formData.fecha_de_nacimiento} onChange={handleChange} />
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="region">Región</Label>
            <Select
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              disabled={isLoadingSelects}
            >
              <option value="">{isLoadingSelects ? 'Cargando...' : 'Seleccione región'}</option>
              {regions.map((region, index) => (
                <option key={region.id ?? `region-${index}`} value={region.id}>
                  {region.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="comuna">Comuna</Label>
            <Select
              id="comuna"
              name="comuna"
              value={formData.comuna}
              onChange={handleChange}
              disabled={!formData.region || communes.length === 0}
            >
              <option value="">{formData.region ? (communes.length > 0 ? 'Seleccione comuna' : 'Cargando/Sin comunas') : 'Seleccione una región primero'}</option>
              {communes.map((commune, index) => (
                <option key={commune.id ?? `commune-${index}`} value={commune.id}>
                  {commune.name}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="prevision">Financiador</Label>
            <Select
              id="prevision"
              name="prevision"
              value={formData.prevision}
              onChange={handleChange}
              disabled={isLoadingSelects}
            >
              <option value="">{isLoadingSelects ? 'Cargando...' : 'Seleccione financiador'}</option>
              {financers.map((fin, index) => (
                <option key={fin.id ?? `fin-${index}`} value={fin.id}>
                  {fin.name}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormRow>

        <Button type="submit" disabled={isVerifying}>Actualizar Datos</Button>
      </Form>
    </div>
  );
};

export default PatientDataForm;