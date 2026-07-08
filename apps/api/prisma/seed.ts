import { PrismaClient } from "@prisma/client";
import { createContentStore } from "@fluent/content-config";
import type { TrackEntry } from "@fluent/content-config";

const prisma = new PrismaClient();
const content = createContentStore();

async function seedTrack({ dir, config: trackConfig }: TrackEntry) {
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

  const concepts = content.listConcepts(dir);
  if (concepts.length === 0) {
    console.log(`  No concepts for ${trackConfig.slug}`);
    return;
  }

  for (const { contentPath, config: cfg } of concepts) {
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
        data: { conceptId: concept.id, type: "lesson", contentPath },
      });
    } else {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: { contentPath },
      });
    }

    // Warn loudly if the concept is missing a test file — submissions will silently pass without one
    if (content.getLessonTestFiles(contentPath, trackConfig.language).length === 0) {
      console.warn(`  ⚠ MISSING TEST FILE: ${trackConfig.slug}/${cfg.slug} (language: ${trackConfig.language})`);
    }
  }

  console.log(`✓ Track "${track.slug}" — ${concepts.length} concepts`);
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

  for (const track of content.listTracks()) {
    await seedTrack(track);
  }

  console.log("\nSeed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
