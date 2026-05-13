# Prisma Migration Rules — UGZIO

## Golden Rule

**NEVER use `prisma db push` in normal development.** It bypasses versioned migrations and causes schema drift.

## Workflow

### Local development (new schema change)

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name <descriptive_name>
# 3. Regenerate client
npx prisma generate
# 4. Type-check
npx tsc --noEmit
# 5. Commit migration folder + schema
```

### Production deploy

```bash
npx prisma migrate deploy
```

This applies only new, unapplied migrations in order. Never run `prisma db push` in production.

### Reset local DB (destructive)

```bash
npx prisma migrate reset
```

This drops + recreates the DB and re-runs all migrations. Useful in CI or fresh dev environments.

## Do's

- ALWAYS use `prisma migrate dev` for schema changes
- ALWAYS commit the `prisma/migrations/` folder to git
- ALWAYS run `prisma generate` after any migration
- ALWAYS name migrations descriptively (e.g., `add_confirm_status`)
- ALWAYS run `tsc --noEmit` after schema changes
- ALWAYS review the generated SQL before committing

## Don'ts

- NEVER use `prisma db push` after initial setup (unless prototyping completely fresh)
- NEVER manually edit SQL in migration files (let Prisma generate it)
- NEVER delete old migration files (they are the schema's history)
- NEVER modify the database outside Prisma's migration system
- NEVER merge a PR with schema changes but no migration file

## Schema Drift Detection

If you suspect drift:

```bash
npx prisma migrate diff --from-migrations --to-schema-datamodel
npx prisma validate
```

If drift exists, create a new migration:

```bash
npx prisma migrate dev --name fix_drift
```

## Critical UGZIO Models

Every migration must protect:

| Model | Why |
|---|---|
| `Order` | Core system — status, confirmStatus, risk fields |
| `ConfirmationAttempt` | Confirmation workflow |
| `Organization` | Multi-tenant isolation (orgId on every row) |
| `RawOrderFeatures` | ML training pipeline |
| `AIEvaluation` | AI recommendation audit trail |

## Package Scripts

```bash
npm run db:migrate   # prisma migrate dev
npm run db:deploy    # prisma migrate deploy (production)
npm run db:validate  # prisma validate
npm run db:generate  # prisma generate
npm run db:studio    # prisma studio
npm run db:check     # validate + type-check in one step
```

## Checklist Before Merging Schema PR

- [ ] Migration file generated and reviewed
- [ ] `prisma generate` ran
- [ ] `tsc --noEmit` passes
- [ ] No `prisma db push` in branch history
- [ ] Multi-tenant fields (`organizationId`) present on new models
- [ ] Affected services tested
