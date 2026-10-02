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
| Coordinates mandatory on `POST /claims` (server-side) | Frontend enforces NOW (2026-09-20, **restored 2026-09-24** — intake map back); hardening request → محمد | §5 |
| Policy verification contract (claim intake gate) | **Delivered LIVE (2026-09-24) — `POST /policies/verify` wired, dev mock removed** | §6 |
| ~~Geocoding: `incidentLocation` (نص) → `incidentCoordinates`~~ | **SUPERSEDED (2026-09-24)** — intake map restored, the officer pins coordinates; server-side geocoding no longer needed for new claims | §7 |
| PDF report export `GET /claims/:id/report` | **DELIVERED (2026-09-24)** — button in ClaimDetails header (APPROVED/REJECTED/CLOSED only); contract verified live (401/404/409); 200-PDF pending a decisioned claim to finalize | §8 |
| Claim decision `POST /claims/:id/decision` | **VERIFIED LIVE (2026-09-26)** — endpoint EXISTS, contract confirmed (field `decision`, NOT `status`); frontend Approve/Reject buttons built (UNDER_REVIEW → APPROVED/REJECTED); no backend action needed | §9 |
| Adjuster work history (completed claims + inspection count) | **SHIPPED FRONTEND (2026-09-26)** — derived client-side from `GET /claims` + one `GET /claims/:id` per completed claim; optional dedicated endpoint requested in §10 | §10 |

---

## 1. Notifications

> **⚠️ SUPERSEDED by §11 (2026-09-27).** This section was written *before* the
> endpoints existed and describes a contract the backend did **not** build.
> Everything below is disproven by live probing — do not implement it.
>
> | This section assumed | What actually exists (§11) |
> |---|---|
> | `data: { total, unreadCount, items: [...] }` | `data: [...]` — a bare array |
> | `?limit=20&offset=0` | `?page=&limit=&unreadOnly=` — **`offset` is not supported** |
> | `id`, `message`, `claimId`, `claimNumber`, `read` | `_id`, `title`, `body`, `relatedClaimId: {_id, claimNumber}`, `readAt` |
> | `type`: ASSIGNED, SUBMITTED, UNDER_REVIEW, APPROVED, CLOSED | 8 types; live data: `NEW_CLAIM`, `INSPECTION_COMPLETED`, `ASSIGNMENT_DECLINED`, `ASSIGNED` |
> | `PATCH /notifications/read-all` | **404 — does not exist** |
>
> The parts that were right: newest-first ordering, and re-sending a mark-as-read
> being idempotent. Both verified live.

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

> **STATUS: RESTORED (2026-09-24, user ruling).** The text-only ruling was
> **reversed**: the intake map is BACK, and the officer places the incident pin
> on the map — `latitude`/`longitude` are sent on every `POST /claims` (required
> in the form, converted to numbers in `toCreateClaimRequest`). The server-side
> hardening request below is ACTIVE again.

العَرَض:
  الداشبورد يفرض الموقع إلزامياً (يدج طباعة pin على الخريطة)، لكن POST /claims
  عند الباك يقبل الطلب بدون latitude/longitude — أي شاريع آخر يستطيع إنشاء
  مطالبة خارج الخريطة.

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
  - الفرونت أرسل الزوج منذ 2026-09-20 وأعاد إلزاميّته 2026-09-24 بعد رجعة
    النص-فقط؛ النقص في الفرض على مستوى الباك فقط.
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

## 7. Backend Geocoding: `incidentLocation` (نص) → `incidentCoordinates` — SUPERSEDED

> **STATUS: SUPERSEDED (2026-09-24, user ruling — REVERSES the text-only
> intake).** The create-claim intake map is BACK: the officer places the
> incident pin himself, so `POST /claims` now carries `latitude`/`longitude`
> always → **server-side geocoding is no longer needed for new claims.** This
> section stays only for potential legacy text-only claims (existing claims with
> `incidentCoordinates: null`); the dispatch map already surfaces them by text
> + an amber "coordinates unavailable" note, no invented pin. If محمد wants, the
> geocoding below remains a nice-to-have for those legacy rows — otherwise we
> consider §7 CLOSED. (Coincidentally this ALSO removes the need to pick a
> geocoding provider/country-restrictions entirely.)

العَرَض / الجهة (مسجل للسياق فقط):
  الموظف بعد نجاح Policy Verification يدخل موقع الحادث يدوياً كنص فقط (مثال:
  "شارع الإرسال، رام الله" أو "شارع الملك فهد، نابلس"). نحتاج الباكند يحوّل
  هذا النص إلى إحداثيات موثوقة ليظهر دبوس الحادث على Dispatch Map وتحسب
  المسافات للمعاينين.

