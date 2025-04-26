# Utiliser une image officielle Node.js
FROM node:20

# Créer le dossier de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json en premier
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le reste (ton code source)
COPY . .

# Exposer le port que Vite utilise (par défaut 5173)
EXPOSE 5173

# Lancer Vite en mode développement
CMD ["npm", "run", "dev"]
