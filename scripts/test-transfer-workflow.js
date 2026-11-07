const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'corenix_db',
};
//kk
const JWT_SECRET = process.env.JWT_SECRET || 'corenix_super_secure_jwt_token_key_2026_enterprise';

async function runTransferTestSuite() {
  console.log('====================================================');
  console.log('🧪 CORENIX STOCK TRANSFER AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  const connection = await mysql.createConnection(dbConfig);
  let passedCount = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      throw new Error(`Assertion Failed: ${message}`);
    }
  }

  try {
    // 1. Generate staff token
    const token = jwt.sign(
      { userId: 1, email: 'admin@corenix.com', roleId: 1, roleSlug: 'super_admin', type: 'staff' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const headers = {
      'Content-Type': 'application/json',
      cookie: `corenix_token=${token}`,
    };

    // ----------------------------------------------------
    // TEST 1: Fetch transfer products for Warehouse (Branch 1)
    // ----------------------------------------------------
    console.log('--- Test 1: Fetch Available Products for Branch 1 (Warehouse) ---');
    const prodRes = await fetch('http://localhost:3000/api/admin/transfers/products?branch_id=1', { headers });
    const prodData = await prodRes.json();
    assert(prodRes.status === 200, `Products API responded with 200 OK (Got ${prodRes.status})`);
    assert(prodData.success === true, 'Products API returned success: true');
    assert(Array.isArray(prodData.products) && prodData.products.length > 0, `Found ${prodData.products.length} available products at Branch 1`);

    // Pick a test product
    const targetProduct = prodData.products.find((p) => p.available_stock >= 2) || prodData.products[0];
    console.log(`  ℹ Selected product: "${targetProduct.name}" (ID: ${targetProduct.id}, Stock: ${targetProduct.available_stock})`);

    // ----------------------------------------------------
    // TEST 2: Check Initial Stock at Branch 1 (Origin) & Branch 2 (Destination)
    // ----------------------------------------------------
    console.log('\n--- Test 2: Check Initial Stocks ---');
    const [origStockBefore] = await connection.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND branch_id = 1',
      [targetProduct.id]
    );
    const [destStockBefore] = await connection.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND branch_id = 2',
      [targetProduct.id]
    );

    const b1QtyBefore = origStockBefore[0]?.quantity || 0;
    const b2QtyBefore = destStockBefore[0]?.quantity || 0;
    console.log(`  ℹ Branch 1 Stock before transfer: ${b1QtyBefore}, Branch 2 Stock: ${b2QtyBefore}`);
    assert(b1QtyBefore >= 1, `Branch 1 has sufficient stock (${b1QtyBefore})`);

    // ----------------------------------------------------
    // TEST 3: Execute Direct Instant Transfer (Branch 1 -> Branch 2)
    // ----------------------------------------------------
    console.log('\n--- Test 3: Execute Direct Instant Transfer (Branch 1 -> Branch 2) ---');
    const transferPayload = {
      from_branch_id: 1,
      to_branch_id: 2,
      status: 'received',
      notes: 'Test Automated Stock Movement',
      items: [
        {
          product_id: targetProduct.id,
          quantity: 1,
        },
      ],
    };

    const trfRes = await fetch('http://localhost:3000/api/admin/transfers', {
      method: 'POST',
      headers,
      body: JSON.stringify(transferPayload),
    });
    const trfData = await trfRes.json();
    assert(trfRes.status === 200, `Transfer API created transfer successfully (Got ${trfRes.status})`);
    assert(trfData.success === true, `Response success is true: ${trfData.transferNumber}`);
    assert(Boolean(trfData.transferId), `Generated transfer ID: ${trfData.transferId}`);

    // ----------------------------------------------------
    // TEST 4: Verify Inventory Movement in DB
    // ----------------------------------------------------
    console.log('\n--- Test 4: Verify Inventory Decrement & Increment in DB ---');
    const [origStockAfter] = await connection.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND branch_id = 1',
      [targetProduct.id]
    );
    const [destStockAfter] = await connection.query(
      'SELECT quantity FROM inventory WHERE product_id = ? AND branch_id = 2',
      [targetProduct.id]
    );

    const b1QtyAfter = origStockAfter[0]?.quantity || 0;
    const b2QtyAfter = destStockAfter[0]?.quantity || 0;
    console.log(`  ℹ Branch 1 Stock after: ${b1QtyAfter} (was ${b1QtyBefore}), Branch 2 Stock: ${b2QtyAfter} (was ${b2QtyBefore})`);

    assert(b1QtyAfter === b1QtyBefore - 1, `Branch 1 stock accurately deducted by 1 (${b1QtyBefore} -> ${b1QtyAfter})`);
    assert(b2QtyAfter === b2QtyBefore + 1, `Branch 2 stock accurately incremented by 1 (${b2QtyBefore} -> ${b2QtyAfter})`);

    // ----------------------------------------------------
    // TEST 5: Verify Inventory Audit Transactions
    // ----------------------------------------------------
    console.log('\n--- Test 5: Verify Audit Transactions Recorded ---');
    const [auditRows] = await connection.query(
      'SELECT * FROM inventory_transactions WHERE reference_type = "stock_transfer" AND reference_id = ?',
      [trfData.transferId]
    );
    assert(auditRows.length === 2, `Recorded exactly 2 inventory transactions (transfer_out & transfer_in), found ${auditRows.length}`);
    assert(auditRows.some((r) => r.transaction_type === 'transfer_out' && r.branch_id === 1), 'Found transfer_out for Branch 1');
    assert(auditRows.some((r) => r.transaction_type === 'transfer_in' && r.branch_id === 2), 'Found transfer_in for Branch 2');

    // ----------------------------------------------------
    // TEST 6: Fetch Single Transfer Detail API
    // ----------------------------------------------------
    console.log('\n--- Test 6: Fetch Transfer Detail API & Challan Data ---');
    const detailRes = await fetch(`http://localhost:3000/api/admin/transfers/${trfData.transferId}`, { headers });
    const detailData = await detailRes.json();
    assert(detailRes.status === 200, 'Transfer detail API responded 200 OK');
    assert(detailData.success === true, 'Transfer detail success is true');
    assert(detailData.transfer.transfer_number === trfData.transferNumber, 'Transfer numbers match accurately');
    assert(detailData.transfer.items.length === 1, 'Contains 1 transfer item in manifest');
    assert(detailData.transfer.from_branch_name.includes('Warehouse') || detailData.transfer.from_branch_code === 'WH-MAIN', 'Origin branch name is populated');
    assert(detailData.transfer.to_branch_name.includes('Shop 1') || detailData.transfer.to_branch_code === 'SHOP-1', 'Destination branch name is populated');

    // ----------------------------------------------------
    // TEST 7: In-Transit Dispatch & Receive Flow
    // ----------------------------------------------------
    console.log('\n--- Test 7: In-Transit Dispatch and Receive Flow ---');
    const inTransitPayload = {
      from_branch_id: 1,
      to_branch_id: 3, // Shop 2
      status: 'in_transit',
      notes: 'Courier Dispatch Test to Shop 2',
      items: [
        {
          product_id: targetProduct.id,
          quantity: 1,
        },
      ],
    };

    const itRes = await fetch('http://localhost:3000/api/admin/transfers', {
      method: 'POST',
      headers,
      body: JSON.stringify(inTransitPayload),
    });
    const itData = await itRes.json();
    assert(itRes.status === 200, 'In-transit transfer created successfully');
    assert(itData.status === 'in_transit', 'Transfer status is in_transit');

    // Now test receiving it
    const receiveRes = await fetch(`http://localhost:3000/api/admin/transfers/${itData.transferId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ action: 'receive' }),
    });
    const receiveData = await receiveRes.json();
    assert(receiveRes.status === 200, 'Receive transfer PATCH responded 200 OK');
    assert(receiveData.success === true, 'Transfer received successfully');

    // Verify status in DB is now 'received'
    const [updatedTrf] = await connection.query('SELECT status, received_at FROM stock_transfers WHERE id = ?', [itData.transferId]);
    assert(updatedTrf[0].status === 'received', 'Transfer status in database updated to "received"');
    assert(Boolean(updatedTrf[0].received_at), 'Received_at timestamp is stamped');

    // ----------------------------------------------------
    // TEST 8: Dedicated Serial Number Transfer Test
    // ----------------------------------------------------
    console.log('\n--- Test 8: Transfer Product With Exact Serial Numbers ---');
    const [availableSerials] = await connection.query(
      `SELECT ps.id, ps.product_id, ps.serial_number, ps.branch_id, p.name as product_name,
              (inv.quantity - COALESCE(inv.reserved_qty, 0)) as branch_qty
       FROM product_serials ps
       JOIN products p ON ps.product_id = p.id
       JOIN inventory inv ON ps.product_id = inv.product_id AND ps.branch_id = inv.branch_id
       WHERE ps.status = 'available' AND (inv.quantity - COALESCE(inv.reserved_qty, 0)) >= 1
       LIMIT 1`
    );

    if (availableSerials.length > 0) {
      const serialItem = availableSerials[0];
      const fromB = serialItem.branch_id;
      const toB = fromB === 1 ? 2 : 1;
      console.log(`  ℹ Transferring Serial "${serialItem.serial_number}" for "${serialItem.product_name}" from Branch ${fromB} -> Branch ${toB} (Branch stock: ${serialItem.branch_qty})`);

      const serialTransferPayload = {
        from_branch_id: fromB,
        to_branch_id: toB,
        status: 'received',
        notes: `Serial Transfer of ${serialItem.serial_number}`,
        items: [
          {
            product_id: serialItem.product_id,
            quantity: 1,
            serial_numbers: [serialItem.serial_number],
          },
        ],
      };

      const snTrfRes = await fetch('http://localhost:3000/api/admin/transfers', {
        method: 'POST',
        headers,
        body: JSON.stringify(serialTransferPayload),
      });
      const snTrfData = await snTrfRes.json();
      if (!snTrfData.success) {
        console.error('  ❌ snTrfData error:', snTrfData);
      }
      assert(snTrfRes.status === 200, 'Serial transfer API responded 200 OK');
      assert(snTrfData.success === true, `Serial transfer executed: ${snTrfData.transferNumber}`);

      // Verify that the serial number's branch in product_serials is now Branch toB!
      const [updatedSerial] = await connection.query(
        'SELECT branch_id, status FROM product_serials WHERE serial_number = ?',
        [serialItem.serial_number]
      );
      assert(updatedSerial[0].branch_id === toB, `Serial number branch location updated to Branch ${toB} (was Branch ${fromB})`);
      assert(updatedSerial[0].status === 'available', `Serial number status is "available" at destination branch`);

      // Verify challan item serials_json
      const [trfItems] = await connection.query(
        'SELECT serials_json FROM stock_transfer_items WHERE transfer_id = ?',
        [snTrfData.transferId]
      );
      assert(trfItems[0].serials_json.includes(serialItem.serial_number), 'Challan item record stores transferred serial number accurately in JSON');
    } else {
      console.log('  ℹ No available serial found at Branch 2 to test serial transfer.');
    }

    console.log('\n====================================================');
    console.log(`🎉 ALL ${passedCount}/${totalTests} TESTS PASSED PERFECTLY!`);
    console.log('====================================================');
  } finally {
    await connection.end();
  }
}

runTransferTestSuite().catch((err) => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
