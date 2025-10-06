// Système de couleurs par rôle pour l'interface utilisateur
export const ROLE_COLORS = {
  super_administrator: {
    primary: 'bg-red-600',
    primaryHover: 'hover:bg-red-700',
    primaryLight: 'bg-red-100',
    textPrimary: 'text-red-600',
    textLight: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    gradient: 'from-red-500 to-red-700',
    icon: 'fas fa-shield-alt',
    name: 'Super Admin',
    description: 'Accès complet au système'
  },
  administrator: {
    primary: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryLight: 'bg-blue-100',
    textPrimary: 'text-blue-600',
    textLight: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    gradient: 'from-blue-500 to-blue-700',
    icon: 'fas fa-user-cog',
    name: 'Administrateur',
    description: 'Gestion métier et utilisateurs'
  },
  manager: {
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryLight: 'bg-orange-100',
    textPrimary: 'text-orange-600',
    textLight: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    gradient: 'from-orange-500 to-orange-700',
    icon: 'fas fa-user-tie',
    name: 'Directeur',
    description: 'Direction et gestion stratégique'
  },
  teacher: {
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    primaryLight: 'bg-green-100',
    textPrimary: 'text-green-600',
    textLight: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    gradient: 'from-green-500 to-green-700',
    icon: 'fas fa-chalkboard-teacher',
    name: 'Enseignant',
    description: 'Gestion pédagogique'
  },
  student: {
    primary: 'bg-orange-600',
    primaryHover: 'hover:bg-orange-700',
    primaryLight: 'bg-orange-100',
    textPrimary: 'text-orange-600',
    textLight: 'text-orange-700',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800',
    gradient: 'from-orange-500 to-orange-700',
    icon: 'fas fa-graduation-cap',
    name: 'Étudiant',
    description: 'Apprentissage et portfolio'
  },
  employer: {
    primary: 'bg-purple-600',
    primaryHover: 'hover:bg-purple-700',
    primaryLight: 'bg-purple-100',
    textPrimary: 'text-purple-600',
    textLight: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    gradient: 'from-purple-500 to-purple-700',
    icon: 'fas fa-building',
    name: 'Employeur',
    description: 'Gestion des emplois et recrutement'
  },
  supervisor: {
    primary: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    primaryLight: 'bg-indigo-100',
    textPrimary: 'text-indigo-600',
    textLight: 'text-indigo-700',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-800',
    gradient: 'from-indigo-500 to-indigo-700',
    icon: 'fas fa-user-tie',
    name: 'Superviseur',
    description: 'Supervision des activités'
  },
  editor: {
    primary: 'bg-teal-600',
    primaryHover: 'hover:bg-teal-700',
    primaryLight: 'bg-teal-100',
    textPrimary: 'text-teal-600',
    textLight: 'text-teal-700',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-800',
    gradient: 'from-teal-500 to-teal-700',
    icon: 'fas fa-edit',
    name: 'Éditeur',
    description: 'Gestion éditoriale et contenus'
  },
  entrepreneur: {
    primary: 'bg-yellow-600',
    primaryHover: 'hover:bg-yellow-700',
    primaryLight: 'bg-yellow-100',
    textPrimary: 'text-yellow-600',
    textLight: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800',
    gradient: 'from-yellow-500 to-yellow-700',
    icon: 'fas fa-rocket',
    name: 'Entrepreneur',
    description: 'Création et gestion d\'entreprise'
  },
  funder: {
    primary: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    primaryLight: 'bg-emerald-100',
    textPrimary: 'text-emerald-600',
    textLight: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    gradient: 'from-emerald-500 to-emerald-700',
    icon: 'fas fa-coins',
    name: 'Financeur',
    description: 'Financement et investissement'
  },
  mentor: {
    primary: 'bg-cyan-600',
    primaryHover: 'hover:bg-cyan-700',
    primaryLight: 'bg-cyan-100',
    textPrimary: 'text-cyan-600',
    textLight: 'text-cyan-700',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800',
    gradient: 'from-cyan-500 to-cyan-700',
    icon: 'fas fa-user-graduate',
    name: 'Mentor',
    description: 'Accompagnement et conseil'
  },
  intern: {
    primary: 'bg-pink-600',
    primaryHover: 'hover:bg-pink-700',
    primaryLight: 'bg-pink-100',
    textPrimary: 'text-pink-600',
    textLight: 'text-pink-700',
    border: 'border-pink-200',
    badge: 'bg-pink-100 text-pink-800',
    gradient: 'from-pink-500 to-pink-700',
    icon: 'fas fa-user-clock',
    name: 'Stagiaire',
    description: 'Apprentissage pratique'
  },
  trainer: {
    primary: 'bg-green-600',
    primaryHover: 'hover:bg-green-700',
    primaryLight: 'bg-green-100',
    textPrimary: 'text-green-600',
    textLight: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-800',
    gradient: 'from-green-500 to-green-700',
    icon: 'fas fa-chalkboard-teacher',
    name: 'Formateur',
    description: 'Formation et développement'
  },
  implementer: {
    primary: 'bg-gray-600',
    primaryHover: 'hover:bg-gray-700',
    primaryLight: 'bg-gray-100',
    textPrimary: 'text-gray-600',
    textLight: 'text-gray-700',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-800',
    gradient: 'from-gray-500 to-gray-700',
    icon: 'fas fa-cogs',
    name: 'Implémenteur',
    description: 'Implémentation technique'
  },
  coach: {
    primary: 'bg-lime-600',
    primaryHover: 'hover:bg-lime-700',
    primaryLight: 'bg-lime-100',
    textPrimary: 'text-lime-600',
    textLight: 'text-lime-700',
    border: 'border-lime-200',
    badge: 'bg-lime-100 text-lime-800',
    gradient: 'from-lime-500 to-lime-700',
    icon: 'fas fa-running',
    name: 'Coach',
    description: 'Coaching et motivation'
  },
  facilitator: {
    primary: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    primaryLight: 'bg-amber-100',
    textPrimary: 'text-amber-600',
    textLight: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    gradient: 'from-amber-500 to-amber-700',
    icon: 'fas fa-hands-helping',
    name: 'Facilitateur',
    description: 'Facilitation et médiation'
  },
  publisher: {
    primary: 'bg-violet-600',
    primaryHover: 'hover:bg-violet-700',
    primaryLight: 'bg-violet-100',
    textPrimary: 'text-violet-600',
    textLight: 'text-violet-700',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800',
    gradient: 'from-violet-500 to-violet-700',
    icon: 'fas fa-newspaper',
    name: 'Éditeur',
    description: 'Publication et diffusion'
  },
  producer: {
    primary: 'bg-rose-600',
    primaryHover: 'hover:bg-rose-700',
    primaryLight: 'bg-rose-100',
    textPrimary: 'text-rose-600',
    textLight: 'text-rose-700',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800',
    gradient: 'from-rose-500 to-rose-700',
    icon: 'fas fa-video',
    name: 'Producteur',
    description: 'Production de contenus'
  },
  artist: {
    primary: 'bg-fuchsia-600',
    primaryHover: 'hover:bg-fuchsia-700',
    primaryLight: 'bg-fuchsia-100',
    textPrimary: 'text-fuchsia-600',
    textLight: 'text-fuchsia-700',
    border: 'border-fuchsia-200',
    badge: 'bg-fuchsia-100 text-fuchsia-800',
    gradient: 'from-fuchsia-500 to-fuchsia-700',
    icon: 'fas fa-palette',
    name: 'Artiste',
    description: 'Création artistique'
  },
  alumni: {
    primary: 'bg-slate-600',
    primaryHover: 'hover:bg-slate-700',
    primaryLight: 'bg-slate-100',
    textPrimary: 'text-slate-600',
    textLight: 'text-slate-700',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-800',
    gradient: 'from-slate-500 to-slate-700',
    icon: 'fas fa-user-graduate',
    name: 'Alumni',
    description: 'Ancien étudiant'
  }
} as const;

export type RoleType = keyof typeof ROLE_COLORS;

export const getRoleConfig = (role: string) => {
  return ROLE_COLORS[role as RoleType] || ROLE_COLORS.student;
};

export const getRoleBadge = (role: string) => {
  const config = getRoleConfig(role);
  return {
    className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.badge}`,
    icon: config.icon,
    name: config.name
  };
};
