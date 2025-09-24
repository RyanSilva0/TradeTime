const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'usuarios'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erro ao conectar no MySQL: ', err);
    return;
  }
  console.log('✅ Conectado ao MySQL!');
});

module.exports = db;
