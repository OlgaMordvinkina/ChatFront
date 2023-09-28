const route = '/api';

const config = {
    target: "http://localhost:8080",
    changeOrigin: true,
    secure: false,
    logLevel: "debug",
};

const PROXY_CONFIG = {
    [route]: config,
};

module.exports = PROXY_CONFIG