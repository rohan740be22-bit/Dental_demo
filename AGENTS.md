<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- All booking reads/writes go through `src/lib/booking.server.ts` (service-role, server-only); the AI assistant tools and the web form both call it, so availability and double-booking checks live in one place.
- Double booking is prevented in the database by an exclusion constraint on appointments (dentist + time range, non-cancelled), not only in app code.
- The assistant is a streaming `/api/chat` server route using AI SDK tool calling (not LangGraph) because it runs on the Worker runtime.
- Clinic display content (services, dentists, hours) is configured in `src/lib/clinic.ts`; slugs must match the `services`/`dentists` table rows.
