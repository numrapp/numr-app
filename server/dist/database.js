"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = initDatabase;
exports.save = save;
exports.getDb = getDb;
exports.queryAll = queryAll;
exports.queryOne = queryOne;
exports.run = run;
exports.getLastInsertId = getLastInsertId;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../../database/invoices.db');
let db;
async function initDatabase() {
    const SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(DB_PATH)) {
        const buffer = fs_1.default.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    }
    else {
        db = new SQL.Database();
    }
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      company_name TEXT DEFAULT '',
      company_address TEXT DEFAULT '',
      company_postcode TEXT DEFAULT '',
      company_city TEXT DEFAULT '',
      kvk_number TEXT DEFAULT '',
      btw_number TEXT DEFAULT '',
      iban TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      logo_path TEXT DEFAULT '',
      smtp_host TEXT DEFAULT '',
      smtp_port INTEGER DEFAULT 587,
      smtp_user TEXT DEFAULT '',
      smtp_pass TEXT DEFAULT '',
      default_payment_days INTEGER DEFAULT 30,
      invoice_prefix TEXT DEFAULT 'FAC',
      next_invoice_number INTEGER DEFAULT 1,
      deepl_api_key TEXT DEFAULT '',
      terms_accepted INTEGER DEFAULT 0,
      subscription_type TEXT DEFAULT '',
      subscription_start TEXT DEFAULT '',
      subscription_end TEXT DEFAULT '',
      reset_token TEXT DEFAULT '',
      reset_token_expires TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      company_name TEXT NOT NULL,
      contact_name TEXT DEFAULT '',
      email TEXT DEFAULT '',
      address TEXT DEFAULT '',
      postcode TEXT DEFAULT '',
      city TEXT DEFAULT '',
      country TEXT DEFAULT 'Nederland',
      kvk_number TEXT DEFAULT '',
      btw_number TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      invoice_number TEXT NOT NULL,
      invoice_date TEXT NOT NULL,
      delivery_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      payment_terms_days INTEGER DEFAULT 30,
      description TEXT DEFAULT '',
      subtotal REAL DEFAULT 0,
      btw_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      pdf_path TEXT DEFAULT '',
      sent_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      btw_rate REAL DEFAULT 21,
      btw_amount REAL DEFAULT 0,
      line_total REAL DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS offertes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      client_id INTEGER NOT NULL,
      offerte_number TEXT NOT NULL,
      offerte_date TEXT NOT NULL,
      valid_until TEXT NOT NULL,
      description TEXT DEFAULT '',
      subtotal REAL DEFAULT 0,
      btw_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      converted_invoice_id INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);
    db.run(`
    CREATE TABLE IF NOT EXISTS offerte_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      offerte_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      btw_rate REAL DEFAULT 21,
      btw_amount REAL DEFAULT 0,
      line_total REAL DEFAULT 0,
      FOREIGN KEY (offerte_id) REFERENCES offertes(id) ON DELETE CASCADE
    )
  `);
    save();
    const cols = ['terms_accepted', 'subscription_type', 'subscription_start', 'subscription_end', 'reset_token', 'reset_token_expires', 'next_offerte_number'];
    for (const col of cols) {
        try {
            db.run(`ALTER TABLE users ADD COLUMN ${col} TEXT DEFAULT ''`);
        }
        catch { }
    }
    try {
        db.run(`UPDATE users SET next_offerte_number = '26001' WHERE next_offerte_number = '' OR next_offerte_number IS NULL`);
    }
    catch { }
    save();
    return db;
}
function save() {
    const dir = path_1.default.dirname(DB_PATH);
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
    const data = db.export();
    fs_1.default.writeFileSync(DB_PATH, Buffer.from(data));
}
function getDb() {
    return db;
}
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0)
        stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}
function queryOne(sql, params = []) {
    return queryAll(sql, params)[0];
}
function run(sql, params = []) {
    db.run(sql, params);
    save();
}
function getLastInsertId() {
    const row = queryOne("SELECT last_insert_rowid() as id");
    return row?.id || 0;
}
//# sourceMappingURL=database.js.map