الـ Flow المستهدف (سابق — لم يعد مطبقاً):
  Claims Officer → incidentLocation نص → (Backend) Geocoding →
  incidentCoordinates { latitude, longitude, capturedAt } → Create Claim →
  Dispatch Map → دبوس الحادث ← `GET /users/adjusters?claimId` يحسب distanceKm.

المطلوب (سابق من عندك يا محمد):
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

ما لم يعد سارياً (عكس بالكامل 2026-09-24):
  - لا خريطة داخل Create Claim. لا navigator.geolocation. لا إدخال lat/lng اليدوي.
  - لا frontend يخمّن coordinates. لا ثوابت/fake coordinates.
  ← الآن: الخريطة Rجعت داخل Create Claim (النقر لتحديد الدبوس)، والإحداثيات إلزامية
  وتملأ من pin، والنص يبقى وصفاً للمكان. لا تغيير على "لا frontend يخمّن
  coordinates" ولا "لا navigator.geolocation".

معايير "تم" (لم تعد ملزمة لتطبيق الفرونت — ارجع لها فقط لو نوى محمد دعم النص القديم):
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

## 8. PDF Report Export: `GET /claims/:claimId/report` — DELIVERED (FR, 2026-09-24)

> **STATUS: DELIVERED.** Frontend implemented and tested — the Export button lives
> in the ClaimDetails header and is gated to final-decision claims
> (`APPROVED`/`REJECTED`/`CLOSED`) so the known 409 never fires. Verified live below.

العقد (من محمد):
  - `GET /api/v1/claims/{claimId}/report` — **بلا Body وبلا Query Params**.
  - Header: `Authorization: Bearer <TOKEN>` فقط.
  - Precondition (فرونت): `claim.status ∈ { APPROVED, REJECTED, CLOSED }`.
  - Success 200: `application/pdf` ثنائي جاهز (الباك يجمع الكل من قاعدة البيانات).

التحقق الحي (2026-09-24، token CO-001 / DEMO-INS):

| Case | HTTP | Body |
|---|---|---|
| Claim **IN_PROGRESS** (0042 `6ab505b466ac53c14dd40daa`) | **409** | `INVALID_STATUS_TRANSITION` — "Report is only available for claims with a final decision (APPROVED, REJECTED, or CLOSED)." |
| Claim **NEW** (0044 `6ab50ae266ac53c14dd40db0`) | **409** | نفس الرسالة |
| ObjectId غير موجود (`…83ff`) | **404** | `CLAIM_NOT_FOUND` |
| بلا توكن | **401** | "Unauthorized: Missing token" |

ملاحظات التنفيذ في الفرونت (لا يلزم الباك أي شيء):
  - الأخطاء ترجع **JSON داخل Blob** عند `responseType: 'blob'` → الـ service يقرأ
    نص الـ blob ليستخرج `message` ويعرضها عبر `getApiErrorMessage`.
  - `window.open(url)` **مستحيل** (بلا header → 401) → التنزيل عبر
    `apiClient.get(..., { responseType: "blob" })` + `URL.createObjectURL` + `<a download>`.
  - اسم الملف: `<claimNumber>_report.pdf`.

معيار استكمال التحقق (ما زال معلقاً):
  - أول مطالبة بمستوى القرار النهائي (APPROVED/REJECTED/CLOSED) تتوفر في قاعدة
    البيانات → GET /claims/:id/report ترجع **200 + Content-Type: application/pdf**
    مع بداية `%PDF`. حالياً لا توجد أي مطالبة قرار (الموجود: NEW و IN_PROGRESS فقط).
  - ملفات: `src/api/claims.report.ts`، `src/utils/download.ts`، زر في
    `ClaimDetailHeader.tsx`، ويربطها `ClaimDetails.tsx`.

ملاحظات:
  - لا تغيير RBAC (ADMIN/CLAIMS_OFFICER يقرؤون صفحة المطالبة؛ الزر يظهر بمستوى الصفحة).
  - لا Backend change: العقد شغّال كما وُصِف.

---

## 9. Claim decision: `POST /claims/:id/decision` — VERIFIED LIVE, FRONTEND BUILT

> **STATUS: NO backend action needed.** The endpoint already exists and the
> contract was probed live 2026-09-26 (CO-001 / DEMO-INS token). Frontend
> Approve/Reject buttons are implemented and tested — no "تم" required.

العقد (المتحقق حياً):
  - `POST /api/v1/claims/{claimId}/decision` — Auth: `Authorization: Bearer`.
  - Body: `{ "decision": "APPROVED" | "REJECTED", "notes"?: string }`.
  - **الحقل اسمه `decision`** — إرسال `status` يُرفض: 400 Validation Error
    (`"Decision is required"` + `"\"status\" is not allowed"`).
  - Precondition: المطالبة يجب أن تكون `UNDER_REVIEW` وإلا:
    409 `INVALID_STATUS_TRANSITION` — "Claim is not in UNDER_REVIEW status".
  - لا توجد مسارات `/approve` أو `/reject` أو `/decide` (كلها `404 Endpoint Not Found`).

