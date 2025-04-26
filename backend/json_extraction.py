import sqlite3
import json
import os

# Paths
db_path = "backend\\data\\data_2.db"
json_folder_path = "backend\\data"

# Connect to SQLite
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Fonction pour nettoyer les coordonnées
def clean_coordinates(coords):
    cleaned = []
    for coord in coords:
        if isinstance(coord, list):
            if len(coord) > 2:
                cleaned.append([coord[0], coord[1]])
            else:
                cleaned.append(coord)
    return cleaned

# Boucle sur tous les fichiers .json du dossier
for file_name in os.listdir(json_folder_path):
    if file_name.endswith(".json"):
        table_name = file_name.split(".")[0]
        json_path = os.path.join(json_folder_path, file_name)

        # Charger le fichier JSON
        with open(json_path, 'r', encoding='utf-8-sig') as file:
            data = json.load(file)

        features = data.get('features', [])
        if not features:
            print(f"⚠️ No features in {file_name}, skipping...")
            continue

        # Préparer les colonnes
        sample_properties = features[0]['properties']
        columns = ', '.join([f"{key} TEXT" for key in sample_properties.keys()])
        columns += ", coordinates TEXT"

        # Drop and recreate table
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        cursor.execute(f"CREATE TABLE {table_name} ({columns})")

        # Insérer les données
        for obj in features:
            props = obj['properties']
            coords = obj['geometry']['coordinates']

            # Nettoyage
            if not isinstance(coords, list) or len(coords) < 2:
                continue  # skip if invalid

            cleaned_coords = clean_coordinates(coords)

            values = list(props.values()) + [json.dumps(cleaned_coords)]
            placeholders = ', '.join(['?'] * len(values))
            cursor.execute(f"INSERT INTO {table_name} VALUES ({placeholders})", values)

        print(f"✅ Table '{table_name}' recréée proprement avec données nettoyées.")

# Commit et close
conn.commit()
conn.close()

print('🎉 Base de données entièrement recréée proprement !')
