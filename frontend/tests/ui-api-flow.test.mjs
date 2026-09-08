import assert from 'assert';

/**
 * End-to-End Procurement Lifecycle Automated Test Suite
 * Can be run against Localhost OR any Deployed Vercel/Render URL!
 */

const TARGET_API_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

console.log('====================================================');
console.log('🧪 RUNNING AUTOMATION TEST SUITE FOR PROCUREMENT APP');
console.log(`🎯 Target API URL: ${TARGET_API_URL}`);
console.log('====================================================\n');

async function apiRequest(endpoint, options = {}, token = null) {
  const url = `${TARGET_API_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runAutomationTests() {
  try {
    // ----------------------------------------------------
    // TEST 1: Health Check
    // ----------------------------------------------------
    console.log('[Test 1] Health Check Verification');
    const health = await apiRequest('/health');
    assert.strictEqual(health.status, 200, 'Health endpoint should return 200');
    assert.strictEqual(health.data.status, 'UP', 'Status must be UP');
    console.log('  ✅ Backend Health check: UP and responsive\n');

    // ----------------------------------------------------
    // TEST 2: Demo Role Logins (Authentication)
    // ----------------------------------------------------
    console.log('[Test 2] Authentication for Demo Roles');

    // Employee
    const empLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'employee@company.com', password: 'password123' })
    });
    assert.strictEqual(empLogin.status, 200, 'Employee login failed');
    assert.strictEqual(empLogin.data.data.user.role, 'EMPLOYEE');
    const employeeToken = empLogin.data.data.token;
    console.log('  ✅ Employee Login: SUCCESS (Token received)');

    // Manager
    const mgrLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'manager@company.com', password: 'password123' })
    });
    assert.strictEqual(mgrLogin.status, 200, 'Manager login failed');
    assert.strictEqual(mgrLogin.data.data.user.role, 'MANAGER');
    const managerToken = mgrLogin.data.data.token;
    console.log('  ✅ Manager Login: SUCCESS (Token received)');

    // Finance
    const finLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'finance@company.com', password: 'password123' })
    });
    assert.strictEqual(finLogin.status, 200, 'Finance login failed');
    assert.strictEqual(finLogin.data.data.user.role, 'FINANCE');
    const financeToken = finLogin.data.data.token;
    console.log('  ✅ Finance Login: SUCCESS (Token received)');

    // Procurement Admin
    const procLogin = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'procurement@company.com', password: 'password123' })
    });
    assert.strictEqual(procLogin.status, 200, 'Procurement Admin login failed');
    assert.strictEqual(procLogin.data.data.user.role, 'PROCUREMENT_ADMIN');
    const procurementToken = procLogin.data.data.token;
    console.log('  ✅ Procurement Admin Login: SUCCESS (Token received)\n');

    // ----------------------------------------------------
    // TEST 3: Employee Creates a Purchase Request
    // ----------------------------------------------------
    console.log('[Test 3] Employee Create Purchase Request (Draft)');
    const draftPayload = {
      itemName: 'Dell UltraSharp 27 Monitor',
      category: 'IT_EQUIPMENT',
      quantity: 1,
      unitPrice: 35000,
      priority: 'HIGH',
      businessJustification: 'Display monitor for engineering workstation'
    };
    const createRes = await apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(draftPayload)
    }, employeeToken);

    assert.strictEqual(createRes.status, 201, 'Request creation failed');
    assert.strictEqual(createRes.data.data.status, 'DRAFT');
    assert.strictEqual(createRes.data.data.totalAmount, 35000);
    const requestId = createRes.data.data.id;
    console.log(`  ✅ Draft created: ID=${requestId}, Status=DRAFT, Total=₹${createRes.data.data.totalAmount}\n`);

    // ----------------------------------------------------
    // TEST 4: Employee Submits Request for Approval
    // ----------------------------------------------------
    console.log('[Test 4] Employee Submits Request');
    const submitRes = await apiRequest(`/requests/${requestId}/submit`, {
      method: 'POST'
    }, employeeToken);
    assert.strictEqual(submitRes.status, 200);
    assert.strictEqual(submitRes.data.data.status, 'SUBMITTED');
    console.log(`  ✅ Request ${requestId} moved to status: SUBMITTED\n`);

    // ----------------------------------------------------
    // TEST 5: Security Boundary Check (RBAC)
    // ----------------------------------------------------
    console.log('[Test 5] Security Check: RBAC Forbidden Access');
    const forbiddenRes = await apiRequest(`/requests/${requestId}/manager-approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Illegal approval' })
    }, employeeToken); // Employee trying to approve!
    assert.strictEqual(forbiddenRes.status, 403, 'Should forbid employee from manager actions');
    console.log('  ✅ Employee blocked from Manager actions (HTTP 403 Forbidden)\n');

    // ----------------------------------------------------
    // TEST 6: Manager Approval
    // ----------------------------------------------------
    console.log('[Test 6] Manager Approval Flow');
    const mgrApproveRes = await apiRequest(`/requests/${requestId}/manager-approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Approved for Engineering team' })
    }, managerToken);
    assert.strictEqual(mgrApproveRes.status, 200);
    assert.strictEqual(mgrApproveRes.data.data.status, 'MANAGER_APPROVED');
    console.log(`  ✅ Manager Approved: Status is now MANAGER_APPROVED\n`);

    // ----------------------------------------------------
    // TEST 7: Finance Approval
    // ----------------------------------------------------
    console.log('[Test 7] Finance Budget Approval Flow');
    const finApproveRes = await apiRequest(`/requests/${requestId}/finance-approve`, {
      method: 'POST',
      body: JSON.stringify({ comment: 'Approved by Finance department' })
    }, financeToken);
    assert.strictEqual(finApproveRes.status, 200);
    assert.strictEqual(finApproveRes.data.data.status, 'FINANCE_APPROVED');
    console.log(`  ✅ Finance Approved: Status is now FINANCE_APPROVED\n`);

    // ----------------------------------------------------
    // TEST 8: Vendor Selection via Adapter Pattern
    // ----------------------------------------------------
    console.log('[Test 8] Procurement Admin Selects Vendor (Adapter Pattern)');
    const vendorRes = await apiRequest(`/requests/${requestId}/vendor`, {
      method: 'POST',
      body: JSON.stringify({ vendor: 'TECHSOURCE' })
    }, procurementToken);
    assert.strictEqual(vendorRes.status, 200);
    assert.strictEqual(vendorRes.data.data.request.status, 'PROCUREMENT_STARTED');
    console.log(`  ✅ Vendor Selected: ${vendorRes.data.data.quote.vendor} (Quote: ${vendorRes.data.quote?.quoteId || 'TS-OK'})`);
    console.log(`  ✅ Status moved to: PROCUREMENT_STARTED\n`);

    // ----------------------------------------------------
    // TEST 9: Payment Execution & Idempotency Guarantee
    // ----------------------------------------------------
    console.log('[Test 9] Payment Execution & Idempotency Check');
    const idempotencyKey = `AUTO-TEST-${requestId}-${Date.now()}`;
    const payRes1 = await apiRequest(`/requests/${requestId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'BANK_TRANSFER', idempotencyKey })
    }, procurementToken);
    assert.strictEqual(payRes1.status, 200);
    assert.strictEqual(payRes1.data.data.request.status, 'COMPLETED');
    assert.strictEqual(payRes1.data.data.idempotentReplay, false);
    console.log(`  ✅ Payment processed: Transaction ID = ${payRes1.data.data.transaction.transactionId}`);
    console.log(`  ✅ Final Request Status = COMPLETED`);

    // Replay check
    const payRes2 = await apiRequest(`/requests/${requestId}/payment`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod: 'BANK_TRANSFER', idempotencyKey })
    }, procurementToken);
    assert.strictEqual(payRes2.status, 200);
    assert.strictEqual(payRes2.data.data.idempotentReplay, true);
    console.log('  ✅ Idempotent Replay Verified: Duplicate request returned original transaction without double charging!\n');

    // ----------------------------------------------------
    // TEST 10: Complete Audit History Trail
    // ----------------------------------------------------
    console.log('[Test 10] Complete Audit History Trail');
    const detailsRes = await apiRequest(`/requests/${requestId}`, {}, employeeToken);
    assert.strictEqual(detailsRes.status, 200);
    const actions = detailsRes.data.data.auditLogs.map(l => l.action);
    console.log('  Audit trail:', actions.join(' ➔ '));
    assert.ok(actions.includes('REQUEST_CREATED'));
    assert.ok(actions.includes('REQUEST_SUBMITTED'));
    assert.ok(actions.includes('MANAGER_APPROVED'));
    assert.ok(actions.includes('FINANCE_APPROVED'));
    assert.ok(actions.includes('PAYMENT_COMPLETED'));
    console.log('  ✅ Audit Trail Verification: PASSED\n');

    console.log('====================================================');
    console.log('🎉 ALL 10 AUTOMATION TEST CASES PASSED SUCCESSFULLY!');
    console.log('====================================================\n');
  } catch (err) {
    console.error('❌ Automation Test Failed:', err);
    process.exit(1);
  }
}

runAutomationTests();