الدليل الحي (2026-09-26):

| Body | Claim | HTTP | النتيجة |
|---|---|---|---|
| `{"status":"APPROVED","notes":""}` | 0042 IN_PROGRESS | 400 | `VALIDATION_ERROR` — "Decision is required" + `"status" is not allowed` |
| `{"decision":"APPROVED","notes":"ok"}` | 0042 IN_PROGRESS | 409 | `INVALID_STATUS_TRANSITION` — "Claim is not in UNDER_REVIEW status" |
| `{"decision":"REJECTED"}` | 0042 / 0044 | 409 | نفس الرسالة (القيمة REJECTED مقبولة Validation) |
| `POST .../approve` / `reject` / `decide` | أي | 404 | `Endpoint Not Found` |

الفرونت (مبني 2026-09-26):
  - `src/api/claims.decision.ts` — `decideClaim(claimId, decision, notes?)`
    يرسل `{ decision, notes? }` فقط عند وجود notes.
  - `src/components/claim-details/sections/DecisionSection.tsx` — زرا **Approve** /
    **Reject** (2026-09-26: نُقلا من الهيدر إلى قسم Decision/Closing بقرار المستخدم)
    يظهران فقط عندما `claim.status === "UNDER_REVIEW"` **والداخل هو ADMIN حصراً**
    (قرار المستخدم 2026-09-26: القرار النهائي من الأدمن؛ الكلايم أوفيسر يراجع بـ
    Start Review ثم يصدّر الملف بعد قرار الأدمن ولا يقبل/يرفض أبداً). كل زر يفتح
    ConfirmDialog ثم يرسل القرار ويعيد تحميل الصفحة، فتقول الحالة بالعربي
    «تم قبول المطالبة.» / «تم رفض المطالبة.». الهيدر فيه Start Review + التصدير فقط.
  - زر التصدير أُعيدت تسميته إلى **Export Claim PDF** (طلب المستخدم).

تحصين مطلوب من محمد (باكند — بعد قرار "الادمن هو مَن يقرر"):
  - الباك حالياً يقبل قرار من CO-001 (أثبتنا ذلك حياً: تعدى 401/403 ووصل 409 للشرط
    فقط). الفرونت يخفي الأزرار عن CO، لكن الفرض الحقيقي يجب أن يكون server-side:
    `POST /claims/:id/decision` → ADMIN فقط (CO → 403).

معيار الاستكمال النهائي (يُتحقق عندما يوصل باك/موبايل مطالبة إلى UNDER_REVIEW):
  - إيصال مطالبة فعلياً إلى `UNDER_REVIEW` في قاعدة البيانات → دخول AD-001 →
    الضغط Approve → 200 والتفاصيل تتحدث إلى APPROVED → زرا Approve/Reject
    يختفيان وزر التصدير يُفعَّل → تنزيل PDF فعلي. (مع CO-001: لا يرى أزرار القرار،
    ويرى زر التصدير مفتوحاً عندما يقرر الأدمن فعلاً).

ملاحظات:
  - تغيير RBAC (2026-09-26): الأزرار للـ ADMIN فقط — القرار النهائي قرار الأدمن؛
    الكلايم أوفيسر يراجع + يصدّر (حسب قرار المستخدم). تحديث Skill الـ RBAC.

---

## 10. Adjuster work history — SHIPPED FRONTEND, optional endpoint requested

> **STATUS: nothing is blocked.** The Work history section on the adjuster
> profile (`/adjusters/:adjusterId`, ADMIN + CLAIMS_OFFICER) is live and derives
> everything from endpoints that already exist. §10.2 is an optimisation request,
> not a blocker.

### 10.1 What shipped (2026-09-26)

The user asked the profile to show, for one adjuster: how many claims are
finished, how many inspections he performed, which claims, and when.

The previous section was a hardcoded `EmptyState` reading *"will appear here
once the backend exposes the adjuster's claims"* — that copy was a lie, the data
was already reachable.

No backend change was needed because:

  - `GET /claims` already returns **every** claim of the organization with
    `assignedTo: { id, name }` on each row (verified live 2026-09-26).
  - The inspection count and the completion time live in the claim's `timeline`
    / `closedAt`, which only `GET /claims/:id` returns.

