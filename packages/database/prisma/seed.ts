import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DEV_EMAIL = 'dev@neurolife.local';
const DEV_PASSWORD = 'dev-neurolife';

async function main() {
  const password = await bcrypt.hash(DEV_PASSWORD, 12);
  const existing = await prisma.user.findUnique({
    where: { email: DEV_EMAIL },
    include: { profile: true },
  });

  if (existing) {
    await prisma.user.update({
      where: { email: DEV_EMAIL },
      data: { password },
    });
    console.log(`Reset dev password for ${DEV_EMAIL} (password: ${DEV_PASSWORD})`);
    return;
  }

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
