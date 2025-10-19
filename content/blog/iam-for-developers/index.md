---
title: "IAM for Developers: What You Actually Need to Know"
date: 2025-10-18
draft: true
description: "A practical guide to Identity and Access Management concepts every developer should understand"
tags: ["security", "iam", "authentication", "authorization", "identity"]
---

You've probably heard "IAM" thrown around in meetings, security reviews, or compliance discussions. Identity and Access Management sounds like something only enterprise security teams worry about. But here's the reality: **every application you build deals with IAM**, whether you realize it or not.

This guide cuts through the enterprise jargon to explain IAM concepts that matter for developers building real applications.

## What is IAM, Really?

IAM answers three fundamental questions:

1. **Who are you?** (Authentication)
2. **What can you do?** (Authorization)
3. **How do we prove it?** (Identity lifecycle)

Think of IAM as the bouncer, the guest list, and the security logs all rolled into one system.

### Authentication vs. Authorization (Finally Explained)

People confuse these constantly. Here's the difference:

**Authentication** = Proving who you are
- Login with username/password
- OAuth/OIDC login ("Sign in with Google")
- Multi-factor authentication (MFA)
- Biometric verification

**Authorization** = What you're allowed to do
- User roles (admin, user, viewer)
- Permissions (can read, can write, can delete)
- Resource-based access (owner of this document)
- Attribute-based access (only if user.department === "finance")

**Example:**
- You authenticate with your company badge (authentication)
- The door lets you into engineering, but not HR (authorization)

## The IAM Concepts You'll Actually Use

### 1. Identity Providers (IdP)

An IdP is the system that stores user identities and handles authentication. Examples:

- **Internal**: Your own user database with bcrypt-hashed passwords
- **Enterprise**: Active Directory, Okta, Azure AD, Google Workspace
- **Social**: "Sign in with Google/GitHub/Apple"
- **FOSS**: Keycloak, Authentik, Ory

**Developer implications:**
- Don't build your own auth if you can avoid it (seriously, don't)
- Use established protocols (SAML, OIDC, OAuth 2.0)
- Delegate authentication to IdP when possible

### 2. RBAC (Role-Based Access Control)

The most common authorization model. Users get roles, roles have permissions.

**Example structure:**
```javascript
const roles = {
  admin: ['users:read', 'users:write', 'users:delete', 'content:*'],
  editor: ['content:read', 'content:write', 'users:read'],
  viewer: ['content:read']
};

function hasPermission(user, permission) {
  const userPermissions = roles[user.role] || [];
  return userPermissions.some(p =>
    p === permission || p.endsWith(':*') && permission.startsWith(p.split(':')[0])
  );
}

// Usage
if (hasPermission(currentUser, 'users:delete')) {
  deleteUser(userId);
}
```

**When RBAC falls short:**
- Complex permission hierarchies
- User-specific exceptions ("this user can't access this specific resource")
- Dynamic permissions based on context

That's when you need...

### 3. ABAC (Attribute-Based Access Control)

Access decisions based on attributes (user attributes, resource attributes, environment attributes).

**Example:**
```javascript
function canAccessDocument(user, document, context) {
  // User attributes
  const userDepartment = user.department;
  const userClearance = user.clearanceLevel;

  // Resource attributes
  const docDepartment = document.department;
  const docClassification = document.classification;

  // Environment attributes
  const isWorkingHours = context.time >= 9 && context.time <= 17;
  const isFromCorporateNetwork = context.ipRange === 'corporate';

  return (
    userDepartment === docDepartment &&
    userClearance >= docClassification &&
    isWorkingHours &&
    isFromCorporateNetwork
  );
}
```

**When to use ABAC:**
- Healthcare (HIPAA rules)
- Finance (SOX compliance)
- Government (classified data)
- Any complex, context-dependent access rules

### 4. SSO (Single Sign-On)

One login for multiple applications. Users authenticate once, access everything.

**Protocols:**
- **SAML 2.0**: XML-based, enterprise standard (clunky but everywhere)
- **OIDC (OpenID Connect)**: Modern, JSON-based, built on OAuth 2.0
- **OAuth 2.0**: For API authorization (not authentication, despite common misuse)

**Implementation example (OIDC with Passport.js):**
```javascript
const passport = require('passport');
const { Strategy: OIDCStrategy } = require('passport-openidconnect');

passport.use('oidc', new OIDCStrategy({
  issuer: 'https://accounts.google.com',
  authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenURL: 'https://oauth2.googleapis.com/token',
  userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo',
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://yourapp.com/auth/callback',
  scope: ['openid', 'profile', 'email']
}, (issuer, profile, done) => {
  // Find or create user in your database
  User.findOrCreate({ googleId: profile.id }, (err, user) => {
    return done(err, user);
  });
}));
```

### 5. MFA (Multi-Factor Authentication)

Something you know + something you have + something you are.

**Types:**
- **TOTP (Time-Based One-Time Password)**: Google Authenticator, Authy
- **SMS/Email codes**: Convenient but less secure (SIM swapping attacks)
- **Hardware tokens**: YubiKey, FIDO2 keys
- **Biometrics**: Face ID, Touch ID, fingerprint

