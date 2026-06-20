import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const prisma = new PrismaClient();

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CONTENT_ROOT = join(REPO_ROOT, "content/tracks");

interface TrackConfig {
  slug: string;
  title: string;
  description: string;
  language: string;
  status: string;
}

interface ConceptConfig {
  slug: string;
  title: string;
  position: number;
  has_testout: boolean;
  status: string;
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

async function seedTrack(trackDir: string) {
  const trackConfigPath = join(trackDir, "config.json");
  if (!existsSync(trackConfigPath)) return;

  const trackConfig = readJson<TrackConfig>(trackConfigPath);
  const track = await prisma.track.upsert({
    where: { slug: trackConfig.slug },
    update: {
      title: trackConfig.title,
      description: trackConfig.description,
      status: trackConfig.status === "published" ? "published" : "coming_soon",
    },
    create: {
      slug: trackConfig.slug,
      title: trackConfig.title,
      description: trackConfig.description,
      language: trackConfig.language,
      status: trackConfig.status === "published" ? "published" : "coming_soon",
    },
  });

  const conceptsDir = join(trackDir, "concepts");
  if (!existsSync(conceptsDir)) {
    console.log(`  No concepts dir for ${trackConfig.slug}`);
    return;
  }

  const conceptDirs = readdirSync(conceptsDir)
    .filter((d) => /^\d+-.+/.test(d))
    .sort()
    .map((d) => join(conceptsDir, d));

  let seededCount = 0;
  for (const conceptDir of conceptDirs) {
    const configPath = join(conceptDir, "config.json");
    if (!existsSync(configPath)) continue;

    const cfg = readJson<ConceptConfig>(configPath);
    const relPath = conceptDir.replace(REPO_ROOT + "/", "");

    const concept = await prisma.concept.upsert({
      where: { trackId_slug: { trackId: track.id, slug: cfg.slug } },
      update: {
        title: cfg.title,
        position: cfg.position,
        hasTestout: cfg.has_testout,
        status: "published",
      },
      create: {
        trackId: track.id,
        slug: cfg.slug,
        title: cfg.title,
        position: cfg.position,
        hasTestout: cfg.has_testout,
        status: "published",
      },
    });

    const existing = await prisma.exercise.findFirst({
      where: { conceptId: concept.id, type: "lesson" },
    });
    if (!existing) {
      await prisma.exercise.create({
        data: { conceptId: concept.id, type: "lesson", contentPath: relPath },
      });
    } else {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: { contentPath: relPath },
      });
    }
    seededCount++;
  }

  console.log(`✓ Track "${track.slug}" — ${seededCount} concepts`);
}

async function main() {
  // Seed dev user
  await prisma.user.upsert({
    where: { email: "dev@fluent.local" },
    update: {},
    create: {
      email: "dev@fluent.local",
      name: "Dev User",
      emailVerified: new Date(),
    },
  });
  console.log("✓ Dev user: dev@fluent.local");

  // Auto-discover all track directories
  const trackDirs = readdirSync(CONTENT_ROOT)
    .map((d) => join(CONTENT_ROOT, d))
    .filter((d) => existsSync(join(d, "config.json")));

  for (const trackDir of trackDirs) {
    await seedTrack(trackDir);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