So the frontend filters the list to this adjuster's `APPROVED | REJECTED |
CLOSED` claims, then hydrates the timeline of the most recent ones.

  - `src/utils/adjusterHistory.ts` — pure derivation: which claims are
    completed, `countInspections` (counts every `Inspection Started` event by
    that adjuster, so a revisit counts twice), `resolveCompletedAt` (`closedAt`,
    else the decision event — never `updatedAt`, which moves on any later edit),
    turnaround `computeDurationHours`, `summarizeWorkHistory`.
  - `src/api/adjusterHistory.ts` — `getAdjusterWorkHistory(adjusterId)`.
  - `src/components/adjusters/WorkHistorySection.tsx` — four tiles (Completed
    claims, Total inspections, Avg. turnaround, Last completed) over a
    `DataTable`; each row links to `/claims/:id`.
  - `ClaimSummary` gained `assignedTo?: UserSummary | null` (already sent).

Honest limits, by design:

  - Counts that need the timeline are `null` — rendered "—" — when a claim's
    details cannot be loaded. The page never shows a made-up number.
  - `updatedAt` is **not** used as a completion time.
  - The detail fan-out is capped at `MAX_HISTORY_DETAIL_FETCHES = 25`; when a
    longer history exists the section says *"Showing the 25 most recent completed
    claims out of N"* instead of quietly truncating.

Verified live against DEMO-INS (2026-09-26), matching the UI exactly:

| Adjuster | Completed | Inspections | Avg. turnaround | Rows |
|---|---|---|---|---|
| FA-001 Ahmed | 3 | 3 | 22.1h | 0050 APPROVED (1 insp, 7 evidence, 23.9h), 0047 APPROVED (1, 7, 24.2h), 0046 CLOSED (1, 1, 18.1h) |
| FA-002 Second | 0 | — | — | empty state |

### 10.2 Optional request for محمد (not a blocker)

`GET /claims` only accepts `status`; every other query parameter is rejected
with 400 — probed live: `assignedTo`, `assigneeId`, `adjusterId`,
`assignedAdjusterId`, `adjuster` → all 400. So today the profile downloads the
whole organization's claim list, plus one extra request per completed claim.

When convenient, a single endpoint would remove both:

```
GET /users/adjusters/:adjusterId/claims?status=APPROVED,REJECTED,CLOSED&limit=25

  200
  { success: true, message: "ok",
    data: {
      totalCompleted: 3,
      truncated: false,
      items: [{
        claimId, claimNumber, status, customerName, plateNumber,
        inspectionCount,            // count of "Inspection Started" events
        completedAt,                 // closedAt, else the decision event timestamp
        assignedAt,                 // for turnaround
        durationHours
      }]
    }}
