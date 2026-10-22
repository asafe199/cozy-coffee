# Assets

3D props (coffee machine, toaster, cup, bread) come from Kenney's Food Kit and
Furniture Kit, licensed CC0 (https://kenney.nl). They are baked to plain TS
geometry in `src/scenes/shared/props/models.generated.ts` by
`scripts/convert-glb.cjs` (texture colors become vertex colors, so no glTF
loader is needed in React Native). Regenerate with:

    NODE_PATH=<dir with pngjs> node scripts/convert-glb.cjs <out.ts> NAME=path.glb ...

## Models currently baked

COFFEE_MACHINE (mug node skipped), TOASTER, CUP_EMPTY, BREAD, GLASS, ORANGE,
BLENDER, FRYING_PAN, PANCAKES, PLATE, HONEY, BOWL, SALAD, OIL, CUTTING_BOARD.
Sources: Kenney Food Kit (`GLB format`) and Furniture Kit (`GLTF format`,
coffee machine, toaster, blender). The converter rewrites the whole output file,
so always pass every model name in one run:

    U="<furniture>/Models/GLTF format"; F="<food>/Models/GLB format"
    NODE_PATH=/tmp/cv/node_modules node scripts/convert-glb.cjs src/scenes/shared/props/models.generated.ts \
      COFFEE_MACHINE="$U/kitchenCoffeeMachine.glb#mug" TOASTER="$U/toaster.glb" CUP_EMPTY="$F/cup.glb" BREAD="$F/bread.glb" \
      GLASS="$F/glass.glb" ORANGE="$F/orange.glb" BLENDER="$U/kitchenBlender.glb" FRYING_PAN="$F/frying-pan.glb" \
      PANCAKES="$F/pancakes.glb" PLATE="$F/plate.glb" HONEY="$F/honey.glb" BOWL="$F/bowl.glb" SALAD="$F/salad.glb" \
      OIL="$F/bottle-oil.glb" CUTTING_BOARD="$F/cutting-board.glb"

(`/tmp/cv` = a folder with `pngjs` installed; download the kits from kenney.nl.)

## Coffee machine tiers (per-level appliance progression)

Pilot for the "appliance gets fancier each level" idea (`CLAUDE.md` "Not yet
done" list). Level 1 keeps the Kenney `COFFEE_MACHINE` above, unchanged.
Levels 2-5 are baked into `src/scenes/shared/props/coffeeMachineTiers.generated.ts`
from models found on [Poly Pizza](https://poly.pizza) via the Blender MCP's
`search_assets`/`import_asset`, exported from Blender as individual `.glb`
files (forcing any JPEG textures to PNG first — `scripts/convert-glb.cjs` only
decodes PNG), then run through the same converter:

    NODE_PATH=/tmp/cv/node_modules node scripts/convert-glb.cjs src/scenes/shared/props/coffeeMachineTiers.generated.ts \
      COFFEE_MACHINE_L2=coffee_l2_espresso_pot.glb COFFEE_MACHINE_L3=coffee_l3_jtoastie.glb \
      COFFEE_MACHINE_L4=coffee_l4_daqian.glb COFFEE_MACHINE_L5=coffee_l5_gold.glb

Per-level model + scale lookup lives in `src/scenes/CoffeeStation/applianceTiers.ts`.

**CC-BY 3.0 attribution (required — also surfaced in-app under Options →
Créditos/Credits, `OptionsScreen.tsx`):**
- Level 2 — "Espresso Pot" by Poly by Google, https://poly.pizza/m/fsqUynYjKyA
- Level 3 — "Coffee Machine" by J-Toastie, https://poly.pizza/m/7kKSsnCcNC
- Level 4 — "Coffee Maker" by Daqian Dong, https://poly.pizza/m/f9PvGRKy5NJ
- Level 5 — same mesh as level 4 (Daqian Dong), recolored gold/brass in
  Blender (texture swapped for a flat metallic material) — same attribution
  applies since the geometry is unchanged.

Toaster and blender tiers are a planned follow-up (same process, one
appliance at a time), not done yet.

## Juice/milkshake ingredient baskets

Baked into `src/scenes/shared/props/juiceIngredients.generated.ts` — one
"basket" per ingredient (a bowl with 1-3 of that ingredient resting in it),
for the upcoming multi-fruit juice station (see
`docs/superpowers/specs/2026-10-20-juice-milkshake-and-review-history-design.md`,
Part A). All CC0 — no attribution legally required, listed here anyway for
traceability:

- Bowl — "Bowl Small" by Kay Lousberg, https://poly.pizza/m/IRGuF4UebO
- Orange — "Orange" by Kenney, https://poly.pizza/m/UnygaDfm1J
- Lemon — "Lemon" by Kenney, https://poly.pizza/m/MSMJRlLpuL
- Watermelon — "Watermelon" by Kenney, https://poly.pizza/m/lJIfjMl47l
- Pineapple — "Pineapple" by Kenney, https://poly.pizza/m/VFFBOLXqB2
- Strawberry — "Strawberry" by Kenney, https://poly.pizza/m/xT1XIhtdju
- Banana — "Banana" by Kenney, https://poly.pizza/m/5Z07I9KMob
- Chocolate — "Chocolate Bar" by Quaternius, https://poly.pizza/m/vJsJ1EIiOO
- Mango, Vanilla — no ready-made CC0 model found; hand-modeled from
  primitives directly in Blender (simple flat-colored shapes, same low-poly
  style as the rest).

These are baked geometry only — the actual `JuiceStation` scene, the
flavor/ingredient data model, and the drag-into-blender mechanic described in
the design doc are not built yet.

## Delivery counter decor tiers (pilot: table shape + decor per level)

Baked into `src/scenes/shared/props/counterDecor.generated.ts`, wired per
level via `src/scenes/DeliveryCounter/counterTiers.ts`. All CC0:

- `DECOR_PLANT_SMALL` — "Plant" by Quaternius, https://poly.pizza/m/NrJN7UcglF
- `DECOR_PLANT_MED` — "Houseplant" by Quaternius, https://poly.pizza/m/bfLOqIV5uP
- `DECOR_PLANT_POTTED` — "Potted Plant" by CreativeTrio, https://poly.pizza/m/GJ3Bm5FDE4
- `DECOR_PLANT_BIG` — "Plant Big" by Quaternius, https://poly.pizza/m/MbhbP7JrTI
- `DECOR_LIGHT_CEILING` — "Light Ceiling" by Quaternius, https://poly.pizza/m/S3HkX8iTl2
- `DECOR_CHANDELIER` — "Light Chandelier" by Quaternius, https://poly.pizza/m/q3k8I8YYX9
- `DECOR_SHELF_SMALL` — "Shelf Small" by Quaternius, https://poly.pizza/m/TfdgUV2RYe
- `DECOR_SHELF_LARGE` — "Shelf Large" by Quaternius, https://poly.pizza/m/3FmjkLClVE
- `DECOR_MIRROR` — "Bathroom Mirror" by Kenney, https://poly.pizza/m/REpBXIXfO7 (used as generic wall decor, not literally a mirror — no reflective surface in this baked pipeline)

Pilot station only (delivery counter) — same tier pattern planned for the
other stations next, pending the user's go-ahead on how this one looks.

## Toast station bread variety

Baked into `src/scenes/shared/props/toastVariety.generated.ts` — purely
cosmetic (confirmed with the user: bread choice never affects scoring, same
interaction pattern as the juice ingredients — drag whichever one you want
onto the griddle). All CC0:

- `BREAD_WHEAT` — "Loaf Round" by Kenney, https://poly.pizza/m/4BiXgXnxTY
- `BREAD_SWEET` — "Croissant" by Kenney, https://poly.pizza/m/JDy2TUxcV2
- `WHEAT_DECOR` — "Wheat" by Quaternius, https://poly.pizza/m/lPspzfC8Pu (static decoration behind the toaster, not draggable)
- `BUTTER_PAT` — no ready-made CC0 "stick of butter" model found anywhere searched; hand-modeled in Blender (beveled box, one corner sliced off) to replace the old flat-colored box placeholder.

The original bread slice (`BREAD` in `models.generated.ts`) stays as the
default/first option.
