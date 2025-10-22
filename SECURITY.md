# Security Policy

## Overview

Tooltip is a privacy-first, client-side application that runs entirely in your browser. We take security seriously and appreciate the security community's efforts to responsibly disclose vulnerabilities.

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

### Client-Side Only Architecture

- **No Server Communication**: Tooltip runs entirely in your browser with no data transmission to external servers
- **Local Storage Only**: All data is stored locally using IndexedDB in your browser
- **No Analytics**: We don't track, collect, or analyze user data
- **No Third-Party APIs**: No external API calls (except when you explicitly use tools like QR code generation)

### Data Privacy

- **Offline First**: Full functionality available offline via PWA
- **No Cookies**: We don't use cookies for tracking
- **No Authentication**: No user accounts or authentication required
- **Browser Isolation**: Data is isolated per browser/device

### Content Security

- **XSS Protection**: React's built-in XSS protection
- **Input Validation**: All user inputs are validated
- **Safe Rendering**: No dangerouslySetInnerHTML usage
- **TypeScript**: Type safety to prevent common vulnerabilities

## Reporting a Vulnerability

We take all security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

### 1. **Do Not** Create a Public Issue

Please **DO NOT** create a public GitHub issue for security vulnerabilities. Public disclosure could put users at risk.

### 2. Report Privately

Send an email to the maintainers with:

- **Subject**: "SECURITY: [Brief Description]"
- **Description**: Detailed description of the vulnerability
- **Impact**: Potential impact and attack scenarios
- **Steps to Reproduce**: Step-by-step instructions
- **Proof of Concept**: Code or screenshots if applicable
- **Suggested Fix**: If you have ideas for fixing (optional)

### 3. What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Assessment**: We'll assess the vulnerability and its impact
- **Updates**: We'll keep you informed of our progress
- **Resolution**: We aim to resolve critical issues within 7 days
- **Credit**: We'll credit you in the release notes (if desired)

### 4. Disclosure Policy

- We request that you give us reasonable time to address the issue before public disclosure
- We'll coordinate with you on the disclosure timeline
- We'll credit you for the discovery (unless you prefer to remain anonymous)

## Security Best Practices for Users

### Browser Security

1. **Keep Your Browser Updated**: Always use the latest version of your browser
2. **Use HTTPS**: Access the application via HTTPS when hosted
3. **Browser Extensions**: Be cautious with browser extensions that might access your data
4. **Clear Data**: Use browser tools to clear IndexedDB if needed

### Data Security

1. **Sensitive Information**: Avoid storing highly sensitive information in notes/tasks
2. **Device Security**: Use device encryption and screen locks
3. **Public Devices**: Don't use Tooltip on public/shared devices for sensitive data
4. **Browser Privacy Mode**: Data in incognito/private mode is cleared when session ends

### PWA Security

1. **Service Workers**: Service workers cache files for offline use
2. **Cache Clearing**: Clear browser cache to remove stored application files
3. **Permissions**: Review and manage browser permissions granted to the PWA

## Known Security Considerations

### Local Storage Risks

- **Data Accessibility**: Anyone with physical access to your device can access data stored in IndexedDB
- **Browser Extensions**: Malicious extensions could potentially access local storage
- **Recommendation**: Use device-level encryption and security measures

### Browser Vulnerabilities

- **Browser Bugs**: Security depends on browser security
- **Third-Party Libraries**: We use well-maintained libraries, but vulnerabilities can occur
- **Recommendation**: Keep browsers updated and review our dependencies

### QR Code Generation

- **URL Safety**: QR codes can contain malicious URLs
- **User Responsibility**: Users are responsible for content encoded in QR codes
- **Recommendation**: Verify QR code content before sharing

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported
2. **Day 1-2**: Acknowledgment and initial assessment
3. **Day 3-7**: Investigation and fix development
4. **Day 7-14**: Testing and verification
5. **Day 14-21**: Release preparation and coordinated disclosure
6. **Day 21+**: Public disclosure and security advisory

## Security Audits

We welcome security audits and reviews:

- **Code Review**: Our code is open source for community review
- **Dependency Scanning**: We use automated tools to scan dependencies
- **Regular Updates**: We keep dependencies up to date
- **Security Patches**: We prioritize security patches

## Security-Related Configuration

### Content Security Policy

When self-hosting, consider implementing CSP headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;
```

### HTTPS Configuration

Always serve over HTTPS in production:

```
- Use Let's Encrypt for free SSL certificates
- Configure HSTS headers
- Implement proper redirect from HTTP to HTTPS
```

## Dependencies

We regularly update and monitor our dependencies:

- **React**: UI framework with security updates
- **Vite**: Build tool with security considerations
- **TailwindCSS**: CSS framework
- **Dexie.js**: IndexedDB wrapper
- **qrcode**: QR code generation library

### Dependency Security

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update
```

## Security Checklist for Contributors

When contributing, please ensure:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation for all user inputs
- [ ] No eval() or Function() constructor usage
- [ ] Safe use of dangerouslySetInnerHTML (avoid if possible)
- [ ] Proper error handling without exposing sensitive info
- [ ] Dependencies are up to date
- [ ] No console.log() with sensitive data in production
- [ ] XSS protection considerations
- [ ] CSRF not applicable (no server-side state)

## Incident Response

In case of a security incident:

1. **Immediate Response**: We'll assess and contain the issue
2. **User Notification**: We'll notify users if their data might be affected
3. **Fix Development**: Priority development of security fix
4. **Emergency Release**: Expedited release process for critical issues
5. **Post-Mortem**: We'll analyze and document the incident
6. **Prevention**: Implement measures to prevent similar issues

## Security Resources

- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [GitHub Security Advisories](https://github.com/advisories)

## Contact

For security concerns:
- Create a private security advisory on GitHub
- Email maintainers directly (avoid public channels)
- Use GitHub's private vulnerability reporting feature

---

**Remember**: Tooltip is designed to be privacy-first and secure by default. All data stays on your device, and we rely on browser security mechanisms to protect your information.

Thank you for helping keep Tooltip and its users safe! 🔒
