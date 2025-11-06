import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  verifyEmail, 
  getRegions, 
  getCommunesByRegion, 
  getFinancers,
  getOccupations
  // getCountries ya no se necesita
} from '../../services/apiService';

const MySwal = withReactContent(Swal);

// --- FUNCIÓN HELPER ---
const mapSelectOptions = (data, idKey, nameKey) => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    id: item[idKey],
    name: item[nameKey]
  }));
};

// --- Estilos (Tus estilos) ---
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
  line-height: 1.5;

  &:read-only {
    background-color: #f8f9fa;
  }
`;
const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d2d6da;
  border-radius: 0.375rem;
  font-size: 1rem;
  height: calc(1.5em + 1rem + 2px);
  box-sizing: border-box;
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
const EmailGroup = styled(FormGroup)``;
const EmailInputWrapper = styled.div`
  display: flex;
  align-items: center; 
  gap: 8px; 
`;
const EmailInput = styled(Input)`
  flex-grow: 1; 
`;
const VerifyBadge = styled.span`
  background-color: #4CAF50;
  color: white;
  padding: 8px 10px; 
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap; 
  height: calc(1.5em + 1rem + 2px); 
  box-sizing: border-box; 
`;
const VerifyButton = styled.button`
  background: #1A73E8;
  color: white;
  border: none;
  padding: 8px 10px; 
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  cursor: pointer;
  white-space: nowrap;
  height: calc(1.5em + 1rem + 2px); 
  box-sizing: border-box; 

  &:disabled {
    background: #6c757d;
  }
