export default {
  "date": {
    "now": "Agora mesmo",
    "hoursAgo": "{hours}h atrás",
    "yesterday": "Ontem",
    "daysAgo": "{days} dias atrás"
  },
  nav: {
    home: 'Início',
    board: 'Quadro',
    myBoards: 'Meus Quadros',
    features: 'Recursos',
    pricing: 'Preços',
    testimonials: 'Depoimentos',
    login: 'Entrar',
    signUp: 'Cadastre-se Grátis'
  },
  boardStatistics: {
    totalColumns: 'Total de Colunas',
    totalCards: 'Total de Cards',
    totalLabels: 'Total de Labels',
    totalLikes: 'Total de Likes',
    totalDislikes: 'Total de Dislikes',
    totalComments: 'Total de Comentarios',
    boardSummary: 'Resumo do Board',
    boardSummaryRegenerateButton: 'Gerar',
    boardSummaryAIText: 'Gerado por IA com base na atividade e no conteúdo do quadro',
    teamMembers: 'Membros do Board',
    labelsDistribution: 'Distribuição das Labels',
    engagementMetrics: 'Métricas de Engajamento',
    commentsPerCard: 'Comentários por Card',
    labelsPerCards: 'Labels por Card',
    notSupportTitle: 'Desculpe',
    notSupport: 'Este board não suporta as estatísticas.'
  },
  myBoards: {
    title: 'Meus Quadros',
    titleParticipate: 'Quadros que participo',
    createBoard: 'Criar Novo Quadro',
    members: 'membros',
    columns: 'colunas',
    items: 'itens',
    search: {
      placeholder: 'Buscar quadros...',
      clear: 'Limpar busca',
      results: 'Mostrando {count} de {total} quadros para "{query}"',
      showAll: 'Mostrar Todos os Quadros',
      noResults: 'Nenhum quadro encontrado',
      noResultsDesc: 'Nenhum quadro corresponde à sua busca por "{query}". Tente um termo diferente.'
    },
    emptyState: {
      title: 'Nenhum quadro ainda',
      description: 'Crie seu primeiro quadro para começar a organizar seus projetos.',
      cta: 'Criar Seu Primeiro Quadro'
    },
    actions: {
      view: 'Ver Quadro',
      delete: 'Excluir Quadro',
      statistics: 'Estatísticas do Quadro'
    },
    deleteModal: {
      title: 'Excluir Quadro',
      message: 'Tem certeza que deseja excluir "{board}"? Esta ação não pode ser desfeita.',
      cancel: 'Cancelar',
      confirm: 'Excluir Quadro'
    }
  },
  auth: {
    googleLogin: 'Continue com Google',
    or: 'ou',
    myProfile: 'Meu Perfil',
    welcomeBack: 'Bem-vindo de Volta',
    createAccount: 'Criar Conta',
    startJourney: 'Comece sua jornada conosco',
    enterEmail: 'Digite seu email para receber um código de verificação',
    email: 'Endereço de email',
    fullName: 'Nome completo',
    continue: 'Continuar',
    verify: 'Verificar',
    newUser: 'Novo usuário?',
    signUp: 'Cadastre-se',
    signIn: 'Entrar',
    alreadyHaveAccount: 'Você já possui uma conta. Por favor realize o login.',
    otpSent: 'Enviamos um código de verificação para',
    resendCode: 'Reenviar código',
    resendIn: 'Reenviar código em',
    changeEmail: 'Alterar email',
    invalidOTP: 'Código de verificação inválido',
    verificationSuccess: 'Verificação bem-sucedida',
    phone: 'Número de telefone',
    invalidPhone: 'Por favor, insira um número de telefone válido',
    logout: 'Sair',
  },
  hero: {
    myBoard: 'Meu Quadro',
    new: 'Novo: IA integrada para produtividade máxima',
    title: 'Visualize seu Fluxo de Trabalho com',
    subtitle: 'Trabalho visível, resultados incríveis. Simplifique sua gestão com nosso quadro Kanban',
    getStarted: 'Começar Agora',
    watchDemo: 'Ver Demonstração',
    subtitle_footer: 'É um quadro web moderno, aplicativo de código aberto baseado em colunas e cartões.',
    textVariations: [
      "Visualize seu Fluxo de Trabalho com",
      "Organize suas Tarefas com",
      "Gerencie seus Projetos com",
      "Colabore com sua Equipe usando",
      "Aumente sua Produtividade com"
    ]
  },
  features: {
    title: 'Recursos que tornam seu fluxo de trabalho mais suave',
    subtitle: 'Tudo que você precisa para gerenciar projetos com eficácia e aumentar a produtividade',
    coming: "Em breve",
    taskManagement: {
      title: 'Gestão de Retrospectivas',
      description: 'Personalize e gerencie retrospectivas de forma intuitiva para otimizar a colaboração do time.'
    },
    teamCollaboration: {
      title: 'Colaboração em Equipe',
      description: 'Trabalhe em conjunto com atualizações do board em tempo real.'
    },
    customization: {
      title: 'Quadros Personalizáveis',
      description: 'Crie fluxos de trabalho personalizados que se adequem aos processos únicos da sua equipe.'
    },
    analytics: {
      title: 'Análise dos Quadros',
      description: 'Obtenha insights sobre tudo o que aconteceu com os seus quadros, de forma simples e objetiva.'
    },
    voting: {
      title: 'Votação e Priorização',
      description: 'Permita que o time vote nos tópicos mais importantes para focar no que realmente precisa de atenção.'
    },
    anonymous: {
      title: 'Modo Anônimo',
      description: 'Dê mais liberdade ao time permitindo feedbacks honestos e sem pressões.'
    },
    ai: {
      title: 'Inteligência Artificial',
      description: 'Com ajuda da nossa IA, seu fluxo de trabalho nos quadros ficam ainda mais produtivos.'
    },

  },
  pricing: {
    title: 'Preços simples e transparentes',
    subtitle: 'Sem taxas ocultas, sem surpresas. Escolha o plano que funciona para você.',
    free: {
      name: 'Gratuito',
      description: 'O plano perfeito',
      price: 'R$0',
      period: ' sempre gratuito',
      button: 'Começar Agora',
      feat1: 'Boards Ilimitados',
      feat2: 'Membros do time ilimitados',
    },
    features: {
      unlimited: 'Quadros ilimitados',
      teamMembers: 'Até {count} membros da equipe',
      unlimitedMembers: 'Membros ilimitados',
      boardSummaryAi: "Resumo do quadro com IA",
      unlimitedTemplates: "Acesso a todos modelos"
    }
  },
  testimonials: {
    title: 'O que nossos clientes dizem',
    subtitle: 'Confiado por milhares de equipes em todo o mundo'
  },
  cta: {
    title: 'Pronto para transformar seu fluxo de trabalho?',
    subtitle: 'Identifique desafios, alinhe expectativas e evolua constantemente.',
    button: 'Comece Gratuitamente'
  },
  cookies: {
    message: 'Utilizamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com o uso de cookies.',
    privacyPolicy: 'Política de Privacidade',
    accept: 'Aceitar',
    reject: 'Rejeitar'
  },
  board: {
    title: 'Quadro Kanban',
    addColumn: 'Adicionar Coluna',
    resetBoard: 'Resetar Quadro',
    newColumn: 'Nova Coluna',
    deleteColumn: 'Excluir Coluna',
    deleteColumnConfirm: 'Tem certeza que deseja excluir esta coluna e todos os seus cartões?',
    addCard: 'Adicionar Cartão',
    editCard: 'Editar Cartão',
    deleteCard: 'Excluir Cartão',
    deleteCardConfirm: 'Tem certeza que deseja excluir este cartão?',
    cardTitle: 'Título',
    cardDescription: 'Descrição',
    cardLabels: 'Etiquetas',
    save: 'Salvar',
    cancel: 'Cancelar',
    filter: 'Filtrar',
    filterAll: 'Todos os Cartões',
    filterLiked: 'Cartões Curtidos',
    filterDisliked: 'Cartões Não Curtidos',
    filterMostLiked: 'Mais Curtidos',
    filterMostDisliked: 'Menos Curtidos',
    sortDefault: 'Ordenação padrão',
    sortByLikes: 'Ordenação por likes',
    sortByDislikes: 'Ordenação por dislikes',
    archiveCard: 'Arquivar Card',
    unarchiveCard: 'Restaurar Card',
    showArchived: 'Arquivados',
    hideArchived: 'Ocultar Arquivados',
    settings: 'Configurações do Quadro',
    settingsTheme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    settingsShowLike: 'Exibir Votação nos cards',
    settingsShowVisibility: 'Exibir Opção Visibilidade dos cards',
    settingsShowAuthorCard: 'Exibir Autor do Card',
    settingsShowTitle: 'Exibir Titulo',
    settingsShowDescription: 'Exibir Descrição',
    settingsShowTags: 'Exibir Etiquetas',
    settingsGeneral: 'Geral',
    settingsVisibility: 'Visibilidade',
    settingsPermissions: 'Permissões',
    settingsBoardConfiguration: 'Configuração do Quadro',
    settingsBoardTitle: 'Título do Quadro',
    settingsBoardDescription: 'Descrição do Quadro',
    settingsBoardVisibility: 'Visibilidade do Quadro',
    settingsPublic: 'Público',
    settingsPublicDescription: 'Qualquer pessoa com o link pode visualizar este quadro',
    settingsPrivate: 'Privado',
    settingsPrivateDescription: 'Apenas membros vinculados ao board podem visualizar e acessar',
    accessDenied: 'Acesso negado: Este board é privado e você não é membro.',
    settingsAdditionalOptions: 'Opções Adicionais',
    settingsMemberPermissions: 'Permissões de Membros',
    settingsMembersCanAddCards: 'Membros podem adicionar cartões',
    settingsMembersCanEditCards: 'Membros podem editar cartões',
    settingsMembersCanDeleteCards: 'Membros podem excluir cartões',
    settingsMembersCanAddColumns: 'Membros podem adicionar colunas',
    settingsMembersCanInvite: 'Membros podem convidar outros',
    settingsBoardMembers: 'Membros do Quadro',
    settingsOwner: 'Proprietário',
    settingsAdmin: 'Administrador',
    settingsMember: 'Membro',
    settingsViewer: 'Visualizador',
    settingsInviteMember: 'Convidar Membro',
    settingsUserNotFound: 'Usuário não encontrado na base de dados.',
    settingsUserAlreadyMember: 'Este usuário já é membro do board.',
    settingsErrorInvite: 'Erro ao convidar membro. Tente novamente mais tarde.',
    settingsAIHelpBoardTitle: 'Ajuda de IA para Título do Quadro',
    settingsAIHelpBoardDescription: 'Ajuda de IA para Descrição do Quadro',
    emptyState: {
      title: 'Hora de começar',
      description: 'Começe criando as colunas do seu board',
      cta: 'Criar Primeira Coluna'
    },
    aiAssist: {
      title: "Assistente de IA",
      chatInputLabel: "Pergunte qualquer coisa sobre o quadro...",
      quickQuestionsText: "Perguntas rápidas",
      justNow: "Agora mesmo",
      "greeting": "👋 Olá! Sou a Kira sua assistente de IA para este quadro Kanban.",
      "helpIntro": "Posso te ajudar com:",
      "items": {
        "progress": "Analisar o progresso do seu quadro",
        "suggestions": "Sugerir melhorias",
        "questions": "Responder perguntas sobre as tarefas",
        "tips": "Oferecer dicas de produtividade"
      },
      "questions": {
        "boardProgress": {
          "label": "Progresso do Quadro",
          "message": "Como está o progresso do meu quadro?"
        },
        "bottlenecks": {
          "label": "Gargalos",
          "message": "Existem gargalos no meu fluxo de trabalho?"
        },
        "suggestions": {
          "label": "Sugestões",
          "message": "Quais melhorias você sugere?"
        },
        "teamPerformance": {
          "label": "Desempenho da Equipe",
          "message": "Como está o desempenho da minha equipe?"
        },
        "boardSummary": {
          "label": "Resumo do quadro",
          "message": "Poderia gerar um resumo geral do meu quadro?"
        }
      }
    },
    demo: {
      alert: "Este ambiente é de demostração. Todos os dados serão excluídos em 30 minutos. Crie uma conta gratuita para acessar todas as funcionalidades."
    }
  },
  footer: {
    boards: {
      title: 'Quadros',
      link1: 'Meus Boards',
      link2: 'Novo Board'
    },
    account: {
      title: 'Conta',
      link1: 'Login',
      link2: 'Criar Conta',
    },
    terms: {
      title: 'Termos',
      link1: 'Política de Privacidade',
      link2: 'Termos de Uso',
    },
    status: {
      title: 'Status/Ajuda',
      link1: 'Algum problema?',
      link2: 'API Status'
    },
    copyright: '© 2025 KanbanFlex.'
  },
  language: {
    en: 'English',
    'pt-BR': 'Português'
  },
  templates: {
    name: 'Modelo',
    chooseStart: 'Escolha como começar',
    blankBoard: {
      title: 'Começar do Zero',
      description: 'Crie um quadro em branco e personalize conforme suas necessidades'
    },
    useTemplate: {
      title: 'Usar um Modelo',
      description: 'Escolha entre nossos modelos pré-construídos para começar rapidamente'
    },
    popularTemplates: 'Modelos Populares',
    types: {
      blankBoard: {
        name: 'Titulo do Board',
        description: 'Board em branco'
      },
      sprintRetrospective: {
        name: 'Retrospectiva de Sprint',
        description: 'Planeje e execute retrospectivas de sprint',
        columns: {
          first: 'O que foi bem',
          second: 'O que não foi tão bem',
          third: 'Ações de melhoria / Faça um Elogio',
        }
      },
      projectManagement: {
        name: 'Gestão de Projetos',
        description: 'Acompanhe tarefas, marcos e progresso da equipe',
        columns: {
          first: 'Backlog',
          second: 'A Fazer',
          third: 'Em Andamento',
          fourth: 'Revisão',
          fifth: 'Concluído',
        }
      },
      developmentSprint: {
        name: 'Sprint de Desenvolvimento',
        description: 'Gerencie sprints de desenvolvimento de software',
        columns: {
          first: 'Backlog da Sprint',
          second: 'Em Desenvolvimento',
          third: 'Revisão de Código',
          fourth: 'Teste de QA',
          fifth: 'Concluído',
        }
      },
      okrTracking: {
        name: 'Acompanhamento de OKRs',
        description: 'Acompanhe objetivos e resultados-chave',
        columns: {
          first: 'Objetivos',
          second: 'Resultados Chave',
          third: 'Iniciativas',
          fourth: 'Concluído',
        }
      },
      contentCalendar: {
        name: 'Calendário de Conteúdo',
        description: 'Planeje e agende a criação de conteúdo',
        columns: {
          first: 'Ideias de Conteúdo',
          second: 'Escrevendo',
          third: 'Editando',
          fourth: 'Revisando',
          fifth: 'Publicado',
        }
      },
      bugTracking: {
        name: 'Rastreamento de Bugs',
        description: 'Acompanhe e gerencie problemas de software',
        columns: {
          first: 'Reportado',
          second: 'Reproduzir',
          third: 'Em Andamento',
          fourth: 'Testando',
          fifth: 'Corrigido',
        }
      },
      productLaunch: {
        name: 'Lançamento de Produto',
        description: 'Planeje e execute lançamentos de produtos',
        columns: {
          first: 'Planejamento',
          second: 'Em Andamento',
          third: 'Revisão',
          fourth: 'Aprovado',
          fifth: 'Lançado',
        }
      },
      demo: {
        name: 'Minhas publicações de artigo',
        card1: {
          title: 'Artigo sobre tendências da indústria',
          description: '👨‍💻 Escrever um artigo sobre as tendências da indústria',
          labels: 'Tendências, Blog, Estudo'
        },
        card2: {
          title: 'Artigo sobre tendências da WEB3',
          description: 'Escrever um artigo sobre as tendências da WEB3',
          labels: 'Pesquisa, Blog, WEB3'
        },
        card3: {
          title: 'Artigo sobre visão computacional',
          description: 'Escrever um artigo sobre visão computacional',
          labels: 'Pesquisa, Blog, Estudo'
        },
        card4: {
          title: 'Artigo sobre IA',
          description: 'Escrever um artigo sobre inteligência artifical',
          labels: 'Pesquisa, Blog, Estudo, IA'
        }
      }
    }
  },
  myProfile: {
    accessLogs: 'Logs de Acesso',
    profile: 'Meu Perfil',
    myPlan: 'Meu Plano',
    register: 'Cadastro',
    login: 'Login',
    accept: 'Concordo com os temos da',
    save: 'Salvar Alterações',
    delete: 'Solicitar',
    success: 'Sucesso',
    saveProfile: 'Salvo com sucesso.',
    errorSaveProfile: 'Error ao salvar.',
    confirmDelete: 'Excluir Conta',
    deleteWarning: 'Tem certeza que deseja excluir sua conta? Isso irá desativar sua conta e você não poderá mais acessar o sistema.',
    deleteIrreversible: 'Esta ação não pode ser desfeita!',
    cancel: 'Cancelar',
    confirmDeleteBtn: 'Excluir Conta',
    accountDeactivated: 'Sua conta foi desativada com sucesso.',
    errorDeactivating: 'Erro ao desativar sua conta. Por favor, tente novamente.',
    freePlan: 'Plano Gratuito',
    freePlanDescription: 'Plano básico com recursos limitados',
    storageUsage: 'Uso do Armazenamento',
    storageRemaining: 'Restante:',
    planFeatures: 'Recursos do Plano',
    feature1: '1GB de armazenamento',
    feature2: 'Acesso básico aos recursos',
    feature3: 'Suporte por email',
    upgradePlan: 'Atualizar Plano',
    upgradeDescription: 'Obtenha mais espaço e recursos com nossos planos premium.',
    comingSoon: 'Em Breve',
    manageFiles: 'Gerenciar Arquivos',
    viewAllFiles: 'Ver Todos os Arquivos',
    manageFilesDescription: 'Visualize, baixe ou remova seus arquivos enviados'
  },
  myAttachments: {
    title: 'Meus Arquivos',
    backToProfile: 'Voltar ao Perfil',
    fileName: 'Nome do Arquivo',
    fileType: 'Tipo',
    fileSize: 'Tamanho',
    uploadDate: 'Data de Upload',
    actions: 'Ações',
    storageUsed: 'Armazenamento Usado',
    attachedToBoard: 'Anexado ao quadro',
    downloadStarted: 'Download iniciado',
    deleteSuccess: 'Arquivo removido com sucesso',
    search: {
      placeholder: 'Buscar arquivos...',
      noResults: 'Nenhum arquivo encontrado',
      noResultsDesc: 'Nenhum arquivo corresponde à sua busca por "{query}". Tente um termo diferente.',
      showAll: 'Mostrar Todos os Arquivos',
      results: 'Mostrando {count} arquivo(s) para "{query}"'
    },
    emptyState: {
      title: 'Nenhum arquivo ainda',
      description: 'Você ainda não enviou nenhum arquivo. Os arquivos enviados nos quadros aparecerão aqui.'
    },
    deleteModal: {
      title: 'Remover Arquivo',
      message: 'Tem certeza que deseja remover "{fileName}"?',
      warning: 'Esta ação não pode ser desfeita!',
      cancel: 'Cancelar',
      confirm: 'Remover Arquivo'
    },
    errors: {
      loadFailed: 'Erro ao carregar arquivos',
      searchFailed: 'Erro ao buscar arquivos',
      downloadFailed: 'Erro ao baixar arquivo',
      deleteFailed: 'Erro ao remover arquivo'
    }
  },
  boardV2: {
    statistics: 'Estatísticas',
    newCard: 'Novo Card',
    newCardDescription: 'Crie um novo card para o seu quadro',
    editCardDescription: 'Atualize as informações do seu card',
    title: 'Título',
    titlePlaceholder: 'Digite o título do card...',
    description: 'Descrição',
    descriptionPlaceholder: 'Descreva os detalhes do card...',
    labels: 'Etiqueta',
    labelsPlaceholder: 'Digite uma etiqueta é pressione Enter...',
    close: 'Fechar',
    save: 'Salvar',
    search: 'Buscar board...',
    cardSearch: {
      placeholder: 'Buscar cards...',
      results: 'encontrado(s)',
      clear: 'Limpar busca',
      noResults: 'Nenhum card encontrado'
    },
    identify: 'Identifique-se',
    name: 'Nome',
    email: 'Email',
    enterAsAnonymous: 'Entrar como Anônimo',
    editBoardName: 'Editar nome do board',
    boardName: 'Nome do board',
    newColumn: 'Nova coluna',
    columnName: 'Nome da coluna',
    editColumn: 'Editar coluna',
    editCard: 'Editar card',
    comments: 'Comentários',
    noComments: 'Nenhum comentário ainda.',
    delete: 'Excluir',
    writeComment: 'Escreva um comentário...',
    addComment: 'Adicionar Comentário',
    cardHideText: 'Calma ai curioso o conteúdo do card está oculto. E lembre-se de que a curiosidade matou o gato.',
    priority: 'Prioridade',
    selectPriority: 'Selecionar prioridade',
    priorityLow: 'Baixa',
    priorityMedium: 'Média',
    priorityHigh: 'Alta',
    priorityUrgent: 'Urgente',
    dueDate: 'Data de Vencimento',
    assignedMembers: 'Membros Atribuídos',
    searchMembers: 'Buscar membros...',
    attachments: 'Anexos',
    attachment: 'Anexo',
    noAttachments: 'Nenhum anexo ainda',
    dragFilesHere: 'Arraste arquivos aqui ou clique para selecionar',
    selectFiles: 'Selecionar Arquivos',
    activity: 'Atividade',
    noActivity: 'Nenhuma atividade registrada',
    createdCard: 'Criou o card.',
    activityArchived: 'Arquivou o card.',
    activityUnarchived: 'Removeu o arquivamento do card.',
    movedCard: 'Movel o card de "{source}" para "{target}"',
    addItemPlaceholder: 'Adicionar item...',
    progress: 'Progresso',
    noChecklistItems: 'Nenhum item na lista',
    checklist: 'Checklist',
    details: 'Detalhes',
    createdOn: 'Criado em',
    lastUpdate: 'Última atualização',
    createdBy: 'Criado por',
    cardId: 'ID do Card',
    deleteCard: 'Excluir Card',
    cancel: 'Cancelar',
    createCard: 'Criar Card',
    errors: {
      oops: 'Oops...',
      nameRequired: 'Você precisa informar o seu nome!',
      emailRequired: 'Você precisa informar um email válido!',
      titleRequired: 'Você precisa informar o titulo do card!',
      columnNameRequired: 'Você precisa informar o nome da coluna!',
      descriptionRequired: 'Você precisa informar a descrição do card!',
      uploadOnlyInEdit: 'Uploads disponíveis somente ao editar um card existente',
      fileSizeExceeded: 'Arquivo {fileName} excede o tamanho máximo de {maxSize}MB',
      fileTypeNotSupported: 'Tipo de arquivo não suportado. Tipos permitidos: JPEG, JPG, PNG, WEBP, PDF, DOC, DOCX, XLSX',
      totalSizeExceeded: 'Tamanho total do upload excede o limite de {maxSize}MB',
      uploadFailed: 'Falha no upload',
      errorUploadingFile: 'Erro ao fazer upload do arquivo',
      errorDownloadingAttachment: 'Erro ao baixar anexo',
    },
    confirmations: {
      removeCard: 'Tem certeza que deseja remover este card?',
      removeColumn: 'Tem certeza que deseja remover esta coluna?',
      removeAttachment: 'Tem certeza que deseja remover este anexo?',
      archiveCard: 'Tem certeza que deseja arquivar este card?',
      yes: 'Sim',
      no: 'Não'
    },
    notifications: {
      alreadyLiked: 'Você já deu like neste card!',
      alreadyDisliked: 'Você já deu dislike neste card!',
      failedToUpdateVote: 'Falha ao atualizar voto',
      errorUpdatingVote: 'Erro ao atualizar voto',
      failedToUpdateCard: 'Falha ao atualizar o card',
      cardUpdatedSuccess: 'Card atualizado com sucesso!',
      errorUpdatingCard: 'Erro ao atualizar o card',
      boardVisibilityFailed: 'Falha ao atualizar a visibilidade do board',
      boardNowVisible: 'Board agora está visível!',
      boardNowHidden: 'Board agora está oculto!',
      errorUpdatingVisibility: 'Erro ao atualizar a visibilidade do board',
      failedToRemoveCard: 'Falha ao remover o card',
      cardRemovedSuccess: 'Card removido com sucesso!',
      errorRemovingCard: 'Erro ao remover o card',
      failedToRemoveColumn: 'Falha ao remover a coluna',
      columnRemovedSuccess: 'Coluna removida com sucesso!',
      errorRemovingColumn: 'Erro ao remover a coluna',
      failedToUpdateColumn: 'Falha ao atualizar a coluna',
      columnUpdatedSuccess: 'Coluna atualizada com sucesso!',
      errorUpdatingColumn: 'Erro ao atualizar a coluna',
      failedToAddColumn: 'Falha ao adicionar a coluna',
      columnAddedSuccess: 'Coluna adicionada com sucesso!',
      errorAddingColumn: 'Erro ao adicionar a coluna',
      failedToAddCard: 'Falha ao adicionar o card',
      cardAddedSuccess: 'Card adicionado com sucesso!',
      errorAddingCard: 'Erro ao adicionar o card',
      failedToReorderColumns: 'Falha ao reordenar as colunas',
      columnsReorderedSuccess: 'Colunas reordenadas com sucesso!',
      errorReorderingColumns: 'Erro ao reordenar as colunas',
      failedToReorderCards: 'Falha ao reordenar os cards',
      cardsReorderedSuccess: 'Cards reordenados com sucesso!',
      errorReorderingCards: 'Erro ao reordenar os cards',
      failedToMoveCard: 'Falha ao mover o card',
      cardMovedSuccess: 'Card movido com sucesso!',
      errorMovingCard: 'Erro ao mover o card',
      failedToAddComment: 'Falha ao adicionar comentário',
      commentAddedSuccess: 'Comentário adicionado com sucesso!',
      errorAddingComment: 'Erro ao adicionar comentário',
      failedToRemoveComment: 'Falha ao remover comentário',
      commentRemovedSuccess: 'Comentário removido com sucesso!',
      errorRemovingComment: 'Erro ao remover comentário',
      cardArchived: 'Card arquivado com sucesso!',
      cardUnarchived: 'Card restaurado com sucesso!',
      failedToArchiveCard: 'Falha ao arquivar o card',
      errorArchivingCard: 'Erro ao arquivar o card'
    }
  },
  createBoard: {
    success: 'Board criado com sucesso!',
    error: {
      title: 'Oops...',
      message: 'Ocorreu um erro ao criar o board!'
    }
  },
  error: {
    notFound: 'Board ou página não encontrada.',
    back: 'Voltar'
  }
};
