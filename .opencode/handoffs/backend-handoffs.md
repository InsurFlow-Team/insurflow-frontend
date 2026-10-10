# Backend handoffs (محمد)

فهرس كل طلب باك-إند مفتوح، والرسالة الجاهزة للصق تحته. لا تُبنى أي واجهة أمامية قبل ما يرد محمد بـ«تم».

| # | Feature | Date | Status | Endpoints | Spec |
|---|---------|------|--------|-----------|------|
| 1 | إغلاق المطالبات CLOSED لا يظهر في القائمة | 2026-10-06 | **awaiting backend** | `GET /claims`, `GET /claims?status=CLOSED`, `POST /claims/:id/close` | [نص الطلب](#1-إغلاق-المطالبات-غير-معودة-في-القائمة-2026-10-06) |

---

## 1. إغلاق المطالبات غير معودة في القائمة (2026-10-06)

### الرسالة الجاهزة للصق لمحمد

> **الموضوع: مطالبات مغلقة (CLOSED) ما ترجع في `GET /claims` — والحالة 403 على مسار الإغلاق**
>
> سلام محمد،
> عندنا بلاغ إن المطالبات اللي تم إغلاقها ما تظهر في الداشبورد (بطاقة Closed = 0 وفلتر Closed فاضي). فحصت مباشرة بصلاحية `CLAIMS_OFFICER` (org `DEMO-INS`, `CO-001`) بتاريخ 2026-10-06:
>
> | Probe | النتيجة |
> |---|---|
> | `GET /claims` | `200` — **16 مطالبة، صفر منها CLOSED**، وصفر فيها `closedAt`/`closedBy` |
> | `GET /claims?status=CLOSED` | `200` — `data: []` (فارغ) |
> | `POST /claims/:id/close` (مطالبة APPROVED) | **`403`** `Forbidden: Insufficient permissions` |
> | `POST /claims/:id/bogus-close-xyz` (نفس الـ id) | `404` Endpoint Not Found |
> | `POST /claims/:id/decision` | `400` Validation Error (يعني المسار شغال للـ CO) |
>
> يعني:
> 1. مسار **`POST /claims/:id/close` موجود فعليًا** (الفرق بين 403 و404 يثبت) بس **CLAIMS_OFFICER مو مسموح له** — مين المسموح؟ (افتراضيًا ADMIN؟)
> 2. ما ظهرت أي مطالبة CLOSED في القائمة — إما **ما وصلت CLOSED أصلًا** (ما فيه شي نجح يقفلها) أو **القائمة مستثنيتها**.
>
> **أسئلتي:**
> 1. هل فيه مطالبات بحالة `CLOSED` فعلًا في قاعدة البيانات لـ `DEMO-INS`؟ لو نعم، وش يمنعها ترجع في `GET /claims` / `GET /claims?status=CLOSED`؟
> 2. `POST /claims/:id/close`: أي الأدوار يستدعيه؟ وش الشروط المسبقة (قرار نهائي APPROVED/REJECTED؟ قفل بعد التسوية؟)؟ وش الـ payload المطلوب (`closingNotes`؟)؟
> 3. لو الإغلاق غير مفعّل أصلًا — هذي ميزة ناقصة ومحتاج её (مسار يوصّل المطالبة لـ CLOSED).
>
> **معيار تم:**
> - [ ] `GET /claims` يرجع المطالبات ذات `status: "CLOSED"` (ما فيه استثناء صامت).
> - [ ] `GET /claims?status=CLOSED` يرجع نفس السجلات.
> - [ ] مسار الإغلاق `POST /claims/:id/close` موثق: الأدوار المسموحة + الشروط المسبقة + الـ payload + رد ناجح (الحالة النهائية + `closedAt`/`closedBy`).
> - [ ] رد واضح من هالحالتين: (أ) «ما فيه CLOSED بالداتا — الإغلاق غير مفعّل» أو (ب) «الداتا موجودة والقائمة ترجعها الآن».
>
> ملاحظة: الداشبورد ما يرسل أي إغلاق أبدًا (ما فيه زر Close بالواجهة) — بعد ما ترد «تم» نبني الواجهة عليه.

### Evidence log

| When | Who | What |
|---|---|---|
| 2026-10-06 | CO-001 live probe | probes in the table above; no claim carries `closedAt`/`closedBy`/`closingNotes` |
| — | frontend audit | no close writer in `dashboard/src` (DecisionSection only *displays* `closedBy`/`closedAt`) |
