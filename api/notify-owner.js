// 📁 api/notify-owner.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userEmail, username } = req.body;

        if (!userEmail || !username) {
            return res.status(400).json({ error: 'Missing user data' });
        }

        // ✅ إرسال إيميل لك (كمالك) عند تسجيل دخول جديد
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'King Abdo AI <onboarding@resend.dev>', // يمكنك تغييره لاحقًا
                to: 'YOUR_EMAIL@gmail.com', // ✅ استبدل هذا بإيميلك الحقيقي
                subject: '👑 تسجيل دخول جديد في بلاط الملك عبدو',
                html: `
                    <h2>جلالة الملك، هناك ضيف جديد في البلاط!</h2>
                    <p><strong>اسم المستخدم:</strong> ${username}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${userEmail}</p>
                    <p>تم تسجيل الدخول في: ${new Date().toLocaleString('ar-EG')}</p>
                    <hr>
                    <p style="color: #555; font-size: 0.9rem;">هذا إشعار تلقائي من نظام KING ABDO AI.</p>
                `
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ تم إرسال الإشعار بنجاح');
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