/**
 * Valida un RUT chileno.
 * @param {string} rut El RUT a validar (ej: "12345678-9" o "12.345.678-9")
 * @returns {boolean} True si el RUT es válido, false si no.
 */
export const validateRut = (rut) => {
  if (typeof rut !== 'string') return false;

  // Limpia el RUT de puntos y guiones
  const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (rutLimpio.length < 2) return false; // Mínimo cuerpo + DV

  const body = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1);

  // Validamos que el cuerpo sea numérico
  if (!/^\d+$/.test(body)) return false; 

  let suma = 0;
  let multiplo = 2;

  // Calcula el dígito verificador
  for (let i = body.length - 1; i >= 0; i--) {
    suma += parseInt(body.charAt(i), 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvCalculado = 11 - (suma % 11);
  let dvEsperado = '';

  if (dvCalculado === 11) dvEsperado = '0';
  else if (dvCalculado === 10) dvEsperado = 'K';
  else dvEsperado = dvCalculado.toString();

  return dvEsperado === dv;
};