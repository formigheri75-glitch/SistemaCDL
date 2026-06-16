-- Script de Criação do Banco de Dados para SQL Server
-- Baseado no Diagrama de Entidade-Relacionamento fornecido

CREATE DATABASE SistemaCDL;
GO

USE SistemaCDL;
GO

-- Tabela Empresa
CREATE TABLE Empresa (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    RazaoSocial VARCHAR(255) NOT NULL,
    NomeFantasia VARCHAR(255),
    CNPJ VARCHAR(18) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Celular VARCHAR(20),
    Cidade VARCHAR(100),
    Estado VARCHAR(2),
    Endereco VARCHAR(255),
    AreaAtuacao VARCHAR(100),
    DataCadastro DATETIME DEFAULT GETDATE(),
    Senha VARCHAR(255) -- Adicionado para permitir o login, comum na Instituição
);
GO

-- Tabela Instituicao
CREATE TABLE Instituicao (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    NomeInstituicao VARCHAR(255) NOT NULL,
    CNPJ VARCHAR(18) NOT NULL UNIQUE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Celular VARCHAR(20),
    Cidade VARCHAR(100),
    Estado VARCHAR(2),
    Endereco VARCHAR(255),
    DataCadastro DATETIME DEFAULT GETDATE(),
    Senha VARCHAR(255) NOT NULL
);
GO

-- Tabela ConfirmacaoEmpresa
CREATE TABLE ConfirmacaoEmpresa (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    NomeConfirmacao VARCHAR(255),
    DataConfirmacao DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_ConfirmacaoEmpresa_Empresa FOREIGN KEY (EmpresaID) REFERENCES Empresa(ID)
);
GO

-- Tabela Desafio
CREATE TABLE Desafio (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    EmpresaID INT NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descricao TEXT,
    AreaConhecimento VARCHAR(255),
    NivelPrioridade VARCHAR(50),
    StatusDesafio VARCHAR(50) DEFAULT 'Aberto',
    DataCriacao DATETIME DEFAULT GETDATE(),
    DataLimite DATETIME,
    CONSTRAINT FK_Desafio_Empresa FOREIGN KEY (EmpresaID) REFERENCES Empresa(ID)
);
GO

-- Tabela Requisito
CREATE TABLE Requisito (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    DesafioID INT NOT NULL,
    Descricao VARCHAR(255) NOT NULL,
    CONSTRAINT FK_Requisito_Desafio FOREIGN KEY (DesafioID) REFERENCES Desafio(ID)
);
GO

-- Tabela RequisitoDesafio
CREATE TABLE RequisitoDesafio (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    DesafioID INT NOT NULL,
    DescricaoRequisito VARCHAR(255) NOT NULL,
    CONSTRAINT FK_RequisitoDesafio_Desafio FOREIGN KEY (DesafioID) REFERENCES Desafio(ID)
);
GO

-- Tabela Proposta
CREATE TABLE Proposta (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    DesafioID INT NOT NULL,
    InstituicaoID INT NOT NULL,
    Titulo VARCHAR(255) NOT NULL,
    Descricao TEXT,
    NomeArquivo VARCHAR(255),
    Arquivo VARBINARY(MAX),
    DataEnvio DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Proposta_Desafio FOREIGN KEY (DesafioID) REFERENCES Desafio(ID),
    CONSTRAINT FK_Proposta_Instituicao FOREIGN KEY (InstituicaoID) REFERENCES Instituicao(ID)
);
GO

-- Tabela Notificacao
CREATE TABLE Notificacao (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    DesafioID INT NOT NULL,
    Descricao VARCHAR(255) NOT NULL,
    Lida BIT DEFAULT 0,
    DataNotificacao DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Notificacao_Desafio FOREIGN KEY (DesafioID) REFERENCES Desafio(ID)
);
GO
