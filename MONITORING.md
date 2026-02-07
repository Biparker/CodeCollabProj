# codecollabproj2 - Monitoring & Maintenance

**Maintained by:** Forge (Code Agent)  
**Task ID:** j57dgxraf0ag  
**Last Update:** 2026-02-07

## Automated Security Monitoring

### GitHub Action (Recommended)
Weekly security audits run automatically via GitHub Actions:
- **Schedule:** Every Sunday at 2 AM UTC (Saturday 9 PM EST)
- **Triggers:** Also runs on PRs that modify package files
- **Workflow:** `.github/workflows/weekly-security-audit.yml`
- **Reports:** Audit results saved as artifacts (90-day retention)

### Manual Audit
```bash
# Clone repo
gh repo clone alexrobinett/codecollabproj2
cd codecollabproj2

# Run audits
npm audit --audit-level=moderate
cd client && npm audit --audit-level=moderate
cd ../server && npm audit --audit-level=moderate
```

## Current Status (2026-02-07)

### ✅ Fixed Vulnerabilities
- **Server:** Nodemailer 6.9.0 → 8.0.1 (MODERATE)
- **Client:** Applied safe npm audit fixes

### ⚠️ Remaining Issues
- **Client:** SVGO vulnerabilities in react-scripts build chain (HIGH)
  - Requires `npm audit fix --force` which breaks react-scripts
  - **Recommendation:** Wait for react-scripts v6 or migrate to Vite

## Dependency Update Schedule

### Weekly (Automated)
- Security audits via GitHub Actions
- Automatic patch version updates (if configured)

### Monthly (Manual)
- Review and apply minor version updates
- Test build and deployment after updates
- Update this document with findings

### Quarterly (Manual)
- Plan major version updates (React, MUI, Express, etc.)
- Create feature branch for testing
- Run full E2E test suite

## Testing Checklist

Before merging dependency updates:
- [ ] `npm install` succeeds in all directories
- [ ] `npm run build` succeeds in client
- [ ] Server starts without errors: `npm start` in server
- [ ] Authentication flow works
- [ ] Email sending works (nodemailer)
- [ ] Run E2E tests: `npm run test:e2e` (if available)

## Next Major Updates (Planned)

| Package | Current | Target | Priority | Breaking Changes |
|---------|---------|--------|----------|------------------|
| React | 18.2.0 | 19.x | High | SSR changes, new APIs |
| React Router | 6.22.1 | 7.x | Medium | Route config format |
| MUI | 5.15.10 | 7.x | Medium | Style engine changes |
| Express | 4.18.3 | 5.x | Low | Middleware API |
| Mongoose | 8.2.0 | 9.x | Low | Query behavior |

## Monitoring Tools

### OpenClaw Cron (Alternative)
If GitHub Actions are not preferred, use OpenClaw cron:
```bash
openclaw cron add \
  --name "codecollabproj2-security-scan" \
  --schedule "0 2 * * 0" \
  --agent code \
  --command "cd /tmp/codecollabproj2 && git pull && npm audit && cd client && npm audit && cd server && npm audit"
```

### Dependabot (Optional)
Enable Dependabot in GitHub Settings:
1. Go to Settings → Security → Dependabot
2. Enable Dependabot alerts
3. Enable Dependabot security updates
4. Consider enabling version updates (creates PRs automatically)

## Contact & Escalation

### For Security Issues
- **Critical vulnerabilities:** Notify Alex immediately on Discord
- **High/Moderate:** Include in weekly sync
- **Low:** Document in next audit report

### Weekly Sync
Review audit reports every **Friday** with Alex:
- Summarize new vulnerabilities
- Propose update strategy
- Schedule breaking change updates

## Related Files
- Security audit history: `SECURITY_AUDIT_*.md`
- Environment setup: `ENVIRONMENT.md`
- Deployment guide: `RAILWAY_DEPLOYMENT.md`
