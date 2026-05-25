// Configuração compartilhada de URLs da aplicação

const isLocalDevelopment =
    window.location.protocol === 'file:' ||
    !window.location.hostname ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

const APP_CONFIG = {
    API_BASE_URL: isLocalDevelopment ? 'http://localhost:5000' : 'https://sistemacdl.onrender.com',
};

if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
    window.API_BASE_URL = APP_CONFIG.API_BASE_URL;
}

// Fallback caso config.js não tenha sido carregado
if (typeof window !== 'undefined' && !window.API_BASE_URL) {
    window.API_BASE_URL = 'http://localhost:5000';
}