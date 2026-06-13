# 2. Charge lifecycle & webhooks

A charge moves through `created → authorized → captured → settled`. The terminal
states are **failed** and **refunded**.

| State        | Retryable | Next                  |
|--------------|-----------|-----------------------|
| created      | yes       | authorized, failed    |
| authorized   | yes       | captured, failed      |
| captured     | no        | settled, refunded     |
| **settled**  | no        | refunded              |
| **failed**   | no        | —                     |
| **refunded** | no        | —                     |

Webhooks are signed with HMAC-SHA256 over the raw body. Verify the signature
before trusting the payload; deliveries are retried with exponential backoff.
