import { io } from 'socket.io-client';
const URL = import.meta.env.VITE_LOCAL_ENDPOINT;
const socket = io(URL); //backend URL

export default socket;
