const { API, headers, tg } = require('./_lib');
const AMOUNT = 4990; // R$ 49,90 em centavos (definido aqui no servidor, nunca pelo navegador)
const clean = (s, n) => String(s || '').trim().slice(0, n || 200);
const digits = (s) => String(s || '').replace(/\D/g, '');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const b = req.body || {};
  const nome = clean(b.nome, 100), email = clean(b.email, 100);
  let tel = digits(b.telefone);
  if (tel.length <= 11) tel = '55' + tel;
  const cep = digits(b.cep);
  const end = clean(b.endereco), num = clean(b.numero, 20), cid = clean(b.cidade, 80);
  const uf = clean(b.uf, 2).toUpperCase(), comp = clean(b.complemento, 100);
  if (nome.length < 3 || !/^\S+@\S+\.\S+$/.test(email) || tel.length < 12 || tel.length > 13 ||
      cep.length !== 8 || !end || !num || !cid || uf.length !== 2) {
    return res.status(400).json({ error: 'Dados inválidos.' });
  }
  const u = b.utm && typeof b.utm === 'object' ? b.utm : {};
  const tracking = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content', 'sck', 'src'].forEach(k => {
    if (u[k]) tracking[k] = clean(u[k], 100);
  });
  const external_id = 'fit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8);
  try {
    const r = await fetch(API + '/charge', {
      method: 'POST', headers: headers(),
      body: JSON.stringify({
        external_id, payment_method: 'pix', amount: AMOUNT,
        buyer: { name: nome, email, phone: tel },
        product: { name: 'FIT Formula Emagrecedora 60 caps' },
        tracking
      })
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || !j.data || !j.data.pix) {
      console.error('Erro PixouPay', r.status, JSON.stringify(j));
      return res.status(502).json({ error: 'Falha ao gerar o Pix.' });
    }
    const d = j.data;
    await tg('🛒 NOVO PEDIDO (aguardando pagamento)\nID: ' + d.id + '\nNome: ' + nome + '\nTelefone: ' + tel +
      '\nE-mail: ' + email + '\nEndereço: ' + end + ', ' + num + (comp ? ' - ' + comp : '') + ' - ' + cid + '/' + uf + ' - CEP ' + cep +
      '\nValor: R$ 49,90');
    return res.status(200).json({ id: d.id, code: d.pix.code, qrcode: d.pix.qrcode_base64 });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: 'Falha ao gerar o Pix.' });
  }
};
