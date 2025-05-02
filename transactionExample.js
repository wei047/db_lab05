// transactionExample.js
const pool = require('./db');

async function doTransaction() {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // 開始交易

    const studentId = 'S10811005';

    // 1. 檢查是否有該學號
    const checkSql = 'SELECT * FROM STUDENT WHERE Student_ID = ?';
    const checkResult = await conn.query(checkSql, 'S10811005');
    if (!checkResult || checkResult.length === 0) {
      console.log('查無此學生，交易中止');
      return;
    }

    // 2. 更新學生系別
    const updateSql = 'UPDATE STUDENT SET Department_ID = ? WHERE Student_ID = ?';
    await conn.query(updateSql, ['EE001', 'S10811005']);

    await conn.commit(); // 提交交易
    console.log('交易成功，已提交');

    // 3. 查詢該學生目前的系別
    const result = await conn.query('SELECT Department_ID FROM STUDENT WHERE Student_ID = ?', [studentId]);
    console.log(`目前系別為：${result[0].Department_ID}`);

  } catch (err) {
    if (conn) await conn.rollback();
    console.error('交易失敗，已回滾');
    console.error('錯誤代碼：', err.code || err);
  } finally {
    if (conn) conn.release();
  }
}

doTransaction();

