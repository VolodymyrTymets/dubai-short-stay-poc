---
name: api-conventions
description: GraphQL API design conventions
---

# API Conventions
- All Queries and Mutations are defined in 'src/<Module>/<Module>.resolver.ts>'
- We use Entity for Queries and Input for Mutations
- Entity represents Model from 'prisma/models/****.prisma'
- Input represents Input for Mutations
- All Entities are defined in 'src/<Module>/entities/<Entity>.entity.ts>/'
- All Inputs are defined in 'src/<Module>/dto/<Input>.input.ts>'
- Always include pagination, sorting, filtering for list endpoints