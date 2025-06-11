const Firebird = require('node-firebird');

// Configuração da conexão
const options = {
  host: '10.251.100.2',
  port: 3051,
  database: 'C:\\MEDICON\\DB\\DATABASE.FDB', // caminho local no servidor
  user: 'USER_READ',
  password: 'USRREAD',
  lowercase_keys: true,
  role: null,
  pageSize: 4096
};

// Conectar ao banco
Firebird.attach(options, function (err, db) {
  if (err) {
    console.error('❌ Erro de conexão:', err.message);
    return;
  }

  console.log('✅ Conectado com sucesso ao Firebird!');

  // Executar uma consulta
  db.query('SELECT FIRST 5 * FROM clientes', function (err, result) {
    if (err) {
      console.error('❌ Erro na consulta:', err.message);
    } else {
      console.log('📦 Resultado:', result);
    }

    // Encerrar a conexão
    db.detach();
  });
});
