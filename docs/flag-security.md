# Security Best Practices - Flag Protection

## Flag Storage & Validation

### The Problem
Storing flags in plain text allows attackers to:
- Read flags directly from database dumps
- Extract flags from repository code
- Compromise the entire CTF by dumping the database

### Our Solution: Multi-Layer Protection

## 1. Flag Hashing (Primary Defense)

Flags are stored as **hashed values** in the database, similar to passwords. When a user submits a flag, we hash their submission and compare it to the stored hash.

**Implementation:**
```typescript
// Flags are hashed with SHA-256 before storage
import crypto from 'crypto';

function hashFlag(flag: string): string {
  return crypto
    .createHash('sha256')
    .update(flag.toLowerCase().trim())
    .digest('hex');
}
```

**Benefits:**
- Database dumps are useless without the original flags
- Even database admins can't read actual flags
- One-way encryption - can't reverse the hash

## 2. Server-Side Only Validation

**Never send flags to the client:**
- Challenge API responses exclude the `flag` field
- Validation happens entirely on the backend
- Frontend never receives actual flag values

## 3. Case-Insensitive Comparison

```typescript
// Both stored hash and submission use lowercase
SENTINEL{test_flag} === SENTINEL{TEST_FLAG} === sentinel{test_flag}
```

## 4. Rate Limiting

Prevent brute-force flag guessing:
```typescript
// 5 attempts per challenge per user per 15 minutes
max_attempts: 5
window: 900000 // 15 minutes
```

## 5. Audit Logging

Track all submission attempts:
- Timestamp
- User ID
- Challenge ID
- Submitted value (hashed)
- Success/failure
- IP address

## 6. Admin-Only Flag Access

Original flags are only visible to admin users through a secure admin panel.

## Migration Strategy

For existing challenges with plain-text flags, run this migration:

```sql
-- Backup existing flags
CREATE TEMPORARY TABLE flag_backup AS 
SELECT id, flag FROM challenges;

-- Hash all flags
UPDATE challenges 
SET flag_hash = encode(sha256(lower(trim(flag))::bytea), 'hex');

-- Remove plain text flags from database
ALTER TABLE challenges DROP COLUMN flag;
```

## Implementation in Code

The system automatically:
1. Hashes flags when creating challenges
2. Hashes submissions before comparison
3. Never exposes original flags in API responses
4. Logs all attempts for security monitoring

## Developer Workflow

When creating challenges:
```json
{
  "title": "New Challenge",
  "flag": "SENTINEL{original_flag_here}",
  // System automatically:
  // 1. Hashes the flag
  // 2. Stores only the hash
  // 3. Discards the original
}
```

## Additional Security Measures

1. **Environment Variables:** Admin credentials not in code
2. **Key Vault:** Production flags stored in Azure Key Vault
3. **Access Control:** Database access restricted by IP
4. **SSL/TLS:** All connections encrypted
5. **Input Sanitization:** Prevent SQL injection in submissions

## Trade-offs

**Pros:**
- Maximum security
- Industry standard practice
- Protects against database compromise

**Cons:**
- Can't recover lost flags (must reset challenge)
- Slightly more complex admin workflow
- Need to maintain original flags externally for reference

## Best Practices for CTF Organizers

1. **Keep a Secure Flag Master List** - Store original flags in Azure Key Vault or encrypted file
2. **Use Strong Flag Formats** - `SENTINEL{unique_random_string}`
3. **Rotate Flags** - Change flags between CTF events
4. **Monitor Submissions** - Watch for suspicious patterns
5. **Backup Before Migration** - Always backup before hashing existing flags

---

This approach is used by major CTF platforms like CTFd and ensures your competition maintains integrity even if the database is compromised.
