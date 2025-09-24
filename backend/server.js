const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔐 Função para gerar hash de senha
const hashSenha = async (senha) => {
  const saltRounds = 10;
  return await bcrypt.hash(senha, saltRounds);
};

// 🔐 Função para verificar senha
const verificarSenha = async (senha, hash) => {
  return await bcrypt.compare(senha, hash);
};

// 📧 Validação simples de email
const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 🟢 CREATE - Cadastrar usuário
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;

  // Validação de campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos' });
  }

  // Validação de email
  if (!validarEmail(email)) {
    return res.status(400).json({ erro: 'Email inválido' });
  }

  // Validação de tamanho da senha
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
  }

  try {
    // Verificar se email já existe
    const checkEmailSql = 'SELECT id FROM usuarios WHERE email = ?';
    db.query(checkEmailSql, [email], async (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro no servidor' });
      
      if (results.length > 0) {
        return res.status(400).json({ erro: 'Email já cadastrado' });
      }

      // Hash da senha antes de salvar
      const senhaHash = await hashSenha(senha);
      
      const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
      db.query(sql, [nome, email, senhaHash], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
        
        res.json({ 
          mensagem: 'Usuário cadastrado com sucesso!', 
          id: result.insertId 
        });
      });
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar cadastro' });
  }
});

// 🔐 LOGIN - Autenticar usuário
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha email e senha' });
  }

  try {
    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
      if (err) return res.status(500).json({ erro: 'Erro no servidor' });
      
      if (results.length === 0) {
        return res.status(401).json({ 
          sucesso: false, 
          mensagem: 'Email ou senha incorretos' 
        });
      }

      const usuario = results[0];
      
      // Verificar senha
      const senhaValida = await verificarSenha(senha, usuario.senha);
      
      if (!senhaValida) {
        return res.status(401).json({ 
          sucesso: false, 
          mensagem: 'Email ou senha incorretos' 
        });
      }

      // Login bem-sucedido
      res.json({
        sucesso: true,
        mensagem: 'Login realizado com sucesso!',
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        }
      });
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar login' });
  }
});

// 🔵 READ - Listar todos os usuários (sem senhas)
app.get('/usuarios', (req, res) => {
  const sql = 'SELECT id, nome, email FROM usuarios'; // Não retornar senhas
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuários' });
    res.json(results);
  });
});

// 🔵 READ - Buscar usuário por ID
app.get('/usuarios/:id', (req, res) => {
  const { id } = req.params;
  
  const sql = 'SELECT id, nome, email FROM usuarios WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ erro: 'Erro ao buscar usuário' });
    
    if (results.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json(results[0]);
  });
});

// 🟠 UPDATE - Atualizar usuário por ID
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e email são obrigatórios' });
  }

  if (!validarEmail(email)) {
    return res.status(400).json({ erro: 'Email inválido' });
  }

  try {
    let sql, params;

    // Se senha foi fornecida, atualizar com hash
    if (senha) {
      if (senha.length < 6) {
        return res.status(400).json({ erro: 'Senha deve ter pelo menos 6 caracteres' });
      }
      
      const senhaHash = await hashSenha(senha);
      sql = 'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?';
      params = [nome, email, senhaHash, id];
    } else {
      // Se não forneceu senha, manter a atual
      sql = 'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?';
      params = [nome, email, id];
    }

    db.query(sql, params, (err, result) => {
      if (err) return res.status(500).json({ erro: 'Erro ao atualizar usuário' });
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }
      
      res.json({ mensagem: 'Usuário atualizado com sucesso!' });
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao processar atualização' });
  }
});

// 🔴 DELETE - Excluir usuário por ID
app.delete('/usuarios/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM usuarios WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ erro: 'Erro ao deletar usuário' });
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    
    res.json({ mensagem: 'Usuário deletado com sucesso!' });
  });
});

// 🏠 Rota de saúde da API
app.get('/', (req, res) => {
  res.json({ 
    mensagem: 'API de Usuários funcionando!',
    versao: '1.0.0',
    endpoints: {
      cadastro: 'POST /usuarios',
      login: 'POST /login',
      listar: 'GET /usuarios',
      buscar: 'GET /usuarios/:id',
      atualizar: 'PUT /usuarios/:id',
      deletar: 'DELETE /usuarios/:id'
    }
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});