# Security Specification - Biashara Smart AI

## Data Invariants
1. A **Transaction** must belong to the logged-in user at `/users/{userId}/transactions/{transactionId}`.
2. The `userId` in the path must match the `request.auth.uid`.
3. `amount` must be a positive number.
4. `type` must be either 'sale' or 'expense'.
5. Users cannot update their own `isPremium` status directly; it must be handled by a system process or admin (simulated for this demo). Actually, for this standalone, we'll restrict `isPremium` writes to prevent users from gifting themselves premium.

## The "Dirty Dozen" Payloads (Red Team Test Cases)

1. **Identity Spoofing**: Attempt to write a transaction to another user's subcollection.
   - Target: `/users/other-user-123/transactions/trans-1`
   - Payload: `{ "type": "sale", "amount": 100, "description": "stolen", "timestamp": request.time }`
   - Expect: `PERMISSION_DENIED`

2. **Privilege Escalation**: User tries to set `isPremium: true` in their own profile.
   - Target: `/users/my-user-id`
   - Update: `{ "isPremium": true }`
   - Expect: `PERMISSION_DENIED` (only non-sensitive fields should be editable)

3. **Validation Bypass (Negative Amount)**:
   - Target: `/users/my-user-id/transactions/trans-1`
   - Payload: `{ "type": "sale", "amount": -500, "description": "money laundry", "timestamp": request.time }`
   - Expect: `PERMISSION_DENIED`

4. **Resource Poisoning (Huge String)**:
   - Target: `/users/my-user-id/transactions/trans-1`
   - Payload: `{ "type": "sale", "amount": 10, "description": "A" * 1000000, "timestamp": request.time }`
   - Expect: `PERMISSION_DENIED`

5. **Resource Poisoning (Invalid ID)**:
   - Target: `/users/my-user-id/transactions/invalid!!ID@@`
   - Expect: `PERMISSION_DENIED`

6. **State Shortcutting**: Updating a payment from 'pending' to 'completed' without server authorization.
   - Target: `/users/my-user-id/payments/pay-1`
   - Update: `{ "status": "completed" }`
   - Expect: `PERMISSION_DENIED`

7. **PII Blanket Read**: Trying to list all users.
   - Target: `/users`
   - Expect: `PERMISSION_DENIED`

8. **Orphaned Write**: Creating a transaction for a user that doesn't exist.
   - Target: `/users/non-existent-user/transactions/t1`
   - Expect: `PERMISSION_DENIED`

9. **Action Spoofing**: Updating `createdAt` timestamp.
   - Update on User: `{ "createdAt": "2000-01-01" }`
   - Expect: `PERMISSION_DENIED`

10. **Type Poisoning**: Sending an object instead of a number for `amount`.
    - Payload: `{ "amount": { "value": 100 } }`
    - Expect: `PERMISSION_DENIED`

11. **Shadow Update**: Adding `isAdmin: true` to a transaction.
    - Payload: `{ "amount": 10, "type": "sale", "isAdmin": true, ... }`
    - Expect: `PERMISSION_DENIED`

12. **Query Scraping**: Listing transactions without the user's ID filter.
    - Target: `/users/my-user-id/transactions` where `userId != auth.uid`
    - Expect: `PERMISSION_DENIED`
