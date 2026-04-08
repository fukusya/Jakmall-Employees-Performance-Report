const { google } = require('googleapis');

const RANGES = [
  "'datkar raw'!A:AK",
  "'Rekap OKR Individu'!A:P",
  "'Dashboard 360'!A:AV",
  "'Employee Activity'!A:U",
  "Punishment!A:K",
  "Reward!A:D",
  "'Database karyawan training v2'!A:K",
  "'Employee History'!A:R"
];

module.exports = async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: process.env.SPREADSHEET_ID,
      ranges: RANGES,
      valueRenderOption: 'UNFORMATTED_VALUE',
    });

    // Cache 5 menit supaya tidak terlalu sering hit Sheets API
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    res.status(200).json(response.data);
  } catch (err) {
    console.error('Sheets API error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
