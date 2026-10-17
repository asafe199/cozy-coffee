# Assets

3D props (coffee machine, toaster, cup, bread) come from Kenney's Food Kit and
Furniture Kit, licensed CC0 (https://kenney.nl). They are baked to plain TS
geometry in `src/scenes/shared/props/models.generated.ts` by
`scripts/convert-glb.cjs` (texture colors become vertex colors, so no glTF
loader is needed in React Native). Regenerate with:

    NODE_PATH=<dir with pngjs> node scripts/convert-glb.cjs <out.ts> NAME=path.glb ...
