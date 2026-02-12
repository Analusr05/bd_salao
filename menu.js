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
  console.log("SISTEMA SALÃO DE BELEZA");
  console.log("");
  console.log("MENU PRINCIPAL:");
  console.log("1. Clientes");
  console.log("2. Funcionários");
  console.log("3. Agenda");
  console.log("4. Procedimentos");
  console.log("5. Sair");
  console.log("");

  const opcao = await perguntar("Escolha uma opção: ");

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
      console.log("Opção inválida!");
      await aguardarEnter();
      await mostrarMenu();
  }
}

async function menuClientes() {
  console.clear();
  console.log("MENU CLIENTES:");
  console.log("1. Listar todos clientes");
  console.log("2. Criar novo cliente");
  console.log("3. Voltar");
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
      await mostrarMenu();
      break;
    default:
      console.log("Opção inválida!");
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
            `${index + 1}. ID: ${cliente.id_cliente} | Nome: ${cliente.nome} | Tel: ${cliente.telefone} | Email: ${cliente.email}`,
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
    console.log("Erro de conexão:", error.message);
  }
  await aguardarEnter();
  await menuClientes();
}

async function criarCliente() {
  console.log("\nCriar novo cliente:");
  const nome = await perguntar("Nome: ");
  const cpf = await perguntar("CPF (11 dígitos): ");
  const telefone = await perguntar("Telefone: ");
  const email = await perguntar("Email: ");

  try {
    const resultado = await fazerRequisicao("POST", "/clientes", {
      nome,
      cpf,
      telefone,
      email,
    });

    console.log("\nResposta da API:");
    console.log("Status:", resultado.statusCode);

    if (resultado.statusCode === 201) {
      console.log("Cliente criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("Não foi possível criar o cliente:", resultado.data);
    }
  } catch (error) {
    console.log("Erro de conexão:", error.message);
  }
  await aguardarEnter();
  await menuClientes();
}

async function menuAgenda() {
  console.clear();
  console.log("MENU AGENDA:");
  console.log("1. Ver agenda completa");
  console.log("2. Ver agenda por funcionário");
  console.log("3. Criar agendamento");
  console.log("4. Cancelar agendamento");
  console.log("5. Marcar como concluído");
  console.log("6. Voltar");
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
      await cancelarAgendamento();
      break;
    case "5":
      await concluirAgendamento();
      break;
    case "6":
      await mostrarMenu();
      break;
    default:
      console.log("Opção inválida!");
      await aguardarEnter();
      await menuAgenda();
  }
}

