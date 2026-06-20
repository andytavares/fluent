import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// contentPaths maps track-slug → concept-slug → content directory (relative to repo root)
const contentPaths: Record<string, Record<string, string>> = {
  go: {
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
  },
  javascript: {
    "variables-and-types": "content/tracks/javascript/concepts/01-variables-and-types",
    "functions": "content/tracks/javascript/concepts/02-functions",
    "arrays-and-objects": "content/tracks/javascript/concepts/03-arrays-and-objects",
    "closures": "content/tracks/javascript/concepts/04-closures",
    "error-handling": "content/tracks/javascript/concepts/05-error-handling",
  },
  typescript: {
    "types-and-interfaces": "content/tracks/typescript/concepts/01-types-and-interfaces",
    "functions-and-generics": "content/tracks/typescript/concepts/02-functions-and-generics",
    "union-types": "content/tracks/typescript/concepts/03-union-types",
    "utility-types": "content/tracks/typescript/concepts/04-utility-types",
    "type-guards": "content/tracks/typescript/concepts/05-type-guards",
  },
  c: {
    "variables-and-types": "content/tracks/c/concepts/01-variables-and-types",
    "functions": "content/tracks/c/concepts/02-functions",
    "pointers": "content/tracks/c/concepts/03-pointers",
    "arrays-and-strings": "content/tracks/c/concepts/04-arrays-and-strings",
    "structs": "content/tracks/c/concepts/05-structs",
  },
  cpp: {
    "classes-and-objects": "content/tracks/cpp/concepts/01-classes-and-objects",
    "templates": "content/tracks/cpp/concepts/02-templates",
    "stl-containers": "content/tracks/cpp/concepts/03-stl-containers",
    "smart-pointers": "content/tracks/cpp/concepts/04-smart-pointers",
    "lambda-expressions": "content/tracks/cpp/concepts/05-lambda-expressions",
  },
  java: {
    "classes-and-objects": "content/tracks/java/concepts/01-classes-and-objects",
    "interfaces": "content/tracks/java/concepts/02-interfaces",
    "generics": "content/tracks/java/concepts/03-generics",
    "streams-api": "content/tracks/java/concepts/04-streams-api",
    "optional": "content/tracks/java/concepts/05-optional",
  },
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

    const contentPath = contentPaths["go"]?.[c.slug];
    if (contentPath) {
      const existing = await prisma.exercise.findFirst({
        where: { conceptId: concept.id, type: "lesson" },
      });
      if (!existing) {
        await prisma.exercise.create({
          data: { conceptId: concept.id, type: "lesson", contentPath },
        });
        console.log(`  Created exercise for go/${c.slug}`);
      }
    }
  }

  console.log(`Seeded track "${track.slug}" with ${concepts.length} concepts`);

  // ── JavaScript track ────────────────────────────────────────────────────────
  const jsTrack = await prisma.track.upsert({
    where: { slug: "javascript" },
    update: {},
    create: {
      slug: "javascript",
      title: "JavaScript Fundamentals",
      description:
        "Master modern JavaScript — the language of the web. Learn the syntax, idioms, and async patterns every JS engineer uses daily.",
      language: "javascript",
      status: "published",
    },
  });
  const jsConcepts = [
    { slug: "variables-and-types", title: "Variables & Types",  position: 1 },
    { slug: "functions",           title: "Functions",           position: 2 },
    { slug: "arrays-and-objects",  title: "Arrays & Objects",    position: 3 },
    { slug: "closures",            title: "Closures",            position: 4 },
    { slug: "error-handling",      title: "Error Handling",      position: 5 },
  ];
  for (const c of jsConcepts) {
    const concept = await prisma.concept.upsert({
      where: { trackId_slug: { trackId: jsTrack.id, slug: c.slug } },
      update: { status: "published" },
      create: { trackId: jsTrack.id, slug: c.slug, title: c.title, position: c.position, hasTestout: false, status: "published" },
    });
    const contentPath = contentPaths["javascript"]?.[c.slug];
    if (contentPath) {
      const existing = await prisma.exercise.findFirst({ where: { conceptId: concept.id, type: "lesson" } });
      if (!existing) {
        await prisma.exercise.create({ data: { conceptId: concept.id, type: "lesson", contentPath } });
        console.log(`  Created exercise for javascript/${c.slug}`);
      }
    }
  }
  console.log(`Seeded track "${jsTrack.slug}" with ${jsConcepts.length} concepts`);

  // ── TypeScript track ────────────────────────────────────────────────────────
  const tsTrack = await prisma.track.upsert({
    where: { slug: "typescript" },
    update: {},
    create: {
      slug: "typescript",
      title: "TypeScript Essentials",
      description:
        "Add static types to JavaScript. Learn TypeScript's type system, generics, and tooling to write safer, more maintainable code.",
      language: "typescript",
      status: "published",
    },
  });
  const tsConcepts = [
    { slug: "types-and-interfaces",    title: "Types & Interfaces",    position: 1 },
    { slug: "functions-and-generics",  title: "Functions & Generics",  position: 2 },
    { slug: "union-types",             title: "Union Types & Narrowing", position: 3 },
    { slug: "utility-types",           title: "Utility Types",          position: 4 },
    { slug: "type-guards",             title: "Type Guards",            position: 5 },
  ];
  for (const c of tsConcepts) {
    const concept = await prisma.concept.upsert({
      where: { trackId_slug: { trackId: tsTrack.id, slug: c.slug } },
      update: { status: "published" },
      create: { trackId: tsTrack.id, slug: c.slug, title: c.title, position: c.position, hasTestout: false, status: "published" },
    });
    const contentPath = contentPaths["typescript"]?.[c.slug];
    if (contentPath) {
      const existing = await prisma.exercise.findFirst({ where: { conceptId: concept.id, type: "lesson" } });
      if (!existing) {
        await prisma.exercise.create({ data: { conceptId: concept.id, type: "lesson", contentPath } });
        console.log(`  Created exercise for typescript/${c.slug}`);
      }
    }
  }
  console.log(`Seeded track "${tsTrack.slug}" with ${tsConcepts.length} concepts`);

  // ── C track ─────────────────────────────────────────────────────────────────
  const cTrack = await prisma.track.upsert({
    where: { slug: "c" },
    update: {},
    create: {
      slug: "c",
      title: "C Foundations",
      description:
        "Learn C — the language closest to the machine. Understand memory, pointers, and systems programming from first principles.",
      language: "c",
      status: "published",
    },
  });
  const cConcepts = [
    { slug: "variables-and-types",   title: "Variables & Types",   position: 1 },
    { slug: "functions",             title: "Functions",             position: 2 },
    { slug: "pointers",              title: "Pointers",              position: 3 },
    { slug: "arrays-and-strings",    title: "Arrays & Strings",      position: 4 },
    { slug: "structs",               title: "Structs",               position: 5 },
  ];
  for (const c of cConcepts) {
    const concept = await prisma.concept.upsert({
      where: { trackId_slug: { trackId: cTrack.id, slug: c.slug } },
      update: { status: "published" },
      create: { trackId: cTrack.id, slug: c.slug, title: c.title, position: c.position, hasTestout: false, status: "published" },
    });
    const contentPath = contentPaths["c"]?.[c.slug];
    if (contentPath) {
      const existing = await prisma.exercise.findFirst({ where: { conceptId: concept.id, type: "lesson" } });
      if (!existing) {
        await prisma.exercise.create({ data: { conceptId: concept.id, type: "lesson", contentPath } });
        console.log(`  Created exercise for c/${c.slug}`);
      }
    }
  }
  console.log(`Seeded track "${cTrack.slug}" with ${cConcepts.length} concepts`);

  // ── C++ track ───────────────────────────────────────────────────────────────
  const cppTrack = await prisma.track.upsert({
    where: { slug: "cpp" },
    update: {},
    create: {
      slug: "cpp",
      title: "Modern C++",
      description:
        "Learn C++ with a modern mindset — RAII, smart pointers, templates, and the STL. Write expressive, efficient, safe C++.",
      language: "cpp",
      status: "published",
    },
  });
  const cppConcepts = [
    { slug: "classes-and-objects",  title: "Classes & Objects",  position: 1 },
    { slug: "templates",            title: "Templates",            position: 2 },
    { slug: "stl-containers",       title: "STL Containers",       position: 3 },
    { slug: "smart-pointers",       title: "Smart Pointers",       position: 4 },
    { slug: "lambda-expressions",   title: "Lambda Expressions",   position: 5 },
  ];
  for (const c of cppConcepts) {
    const concept = await prisma.concept.upsert({
      where: { trackId_slug: { trackId: cppTrack.id, slug: c.slug } },
      update: { status: "published" },
      create: { trackId: cppTrack.id, slug: c.slug, title: c.title, position: c.position, hasTestout: false, status: "published" },
    });
    const contentPath = contentPaths["cpp"]?.[c.slug];
    if (contentPath) {
      const existing = await prisma.exercise.findFirst({ where: { conceptId: concept.id, type: "lesson" } });
      if (!existing) {
        await prisma.exercise.create({ data: { conceptId: concept.id, type: "lesson", contentPath } });
        console.log(`  Created exercise for cpp/${c.slug}`);
      }
    }
  }
  console.log(`Seeded track "${cppTrack.slug}" with ${cppConcepts.length} concepts`);

  // ── Java track ──────────────────────────────────────────────────────────────
  const javaTrack = await prisma.track.upsert({
    where: { slug: "java" },
    update: {},
    create: {
      slug: "java",
      title: "Java Essentials",
      description:
        "Learn Java — a statically typed, object-oriented language built for large-scale systems. Master classes, interfaces, generics, and the streams API.",
      language: "java",
      status: "published",
    },
  });
  const javaConcepts = [
    { slug: "classes-and-objects", title: "Classes & Objects", position: 1 },
    { slug: "interfaces",          title: "Interfaces",          position: 2 },
    { slug: "generics",            title: "Generics",            position: 3 },
    { slug: "streams-api",         title: "Streams API",         position: 4 },
    { slug: "optional",            title: "Optional",            position: 5 },
  ];
  for (const c of javaConcepts) {
    const concept = await prisma.concept.upsert({
      where: { trackId_slug: { trackId: javaTrack.id, slug: c.slug } },
      update: { status: "published" },
      create: { trackId: javaTrack.id, slug: c.slug, title: c.title, position: c.position, hasTestout: false, status: "published" },
    });
    const contentPath = contentPaths["java"]?.[c.slug];
    if (contentPath) {
      const existing = await prisma.exercise.findFirst({ where: { conceptId: concept.id, type: "lesson" } });
      if (!existing) {
        await prisma.exercise.create({ data: { conceptId: concept.id, type: "lesson", contentPath } });
        console.log(`  Created exercise for java/${c.slug}`);
      }
    }
  }
  console.log(`Seeded track "${javaTrack.slug}" with ${javaConcepts.length} concepts`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
