
async function cadastrarUsuario() {
  const nome = document.getElementById("cadastro-nome").value;
  const email = document.getElementById("cadastro-email").value;
  const senha = document.getElementById("cadastro-password").value;
  const confirmaSenha = document.getElementById("confirm-password").value;

  if (senha !== confirmaSenha) {
    alert("As senhas não conferem!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();
    alert(data.mensagem || "Erro ao cadastrar");
  } catch (error) {
    console.error("Erro:", error);
  }
}



 async function loginUsuario() {
  const email = document.getElementById("email_login").value;
  const senha = document.getElementById("password_login").value;

  
  if (!email || !senha) {
    alert("Por favor, preencha email e senha!");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/login", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha })
    });

    const data = await response.json();
    console.log("Resposta do servidor:", data);

    if (data.sucesso) {
      alert(data.mensagem);
      window.location.href = "/Home.html";
    } else {
      alert(data.mensagem || "Erro no login");
    }
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao conectar com o servidor");
  }
}






async function atualizarUsuario(id) {
  const nome = document.getElementById("cadastro-nome").value;
  const email = document.getElementById("cadastro-email").value;
  const senha = document.getElementById("cadastro-password").value;

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    });

    const data = await response.json();
    alert(data.mensagem || "Erro ao atualizar");
  } catch (error) {
    console.error("Erro:", error);
  }
}


async function deletarUsuario(id) {
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();
    alert(data.mensagem || "Erro ao deletar");
  } catch (error) {
    console.error("Erro:", error);
  }
}

