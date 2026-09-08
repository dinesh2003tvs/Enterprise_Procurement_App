import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  console.log('Total Users in DB:', users.length);
  console.log('Users:', users);

  const reqs = await prisma.purchaseRequest.findMany();
  console.log('Total Purchase Requests in DB:', reqs.length);
  console.log('Requests:', JSON.stringify(reqs, null, 2));

  await prisma.$disconnect();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
