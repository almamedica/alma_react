// --- 1. Lectura de Variables de Entorno ---
const BASE_URL = process.env.REACT_APP_API_BASE_URL;
const API_KEY = process.env.REACT_APP_API_KEY; 
const API_MAIL_URL = process.env.REACT_APP_API_MAIL_URL;
const API_MAIL_TOKEN = process.env.REACT_APP_API_MAIL_TOKEN;

// --- 2. Prefijo de tu API NestJS ---
const API_PREFIX = '/api_nestjs';

// --- 3. Funciones Helper para Tokens ---
// (getSession, setSession, getAccessToken, etc. sin cambios)
const setSession = (sessionData) => {
  if (sessionData) {
    localStorage.setItem('userSession', JSON.stringify(sessionData));
  } else {
    localStorage.removeItem('userSession');
  }
};

const getSession = () => {
  const sessionJSON = localStorage.getItem('userSession');
  try {
    return sessionJSON ? JSON.parse(sessionJSON) : null;
  } catch (e) {
    console.error("Error parseando la sesión de usuario desde localStorage", e);
    localStorage.removeItem('userSession'); 
    return null;
  }
};

const getAccessToken = () => {
  const session = getSession();
  const tokenValue = session?.data?.token || null; 
  return tokenValue;
};


let isRefreshing = false;
let refreshSubscribers = []; 

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = []; 
};

// --- 4. Funciones de Autenticación (Login y Logout) ---
// (loginUser y logoutUser sin cambios)
export const loginUser = async (username, password) => {
  const response = await fetch(`${BASE_URL}${API_PREFIX}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API_KEY': API_KEY 
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  if (!response.ok) {
     const errorMessage = data?.message || 'Error desconocido en el servidor.';
     throw new Error(errorMessage);
  }

  if (data.status === 'valid' && data.data && data.data.token) {
    setSession(data); 
  } else {
    throw new Error('Respuesta de login inválida. No se recibió data.token.');
  }
  
  return data;
};

export const logoutUser = () => {
  setSession(null);
  window.location.href = '/login'; 
};


// --- 5. Función de Renovación de Token ---
// (refreshToken sin cambios)
const refreshToken = async () => {
  const currentToken = getAccessToken(); 
  
  if (!currentToken) {
     console.error("Intento de refrescar sin token.");
     logoutUser(); 
     throw new Error('No hay token para refrescar.'); 
  }

  isRefreshing = true; 
  try {
    const response = await fetch(`${BASE_URL}${API_PREFIX}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API_KEY': API_KEY 
      },
      body: JSON.stringify({ token: currentToken }) 
    });

    const data = await response.json(); 
    if (!response.ok) {
       throw new Error(data?.message || 'Falló la renovación del token.'); 
    }

    const session = getSession();
    if (session) { 
        session.data.token = data.token;
        session.data.token_exp = data.token_exp;
        setSession(session);
        isRefreshing = false; 
        onRefreshed(session.data.token); 
        return session.data.token;
    } else {
        throw new Error('La sesión desapareció durante la renovación.');
    }

  } catch (error) {
    isRefreshing = false; 
    onRefreshed(null); 
    console.error("Error al renovar token, cerrando sesión.", error);
    logoutUser(); 
    throw error; 
  }
};

