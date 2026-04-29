import csv
import json

def convert():
    words = []
    # Open your CSV (make sure the filename matches exactly)
    with open('my_progress.csv', mode='r', encoding='utf-8') as f:
        # We use delimiter='\t' if you copied from Excel/Calc, 
        # or delimiter=',' if it's a true CSV. 
        # Most LibreOffice CSVs use commas.
        reader = csv.DictReader(f) 
        for row in reader:
            words.append({
                "id": row['ID'].strip(),
                "de": row['DE'].strip(),
                "ka": row['KA'].strip(),
                "gender": row['GENDER'].strip().lower(),
                "example": row['EXAMPLE'].strip(),
                "book": row['BOOK'].strip(),
                "lesson": row['LESSON'].strip(),
                "level": 1, # All words start at Level 1
                "date": row['DATE'].strip()
            })

    with open('vocabulary_master.json', 'w', encoding='utf-8') as f:
        json.dump(words, f, ensure_ascii=False, indent=2)
    print(f"Done! Created vocabulary_master.json with {len(words)} words.")

convert()