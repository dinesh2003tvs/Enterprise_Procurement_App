import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  console.log('Testing Prisma Database Flow with Neon...');

  // 1. Check user exists
  const user = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
  console.log('Found Employee User:', user.id, user.email);

  // 2. Create Purchase Request
  const testId = `REQ-TEST-${Date.now().toString().slice(-4)}`;
  const pr = await prisma.purchaseRequest.create({
    data: {
      id: testId,
      employeeId: user.id,
      department: user.department,
      itemName: 'Dell UltraSharp 32 4K Monitor',
      category: 'IT_EQUIPMENT',
      quantity: 2,
      unitPrice: 45000,
      totalAmount: 90000,
      businessJustification: 'Hardware upgrade for dual screen engineering setup',
      priority: 'HIGH',
      status: 'DRAFT'
    }
  });
  console.log('✓ Created Purchase Request in Neon:', pr.id, pr.status);

  // 3. Add Audit Log
  const log = await prisma.auditLog.create({
    data: {
      requestId: pr.id,
      action: 'REQUEST_CREATED',
      performedBy: user.email,
      comment: 'Initial draft requisition'
    }
  });
  console.log('✓ Added Audit Log in Neon:', log.id);

  // 4. Query back with relations
  const fetched = await prisma.purchaseRequest.findUnique({
    where: { id: testId },
    include: {
      employee: true,
      auditLogs: true,
      approvals: true
    }
  });
  console.log('✓ Fetched Purchase Request with relations:');
  console.log('  ID:', fetched.id);
  console.log('  Employee:', fetched.employee.name);
  console.log('  AuditLogs count:', fetched.auditLogs.length);

  // Clean up test request
  await prisma.auditLog.deleteMany({ where: { requestId: testId } });
  await prisma.purchaseRequest.delete({ where: { id: testId } });
  console.log('✓ Cleaned up test record');

  await prisma.$disconnect();
  console.log('🎉 Neon PostgreSQL is 100% READY and working with Prisma!');
}

test().catch(err => {
  console.error('Test Error:', err);
  process.exit(1);
});
