const express = require('express');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// الحماية والأمان
app.use(helmet({
    contentSecurityPolicy: false, // للسماح بتحميل الملفات المحلية
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// حد معدل الطلبات لمنع الإساءة
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 3, // 3 محاولات فقط
    message: { ok: false, error: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
});

// تخدم الملفات الثابتة
app.use(express.static(path.join(__dirname)));

// تحقق من متغيرات البيئة المطلوبة
const requiredEnvVars = ['SMTP_USER', 'SMTP_PASS', 'TO_EMAIL'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.warn(`⚠️  متغيرات البيئة المفقودة: ${missingVars.join(', ')}`);
    console.warn('ملحوظة: سيعمل الخادم لكن لن تُرسل الرسائل فعلياً');
}

// إعداد SMTP
const createTransporter = () => {
    if (missingVars.length > 0) return null;
    
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE !== 'false',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
};

// مسار معالجة نموذج الاتصال
app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;

        // تحقق من البيانات المطلوبة
        if (!name?.trim() || !email?.trim() || !service || !message?.trim()) {
            return res.status(400).json({ ok: false, error: 'MISSING_FIELDS' });
        }

        // تحقق من صحة البريد الإلكتروني بشكل بسيط
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            return res.status(400).json({ ok: false, error: 'INVALID_EMAIL' });
        }

        const serviceNames = {
            android: 'تطوير تطبيقات Android',
            uiux: 'تصميم واجهات المستخدم UI/UX',
            improvement: 'تطوير وتحسين التطبيقات',
            consultation: 'استشارة تقنية'
        };

        const serviceName = serviceNames[service] || service;

        // إنشاء محتوى البريد
        const mailContent = `
=== رسالة جديدة من موقع CRO ===

الاسم: ${name.trim()}
البريد الإلكتروني: ${email.trim()}
الهاتف: ${phone?.trim() || 'غير محدد'}
الخدمة المطلوبة: ${serviceName}

الرسالة:
${message.trim()}

---
تم الإرسال في: ${new Date().toLocaleString('ar-EG', { timeZone: 'UTC' })}
        `.trim();

        // محاولة إرسال البريد
        const transporter = createTransporter();
        if (transporter) {
            await transporter.sendMail({
                from: `"موقع CRO" <${process.env.SMTP_USER}>`,
                to: process.env.TO_EMAIL,
                subject: `رسالة جديدة من ${name.trim()} - ${serviceName}`,
                text: mailContent,
                html: `<pre style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5;">${mailContent}</pre>`
            });

            console.log(`✅ تم إرسال رسالة من: ${name.trim()} (${email.trim()})`);
        } else {
            console.log(`📝 رسالة جديدة من: ${name.trim()} (${email.trim()}) - لم تُرسل بسبب نقص إعدادات SMTP`);
            console.log(mailContent);
        }

        res.json({ ok: true, message: 'MESSAGE_SENT' });

    } catch (error) {
        console.error('خطأ في إرسال البريد:', error.message);
        res.status(500).json({ ok: false, error: 'INTERNAL_ERROR' });
    }
});

// الصفحة الرئيسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// معالجة المسارات غير الموجودة
app.use((req, res) => {
    res.status(404).json({ ok: false, error: 'NOT_FOUND' });
});

// بدء الخادم
app.listen(PORT, () => {
    console.log(`🚀 الخادم يعمل على: http://localhost:${PORT}`);
    if (missingVars.length === 0) {
        console.log('✅ إعدادات البريد الإلكتروني مكتملة');
    } else {
        console.log('⚠️  إعدادات البريد الإلكتروني غير مكتملة - تحقق من متغيرات البيئة');
    }
    console.log('📱 افتح الموقع في المتصفح واختبر نموذج الاتصال');
});

module.exports = app;