const { API, headers, tg } = require('./_lib');
module.exports = async (req, res) => {
  const b = req.body || {};
  try {
    if (b.event === 'transaction.processed' && b.data && b.data.id) {
      // confere o status direto na PixouPay antes de avisar (o webhook não tem assinatura)
      const r = await fetch(API + '/transaction?id=' + encodeURIComponent(b.data.id), { headers: headers() });
      const j = await r.json().catch(() => ({}));
      if (j.data && j.data.status === 'paid') {
        const by = b.data.buyer || {};
        await tg('✅ PAGAMENTO CONFIRMADO\nID: ' + b.data.id + '\nNome: ' + (by.name || '-') + '\nTelefone: ' + (by.phone || '-') +
          '\nValor: R$ ' + (b.data.total_amount / 100).toFixed(2).replace('.', ',') + '\n(Endereço: veja a mensagem "NOVO PEDIDO" com o mesmo ID)');
      }
    }
  } catch (e) { console.error(e); }
  return res.status(200).json({ ok: true });
};
