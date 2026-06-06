import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEV_EMAIL = 'dev@neurolife.local';
const DEV_PASSWORD = 'dev-neurolife';

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });
  if (existing) {
    console.log(`Dev user already exists: ${DEV_EMAIL}`);
    return;
  }

  const password = await bcrypt.hash(DEV_PASSWORD, 12);
  await prisma.user.create({
    data: {
      email: DEV_EMAIL,
      password,
      profile: {
        create: {
          displayName: 'Dev User',
          currentBalance: 1200,
          privacyMode: 'HYBRID',
        },
      },
    },
  });

  console.log(`Created dev user ${DEV_EMAIL} (password: ${DEV_PASSWORD})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
