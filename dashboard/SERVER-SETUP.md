# إعدادات السيرفر - Backend Server Configuration

## السيرفر الحالي / Current Server
```
https://insurflow-backend.onrender.com/api/v1
```

## الإعدادات / Configuration

ملف `.env` يجب أن يحتوي على:
```env
VITE_API_BASE_URL=https://insurflow-backend.onrender.com/api/v1
VITE_USE_MOCK_API=false
```

## اختبار الاتصال / Test Connection

### من PowerShell:
```powershell
$body = @{
    organizationCode = "DEMO-INS"
    employeeCode = "AD-001"
    password = "Password123!"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://insurflow-backend.onrender.com/api/v1/auth/login" -ContentType "application/json" -Body $body -TimeoutSec 30
```

### حسابات الاختبار / Test Accounts:
- **Admin**: `AD-001` / `Password123!`
- **Claims Officer**: `CO-001` / `Password123!`
- **Organization Code**: `DEMO-INS`

## تشغيل التطبيق / Run Application

```bash
npm run dev
```

التطبيق سيعمل على: http://localhost:5173 (أو أقرب منفذ متاح)

## ملاحظات مهمة / Important Notes

1. **Render Free Tier**: قد يستغرق السيرفر 30-60 ثانية للاستيقاظ من وضع النوم في أول طلب
2. **Mock API**: يجب أن يكون `VITE_USE_MOCK_API=false` لاستخدام السيرفر الحقيقي
3. **NGROK**: لا حاجة لإعدادات ngrok عند استخدام سيرفر Render

## التبديل بين السيرفرات / Switch Servers

### سيرفر Render (الافتراضي):
```env
VITE_API_BASE_URL=https://insurflow-backend.onrender.com/api/v1
VITE_USE_MOCK_API=false
```

### Mock API (للتطوير بدون سيرفر):
```env
VITE_API_BASE_URL=https://insurflow-backend.onrender.com/api/v1
VITE_USE_MOCK_API=true
```

### سيرفر محلي (إذا كان متاح):
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_USE_MOCK_API=false
```
