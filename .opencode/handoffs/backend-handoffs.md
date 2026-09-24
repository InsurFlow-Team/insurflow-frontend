# Backend Handoffs — في انتظار "تم" من محمد

> Document of record for every backend-dependent feature. Nothing here is
> implemented in the frontend yet. When محمد replies with "تم" + evidence,
> bring the relevant section to the top, verify live (feature-lifecycle §2),
> then implement the frontend.
>
> Backend owner: **محمد**. Frontend: dashboard/. Contract rule: verify live
> with both ADMIN and CLAIMS_OFFICER tokens before/after implementation.

---

## 0. Status summary

| Feature | Status | In this file |
|---|---|---|
| Notifications (bell) | Ready to send — waiting for محمد | §1 |
| Map + capacity + accept/decline round-trip | **Delivered (FE18) — reply-loop message final, awaiting "تم"** | §2 |
| Allow ADMIN in `POST /users` | Ready to send — waiting for محمد | §3 |
| `DELETE /users/:id` + `PATCH /users/:id` (edit) | Ready to send — waiting for محمد | §4 |
| Coordinates mandatory on `POST /claims` (server-side) | Frontend enforces NOW (2026-09-20); hardening request → محمد | §5 |
| Policy verification contract (claim intake gate) | **Delivered LIVE (2026-09-24) — `POST /policies/verify` wired, dev mock removed** | §6 |
| **Geocoding: `incidentLocation` (نص) → `incidentCoordinates`** | **Ready to send — awaiting محمد's reply/choice of provider** | §7 |

---

## 1. Notifications

العَرَض / الجهة:
  جرس الإشعارات في الداشبورد زخرفي حالياً (نقطة حمراء ثابتة، لا Endpoints).
  نحتاج صندوق رسائل يعرض أحداث دورة المطالبة لمستخدمي ADMIN و CLAIMS_OFFICER
  في منظمة المستخدم نفسها (نفس Isolation المطالبات).

المطلوب (Endpoints):

  1) GET /notifications?limit=20&offset=0
     الاستجابة:
     { success, message,
       data: { total, unreadCount, items: [{
         id, type, message, claimId, claimNumber, read, createdAt
       }] } }
     type = واحدة من هذه حصراً (مطابقة لحالات المطالبة الفعلية):
       ASSIGNED | SUBMITTED | UNDER_REVIEW | APPROVED | CLOSED
     - تَرتيب items تنازلي حسب createdAt (الأحدث أولاً).
     - unreadCount = عدد items التي read=false عند المستخدم.

  2) GET /notifications/unread-count
     الاستجابة: { success, message, data: { count } }

  3) PATCH /notifications/:id/read
     - تحوّل إشعاراً واحداً إلى read=true. عودة 200.
     - إعادة الإرسال على نفس id = idempotent (200 بلا تغيير).

  4) PATCH /notifications/read-all
     - تحوّل كل إشعارات المستخدم إلى read=true. عودة 200.

  مصادر الأحداث (تولّدها أنت داخل الباك عند كل انتقال):
   - تعيين مخمن على مطالبة (NEW→ASSIGNED)       → ASSIGNED
   - المخمن سلّم تقييمه (→SUBMITTED, from mobile) → SUBMITTED
   - بدء المراجعة (SUBMITTED→UNDER_REVIEW)      → UNDER_REVIEW
   - إقرار/قبول المطالبة (→APPROVED)            → APPROVED
   - إغلاق المطالبة (→CLOSED)                   → CLOSED

معايير "تم" (قابلة للتحقق — جدول AD-001/CO-001):
  1) أدخل بـ AD-001 → GET /notifications → 200 مع items بالشكل أعلاه.
  2) أدخل بـ CO-001 → GET /notifications/unread-count → 200 و data.count رقم.
  3) أنشئ مطالبة + عيّن مخمناً → يظهر إشعار ASSIGNED للمستلم.
  4) سلّم تقييم (Submit) → يظهر SUBMITTED.
  5) ابدأ مراجعة / أقرّ / أغلق → تظهر UNDER_REVIEW / APPROVED / CLOSED.
  6) PATCH /notifications/:id/read → 200 و unreadCount ينقص؛ read-all → الكل مقروء.
  7) الإشعارات محصورة بمنظمة المستخدم فقط.