```

Acceptance criteria:

1. Same-org isolation: an adjuster outside the caller's organization is `404`.
2. `totalCompleted` counts **all** finished claims; `items` is the newest slice
   and `truncated: true` when `items.length < totalCompleted`.
3. `inspectionCount` counts every inspection start **by that adjuster**, so a
   revisit increments it.
4. `completedAt` is the decision/settlement moment, not the last edit.
5. ADMIN and CLAIMS_OFFICER may read it; FIELD_ADJUSTER is blocked (it has no
   dashboard access anyway — see `Login.tsx`).

---

## 11. Notification Center — VERIFIED LIVE, FRONTEND BUILT (2026-09-27)

> **STATUS: shipped end-to-end.** The three endpoints in §1 now exist and were
> verified live with `AD-001` (ADMIN) and `CO-001` (CLAIMS_OFFICER) against
> DEMO-INS. The header bell is no longer decorative. §1 is superseded.

### 11.1 The real contract (live, not from a document)

| Request | HTTP | Verified response |
|---|---|---|
| `GET /api/v1/notifications/unread-count` | 200 | `{ success, message, data: { count } }` |
| `GET /api/v1/notifications?page&limit&unreadOnly` | 200 | `{ success, message, data: [ … ] }` **bare array** |
| `PATCH /api/v1/notifications/:id/read` (body `{}`) | 200 | `{ success, message, data: { …whole notification… } }` |
| any of the above, no token | 401 | session destroyed by the axios interceptor |
| `?limit=abc` | 400 | `VALIDATION_ERROR` — `"limit" must be a number` |

Real record (AD-001, verbatim):

```json
{
  "_id": "6ab76a2dfe08268d7464b609",
  "recipientId": "6ab558c8a170b120d93a5f94",
  "organizationId": "6a919f45e62778a597174333",
  "type": "NEW_CLAIM",
  "relatedClaimId": { "_id": "6ab76a2dfe08268d7464b608", "claimNumber": "CLM-DEMO-INS-0054" },
  "title": "New Claim Created",
  "body": "New claim CLM-DEMO-INS-0054 has been created.",
  "readAt": null,
  "createdAt": "2026-09-26T06:46:05.946Z",
  "__v": 0
}
```

Three things a frontend that trusted the old document would get wrong:

1. **`unreadOnly` defaults to `false`.** An unfiltered `GET /notifications`
   returns read items too (14 of 14 for AD-001 initially). Callers that want only
   unread must send `unreadOnly: true` explicitly. Verified: after one
   mark-as-read, `unreadOnly=true` returned 13 while the default returned 14, and
   `/unread-count` returned 13 — the two always agree.
2. **Pagination lives in headers**, not an envelope: `X-Total-Count`,
   `X-Page`, `X-Total-Pages`. `offset` is not supported.
3. **The mark-as-read response returns the whole notification**, not the
   `{ _id, readAt }` the handoff described.

Also verified: the list is ordered newest-first, and re-sending a mark-as-read
on the same id is idempotent (200 both times, `readAt` unchanged).

### 11.2 Types, and why the UI has a fallback

Documented: `NEW_CLAIM`, `ASSIGNMENT_DECLINED`, `INSPECTION_COMPLETED`,
`PENDING_ACCEPTANCE`, `ASSIGNED`, `CORRECTION_REQUIRED`, `APPROVED`, `REJECTED`.

**Only four occur in live data** (`NEW_CLAIM`, `INSPECTION_COMPLETED`,
`ASSIGNMENT_DECLINED`, `ASSIGNED`) — the adjuster-facing and decision types are
declared but not emitted yet. So `AppNotification.type` stays a plain `string`
and the icon/tone lookup falls back to a neutral Bell. A ninth type added later
renders as a neutral row instead of crashing the header.

`PATCH /notifications/read-all` → **404, not implemented.** The UI therefore
offers no "mark all read" control rather than a button that would fail.

### 11.3 What shipped

  - `src/types/notifications.ts` — `AppNotification`, `NotificationPage`,
    `NotificationType`, with the verified contract in the header comment.
  - `src/api/notifications.ts` — `getUnreadNotificationCount`,
    `getNotifications`, `markNotificationRead`, plus the defensive
    `toAppNotification` normaliser (`_id` → `id`; a record with no id is
    dropped, because it cannot be marked read; an unknown `type` is kept).
  - `src/hooks/useNotifications.ts` — the badge count is fetched on mount and
    polled every `NOTIFICATION_POLL_MS = 60_000`; the list is fetched **lazily,
    once, on first open**, so a normal page view costs one small request.
    `markRead` is optimistic and **rolls the row and the badge back together** if
    the PATCH fails, so the two can never disagree.
  - `src/components/notifications/NotificationBell.tsx` — the bell, the red
    badge (hidden at 0, capped at `9+`), and the dropdown. Escape and
    outside-click close it; focus moves to the first row on open; unread rows
    are tinted with a dot; relative time comes from
    `src/utils/relativeTime.ts` (hand-rolled, **no new dependency**).
  - Clicking a row marks it read and navigates to
    `/claims/${relatedClaimId._id}`. Verified live that all 10 notifications'
    `relatedClaimId`s resolve: `GET /claims/:id` → 200 with a matching
    `claimNumber`.
  - `src/layouts/Header.tsx` — the dead bell button is replaced by
    `<NotificationBell />`.

RBAC: notifications are **per recipient**, and two of the documented types are
adjuster-facing, so the bell is shown to **every authenticated role** — it is
not gated like the dashboard. There is no cross-user read: each caller only ever
sees their own (AD-001 had 14, CO-001 had 11, in the same organization).

Tests: 48 added (`notifications.test.ts` 13, `useNotifications.test.ts` 9,
`NotificationBell.test.tsx` 16, `relativeTime.test.ts` 10) — 366 total, all green.

### 11.4 Optional requests for محمد (not blockers)

1. **`PATCH /notifications/read-all`** — §1 asked for it, it returns 404. The
   dropdown caps at 10 and the user can only clear one row at a time, so a
   user with 14 unread has to open the list 14 times.
2. **A notifications page** — there is no `/notifications` route, so the
   dropdown is the only surface. The UI states "13 older notifications" as a
   plain sentence rather than linking to a dead route.
3. **Emit the four missing types** (`PENDING_ACCEPTANCE`, `CORRECTION_REQUIRED`,
   `APPROVED`, `REJECTED`) so the mobile-facing flows and the final decision
   reach the adjuster and the officer without polling the claim list.

---

- Notifications: **built 2026-09-27** — see §11. Types in `src/types/notifications.ts`,
  service `src/api/notifications.ts`, hook `src/hooks/useNotifications.ts`,
  bell + dropdown in `src/components/notifications/NotificationBell.tsx`, wired
  into `src/layouts/Header.tsx`. Three live endpoints, no backend changes needed.
- Map: Leaflet (react-leaflet) + markers colored by load; nearest suggestion in
  `AssignClaimModal` reuse of `POST /claims/:id/assign`; decline reason surfaced in
  `ClaimDetails` timeline; soft-cap badges in adjuster select/markers.
- Design tokens (2026-09-27): every non-brand colour now resolves through
  `src/utils/toneStyles.ts` (7 semantic families × bg/border/text/solid/icon)
  and `src/utils/statusStyles.ts` (one label + tone per status, consumed by
  `StatusBadge` and by the claim stat cards). 143 raw Tailwind palette usages
  across 37 files were migrated; the palette is defined once in `index.css`.
- Every change keeps the green bar: `npx vitest run` → `npx tsc -b` → `npm run build` → `npx eslint src`.

## 12. Policy coverage snapshot — DELIVERED by backend, pending live re-verify

> **STATUS: CONTRACT RECEIVED (2026-09-29), NOT YET VERIFIED LIVE.**
> The backend replied with a full contract. The frontend has **not** been built
> against it yet: the tunnel points at a **local** backend, and the reply says
> "تم اعتماد وتطبيق" — that still has to be confirmed against a real response
> before any code is written. See §12.6 for the open questions.

### 12.1 What was actually verified (2026-09-29)

| Source | Result |
|---|---|
| `dashboard/src/types/policy.ts` → `PolicyVerificationResponse` | `{ isEligible, policy, vehicle, customer }` |
| `dashboard/src/api/policy.service.ts` docblock | identical shape |
| §6 above (live-verified 2026-09-24, CO-001) | "matching frontend types exactly" |
| grep over this entire document | **0** hits for `coverage`, `deductible`, `isCollisionCovered`, `isTheftCovered`, `tglass` |

Re-probe attempted 2026-09-29: every endpoint on
`insurflow-backend.onrender.com` returned **503** (service down, including
`/notifications/unread-count` which was 200 earlier the same day), so the
contract could **not** be re-confirmed live today. §6 stands as the last
confirmed state.

**Conclusion: the verify contract has no coverage fields, and the product
brief's assumption that the backend "likely added them" is unsupported.**

### 12.2 DELIVERED contract (2026-09-29, backend reply — not yet live-verified)

**Request** — one new **optional** field, `incidentType`:

```jsonc
POST /api/v1/policies/verify
Headers: Authorization: Bearer <TOKEN>
{ "policyNumber": "POL-1000", "plateNumber": "ABC-1234",
  "incidentDate": "2026-06-15", "incidentType": "COLLISION" }
