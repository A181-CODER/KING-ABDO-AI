export default async function handler(req, res) {
    // 1. التحقق من أن نوع الطلب هو POST فقط
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'طريقة الطلب غير مسموحة. استخدم POST فقط.' });
    }

    try {
        // 2. قراءة رسالة المستخدم من جسم الطلب
        const { userMessage } = req.body;

        if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
            return res.status(400).json({ error: 'الرسالة فارغة أو غير صالحة.' });
        }

        // 3. ✅ الحصول على مفتاح Groq من متغيرات البيئة (آمن تمامًا)
        //    ⚠️ لا تضع المفتاح هنا مباشرة! سيتم تعيينه في Vercel لاحقًا.
        const GROQ_API_KEY = process.env.GROQ_API_KEY;

        if (!GROQ_API_KEY) {
            console.error('❌ خطأ: متغير البيئة GROQ_API_KEY غير معرف.');
            return res.status(500).json({ error: 'خطأ داخلي في الخادم.' });
        }

        // 4. إرسال الطلب إلى Groq API
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant', // يمكنك تغيير الموديل إذا أردت
                messages: [
                    {
                        role: 'system',
                        content: 'أنت الملك عبدو، مساعد ذكي يتحدث بأسلوب ملكي راقي. استخدم لغة عربية فصحى مع بعض اللهجة العربية. كن محترماً، حكيماً، ومفصلاً في إجاباتك.'
                    },
                    {
                        role: 'user',
                        content: userMessage.trim()
                    }
                ],
                temperature: 0.7 // للتحكم في عشوائية الرد
            })
        });

        // 5. معالجة رد Groq
        const groqData = await groqResponse.json();

        // إذا كان هناك خطأ من Groq (مثل رصيد منتهي)
        if (!groqResponse.ok) {
            const errorMessage = groqData.error?.message || 'خطأ غير معروف من Groq API';
            console.error('❌ خطأ من Groq API:', errorMessage);
            return res.status(500).json({ error: 'عذراً يا مولاي، تعذر الحصول على رد في هذا الوقت.' });
        }

        // 6. ✅ استخراج رد الذكاء الاصطناعي وإرساله للمستخدم
        const aiReply = groqData.choices[0].message.content;

        res.status(200).json({ reply: aiReply });

    } catch (error) {
        // 7. التعامل مع أي أخطاء غير متوقعة
        console.error('🔥 خطأ في الخادم الخلفي:', error.message);
        res.status(500).json({ error: 'عذراً يا مولاي، حدث خطأ فني في البلاط.' });
    }
}