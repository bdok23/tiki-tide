# Tiki Tide: The Curse of the Soggy Biscuit

A pixel-art comedy adventure about a shipwrecked would-be pirate, a ghost captain who has lost his hat, and an island that is hiding three stones. Plain HTML5 canvas and Web Audio, with no build step and no dependencies.

## Play

Serve the folder and open it in a browser:

```bash
python3 serve.py
```

Then go to http://localhost:8777.

| Key | Action |
|---|---|
| ← → | Walk |
| ↑ | Jump |
| Enter / Space | Do the obvious thing (also skips dialogue) |
| E | Talk to |
| P | Pick up |
| U | Use |
| L | Look at |
| I | Inventory, journal and secrets |
| Esc | Pause: save, load, retry area, controls |
| F5 / F9 | Quicksave / quickload |
| M | Music on/off |

The game autosaves every time you enter an area. There are three manual save slots.

## The island

Tiki Tide has six areas, each with its own music: Castaway Cove, the haunted ship *The Soggy Biscuit*, Mango Jungle, the Rusty Anchor tavern, the Tiki Ruins and a very dark cave.

Once you have met the captain, take the ship's wheel to sail the Wobbly Sea (← → steer, ↑ sails, ↓ slow down, Enter to drop anchor) and visit three more islands: Isla Funkadelica, Brrrmuda and Cheddar Cay. Each has a crew member to recruit.

There are 18 doubloons and 16 secrets to find. The Menu and Bag buttons in the top-right corner, and every menu, also work with the mouse.

## Files

- `index.html`: page shell and pixel font
- `js/core.js`: canvas, input, save/load, particles, item and secret catalogs
- `js/audio.js`: synthesized sound effects and the per-area music sequencer
- `js/art.js`: skies, parallax layers, plants, sprites and icons
- `js/ui.js`: dialogue, choices, menus, inventory and all on-screen text
- `js/areas.js`: the six Tiki Tide areas, their puzzles and their characters
- `js/islands.js`: the sea chart and the three other islands
- `js/main.js`: physics, verbs, area travel and the main loop
