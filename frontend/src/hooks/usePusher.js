import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export const usePusher = (tenantId) => {
  const [yapeEvents, setYapeEvents] = useState([]);

  useEffect(() => {
    // Habilitar logs en la consola para debug
    Pusher.logToConsole = true;

    // Inicializar Pusher usando variables de entorno de Vite
    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER
    });

    const channelName = `tenant-${tenantId}`;
    const channel = pusher.subscribe(channelName);
    
    // Escuchamos el evento 'NuevoYape'
    channel.bind('NuevoYape', function(data) {
      console.log("%c 🚀 ¡FUNCIONANDO! PAGO RECIBIDO DESDE MACRODROID", "background: green; color: white; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 5px;");
      console.log("Datos recibidos:", data);
      
      // Agregamos el pago a la lista
      setYapeEvents((prevEvents) => [
        { ...data, id: Date.now() }, 
        ...prevEvents
      ]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [tenantId]);

  return { yapeEvents };
};