ملاحظات:
  - لا حاجة لـ realtime (WebSocket/push). التحديث عند فتح الجرس أو الدخول للصفحة كافٍ.
  - لا حذف/تعديل للإشعارات؛ تنظيف تلقائي للإشعارات القديمة جداً لاحقاً.
  - الهدف: عرض النوع + الوقت + الحالة، والنقر ينقل لصفحة تفاصيل المطالبة.

---

## 2. Map + capacity + accept/decline round-trip

> **STATUS: محمد delivered Feature 18 (his doc, 2026-09-14) with DIRECT assignment.**
> USER RULING (final, 2026-09-14): direct assignment is REJECTED as the primary flow —
> **the adjuster MUST reply (accept or decline)** to every assignment; assignment stays
> pending until the reply. We adopt محمد's infra (GPS headers, claim coordinates,
> nearest-sort, capacity override) and REQUIRE the two-step reply on top. Definitive
> message to محمد is at the bottom of this section. Frontend waits for "تم".
>
> Decisions locked (grill 2026-09-13/14):
> - Adopt محمد's infra: GPS headers (X-Latitude/X-Longitude); POST /claims + optional
>   lat/lng; GET /users/adjusters?claimId sorted nearest-first (backend Haversine,
>   distanceKm); availability = AVAILABLE ≤3 else UNAVAILABLE; assign 409
>   ADJUSTER_UNAVAILABLE >3 → UI confirm → overrideCapacity:true → [CAPACITY OVERRIDE]
>   in timeline. incidentCoordinates on GET /claims/:claimId.
> - **MANDATORY reply loop (user's core requirement):** assign creates
>   PENDING_ACCEPTANCE; adjuster must Accept (→ASSIGNED) or Decline with reason (→NEW).
>   Claim + dashboard show "awaiting adjuster reply" meanwhile; the reply (incl. reason)
>   is recorded in the claim timeline for the officer.
> - Secondary request: incidentCoordinates also on the CLAIMS LIST response (avoid N+1).

اتفاق التصميم (النهائي المعتمد):
- نتبنّى بنية محمد: GPS headers، POST /claims + lat/lng، ترتيب ومسافات من الباك، سقف 3 مع 409 + overrideCapacity، سجل [CAPACITY OVERRIDE].
- **القرار الجوهري (المستخدم، لا تنازل): الردّ الإلزامي من المعاين (نعم/لا) على كل تعيين** — لا تعيين نهائياً قبل ردّه.

عقد محمد المطلوب (بنية + حلقة الرد):
  1) GET /users/adjusters?claimId=... (أو latitude/longitude):
     مرتبة من الأقرب للأبعد: { id, name, employeeCode, role, status,
       availability: AVAILABLE | UNAVAILABLE, activeTasksCount,
       location: { latitude, longitude, updatedAt } | null, distanceKm | null }
     - AVAILABLE = ≤ 3 مهام نشطة؛ UNAVAILABLE = أكثر من 3.
     - بلا موقع → آخر القائمة و distanceKm:null.
  2) POST /claims — body يضيف اختيارياً: latitude, longitude (إلى جانب incidentLocation).
  3) POST /claims/:id/assign — **لا يُعتمد نهائياً** بل ينشئ مهمة PENDING_ACCEPTANCE،
     وحالة المطالبة تصبح "بانتظار ردّ المعاين" (تظهر هكذا في قائمة/تفاصيل الداشبورد).
     المهام المعلّقة بانتظار الرد لا تُعد في activeTasksCount.
     المعاين عنده >3 نشطة → 409 ADJUSTER_UNAVAILABLE → UI تؤكد → overrideCapacity:true →
     200 + سجل [CAPACITY OVERRIDE] في Timeline.
  4) **حلقة الرد (إلزامية):**
     POST /claims/:claimId/accept-assignment      → المطالبة ASSIGNED نهائياً وتُعد مهمتها.
     POST /claims/:claimId/decline-assignment  body { "reason" } → = NEW قابلة لإعادة التعيين.
       - الصلاحية: المعاين المكلف فقط (غيره → 403). السبب إجباري ≤ 300 (بدونه → 400).
       - الحدث في Timeline للضابط:
         "[ASSIGNMENT ACCEPTED]" / "[ASSIGNMENT DECLINED] by FA-01 — <السبب>".
  5) **سند صغير:** incidentCoordinates في استجابة GET /claims (القائمة/status=NEW) —
     كل عنصر فيه إحداثيات أو null (لرسم دبابيس الحوادث بطلب واحد، لا N+1).

