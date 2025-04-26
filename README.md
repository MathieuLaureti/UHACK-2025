## Commandes importantes
### Run frontend 
cd frontend; npm run dev
### Run backend 
cd backend; npm run dev
### Build Docker
docker-compose build -no-cache
### starting Docker
docker-compose up

## API definition
l'API est trouvable à l'adresse : localhost:3000/api/

### localhost:3000/api/{table}
Retourne la table demandée, 1 table = 1 fichier JSON
#### liste des tables :
- ADRESSE
- COMPTAGE
- LIEU_PUBLIC
- TROTTOIR
- VOIE_PUBLIQUE

### localhost:3000/api/{table}/{id}
Retourne une ligne specifique d'une table choisi (la recherche est faite selon le CODEID)

### localhost:3000/api/{table}/{id}/{attribut}
Retourne un Attribut spécifique d'une ligne choisi sur la table de notre choix.

## Étape 0 : Problématique 
 - "Manque d’information entre les citoyens et la ville dans le processus de déneigement" (2)
#### Info supplémentaires 
•	Les déneigeurs municipaux (villes/sous-traitant) et les déneigeurs privés (commerciaux/résidentiel) doivent coexister et sont parfois même en communication pour coordonner leurs opérations quotidiennes lorsque c’est possible. Dans le meilleur des cas, les déneigeurs privés arrivent à suivre les opérateurs municipaux pour retirer les remblais générés par le déneigement des rues. Dans les moins bons cas, les déneigeurs doivent revenir sur leurs pas pour refaire le nettoyage.

•	Dans certains cas, les mesures prises par les déneigeurs privés pour que les stationnements soient libérés ont nui au déneigement des rues à cause de la présence abondante de voitures dans les rues.

## Étape 1 : Remue Méninge
Application web est plus adapter :
 - Plus accessible au grand public et plus logique qu'une application que les gens n'installerons pas (+ version mobile et pc simple)
 - Nous sommes plus à l'aise en développement Web

Feature principale : ajouter des rues en favoris afin d'être alerté seulement par les rues qui nous sont importantes (parking pour aller au travail, devant chez soi, etc.)
 
Feature principale : Calendrier pour les différentes rues favorites

Feature à voir : ajouter des trajet en favoris (pourrait également être pertinent pour trouver les voies les plus empruntées et donc à déneiger en priorité)

utilisation de leaflet pour les intraction avec la map et ajouter les favoris. (Parfait pour mobile)


Il est possible de filtrer les différents segments de la légende de couleur afin de répondre aux besoins spécifiques de l'individu. 

   Ex : l'individu peut voir si la ville applique actuellement un sel sur les routes et traiter. Si c'est le cas, ce n'est pas le moment idéal pour sortir le chien. 

   Ex : l'individu peut voir sur quelle rue il peut se stationner pour aller voir sa blonde.


## Étape 2 : Plan

### Choix des technologies 

#### Backend
 - node.js
 - express.js
 - sqlite

#### Front end
 - react.js

#### Infrastructure
 - Docker
   
### Plan

#### Étape 1
