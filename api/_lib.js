const API = 'https://api.pixoupay.com';
const headers = () => ({ Authorization: 'Bearer ' + process.env.PIXOU_SECRET_TOKEN, 'Content-Type': 'application/json' });
async function tg(text) {
  console.log(text);
  const t = process.env.TELEGRAM_BOT_TOKEN, c = process.env.TELEGRAM_CHAT_ID;
  if (!t || !c) return;
  try {
    await fetch('https://api.telegram.org/bot' + t + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: c, text })
    });
  } catch (e) {}
}
module.exports = { API, headers, tg };
