TINY ARCADE v1 - LIVE SECOND LIFE SHARED SCREEN

FILES
- server.js (Node.js server, built-in modules only)
- index.html (game displayed on prim)
- ARCADE_SEAT.lsl (copy/paste this script in Second Life)

LOCAL TEST (before hosting):
1. Install Node.js 18+.
2. In this folder run: node server.js
3. Open http://localhost:3000 in one browser window.
4. Open http://localhost:3000/?play=1&key=CHANGE-ME-123 in another browser window.
5. Focus the second window and use WASD/arrow keys. Both show the same game.

SECOND LIFE DEPLOYMENT:
1. Put server.js and index.html on a Node.js hosting service with public HTTPS and a persistent server process (start command: node server.js).
2. Set environment variable ARCADE_SECRET to a long random token. The server uses PORT provided by the host.
3. Edit ARCADE_SEAT.lsl's SERVER to your https://hostname and SECRET to the same token.
4. Make a screen prim. In build/Edit > Texture > Media, set one face's media URL to https://hostname/ ; choose autoplay if available and appropriate.
5. Add a separate sit prim named ARCADE_SEAT, insert the LSL script. Ensure the script is in the seat prim itself, and set that prim to sit on left click.
6. Sit, allow controls if asked, and move with WASD or arrows. Nearby viewers with media enabled can watch the same game.

NOTES
- Every client renders the same coordinates and score from one shared server. Viewers can see slightly different animation timing/pulse and have small network delays.
- Only one seat should control this prototype. If you add multiple seats using this same script, their inputs will conflict.
- The game starts automatically server-side; no browser click is required, but a viewer can refuse/disable media autoplay.
- The browser-play URL containing ?play=1&key=... is a development test URL, never put it on the public screen.
- No external packages, database, animations or textures are required.
- Public deployment requires HTTPS hosting; localhost alone is not reachable by Second Life.
- LSL direction controls depend on the viewer's movement settings. Sitting should allow standard WASD / arrows after controls permission.
