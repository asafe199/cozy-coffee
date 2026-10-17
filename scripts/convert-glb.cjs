// Converts Kenney CC0 .glb models into plain TS geometry (positions, normals,
// per-vertex linear colors, indices) so no glTF/texture loader is needed in
// React Native. Texture colors are baked into vertex colors.
// Usage: NODE_PATH=<dir with pngjs> node scripts/convert-glb.cjs <out.ts> name=path.glb ...
const fs = require('fs');
const { PNG } = require('pngjs');

const COMPONENT = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
const SIZE = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function parseGlb(file) {
  const buf = fs.readFileSync(file);
  const jsonLen = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jsonLen).toString('utf8'));
  const binStart = 20 + jsonLen + 8;
  const bin = buf.slice(binStart);
  return { json, bin, dir: require('path').dirname(file) };
}

function readAccessor({ json, bin }, index) {
  const acc = json.accessors[index];
  const view = json.bufferViews[acc.bufferView];
  const Type = COMPONENT[acc.componentType];
  const n = SIZE[acc.type];
  const offset = (view.byteOffset || 0) + (acc.byteOffset || 0);
  const stride = view.byteStride || n * Type.BYTES_PER_ELEMENT;
  const out = [];
  const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  for (let i = 0; i < acc.count; i++) {
    const row = [];
    for (let k = 0; k < n; k++) {
      const pos = offset + i * stride + k * Type.BYTES_PER_ELEMENT;
      let v;
      switch (acc.componentType) {
        case 5126: v = dv.getFloat32(pos, true); break;
        case 5123: v = dv.getUint16(pos, true); break;
        case 5125: v = dv.getUint32(pos, true); break;
        case 5121: v = dv.getUint8(pos); break;
        default: throw new Error('unsupported component ' + acc.componentType);
      }
      row.push(v);
    }
    out.push(row);
  }
  return out;
}

const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
}
function nodeMatrix(node) {
  if (node.matrix) return node.matrix.slice();
  const [qx, qy, qz, qw] = node.rotation || [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale || [1, 1, 1];
  const [tx, ty, tz] = node.translation || [0, 0, 0];
  return [
    (1 - 2 * (qy * qy + qz * qz)) * sx, 2 * (qx * qy + qz * qw) * sx, 2 * (qx * qz - qy * qw) * sx, 0,
    2 * (qx * qy - qz * qw) * sy, (1 - 2 * (qx * qx + qz * qz)) * sy, 2 * (qy * qz + qx * qw) * sy, 0,
    2 * (qx * qz + qy * qw) * sz, 2 * (qy * qz - qx * qw) * sz, (1 - 2 * (qx * qx + qy * qy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}
const xform = (m, [x, y, z]) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
const xdir = (m, [x, y, z]) => {
  const v = [m[0] * x + m[4] * y + m[8] * z, m[1] * x + m[5] * y + m[9] * z, m[2] * x + m[6] * y + m[10] * z];
  const l = Math.hypot(...v) || 1;
  return v.map((c) => c / l);
};
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

function loadImage(glb, matIndex) {
  const mat = glb.json.materials[matIndex];
  const tex = mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorTexture;
  if (!tex) return null;
  const image = glb.json.images[glb.json.textures[tex.index].source];
  if (image.uri) {
    if (image.uri.startsWith('data:')) {
      return PNG.sync.read(Buffer.from(image.uri.split(',')[1], 'base64'));
    }
    return PNG.sync.read(fs.readFileSync(require('path').join(glb.dir, decodeURIComponent(image.uri))));
  }
  const view = glb.json.bufferViews[image.bufferView];
  const data = glb.bin.slice(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
  return PNG.sync.read(data);
}

function convert(file) {
  const glb = parseGlb(file);
  const images = {};
  const positions = [];
  const normals = [];
  const colors = [];
  const indices = [];

  const visit = (nodeIndex, parent) => {
    const node = glb.json.nodes[nodeIndex];
    const m = mul(parent, nodeMatrix(node));
    if (node.mesh !== undefined) {
      for (const prim of glb.json.meshes[node.mesh].primitives) {
        const base = positions.length / 3;
        const pos = readAccessor(glb, prim.attributes.POSITION);
        const nor = prim.attributes.NORMAL !== undefined ? readAccessor(glb, prim.attributes.NORMAL) : pos.map(() => [0, 1, 0]);
        const uv = prim.attributes.TEXCOORD_0 !== undefined ? readAccessor(glb, prim.attributes.TEXCOORD_0) : null;
        const matIndex = prim.material;
        const mat = glb.json.materials[matIndex] || {};
        const factor = (mat.pbrMetallicRoughness && mat.pbrMetallicRoughness.baseColorFactor) || [1, 1, 1, 1];
        if (!(matIndex in images)) images[matIndex] = loadImage(glb, matIndex);
        const img = images[matIndex];
        pos.forEach((p, i) => {
          positions.push(...xform(m, p));
          normals.push(...xdir(m, nor[i]));
          let rgb = [1, 1, 1];
          if (img && uv) {
            const u = ((uv[i][0] % 1) + 1) % 1;
            const v = ((uv[i][1] % 1) + 1) % 1;
            const x = Math.min(img.width - 1, Math.floor(u * img.width));
            const y = Math.min(img.height - 1, Math.floor(v * img.height));
            const o = (y * img.width + x) * 4;
            rgb = [img.data[o], img.data[o + 1], img.data[o + 2]].map((c) => toLinear(c / 255));
          }
          colors.push(rgb[0] * factor[0], rgb[1] * factor[1], rgb[2] * factor[2]);
        });
        const idx = prim.indices !== undefined ? readAccessor(glb, prim.indices).map((r) => r[0]) : pos.map((_, i) => i);
        idx.forEach((i) => indices.push(base + i));
      }
    }
    (node.children || []).forEach((c) => visit(c, m));
  };
  const scene = glb.json.scenes[glb.json.scene || 0];
  scene.nodes.forEach((n) => visit(n, I()));

  // Normalize: centered on x/z, resting on y=0, largest dimension = 1.
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], positions[i + k]);
      max[k] = Math.max(max[k], positions[i + k]);
    }
  }
  const h = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (positions[i] - (min[0] + max[0]) / 2) / h;
    positions[i + 1] = (positions[i + 1] - min[1]) / h;
    positions[i + 2] = (positions[i + 2] - (min[2] + max[2]) / 2) / h;
  }
  const r = (n, d) => Number(n.toFixed(d));
  return {
    width: r((max[0] - min[0]) / h, 3),
    height: r((max[1] - min[1]) / h, 3),
    depth: r((max[2] - min[2]) / h, 3),
    positions: positions.map((n) => r(n, 4)),
    normals: normals.map((n) => r(n, 2)),
    colors: colors.map((n) => r(n, 3)),
    indices,
  };
}

const [out, ...specs] = process.argv.slice(2);
let ts = `// GENERATED by scripts/convert-glb.cjs from Kenney CC0 models (Food Kit, Furniture Kit; see docs/ASSETS.md).\n// Each model is normalized: centered on x/z, resting on y=0, largest dimension 1.\nimport type { ModelData } from './modelData';\n\n`;
for (const spec of specs) {
  const [name, file] = spec.split('=');
  const m = convert(file);
  ts += `export const ${name}: ModelData = ${JSON.stringify(m)};\n\n`;
  console.error(name, 'verts', m.positions.length / 3, 'tris', m.indices.length / 3, 'w/h', m.width, 'd/h', m.depth);
}
fs.writeFileSync(out, ts);
