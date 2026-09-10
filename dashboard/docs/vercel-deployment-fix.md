# 🔧 Vercel Deployment Fix

## 🚨 المشكلة

Vercel deployment فاشل على `develop` و `main` branches.

**الخطأ:** Vercel لا يجد ملفات الـproject لأن Root Directory غير مضبوط.

---

## ✅ الحل

### الخطوات:

1. **اذهب إلى Vercel Dashboard**
   - https://vercel.com/dashboard
   - اختر project: `insurflow-frontend`

2. **اضبط Root Directory**
   - Settings → General
   - Root Directory: `dashboard` ✅
   - احفظ

3. **تحقق من Build Settings**
   - Settings → Build & Development Settings
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Node.js Version:** 18.x أو أحدث

4. **Redeploy**
   - Deployments → اختر آخر failed deployment
   - اضغط "⋯" → Redeploy
   - ✅ الآن راح يشتغل!

---

## 📊 التحقق من النجاح

بعد الـredeploy، راح تشوف:

```
✅ Build successful
✅ Output: 366.14 kB (dist/assets/index-*.js)
✅ Deployment URL: https://insurflow-frontend-*.vercel.app
```

---

## 🎯 ملاحظات مهمة

### لماذا Root Directory: dashboard؟

المشروع عنده هيكل:

```
claims-management/
├── dashboard/          ← المشروع الفعلي (React + Vite)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
└── README.md
```

Vercel يحتاج يعرف أن الـproject في مجلد `dashboard/` وليس في الـroot.

---

## 🔐 الصلاحيات

إذا أعضاء الفريق يحتاجون access للـdeployments:

1. Vercel Dashboard → Settings → Team
2. Invite Team Members
3. اختر Role: Developer أو Admin

---

## 📝 الوثائق

- Vercel Monorepo Guide: https://vercel.com/docs/monorepos
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html#vercel

---

**بعد تطبيق الخطوات، الـdeployment راح يشتغل بشكل طبيعي! 🚀**
