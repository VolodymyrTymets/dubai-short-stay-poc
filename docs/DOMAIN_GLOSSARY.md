# Domain glossary

> One meaning per term. This drives naming in code, database and UI copy.
> A new user-facing noun means a line here, in the same PR (rule E1).

| Term (client language) | Code identifier | Means exactly | Not to be confused with |
|------------------------|-----------------|---------------|--------------------------|
| Guest | `Guest` (`api/prisma/models/actors.prisma`) | A person who books stays; a 1:1 extension of `Account` (`accountId` is unique). | `AccountService.createCustomerAccount` / the `Customers` relation name in `api/src/account/account.service.ts` and `api/src/migrations/items.development/init.customer.migration.ts` — these still say **Customer**, a leftover from before the schema was renamed `Customer` → `Guest` (see the old `Customer`/`Order` tables in `api/prisma/migrations/20260822074028_init/migration.sql`). The rename was never finished in application code — treat "Customer" in code as meaning **Guest**, and finish the rename rather than adding more `Customer` references. |
| Host | `Host` (`api/prisma/models/actors.prisma`) | A person who lists properties for guests to book; same 1:1-with-`Account` shape as `Guest`. | — |
| Account | `Account` | The single login identity shared by every role (guest, host, admin). Holds no profile/contact data itself. | `AccountProfile` (contact/personal data) and `AccountIdentity` (auth secrets) — both separate 1:1 tables. |
| Account role | `AccountRoleType` enum: `GUEST`, `HOST`, `ADMIN`; joined via `AccountOnRole` | The role(s) an `Account` currently holds — one account can hold more than one role over time. `Account.lastAccountRoleId` caches the most recently used one. | `Guest`/`Host` — those are actor profile tables, not the role assignment itself. |
| Account profile | `AccountProfile` | Contact and personal details (email, phone, name, DOB, SSN, avatar) plus `isPhoneVerified`/`is18YearOld` flags. | `AccountIdentity` — that holds password/OTP hashes and the refresh token, not personal data. |
| File | `File` + `FileType` (`IMG`, `VIDEO`) + `FileStatus` (`FILE_STATUS_*`) | An uploaded asset (e.g. an avatar or listing photo) stored in S3, tracked through an upload-progress state machine. | — |
| Deleted (soft delete) | `deleted: Boolean` on most models | Rows are soft-deleted (`deleted = true`), never hard-deleted, so history and relations survive. `DeletedHistory` records deletions separately. | An actual `DELETE` — never issue one against these tables. |

## Naming rules that follow from the above
- New code says **Guest**, never "Customer" — `Customer` is dead terminology from the pre-rename schema.
- A `Host` and a `Guest` are both just an `Account` wearing a role; don't create a parallel identity concept for either.

## Status/enum vocabularies
| Enum | Values | Meaning of each |
|------|--------|-----------------|
| `AccountRoleType` | `GUEST`, `HOST`, `ADMIN` | Who the account currently acts as. |
| `FileType` | `IMG`, `VIDEO` | The media kind of an uploaded `File`. |
| `FileStatus` | `FILE_STATUS_CREATED`, `FILE_STATUS_UPLOAD_IN_PROGRESS`, `FILE_STATUS_UPLOAD_COMPLETED`, `FILE_STATUS_UPLOAD_FAILED` | Where an upload is in its lifecycle. |

Property/listing/booking terms (`Reservation`, `Listing`, `Rate`, etc., visible in `doc/designs/` mockup
names like `HostListings.html`, `HostPricing.html`) don't exist in the Prisma schema yet — add them here
the moment the first migration introduces them.
