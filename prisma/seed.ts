import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('1234', salt);
  await prisma.user.create({
    data: {
      username: 'John',
      hashedPassword,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
