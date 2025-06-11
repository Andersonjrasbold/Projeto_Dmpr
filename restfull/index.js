const express = require('express');
let routerIndex = require('./routes/index.js')
let routerUsers= require('./routes/users.js')

let app = express();

app.use(routerIndex);
app.use(routerUsers);

// Iniciando o servidor
app.listen(3000, '127.0.0.1', () => {
  console.log('Servidor rodando em http://127.0.0.1:3000');
});
