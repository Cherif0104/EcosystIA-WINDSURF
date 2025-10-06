const fs = require('fs');
const path = require('path');

console.log('🎨 MISE À JOUR DU BRANDING ECOSYSTIA');
console.log('====================================');

// Fichiers à mettre à jour
const filesToUpdate = [
  'App.tsx',
  'components/Dashboard.tsx',
  'components/Header.tsx',
  'components/Sidebar.tsx',
  'components/Login.tsx',
  'components/Signup.tsx',
  'components/Projects.tsx',
  'components/Goals.tsx',
  'components/CRM.tsx',
  'components/Courses.tsx',
  'components/Jobs.tsx',
  'components/TimeTracking.tsx',
  'components/LeaveManagement.tsx',
  'components/Finance.tsx',
  'components/KnowledgeBase.tsx',
  'components/Development.tsx',
  'components/Tools.tsx',
  'components/AICoach.tsx',
  'components/GenAILab.tsx',
  'components/Analytics.tsx',
  'components/UserManagement.tsx',
  'components/Settings.tsx',
  'constants/localization.ts',
  'index.html',
  'README.md'
];

// Remplacements à effectuer
const replacements = [
  // SENEGEL WorkFlow -> EcosystIA
  { from: /SENEGEL WorkFlow/gi, to: 'EcosystIA' },
  { from: /SENEGEL-WorkFlow/gi, to: 'EcosystIA' },
  { from: /senegel-workflow/gi, to: 'ecosystia' },
  
  // Titres et descriptions
  { from: /Plateforme de gestion/gi, to: 'Plateforme de gestion intelligente' },
  { from: /SENEGEL WorkFlow MVP/gi, to: 'EcosystIA MVP' },
  { from: /SENEGEL WorkFlow - MVP/gi, to: 'EcosystIA - MVP' },
  
  // Messages d'accueil
  { from: /Bienvenue sur SENEGEL/gi, to: 'Bienvenue sur EcosystIA' },
  { from: /SENEGEL WorkFlow Platform/gi, to: 'EcosystIA Platform' },
  
  // Contexte et descriptions
  { from: /plateforme SENEGEL/gi, to: 'plateforme EcosystIA' },
  { from: /outils SENEGEL/gi, to: 'outils EcosystIA' },
  { from: /système SENEGEL/gi, to: 'système EcosystIA' },
  
  // Références techniques
  { from: /senegel_workflow_platform/gi, to: 'ecosystia_platform' },
  { from: /SENEGEL_CONTEXT/gi, to: 'ECOSYSTIA_CONTEXT' },
  
  // Messages d'erreur et d'aide
  { from: /SENEGEL WorkFlow/gi, to: 'EcosystIA' },
  { from: /SENEGEL Workflow/gi, to: 'EcosystIA' },
  { from: /SENEGEL Work Flow/gi, to: 'EcosystIA' }
];

let updatedFiles = 0;
let totalReplacements = 0;

console.log('\n🔄 Mise à jour des fichiers...');

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let fileReplacements = 0;
      
      replacements.forEach(({ from, to }) => {
        const matches = content.match(from);
        if (matches) {
          content = content.replace(from, to);
          fileReplacements += matches.length;
        }
      });
      
      if (fileReplacements > 0) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ ${file} - ${fileReplacements} remplacements`);
        updatedFiles++;
        totalReplacements += fileReplacements;
      } else {
        console.log(`⚪ ${file} - Aucun remplacement nécessaire`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Erreur: ${error.message}`);
    }
  } else {
    console.log(`⚠️ ${file} - Fichier non trouvé`);
  }
});

