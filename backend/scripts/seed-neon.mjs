import { PrismaClient } from '@prisma/client';
import { initialUsers, initialVendors } from '../src/config/seedData.js';

const prisma = new PrismaClient();

async function seed() {
  console.log('Connecting to Neon PostgreSQL...');

  // Seed Users
  for (const u of initialUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash: u.passwordHash,
        role: u.role,
        department: u.department
      },
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        department: u.department
      }
    });
    console.log(`✓ Seeded user: ${u.email} (${u.role})`);
  }

  // Seed Vendors
  for (const v of initialVendors) {
    await prisma.vendor.upsert({
      where: { code: v.code },
      update: {
        name: v.name,
        apiConfig: v.apiConfig,
        isActive: v.isActive,
        supportedCategories: v.supportedCategories
      },
      create: {
        id: v.id,
        name: v.name,
        code: v.code,
        apiConfig: v.apiConfig,
        isActive: v.isActive,
        supportedCategories: v.supportedCategories
      }
    });
    console.log(`✓ Seeded vendor: ${v.name} (${v.code})`);
  }

  console.log('Seeding completed!');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});
