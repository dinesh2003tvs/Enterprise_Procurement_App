const assert = require('assert');
const http = require('http');
const app = require('../src/server');
const { dbStore } = require('../src/config/db');

async function runMvpLifecycleTests() {
  console.log('====================================================');
  console.log('🚀 RUNNING END-TO-END PROCUREMENT MVP TEST SUITE');
  console.log('====================================================\n');

  // Reset in-memory store for fresh testing
  dbStore.reset();

  // Start test server on ephemeral port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`Test server running at ${baseUrl}`);

  try {
    // ----------------------------------------------------
    // TEST 1: Health Check
    // ----------------------------------------------------
    console.log('\n[Test 1] Health Check Endpoint');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'UP');
    console.log('  ✓ Health check returned 200 OK with status: UP');

    // ----------------------------------------------------
    // TEST 2: Authentication & RBAC Login
    // ----------------------------------------------------
    console.log('\n[Test 2] Authentication (All 4 MVP Roles)');

    // 2a. Failed Login
    const failedLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'employee@company.com', password: 'wrongpassword' })
    });
    const failedLoginData = await failedLoginRes.json();
    assert.strictEqual(failedLoginRes.status, 401);
    assert.strictEqual(failedLoginData.code, 'INVALID_CREDENTIALS');
    console.log('  ✓ Invalid password rejected with HTTP 401');

    // 2b. Successful Logins
    async function login(email, password = 'password123') {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      assert.strictEqual(res.status, 200);
      assert.ok(data.data.token, 'Token should be returned');
      return data.data.token;
    }

    const employeeToken = await login('employee@company.com');
    const managerToken = await login('manager@company.com');
    const financeToken = await login('finance@company.com');
    const procurementToken = await login('procurement@company.com');
    console.log('  ✓ Tokens issued for Employee, Manager, Finance, Procurement');

    // ----------------------------------------------------
    // TEST 3: Employee Creates Draft Purchase Request
    // ----------------------------------------------------
    console.log('\n[Test 3] Employee Creates Purchase Request (DRAFT)');

    // 3a. Validation Failure Check
    const invalidReqRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`
      },
      body: JSON.stringify({
        itemName: '',
        category: 'INVALID_CATEGORY',
        quantity: -5,
        unitPrice: 0,
        priority: 'MEDIUM',
        businessJustification: ''
      })
    });
    assert.strictEqual(invalidReqRes.status, 400);
    console.log('  ✓ Invalid request payload rejected with HTTP 400 VALIDATION_ERROR');

    // 3b. Valid Draft Creation
    const createRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`
      },
      body: JSON.stringify({
        itemName: 'Dell XPS 15 Workstation',
        category: 'IT_EQUIPMENT',
        quantity: 2,
        unitPrice: 35000,
        priority: 'HIGH',
        businessJustification: 'High-performance workstations for software engineering team'
      })
    });
    const createData = await createRes.json();
    assert.strictEqual(createRes.status, 201);
    assert.strictEqual(createData.data.status, 'DRAFT');
    assert.strictEqual(createData.data.totalAmount, 70000);
    const requestId = createData.data.id;
    console.log(`  ✓ Created draft request ${requestId} with status: DRAFT, total: ₹${createData.data.totalAmount}`);

    // ----------------------------------------------------
    // TEST 4: Employee Submits Request
    // ----------------------------------------------------
    console.log('\n[Test 4] Employee Submits Request');
    const submitRes = await fetch(`${baseUrl}/requests/${requestId}/submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    const submitData = await submitRes.json();
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitData.data.status, 'SUBMITTED');
    console.log(`  ✓ Request ${requestId} transitioned to: SUBMITTED`);

    // ----------------------------------------------------
    // TEST 5: RBAC Security Boundary Check
    // ----------------------------------------------------
    console.log('\n[Test 5] Security Check: RBAC Authorization');
    // Employee tries to approve manager queue
    const unauthorizedApproveRes = await fetch(`${baseUrl}/requests/${requestId}/manager-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`
      },
      body: JSON.stringify({ comment: 'Self approving' })
    });
    const unauthorizedData = await unauthorizedApproveRes.json();
    assert.strictEqual(unauthorizedApproveRes.status, 403);
    assert.strictEqual(unauthorizedData.code, 'FORBIDDEN');
    console.log('  ✓ Employee blocked from manager action with HTTP 403 FORBIDDEN');

    // Missing token
    const noTokenRes = await fetch(`${baseUrl}/requests/${requestId}`);
    assert.strictEqual(noTokenRes.status, 401);
    console.log('  ✓ Request without token rejected with HTTP 401 MISSING_TOKEN');

    // ----------------------------------------------------
    // TEST 6: Manager Approves Request
    // ----------------------------------------------------
    console.log('\n[Test 6] Manager Approval Flow');
    const mgrPendingRes = await fetch(`${baseUrl}/requests/pending-manager`, {
      headers: { Authorization: `Bearer ${managerToken}` }
    });
    const mgrPendingData = await mgrPendingRes.json();
    assert.strictEqual(mgrPendingRes.status, 200);
    assert.ok(mgrPendingData.data.some(r => r.id === requestId));
    console.log('  ✓ Request visible in Manager Pending Queue');

    const mgrApproveRes = await fetch(`${baseUrl}/requests/${requestId}/manager-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`
      },
      body: JSON.stringify({ comment: 'Approved for Q3 engineering budget' })
    });
    const mgrApproveData = await mgrApproveRes.json();
    assert.strictEqual(mgrApproveRes.status, 200);
    assert.strictEqual(mgrApproveData.data.status, 'MANAGER_APPROVED');
    console.log(`  ✓ Manager approved. Request transitioned to: MANAGER_APPROVED`);

    // ----------------------------------------------------
    // TEST 7: Finance Budget Check & Approval
    // ----------------------------------------------------
    console.log('\n[Test 7] Finance Budget Validation & Approval');
    const finPendingRes = await fetch(`${baseUrl}/requests/pending-finance`, {
      headers: { Authorization: `Bearer ${financeToken}` }
    });
    const finPendingData = await finPendingRes.json();
    assert.strictEqual(finPendingRes.status, 200);
    assert.ok(finPendingData.data.some(r => r.id === requestId));
    console.log('  ✓ Request visible in Finance Pending Queue');

    const finApproveRes = await fetch(`${baseUrl}/requests/${requestId}/finance-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${financeToken}`
      },
      body: JSON.stringify({ comment: 'Engineering departmental budget validated and reserved' })
    });
    const finApproveData = await finApproveRes.json();
    assert.strictEqual(finApproveRes.status, 200);
    assert.strictEqual(finApproveData.data.status, 'FINANCE_APPROVED');
    console.log(`  ✓ Finance approved. Request transitioned to: FINANCE_APPROVED`);

    // ----------------------------------------------------
    // TEST 8: Procurement Selects Vendor (TechSource Adapter)
    // ----------------------------------------------------
    console.log('\n[Test 8] Procurement Admin Assigns Vendor (Adapter Pattern)');
    const procPendingRes = await fetch(`${baseUrl}/requests/pending-procurement`, {
      headers: { Authorization: `Bearer ${procurementToken}` }
    });
    const procPendingData = await procPendingRes.json();
    assert.ok(procPendingData.data.some(r => r.id === requestId));

    const vendorRes = await fetch(`${baseUrl}/requests/${requestId}/vendor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${procurementToken}`
      },
      body: JSON.stringify({ vendor: 'TECHSOURCE' })
    });
    const vendorData = await vendorRes.json();
    assert.strictEqual(vendorRes.status, 200);
    assert.strictEqual(vendorData.data.request.status, 'PROCUREMENT_STARTED');
    assert.strictEqual(vendorData.data.quote.vendor, 'TechSource Inc.');
    console.log(`  ✓ Vendor selected: ${vendorData.data.quote.vendor} with Quote ${vendorData.data.quote.quoteId}`);
    console.log(`  ✓ Status transitioned to: PROCUREMENT_STARTED`);

    // ----------------------------------------------------
    // TEST 9: Payment Processing & Idempotency Check
    // ----------------------------------------------------
    console.log('\n[Test 9] Payment Execution & Idempotency Guarantee');
    const idempotencyKey = `PROCUREMENT-${requestId}`;

    // 9a. First Payment Execution
    const payRes1 = await fetch(`${baseUrl}/requests/${requestId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${procurementToken}`
      },
      body: JSON.stringify({
        paymentMethod: 'BANK_TRANSFER',
        idempotencyKey
      })
    });
    const payData1 = await payRes1.json();
    assert.strictEqual(payRes1.status, 200);
    assert.strictEqual(payData1.data.request.status, 'COMPLETED');
    assert.strictEqual(payData1.data.idempotentReplay, false);
    const txnId = payData1.data.transaction.transactionId;
    console.log(`  ✓ Payment executed via Bank Transfer. Transaction: ${txnId}`);
    console.log(`  ✓ Request status is now: COMPLETED`);

    // 9b. Re-submitting Identical Payment (Idempotency Replay)
    const payRes2 = await fetch(`${baseUrl}/requests/${requestId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${procurementToken}`
      },
      body: JSON.stringify({
        paymentMethod: 'BANK_TRANSFER',
        idempotencyKey
      })
    });
    const payData2 = await payRes2.json();
    assert.strictEqual(payRes2.status, 200);
    assert.strictEqual(payData2.data.idempotentReplay, true);
    assert.strictEqual(payData2.data.transaction.transactionId, txnId);
    console.log(`  ✓ Idempotent re-submission returned identical transaction without charging twice!`);

    // ----------------------------------------------------
    // TEST 10: Audit Log Verification
    // ----------------------------------------------------
    console.log('\n[Test 10] Audit Trail Verification');
    const detailsRes = await fetch(`${baseUrl}/requests/${requestId}`, {
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    const detailsData = await detailsRes.json();
    const auditActions = detailsData.data.auditLogs.map(a => a.action);
    console.log('  Audit trail entries:', auditActions.join(' -> '));
    assert.ok(auditActions.includes('REQUEST_CREATED'));
    assert.ok(auditActions.includes('REQUEST_SUBMITTED'));
    assert.ok(auditActions.includes('MANAGER_APPROVED'));
    assert.ok(auditActions.includes('FINANCE_APPROVED'));
    assert.ok(auditActions.includes('VENDOR_SELECTED'));
    assert.ok(auditActions.includes('PAYMENT_COMPLETED'));
    assert.ok(auditActions.includes('REQUEST_COMPLETED'));
    console.log('  ✓ Full audit history verified!');

    // ----------------------------------------------------
    // TEST 11: Cancellation Flow Verification
    // ----------------------------------------------------
    console.log('\n[Test 11] Request Cancellation Flow');
    const cancelDraftRes = await fetch(`${baseUrl}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${employeeToken}`
      },
      body: JSON.stringify({
        itemName: 'Office Desk Organizers',
        category: 'OFFICE_SUPPLIES',
        quantity: 5,
        unitPrice: 1200,
        priority: 'LOW',
        businessJustification: 'Team desk accessories'
      })
    });
    const cancelDraftData = await cancelDraftRes.json();
    const cancelReqId = cancelDraftData.data.id;

    const cancelActionRes = await fetch(`${baseUrl}/requests/${cancelReqId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    const cancelActionData = await cancelActionRes.json();
    assert.strictEqual(cancelActionRes.status, 200);
    assert.strictEqual(cancelActionData.data.status, 'CANCELLED');
    console.log(`  ✓ Successfully cancelled request ${cancelReqId} in DRAFT status`);

    // Cannot cancel already completed request
    const illegalCancelRes = await fetch(`${baseUrl}/requests/${requestId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${employeeToken}` }
    });
    assert.strictEqual(illegalCancelRes.status, 400);
    console.log('  ✓ Cancellation of COMPLETED request rejected with HTTP 400 INVALID_STATE_TRANSITION');

    console.log('\n====================================================');
    console.log('🎉 ALL 11 MVP SUITE TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

runMvpLifecycleTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
