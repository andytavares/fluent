import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const contentPaths: Record<string, string> = {
  "variables-and-types": "content/tracks/go/concepts/01-variables-and-types",
  "functions": "content/tracks/go/concepts/02-functions",
  "control-flow": "content/tracks/go/concepts/03-control-flow",
  "arrays-and-slices": "content/tracks/go/concepts/04-arrays-and-slices",
  "maps": "content/tracks/go/concepts/05-maps",
  "structs": "content/tracks/go/concepts/06-structs",
  "interfaces": "content/tracks/go/concepts/07-interfaces",
  "error-handling": "content/tracks/go/concepts/08-error-handling",
  "goroutines": "content/tracks/go/concepts/09-goroutines",
  "channels": "content/tracks/go/concepts/10-channels",
};

async function main() {
  await prisma.user.upsert({
    where: { email: "dev@fluent.local" },
    update: {},
    create: {
      email: "dev@fluent.local",
      name: "Dev User",
      emailVerified: new Date(),
    },
  });
  console.log("Seeded test user: dev@fluent.local");

  const track = await prisma.track.upsert({
    where: { slug: "go" },
    update: {},
    create: {
      slug: "go",
      title: "Go Fundamentals",
      description:
        "Learn Go from first principles — syntax, types, concurrency, and the standard library — culminating in a real CRUD API capstone project.",
      language: "go",
      status: "published",
    },
  });

  const concepts = [
    { slug: "variables-and-types", title: "Variables and Types", position: 1, hasTestout: false },
    { slug: "functions", title: "Functions", position: 2, hasTestout: false },
    { slug: "control-flow", title: "Control Flow", position: 3, hasTestout: false },
    { slug: "arrays-and-slices", title: "Arrays and Slices", position: 4, hasTestout: false },
    { slug: "maps", title: "Maps", position: 5, hasTestout: false },
    { slug: "structs", title: "Structs", position: 6, hasTestout: false },
    { slug: "interfaces", title: "Interfaces", position: 7, hasTestout: true },
    { slug: "error-handling", title: "Error Handling", position: 8, hasTestout: false },
    { slug: "goroutines", title: "Goroutines", position: 9, hasTestout: true },
    { slug: "channels", title: "Channels", position: 10, hasTestout: false },
  ];

  for (const c of concepts) {
    const concept = await prisma.concept.upsert({
      where: { trackId_slug: { trackId: track.id, slug: c.slug } },
      update: {},
      create: {
        trackId: track.id,
        slug: c.slug,
        title: c.title,
        position: c.position,
        hasTestout: c.hasTestout,
        status: "published",
      },
    });

    const contentPath = contentPaths[c.slug];
    if (contentPath) {
      const existing = await prisma.exercise.findFirst({
        where: { conceptId: concept.id, type: "lesson" },
      });
      if (!existing) {
        await prisma.exercise.create({
          data: {
            conceptId: concept.id,
            type: "lesson",
            contentPath,
          },
        });
        console.log(`  Created exercise for ${c.slug}`);
      }
    }
  }

  console.log(`Seeded track "${track.slug}" with ${concepts.length} concepts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
