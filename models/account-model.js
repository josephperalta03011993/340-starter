const pool = require("../database");

async function getAccountByEmail(email) {
  try {
    const result = await pool.query("SELECT * FROM account WHERE account_email = $1", [email]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getAccountById(account_id) {
  try {
    const result = await pool.query("SELECT * FROM account WHERE account_id = $1", [account_id]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    const sql = "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updatePassword(account_id, account_password) {
  try {
    const sql = "UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *";
    const result = await pool.query(sql, [account_password, account_id]);
    return result.rows[0];
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const email = await pool.query(sql, [account_email]);
    return email.rowCount > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = { getAccountByEmail, getAccountById, registerAccount, updateAccount, updatePassword, checkExistingEmail };