```

**Response** — `eligibilityHint` + `coverage` added, and `policy` gained three
fields:

```jsonc
{ "success": true, "message": "Policy verified successfully",
  "data": {
    "isEligible": true,
    "eligibilityHint": "ELIGIBLE_FOR_REVIEW",      // NEW — nullable
    "policy": {
      "id": "66d0fe4f5311236168a109d1",
      "policyNumber": "POL-1000",
      "status": "ACTIVE",
      "startDate": "2026-01-01",
      "expiryDate": "2026-12-31",
      "policyType": "COMPREHENSIVE",               // NEW
      "coveredPerils": ["COLLISION", "THEFT", "FIRE", "NATURAL_DISASTER"],  // NEW
      "deductibleAmount": 500                      // NEW
    },
    "coverage": {                                   // NEW — nullable
      "policyType": "COMPREHENSIVE",
      "effectiveFrom": "2026-01-01",
      "effectiveTo":   "2026-12-31",
      "deductible": 500,                            // POLICY-level, not per-incident
      "incidents": [
        { "code": "COLLISION",        "covered": true  },
        { "code": "THEFT",            "covered": true  },
        { "code": "FIRE",             "covered": true  },
        { "code": "NATURAL_DISASTER", "covered": true  }
      ]
    },
    "vehicle":  { "id", "plateNumber", "make", "model", "year", "color" },
    "customer": { "id", "fullName", "phone" }
  }}
