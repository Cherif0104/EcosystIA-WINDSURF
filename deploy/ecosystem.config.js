module.exports = {
  apps: [{
    name: 'ecosystia',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DOMAIN_NAME: process.env.DOMAIN_NAME || 'ecosystia.impulcia-afrique.com'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      DOMAIN_NAME: process.env.DOMAIN_NAME || 'ecosystia.impulcia-afrique.com'
    },
    // Configuration des logs
    error_file: '/var/log/pm2/ecosystia-error.log',
    out_file: '/var/log/pm2/ecosystia-out.log',
    log_file: '/var/log/pm2/ecosystia-combined.log',
    time: true,
    
    // Configuration de redémarrage automatique
    watch: false,
    ignore_watch: ['node_modules', 'logs'],
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G',
    
    // Configuration de monitoring
    monitoring: false,
    
    // Configuration des variables d'environnement
    env_file: '.env',
    
    // Configuration du cluster
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    
    // Configuration des erreurs
    autorestart: true,
    max_memory_restart: '500M',
    
    // Configuration des hooks
    post_update: ['npm install --production'],
    
    // Configuration de la source map
    source_map_support: true,
    
    // Configuration du merge logs
    merge_logs: true,
    
    // Configuration des logs avec rotation
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    
    // Configuration des métriques
    pmx: true
  }],
  
  // Configuration du déploiement
  deploy: {
    production: {
      user: 'ecosystia',
      host: 'YOUR_SERVER_IP',
      ref: 'origin/main',
      repo: 'https://github.com/your-repo/ecosystia.git',
      path: '/var/www/ecosystia',
      'pre-deploy-local': '',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
