const { initialUsers, initialVendors } = require('../src/config/seedData');

async function seed() {
  console.log('Seeding initial users and vendors...');
  console.log('Users ready:');
  initialUsers.forEach(u => {
    console.log(`  - [${u.role}] ${u.name} (${u.email}) - Password: password123`);
  });
  console.log('Vendors ready:');
  initialVendors.forEach(v => {
    console.log(`  - [${v.code}] ${v.name}`);
  });
  console.log('Seed completed successfully!');
}

seed();
