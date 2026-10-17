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
