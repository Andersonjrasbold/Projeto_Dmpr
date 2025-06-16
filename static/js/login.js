document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert('Preencha usuário e senha.');
    return;
  }

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username: username, password: password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'ok') {
      alert('Login realizado com sucesso!');
      window.location.href = '/loja';  // Redireciona para a loja
    } else {
      alert('Usuário ou senha inválidos.');
    }
  })
  .catch(error => {
    console.error('Erro:', error);
    alert('Erro ao fazer login.');
  });
});