# Schema Change Checklist — UGZIO

## Before you start

- [ ] I know exactly which models need to change
- [ ] I understand the downstream impact (services, queries, components)
- [ ] I have a rollback plan (revert migration)

## Implementation

- [ ] Edit `prisma/schema.prisma` only
- [ ] Do NOT run `prisma db push`
- [ ] Run `npx prisma migrate dev --name <feature_name>`
- [ ] Verify the generated SQL in the new migration file
- [ ] Run `npx prisma generate`
- [ ] Run `npx tsc --noEmit` (or `npm run db:check`)

## Validation

- [ ] New model has `organizationId` if tenant-scoped
- [ ] New model has proper unique constraints
- [ ] New model has proper indexes for query patterns
- [ ] Foreign keys reference correct tables with correct delete behavior
- [ ] Default values are correct
- [ ] Optional fields are properly nullable `?`
- [ ] Enum-like fields use `String` (not native PG enums — easier to evolve)

## Post-migration

- [ ] Migration file is committed to git
- [ ] Schema change is reversible (write down rollback SQL)
- [ ] Affected API routes / services are updated
- [ ] Tests pass
- [ ] If breaking change: notify team

## Zero-downtime rules

- Never remove a column in the same PR that removes code referencing it
- Always deploy: (1) migration only → (2) code using new column → (3) cleanup old column
- Adding nullable columns is safe. Adding required columns needs a default.
