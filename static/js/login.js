document.addEventListener('DOMContentLoaded', function () {
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const username = document.getElementById('username').value.replace(/\D/g, '').trim();
      const password = document.getElementById('password').value.trim();
      const next = document.querySelector('input[name="next"]')?.value || '';

      if (!username || !password) {
        alert('Preencha usuário e senha.');
        return;
      }

      fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          password: password,
          next: next
        })
      })
        .then(response => response.json())
        .then(data => {
          if (data.status === 'ok') {
            const novoCnpj = data.cnpj;
            const cnpjAnterior = sessionStorage.getItem('cliente_cnpj');

            if (cnpjAnterior && cnpjAnterior !== novoCnpj) {
              const chaveAntiga = `carrinho_${cnpjAnterior}`;
              localStorage.removeItem(chaveAntiga);
            }

            sessionStorage.setItem('cliente_cnpj', novoCnpj);

            alert('Login realizado com sucesso!');
            window.location.href = data.redirect_url || '/loja';
          } else {
            alert('Usuário ou senha inválidos: ' + (data.mensagem || ''));
          }
        })
        .catch(error => {
          console.error('Erro no login:', error);
        });
    });
  }
});
