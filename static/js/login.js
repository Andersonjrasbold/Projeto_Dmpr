document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
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
          // Limpa o carrinho do cliente anterior ao trocar de login
          localStorage.removeItem('carrinho');

          alert('Login realizado com sucesso!');
          window.location.href = '/loja';
        } else {
          alert('Usuário ou senha inválidos: ' + (data.mensagem || ''));
        }
      })
      .catch(error => {
        console.error('Erro no login:', error);
        alert('Erro ao tentar fazer login.');
      });
    });
  }
});
