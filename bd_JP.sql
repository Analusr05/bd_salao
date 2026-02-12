-- creat
CREATE TABLE funcionario (
  id_Fun SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  endereco TEXT NOT NULL,
  tipo TEXT NOT NULL
);

CREATE TABLE certificacao_maq (
  id_Fun INT REFERENCES funcionario(id_Fun),
  certificacao TEXT NOT NULL
);

CREATE TABLE certificacao_cab (
  id_Fun INT REFERENCES funcionario(id_Fun),
  certificacao TEXT NOT NULL
);

CREATE TABLE certificacao_man (
  id_Fun INT REFERENCES funcionario(id_Fun),
  certificacao TEXT NOT NULL
);

CREATE TABLE gerente (
  cod_gerente SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  data_nascimento DATE NOT NULL
);

CREATE TABLE procedimento (
  id_procedimento SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  preco INT NOT NULL,
  duracao TIME NOT NULL
);

CREATE TABLE cliente (
  id_cliente SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf VARCHAR(11) NOT NULL UNIQUE,
  telefone VARCHAR(15) NOT NULL,
  email TEXT NOT NULL UNIQUE
);

CREATE TABLE agenda (
  id_agenda SERIAL PRIMARY KEY,
  horario TIME NOT NULL,
  data DATE NOT NULL,
  status TEXT NOT NULL,
  id_cliente INT REFERENCES cliente(id_cliente),
  id_procedimento INT REFERENCES procedimento(id_procedimento),
  id_Fun INT REFERENCES funcionario(id_Fun)
);

CREATE TABLE supervisiona (
  id_Fun INT REFERENCES funcionario(id_Fun),
  cod_gerente INT REFERENCES gerente(cod_gerente)
);

-- insert
INSERT INTO funcionario (nome, data_nascimento, endereco, tipo) VALUES 
('Ana Luíza', '2004-02-20', 'Francisco Santos', 'maquiadora'),
('Keyla', '1982-05-13', 'Bocaina', 'cabeleireira'),
('Katelyn', '2006-11-17', 'Picos', 'manicure');

INSERT INTO certificacao_maq (id_Fun, certificacao) 
SELECT id_Fun, 'tecnica em maquiagem'
FROM funcionario WHERE nome = 'Ana Luíza';

INSERT INTO certificacao_cab (id_Fun, certificacao) 
SELECT id_Fun, 'tecnica em cabelo'
FROM funcionario WHERE nome = 'Keyla';

INSERT INTO certificacao_man (id_Fun, certificacao) 
SELECT id_Fun, 'tecnica em unhas'
FROM funcionario WHERE nome = 'Katelyn';

INSERT INTO gerente (nome, data_nascimento) VALUES
('Rosa', '1982-06-29'),
('Lourdes', '1981-02-19');

INSERT INTO procedimento (nome, preco, duracao) VALUES
('Maquiagem Social', 80, '01:30:00'),
('Maquiagem Noiva', 150, '02:00:00'),
('Corte Feminino', 60, '01:00:00'),
('Coloração', 120, '02:30:00'),
('Manicure Simples', 25, '00:40:00'),
('Pedicure', 30, '00:45:00'),
('Unha de Gel', 70, '01:15:00');

INSERT INTO cliente (nome, cpf, telefone, email) VALUES
('Kessia Julia', '12345678901', '11999998888', 'kessinha@email.com'),
('Rita', '98765432109', '11988887777', 'ritinha@email.com'),
('Henzo', '45678912304', '11977776666', 'henzinho@email.com'),
('Maira', '32165498707', '11966665555', 'mairinha@email.com'),
('Marco Antonio', '15975348620', '11955554444', 'marquinhos@email.com');

INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_Fun)
SELECT 
    '09:00:00', 
    '2024-12-15', 
    'agendado',
    (SELECT id_cliente FROM cliente WHERE nome = 'Kessia Julia'),
    (SELECT id_procedimento FROM procedimento WHERE nome = 'Maquiagem Noiva'),
    (SELECT id_Fun FROM funcionario WHERE nome = 'Ana Luíza');

INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_Fun)
SELECT 
    '14:00:00', 
    '2024-12-15', 
    'agendado',
    (SELECT id_cliente FROM cliente WHERE nome = 'Rita'),
    (SELECT id_procedimento FROM procedimento WHERE nome = 'Maquiagem Social'),
    (SELECT id_Fun FROM funcionario WHERE nome = 'Ana Luíza');

INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_Fun)
SELECT 
    '10:30:00', 
    '2024-12-15', 
    'concluído',
    (SELECT id_cliente FROM cliente WHERE nome = 'Maira'),
    (SELECT id_procedimento FROM procedimento WHERE nome = 'Corte Feminino'),
    (SELECT id_Fun FROM funcionario WHERE nome = 'Keyla');

INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_Fun)
SELECT 
    '16:00:00', 
    '2024-12-16', 
    'agendado',
    (SELECT id_cliente FROM cliente WHERE nome = 'Henzo'),
    (SELECT id_procedimento FROM procedimento WHERE nome = 'Coloração'),
    (SELECT id_Fun FROM funcionario WHERE nome = 'Keyla');

INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_Fun)
SELECT 
    '13:00:00', 
    '2024-12-15', 
    'agendado',
    (SELECT id_cliente FROM cliente WHERE nome = 'Marco Antonio'),
    (SELECT id_procedimento FROM procedimento WHERE nome = 'Manicure Simples'),
    (SELECT id_Fun FROM funcionario WHERE nome = 'Katelyn');

INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_Fun)
SELECT 
    '15:30:00', 
    '2024-12-16', 
    'cancelado',
    (SELECT id_cliente FROM cliente WHERE nome = 'Henzo'),
    (SELECT id_procedimento FROM procedimento WHERE nome = 'Unha de Gel'),
    (SELECT id_Fun FROM funcionario WHERE nome = 'Katelyn');

INSERT INTO supervisiona (id_Fun, cod_gerente)
SELECT 
    (SELECT id_Fun FROM funcionario WHERE nome = 'Ana Luíza'),
    (SELECT cod_gerente FROM gerente WHERE nome = 'Rosa');

INSERT INTO supervisiona (id_Fun, cod_gerente)
SELECT 
    (SELECT id_Fun FROM funcionario WHERE nome = 'Keyla'),
    (SELECT cod_gerente FROM gerente WHERE nome = 'Lourdes');

INSERT INTO supervisiona (id_Fun, cod_gerente)
SELECT 
    (SELECT id_Fun FROM funcionario WHERE nome = 'Katelyn'),
    (SELECT cod_gerente FROM gerente WHERE nome = 'Lourdes');

UPDATE agenda 
SET status = 'concluído'
WHERE id_cliente = (SELECT id_cliente FROM cliente WHERE nome = 'Marco Antonio')
  AND data = '2024-12-15'
  AND horario = '13:00:00';

UPDATE agenda 
SET status = 'cancelado'
WHERE id_cliente = (SELECT id_cliente FROM cliente WHERE nome = 'Henzo')
  AND id_procedimento = (SELECT id_procedimento FROM procedimento WHERE nome = 'Unha de Gel')
  AND data = '2024-12-16';

INSERT INTO certificacao_cab (id_Fun, certificacao)
SELECT id_Fun, 'visagismo'
FROM funcionario WHERE nome = 'Keyla';

SELECT 
    a.data,
    a.horario,
    c.nome as cliente,
    p.nome as procedimento,
    f.nome as funcionario,
    a.status
FROM agenda a
JOIN cliente c ON a.id_cliente = c.id_cliente
JOIN procedimento p ON a.id_procedimento = p.id_procedimento
JOIN funcionario f ON a.id_Fun = f.id_Fun
ORDER BY a.data, a.horario;

SELECT 
    a.data,
    a.horario,
    c.nome as cliente,
    p.nome as procedimento,
    a.status
FROM agenda a
JOIN cliente c ON a.id_cliente = c.id_cliente
JOIN procedimento p ON a.id_procedimento = p.id_procedimento
WHERE a.id_Fun = (SELECT id_Fun FROM funcionario WHERE nome = 'Ana Luíza')
ORDER BY a.data, a.horario;

INSERT INTO cliente (nome, cpf, telefone, email) VALUES
('Joao', '11122233344', '11944443333', 'joazinho@email.com');

INSERT INTO agenda (horario, data, status, id_cliente, id_procedimento, id_Fun)
SELECT 
    '17:00:00', 
    '2024-12-18', 
    'agendado',
    (SELECT id_cliente FROM cliente WHERE nome = 'Joao'),
    (SELECT id_procedimento FROM procedimento WHERE nome = 'Pedicure'),
    (SELECT id_Fun FROM funcionario WHERE nome = 'Katelyn');