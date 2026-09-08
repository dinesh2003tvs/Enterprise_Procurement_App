const assert = require('assert');
const http = require('http');
const app = require('../src/server');
const { dbStore } = require('../src/config/db');

/**
 * COMPREHENSIVE AUTOMATED TEST SUITE:
 * Validating all Approval Scenarios (Standard, High-Value, Emergency, Rejections, RBAC)
 */
async function runApprovalScenariosTestSuite() {
  console.log('================================================================');
  console.log('🧪 RUNNING COMPREHENSIVE APPROVAL WORKFLOW SCENARIOS TEST SUITE');
  console.log('================================================================\n');

  dbStore.reset();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  try {
    // Helper: Login
    async function login(email, password = 'password123') {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200, `Login failed for ${email}`);
      return data.data.token;
    }

    const employeeToken = await login('employee@company.com');
    const managerToken = await login('manager@company.com');
    const financeToken = await login('finance@company.com');
    const procurementToken = await login('procurement@company.com');

    // Helper: Create & Submit
    async function createAndSubmit(item, category, qty, price, priority, justification) {
      const createRes = await fetch(`${baseUrl}/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${employeeToken}`
        },
        body: JSON.stringify({
          itemName: item,
          category,
          quantity: qty,
          unitPrice: price,
          priority,
          businessJustification: justification
        })
      });
      const createData = await createRes.json();
      assert.strictEqual(createRes.status, 201);
      const id = createData.data.id;

      const submitRes = await fetch(`${baseUrl}/requests/${id}/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      const submitData = await submitRes.json();
      assert.strictEqual(submitRes.status, 200);
      assert.strictEqual(submitData.data.status, 'SUBMITTED');
      return id;
    }

    // ----------------------------------------------------------------
    // SCENARIO 1: Standard Value Request (₹35,000)
    // ----------------------------------------------------------------
    console.log('[Scenario 1] Standard Value Request (₹35,000)');
    const req1 = await createAndSubmit('Dell UltraSharp Monitor', 'IT_EQUIPMENT', 1, 35000, 'MEDIUM', 'Standard monitor setup');
    
    // Manager Approves
    const mgrRes1 = await fetch(`${baseUrl}/requests/${req1}/manager-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ comment: 'Approved by Engineering Manager' })
    });
    const mgrData1 = await mgrRes1.json();
    assert.strictEqual(mgrRes1.status, 200);
    assert.strictEqual(mgrData1.data.status, 'MANAGER_APPROVED', 'Standard request should transition to MANAGER_APPROVED');
    console.log('  ✓ Manager approved: status transitioned to MANAGER_APPROVED');

    // Verify it is visible in Finance Queue
    const finQueue1 = await fetch(`${baseUrl}/requests/pending-finance`, {
      headers: { Authorization: `Bearer ${financeToken}` }
    });
    const finData1 = await finQueue1.json();
    assert.ok(finData1.data.some(r => r.id === req1), 'Request must appear in Finance Queue');
    console.log('  ✓ Verified request is present in Finance Queue');

    // Finance Approves
    const finApprove1 = await fetch(`${baseUrl}/requests/${req1}/finance-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${financeToken}` },
      body: JSON.stringify({ comment: 'Budget reserved and approved' })
    });
    const finApproveData1 = await finApprove1.json();
    assert.strictEqual(finApprove1.status, 200);
    assert.strictEqual(finApproveData1.data.status, 'FINANCE_APPROVED');
    console.log('  ✓ Finance approved: status transitioned to FINANCE_APPROVED\n');

    // ----------------------------------------------------------------
    // SCENARIO 2: High Value Request (> ₹100,000, e.g. ₹180,000)
    // (Verifying Fix: Moves directly to Finance team without Senior Manager blockage)
    // ----------------------------------------------------------------
    console.log('[Scenario 2] High-Value Request (₹180,000 > ₹100,000 threshold)');
    const req2 = await createAndSubmit('MacBook Pro M3 Max Workstation', 'IT_EQUIPMENT', 1, 180000, 'HIGH', 'Heavy compute workstation');

    // Manager Approves High-Value Request
    const mgrRes2 = await fetch(`${baseUrl}/requests/${req2}/manager-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ comment: 'Approved high value purchase for Lead Engineer' })
    });
    const mgrData2 = await mgrRes2.json();
    assert.strictEqual(mgrRes2.status, 200);
    assert.strictEqual(mgrData2.data.status, 'MANAGER_APPROVED', 'High value request MUST transition to MANAGER_APPROVED');
    console.log('  ✓ Fix Verified: High value request transitioned to MANAGER_APPROVED (No Senior Manager blockage)');

    // Verify it is immediately available in Finance Queue
    const finQueue2 = await fetch(`${baseUrl}/requests/pending-finance`, {
      headers: { Authorization: `Bearer ${financeToken}` }
    });
    const finData2 = await finQueue2.json();
    assert.ok(finData2.data.some(r => r.id === req2), 'High-value request MUST appear in Finance Queue');
    console.log('  ✓ Verified high-value request is present in Finance Queue');

    // Finance Approves High-Value Request
    const finApprove2 = await fetch(`${baseUrl}/requests/${req2}/finance-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${financeToken}` },
      body: JSON.stringify({ comment: 'Capital budget verified and approved' })
    });
    const finApproveData2 = await finApprove2.json();
    assert.strictEqual(finApprove2.status, 200);
    assert.strictEqual(finApproveData2.data.status, 'FINANCE_APPROVED');
    console.log('  ✓ Finance approved high-value request: status is FINANCE_APPROVED\n');

    // ----------------------------------------------------------------
    // SCENARIO 3: Very High Value Enterprise Request (₹500,000)
    // ----------------------------------------------------------------
    console.log('[Scenario 3] Very High Value Enterprise Request (₹500,000)');
    const req3 = await createAndSubmit('Database Server Rack', 'IT_EQUIPMENT', 2, 250000, 'HIGH', 'Data center expansion');
    
    // Manager Approves
    const mgrRes3 = await fetch(`${baseUrl}/requests/${req3}/manager-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ comment: 'Approved data center servers' })
    });
    assert.strictEqual(mgrRes3.status, 200);

    // Finance Approves
    const finApprove3 = await fetch(`${baseUrl}/requests/${req3}/finance-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${financeToken}` },
      body: JSON.stringify({ comment: 'Executive budget allocated' })
    });
    assert.strictEqual(finApprove3.status, 200);
    console.log('  ✓ Very high value request seamlessly routed to and approved by Finance\n');

    // ----------------------------------------------------------------
    // SCENARIO 4: Emergency Fast-Track Flow (CRITICAL priority, <= ₹50,000)
    // ----------------------------------------------------------------
    console.log('[Scenario 4] Emergency Fast-Track (Priority: CRITICAL, Total: ₹25,000)');
    const req4 = await createAndSubmit('Emergency Replacement Power Supply', 'IT_EQUIPMENT', 1, 25000, 'CRITICAL', 'Server room power outage');
    
    // Manager Approves -> Should fast-track directly to PROCUREMENT_STARTED
    const mgrRes4 = await fetch(`${baseUrl}/requests/${req4}/manager-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ comment: 'Urgent emergency sign-off' })
    });
    const mgrData4 = await mgrRes4.json();
    assert.strictEqual(mgrRes4.status, 200);
    assert.strictEqual(mgrData4.data.status, 'PROCUREMENT_STARTED', 'Emergency request should bypass directly to PROCUREMENT_STARTED');
    console.log('  ✓ Fast-track verified: Critical emergency skipped directly to PROCUREMENT_STARTED\n');

    // ----------------------------------------------------------------
    // SCENARIO 5: Manager Rejection Flow
    // ----------------------------------------------------------------
    console.log('[Scenario 5] Manager Rejection Flow');
    const req5 = await createAndSubmit('Noise Cancelling Headphones', 'OTHER', 5, 15000, 'LOW', 'Personal accessories');

    // Manager Rejects
    const mgrRej5 = await fetch(`${baseUrl}/requests/${req5}/manager-reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ comment: 'Not covered under standard department equipment policy' })
    });
    const mgrRejData5 = await mgrRej5.json();
    assert.strictEqual(mgrRej5.status, 200);
    assert.strictEqual(mgrRejData5.data.status, 'REJECTED');
    console.log('  ✓ Manager rejected request: status is REJECTED');

    // Verify NOT in Finance Queue
    const finQueue5 = await fetch(`${baseUrl}/requests/pending-finance`, {
      headers: { Authorization: `Bearer ${financeToken}` }
    });
    const finData5 = await finQueue5.json();
    assert.ok(!finData5.data.some(r => r.id === req5), 'Rejected request must NOT appear in Finance Queue');
    console.log('  ✓ Confirmed rejected request is excluded from Finance Queue\n');

    // ----------------------------------------------------------------
    // SCENARIO 6: Finance Rejection Flow
    // ----------------------------------------------------------------
    console.log('[Scenario 6] Finance Rejection Flow');
    const req6 = await createAndSubmit('Executive Travel Booking', 'TRAVEL', 1, 95000, 'MEDIUM', 'Offsite conference');
    
    // Manager Approves
    await fetch(`${baseUrl}/requests/${req6}/manager-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ comment: 'Manager endorses trip' })
    });

    // Finance Rejects
    const finRej6 = await fetch(`${baseUrl}/requests/${req6}/finance-reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${financeToken}` },
      body: JSON.stringify({ comment: 'Travel budget for Q3 is exhausted' })
    });
    const finRejData6 = await finRej6.json();
    assert.strictEqual(finRej6.status, 200);
    assert.strictEqual(finRejData6.data.status, 'REJECTED');
    console.log('  ✓ Finance rejected request: status is REJECTED');

    // Verify NOT in Procurement Queue
    const procQueue6 = await fetch(`${baseUrl}/requests/pending-procurement`, {
      headers: { Authorization: `Bearer ${procurementToken}` }
    });
    const procData6 = await procQueue6.json();
    assert.ok(!procData6.data.some(r => r.id === req6), 'Finance-rejected request must NOT appear in Procurement Queue');
    console.log('  ✓ Confirmed Finance-rejected request is excluded from Procurement Queue\n');

    // ----------------------------------------------------------------
    // SCENARIO 7: Role-Based Authorization Security Checks
    // ----------------------------------------------------------------
    console.log('[Scenario 7] RBAC Security Guardrails');
    const req7 = await createAndSubmit('Office Furniture', 'OFFICE_SUPPLIES', 2, 8000, 'LOW', 'Ergonomic chairs');

    // Employee cannot approve
    const illegalApprove = await fetch(`${baseUrl}/requests/${req7}/manager-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${employeeToken}` },
      body: JSON.stringify({ comment: 'Self approval' })
    });
    assert.strictEqual(illegalApprove.status, 403, 'Employee should be blocked from manager approval with 403');
    console.log('  ✓ Security check: Employee blocked from approving requests (HTTP 403 Forbidden)');

    // Finance cannot approve before Manager
    const earlyFinanceApprove = await fetch(`${baseUrl}/requests/${req7}/finance-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${financeToken}` },
      body: JSON.stringify({ comment: 'Jumping the queue' })
    });
    assert.strictEqual(earlyFinanceApprove.status, 400, 'Finance cannot approve before manager');
    console.log('  ✓ Workflow check: Finance cannot approve request before manager (HTTP 400)\n');

    // ----------------------------------------------------------------
    // SCENARIO 8: Full End-to-End High-Value Procurement Completion
    // ----------------------------------------------------------------
    console.log('[Scenario 8] Full End-to-End High-Value Order Completion');
    const req8 = await createAndSubmit('Cloud Server Fleet', 'IT_EQUIPMENT', 1, 120000, 'HIGH', 'Production cluster');
    
    // 1. Manager Approve
    await fetch(`${baseUrl}/requests/${req8}/manager-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ comment: 'Approved production servers' })
    });

    // 2. Finance Approve
    await fetch(`${baseUrl}/requests/${req8}/finance-approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${financeToken}` },
      body: JSON.stringify({ comment: 'Infrastructure budget validated' })
    });

    // 3. Procurement Selects Vendor
    const vendorRes8 = await fetch(`${baseUrl}/requests/${req8}/vendor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procurementToken}` },
      body: JSON.stringify({ vendor: 'TECHSOURCE' })
    });
    assert.strictEqual(vendorRes8.status, 200);

    // 4. Procurement Executes Payment
    const payRes8 = await fetch(`${baseUrl}/requests/${req8}/payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${procurementToken}` },
      body: JSON.stringify({ paymentMethod: 'BANK_TRANSFER', idempotencyKey: `PAY-${req8}` })
    });
    const payData8 = await payRes8.json();
    assert.strictEqual(payRes8.status, 200);
    assert.strictEqual(payData8.data.request.status, 'COMPLETED');
    console.log(`  ✓ High-value request ${req8} completed payment: Txn ${payData8.data.transaction.transactionId}`);
    console.log('  ✓ Complete lifecycle: DRAFT ➔ SUBMITTED ➔ MANAGER_APPROVED ➔ FINANCE_APPROVED ➔ PROCUREMENT_STARTED ➔ COMPLETED\n');

    console.log('================================================================');
    console.log('🎉 ALL 8 APPROVAL SCENARIOS VALIDATED & PASSED SUCCESSFULLY!');
    console.log('================================================================\n');

  } finally {
    server.close();
  }
}

runApprovalScenariosTestSuite().catch(err => {
  console.error('❌ Scenarios test failed:', err);
  process.exit(1);
});
