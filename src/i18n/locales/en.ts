export default {
  nav: {
    home: 'Home',
    board: 'Board',
    myBoards: 'My Boards',
    features: 'Features',
    pricing: 'Pricing',
    testimonials: 'Testimonials',
    login: 'Login',
    signUp: 'Sign Up Free'
  },
  myBoards: {
    title: 'My Boards',
    createBoard: 'Create New Board',
    members: 'members',
    emptyState: {
      title: 'No boards yet',
      description: 'Create your first board to start organizing your projects.',
      cta: 'Create Your First Board'
    },
    actions: {
      view: 'View Board',
      delete: 'Delete Board'
    },
    deleteModal: {
      title: 'Delete Board',
      message: 'Are you sure you want to delete "{board}"? This action cannot be undone.',
      cancel: 'Cancel',
      confirm: 'Delete Board'
    }
  },
  auth: {
    welcomeBack: 'Welcome Back',
    createAccount: 'Create Account',
    startJourney: 'Start your journey with us',
    enterEmail: 'Enter your email to receive a verification code',
    email: 'Email address',
    fullName: 'Full name',
    continue: 'Continue',
    verify: 'Verify',
    newUser: 'New user?',
    signUp: 'Sign up',
    signIn: 'Sign in',
    alreadyHaveAccount: 'Do You is already have account, please proceed to login.',
    otpSent: 'We sent a verification code to',
    resendCode: 'Resend code',
    resendIn: 'Resend code in',
    changeEmail: 'Change email',
    invalidOTP: 'Invalid verification code',
    verificationSuccess: 'Verification successful',
    phone: 'Phone number',
    invalidPhone: 'Please enter a valid phone number',
    logout: 'Logout',
  },
  hero: {
    title: 'Visualize Your Workflow with',
    subtitle: 'The most intuitive Kanban board tool to help teams visualize work, limit work-in-progress, and maximize efficiency.',
    getStarted: 'Get Started',
    watchDemo: 'Watch Demo',
    subtitle_footer: 'Is a web modern board, open-source application based in columns and cards.',
  },
  features: {
    title: "Features that make your workflow smoother",
    subtitle: "Everything you need to manage projects effectively and boost productivity",
    coming: "Coming soon",
    taskManagement: {
      title: "Retrospective Management",
      description: "Customize and manage retrospectives intuitively to optimize team collaboration."
    },
    teamCollaboration: {
      title: "Team Collaboration",
      description: "Work together with real-time board updates."
    },
    customization: {
      title: "Customizable Boards",
      description: "Create personalized workflows that fit your team’s unique processes."
    },
    analytics: {
      title: "Analytics & Reports",
      description: "Gain insights into your team's performance with detailed analytics and custom reports."
    },
    voting: {
      title: "Voting & Prioritization",
      description: "Allow the team to vote on the most important topics to focus on what truly matters."
    },
    anonymous: {
      title: "Anonymous Mode",
      description: "Give your team more freedom by enabling honest feedback without pressure."
    }
  },
  "pricing": {
    "title": "Simple and Transparent Pricing",
    "subtitle": "No hidden fees, no surprises. Choose the plan that works for you.",
    "free": {
      "name": "Free",
      "description": "The perfect plan",
      "price": "R$0",
      "period": " always free",
      "button": "Get Started Now",
      "feat1": "Unlimited Boards",
      "feat2": "Unlimited Team Members"
    },
    "features": {
      "unlimited": "Unlimited Boards",
      "teamMembers": "Up to {count} team members",
      "unlimitedMembers": "Unlimited Members"
    }
  },
  testimonials: {
    title: 'What our customers say',
    subtitle: 'Trusted by thousands of teams worldwide'
  },
  cta: {
    title: 'Ready to transform your workflow?',
    subtitle: 'Identify challenges, align expectations and constantly evolve.',
    button: 'Get Started for Free'
  },
  cookies: {
    message: 'We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.',
    privacyPolicy: 'Privacy Policy',
    accept: 'Accept',
    reject: 'Reject'
  },
  board: {
    title: 'Kanban Board',
    addColumn: 'Add Column',
    resetBoard: 'Reset Board',
    newColumn: 'New Column',
    deleteColumn: 'Delete Column',
    deleteColumnConfirm: 'Are you sure you want to delete this column and all its cards?',
    addCard: 'Add Card',
    editCard: 'Edit Card',
    deleteCard: 'Delete Card',
    deleteCardConfirm: 'Are you sure you want to delete this card?',
    cardTitle: 'Title',
    cardDescription: 'Description',
    cardLabels: 'Labels',
    save: 'Save',
    cancel: 'Cancel',
    filter: 'Filter',
    filterAll: 'All Cards',
    filterLiked: 'Liked Cards',
    filterDisliked: 'Disliked Cards',
    filterMostLiked: 'Most Liked',
    filterMostDisliked: 'Most Disliked',
    settings: 'Board Settings',
    settingsTheme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    settingsCardLimit: 'Cards per Column Limit',
    settingsShowCardCount: 'Show Card Count',
    emptyState: {
      title: "Time to get started",
      description: "Start by creating the columns for your board",
      cta: "Create First Column"
    }
  },
  footer: {
    boards: {
      title: "Boards",
      link1: "My Boards",
      link2: "New Board"
    },
    terms: {
      title: 'Terms',
      link1: 'Privacy Policy',
      link2: 'Terms of Use',
    },
    account: {
      title: "Account",
      link1: "Login",
      link2: "Create Account"
    },
    status: {
      title: "Status/Help",
      link1: "API Status",
      link2: "Having an issue?"
    },
    "copyright": "© 2025 KanbanFlex.",
  },
  language: {
    en: 'English',
    'pt-BR': 'Português (BR)'
  },
  templates: {
    name: 'Template',
    chooseStart: 'Choose how to start',
    blankBoard: {
      title: 'Start from Scratch',
      description: 'Create a blank board and customize it to your needs'
    },
    useTemplate: {
      title: 'Use a Template',
      description: 'Choose from our pre-built templates to get started quickly'
    },
    popularTemplates: 'Popular Templates',
    types: {
      blankBoard: {
        name: 'Board Title',
        description: 'Board empty'
      },
      sprintRetrospective: {
        name: 'Sprint Retrospective',
        description: 'Plan and execute sprint retrospectives',
        columns: {
          first: 'What went well',
          second: 'To improve',
          third: 'Action Items / To do next',
        }
      },
      projectManagement: {
        name: 'Project Management',
        description: 'Track tasks, milestones, and team progress',
        columns: {
          first: 'Backlog',
          second: 'To Do',
          third: 'In Progress',
          fourth: 'Review',
          fifth: 'Done',
        }
      },
      developmentSprint: {
        name: 'Development Sprint',
        description: 'Manage software development sprints',
        columns: {
          first: 'Sprint Backlog',
          second: 'In Development',
          third: 'Code Review',
          fourth: 'QA Testing',
          fifth: 'Done',
        }
      },
      okrTracking: {
        name: 'OKR Tracking',
        description: 'Track objectives and key results',
        columns: {
          first: 'Objectives',
          second: 'Key Results',
          third: 'Initiatives',
          fourth: 'Completed',
        }
      },
      contentCalendar: {
        name: 'Content Calendar',
        description: 'Plan and schedule content creation',
        columns: {
          first: 'Content Ideas',
          second: 'Writing',
          third: 'Editing',
          fourth: 'Review',
          fifth: 'Published',
        }
      },
      bugTracking: {
        name: 'Bug Tracking',
        description: 'Track and manage software issues',
        columns: {
          first: 'Reported',
          second: 'To Reproduce',
          third: 'In Progress',
          fourth: 'Testing',
          fifth: 'Fixed',
        }
      },
      productLaunch: {
        name: 'Product Launch',
        description: 'Plan and execute product launches',
        columns: {
          first: 'Planning',
          second: 'In Progress',
          third: 'Review',
          fourth: 'Approved',
          fifth: 'Launched',
        }
      }
    }
  },
};
