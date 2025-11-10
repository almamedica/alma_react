/**
 * Traduce los códigos de estado de la API a un formato legible.
 * Basado en la lógica de estado_utils.php
 * * @param {string} estado El código de estado (ej: '^', '*', 'x')
 * @param {string|null} wsp El código wsp (ej: 'CB' para Chatbot)
 * @returns {string} El texto legible
 */
export const formatApptStatus = (estado, wsp = null) => {
  
  switch (estado) {
    case 'A':
      return "Atendido";
    case '^':
      return "No Confirmado";
    case '*':
      return "Confirmado";
    case 'P':
      return "Pagado";
    case 't':
      return "No Contactado";
    case 'x':
      // Esta lógica comprueba si wsp es 'CB'
      return (wsp === 'CB') ? "Anulado CB" : "Anulado";
    case 'c':
      return "Confirmado CB";
    default:
      // Devolvemos el mismo estado si no lo conocemos
      return estado || "Desconocido";
  }
};