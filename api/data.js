export default async function handler(req, res) {
    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    if (!KV_URL || !KV_TOKEN) {
          return res.status(500).json({ error: 'Banco de dados (KV) nao configurado no projeto.' });
    }

    try {
          if (req.method === 'GET') {
                  const key = req.query.key;
                  if (!key) return res.status(400).json({ error: 'Parametro key e obrigatorio.' });

                  const r = await fetch(`${KV_URL}/get/${encodeURIComponent(key)}`, {
                            headers: { Authorization: `Bearer ${KV_TOKEN}` }
                  });
                  const data = await r.json();
                  return res.status(200).json({ value: data.result != null ? data.result : null });
          }

          if (req.method === 'POST') {
                  const body = req.body || {};
                  const key = body.key;
                          const value = body.value;
                          if (!key) return res.status(400).json({ error: 'Campo key e obrigatorio.' });

                          const r = await fetch(`${KV_URL}/set/${encodeURIComponent(key)}`, {
                                    method: 'POST',
                                    headers: {
                                                Authorization: `Bearer ${KV_TOKEN}`,
                                                'Content-Type': 'application/json'
                                    },
                                              body: JSON.stringify(value === undefined ? null : value)
                          });
                  await r.json();
                  return res.status(200).json({ value });
          }

          res.setHeader('Allow', ['GET', 'POST']);
          return res.status(405).json({ error: 'Metodo nao permitido.' });
    } catch (err) {
          return res.status(500).json({ error: 'Erro interno ao acessar o banco de dados.' });
    }
}
