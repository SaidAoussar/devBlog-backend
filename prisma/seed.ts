import { PrismaClient, Prisma } from '@prisma/client';
import { BlogData } from './BlogData';

const prisma = new PrismaClient();

async function main() {
  console.log('start seeding ...');

  let i = 0;
  for (const blog of BlogData) {
    const slug = blog.title.split(' ').join('-').concat(`-${i}.`);
    await prisma.post.create({
      data: { ...blog, slug },
    });

    i++;
  }

  console.log(`Created user with id: `);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