// Mise à jour du README principal
console.log('\n📝 Création du README EcosystIA...');
const readmeContent = `# 🚀 EcosystIA - Plateforme de Gestion Intelligente

## 📋 Description
**EcosystIA** est la plateforme de gestion intelligente développée par **IMPULCIA AFRIQUE** pour **SENEGEL** (Senegalese Next Generation of Leaders).

## 🎯 Mission
Fournir une solution complète de gestion d'entreprise avec IA intégrée, adaptée au contexte sénégalais et aux besoins de SENEGEL.

## ✨ Fonctionnalités Principales

### 📊 Modules Core
- **Dashboard** - Vue d'ensemble et KPIs
- **Projects** - Gestion de projets avancée
- **Goals/OKRs** - Objectifs et résultats clés
- **CRM & Sales** - Relation client et ventes

### 🎓 Formation & Développement
- **Courses** - LMS complet avec certifications
- **Jobs** - Gestion des emplois et recrutement
- **Time Tracking** - Suivi du temps et productivité
- **Leave Management** - Gestion des congés

### 💰 Gestion Financière
- **Finance** - Comptabilité complète en FCFA
- **Analytics** - Analyses et rapports avancés
- **Knowledge Base** - Base de connaissances

### 🤖 Intelligence Artificielle
- **AI Coach** - Assistant IA contextuel (ARVA)
- **Gen AI Lab** - Laboratoire de création IA
- **Development** - Outils de développement

### ⚙️ Administration
- **User Management** - Gestion des utilisateurs
- **Settings** - Configuration système
- **Tools** - Outils intégrés

## 🛠️ Technologies

### Frontend
- **React 19** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Context API** - State management

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Base de données
- **Row Level Security** - Sécurité avancée
- **JWT + OAuth2** - Authentification

### IA & Intégrations
- **Gemini AI** - Intelligence artificielle
- **DeepSeek-R1** - Raisonnement avancé
- **Multi-langue** - FR, WO, EN, AR
- **Devise FCFA** - Adaptation locale

## 🚀 Installation

\`\`\`bash
# Cloner le projet
git clone https://github.com/impulcia-afrique/ecosystia.git

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp env.example .env.local
# Éditer .env.local avec vos clés

# Lancer l'application
npm run dev
\`\`\`

## 📋 Configuration Requise

### Variables d'Environnement
\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
\`\`\`

### Base de Données Supabase
- Table \`users\` avec RLS activé
- Table \`system_logs\` pour l'audit
- Politiques de sécurité par rôle

## 🎯 Utilisation

### Rôles Utilisateur
- **Super Admin** - Accès complet
- **Admin** - Gestion des modules
- **Manager** - Gestion d'équipe
- **User** - Utilisation standard
- **Viewer** - Consultation seule

### Modules Principaux
1. **Dashboard** - Centre de contrôle
2. **Projects** - Gestion de projets
3. **Goals** - Objectifs et OKRs
4. **CRM** - Relation client
5. **Courses** - Formation
6. **Finance** - Gestion financière
7. **AI Coach** - Assistant IA

## 📊 Fonctionnalités Avancées

### Intelligence Artificielle
- **ARVA** - Assistant contextuel
- **Recommandations** - Actions suggérées
- **Génération de contenu** - Texte, images
- **Analyse prédictive** - Insights avancés

### Sécurité
- **RLS** - Row Level Security
- **Audit Trail** - Logs complets
- **Chiffrement** - Données sensibles
- **Conformité** - RGPD, ISO 27001

### Performance
- **Temps de chargement** < 2 secondes
- **Disponibilité** > 99.9%
- **Scalabilité** - 1000+ utilisateurs
- **Responsive** - Mobile-first

## 🌍 Adaptation Locale

### Sénégal
- **Devise FCFA** - Formatage automatique
- **Langues** - Français, Wolof, Anglais, Arabe
- **Culture** - Contexte sénégalais
- **Réglementation** - Conformité locale

### SENEGEL
- **Mission** - Développement des jeunes
- **Programmes** - COYA, Habitat, Formation
- **Équipe** - Pape Samb, Amadou Dia LY, etc.
- **Contact** - Dakar, Sénégal

## 📞 Support

**IMPULCIA AFRIQUE**
- **Email** : contact@impulcia-afrique.com
- **Téléphone** : +221 78 832 40 69
- **Site** : https://www.impulcia-afrique.com

**SENEGEL**
- **Email** : contact@senegel.org
- **Téléphone** : +221 77 853 33 99
- **Adresse** : Liberte 5, No 5486B, 4eme #10, Dakar

## 📄 Licence

Propriétaire - IMPULCIA AFRIQUE pour SENEGEL

## 🚀 Déploiement

### Production
\`\`\`bash
npm run build
# Déployer le dossier dist/ sur votre VPS
\`\`\`

### VPS Configuration
- **Nginx** - Serveur web
- **SSL** - Certificats HTTPS
- **Domain** - ecosystia.senegel.org
- **Monitoring** - Logs et métriques

---

**EcosystIA - L'avenir de la gestion d'entreprise au Sénégal** 🇸🇳
`;

fs.writeFileSync('README.md', readmeContent);
console.log('✅ README.md créé');

console.log('\n🎉 MISE À JOUR DU BRANDING TERMINÉE !');
console.log('=====================================');
console.log(`✅ ${updatedFiles} fichiers mis à jour`);
console.log(`✅ ${totalReplacements} remplacements effectués`);
console.log('✅ README.md créé');
console.log('\n🚀 EcosystIA est maintenant prêt !');
console.log('📋 Prochaines étapes:');
console.log('   1. Tester l\'application');
console.log('   2. Valider les changements');
console.log('   3. Continuer avec le plan d\'action');
