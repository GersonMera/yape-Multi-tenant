import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';

export const usePusher = (tenantId, onNewYape) => {
  useEffect(() => {
    Pusher.logToConsole = true;

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER
    });

    const channelName = `tenant-${tenantId}`;
    const channel = pusher.subscribe(channelName);
    
    channel.bind('NuevoYape', function(data) {
      console.log("%c 🚀 ¡FUNCIONANDO! PAGO RECIBIDO DESDE MACRODROID", "background: green; color: white; font-size: 20px; font-weight: bold; padding: 10px; border-radius: 5px;");
      console.log("Datos recibidos:", data);
      
      if (onNewYape) {
        onNewYape({ ...data, id: Date.now() });
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [tenantId, onNewYape]);
};