معايير "تم" (قابلة للتحقق — AD-001/CO-001):
  1) GET /users/adjusters?claimId → مرتبة تصاعدياً، مع distanceKm + activeTasksCount + availability.
  2) POST /claims مع latitude/longitude → 201 ويعود claimId.
  3) assign → مهمة PENDING_ACCEPTANCE وحالة المطالبة "بانتظار ردّ المعاين" (تظهر في القائمة/التفاصيل).
  4) assign لمشغول >3 نشطة → 409 ADJUSTER_UNAVAILABLE (بدون override)؛ مع overrideCapacity:true → 200 + [CAPACITY OVERRIDE].
  5) accept-assignment من صاحب المهمة → 200، المطالبة ASSIGNED + حدث [ASSIGNMENT ACCEPTED] في Timeline.
  6) decline-assignment {reason} من صاحب المهمة → 200، المطالبة NEW + السبب في Timeline.
  7) رد من معاين آخر → 403؛ decline بدون reason → 400.
  8) GET /claims?status=NEW → كل عنصر فيه incidentCoordinates أو null.
  9) ردود الأخطاء رسائل واضحة (400/401/403/404/409 مصنفة).

ملاحظات:
  - خريطة OSM/Leaflet في الداشبورد (الفرونت لا يحسب مسافات — الباك يرسلها).
  - المطالبة بلا إحداثيات: لا ماركر حادث، وعند النقر رسالة "لا إحداثيات".
  - لا realtime؛ تحديث عند فتح/تحديث الصفحة كافٍ.

--- رسالة محمد النهائية (النسخة القاطعة — انسخها وأرسلها):

نعتمد بنيتك في Feature 18 كاملة كما جهّزتها (GPS headers، POST /claims مع إحداثيات،
GET /users/adjusters?claimId ترتيب الأقرب، سقف 3 + 409 + overrideCapacity:true + سجل
[CAPACITY OVERRIDE]).

لكن قرارنا الجوهري الذي لا تنازل فيه — الخدمة تعمل به على الداشبورد:

التعيين بخطوتين: ردّ المعاين إلزامي (نعم/لا):

  1) POST /claims/:claimId/assign → لا يُعتمد نهائياً، بل ينشئ مهمة PENDING_ACCEPTANCE
     وحالة المطالبة تصبح "بانتظار ردّ المعاين" (تُعرض هكذا في قائمة/تفاصيل الداشبورد).
     المهام المعلّقة بانتظار الرد لا تُعد في activeTasksCount.

  2) ردّ المعاين (من الموبايل بأحد طريقين):
     - قبول:  POST /claims/:claimId/accept-assignment
              → المطالبة ASSIGNED نهائياً وتُعد مهامه.
     - رفض:   POST /claims/:claimId/decline-assignment  body { "reason": "..." }
              → المطالبة تعود إلى NEW وقابلة لإعادة التعيين.
     - الصلاحية: المعاين المكلف فقط (غيره → 403). السبب إجباري ≤ 300 حرف (بدونه → 400).

  3) الرؤية للضابط:
     - أَثناء الانتظار: حالة المطالبة تُظهر "بانتظار ردّ المعاين" في القائمة والتفاصيل.
     - بعد الرد: الحدث في الـ Timeline:
       "[ASSIGNMENT ACCEPTED]" أو "[ASSIGNMENT DECLINED] by FA-01 — <السبب>".

سند صغير (عرض الخريطة):
  أ) GET /claims (القائمة/status=NEW) → أضف incidentCoordinates في كل عنصر
     (أو null) لرسم دبابيس الحوادث بطلب واحد (لا N+1 من التفاصيل).

