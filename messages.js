const messages = {
  tela: {
    brand: "Desafios",
    menu: {
      inicio: "Início",
      notificacoes: "Notificações",
      propostas: "Propostas",
    },
    tabs: {
      todas: "Todas",
      lidas: "Lidas",
      naoLidas: "Não lidas",
    },
  },

  
  notificacoes: {
    title: "Notificações",
    subtitle: "Acompanhe os avisos e abra cada item para ver o detalhe relacionado.",
    defaultTitle: "Notificação",
    loadError: "Erro ao carregar notificações",
    empty: "Nenhuma notificação encontrada.",
    readLabel: "Lida",
    unreadLabel: "Não lida",
  },

  
  detalhesDesafio: {
    requirements: {
      title: "Requisitos obrigatórios:",
    },
    additionalInfo: {
      title: "Informações adicionais",
    },
  },


  
  nav: {
    brand: "Desafios",
    dashboard: "Dashboard",
    desafios: "Desafios",
    novoProblema: "Novo problema",
    propostas: "Propostas",
    
  },

  login: {
    title: "Bem-vindo",
    
    
    email: "Email",
    senha: "Senha",
    entrar: "Entrar",
    success: "Login realizado com sucesso!",
    redirectMessage: "Você será redirecionado para os Desafios...",
    errorPrefix: "Erro",
    connectionError: "Erro de conexão. Verifique se o servidor está rodando em",
    loading: "Entrando...",
  },

  empresaDashboard: {
    title: "Dashboard - Empresa",
    stats: {
      problemas: "Problemas Postados",
      solucoes: "Soluções Recebidas",
      selecionadas: "Selecionadas",
    },
    meusproblemas: "Meus Problemas",
    novoProblema: "Novo Problema",
  },

  criaProblema: {
    title: "Criar Novo Problema",
    titulo: "Título do Problema *",
    tituloPlaceholder: "Ex: Otimização de API REST",
    descricao: "Descrição Detalhada *",
    descricaoPlaceholder: "Descreva o problema em detalhes...",
    deadline: "Prazo (dias) *",
    categoria: "Categoria *",
    prioridade: "Prioridade *",
    seleccionarCategoria: "Selecione uma categoria",
    seleccionarPrioridade: "Selecione a prioridade",
    categorias: {
      backend: "Backend/API",
      frontend: "Frontend/UI",
      mobile: "Mobile",
      devops: "DevOps/Infraestrutura",
      data: "Data Science",
      design: "Design",
      outro: "Outro",
    },
    prioridades: {
      baixa: "Baixa",
      media: "Média",
      alta: "Alta",
      critica: "Crítica",
    },
    
    
    requisitos: "Requisitos do Projeto",
    adicionarRequisito: "+ Adicionar Requisito",
    remover: "Remover",
    publicar: "Publicar Problema",
    cancelar: "Cancelar",
    erro: "Preencha todos os campos obrigatórios!",
    sucesso: "Problema publicado com sucesso!",
  },

  detalhesProblema: {
    titulo: "Otimização de API REST",
    status: "Ativo",
    descricao: "Descrição do Problema",
    
    requisitos: "Requisitos Técnicos",
    propostas: "Propostas Recebidas",
    
    info: {
      categoria: "Categoria",
      prioridade: "Prioridade",
      prazo: "Prazo",
      propostas: "Propostas",
      dataCriacao: "Data Criação",
    },
    editar: "Editar Problema",
    voltar: "Voltar",
  },

  propostas: {
    title: "Propostas Recebidas",
    filtro: {
      label: "Filtrar por:",
      todas: "Todas",
      pendentes: "Pendentes",
      aceitas: "Aceitas",
    },
    status: {
      pending: "Pendente",
      accepted: "Aceita",
      rejected: "Rejeitada",
    },
    
    vazio: "Nenhuma proposta encontrada com os filtros selecionados.",
  },

  cadastroEmpresa: {
    title: "Cadastro de Empresa",
    badge: "Empresas",
    subtitle: "Preencha os dados abaixo para continuar.",
    description: "Cadastre sua empresa e conecte sua operação a uma plataforma feita para transformar oportunidades em resultados. Organize seus dados, amplie sua presença e acelere cada etapa com uma experiência simples e profissional.",
    brand: "Desafios CDL",
    voltarLogin: "Voltar ao login",
    kicker: "Cadastro de empresa",
    formSubtitle: "Complete os dados abaixo.",
    nome: "Nome da Empresa *",
    razaosocial: "Razao Social",
    nomefantasia: "Nome Fantasia",
    nomeContato: "Nome do Contato *",
    cnpj: "CNPJ *",
    telefone: "Telefone *",
    cidade: "Cidade",
    estado: "Estado",
    endereco: "Endereco",
    areaatuacao: "Area de Atuacao",
    email: "Email *",
    senha: "Senha (min. 6 caracteres) *",
    confirmarSenha: "Confirmar Senha *",
    cadastrar: "Cadastrar Empresa",
    cancelar: "Cancelar",
    erroEmail: "Email invalido!",
    erroSenha: "Senha deve ter no minimo 6 caracteres!",
    erroConfirm: "As senhas nao correspondem!",
    sucesso: "Empresa cadastrada com sucesso!",
    placeholderNome: "Nome completo",
    placeholderNomeFantasia: "Nome fantasia da empresa",
    placeholderRazaoSocial: "Razao social da empresa",
    placeholderCNPJ: "00.000.000/0000-00",
    placeholderTelefone: "(XX) 9XXXX-XXXX",
    placeholderCidade: "Ex: Sao Paulo",
    placeholderEstado: "Ex: SP",
    placeholderEndereco: "Rua, numero, bairro",
    placeholderAreaAtuacao: "Ex: Tecnologia, Saude, Educacao",
    placeholderEmail: "seu@email.com",
    placeholderSenha: "Digite sua senha",
    placeholderConfirmarSenha: "Confirme a senha",
    validacao: {
      campoObrigatorio: "Campo obrigatório",
      emailInvalido: "Email inválido",
      senhaCurta: "Mínimo 6 caracteres",
      senhasNaoCorrespondem: "Senhas não correspondem",
      erroGenerico: "Erro ao cadastrar empresa"
    }
  },

  cadastroInstituicao: {
    title: "Cadastro de Instituição",
    badge: "Instituições",
    subtitle: "Preencha os dados abaixo para continuar.",
    description: "Sua instituição ganha uma vitrine moderna para se conectar com desafios, fortalecer parcerias e ampliar o impacto dos projetos. Tudo em um fluxo claro, confiável e preparado para crescer com você.",
    brand: "Desafios CDL",
    voltarLogin: "Voltar ao login",
    kicker: "Cadastro de instituição",
    formSubtitle: "Preencha os campos abaixo.",
    nome: "Nome da Instituicao *",
    telefone: "Telefone *",
    cnpj: "CNPJ *",
    email: "Email *",
    senha: "Senha (min. 6 caracteres) *",
    confirmarSenha: "Confirmar Senha *",
    cidade: "Cidade",
    estado: "Estado",
    endereco: "Endereco",
    cadastrar: "Cadastrar Instituicao",
    cancelar: "Cancelar",
    sucesso: "Instituicao cadastrada com sucesso!",
    placeholderNome: "Nome da instituicao",
    placeholderTelefone: "(XX) XXXXX-XXXX",
    placeholderCNPJ: "00.000.000/0000-00",
    placeholderCidade: "Ex: Sao Paulo",
    placeholderEstado: "Ex: SP",
    placeholderEndereco: "Rua, numero, bairro",
    placeholderEmail: "seu@email.com",
    placeholderSenha: "Digite sua senha",
    placeholderConfirmarSenha: "Confirme a senha",
    validacao: {
      campoObrigatorio: "Campo obrigatório",
      emailInvalido: "Email inválido",
      senhaCurta: "Mínimo 6 caracteres",
      senhasNaoCorrespondem: "Senhas não correspondem",
      erroGenerico: "Erro ao cadastrar instituição"
    }
  },

  recuperaSenha: {
    title: "Recuperar Senha",
    badge: "Acesso",
    description: "Recupere o acesso à sua conta com segurança e rapidez. Informe seu e-mail ou telefone e siga o fluxo orientado para voltar à plataforma sem complicação.",
    brand: "Desafios CDL",
    voltarLogin: "Voltar ao login",
    kicker: "Recuperação de acesso",
    label: "Email ou Telefone *",
    
    recuperar: "Recuperar Senha",
    
    erro: "Email ou telefone inválido!",
    
    subtitulo: "Digite seu e-mail ou telefone para recuperar sua senha",
    lembrou: "Lembrou sua senha?",
  },

  alterarSenha: {
    title: "Alterar Senha",
    subtitle: "Atualize sua senha com segurança.",
    brand: "Desafios CDL",
    voltar: "Voltar",
    currentLabel: "Senha atual",
    placeholderCurrent: "Digite sua senha atual",
    newLabel: "Nova senha",
    placeholderNew: "Digite a nova senha",
    confirmLabel: "Confirmar nova senha",
    placeholderConfirm: "Confirme a nova senha",
    submit: "Alterar senha",
    sucesso: "Senha alterada com sucesso!",
    
    
  },

  dashboard: {
    title: "Dashboard",
    desafios: "Desafios",
    subtitulo: "Acompanhe os dados",
  },
  
  validacao: {
    campoObrigatorio: "Campo obrigatório",
  },

  
  footer: "2026 Sistema de Desafios CDL.",
  pages: {
    login: {
      pageTitle: "Login - Sistema de Desafios",
      homeTitle: "Conectando empresas à inovação",
      homeSubtitle:
        "Publique desafios e encontre soluções com instituições de ensino",
      loginTitle: "Bem-vindo",
      emailLabel: "Email",
      emailPlaceholder: "seu@email.com",
      senhaLabel: "Senha",
      passwordPlaceholder: "Digite sua senha",
      entrarBtn: "Entrar",
      forgotPassword: "Esqueceu sua senha?",
      noAccountPrefix: "Não tem conta?",
      signUp: "Cadastre-se",
      modalTitle: "Você deseja se cadastrar como",
      modalDivider: "ou",
      modalEmpresa: "Empresa",
      modalInstituicao: "Instituição de ensino",
    },
    telaPropostasInstituicao: {
      title: "Propostas recebidas",
      vazio: "Nenhuma proposta encontrada.",
    },
    telaInicialCoordenador: {
      desafiosDisponiveis: "Desafios disponíveis",
      propostasEmAnalise: "Propostas em análise",
      aprovadas: "Aprovadas",
      desafiosParaAnalise: "Desafios para análise",
      verNotificacoes: "Ver notificações",
    },
    telaInicialInstituicao: {
      desafiosDisponiveis: "Desafios disponíveis",
      propostasPendentes: "Propostas pendentes",
      notificacoes: "Notificações",
      verNotificacoes: "Ver notificações",
    },
    telaPropostasCoordenador: {
      minhasPropostas: "Minhas propostas",
      
      vazio: "Nenhuma proposta encontrada.",
    },
    telaDetalhesDesafioCoordenador: {
      enviarSolucao: "Enviar solução",
      verPropostas: "Ver propostas",
      emAvaliacao: "Em avaliação",
    },
    telaEnvioSolucaoCoordenador: {
      enviarSolucao: "Enviar solução",
      cancelar: "Cancelar",
      enviando: "Enviando...",
      sucesso: "Solução enviada com sucesso.",
      erro: "Erro ao enviar solução.",
    },
    telaDetalhesPropostaCoordenador: {
      editar: "Editar",
      voltar: "Voltar",
      descricaoPadrao: "Revisão da solução enviada e acompanhamento do processo de avaliação.",
    },
  },
};

window.messages = messages;


if (typeof window !== "undefined") {
  window.messages = messages;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = messages;
}


