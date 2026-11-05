# jemsmyeyesonly

Movie and TV discovery site (plain HTML) with a small Vercel function that keeps the TMDB key on the server.

- `index.html` is the whole site.
- `api/tmdb.js` forwards allowed TMDB requests and adds the key.
- Set `TMDB_API_KEY` under Vercel > Project Settings > Environment Variables, then redeploy.

Player: a sandboxed iframe blocks ad pop-ups and redirects (toggle under the video), with full screen (button or F), server picker, and previous/next episode controls for series.
