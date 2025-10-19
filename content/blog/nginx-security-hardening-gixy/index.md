---
title: "Nginx Security Hardening with Gixy: Automated Configuration Analysis"
date: 2025-10-18
draft: true
description: "Learn how to use Gixy to automatically find security misconfigurations in your Nginx setup"
tags: ["security", "nginx", "devops", "infrastructure", "automation"]
---

Nginx powers over 30% of the world's websites. It's fast, reliable, and battle-tested. But even the best web server can't protect you from misconfigured security settings.

**The problem:** Nginx configuration files are notoriously difficult to audit manually. A single `proxy_pass` misconfiguration can expose internal services. A missing security header leaves users vulnerable. A poorly written regex can enable path traversal attacks.

**The solution:** [Gixy](https://github.com/yandex/gixy) - an automated Nginx configuration analyzer created by Yandex. Think of it as a linter for your nginx.conf, but focused on security.

## Why Nginx Misconfigurations Matter

Before we dive into Gixy, let's look at real-world consequences of Nginx misconfigurations:

### 1. SSRF (Server-Side Request Forgery)

**Vulnerable config:**
```nginx
location ~ /proxy/(.*)$ {
    proxy_pass http://$1;  # User-controlled!
}
```

**Attack:**
```bash
curl https://yoursite.com/proxy/localhost:6379/
# Attacker now talking to your Redis instance
```

### 2. Path Traversal

**Vulnerable config:**
```nginx
location /files {
    alias /var/www/files/;  # Missing trailing slash!
}
```

**Attack:**
```bash
curl https://yoursite.com/files../etc/passwd
# Reads /var/www/etc/passwd
```

### 3. Response Splitting

**Vulnerable config:**
```nginx
location /redirect {
    return 302 https://example.com$uri;  # $uri not escaped!
}
```

**Attack:**
```bash
curl "https://yoursite.com/redirect/%0d%0aSet-Cookie:%20admin=true"
# Injects HTTP headers
```

Gixy detects all of these automatically.

## Installing Gixy

```bash
# Python 3.6+ required
pip install gixy

# Or with pipx (recommended for isolation)
pipx install gixy

# Verify installation
gixy --version
```

## Basic Usage

```bash
# Analyze nginx.conf
gixy /etc/nginx/nginx.conf

# Analyze with custom config
gixy -c /path/to/nginx.conf

# Output as JSON for CI/CD
gixy -f json /etc/nginx/nginx.conf
```

## What Gixy Checks For

### 1. Host Spoofing

**Issue:** Nginx uses the `Host` header from client requests. Attackers can spoof this.

**Vulnerable config:**
```nginx
server {
    listen 80;
    server_name _;  # Accepts any Host header

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;  # Forwards spoofed header
    }
}
```

**Gixy warning:**
```
>> Host header forgery detected
server_name: _ at line 2

More info: https://github.com/yandex/gixy/blob/master/docs/en/plugins/hostspoofing.md
```

**Fix:**
```nginx
server {
    listen 80;
    server_name example.com;  # Specific domain

    location / {
        proxy_pass http://backend;
        proxy_set_header Host $server_name;  # Use configured server_name
    }
}
```

### 2. HTTP Splitting

**Issue:** User-controlled data in HTTP headers enables header injection.

**Vulnerable config:**
```nginx
location /redirect {
    add_header Location https://example.com$uri;
    return 302;
}
```

**Gixy warning:**
```
>> HTTP Splitting detected
add_header directive at line 2 uses $uri which is user-controlled

More info: https://github.com/yandex/gixy/blob/master/docs/en/plugins/httpsplitting.md
```

**Fix:**
```nginx
location /redirect {
    # Escape user input
    set_by_lua_block $safe_uri {
        return ngx.escape_uri(ngx.var.uri)
    }
    add_header Location https://example.com$safe_uri;
    return 302;
}
```

Or simpler - use `return` instead of `add_header`:

```nginx
location /redirect {
    return 302 https://example.com$uri;  # return sanitizes automatically
}
```

### 3. SSRF via `proxy_pass`

**Issue:** User-controlled `proxy_pass` destinations.

**Vulnerable config:**
```nginx
location ~ /proxy/(.*)$ {
    proxy_pass http://$1;
}
```

**Gixy warning:**
```
>> Server Side Request Forgery (SSRF) detected
proxy_pass at line 2 uses user-controlled variable $1

More info: https://github.com/yandex/gixy/blob/master/docs/en/plugins/ssrf.md
```

**Fix:**
```nginx
# Whitelist allowed backends
map $request_uri $backend {
    ~^/proxy/api    http://api-backend;
    ~^/proxy/images http://image-backend;
    default         http://default-backend;
}

location /proxy/ {
    proxy_pass $backend;
}
```

### 4. `alias` Path Traversal

**Issue:** Missing trailing slashes in `alias` directives.

**Vulnerable config:**
```nginx
location /files {
    alias /var/www/files;  # Missing trailing /
}
```

**Gixy warning:**
```
>> Alias traversal detected
alias directive at line 2 doesn't end with /

More info: https://github.com/yandex/gixy/blob/master/docs/en/plugins/aliastraversal.md
```

**Attack:**
```bash
# Reads /var/www/files/../etc/passwd
curl https://yoursite.com/files../etc/passwd
```

**Fix:**
```nginx
location /files/ {  # Add trailing /
    alias /var/www/files/;  # Add trailing /
}
```

### 5. `add_header` in `if` Blocks

**Issue:** Headers set in `if` blocks don't inherit outer headers.

**Vulnerable config:**
```nginx
add_header X-Frame-Options "DENY";

location / {
    if ($request_method = POST) {
        return 200 "OK";  # X-Frame-Options header missing!
    }
}
```

**Gixy warning:**
```
>> add_header in if block overrides outer headers
add_header at line 1 is not applied in if block at line 4

More info: https://github.com/yandex/gixy/blob/master/docs/en/plugins/addheaderredefinition.md
```

**Fix:**
```nginx
location / {
    add_header X-Frame-Options "DENY" always;  # 'always' applies everywhere

    if ($request_method = POST) {
        return 200 "OK";
    }
}
```

## Real-World Security Checklist

Here's my Nginx security baseline (which Gixy helps enforce):

### 1. Security Headers

```nginx
# Always add these
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# HSTS (only over HTTPS)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# CSP (adjust for your needs)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 2. Hide Server Version

```nginx
http {
    server_tokens off;  # Hides Nginx version
}
```

### 3. Rate Limiting

```nginx
# Define rate limit zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

server {
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://backend;
    }
}
```

### 4. SSL/TLS Best Practices

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
ssl_stapling on;
ssl_stapling_verify on;
```

