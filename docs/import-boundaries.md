# Import boundaries

## Backend

Allowed direction:

features/* -> shared/*
features/* -> integrations/*
features/* -> core/*
integrations/* -> core/*
app.ts/server.ts -> features/*

Disallowed:
- core/* importing features/*
- integrations/* importing features/*
- one feature importing another feature's private files

Allowed cross-feature access:
- through explicit exported service functions
- through shared types placed in shared/
- through route registration only from app/routes index

## Mobile

Allowed direction:

screens -> feature components/hooks/api
components -> hooks/types/utils
hooks -> api/types
api -> types/config

Disallowed:
- API layer importing React components
- generic UI importing planning-specific state
- fixtures imported by production runtime code
