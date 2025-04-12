import { io } from 'socket.io-client';
const baseURL = import.meta.env.VITE_DEV_ENDPOINT;
const socket = io(baseURL); //backend URL

export default socket;