**Implementing TOTP:**
```javascript
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Generate secret for new user
const secret = speakeasy.generateSecret({
  name: 'YourApp (user@example.com)'
});

// Store secret.base32 in database
await User.update(userId, { mfaSecret: secret.base32 });

// Generate QR code for user to scan
const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

// Verify TOTP code during login
const verified = speakeasy.totp.verify({
  secret: user.mfaSecret,
  encoding: 'base32',
  token: userProvidedCode,
  window: 2 // Allow 1 minute drift
});

if (verified) {
  // Grant access
}
```

## Real-World IAM Patterns

### Pattern 1: Service Account Management

Your app needs to call other APIs. How do you authenticate?

**Options:**
1. **API Keys**: Simple, but hard to rotate
2. **OAuth Client Credentials**: Industry standard
3. **Service Account with JWT**: Good for microservices

**Example (OAuth Client Credentials):**
```javascript
const axios = require('axios');

async function getServiceAccessToken() {
  const response = await axios.post('https://auth.example.com/oauth/token', {
    grant_type: 'client_credentials',
    client_id: process.env.SERVICE_CLIENT_ID,
    client_secret: process.env.SERVICE_CLIENT_SECRET,
    scope: 'api:read api:write'
  });

  return response.data.access_token;
}

// Use token for API calls
const token = await getServiceAccessToken();
const apiResponse = await axios.get('https://api.example.com/data', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Pattern 2: Scoped Tokens

Not all tokens should have full access. Scope them to minimum necessary permissions.

**Example (JWT with scopes):**
```javascript
const jwt = require('jsonwebtoken');

// Creating a scoped token
function createScopedToken(userId, scopes, expiresIn = '1h') {
  return jwt.sign({
    sub: userId,
    scopes: scopes, // ['users:read', 'content:write']
    iat: Date.now()
  }, process.env.JWT_SECRET, { expiresIn });
}

// Middleware to verify scopes
function requireScope(requiredScope) {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.scopes.includes(requiredScope)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.user = decoded;
    next();
  };
}

// Usage
app.delete('/users/:id', requireScope('users:delete'), deleteUser);
```

## Common IAM Mistakes Developers Make

### 1. Rolling Your Own Auth

Unless you're building an IAM product, **don't build authentication from scratch**.

Use:
- Auth0, Clerk, Supabase Auth (managed)
- Keycloak, Ory, Authentik (self-hosted)
- Firebase Auth, AWS Cognito (cloud)

### 2. Storing Passwords in Plain Text

Always hash passwords. Use bcrypt, scrypt, or Argon2.

```javascript
const bcrypt = require('bcrypt');

// Hashing password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

// Verifying password
const match = await bcrypt.compare(userProvidedPassword, storedHashedPassword);
```

### 3. Forgetting About Session Management

Sessions need:
- Expiration (idle timeout, absolute timeout)
- Revocation (logout, security incident)
- Secure storage (HTTPOnly, Secure, SameSite cookies)

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // HTTPS only
    httpOnly: true, // No JavaScript access
    sameSite: 'lax', // CSRF protection
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  },
  store: new RedisStore({ client: redisClient }) // Use Redis, not memory
}));
```

### 4. Not Implementing Least Privilege

Users should have minimum permissions needed to do their job. Start restrictive, expand as needed.

### 5. Ignoring Audit Logs

Track who did what, when. Critical for security and compliance.

```javascript
async function auditLog(userId, action, resourceType, resourceId, metadata = {}) {
  await AuditLog.create({
    userId,
    action, // 'create', 'update', 'delete', 'access'
    resourceType, // 'user', 'document', 'api-key'
    resourceId,
    timestamp: new Date(),
    ipAddress: metadata.ip,
    userAgent: metadata.userAgent,
    result: metadata.success ? 'success' : 'failure'
  });
}
```

## Getting Started: A Practical Roadmap

### Phase 1: Basic Auth
1. Integrate an IdP (Auth0/Clerk recommended for speed)
2. Implement username/password login
3. Add password reset flow
4. Hash passwords properly (bcrypt)

### Phase 2: Authorization
1. Define roles (admin, user, viewer)
2. Implement RBAC
3. Add permission checks to routes
4. Audit logs for sensitive actions

### Phase 3: Advanced Security
1. Enable MFA (TOTP + backup codes)
2. Implement SSO (OIDC/SAML)
3. Add session management (idle timeout)
4. Rate limiting on auth endpoints

## Conclusion

IAM isn't just for enterprise security teams anymore. Every application needs strong identity and access controls.

**Key takeaways:**
1. **Authentication ≠ Authorization** - Know the difference
2. **Don't roll your own auth** - Use established solutions
3. **Start with RBAC** - Graduate to ABAC if needed
4. **MFA is non-negotiable** - Especially for admins
5. **Audit everything** - You'll thank yourself during incidents

IAM is complex, but understanding these fundamentals will make you a better, more security-aware developer.

---

*Working on IAM implementations? Connect with me on [LinkedIn](https://www.linkedin.com/in/miska-hämäläinen/) or check out my projects on [GitHub](https://github.com/miskahm).*
