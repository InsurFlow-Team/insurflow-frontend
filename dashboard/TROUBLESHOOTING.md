# 🔍 Troubleshooting: Field Adjusters Not Showing

## 🚨 المشكلة

عندك 2 Field Adjusters في الـbackend، بس مش ظاهرين في الـdashboard.

---

## ✅ الحلول المحتملة

### **1. تحقق من الـBackend API Response**

افتحي Developer Tools → Network → اعملي refresh للصفحة → شوفي الـrequest:

```
GET /api/v1/users
```

**شوفي الـresponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "...",
      "role": "FIELD_ADJUSTER",  ← هل موجود؟
      ...
    }
  ]
}
```

**الأسباب المحتملة:**
- ❌ الـrole في الـdatabase مكتوب غلط (مثلاً: `field_adjuster` بدل `FIELD_ADJUSTER`)
- ❌ الـField Adjusters status = `INACTIVE`
- ❌ الـField Adjusters في organization ثاني
- ❌ الـbackend فيه filter مخفي

---

### **2. فحص الـDatabase مباشرة**

في الـMongoDB أو أي database تستخدميها:

```javascript
// MongoDB example
db.users.find({ role: "FIELD_ADJUSTER" })

// شوفي النتيجة - هل موجودين؟
```

**تأكدي من:**
- ✅ الـrole مكتوب بالضبط: `FIELD_ADJUSTER` (uppercase)
- ✅ الـstatus = `ACTIVE` (أو أي status مقبول)

---

### **3. فحص الـFrontend Filter**

في `dashboard/src/pages/Users.tsx` السطر 207:

```typescript
fieldAdjusters: users.filter((user) => user.role === "FIELD_ADJUSTER").length
```

**اختبري:**

1. افتحي Console في المتصفح
2. اكتبي:

```javascript
// شوفي كل الـusers
console.log(users)

// فلتري Field Adjusters
console.log(users.filter(u => u.role === "FIELD_ADJUSTER"))

// شوفي الـroles الموجودة
console.log([...new Set(users.map(u => u.role))])
```

---

### **4. أضيفي Logging مؤقت**

في `dashboard/src/pages/Users.tsx`، ضيفي بعد السطر 205:

```typescript
const stats = useMemo(() => {
  const active = users.filter(
    (user) => getUserStatus(user) === "ACTIVE",
  ).length;

  // 🔍 Debugging logs
  console.log("📊 All users:", users);
  console.log("📊 Field Adjusters:", users.filter((user) => user.role === "FIELD_ADJUSTER"));
  console.log("📊 All roles:", [...new Set(users.map(u => u.role))]);

  return {
    total: users.length,
    // ... rest
```

---

### **5. تحقق من الـBackend Endpoint**

تأكدي أن الـbackend endpoint `/users` يرجع **كل** الـusers بدون filter.

في بعض الأحيان، الـbackend يفلتر حسب الـorganization أو الـpermissions.

**الحل:**
- افحصي الـbackend code للـendpoint `/users`
- تأكدي إنه يرجع كل الـusers بدون filter

---

### **6. Case Sensitivity Issue**

أحياناً الـrole يكون مخزن بطريقة مختلفة:

```typescript
// في الـdatabase ممكن يكون:
"Field_Adjuster"  // ❌ Wrong
"field-adjuster"   // ❌ Wrong  
"FIELD_ADJUSTER"   // ✅ Correct
"fieldAdjuster"    // ❌ Wrong
```

**الحل:**
- غيري الـfilter ليكون case-insensitive:

```typescript
fieldAdjusters: users.filter(
  (user) => user.role?.toUpperCase() === "FIELD_ADJUSTER"
).length
```

---

## 🔧 Quick Fix: أضيفي Debug Component

اعملي component صغير للـdebug:

```typescript
// في Users.tsx، قبل الـreturn
if (process.env.NODE_ENV === 'development') {
  console.group('👥 Users Debug');
  console.log('Total users:', users.length);
  console.log('Roles breakdown:', {
    admins: users.filter(u => u.role === 'ADMIN').length,
    officers: users.filter(u => u.role === 'CLAIMS_OFFICER').length,
    adjusters: users.filter(u => u.role === 'FIELD_ADJUSTER').length,
  });
  console.log('Field Adjusters:', users.filter(u => u.role === 'FIELD_ADJUSTER'));
  console.groupEnd();
}
```

---

## 📊 Expected vs Actual

### **متوقع:**
```
Total users: 5
Field Adjusters: 2
```

### **فعلي (المشكلة):**
```
Total users: 3
Field Adjusters: 0
```

---

## ✅ Checklist

قبل ما تسأليني، تحققي من:

- [ ] الـbackend يرجع 5 users (3 موجودين + 2 Field Adjusters)
- [ ] الـrole في الـdatabase مكتوب صح: `FIELD_ADJUSTER`
- [ ] الـField Adjusters status = `ACTIVE`
- [ ] الـbackend endpoint `/users` مش فيه filter مخفي
- [ ] الـtoken اللي تستخدميه عنده صلاحيات يشوف كل الـusers
- [ ] الـorganization ID صحيح

---

## 🎯 الحل الأسرع

1. افتحي Developer Tools → Console
2. افتحي صفحة Users
3. اكتبي في Console:

```javascript
// اجلبي البيانات مباشرة
fetch('http://localhost:3000/api/v1/users', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Total users:', data.data.length);
  console.log('Field Adjusters:', data.data.filter(u => u.role === 'FIELD_ADJUSTER'));
})
```

**إذا ظهروا هنا بس مش في الـUI = المشكلة في Frontend**  
**إذا ما ظهروا = المشكلة في Backend**

---

**بعد ما تسوي الخطوات، أخبريني بالنتيجة وراح أساعدك! 🚀**
