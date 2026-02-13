const readline = require("readline");
const http = require("http");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const API_HOST = "localhost";
const API_PORT = 3000;

function fazerRequisicao(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: `/api${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = http.request(options, (res) => {
      let dados = "";

      res.on("data", (chunk) => {
        dados += chunk;
      });

      res.on("end", () => {
        try {
          const resultado = dados ? JSON.parse(dados) : {};
          resolve({
            statusCode: res.statusCode,
            data: resultado,
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

function perguntar(pergunta) {
  return new Promise((resolve) => {
    rl.question(pergunta, (resposta) => {
      resolve(resposta);
    });
  });
}

async function mostrarMenu() {
  console.clear();
  console.log("SISTEMA SALAO DE BELEZA");
  console.log("");
  console.log("MENU PRINCIPAL:");
  console.log("1. Clientes");
  console.log("2. Funcionarios");
  console.log("3. Agenda");
  console.log("4. Procedimentos");
  console.log("5. Sair");
  console.log("");

  const opcao = await perguntar("Escolha uma opcao: ");

  switch (opcao) {
    case "1":
      await menuClientes();
      break;
    case "2":
      await menuFuncionarios();
      break;
    case "3":
      await menuAgenda();
      break;
    case "4":
      await menuProcedimentos();
      break;
    case "5":
      console.log("Saindo...");
      rl.close();
      process.exit();
    default:
      console.log("Opcao invalida!");
      await aguardarEnter();
      await mostrarMenu();
  }
}

async function menuClientes() {
  console.clear();
  console.log("MENU CLIENTES:");
  console.log("1. Listar todos clientes");
  console.log("2. Criar novo cliente");
  console.log("3. Atualizar cliente");
  console.log("4. Voltar");
  console.log("");

  const opcao = await perguntar("Escolha: ");

  switch (opcao) {
    case "1":
      await listarClientes();
      break;
    case "2":
      await criarCliente();
      break;
    case "3":
      await atualizarCliente();
      break;
    case "4":
      await mostrarMenu();
      break;
    default:
      console.log("Opcao invalida!");
      await aguardarEnter();
      await menuClientes();
  }
}

async function listarClientes() {
  console.log("\nListando clientes...");
  try {
    const resultado = await fazerRequisicao("GET", "/clientes");

    if (resultado.statusCode === 200) {
      console.log("Clientes encontrados:\n");

      let clientes = [];
      if (resultado.data && resultado.data.data) {
        clientes = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        clientes = resultado.data;
      }

      if (clientes.length > 0) {
        clientes.forEach((cliente, index) => {
          console.log(
            `${index + 1}. ID: ${cliente.id_cliente} | Nome: ${cliente.nome} | Tel: ${cliente.telefone} | Email: ${cliente.email}`
          );
        });
        console.log(`\nTotal: ${clientes.length} clientes`);
      } else {
        console.log("Nenhum cliente encontrado.");
      }
    } else {
      console.log("Erro:", resultado.statusCode, resultado.data);
    }
  } catch (error) {
    console.log("Erro de conexao:", error.message);
  }
  await aguardarEnter();
  await menuClientes();
}

async function criarCliente() {
  console.log("\nCriar novo cliente:");
  const nome = await perguntar("Nome: ");
  const cpf = await perguntar("CPF (11 digitos): ");
  const telefone = await perguntar("Telefone: ");
  const email = await perguntar("Email: ");

  try {
    const resultado = await fazerRequisicao("POST", "/clientes", {
      nome,
      cpf,
      telefone,
      email,
    });

    if (resultado.statusCode === 201) {
      console.log("\nCliente criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("\nNao foi possivel criar o cliente:", resultado.data);
    }
  } catch (error) {
    console.log("Erro de conexao:", error.message);
  }
  await aguardarEnter();
  await menuClientes();
}

async function atualizarCliente() {
  console.log("\nListando clientes para atualizar...");
  try {
    const resultado = await fazerRequisicao("GET", "/clientes");

    if (resultado.statusCode === 200) {
      let clientes = [];
      if (resultado.data && resultado.data.data) {
        clientes = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        clientes = resultado.data;
      }

      if (clientes.length > 0) {
        console.log("\nClientes disponiveis:");
        clientes.forEach((cliente) => {
          console.log(`ID: ${cliente.id_cliente} | Nome: ${cliente.nome}`);
        });

        const id = await perguntar("\nID do cliente que deseja atualizar: ");
        console.log("\nDeixe em branco os campos que nao deseja alterar:");
        
        const nome = await perguntar(`Nome (${clientes.find(c => c.id_cliente == id)?.nome || ''}): `);
        const cpf = await perguntar(`CPF (${clientes.find(c => c.id_cliente == id)?.cpf || ''}): `);
        const telefone = await perguntar(`Telefone (${clientes.find(c => c.id_cliente == id)?.telefone || ''}): `);
        const email = await perguntar(`Email (${clientes.find(c => c.id_cliente == id)?.email || ''}): `);

        const dadosAtualizados = {};
        if (nome) dadosAtualizados.nome = nome;
        if (cpf) dadosAtualizados.cpf = cpf;
        if (telefone) dadosAtualizados.telefone = telefone;
        if (email) dadosAtualizados.email = email;

        const updateResult = await fazerRequisicao("PUT", `/clientes/${id}`, dadosAtualizados);

        if (updateResult.statusCode === 200) {
          console.log("\nCliente atualizado com sucesso!");
        } else {
          console.log("\nErro ao atualizar cliente:", updateResult.data);
        }
      } else {
        console.log("Nenhum cliente encontrado.");
      }
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuClientes();
}

async function menuFuncionarios() {
  console.clear();
  console.log("MENU FUNCIONARIOS:");
  console.log("1. Listar funcionarios");
  console.log("2. Criar funcionario");
  console.log("3. Atualizar funcionario");
  console.log("4. Voltar");
  console.log("");

  const opcao = await perguntar("Escolha: ");

  switch (opcao) {
    case "1":
      await listarFuncionarios();
      break;
    case "2":
      await criarFuncionario();
      break;
    case "3":
      await atualizarFuncionario();
      break;
    case "4":
      await mostrarMenu();
      break;
    default:
      console.log("Opcao invalida!");
      await aguardarEnter();
      await menuFuncionarios();
  }
}

async function listarFuncionarios() {
  console.log("\nListando funcionarios...");
  try {
    const resultado = await fazerRequisicao("GET", "/funcionarios");

    if (resultado.statusCode === 200) {
      console.log("Funcionarios encontrados:\n");

      let funcionarios = [];
      if (resultado.data && resultado.data.data) {
        funcionarios = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        funcionarios = resultado.data;
      }

      if (funcionarios.length > 0) {
        funcionarios.forEach((func, index) => {
          console.log(
            `${index + 1}. ID: ${func.id_fun} | Nome: ${func.nome} | Tipo: ${func.tipo}`
          );
        });
        console.log(`\nTotal: ${funcionarios.length} funcionarios`);
      } else {
        console.log("Nenhum funcionario encontrado.");
      }
    } else {
      console.log("Erro:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuFuncionarios();
}

async function criarFuncionario() {
  console.log("\nCriar novo funcionario:");
  const nome = await perguntar("Nome: ");
  const data_nascimento = await perguntar("Data nascimento (YYYY-MM-DD): ");
  const endereco = await perguntar("Endereco: ");
  const tipo = await perguntar("Tipo (maquiadora/cabeleireira/manicure): ");

  try {
    const resultado = await fazerRequisicao("POST", "/funcionarios", {
      nome,
      data_nascimento,
      endereco,
      tipo,
    });

    if (resultado.statusCode === 201) {
      console.log("\nFuncionario criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("\nNao foi possivel criar o funcionario:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuFuncionarios();
}

async function atualizarFuncionario() {
  console.log("\nListando funcionarios para atualizar...");
  try {
    const resultado = await fazerRequisicao("GET", "/funcionarios");

    if (resultado.statusCode === 200) {
      let funcionarios = [];
      if (resultado.data && resultado.data.data) {
        funcionarios = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        funcionarios = resultado.data;
      }

      if (funcionarios.length > 0) {
        console.log("\nFuncionarios disponiveis:");
        funcionarios.forEach((func) => {
          console.log(`ID: ${func.id_fun} | Nome: ${func.nome}`);
        });

        const id = await perguntar("\nID do funcionario que deseja atualizar: ");
        console.log("\nDeixe em branco os campos que nao deseja alterar:");
        
        const nome = await perguntar(`Nome (${funcionarios.find(f => f.id_fun == id)?.nome || ''}): `);
        const data_nascimento = await perguntar(`Data nascimento (${funcionarios.find(f => f.id_fun == id)?.data_nascimento || ''}): `);
        const endereco = await perguntar(`Endereco (${funcionarios.find(f => f.id_fun == id)?.endereco || ''}): `);
        const tipo = await perguntar(`Tipo (${funcionarios.find(f => f.id_fun == id)?.tipo || ''}): `);

        const dadosAtualizados = {};
        if (nome) dadosAtualizados.nome = nome;
        if (data_nascimento) dadosAtualizados.data_nascimento = data_nascimento;
        if (endereco) dadosAtualizados.endereco = endereco;
        if (tipo) dadosAtualizados.tipo = tipo;

        const updateResult = await fazerRequisicao("PUT", `/funcionarios/${id}`, dadosAtualizados);

        if (updateResult.statusCode === 200) {
          console.log("\nFuncionario atualizado com sucesso!");
        } else {
          console.log("\nErro ao atualizar funcionario:", updateResult.data);
        }
      } else {
        console.log("Nenhum funcionario encontrado.");
      }
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuFuncionarios();
}

async function menuProcedimentos() {
  console.clear();
  console.log("MENU PROCEDIMENTOS:");
  console.log("1. Listar procedimentos");
  console.log("2. Criar procedimento");
  console.log("3. Atualizar procedimento");
  console.log("4. Voltar");
  console.log("");

  const opcao = await perguntar("Escolha: ");

  switch (opcao) {
    case "1":
      await listarProcedimentos();
      break;
    case "2":
      await criarProcedimento();
      break;
    case "3":
      await atualizarProcedimento();
      break;
    case "4":
      await mostrarMenu();
      break;
    default:
      console.log("Opcao invalida!");
      await aguardarEnter();
      await menuProcedimentos();
  }
}

async function listarProcedimentos() {
  console.log("\nListando procedimentos...");
  try {
    const resultado = await fazerRequisicao("GET", "/procedimentos");

    if (resultado.statusCode === 200) {
      console.log("Procedimentos encontrados:\n");

      let procedimentos = [];
      if (resultado.data && resultado.data.data) {
        procedimentos = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        procedimentos = resultado.data;
      }

      if (procedimentos.length > 0) {
        procedimentos.forEach((proc, index) => {
          console.log(
            `${index + 1}. ID: ${proc.id_procedimento} | Nome: ${proc.nome} | Preco: R$ ${proc.preco} | Duracao: ${proc.duracao}`
          );
        });
        console.log(`\nTotal: ${procedimentos.length} procedimentos`);
      } else {
        console.log("Nenhum procedimento encontrado.");
      }
    } else {
      console.log("Erro:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuProcedimentos();
}

async function criarProcedimento() {
  console.log("\nCriar novo procedimento:");
  const nome = await perguntar("Nome: ");
  const preco = await perguntar("Preco: ");
  const duracao = await perguntar("Duracao (HH:MM:SS): ");

  try {
    const resultado = await fazerRequisicao("POST", "/procedimentos", {
      nome,
      preco,
      duracao,
    });

    if (resultado.statusCode === 201) {
      console.log("\nProcedimento criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("\nNao foi possivel criar o procedimento:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuProcedimentos();
}

async function atualizarProcedimento() {
  console.log("\nListando procedimentos para atualizar...");
  try {
    const resultado = await fazerRequisicao("GET", "/procedimentos");

    if (resultado.statusCode === 200) {
      let procedimentos = [];
      if (resultado.data && resultado.data.data) {
        procedimentos = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        procedimentos = resultado.data;
      }

      if (procedimentos.length > 0) {
        console.log("\nProcedimentos disponiveis:");
        procedimentos.forEach((proc) => {
          console.log(`ID: ${proc.id_procedimento} | Nome: ${proc.nome}`);
        });

        const id = await perguntar("\nID do procedimento que deseja atualizar: ");
        console.log("\nDeixe em branco os campos que nao deseja alterar:");
        
        const nome = await perguntar(`Nome (${procedimentos.find(p => p.id_procedimento == id)?.nome || ''}): `);
        const preco = await perguntar(`Preco (${procedimentos.find(p => p.id_procedimento == id)?.preco || ''}): `);
        const duracao = await perguntar(`Duracao (${procedimentos.find(p => p.id_procedimento == id)?.duracao || ''}): `);

        const dadosAtualizados = {};
        if (nome) dadosAtualizados.nome = nome;
        if (preco) dadosAtualizados.preco = preco;
        if (duracao) dadosAtualizados.duracao = duracao;

        const updateResult = await fazerRequisicao("PUT", `/procedimentos/${id}`, dadosAtualizados);

        if (updateResult.statusCode === 200) {
          console.log("\nProcedimento atualizado com sucesso!");
        } else {
          console.log("\nErro ao atualizar procedimento:", updateResult.data);
        }
      } else {
        console.log("Nenhum procedimento encontrado.");
      }
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuProcedimentos();
}

async function menuAgenda() {
  console.clear();
  console.log("MENU AGENDA:");
  console.log("1. Ver agenda completa");
  console.log("2. Ver agenda por funcionario");
  console.log("3. Criar agendamento");
  console.log("4. Atualizar agendamento");
  console.log("5. Cancelar agendamento");
  console.log("6. Deletar agendamento");
  console.log("7. Voltar");
  console.log("");

  const opcao = await perguntar("Escolha: ");

  switch (opcao) {
    case "1":
      await verAgendaCompleta();
      break;
    case "2":
      await verAgendaPorFuncionario();
      break;
    case "3":
      await criarAgendamento();
      break;
    case "4":
      await atualizarAgendamento();
      break;
    case "5":
      await cancelarAgendamento();
      break;
    case "6":
      await deletarAgendamento();
      break;
    case "7":
      await mostrarMenu();
      break;
    default:
      console.log("Opcao invalida!");
      await aguardarEnter();
      await menuAgenda();
  }
}

async function verAgendaCompleta() {
  console.log("\nBuscando agenda completa...");
  try {
    let resultado = await fazerRequisicao("GET", "/agenda-completa");

    if (resultado.statusCode === 404) {
      resultado = await fazerRequisicao("GET", "/agenda");
    }

    if (resultado.statusCode === 200) {
      console.log("Agenda encontrada:\n");

      let agenda = [];
      if (resultado.data && resultado.data.data) {
        agenda = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        agenda = resultado.data;
      }

      if (agenda.length > 0) {
        agenda.forEach((item, index) => {
          console.log(
            `${index + 1}. ID: ${item.id_agenda} | ${item.data} ${item.horario} - ${item.cliente_nome} (${item.procedimento_nome}) com ${item.funcionario_nome} [${item.status}]`
          );
        });
        console.log(`\nTotal: ${agenda.length} agendamentos`);
      } else {
        console.log("Nenhum agendamento encontrado.");
      }
    } else {
      console.log("Erro:", resultado.statusCode, resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function verAgendaPorFuncionario() {
  console.log("\nNome do funcionario: ");
  const nomeFuncionario = await perguntar("");

  console.log(`\nBuscando agenda de ${nomeFuncionario}...`);

  try {
    const nomeCodificado = encodeURIComponent(nomeFuncionario);
    const resultado = await fazerRequisicao("GET", `/agenda-funcionario/${nomeCodificado}`);

    if (resultado.statusCode === 200) {
      console.log("Agenda encontrada:\n");

      let agenda = [];
      if (resultado.data && resultado.data.data) {
        agenda = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        agenda = resultado.data;
      }

      if (agenda.length > 0) {
        agenda.forEach((item, index) => {
          console.log(
            `${index + 1}. ID: ${item.id_agenda} | ${item.data} ${item.horario} - ${item.cliente_nome} (${item.procedimento_nome}) [${item.status}]`
          );
        });
        console.log(`\nTotal: ${agenda.length} agendamentos`);
      } else {
        console.log(`Nenhum agendamento encontrado para ${nomeFuncionario}.`);
      }
    } else {
      console.log("Erro:", resultado.statusCode, resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }

  await aguardarEnter();
  await menuAgenda();
}

async function criarAgendamento() {
  console.log("\nCriar novo agendamento:");
  
  const data = await perguntar("Data (YYYY-MM-DD): ");
  const horario = await perguntar("Horario (HH:MM:SS): ");
  const cliente_nome = await perguntar("Nome do cliente: ");
  const procedimento_nome = await perguntar("Nome do procedimento: ");
  const funcionario_nome = await perguntar("Nome do funcionario: ");

  try {
    const resultado = await fazerRequisicao("POST", "/agenda", {
      horario,
      data,
      status: "agendado",
      cliente_nome,
      procedimento_nome,
      funcionario_nome,
    });

    if (resultado.statusCode === 201) {
      console.log("\nAgendamento criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("\nNao foi possivel criar o agendamento:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function atualizarAgendamento() {
  console.log("\nListando agendamentos para atualizar...");
  try {
    const resultado = await fazerRequisicao("GET", "/agenda");

    if (resultado.statusCode === 200) {
      let agenda = [];
      if (resultado.data && resultado.data.data) {
        agenda = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        agenda = resultado.data;
      }

      if (agenda.length > 0) {
        console.log("\nAgendamentos disponiveis:");
        agenda.forEach((item) => {
          console.log(`ID: ${item.id_agenda} | ${item.data} ${item.horario} - ${item.cliente_nome}`);
        });

        const id = await perguntar("\nID do agendamento que deseja atualizar: ");
        console.log("\nDeixe em branco os campos que nao deseja alterar:");
        
        const horario = await perguntar("Horario (HH:MM:SS): ");
        const data = await perguntar("Data (YYYY-MM-DD): ");
        const status = await perguntar("Status (agendado/cancelado/concluido): ");
        const cliente_nome = await perguntar("Nome do cliente: ");
        const procedimento_nome = await perguntar("Nome do procedimento: ");
        const funcionario_nome = await perguntar("Nome do funcionario: ");

        const dadosAtualizados = {};
        if (horario) dadosAtualizados.horario = horario;
        if (data) dadosAtualizados.data = data;
        if (status) dadosAtualizados.status = status;
        if (cliente_nome) dadosAtualizados.cliente_nome = cliente_nome;
        if (procedimento_nome) dadosAtualizados.procedimento_nome = procedimento_nome;
        if (funcionario_nome) dadosAtualizados.funcionario_nome = funcionario_nome;

        const updateResult = await fazerRequisicao("PUT", `/agenda/${id}`, dadosAtualizados);

        if (updateResult.statusCode === 200) {
          console.log("\nAgendamento atualizado com sucesso!");
        } else {
          console.log("\nErro ao atualizar agendamento:", updateResult.data);
        }
      } else {
        console.log("Nenhum agendamento encontrado.");
      }
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function cancelarAgendamento() {
  console.log("\nListando agendamentos...");
  try {
    const resultado = await fazerRequisicao("GET", "/agenda");
    let agenda = [];

    if (resultado.statusCode === 200) {
      if (resultado.data && resultado.data.data) {
        agenda = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        agenda = resultado.data;
      }

      if (agenda.length > 0) {
        console.log("\nAgendamentos ativos:");
        agenda.forEach((item) => {
          console.log(
            `ID: ${item.id_agenda} | ${item.data} ${item.horario} - ${item.cliente_nome} [${item.status}]`
          );
        });
      } else {
        console.log("Nenhum agendamento encontrado.");
        await aguardarEnter();
        await menuAgenda();
        return;
      }
    }

    const id = await perguntar("\nID do agendamento para CANCELAR: ");

    try {
      const resultado = await fazerRequisicao("PATCH", `/agenda/${id}/status`, {
        status: "cancelado",
      });

      if (resultado.statusCode === 200) {
        console.log("\nAgendamento cancelado com sucesso!");
      } else {
        console.log("\nErro ao cancelar agendamento:", resultado.data);
      }
    } catch (error) {
      console.log("Erro:", error.message);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function deletarAgendamento() {
  console.log("\nListando agendamentos para DELETAR...");
  try {
    const resultado = await fazerRequisicao("GET", "/agenda");

    if (resultado.statusCode === 200) {
      let agenda = [];
      if (resultado.data && resultado.data.data) {
        agenda = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        agenda = resultado.data;
      }

      if (agenda.length > 0) {
        console.log("\nAgendamentos disponiveis:");
        agenda.forEach((item) => {
          console.log(`ID: ${item.id_agenda} | ${item.data} ${item.horario} - ${item.cliente_nome} [${item.status}]`);
        });

        const id = await perguntar("\nID do agendamento que deseja DELETAR: ");
        
        const confirmacao = await perguntar(`Tem certeza que deseja deletar o agendamento ID ${id}? (s/N): `);
        
        if (confirmacao.toLowerCase() === 's') {
          const deleteResult = await fazerRequisicao("DELETE", `/agenda/${id}`);

          if (deleteResult.statusCode === 200) {
            console.log("\nAgendamento deletado com sucesso!");
          } else {
            console.log("\nErro ao deletar agendamento:", deleteResult.data);
          }
        } else {
          console.log("\nOperacao cancelada.");
        }
      } else {
        console.log("Nenhum agendamento encontrado.");
      }
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function aguardarEnter() {
  console.log("\nPressione Enter para continuar...");
  await perguntar("");
}

(async () => {
  console.clear();
  console.log("SISTEMA SALAO DE BELEZA - CLIENTE CLI");
  console.log("========================================");
  
  try {
    await fazerRequisicao("GET", "/clientes");
    console.log("Conectado a API com sucesso!");
  } catch (error) {
    console.log("Nao foi possivel conectar a API.");
    console.log("Verifique se o servidor esta rodando em:");
    console.log(`http://${API_HOST}:${API_PORT}`);
    console.log("\nPara iniciar o servidor:");
    console.log("node server.js");
  }

  await aguardarEnter();
  await mostrarMenu();
})();