// --- 6. El Interceptor de API ---
// (apiFetch sin cambios)
const apiFetch = async (endpoint, options = {}) => {
  let token = getAccessToken();

  if (!token && !endpoint.startsWith('/auth/')) { 
     console.warn("No hay token de acceso al inicio de apiFetch, redirigiendo al login.");
     logoutUser();
     throw new Error('CLIENT_ERROR: No hay sesión activa.'); 
  }

  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`, 
  };

  let response = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, options);

  if (response.status === 401) {
    if (!isRefreshing) {
      try {
        const newAccessToken = await refreshToken(); 
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, options);
      } catch (error) {
        throw new Error('SESSION_EXPIRED: Falló la renovación del token.'); 
      }
    } else {
      return new Promise((resolve, reject) => { 
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            options.headers['Authorization'] = `Bearer ${newToken}`;
            fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, options)
              .then(resolve) 
              .catch(reject); 
            } else {
            reject(new Error('SESSION_EXPIRED: Falló la renovación del token.'));
          }
        });
      });
    }
  }

  if (!response.ok) {
    let errorMsg = `Error HTTP ${response.status}`;
    // Guardamos el status para adjuntarlo al error
    const errorStatus = response.status;
    try {
      const errorData = await response.json();
       errorMsg = errorData?.message || errorMsg;
     } catch(e) { /* Ignora si no hay cuerpo JSON */ }
     console.error(`Error final en apiFetch para ${endpoint}: ${errorMsg}`); 
     const error = new Error(errorMsg);
     error.status = errorStatus; // <-- Adjuntamos el status
     throw error;
  }

  return response; 
};


// --- 7. Funciones de API (Usan apiFetch) ---

export const searchPatientByRut = async (rut) => {
  // apiFetch ahora maneja todos los errores (incluido 404)
  const response = await apiFetch(`/patients/${rut}`, { method: 'GET' });
  // Si apiFetch no lanzó error, la respuesta es 200 OK
  return await response.json(); 
};

export const createNewPatient = async (patientData) => {
  const response = await apiFetch(`/patients`, {
    method: 'POST',
    body: JSON.stringify(patientData),
  });
  return await response.json();
};

export const updatePatient = async (rut, patientData) => {
  const response = await apiFetch(`/patients/${rut}`, {
    method: 'PUT',
    body: JSON.stringify(patientData),
  });
  return await response.json();
};
// --- ¡NUEVA FUNCIÓN AÑADIDA PARA VERIFALIA! ---
/**
 * Llama al endpoint de NestJS para actualizar el estado de Verifalia.
 * Usa apiFetch para la autenticación automática.
 */
export const updateVerifaliaStatus = async (identifier, status) => {
  console.log(`Actualizando estado Verifalia en NestJS para: ${identifier}`);
  const payload = { 
    status: status, 
    identifier: identifier 
  };
  
  const response = await apiFetch(`/statusVerifalia`, { // apiFetch añade el prefijo /api_nestjs
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  // apiFetch ya maneja errores !response.ok
  return await response.json();
};
// --- Fin Nueva Función ---


// --- Servicios Externos (Verifalia) ---

// --- ¡FUNCIÓN MODIFICADA! ---
// Ahora acepta 'rut' (identifier) como segundo argumento.
export const verifyEmail = async (email, rut) => { 
  if (!API_MAIL_URL || !API_MAIL_TOKEN) {
    console.error('Faltan variables de entorno para Verifalia.');
    throw new Error('Error de configuración al verificar email.');
  }

  if (!rut) {
    // Si el rut no está presente, no podremos llamar al endpoint de Nest.
    // Puedes decidir si esto es un error fatal o solo un warning.
    console.warn('verifyEmail fue llamado sin un RUT/identifier. No se podrá actualizar el estado en NestJS.');
    // Opcional: throw new Error('Se requiere RUT para verificar email.');
  }

  const formData = new FormData();
  formData.append('email', email);
  
  try {
    // 1. Llamada a la API EXTERNA (Verifalia)
    const response = await fetch(API_MAIL_URL, {
      method: 'POST',
      headers: { 'Authorization': API_MAIL_TOKEN }, 
      body: formData,
    });

    if (!response.ok) throw new Error(`Error de la API de Verifalia: ${response.statusText}`);
    
    const data = await response.json();
    
    // 2. Comprobar si la API externa fue exitosa
    if (data.status === 'Success' && data.classification === 'Deliverable') {
      
      // 3. Si fue exitosa, llamar a NUESTRA API (NestJS)
      if (rut) {
        try {
          // Llama a la nueva función que usa apiFetch
          await updateVerifaliaStatus(rut, 1); 
          console.log('Estado de Verifalia actualizado en NestJS con éxito.');
        
        } catch (apiError) {
          // El email se verificó (Paso 1 OK), pero falló la actualización en Nest (Paso 3 Falló).
          // El usuario debe ver el éxito, pero debemos registrar el error interno.
          console.error('Email verificado en Verifalia, pero falló al actualizar estado en NestJS:', apiError);
          // NO relanzamos el error (no hacemos 'throw apiError'), 
          // porque para el usuario, el email SÍ es válido.
        }
      }
      
      return data; // Retorna el éxito de Verifalia

    }

    // Si Verifalia dijo que no es "Deliverable"
    throw new Error(data.classification || 'Email no válido');

  } catch (error) {
    console.error('Error al verificar email:', error);
    throw error; // Relanza el error para que el componente lo atrape
  }
};
// --- Fin Función Modificada ---

// --- Funciones para Cargar Selects (Usan apiFetch) ---
// (getCountries, getRegions, getCommunesByRegion, getFinancers sin cambios)
export const getCountries = async () => {
  const response = await apiFetch(`/countries`, { method: 'GET' });
  return await response.json();
};

export const getRegions = async () => {
  const response = await apiFetch(`/regions`, { method: 'GET' });
  return await response.json();
};

export const getCommunesByRegion = async (regionId) => {
  // Si no hay regionId, devolvemos un array vacío para evitar llamar a /communes/
  if (!regionId) {
    return { data: [] }; 
  }
  const response = await apiFetch(`/communes/${regionId}`, { method: 'GET' });
  return await response.json();
};

export const getFinancers = async () => {
  const response = await apiFetch(`/financers`, { method: 'GET' });
  return await response.json();
};

export const getOccupations = async () => {
  const response = await apiFetch(`/occupations`, { method: 'GET' });
  return await response.json();
};

export const getConsultationSpecialties = async () => {
  const response = await apiFetch(`/specialties/consultations`, { method: 'GET' });
  return await response.json();
};

/**
 * Obtiene los datos del paciente por id.
 */
export const getPatientById = async (id) => {
  const response = await apiFetch(`/patients/id/${id}`, { method: 'GET' });
  return await response.json(); 
};

/**
 * Obtiene la lista de prestaciones filtrada por el ID de la especialidad.
 */
export const getPrestationsBySpecialty = async (specialtyId) => {
  const response = await apiFetch(`/specialties/${specialtyId}`, { method: 'GET' });
  return await response.json();
};

/**
 * Obtiene la lista de sucursales (facilities) filtrada por el ID de la prestación.
 */
export const getFacilitiesByPrestation = async (prestationId) => {
  const response = await apiFetch(`/facilities/by-prestation/${prestationId}`, { method: 'GET' });
  return await response.json();
};


/**
 * Obtiene la disponibilidad de horas según prestación, edad y sucursal.
 * Construye la URL con Query Params.
 */
export const getAvailability = async (categorieId, age, facilityId) => {
  // 1. Validar que los parámetros obligatorios existan
  if (!categorieId || !age || !facilityId) {
    throw new Error('Faltan parámetros obligatorios (categorie, age, facility) para buscar disponibilidad.');
  }

  // 2. Construir los parámetros de consulta (Query Params)
  const params = new URLSearchParams({
    categorie: categorieId,
    age: age,
    facility: facilityId
  });

  // 3. Llamar a la API (apiFetch maneja el token y /api_nestjs)
  // La URL final será: /api_nestjs/availability?categorie=...&age=...&facility=...
  const response = await apiFetch(`/availability?${params.toString()}`, { method: 'GET' });
  return await response.json();
};