### 5. Block Common Attacks

```nginx
# Block bad bots
if ($http_user_agent ~* (bot|crawl|spider|scrape)) {
    return 403;
}

# Block SQL injection attempts
if ($args ~* (union.*select|insert.*into|delete.*from)) {
    return 403;
}

# Block file injection attempts
if ($query_string ~* (\.\./|\.\.\\|php://|data://|expect://)) {
    return 403;
}
```

## Integrating Gixy into CI/CD

### GitHub Actions Example

```yaml
name: Nginx Config Security Scan

on:
  pull_request:
    paths:
      - 'nginx/**'

jobs:
  gixy-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'

      - name: Install Gixy
        run: pip install gixy

      - name: Scan Nginx configs
        run: |
          gixy -f json nginx/nginx.conf > gixy-report.json
          cat gixy-report.json

      - name: Fail on HIGH severity
        run: |
          high_count=$(jq '[.[] | select(.severity == "high")] | length' gixy-report.json)
          if [ "$high_count" -gt 0 ]; then
            echo "Found $high_count high-severity issues"
            exit 1
          fi

      - name: Upload scan results
        uses: actions/upload-artifact@v3
        with:
          name: gixy-report
          path: gixy-report.json
```

### GitLab CI Example

```yaml
nginx-security-scan:
  image: python:3.10
  stage: test
  before_script:
    - pip install gixy
  script:
    - gixy -f json /etc/nginx/nginx.conf | tee gixy-report.json
    - |
      high_count=$(jq '[.[] | select(.severity == "high")] | length' gixy-report.json)
      if [ "$high_count" -gt 0 ]; then
        echo "Found $high_count high-severity issues"
        exit 1
      fi
  artifacts:
    reports:
      junit: gixy-report.json
    paths:
      - gixy-report.json
    expire_in: 1 week
  only:
    changes:
      - nginx/**
```

## Advanced: Custom Gixy Plugins

You can write custom checks for your specific needs.

**Example: Enforce specific security headers**

```python
# custom_headers_plugin.py
from gixy.plugins.plugin import Plugin

class CustomHeadersPlugin(Plugin):
    summary = 'Checks for mandatory security headers'
    severity = Plugin.SEVERITY_HIGH

    def audit(self, directive):
        if directive.name == 'location':
            headers = [d for d in directive if d.name == 'add_header']
            required = ['X-Frame-Options', 'X-Content-Type-Options', 'X-XSS-Protection']

            for header in required:
                if not any(header in str(h) for h in headers):
                    self.add_issue(
                        severity=self.severity,
                        summary=f'Missing required header: {header}',
                        directive=directive
                    )
```

**Usage:**
```bash
gixy --plugins custom_headers_plugin /etc/nginx/nginx.conf
```

## Gixy Limitations

Gixy is powerful, but not perfect:

1. **No runtime analysis**: Can't detect issues that only appear under load
2. **Limited Lua support**: If you use Lua extensively, manual review still needed
3. **False positives**: Some warnings might not apply to your specific setup
4. **Config includes**: Ensure all `include` files are accessible

**Pro tip:** Use Gixy as part of defense-in-depth, not as your only security measure.

## Complementary Tools

- **nginx-lint**: Basic syntax checking
- **OWASP ZAP**: Runtime security testing
- **Nmap**: Port scanning and service detection
- **SSLyze**: SSL/TLS configuration analysis
- **testssl.sh**: Comprehensive TLS testing

## Conclusion

Nginx misconfigurations are easy to make and hard to spot manually. Gixy automates this tedious work, catching security issues before they reach production.

**Action items:**
1. Install Gixy: `pip install gixy`
2. Scan your configs: `gixy /etc/nginx/nginx.conf`
3. Fix high-severity issues first
4. Add Gixy to your CI/CD pipeline
5. Rerun after every config change

Security automation isn't about replacing human expertise - it's about catching the easy mistakes so you can focus on the hard problems.

---

*Securing infrastructure? Let's connect on [LinkedIn](https://www.linkedin.com/in/miska-hämäläinen/) or check out my [GitHub](https://github.com/miskahm) for more security tooling.*
