import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // Auth-service på 8081
            '/api/auth': {
                target: 'http://localhost:8081',
                changeOrigin: true,
            },
            // Patient-service på 8082
            '/api/patients': {
                target: 'http://localhost:8082',
                changeOrigin: true,
            },
            '/api/messages': {
                target: 'http://localhost:8083', // message-service
                changeOrigin: true,
            }
        },
    },
});
