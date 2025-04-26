# Utiliser une image officielle Node.js avec support TypeScript
FROM node:20

# Créer un répertoire de travail
WORKDIR /app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package*.json ./

# Installer les dépendances dans le conteneur
RUN npm install

# Copier tout le reste (ton code source)
COPY . .

# Exposer le port utilisé par ton serveur (3000 si tu veux y accéder depuis l'extérieur)
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "dev"]