معايير "تم" (الأدلة مطلوبة):
  1) assign → مهمة PENDING_ACCEPTANCE وحالة المطالبة "بانتظار ردّ المعاين".
  2) accept-assignment من صاحب المهمة → 200، المطالبة ASSIGNED + حدث في الـ Timeline.
  3) decline-assignment {reason} → 200، المطالبة NEW + السبب في الـ Timeline.
  4) assign لمشغول>3 → 409؛ مع overrideCapacity:true → 200 + [CAPACITY OVERRIDE].
  5) رد من غير صاحب المهمة → 403؛ decline بدون reason → 400.
  6) GET /claims?status=NEW → كل عنصر فيه incidentCoordinates أو null.
  7) رسائل أخطاء واضحة (400/401/403/404/409).

عند تأكيدك "تم" بأدلتها — أبنّي الفرونت فوراً: الخريطة + الردّ المعلّق + الرفض بالسبب.

---

---

## 3. Allow ADMIN in POST /users

العَرَض:
  إنشاء مستخدم Admin من الداشبورد يفشل — الباك يرفض role=ADMIN:
  400 "role" must be one of [CLAIMS_OFFICER, FIELD_ADJUSTER] (متحقق حي).
  الفورم أخفى Admin عمداً بسبب ذلك.

المطلوب:
  - السماح بـ role=ADMIN في POST /users.

معايير "تم":
  - أتحقق بـ AD-001 (admin123): POST /users
    { name, employeeCode, password, role: "ADMIN" } → 200، ويظهر في GET /users.

---

## 4. DELETE /users/:id + PATCH /users/:id (edit)

العَرَض:
  - DELETE /users/:id يرجع 404 الآن (تم التحقق حياً سابقاً) — زر Delete جاهز.
  - تعديل المستخدم TEMPORARY frontend-only (تعديل محلي)، لا يوجد PATCH /users/:id.

المطلوب:
  - DELETE /users/:id → حذف حقيقي (أو تعطيل نهائي مع إشارة واضحة في الرد).
  - PATCH /users/:id → body { name?, employeeCode?, role?, status? } → 200.

معايير "تم":
  - DELETE /users/:id لمستخدم تجريبي → 200 ويختفي من GET /users.
  - PATCH /users/:id بتغيير name/role → 200 وينعكس في القائمة.

---

## 5. Self profile edit — PATCH /users/me

العَرَض:
  صفحة Profile جديدة (ADMIN + CLAIMS_OFFICER) تعرض بيانات المستخدم الذاتية
  (قراءة فقط) + تغيير كلمة السرّ (يعمل الآن عبر auth/change-password).
  المستخدم يريد أيضاً تعديل اسمه/بياناته الأساسية بنفسه؛ يلزمها endpoint جديد.

المطلوب:
  - PUT/PATCH /users/me  body { name?, phone? } (الحقول الأساسية فقط)
  - الاستجابة: المستخدم المحدّث { id, name, employeeCode, role, organizationId, organizationName, status }
  - قيود: لا تغيير على employeeCode أو role أو status الذاتي (تبقى بيد الإدارة).
    لا يعدّل إلا على حسابه (Isolation المنظمة).

معايير "تم":
  - أدخل بـ AD-001 (admin123): PATCH /users/me { name: "..." } → 200 ويعود الاسم
    الجديد في بيانات الحساب (يظهر في Header/Profile بعد تحديث الجلسة).
  - CO-001 يعدّل اسمه أيضاً → 200 (self-service لكل الأدوار).
  - تغيير role عبر /users/me → 400 (مرفوض ومحدود ذاتياً).

ملاحظات:
  - بعد النجاح، الفرونت يحدّث AuthContext (saveSession) ليعكس الاسم فوراً.
  - الاسم/الرول لغيرك يتم عبر User Management (إدارة) — PATCH /users/:id (§4).

---

## 5. Coordinates mandatory on POST /claims (server-side)

> **STATUS: REVERSED (2026-09-24, user ruling).** Coordinate-mandatory is dead: the
> intake is now **text-only** (`incidentLocation` free text, NO map/geolocation).
> Server-side coordinate enforcement is replaced by **backend geocoding** — see §7.

العَرَض:
  الداشبورد يفرض الموقع إلزامياً، لكن POST /claims عند الباك يقبل الطلب بدون
  latitude/longitude — أي شاريع آخر يستطيع إنشاء مطالبة خارج الخريطة.

