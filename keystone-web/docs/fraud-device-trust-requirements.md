# Device trust: what Fraud asked for and what we built

Working notes, kept because the question "why does the fingerprint include X" comes up every
audit. Owners: identity-platform (implementation), Fraud Strategy (requirements), Privacy Office
(sign-off on data elements). Tickets: FRD-0288 (original ask), FRD-0561 (revision after the 2023
account takeover wave), PRV-0119 (privacy assessment).

## The ask (FRD-0288, 2022-03)

Fraud wanted to skip OTP for customers on a device they had used before, and to *require* OTP,
regardless of trust, when the device "looked different" from the one enrolled. They asked for a
"device ID". Their reference was a vendor SDK that collects two hundred signals including canvas
rendering and installed fonts.

## What Privacy allowed (PRV-0119, 2022-05)

Not that. Canvas and font enumeration are fingerprinting in the regulatory sense and would need
consent under the state privacy statutes the bank operates under. Privacy allowed a fixed, small,
documented list of properties that are (a) disclosed in the privacy notice under "device
information", (b) not unique on their own, (c) not derived from probing the device.

The agreed list, which is exactly what `DeviceFingerprintService.collect` reads:

| property | why |
|---|---|
| `navigator.userAgent` | browser and OS family |
| `navigator.language`, `navigator.languages` | locale set rarely changes on a device |
| `navigator.platform` | OS |
| `navigator.hardwareConcurrency` | coarse hardware class |
| `navigator.maxTouchPoints` | touch vs not |
| `screen.width x screen.height`, `screen.colorDepth` | display class |
| `Intl.DateTimeFormat().resolvedOptions().timeZone` | location class, coarse |

Nothing else. No canvas, no WebGL, no audio, no fonts, no plugins, no battery, no storage probes,
no IP (the BFF sees that anyway). If Fraud ask for more, the answer is "PRV-0119, raise a new
assessment", not a code change.

## What we built (KEY-1560, KEY-1571)

- Read the list above, serialise deterministically (sorted keys, no whitespace), SHA-256 with
  `crypto.subtle`, send the hex digest to the BFF as `deviceHash` alongside the MFA transaction id.
- The BFF stores the hash against the customer with an expiry (30 days, `deviceTrustDays`) and
  sets an HttpOnly cookie carrying an opaque device token. **The browser never stores the hash or
  any device identifier we generate.** On the next login the BFF compares the hash we send with the
  one bound to the cookie. Mismatch means the cookie is ignored and OTP is required. That is
  Fraud's "looks different" requirement, met without us keeping anything client side.
- The hash is not stable across a browser major upgrade because `userAgent` changes. Fraud
  accepted this (FRD-0288 comment 14): a re-prompt every few months is desirable, not a defect.
- No rate limiting of enrolment on our side; the BFF limits to five trusted devices per customer.

## FRD-0561 revision (2023-09)

After the account takeover incidents Fraud asked for the fingerprint to be sent *before*
credentials so they could risk-score the attempt. Declined for the front end: we would be sending
device data for people who have not identified themselves. Compromise: `x-channel` header plus the
BFF's own view of IP and TLS fingerprint, which does not involve this app. Recorded here because
it will be asked again.

## Things that are not defensible and were rejected

- Persisting the hash in `localStorage` "for performance". No. Hashing eight strings takes under a
  millisecond.
- Including `navigator.deviceMemory`. Chrome only, and Privacy considered it a probe.
- Salting the hash with the customer id. The hash is compared per customer on the BFF anyway;
  salting client-side means the app knows the customer id before authentication, which it does not.
