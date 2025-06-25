import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const ENDPOINT = 'https://agric-opm0.onrender.com';   // ← no slash

export default function useForumSocket() {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;                 // wait until you really have the JWT

    // 1️⃣ create client — *no transports override*
    const socket = io(ENDPOINT, {
      // path: '/socket.io',               // default, keep for clarity
      auth: { token },
      transports: ['websocket',],
      autoConnect: true,                // default
      // withCredentials: false,        // no cookies, JWT is enough
    });
    socketRef.current = socket;

    // 2️⃣ lifecycle
    const onConnect       = () => { setIsConnected(true);  setError(null); };
    const onDisconnect    = () => setIsConnected(false);
    const onConnectError  = (err: any) => { setIsConnected(false); setError(err.message); };

    socket.on('connect',        onConnect);
    socket.on('disconnect',     onDisconnect);
    socket.on('connect_error',  onConnectError);

    console.log('[socket] created →', ENDPOINT);

    // 3️⃣ cleanup
    return () => {
      socket.off('connect',        onConnect);
      socket.off('disconnect',     onDisconnect);
      socket.off('connect_error',  onConnectError);
      socket.disconnect();
    };
  }, [token]);

  return { socket: socketRef.current, isConnected, error };
}
