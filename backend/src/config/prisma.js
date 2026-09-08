const { PrismaClient } = require('@prisma/client');
const { DATABASE_URL } = require('./env');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || DATABASE_URL || "postgresql://neondb_owner:npg_4MDzu0iQmegq@ep-little-dew-ae953rdn-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

async function ensureSeedData() {
  try {
    const { initialUsers, initialVendors } = require('./seedData');
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding initial users into Neon PostgreSQL...');
      for (const u of initialUsers) {
        await prisma.user.upsert({
          where: { email: u.email },
          update: { name: u.name, role: u.role, department: u.department, passwordHash: u.passwordHash },
          create: { id: u.id, name: u.name, email: u.email, passwordHash: u.passwordHash, role: u.role, department: u.department }
        });
      }
      console.log('✓ Initial users seeded successfully in Neon.');
    }

    const vendorCount = await prisma.vendor.count();
    if (vendorCount === 0) {
      console.log('🌱 Seeding initial vendors into Neon PostgreSQL...');
      for (const v of initialVendors) {
        await prisma.vendor.upsert({
          where: { code: v.code },
          update: { name: v.name, apiConfig: v.apiConfig, isActive: v.isActive, supportedCategories: v.supportedCategories },
          create: { id: v.id, name: v.name, code: v.code, apiConfig: v.apiConfig, isActive: v.isActive, supportedCategories: v.supportedCategories }
        });
      }
      console.log('✓ Initial vendors seeded successfully in Neon.');
    }
  } catch (err) {
    console.error('⚠️ Could not run automatic seed check on Neon:', err.message);
  }
}

module.exports = {
  prisma,
  ensureSeedData
};
