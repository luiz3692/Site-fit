const { API, headers } = require('./_lib');
module.exports = async (req, res) => {
  const id = String(req.query.id || '');
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) return res.status(400).json({ error: 'id' });
  try {
    const r = await fetch(API + '/transaction?id=' + encodeURIComponent(id), { headers: headers() });
    const j = await r.json().catch(() => ({}));
    return res.status(200).json({ status: (j.data && j.data.status) || 'pending' });
  } catch (e) {
    return res.status(200).json({ status: 'pending' });
  }
};
