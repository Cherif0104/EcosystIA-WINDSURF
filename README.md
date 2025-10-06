# 🚀 EcosystIA - Plateforme de Gestion Intelligente

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

```bash
# Cloner le projet
git clone https://github.com/impulcia-afrique/ecosystia.git

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp env.example .env.local
# Éditer .env.local avec vos clés

# Lancer l'application
npm run dev
```

## 📋 Configuration Requise

### Variables d'Environnement
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### Base de Données Supabase
- Table `users` avec RLS activé
- Table `system_logs` pour l'audit
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
```bash
npm run build
# Déployer le dossier dist/ sur votre VPS
```

### VPS Configuration
- **Nginx** - Serveur web
- **SSL** - Certificats HTTPS
- **Domain** - ecosystia.senegel.org
- **Monitoring** - Logs et métriques

---

**EcosystIA - L'avenir de la gestion d'entreprise au Sénégal** 🇸🇳
