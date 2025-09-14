// 📁 api/codesaher.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt, language } = req.body;

        if (!prompt || !language) {
            return res.status(400).json({ error: 'Missing prompt or language' });
        }

        // ✅ إرسال الطلب لـ Groq API
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    {
                        role: 'system',
                        content: 'أنت مساعد برمجي محترف. مهمتك: توليد كود كامل، نظيف، وقابل للتشغيل فورًا بدون أي تعليقات أو شروحات زائدة.'
                    },
                    {
                        role: 'user',
                        content: `
اللغة المطلوبة: ${language}
الطلب: ${prompt}
⚠️ التعليمات:
- لا تكتب أي شيء قبل أو بعد الكود.
- لا تستخدم Markdown (مثل: \`\`\`).
- لا تكتب تعليقات أو شرح.
- إذا كان طلب HTML/CSS/JS: اجعله ملف HTML كامل (مع DOCTYPE, head, body).
- إذا كان طلب C++, Java, Python, Go, Rust, C#...: اجعله كود كامل قابل للتشغيل (مع main() أو class أو function).
- لا تستخدم أي مكتبات خارجية إلا إذا طُلب.
- اجعل الكود متوافقًا مع البيئة الافتراضية.
                        `
                    }
                ],
                temperature: 0.2
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || 'Groq API error');
        }

        const generatedCode = data.choices[0].message.content.trim();

        res.status(200).json({ code: generatedCode });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
