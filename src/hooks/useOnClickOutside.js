// src/hooks/useOnClickOutside.js
import { useEffect } from 'react';

function useOnClickOutside(ref, handler) {
  useEffect(
    () => {
      const listener = (event) => {
        // No hacer nada si el clic es dentro del elemento referenciado o sus descendientes
        if (!ref.current || ref.current.contains(event.target)) {
          return;
        }
        handler(event);
      };

      document.addEventListener('mousedown', listener);
      document.addEventListener('touchstart', listener);

      // Función de limpieza que se ejecuta al desmontar el componente
      return () => {
        document.removeEventListener('mousedown', listener);
        document.removeEventListener('touchstart', listener);
      };
    },
    // Array de dependencias
    [ref, handler]
  );
}

export default useOnClickOutside;