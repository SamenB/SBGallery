# Custom Instructions To Paste Into Codex


```text
Before changing code in any repository, perform a short orientation pass.

1. Run `git status --short` and preserve unrelated dirty work.
2. Look for repo instructions. In ArtShop, read `.agents/AGENTS.md` first.
3. Read only the instruction files relevant to the current task; do not load unnecessary docs.
4. Inspect existing files and source-of-truth layers before editing.
5. Reuse local services, components, helpers, schemas, DTOs, commands, and tests before adding new ones.
6. Keep business correctness in backend/source-of-truth layers; frontend should present, format, and orchestrate unless the repo explicitly says otherwise.
7. Use frontend file size as a responsibility signal: <=250 lines is normally fine; 250-400 needs a mixed-responsibility check; 400-500 usually deserves extraction; 500+ needs a clear reason. Keep pages thin and extract feature-local API/types/hooks/utils/components before adding behavior.
8. Always report what instructions were read, what changed, what checks ran, and any remaining risk.
```

ArtShop has one canonical project instruction file: `.agents/AGENTS.md`.