```

`eligibilityHint` values:

| Value | Meaning | Nullable |
|---|---|---|
| `ELIGIBLE_FOR_REVIEW` | incident covered, claim may be opened | no |
| `NOT_COVERED_BY_POLICY_TYPE` | e.g. own-damage on a third-party policy | no |
| `COVERAGE_UNKNOWN` | legacy policy, no coverage record | no |
| `null` | `incidentType` was not supplied | **yes** |

`coverage: null` comes with `eligibilityHint: "COVERAGE_UNKNOWN"`.

### 12.3 What changed against the original request

| Requested | Delivered | Why |
|---|---|---|
| `limit`, `limitType` | **dropped** | No fixed monetary ceilings exist in the data model; physical-damage cover is assessed by the field adjuster against market value. **The UI must not display any money ceiling.** |
| `currency` | **dropped** | Follows from the above. |
| per-incident `deductible` | **one policy-level `deductible`** | The deductible is carried by the policy, not per peril. |
| `incidents[]` + `code`/`covered` | **kept as proposed** ✅ | New perils can be added without a breaking change. |
| — | **`policyType`, `coveredPerils`, `deductibleAmount` added to `policy`** | Duplicate surface for the same facts; see §12.6. |
| — | **`incidentType` added to the request** | Needed to compute `eligibilityHint`. Optional; `null` hint without it. |

Peril codes: `COLLISION`, `THEFT`, `FIRE`, `NATURAL_DISASTER`.

### 12.4 Explicitly out of scope

Confirmed by the backend and held on the frontend side too:

- any change to `POST /claims` or to the claim model — `policyId` stays the only
  linkage, and the claim stores no copy of the coverage snapshot;
- automatic approval / rejection — the backend states the verify step is an
  **Advisory Gate** and the decision stays with the Claims Officer, matching
  `docs/landing-page/01-product-overview.md` ("does not automatically make the
  final compensation decision");
- the incident map — dispatch only, it does not return to the claim form (see §7);
- RBAC.

### 12.5 What the frontend must not do with `eligibilityHint`

The contract is advisory, and the UI has to keep it advisory. Three rules, all
derived from the constraints above:

1. **Never block claim creation on `NOT_COVERED_BY_POLICY_TYPE`.** Blocking the
   "Continue" step would *be* an auto-reject. The officer must still be able to
   open the claim; own-damage assessment is a field decision, not an intake gate.
2. **`COVERAGE_UNKNOWN` is a data gap, not a "not covered".** A legacy policy with
   no coverage record must never be styled as excluded.
3. **`ELIGIBLE_FOR_REVIEW` must not read as an approval.** A green "eligible"
   badge is exactly the language §12.4 forbids. Render it as an explicitly
   advisory hint, and never fall back to `policy.status` when the hint is `null`
   (that is what `null` means).

### 12.6 Open questions before any code is written

1. **Live confirmation.** The reply is a contract, not a response. The ngrok
   tunnel points at a **local** backend, so the feature may not be deployed
   there yet. Verify with a real `POST /policies/verify` first.
2. **Taxonomy clash — needs a decision.** The verify request now takes a peril
   code (`COLLISION` / `THEFT` / `FIRE` / `NATURAL_DISASTER`), but the Create
   Claim form already collects a *different* `incidentType` allow-list
   (`COLLISION`, `REAR_END_COLLISION`, `SIDE_IMPACT`, `PARKING_DAMAGE`, `OTHER`
   — see `utils/validation.ts`). Only `COLLISION` overlaps. The officer would
   pick a peril at verification and a collision sub-type at claim creation, and
   the peril is not persisted anywhere. Options: keep the two taxonomies apart
   and label them clearly, align the claim form to the peril codes, or ask the
   backend to accept the claim's sub-types.
3. **Duplicated facts.** `coverage.policyType` / `deductible` repeat
   `policy.policyType` / `deductibleAmount`, and `coveredPerils` repeats
   `coverage.incidents[].code`. Confirm which surface is authoritative so the UI
   does not render two disagreeing numbers.
4. **`policyId` provenance.** Confirm `data.policy.id` is still the linkage for
   `POST /claims`; the samples show Mongo-style 24-hex ids.

### 12.7 Frontend state

No Coverage component, no types, no tests were written yet. The claim intake
flow is untouched and green. The temporary ngrok wiring (see §13) is the only
code change so far.

## 13. TEMPORARY dev wiring — ngrok (not production)

> **Development only. Must not ship.** The Render service is suspended
> (`x-render-routing: suspend`), so the frontend was pointed at a colleague's
> local backend over an ngrok free tunnel while coverage work is blocked on the
> backend.

| Item | Value |
|---|---|
| Temporary base URL | `https://carport-update-unease.ngrok-free.dev/api/v1` |
| Where | `dashboard/.env` only (gitignored) |
| Revert | delete the two lines below from `dashboard/.env`; no code change needed |

```
VITE_API_BASE_URL=https://carport-update-unease.ngrok-free.dev/api/v1
VITE_NGROK_SKIP_WARNING=true
```

`dashboard/.env.example` is deliberately **unchanged** and still points at
Render, so a fresh clone never inherits the tunnel.

### 13.1 Why `VITE_NGROK_SKIP_WARNING` exists

ngrok's free tier serves a **browser-warning interstitial** to browser
User-Agents. Measured against the tunnel:

| User-Agent | without the header | with the header |
|---|---|---|
| `curl/8.4.0` | `401` | `401` |
| Chrome (what axios sends) | `200 text/plain` — the ngrok page | `401 application/json` |

