import sharp from 'sharp';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const src = path.join(root, 'vibe_images');
const out = path.join(root, 'public', 'assets');
await mkdir(path.join(out, 'backgrounds'), { recursive: true });
await mkdir(path.join(out, 'characters'), { recursive: true });
await mkdir(path.join(out, 'evidence'), { recursive: true });
await mkdir(path.join(out, 'endings'), { recursive: true });
await mkdir(path.join(out, 'cg'), { recursive: true });
await mkdir(path.join(out, 'personality'), { recursive: true });

const files = await readdir(src);
const find = (prefix) => {
  const match = files.find((name) => name.startsWith(prefix) && name.endsWith('.png'));
  if (!match) throw new Error(`missing source for ${prefix}`);
  return path.join(src, match);
};

async function keyOutSprite(prefix, target) {
  const { data, info } = await sharp(find(prefix)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  const { width, height, channels } = info;
  for (let i = 0; i < buf.length; i += channels) {
    const r = buf[i];
    const g = buf[i + 1];
    const b = buf[i + 2];
    const max = Math.max(r, b);
    const excess = g - max;
    if (excess > 0 && g > 60) {
      if (excess > 45) {
        buf[i + 3] = 0;
      } else {
        buf[i + 1] = max;
        if (excess > 16) {
          buf[i + 3] = Math.max(0, buf[i + 3] - (excess - 16) * 6);
        }
      }
    }
  }
  const keyed = sharp(buf, { raw: { width, height, channels } })
    .trim({ threshold: 12 })
    .resize({ height: 1280, fit: 'inside' })
    .png({ compressionLevel: 9 });
  await keyed.toFile(path.join(out, 'characters', target));
  const meta = await sharp(path.join(out, 'characters', target)).metadata();
  console.log('sprite', target, `${meta.width}x${meta.height}`, meta.hasAlpha);
}

async function toWebp(prefix, folder, target, width) {
  await sharp(find(prefix))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86 })
    .toFile(path.join(out, folder, target));
  console.log('image', folder + '/' + target);
}

await keyOutSprite('linxia-neutral', 'linxia-neutral.png');
await keyOutSprite('linxia-happy', 'linxia-happy.png');
await keyOutSprite('linxia-confused', 'linxia-confused.png');
await keyOutSprite('linxia-nervous', 'linxia-nervous.png');

for (const npc of ['zhouning', 'chen', 'xuyan', 'gu']) {
  for (const emotion of ['neutral', 'happy', 'confused', 'nervous']) {
    await keyOutSprite(`${npc}-${emotion}`, `${npc}-${emotion}.png`);
  }
}

await toWebp('cover-keyvisual', 'backgrounds', 'cover-campus-dusk.webp', 1800);
await toWebp('bg-activity', 'backgrounds', 'activity-room.webp', 1800);
await toWebp('bg-dorm-night', 'backgrounds', 'dorm-night.webp', 1800);
await toWebp('bg-service-hall', 'backgrounds', 'service-hall.webp', 1800);
await toWebp('evidence-e2', 'evidence', 'e2-forwarded-notice.webp', 1200);
await toWebp('evidence-e4-chat-v2', 'evidence', 'e4-fake-chat.webp', 1200);
await toWebp('evidence-e7', 'evidence', 'e7-approval-notice.webp', 1200);
await toWebp('evidence-e1-official-notice', 'evidence', 'e1-official-notice.webp', 1200);
await toWebp('evidence-e3-service-log', 'evidence', 'e3-service-log.webp', 1200);
await toWebp('evidence-e5-privacy-popup', 'evidence', 'e5-privacy-popup.webp', 1200);
await toWebp('evidence-e6-old-form', 'evidence', 'e6-old-form.webp', 1200);
await toWebp('evidence-e8-classmate-chat', 'evidence', 'e8-classmate-chat.webp', 1200);

await toWebp('ending-01-dawn', 'endings', '01-dawn.webp', 1800);
await toWebp('ending-02-consensus', 'endings', '02-consensus.webp', 1800);
await toWebp('ending-03-rebuild', 'endings', '03-rebuild.webp', 1800);
await toWebp('ending-04-isolation', 'endings', '04-isolation.webp', 1800);
await toWebp('ending-05-domino', 'endings', '05-domino.webp', 1800);
await toWebp('ending-06-unresolved', 'endings', '06-unresolved.webp', 1800);

await toWebp('reversal-atrium', 'cg', 'reversal-atrium.webp', 1800);
await toWebp('reversal-corridor', 'cg', 'reversal-corridor.webp', 1800);

for (const code of [
  'ecps',
  'ecpr',
  'ecfs',
  'ecfr',
  'eaps',
  'eapr',
  'eafs',
  'eafr',
  'icps',
  'icpr',
  'icfs',
  'icfr',
  'iaps',
  'iapr',
  'iafs',
  'iafr',
]) {
  await toWebp(`personality-${code}`, 'personality', `${code}.webp`, 1024);
}