المطلوب:
  - POST /claims: رفض الطلب اذا غاب الزوج أو كان خارج المدى الصحيح بقواعد:
    latitude ∈ [-90, 90] و longitude ∈ [-180, 180].
  - رمز الرفض 400 مع رسالة واضحة (مثلاً: `"incidentLocation" must include a
    valid latitude/longitude pair`).
  - تطبيق الأمر على كل إنشاء (داشبورد/موبايل/API) — فرض سيرفرلي لا يعتمد على
    الواجهة.

معايير "تم":
  1) POST /claims بدون latitude → 400 (رسالة واضحة).
  2) POST /claims بـ latitude لكن بدون longitude → 400.
  3) POST /claims بـ lat=91 أو lng=-181 → 400.
  4) POST /claims بزوج صالح (lat=24.7136, lng=46.6753) → 201 كالمعتاد وتظهر
     الإحداثيات في GET /claims.

ملاحظات:
  - لا تغيير في الفرونت المطلوب — الفرونت بنى الميزة وفرضها منذ الآن.
  - إنهاء فرض الإلزامية من الباك فقط، وليس لاحقاً في الفرونت.

---

## 6. Policy verification contract — claim intake Step 1 (LIVE since 2026-09-24)

> **STATUS: DELIVERED LIVE (2026-09-24).** `verifyPolicy` now calls the real
> `POST /policies/verify` (no mock). Verified live with CO-001: unknown policy →
> `404 POLICY_NOT_FOUND`; eligible policy → `{ isEligible, policy, vehicle,
> customer }` matching frontend types exactly. Nothing frontend-side pending.

العَرَض / الجهة:
  الداشبورد يفتح الآن كل إنشاء مطالبة بخطوة "التحقق من الوثيقة" (إدخال رقم
  الوثيقة → تحقق → إظهار بيانات الوثيقة → متابعة تسجيل الحادث). لا يُنشأ أي
  مطالبة قبل نجاح التحقق. البيانات المعروضة حالياً من mock تطويري موسوم بوضوح.

المطلوب (من عندك يا محمد — لم نختلق شيئاً):
  - تزويدنا بعقد التحقق من الوثيقة: method + path + payload + response shape
    لحقيقية (بما في ذلك ما يعود من إسم المؤمَّن عليه، الشركة، المركبة، لوحة
    المركبة، تاريخي بدء/انتهاء الوثيقة، وحالة الوثيقة).
  - بمجرد وصول العقد، نربط `verifyPolicy` به؛ لا حاجة لأي تغيير في الواجهة.

معايير استلام العقود (من عندك):
  - عقد موثق للـ endpoint + الـ payload + الـ response (بالأمثلة) + رموز
    الأخطاء المتوقعة (وثيقة غير موجودة / منتهية / ملغاة) وكيفية تمييز "التحقق
    فشل" عن "الوثيقة غير صالحة" إن وُجد فرق في الأعمال.

ملاحظات:
  - الفرونت جاهز؛ التغيير لاحقاً داخل `policy.service.ts` فقط.
  - لا يُمرَّر رقم الوثيقة حالياً إلى `POST /claims` (الحقل اختياري في model
    الفرونت وغير متزامن) — يُضاف قيد الأشعار عند وصول العقد.

---

## 7. Backend Geocoding: `incidentLocation` (نص) → `incidentCoordinates` (awaiting from الباك)

> **CONTEXT (2026-09-24, user ruling):** the intake is TEXT-ONLY — no map, no
> geolocation, no lat/lng from the officer. Geocoding must happen server-side so
> coordinates are a trusted source system-wide. Frontend reads the `echo` of
> `incidentCoordinates` on GET /claims + GET /claims/:id today → **no frontend
> work required for the happy path**; distanceKm keeps coming from
> `GET /users/adjusters?claimId=`. Verified live: `POST /claims` without
> coordinates already returns 201 — no contract break intended.

العَرَض / الجهة:
  الموظف بعد نجاح Policy Verification يدخل موقع الحادث يدوياً كنص فقط (مثال:
  "شارع الإرسال، رام الله" أو "شارع الملك فهد، نابلس"). نحتاج الباكند يحوّل
  هذا النص إلى إحداثيات موثوقة ليظهر دبوس الحادث على Dispatch Map وتحسب
  المسافات للمعاينين.

