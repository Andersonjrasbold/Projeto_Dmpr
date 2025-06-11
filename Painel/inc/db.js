const Firebird = require('node-firebird');

// Configurações do banco de dados
const options = {
  host: '10.251.100.2',           // IP ou nome do host
  port: 3051,                  // Porta padrão do Firebird
  database: 'C:\MEDICON\DB\DATABASE.FDB', // Caminho absoluto do .FDB
  user: 'USER_READ',              // Usuário padrão
  password: 'USRREAD',       // Senha padrão
  lowercase_keys: false,       // As chaves no retorno serão lowercase
  role: null,                  // Papel (role) se necessário
  pageSize: 4096               // Tamanho da página, normalmente 4096
};

// Conexão
Firebird.attach(options, function(err, db) {
  if (err) {
    console.log('Erro de conexão:', err);
    return;
  }

  console.log('Conectado ao Firebird!');

  // Executar uma consulta
  db.query('SELECT * FROM clientes', function(err, result) {
    if (err) {
      console.log('Erro na consulta:', err);
    } else {
      console.log('Resultado:', result);
    }

    // Fechar conexão
    db.detach();
  });
});
