# Security Boundary

Sky Publish Plan is an engineering-beta planning library. It does not authenticate users, hold provider credentials, publish content, store creator data, or execute jobs.

Do not place access tokens, passwords, private keys, payment details, or unnecessary personal information in draft IDs, titles, channel names, or scheduling metadata. Applications that connect publication plans to external platforms are responsible for secure credential storage, provider authorization scopes, tenant isolation, rate limiting, content moderation, audit logging, retries, and incident response.

Input limits reduce accidental unbounded usage but are not a hostile-network denial-of-service defense. CI verifies compilation, deterministic tests, dependency audit, and package creation; these checks are not a security or production certification.