الـ Flow المستهدف:
  Claims Officer → incidentLocation نص → (Backend) Geocoding →
  incidentCoordinates { latitude, longitude, capturedAt } → Create Claim →
  Dispatch Map → دبوس الحادث ← `GET /users/adjusters?claimId` يحسب distanceKm.

المطلوب (منك يا محمد):
  1) آلية Geocoding معتمدة في الباكند تحوّل نص incidentLocation إلى إحداثيات.
  2) المزوّد: **Google** (الأدق للعربي، مدفوع) أو **Nominatim/OSM** (مجاني بلا
     مفتاح، مناسب MVP) — أو أي خدمة معتمدة لديكم حالياً. لا نربط معايير "تم"
     باسم مزوّد محدد.
  3) **إلزامي — تقييد البحث بفلسطين**: country=PS أو بوكس حدود الضفة
     (lat 31.15–32.68، lng 34.83–35.96) + عتبة ثقة دنيا، حتى لا يطابق
     "شارع الملك فهد" الشارع نفسه في دولة أخرى.
  4) **سياسة الفشل (مقترحة نعتمدها ما لم تعترض):** إن فشل الجيوكودينغ أو كان
     العنوان غامضاً → `incidentCoordinates: null` + `incidentCoordinatesStatus:
     "NOT_GEOCODED"`. **لا تُخزَّن إحداثيات خاطئة أبداً، ولا تُرفض المطالبة.**
     (بديل صارم على استشواركم: 400 — قولوا ونتفق.)
  5) الـ Response على إنشاء/جلب المطالبة:
     { incidentLocation: النص كما دخله الموظف،
       incidentCoordinates: { latitude, longitude, capturedAt } | null,
       incidentCoordinatesStatus: "GEOCODED" | "NOT_GEOCODED" }
  6) بعدها `GET /users/adjusters?claimId=` يحسب distanceKm نسبةً لهذه الإحداثيات.

ما لا نريده (ثابت):
  - لا خريطة داخل Create Claim. لا navigator.geolocation. لا إدخال lat/lng اليدوي.
  - لا frontend يخمّن coordinates. لا ثوابت/fake coordinates.

معايير "تم" (بالأدلة، AD-001/CO-001):
  1) POST /claims { incidentLocation: "شارع الإرسال، رام الله" } → 201 مع
     incidentCoordinates داخل حدود الضفة + capturedAt + status GEOCODED.
  2) نص عربي آخر (مثال "شارع الملك فهد، نابلس") → إحداثيات صحيحة داخل الضفة.
  3) نص عشوائي/غامض غير موجود → 201 مع incidentCoordinates:null و status
     NOT_GEOCODED (وليس إحداثيات خاطئة).
  4) نص يحمل اسم شارع/مدينة بنفس الاسم خارج فلسطين (مثال "شارع الملك فهد،
     الرياض") → لا مطابقة خارج حدود الضفة؛ النتيجة قرب الضفة أو null.
  5) GET /claims و GET /claims/:id تعيد الحقلين (coordinates + status).
  6) GET /users/adjusters?claimId= بعد التسجيل → distanceKm محسوبة من الإحداثيات.

ملاحظات:
  - لا تغيير في الفرونت المطلوب؛ الواجهة تقرأ الـ echo وتُظهر "الإحداثيات غير
    متاحة" عند null (السلوك مبني مسبقاً).
  - `capturedAt` = لحظة التحويل/الإبلاغ. `incidentLocation` يُحفظ نصاً كما دخله
    الموظف مهما كانت نتيجة الجيوكودينغ.

---
- Notifications: types in `src/types`, service `src/api/notifications.service.ts`,
  bell in `Header.tsx` (currently decorative), dropdown panel with unread badge,
  navigation to `/claims/:claimId`, Loading/Empty/Error via `LoadingState`/`ErrorState`/`EmptyState`.
- Map: Leaflet (react-leaflet) + markers colored by load; nearest suggestion in
  `AssignClaimModal` reuse of `POST /claims/:id/assign`; decline reason surfaced in
  `ClaimDetails` timeline; soft-cap badges in adjuster select/markers.
- Every change keeps the green bar: `npx vitest run` → `npm run build` → `npm run lint`.