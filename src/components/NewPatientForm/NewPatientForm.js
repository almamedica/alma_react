import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { 
  verifyEmail, 
  getRegions, 
  getCommunesByRegion, 
  getFinancers // <--- CAMBIO
} from '../../services/apiService';

const MySwal = withReactContent(Swal);

// --- Estilos (Idénticos a PatientDataForm) ---
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
  
  &:read-only {
    background-color: #f8f9fa;
  }
`;
const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d2d6da;
  border-radius: 0.375rem;
  font-size: 1rem;
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
const EmailGroup = styled(FormGroup)`
  position: relative;
`;
const VerifyBadge = styled.span`
  background-color: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  position: absolute;
  top: 30px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 4px;
`;
const VerifyButton = styled.button`
  background: #1A73E8;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: bold;
  position: absolute;
  top: 30px;
  right: 10px;
  cursor: pointer;
  
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


const NewPatientForm = ({ initialRut, onSave }) => {
  //console.log('Rendering NewPatientForm con RUT:', initialRut);
  const [formData, setFormData] = useState({
    rut: initialRut || '',
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
  const [financers, setFinancers] = useState([]); // <--- CAMBIO

  // Carga de datos para los <select>
  useEffect(() => {
    const loadSelectData = async () => {
      try {
        setIsLoadingSelects(true);
        const [regionsData, financersData] = await Promise.all([
          getRegions(),
          getFinancers() // <--- CAMBIO
        ]);
        
        setRegions(regionsData.data || []);
        setFinancers(financersData.data || []); // <--- CAMBIO
        
      } catch (error) {
        console.error("Error cargando datos para selectores:", error);
        MySwal.fire('Error', 'No se pudieron cargar los datos de configuración.', 'error');
      } finally {
        setIsLoadingSelects(false);
      }
    };
    loadSelectData();
  }, []);

  // Carga de comunas
  useEffect(() => {
    if (formData.region) {
      const loadCommunes = async () => {
        try {
          const communesData = await getCommunesByRegion(formData.region);
          setCommunes(communesData.data || []);
        } catch (error) {
          console.error("Error cargando comunas:", error);
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
    if (!formData.email) return;
    setIsVerifying(true);
    try {
      await verifyEmail(formData.email);
      setFormData(prev => ({ ...prev, conf_verifalia: 1 }));
      MySwal.fire('¡Verificado!', 'El email es válido.', 'success');
    } catch (error) {
      MySwal.fire('Email no válido', `El email no pudo ser verificado.`, 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Mapeamos los nombres del formulario a los que espera tu API
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
      state: formData.region, // <--- CORREGIDO
      city: formData.comuna, // <--- CORREGIDO
      direccion: formData.direccion,
      prevision: formData.prevision,
      conf_verifalia: formData.conf_verifalia,
    };
    onSave(patientDataApi); // Llama a 'handleSaveNewPatient'
  };

  return (
    <div>
      <h4>Ingresar Datos del Paciente</h4>
      <p>El RUT <strong>{initialRut}</strong> no está registrado. Por favor, complete los siguientes datos.</p>
      <br/>
      <Form onSubmit={handleSubmit}>
        <FormRow>
          <FormGroup>
            <Label htmlFor="rut">RUT / DNI</Label>
            <Input id="rut" name="rut" type="text" value={formData.rut} readOnly />
          </FormGroup>
          {/* CAMPO PAÍS ELIMINADO */}
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
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            
            {formData.conf_verifalia === 1 ? (
              <VerifyBadge>
                <CheckIcon /> VERIFICADO
              </VerifyBadge>
            ) : (
              <VerifyButton type="button" onClick={handleVerifyEmail} disabled={isVerifying}>
                {isVerifying ? 'Verificando...' : 'Verificar'}
              </VerifyButton>
            )}
          </EmailGroup>
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
              {regions.map(region => (
                <option key={region.id_region} value={region.id_region}>
                  {region.region}
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
              disabled={!formData.region}
            >
              <option value="">{formData.region ? 'Seleccione comuna' : 'Seleccione una región primero'}</option>
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
            <Input id="direccion" name="direccion" type="text" value={formData.direccion} onChange={handleChange} />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="prevision">Financiador</Label> {/* <--- CAMBIO DE LABEL */}
            <Select 
              id="prevision" 
              name="prevision" 
              value={formData.prevision} 
              onChange={handleChange}
              disabled={isLoadingSelects}
            >
              <option value="">{isLoadingSelects ? 'Cargando...' : 'Seleccione financiador'}</option>
              {financers.map(fin => ( // <--- CAMBIO
                <option key={fin.codigo} value={fin.codigo}>
                  {fin.nombre}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FormRow>
        
        <Button type="submit" disabled={isVerifying}>Guardar Paciente</Button>
      </Form>
    </div>
  );
};

export default NewPatientForm;