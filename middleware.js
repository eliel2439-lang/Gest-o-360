// Middleware desativado por seguranca (segunda tentativa tambem se mostrou arriscada:
// o modulo CRM tem logica interna de reset/seed que conflita com sincronizacao externa
// e pode sobrescrever dados reais no banco). A correcao segura confirmada continua em
// /api/data.js, usada pelo modulo Financeiro.
export const config = { matcher: '/__disabled_sync__' };

export default function middleware(request) {
      return fetch(request);
}