`;
const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
// --- Fin Estilos ---


// --- COMPONENTE ---
const NewPatientForm = ({ initialRut, initialPasaporte, initialNacionalidad, onSave }) => {
  
  const [formData, setFormData] = useState({
    rut: initialRut || '',
    pasaporte: initialPasaporte || null,
    nacionalidad: initialNacionalidad || '', // <-- Recibe la prop
    nombre: '',
    paterno: '',
    materno: '',
    email: '',
    celular: '',
    telefono_casa: '', // <-- 2do teléfono
    sexo: '',
    fecha_de_nacimiento: '',
    region: '',
    comuna: '',
    direccion: '',
    prevision: '',
    ocupacion: '',
    conf_verifalia: 0,
  });
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isLoadingSelects, setIsLoadingSelects] = useState(true);
  
  // Estados para los <select>
  const [regions, setRegions] = useState([]);
  const [communes, setCommunes] = useState([]);
  const [financers, setFinancers] = useState([]);
  const [occupations, setOccupations] = useState([]);

  // Carga de datos (sin 'getCountries')
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        setIsLoadingSelects(true);
        const [regionsData, financersData, occupationsData] = await Promise.all([
          getRegions(),
          getFinancers(),
          getOccupations()
        ]);
        
        setRegions(mapSelectOptions(regionsData?.data, 'id_region', 'region'));
        setFinancers(mapSelectOptions(financersData?.data, 'codigo', 'nombre'));
        setOccupations(mapSelectOptions(occupationsData?.data, 'id', 'nombre'));
        
      } catch (error) {
        console.error("Error cargando datos para selectores:", error);
        MySwal.fire('Error', 'No se pudieron cargar los datos de configuración.', 'error');
      } finally {
        setIsLoadingSelects(false);
      }
    };
    loadSelectData();
  }, []);

  // Carga de comunas (sin cambios)
  useEffect(() => {
    if (formData.region) {
      const loadCommunes = async () => {
        try {
          const communesData = await getCommunesByRegion(formData.region);
          setCommunes(mapSelectOptions(communesData?.data, 'id', 'nombre'));
        } catch (error) {
          console.error("Error cargando comunas:", error);
          setCommunes([]);
        }
      };
      loadCommunes();
    } else {
      setCommunes([]);
    }
  }, [formData.region]);

  // handleChange (sin cambios)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // handleVerifyEmail (sin cambios)
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!formData.email) return;
    setIsVerifying(true);
    try {
      await verifyEmail(formData.email, formData.rut); 
      setFormData(prev => ({ ...prev, conf_verifalia: 1 }));
      MySwal.fire('¡Verificado!', 'El email es válido.', 'success');
    } catch (error) {
      MySwal.fire('Email no válido', `El email no pudo ser verificado.`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  // handleSubmit (envía 'telefono_casa')
  const handleSubmit = (event) => {
    event.preventDefault();

    const patientDataApi = {
      rut: formData.rut,
      pasaporte: formData.pasaporte,
      nombre: formData.nombre,
      paterno: formData.paterno,
      materno: formData.materno,
      correo: formData.email,
      celular: formData.celular,
      telefono_casa: formData.telefono_casa || null, // <-- Envía el 2do teléfono
      fecha_nacimiento: formData.fecha_de_nacimiento,
      sexo: formData.sexo,
      prevision: Number(formData.prevision),
      nacionalidad: Number(formData.nacionalidad), // <-- Envía el valor de la prop
      direccion: formData.direccion,
      comuna: Number(formData.comuna),
      region: Number(formData.region),
      ocupacion: Number(formData.ocupacion),
    };
    
    onSave(patientDataApi);
  };

  // --- JSX (SIN dropdown de Nacionalidad) ---
  return (
    <div>
      <h4>Ingresar Datos del Paciente</h4>
      <p>El RUT/DNI <strong>{initialRut}</strong> no está registrado. Por favor, complete los siguientes datos.</p>
      <br/>
      <Form onSubmit={handleSubmit}>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="rut">RUT / DNI (Identificador)</Label>
            <Input 
              id="rut" 
              name="rut" 
              type="text" 
              value={formData.rut} 
              readOnly 
            />
          </FormGroup>
          <div /> 
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" name="nombre" type="text" value={formData.nombre} onChange={handleChange} required autoFocus />
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
          <EmailGroup>
            <Label htmlFor="email">Email</Label>
            <EmailInputWrapper>
              <EmailInput id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
              {formData.conf_verifalia === 1 ? (
                <VerifyBadge><CheckIcon /> VERIFICADO</VerifyBadge>
              ) : (
                <VerifyButton type="button" onClick={handleVerifyEmail} disabled={isVerifying}>
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </VerifyButton>
              )}
            </EmailInputWrapper>
          </EmailGroup>
        </FormRow>

        {/* Fila de Teléfonos (con 2do teléfono) */}
        <FormRow>
          <FormGroup>
            <Label htmlFor="celular">Teléfono</Label>
            <Input id="celular" name="celular" type="text" value={formData.celular} onChange={handleChange} required />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="telefono_casa">2° Teléfono</Label>
            <Input 
              id="telefono_casa" 
              name="telefono_casa" 
              type="text" 
              value={formData.telefono_casa} 
              onChange={handleChange} 
            />
          </FormGroup>
        </FormRow>

        {/* Fila de Sexo y Fecha (SIN Nacionalidad) */}
        <FormRow>
          <FormGroup>
            <Label htmlFor="sexo">Sexo</Label>
            <Select id="sexo" name="sexo" value={formData.sexo} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="fecha_de_nacimiento">Fecha Nacimiento</Label>
            <Input id="fecha_de_nacimiento" name="fecha_de_nacimiento" type="date" value={formData.fecha_de_nacimiento} onChange={handleChange} required/>
          </FormGroup>
        </FormRow>

        {/* Filas de Dirección (sin cambios) */}
        <FormRow>
          <FormGroup>
            <Label htmlFor="region">Región</Label>
            <Select 
              id="region" 
              name="region" 
              value={formData.region} 
              onChange={handleChange}
              disabled={isLoadingSelects}
              required
            >
              <option value="">{isLoadingSelects ? 'Cargando...' : 'Seleccione región'}</option>
              {regions.map(region => (
                <option key={region.id} value={region.id}>
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
              required
            >
              <option value="">
                {!formData.region 
                  ? 'Seleccione una región primero' 
                  : (communes.length > 0 ? 'Seleccione comuna' : 'Cargando...')
                }
              </option>
              {communes.map(commune => (
                <option key={commune.id} value={commune.id}>
                  {commune.name}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} required/>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="prevision">Financiador</Label>
            <Select 
              id="prevision" 
              name="prevision" 
              value={formData.prevision} 
              onChange={handleChange}
              disabled={isLoadingSelects}
              required
            >
              <option value="">{isLoadingSelects ? 'Cargando...' : 'Seleccione financiador'}</option>
              {financers.map(fin => (
                <option key={fin.id} value={fin.id}>
                  {fin.name}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormRow>

        <FormRow>
          <FormGroup>
            <Label htmlFor="ocupacion">Ocupación</Label>
            <Select 
              id="ocupacion" 
              name="ocupacion" 
              value={formData.ocupacion} 
              onChange={handleChange}
              disabled={isLoadingSelects}
              required
            >
              <option value="">{isLoadingSelects ? 'Cargando...' : 'Seleccione ocupación'}</option>
              {occupations.map(occ => (
                <option key={occ.id} value={occ.id}>
                  {occ.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <div />
        </FormRow>
        
        <Button type="submit" disabled={isVerifying}>Guardar Paciente</Button>
      </Form>
    </div>
  );
};

export default NewPatientForm;