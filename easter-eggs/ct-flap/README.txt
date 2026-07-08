CT Flap easter egg

This folder is intentionally self-contained.

Files:
  ct-flap.css - game overlay styling
  ct-flap.js  - game markup, event hooks, and canvas loop

Main-site hooks:
  index.html loads this CSS file.
  index.html loads this JS file.
  The "o" in "Report" has data-game-open.

To remove the game:
  1. Delete the stylesheet link for easter-eggs/ct-flap/ct-flap.css in index.html.
  2. Delete the script tag for easter-eggs/ct-flap/ct-flap.js in index.html.
  3. Optionally remove data-game-open from the "o" in "Report".
  4. Delete this folder.
