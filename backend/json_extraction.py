import sqlite3
import json
import os

# Define paths
db_path = "backend\\data\\data.db"
json_folder_path = "backend\\data"

# Connect to SQLite database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Iterate over all JSON files in the folder
for file_name in os.listdir(json_folder_path):
    if file_name.endswith(".json"):
        table_name = file_name.split(".")[0]  # Use the file name (without extension) as the table name
        json_path = os.path.join(json_folder_path, file_name)

        # Load JSON data
        with open(json_path, 'r', encoding='utf-8-sig') as file:
            data = json.load(file)

        # Extract features
        features = data.get('features', [])
        if not features:
            print(f"⚠️ No features found in {file_name}. Skipping...")
            continue

        # Dynamically create table columns based on properties
        sample_properties = features[0]['properties']
        columns = ', '.join([f"{key} TEXT" for key in sample_properties.keys()])
        columns += ", coordinates TEXT"  # Add a column for coordinates

        # Create table
        cursor.execute(f"DROP TABLE IF EXISTS {table_name}")
        cursor.execute(f"CREATE TABLE {table_name} ({columns})")

        # Insert data into the table
        for obj in features:
            props = obj['properties']
            coords = obj['geometry']['coordinates']
            values = list(props.values()) + [json.dumps(coords)]  # Serialize coordinates as JSON
            placeholders = ', '.join(['?'] * len(values))
            cursor.execute(f"INSERT INTO {table_name} VALUES ({placeholders})", values)

        print(f"✅ Data from {file_name} inserted into table '{table_name}'.")

# Commit changes and close the connection
conn.commit()
conn.close()

print('✅ All JSON files have been imported into SQLite successfully!')