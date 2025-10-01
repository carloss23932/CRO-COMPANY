# سكريبت تلقائي لإعداد Node.js وتشغيل خادم CRO
# تشغيل: .\SETUP_NODEJS.ps1

Write-Host "🚀 إعداد موقع CRO مع الإرسال التلقائي..." -ForegroundColor Green

# التحقق من وجود Node.js
Write-Host "`n🔍 فحص Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js موجود: $nodeVersion" -ForegroundColor Green
        $nodeExists = $true
    }
} catch {
    $nodeExists = $false
}

if (-not $nodeExists) {
    Write-Host "❌ Node.js غير مثبت" -ForegroundColor Red
    Write-Host "`n📥 يمكنك تحميله من:" -ForegroundColor Cyan
    Write-Host "https://nodejs.org/en/download/" -ForegroundColor Cyan
    Write-Host "`nبعد التثبيت، شغّل هذا السكريبت مرة أخرى." -ForegroundColor Yellow
    
    # محاولة فتح صفحة التحميل
    try {
        Start-Process "https://nodejs.org/en/download/"
        Write-Host "✅ تم فتح صفحة التحميل في المتصفح" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ افتح الرابط يدوياً" -ForegroundColor Yellow
    }
    
    Read-Host "`nاضغط Enter للخروج"
    exit
}

# تثبيت الحزم
Write-Host "`n📦 تثبيت الحزم المطلوبة..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ تم تثبيت الحزم بنجاح" -ForegroundColor Green
} catch {
    Write-Host "❌ خطأ في تثبيت الحزم" -ForegroundColor Red
    Read-Host "اضغط Enter للخروج"
    exit
}

# إعداد متغيرات البيئة
Write-Host "`n🔧 إعداد البريد الإلكتروني..." -ForegroundColor Yellow
$env:SMTP_USER = "nkslssk1987@gmail.com"
$env:TO_EMAIL = "nkslssk1987@gmail.com"

Write-Host "✅ تم إعداد البريد الإلكتروني" -ForegroundColor Green
Write-Host "⚠️ ملحوظة: لإرسال فعلي، تحتاج App Password من Gmail" -ForegroundColor Yellow

# تشغيل الخادم
Write-Host "`n🚀 بدء تشغيل الخادم..." -ForegroundColor Green
Write-Host "سيتم فتح الموقع على: http://localhost:3000" -ForegroundColor Cyan
Write-Host "اضغط Ctrl+C لإيقاف الخادم" -ForegroundColor Yellow

Start-Sleep 2

# فتح الموقع في المتصفح
try {
    Start-Process "http://localhost:3000"
} catch {
    Write-Host "⚠️ افتح http://localhost:3000 يدوياً" -ForegroundColor Yellow
}

# تشغيل الخادم
npm start