async function verAgendaCompleta() {
  console.log("\nBuscando agenda completa...");
  try {
    let resultado = await fazerRequisicao("GET", "/agenda-completa");

    if (resultado.statusCode === 404) {
      console.log(
        "Rota /agenda/completa não encontrada, tentando /agenda...",
      );
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
          const data = item.data || item.data_agendamento;
          const horario = item.horario || item.hora;
          const cliente =
            item.cliente || item.cliente_nome || item.nome_cliente;
          const procedimento =
            item.procedimento ||
            item.procedimento_nome ||
            item.nome_procedimento;
          const funcionario =
            item.funcionario || item.funcionario_nome || item.nome_funcionario;
          const status = item.status || item.estado;

          console.log(
            `${index + 1}. ${data} ${horario} - ${cliente} (${procedimento}) com ${funcionario} [${status}]`,
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
  console.log("\nNome do funcionário: ");
  const nomeFuncionario = await perguntar("");

  console.log(`\nBuscando agenda de ${nomeFuncionario}...`);

  try {
    const nomeCodificado = encodeURIComponent(nomeFuncionario);
    console.log(`URL chamada: /agenda-funcionario/${nomeCodificado}`);

    const resultado = await fazerRequisicao(
      "GET",
      `/agenda-funcionario/${nomeCodificado}`,
    );

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
          const data = item.data || item.data_agendamento;
          const horario = item.horario || item.hora;
          const cliente = item.cliente || item.cliente_nome;
          const procedimento = item.procedimento || item.procedimento_nome;
          const status = item.status || item.estado;

          console.log(
            `${index + 1}. ${data} ${horario} - ${cliente} (${procedimento}) [${status}]`,
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
  console.log("\nBuscando clientes disponíveis...");
  try {
    const clientesResult = await fazerRequisicao("GET", "/clientes");
    if (clientesResult.statusCode === 200) {
      let clientes = [];
      if (clientesResult.data && clientesResult.data.data) {
        clientes = clientesResult.data.data;
      } else if (Array.isArray(clientesResult.data)) {
        clientes = clientesResult.data;
      }

      if (clientes.length > 0) {
        console.log("\nClientes disponíveis:");
        clientes.forEach((cliente, index) => {
          console.log(`${index + 1}. ${cliente.nome}`);
        });
      }
    }
  } catch (error) {
    console.log("Não foi possível listar clientes:", error.message);
  }

  const data = await perguntar("\nData (YYYY-MM-DD): ");
  const horario = await perguntar("Horário (HH:MM:SS): ");
  const cliente_nome = await perguntar("Nome do cliente: ");
  const procedimento_nome = await perguntar("Nome do procedimento: ");
  const funcionario_nome = await perguntar("Nome do funcionário: ");

  try {
    const resultado = await fazerRequisicao("POST", "/agenda", {
      horario,
      data,
      status: "agendado",
      cliente_nome,
      procedimento_nome,
      funcionario_nome,
    });

    console.log("\nResposta da API:");
    console.log("Status:", resultado.statusCode);

    if (resultado.statusCode === 201) {
      console.log("Agendamento criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("Não foi possível criar o agendamento:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function cancelarAgendamento() {
  console.log("\nBuscando agendamentos...");
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
          const id = item.id_agenda || item.id;
          const data = item.data || item.data_agendamento;
          const horario = item.horario || item.hora;
          const cliente =
            item.cliente || item.cliente_nome || item.nome_cliente;
          const status = item.status || item.estado;

          if (id) {
            console.log(
              `ID: ${id} | ${data} ${horario} - ${cliente} [${status}]`,
            );
          }
        });
      } else {
        console.log("Nenhum agendamento encontrado.");
        await aguardarEnter();
        await menuAgenda();
        return;
      }
    } else {
      console.log("Erro ao buscar agendamentos:", resultado.data);
    }
  } catch (error) {
    console.log("Erro ao buscar agendamentos:", error.message);
  }

  const id = await perguntar("\nID do agendamento para cancelar: ");

  try {
    const resultado = await fazerRequisicao("PATCH", `/agenda/${id}/status`, {
      status: "cancelado",
    });

    console.log("\nResposta da API:");
    console.log("Status:", resultado.statusCode);

    if (resultado.statusCode === 200) {
      console.log("Agendamento cancelado com sucesso!");
    } else {
      console.log("Erro ao cancelar agendamento:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function concluirAgendamento() {
  const id = await perguntar("ID do agendamento para concluir: ");

  try {
    const resultado = await fazerRequisicao("PATCH", `/agenda/${id}/status`, {
      status: "concluído",
    });

    console.log("\nResposta da API:");
    console.log("Status:", resultado.statusCode);

    if (resultado.statusCode === 200) {
      console.log("Agendamento marcado como concluído!");
    } else {
      console.log("Erro:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuAgenda();
}

async function menuFuncionarios() {
  console.clear();
  console.log("MENU FUNCIONÁRIOS:");
  console.log("1. Listar funcionários");
  console.log("2. Criar funcionário");
  console.log("3. Voltar");
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
      await mostrarMenu();
      break;
    default:
      console.log("Opção inválida!");
      await aguardarEnter();
      await menuFuncionarios();
  }
}

async function listarFuncionarios() {
  console.log("\nListando funcionários...");
  try {
    const resultado = await fazerRequisicao("GET", "/funcionarios");

    if (resultado.statusCode === 200) {
      console.log("Funcionários encontrados:\n");

      let funcionarios = [];
      if (resultado.data && resultado.data.data) {
        funcionarios = resultado.data.data;
      } else if (Array.isArray(resultado.data)) {
        funcionarios = resultado.data;
      }

      if (funcionarios.length > 0) {
        funcionarios.forEach((func, index) => {
          console.log(
            `${index + 1}. ID: ${func.id_fun} | Nome: ${func.nome} | Tipo: ${func.tipo} | Endereço: ${func.endereco}`,
          );
        });
        console.log(`\nTotal: ${funcionarios.length} funcionários`);
      } else {
        console.log("Nenhum funcionário encontrado.");
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
  console.log("\nCriar novo funcionário:");
  const nome = await perguntar("Nome: ");
  const data_nascimento = await perguntar("Data nascimento (YYYY-MM-DD): ");
  const endereco = await perguntar("Endereço: ");
  const tipo = await perguntar("Tipo (maquiadora/cabeleireira/manicure): ");

  try {
    const resultado = await fazerRequisicao("POST", "/funcionarios", {
      nome,
      data_nascimento,
      endereco,
      tipo,
    });

    if (resultado.statusCode === 201) {
      console.log("Funcionário criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("Não foi possível criar o funcionário:", resultado.data);
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
  console.log("3. Voltar");
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
      await mostrarMenu();
      break;
    default:
      console.log("Opção inválida!");
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
            `${index + 1}. ID: ${proc.id_procedimento} | Nome: ${proc.nome} | Preço: R$ ${proc.preco} | Duração: ${proc.duracao}`,
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
  const preco = await perguntar("Preço: ");
  const duracao = await perguntar("Duração (HH:MM:SS): ");

  try {
    const resultado = await fazerRequisicao("POST", "/procedimentos", {
      nome,
      preco,
      duracao,
    });

    console.log("\nResposta da API:");
    console.log("Status:", resultado.statusCode);

    if (resultado.statusCode === 201) {
      console.log("\nProcedimento criado com sucesso!");
      console.log("Dados:", JSON.stringify(resultado.data, null, 2));
    } else {
      console.log("Não foi possível criar o procedimento:", resultado.data);
    }
  } catch (error) {
    console.log("Erro:", error.message);
  }
  await aguardarEnter();
  await menuProcedimentos();
}

async function aguardarEnter() {
  console.log("Pressione Enter para continuar...");
  await perguntar("");
}

(async () => {
  try {
    await fazerRequisicao("GET", "/clientes");
    console.log("Conectado à API com sucesso!");
  } catch (error) {
    console.log("Não foi possível conectar à API. Verifique:");
  }

  await aguardarEnter();
  await mostrarMenu();
})();
