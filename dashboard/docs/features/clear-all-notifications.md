# Clear All Notifications Feature

## Overview
إضافة زر "Clear All" إلى قائمة الإشعارات لتمكين المستخدمين من مسح جميع الإشعارات غير المقروءة دفعة واحدة.

## Implementation Details

### Files Modified

#### 1. `src/api/notifications.ts`
- **New Function**: `markMultipleNotificationsRead(ids: string[])`
  - يقوم بمسح مجموعة من الإشعارات بشكل تسلسلي
  - يعيد قائمة بالإشعارات التي نجحت وفشلت
  - السبب: Backend لا يوفر endpoint لمسح جميع الإشعارات دفعة واحدة

#### 2. `src/hooks/useNotifications.ts`
- **New State**: `clearingAll: boolean` - حالة التحميل أثناء مسح الإشعارات
- **New Function**: `clearAll()` 
  - تمسح جميع الإشعارات **غير المقروءة** في القائمة الحالية
  - Optimistic Update: تحدث الواجهة فوراً ثم ترسل الطلبات
  - Rollback: إذا فشل أي طلب، يتم إرجاع الإشعارات الفاشلة لحالتها السابقة

#### 3. `src/components/notifications/NotificationBell.tsx`
- إضافة زر "Clear All" في header القائمة
- الزر يظهر فقط عند وجود إشعارات غير مقروءة
- يتم تعطيل الزر أثناء عملية المسح
- يظهر نص "Clearing..." أثناء التحميل

## User Experience

### Behavior
1. المستخدم يفتح قائمة الإشعارات
2. إذا كان هناك إشعارات غير مقروءة، يظهر زر "Clear All" باللون الأحمر
3. عند الضغط على الزر:
   - يتغير النص إلى "Clearing..."
   - يتم تعطيل الزر
   - جميع الإشعارات غير المقروءة تُعلّم كمقروءة فوراً (Optimistic)
   - Badge الإشعارات يتحدث إلى 0
4. إذا فشل أي طلب:
   - يتم إرجاع الإشعارات الفاشلة لحالتها السابقة
   - يظهر رسالة خطأ
   - Badge يُحدث ليعكس عدد الإشعارات التي فشل مسحها

### Visual Design
```
┌─────────────────────────────────────┐
│ Notifications    Clear All  Refresh │ ← Header
├─────────────────────────────────────┤
│ [Notification 1]                    │
│ [Notification 2]                    │
│ [Notification 3]                    │
└─────────────────────────────────────┘
```

## Technical Decisions

### Why Sequential Marking?
- Backend لا يوفر "mark all as read" endpoint
- تم التحقق من endpoints التالية وجميعها ترجع 404:
  - `/notifications/read-all`
  - `/notifications/mark-all-read`
  - `/notifications/bulk-read`

### Why Optimistic Updates?
- تحسين تجربة المستخدم - الاستجابة الفورية
- إذا فشل الطلب، نرجع للحالة السابقة مع رسالة خطأ واضحة

### Scope
- الميزة تعمل فقط على الإشعارات **المرئية** في القائمة (limit: 10)
- لا تمسح الإشعارات القديمة غير المحملة
- هذا قيد مقبول لأن معظم المستخدمين يحتاجون مسح الإشعارات الحديثة فقط

## Testing Checklist

- [ ] زر "Clear All" يظهر فقط عند وجود إشعارات غير مقروءة
- [ ] زر "Clear All" يختفي عند مسح جميع الإشعارات
- [ ] الزر يُعطّل أثناء عملية المسح
- [ ] Badge الإشعارات يتحدث فوراً عند الضغط
- [ ] إذا فشل أي طلب، تُرجع الإشعارات الفاشلة لحالتها
- [ ] رسالة خطأ واضحة تظهر عند الفشل
- [ ] الزر لا يظهر في حالة "No notifications yet"

## Future Enhancements

### Backend Handoff
إذا أضاف Backend endpoint لمسح جميع الإشعارات:
```typescript
// New endpoint suggestion
POST /notifications/mark-all-read
Response: { success: true, markedCount: number }
```

عندها يمكن تحديث `clearAll()` لاستخدام هذا endpoint بدلاً من المسح التسلسلي.

### Possible Improvements
1. إضافة dialog تأكيد قبل المسح
2. إضافة animation عند مسح الإشعارات
3. إضافة undo functionality
4. مسح جميع الإشعارات (ليس فقط المرئية) إذا وفر Backend endpoint مناسب