So pointing the app at the tunnel **without** this header makes every browser
request receive HTML instead of JSON, and login fails with a misleading error.
Note the interstitial returns **`200` for an error** — status code alone lies
here, the body is the only reliable signal.

`client.ts` therefore adds the header only when the env var is exactly `"true"`,
so it is inert in every build that does not set it, and removing one line from
`.env` fully reverts the setup.

### 13.2 Not production

ngrok free URLs are public, unauthenticated, and change per session. They must
never be used for real claim data, and this entry must be deleted once the
Render service is back.

---

## 14. Screens 2-5 contract (backend message, NOT live-verified)

Status: received in a chat message only. Nothing below has been confirmed
against a running instance. Section 12 has the same caveat. Do not build on
this until `verify-all-screens.ps1` returns real JSON.

### 14.1 Screen 2 - POST /claims

New in request:

- `description` - free text describing the incident. We do not send it today.

New in response:

- `trackingToken` - opaque token for the public tracking page.
- `trackingUrl` - backend-built link to the tracking page.
- `coverageSnapshot` - coverage as evaluated at submission time.

Open conflict, must be resolved live:

- Section 5 records `latitude` and `longitude` as flat top-level request
  fields, and that was verified live earlier. The backend message now shows
  `incidentCoordinates: { latitude, longitude }` as a nested object. The
  message also says coordinates are now optional. These three claims cannot
  all be true at once. Keep the flat shape until a real response proves
  otherwise.

Unchanged: `policyId` still comes from `data.policy.id`.

### 14.2 Screen 3 - GET /claims/:claimId

New fields to surface:

- `incidentDate` in the basic information block.
- `trackingToken` and `trackingUrl`.
- `coverageSnapshot` - frozen copy of `policyType`, `coveredPerils`,
  `deductibleAmount`, `capturedAt`. This is the snapshot taken at submission,
  not live coverage, so the UI must label it as such and must not re-query
  the policy endpoint for these values.
- `lossAssessment` - the decision figures, see 14.3.

Our claim details page renders none of these today.

### 14.3 Screen 4 - POST /claims/:claimId/decision

New in request: `lossAssessment` object.

| Field | Rule |
| --- | --- |
| `estimatedPartsCost` | positive, max 2 decimals |
| `laborCost` | positive, max 2 decimals |
| `deductibleApplied` | positive, max 2 decimals, may differ from policy deductible |
| `deductibleOverrideReason` | required only when `deductibleApplied` differs from the policy deductible |

Backend computes, frontend must never send: `totalDamage` =
`estimatedPartsCost` + `laborCost`; `netApprovedPayout` = `totalDamage` -
`deductibleApplied`.

New error codes:

| Code | Condition |
| --- | --- |
| `DAMAGE_BELOW_DEDUCTIBLE` | 422 when `totalDamage` <= `deductibleApplied` |
| `OVERRIDE_REASON_REQUIRED` | 422 when the deductible was changed and the reason is empty |

Our decision payload is `{ decision, notes }` today and has no loss figures
and no client-side decimal or lower-bound validation.

### 14.4 Screen 5 - GET /api/v1/public/claims/track/:trackingToken

Unauthenticated by design. This is the only endpoint of the five that must not
send an Authorization header.

Response shape: `claimNumber`, `status`, `statusDescription` (Arabic),
`vehicle` with `plateNumber` / `make` / `model` / `year`, and `timeline`
entries of `status`, `title`, `description`, `timestamp`.

Timeline uses a simplified vocabulary: `RECEIVED`, `IN_PROGRESS`, `IN_REVIEW`,
`APPROVED` / `REJECTED`, `CLOSED`.

Status vocabulary conflict:

- `RECEIVED` and `IN_REVIEW` do not exist in our internal enum.
- Our internal enum has `UNDER_REVIEW`, which the public timeline never uses.
- Therefore the public timeline cannot be rendered by reusing the internal
  claim status union or its labels. It needs its own label map and its own
  progress component.

Error: `404` with `CLAIM_NOT_FOUND`. The page must show a friendly Arabic
message and must not render the raw error code to the public.

Last live probe of this endpoint returned a bare `404` with `text/plain` and
an empty body, identical to a nonexistent route, so the endpoint itself is
still unconfirmed.

### 14.5 What the frontend still owes, in order

1. `description` field on the claim form.
2. Tracking token and link on create response and claim details.
3. `coverageSnapshot` display labelled as frozen-at-submission.
4. Loss assessment inputs plus decimal and minimum validation.
5. Map `DAMAGE_BELOW_DEDUCTIBLE` and `OVERRIDE_REASON_REQUIRED` to Arabic.
6. Public tracking route with its own status vocabulary and no auth header.
7. Live verification of all of the above before any of it ships.
