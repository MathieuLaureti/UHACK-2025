import sqlite3
import json
import os

# Connexion à la base SQLite

db_path = "backend\\data\\data.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Charger le fichier JSON
json_path = "backend\\data\\ADRESSE.json"
with open(json_path, 'r', encoding='utf-8-sig') as file:
    data = json.load(file)

# Insérer les données
features = data['features']

for obj in features:
    props = obj['properties']
    coords = obj['geometry']['coordinates']

    cursor.execute('''
        INSERT INTO addresses
        (codeid, munid, numero_civ, generique, liaison, specifique, direction, adr_comple, ruesid, entiteid, longitude, latitude)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        props['CODEID'],
        props['MUNID'],
        props['NUMERO_CIV'],
        props['GENERIQUE'],
        props['LIAISON'],
        props['SPECIFIQUE'],
        props['DIRECTION'],
        props['ADR_COMPLE'],
        props['RUESID'],
        props['ENTITEID'],
        coords[0],  # longitude
        coords[1]   # latitude
    ))   
    
    
    

# Commit et fermer
conn.commit()
conn.close()

print('✅ Importation terminée avec succès dans SQLite !')
