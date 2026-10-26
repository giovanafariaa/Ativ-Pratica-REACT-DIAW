import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// A API da turma (Express) não habilita CORS. Para não alterar o back-end,
// o servidor de desenvolvimento do Vite repassa (proxy) as chamadas /produtos
// para a API. Para o navegador, front-end e API passam a ter a mesma origem.
const API_TARGET = process.env.API_TARGET || 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/produtos': { target: API_TARGET, changeOrigin: true },
    },
  },
});
