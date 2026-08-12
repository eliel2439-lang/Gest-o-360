// Middleware desativado: a sincronizacao automatica generica apresentou risco de
// sobrescrever/perder dados reais devido a arquitetura em iframes do app (CRM roda
// em iframe com estado proprio, causando condicao de corrida). Desativado por seguranca.
// A correcao segura e funcional continua em /api/data.js (usada pelo modulo Financeiro).
export const config = { matcher: '/__disabled_sync__' };

export default function middleware(request) {
    return fetch(request);
}
