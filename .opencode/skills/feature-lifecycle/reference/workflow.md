# Workflow — operating procedure (step by step)

Run these steps in order. Each gates the next.

## §0 Decide & agree (pre-code)

- If the request involves a design decision (capacity model, role permissions, status flow, UX shape), ask **ONE question** with a recommended option first (`/grill-me`). Propose the recommended answer as the first option.
- If the user opts out of implementation ("سنتفق أولاً", "أرسله للباك"), deliver the spec/agreement only. No code.

## §1 Verify the contract live

Probes run from Windows PowerShell (5.1). Canonical idiom — separate login from the action, never chain calls blindly, and always read the real HTTP status + response body:

```powershell
$base = "https://insurflow-backend.onrender.com/api/v1"
function Login($emp) {
  try {
    $r = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType "application/json" `
      -Body (@{ organizationCode="DEMO-INS"; employeeCode=$emp; password="Password123!" } | ConvertTo-Json) -TimeoutSec 25
    return @{ ok=$true; token=$r.data.accessToken; role=$r.data.user.role }
  } catch { return @{ ok=$false; err=$_.Exception.Message } }
}
function Probe($label, $tk, $method, $uri, $body) {
  try {
    $h = @{ Authorization = "Bearer $tk" }
    $r = Invoke-RestMethod -Method $method -Uri $uri -Headers $h -ContentType "application/json" `
      -Body ($body | ConvertTo-Json) -TimeoutSec 25
    Write-Output "$label -> STATUS=200+ BODY=$($r | ConvertTo-Json -Depth 4 -Compress)"
  } catch {
    $res = $_.Exception.Response
    $st = if ($res) { [int]$res.StatusCode } else { "no-response" }
    $bd = ""
    if ($res) { try { $rd = New-Object System.IO.StreamReader($res.GetResponseStream()); $bd = $rd.ReadToEnd() } catch {} }
    Write-Output "$label -> STATUS=$st BODY=$bd"
  }
}
```

**Classify the result:**
| Status | Meaning |
|---|---|
| `401` | token/password invalid — check the account (password may have been changed) |
| `400` | authz PASSED, input invalid → the allowlist includes this role |
| `403` | role blocked by the backend allowlist |
| `404` | endpoint or target doesn't exist (render fallback: "Endpoint Not Found") |
| `2xx` | endpoint + role work; verify the body shape matches the frontend types |

Prove the role gate by probing with **both** `AD-001` (ADMIN) and `CO-001` (CLAIMS_OFFICER). Output an evidence table, e.g.: `POST /claims → ADMIN 403 / OFFICER 400-validation` ⇒ officer allowed, admin blocked.

## §2 Classify ownership

- All pass + shapes match frontend types → **§4 Implement**.
- Any 403/404/missing field → **§3 Handoff** (backend owns the fix).

## §3 Handoff to محمد (backend request)

Ready-to-paste message in Arabic with this template. **STOP here — do not start frontend work while waiting.**

```
العَرَض / الجهة:
  ما يحدث الآن (خطأ + من أين) + نقطة الفحص الحديدية (جدول AD-001/CO-001).

المطلوب:
  - لكل نقطة: method + path + payload + response shape المطلوب.

معايير "تم" (قابلة للتحقق):
  - بدقة: "أتحقق من... و... ثم ..." — كل بند يكتمل بعلامة إنجاز.

ملاحظات:
  - أمثلة أخطاء حالية، استثناءات (لا نريد سقفاً صلباً، إلخ).
```

Then wait for the backend's "تم" reply before resuming implementation.

## §4 Implement (frontend-only)

Follow existing conventions:
1. **Types** — extend `src/types/index.ts` (match the verified response shape).
2. **Service** — `src/api/*.service.ts` with the shared `apiClient`; surface backend error codes through `getApiErrorMessage`.
3. **Hook** — `src/hooks/*.ts` when state logic repeats (optimistic updates with rollback; reload the list on success).
4. **UI** — pages under `src/pages`, modals/forms in `src/components`; keep the design system (Tailwind, lucide-react icons, existing Modal/FormField components).
5. **Tests** — extend adjacent test files or add `*.test.ts(x)`; component tests need `// @vitest-environment jsdom`; mock API modules; assert both success and error paths.
6. Permissions touched? Update `masar-rbac` skill matrix in the same task.

## §5 Green bar (mandatory, in this order)

```powershell
npx vitest run   # all tests green (baseline 78)  — workdir: dashboard
npm run build    # tsc -b && vite build (no TS errors)
npm run lint     # eslint . (no issues)
```

Fix every failure. Only when all three pass is the change "done".

## §6 Report & knowledge

- Summarize: what was implemented, evidence (test counts, build/lint OK), what is blocked (waiting on محمد), what is uncommitted/undeployed (Vercel still serves the old build until pushed).
- Record new permission rulings in `masar-rbac`; record new contract facts in this skill's `rules.md` only when they are durable.