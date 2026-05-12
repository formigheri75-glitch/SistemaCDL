// Centralização de textos - todas as mensagens da aplicação

const messages = {
    // Telas - Comum
    tela: {
        brand: 'Desafios',
        menu: {
            desafios: 'Desafios',
            minhasPropostas: 'Minhas propostas',
            notificacoes: 'Notificações'
        },
        tabs: {
            todas: 'Todas',
            propostas: 'Propostas',
            desafios: 'Desafios',
            propostasEmpresas: 'Propostas das empresas'
        },
        search: {
            placeholder: 'Pesquisar propostas por título, empresa ou desafio...',
            button: 'Buscar'
        },
        status: {
            emAnalise: 'Em análise',
            aceita: 'Aceita',
            rejeitada: 'Rejeitada',
            dentroPrazo: 'Dentro do prazo'
        },
        buttons: {
            verDesafio: 'Ver desafio',
            verProposta: 'Ver proposta',
            verTodos: 'Ver todos os desafios'
        }
    },

    // Tela Detalhes Desafio
    detalhesDesafio: {
        title: 'Detalhes do Desafio',
        challengeTitle: 'Inovação em Educação Digital',
        description: 'Desenvolver soluções tecnológicas para aprimorar o ensino híbrido, incluindo plataformas de aprendizado adaptativo, ferramentas de colaboração remota e sistemas de avaliação.',
        expectedOutcome: 'Protótipo funcional validado com pelo menos 100 alunos',
        submissionDate: 'Data de envio do desafio: 15/11/2024',
        requirements: {
            title: 'Requisitos obrigatórios:',
            items: [
                'Plataforma acessível (WCAG 2.1)',
                'Integração com LMS existente',
                'Painel de analytics em tempo real',
                'Suporte a dispositivos móveis'
            ]
        },
        additionalInfo: {
            title: 'Informações adicionais',
            items: [
                '<strong>Prazo final:</strong> 31/12/2024',
                '<strong>Categoria:</strong> Tecnologia educacional',
                '<strong>Propostas recebidas:</strong> 15',
                '<strong>Prioridade:</strong> Alta',
                '<strong>Investimento:</strong> Previsto para a iniciativa'
            ]
        },
        note: 'As propostas serão avaliadas pela banca até 15/01/2025'
    },

    // Tela Inicial Desafios
    telaInicialDesafios: {
        title: 'Tela Inicial - Desafios Disponíveis',
        stats: {
            desafiosDisponiveis: 'Desafios disponíveis',
            propostasEnviadas: 'Propostas enviadas',
            aprovadas: 'Aprovadas'
        },
        sectionTitle: 'Desafios disponíveis:',
        challenges: [
            {
                title: 'Inovação em Educação Digital',
                description: 'Desenvolver soluções tecnológicas para o ensino híbrido',
                date: '15/11/2024'
            },
            {
                title: 'Sustentabilidade no Campus',
                description: 'Redução de resíduos e eficiência energética',
                date: '10/11/2024'
            },
            {
                title: 'Startup de Impacto Social',
                description: 'Criação de negócios com foco em comunidades vulneráveis',
                date: '05/11/2024'
            }
        ]
    },

    // Tela Minhas Propostas
    minhasPropostas: {
        title: 'Minhas Propostas - Coordenador',
        proposals: [
            {
                title: 'Plataforma de gamificação para ensino',
                challenge: 'Inovação em Educação Digital | Empresa: TechSolutions',
                status: 'emAnalise'
            },
            {
                title: 'Sistema de compostagem inteligente',
                challenge: 'Sustentabilidade no Campus | Empresa: GreenFuture',
                status: 'emAnalise'
            },
            {
                title: 'Aplicativo de inclusão digital',
                challenge: 'Startup de Impacto Social | Empresa: SocialTech',
                status: 'aprovada'
            }
        ]
    },

    // Tela Notificações Desafios
    notificacoesDesafios: {
        title: 'Desafios - Notificações',
        notifications: [
            {
                title: 'Novo desafio: "Inovação em IA para Educação"',
                description: 'Desenvolver assistentes virtuais para personalização do ensino'
            },
            {
                title: 'Desafio "Sustentabilidade" prorrogado',
                description: 'Prazo prorrogado até 31/01/2025'
            },
            {
                title: 'Desafio "Startup de Impacto" com inscrições abertas',
                description: 'Premiação prevista para a melhor solução',
                type: 'neutral'
            },
            {
                title: 'Webinar sobre desafios de inovação',
                description: 'Evento amanhã às 10h — participe para esclarecer critérios de avaliação'
            },
            {
                title: 'Desafio "Cidades Inteligentes" recebeu 20 propostas',
                description: 'Processo de avaliação iniciará em breve'
            }
        ]
    },

    // Tela Notificações Propostas
    notificacoesPropostas: {
        title: 'Propostas - Notificações',
        notifications: [
            {
                title: 'Proposta da TechSolutions para Inovação Digital',
                description: 'Plataforma de gamificação para engajamento estudantil'
            },
            {
                title: 'Proposta da GreenFuture para Sustentabilidade no Campus',
                description: 'Sistema de compostagem e energia solar'
            },
            {
                title: 'Proposta da EduTech com documentos pendentes',
                description: 'Envie o contrato social até 20/11/2024',
                type: 'warning'
            },
            {
                title: 'Proposta da HealthInnovation para Saúde Digital',
                description: 'Aplicativo de telemedicina para comunidades rurais'
            },
            {
                title: 'Proposta da AgroTech para Inovação no Agronegócio',
                description: 'Sensores IoT para monitoramento de cultivos',
                type: 'neutral'
            }
        ]
    },

    // Tela Notificações Todas
        notificacoesTodas: {
        title: 'Todas Notificações - Coordenador',
        notificacoes: {
            novoDesafioIA: {
                title: 'Novo desafio: "Inovação em IA para Educação"',
                description: 'Desenvolver assistentes virtuais para personalização do ensino'
            },
            novaPropostaTechSolutions: {
                title: 'Proposta da TechSolutions para Inovação Digital',
                description: 'Plataforma de gamificação para engajamento estudantil'
            },
            novaPropostaEduTech: {
                title: 'Proposta da EduTech com documentos pendentes',
                description: 'Envie o contrato social até 20/11/2024'
            },
            desafioSustentabilidade: {
                title: 'Desafio "Sustentabilidade" prorrogado',
                description: 'Prazo prorrogado até 31/01/2025'
            },
            desafioStartupImpacto: {
                title: 'Desafio "Startup de Impacto" com inscrições abertas',
                description: 'Premiação prevista para a melhor solução'
            },
            webinarDesafios: {
                title: 'Webinar sobre desafios de inovação',
                description: 'Evento amanhã às 10h — participe para esclarecer critérios de avaliação'
            },
            cidadesInteligentes: {
                title: 'Desafio "Cidades Inteligentes" recebeu 20 propostas',
                description: 'Processo de avaliação iniciará em breve'
            }
        }
    },

    // Cadastro Empresa
    cadastroEmpresa: {
        title: 'Cadastro de Empresa',
        nome: 'Nome da empresa',
        nomeContato: 'Nome do contato',
        cnpj: 'CNPJ',
        telefone: 'Telefone',
        email: 'E-mail',
        senha: 'Senha',
        confirmarSenha: 'Confirmar senha',
        cadastrar: 'Cadastrar',
        erroEmail: 'E-mail inválido',
        erroSenha: 'Senha deve ter pelo menos 6 caracteres',
        erroConfirm: 'Senhas não conferem',
        sucesso: 'Empresa cadastrada com sucesso!'
    },

    // Cadastro Instituição
    cadastroInstituicao: {
        title: 'Cadastro de Instituição',
        nome: 'Nome da instituição',
        nomeContato: 'Nome do contato',
        telefone: 'Telefone',
        mec: 'Número de inscrição MEC',
        cnpj: 'CNPJ',
        email: 'E-mail',
        senha: 'Senha',
        confirmarSenha: 'Confirmar senha',
        cadastrar: 'Cadastrar',
        sucesso: 'Instituição cadastrada com sucesso!'
    },

    // Validação
    validacao: {
        campoObrigatorio: 'Campo obrigatório',
        emailInvalido: 'Email inválido',
        senhaMinima: 'Mínimo 6 caracteres',
        senhasDiferentes: 'Senhas não correspondem'
    },

    // Cria Problema
    criaProblema: {
        title: 'Criar problema',
        titulo: 'Título',
        descricao: 'Descrição',
        resultado: 'Resultado esperado',
        deadline: 'Prazo (dias)',
        categoria: 'Categoria',
        prioridade: 'Prioridade',
        tecnologias: 'Tecnologias',
        requisitos: 'Requisitos',
        seleccionarCategoria: 'Selecione uma categoria',
        seleccionarPrioridade: 'Selecione a prioridade',
        categorias: {
            backend: 'Backend',
            frontend: 'Frontend',
            mobile: 'Mobile',
            devops: 'DevOps',
            data: 'Data',
            design: 'Design',
            outro: 'Outro'
        },
        prioridades: {
            baixa: 'Baixa',
            media: 'Média',
            alta: 'Alta',
            critica: 'Crítica'
        },
        adicionarRequisito: 'Adicionar requisito',
        remover: 'Remover',
        publicar: 'Publicar',
        cancelar: 'Cancelar',
        tituloPlaceholder: 'Digite o título do problema...',
        descricaoPlaceholder: 'Descreva o problema em detalhes...',
        resultadoPlaceholder: 'Qual é o resultado esperado?',
        tecnologiasPlaceholder: 'Ex: React, Node.js, PostgreSQL (separadas por vírgula)',
        sucesso: 'Problema criado com sucesso!',
        erro: 'Erro ao criar problema. Tente novamente.'
    },
    // Navigation
    nav: {
        brand: 'Desafios',
        home: 'Início',
        dashboard: 'Dashboard',
        empresa: 'Empresa',
        instituicao: 'Instituição',
        recuperarSenha: 'Recuperar senha',
        desafios: 'Desafios',
        novoProblema: 'Novo problema',
        propostas: 'Propostas',
        sair: 'Sair'
    },

    // Home Page
    home: {
        title: 'Sistema de Desafios',
        subtitle: 'Bem-vindo à plataforma de desafios inovadora',
        cadastroEmpresa: {
            title: 'Cadastrar Empresa',
            description: 'Registre sua empresa na plataforma e comece a criar desafios.'
        },
        cadastroInstituicao: {
            title: 'Cadastrar Instituição',
            description: 'Registre sua instituição e participe dos desafios.'
        },
        dashboard: {
            title: 'Dashboard',
            description: 'Acompanhe seus desafios e resultados em tempo real.'
        },
        recuperaSenha: {
            title: 'Recuperar Senha',
            description: 'Recupere o acesso à sua conta de forma segura.'
        },
        empresaDashboard: {
            title: 'Dashboard Empresa',
            description: 'Gerencie seus problemas e receba propostas de soluções.'
        },
        criaProblema: {
            title: 'Criar Problema',
            description: 'Publique um novo desafio e receba propostas das instituições.'
        },
        detalhesProblema: {
            title: 'Detalhes do Problema',
            description: 'Visualize detalhes completos de um desafio específico.'
        },
        propostasRecebidas: {
            title: 'Propostas Recebidas',
            description: 'Acompanhe e gerencie todas as propostas recebidas.'
        },
        selecaoInstituicoes: {
            title: 'Seleção de Instituições',
            description: 'Busque e selecione instituições para seus projetos.'
        },
        detalhesProposta: {
            title: 'Detalhes da proposta',
            description: 'Analise propostas em detalhes com plano completo de implementação.'
        },
        desafios: {
            title: 'Desafios',
            description: 'Explore todos os desafios disponíveis na plataforma.'
        },
        recursos: {
            title: 'Recursos principais',
            item1: 'Criação e gerenciamento de desafios',
            item2: 'Sistema de notificações em tempo real',
            item3: 'Propostas e colaborações',
            item4: 'Dashboard com estatísticas'
        },
        botaoEntrar: 'Entrar no sistema'
    },

    // Login Page
    login: {
        title: 'Bem-vindo',
        subtitleEmpresa: 'Acesse como Empresa',
        subtitleInstituicao: 'Acesse como Instituição',
        email: 'Email',
        senha: 'Senha',
        entrar: 'Entrar',
        naoTem: 'Não tem conta?',
        criar: 'Criar agora',
        modal: {
            title: 'Selecione o tipo de conta',
            empresa: 'Criar conta Empresa',
            instituicao: 'Criar conta Instituição'
        },
        success: 'Login realizado com sucesso!',
        redirectMessage: 'Você será redirecionado para os Desafios...',
        errorPrefix: 'Erro',
        connectionError: 'Erro de conexão. Verifique se o servidor está rodando em',
        loading: 'Entrando...'
    },

    // Empresa Dashboard
    empresaDashboard: {
        title: 'Dashboard - Empresa',
        stats: {
            problemas: 'Problemas Afetos',
            solucoes: 'Soluções Recebidas',
            selecionadas: 'Selecionadas',
            implementadas: 'Implementadas'
        },
        meusproblemas: 'Meus Problemas',
        novoProblema: '+ Novo Problema',
        detalhes: 'Detalhes',
        verPropostas: 'Propostas',
        subscrições: 'Subscrições Ativas',
        prazo: 'Prazo'
    },

    // Criar Problema
    criaProblema: {
        title: 'Criar Novo Problema',
        titulo: 'Título do Problema *',
        tituloPlaceholder: 'Ex: Otimização de API REST',
        descricao: 'Descrição Detalhada *',
        descricaoPlaceholder: 'Descreva o problema em detalhes...',
        resultado: 'Resultado Esperado *',
        resultadoPlaceholder: 'Qual é o resultado que você espera obter?',
        deadline: 'Prazo (dias) *',
        categoria: 'Categoria *',
        prioridade: 'Prioridade *',
        seleccionarCategoria: 'Selecione uma categoria',
        seleccionarPrioridade: 'Selecione a prioridade',
        categorias: {
            backend: 'Backend/API',
            frontend: 'Frontend/UI',
            mobile: 'Mobile',
            devops: 'DevOps/Infraestrutura',
            data: 'Data Science',
            design: 'Design',
            outro: 'Outro'
        },
        prioridades: {
            baixa: 'Baixa',
            media: 'Média',
            alta: 'Alta',
            critica: 'Crítica'
        },
        tecnologias: 'Tecnologias Esperadas',
        tecnologiasPlaceholder: 'Ex: Node.js, React, PostgreSQL (separadas por vírgula)',
        requisitos: 'Requisitos do Projeto',
        adicionarRequisito: '+ Adicionar Requisito',
        remover: 'Remover',
        publicar: 'Publicar Problema',
        cancelar: 'Cancelar',
        erro: 'Preencha todos os campos obrigatórios!',
        sucesso: '✓ Problema publicado com sucesso!'
    },

    // Detalhes Problema
    detalhesProblema: {
        titulo: 'Otimização de API REST',
        status: 'Ativo',
        descricao: 'Descrição do Problema',
        resultado: 'Resultado Esperado',
        requisitos: 'Requisitos Técnicos',
        propostas: 'Propostas Recebidas',
        verTodas: 'Ver Todas as Propostas',
        info: {
            categoria: 'Categoria',
            prioridade: 'Prioridade',
            prazo: 'Prazo',
            propostas: 'Propostas',
            dataCriacao: 'Data Criação'
        },
        editar: 'Editar Problema',
        voltar: 'Voltar'
    },

    // Seleção Instituições
    selecaoInstituicoes: {
        title: 'Seleção de Instituições',
        buscar: 'Buscar instituição por nome...',
        botaoBuscar: 'Buscar',
        filtro: {
            todas: 'Todas',
            publicas: 'Públicas',
            privadas: 'Privadas',
            topAvaliadas: 'Top Avaliadas'
        },
        tipos: {
            publica: 'Pública',
            privada: 'Privada'
        },
        stats: {
            propostas: 'Propostas',
            rating: 'Rating',
            projetos: 'Projetos'
        },
        verPropostas: 'Ver Propostas',
        vazio: 'Nenhuma instituição encontrada. Tente ajustar seus filtros.'
    },

    // Detalhes Proposta
        detalhesProposta: {
        titulo: 'Proposta de solução',
        descricao: 'Descrição da proposta',
        planImplementacao: 'Plano de implementação',
        resultados: 'Resultados esperados',
        stackTecnologico: 'Stack tecnológico',
        equipeProjeto: 'Equipe do projeto',
        statusBadges: {
            pendente: 'Pendente',
            aceita: 'Aceita',
            rejeitada: 'Rejeitada'
        },
        info: {
            instituicao: 'Instituição',
            avaliacao: 'Avaliação',
            prazoProposta: 'Prazo proposto',
            valorProposto: 'Valor proposto',
            dataProposta: 'Data da proposta',
            status: 'Status'
        },
        aceitar: 'Aceitar proposta',
        voltar: 'Voltar',
        sucesso: 'Proposta aceita com sucesso! A equipe da instituição entrará em contato em breve.'
    },

    // Propostas
    propostas: {
        title: 'Propostas Recebidas',
        filtro: {
            label: 'Filtrar por:',
            todas: 'Todas',
            pendentes: 'Pendentes',
            aceitas: 'Aceitas'
        },
        status: {
            pending: 'Pendente',
            accepted: 'Aceita',
            rejected: 'Rejeitada'
        },
        verDetalhes: 'Ver Detalhes',
        vazio: 'Nenhuma proposta encontrada com os filtros selecionados.'
    },

    // Cadastro Empresa
    cadastroEmpresa: {
        title: 'Cadastro de Empresa',
        nome: 'Nome da Empresa *',
        nomeContato: 'Nome do Contato *',
        cnpj: 'CNPJ *',
        telefone: 'Telefone *',
        email: 'Email *',
        senha: 'Senha (min. 6 caracteres) *',
        confirmarSenha: 'Confirmar Senha *',
        cadastrar: 'Cadastrar Empresa',
        cancelar: 'Cancelar',
        erroEmail: 'Email inválido!',
        erroSenha: 'Senha deve ter no mínimo 6 caracteres!',
        erroConfirm: 'As senhas não correspondem!',
        sucesso: '✓ Empresa cadastrada com sucesso!'
    },

    // Cadastro Instituição
    cadastroInstituicao: {
        title: 'Cadastro de Instituição',
        nome: 'Nome da Instituição *',
        nomeContato: 'Nome do Contato *',
        telefone: 'Telefone *',
        mec: 'Inscrição MEC *',
        cnpj: 'CNPJ *',
        email: 'Email *',
        senha: 'Senha (min. 6 caracteres) *',
        confirmarSenha: 'Confirmar Senha *',
        cadastrar: 'Cadastrar Instituição',
        cancelar: 'Cancelar',
        sucesso: '✓ Instituição cadastrada com sucesso!'
    },

    // Recuperar Senha
    recuperaSenha: {
        title: 'Recuperar Senha',
        label: 'Email ou Telefone *',
        placeholder: 'Digite seu email ou telefone no formato (XX) XXXXX-XXXX',
        recuperar: 'Recuperar Senha',
        cancelar: 'Cancelar',
        erro: 'Email ou telefone inválido!',
        sucesso: '✓ Código enviado com sucesso! Verifique seu e-mail ou SMS.',
        subtitulo: 'Digite seu e-mail ou telefone para recuperar sua senha',
        voltarLogin: 'Voltar para o Login',
        lembrou: 'Lembrou sua senha?'
    },

    // Dashboard (Estatísticas)
    dashboard: {
        title: 'Dashboard',
        ativos: 'Ativos',
        concluidos: 'Concluídos',
        emAndamento: 'Em Andamento',
        participantes: 'Participantes',
        desafios: 'Desafios',
        desafiosAtivos: 'Desafios Ativos',
        atividades: 'Atividades Recentes',
        subtitulo: 'Acompanhe todos as métricas em tempo real'
    },

    // Page 4 (Desafios)
    page4: {
        title: 'Desafios Disponíveis',
        filtros: {
            label: 'Filtros',
            diazo: 'Dentro do prazo',
            proximoVencimento: 'Próximo vencimento',
            concluidos: 'Concluídos',
            meus: 'Meus desafios'
        },
        requisitos: 'Requisitos',
        tecnologias: 'Tecnologias',
        resultado: 'Resultado Esperado',
        info: 'Informações Importantes',
        propondoSolucao: 'Propor Solução',
        visualizarPropostas: 'Visualizar Propostas',
        notificacoes: 'Notificações Recentes',
        statusBadges: {
            dentroDoPrazo: 'DENTRO DO PRAZO',
            emAtraso: 'EM ATRASO'
        }
    },

    // Validação
    validacao: {
        campoObrigatorio: 'Campo obrigatório',
        confirmarSenha: 'Confirme a senha'
    },

    // Footer
    footer: '© 2024 Sistema de Desafios. Todos os direitos reservados.'
,
    // Page-specific strings (migrated from hardcoded HTML)
    pages: {
        login: {
            pageTitle: 'Login - Sistema de Desafios',
            homeTitle: 'Conectando empresas à inovação',
            homeSubtitle: 'Publique desafios e encontre soluções com instituições de ensino',
            emailPlaceholder: 'seu@email.com',
            passwordPlaceholder: 'Digite sua senha',
            forgotPassword: 'Esqueceu sua senha?',
            noAccountPrefix: 'Não tem conta?',
            signUp: 'Cadastre-se',
            modalTitle: 'Você deseja se cadastrar como',
            modalDivider: 'ou',
            modalEmpresa: 'Empresa',
            modalInstituicao: 'Instituição de ensino'
        },
        detalhesPropossta: {
            informacoes: 'Informações'
        }
    }
};

// Exportar para uso em módulos

if (typeof window !== 'undefined') {
    window.messages = messages;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = messages;
}

// Backward-compatible aliases for keys changed during cleanup
if (typeof messages !== 'undefined') {
    messages.detalhesPropossta = messages.detalhesProposta;
}
