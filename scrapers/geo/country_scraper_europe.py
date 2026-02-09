from bs4 import BeautifulSoup

# 1. THE TRANSLATION DICTIONARY
# Maps the official English names (from CoE website) to Hungarian
country_map = {
    "Albania": "Albánia",
    "Andorra": "Andorra",
    "Armenia": "Örményország",
    "Austria": "Ausztria",
    "Azerbaijan": "Azerbajdzsán",
    "Belgium": "Belgium",
    "Bosnia and Herzegovina": "Bosznia-Hercegovina",
    "Bulgaria": "Bulgária",
    "Croatia": "Horvátország",
    "Cyprus": "Ciprus",
    "Czechia": "Csehország",
    "Denmark": "Dánia",
    "Estonia": "Észtország",
    "Finland": "Finnország",
    "France": "Franciaország",
    "Georgia": "Grúzia",
    "Germany": "Németország",
    "Greece": "Görögország",
    "Hungary": "Magyarország",
    "Iceland": "Izland",
    "Ireland": "Írország",
    "Italy": "Olaszország",
    "Latvia": "Lettország",
    "Liechtenstein": "Liechtenstein",
    "Lithuania": "Litvánia",
    "Luxembourg": "Luxemburg",
    "Malta": "Málta",
    "Republic of Moldova": "Moldova",
    "Monaco": "Monaco",
    "Montenegro": "Montenegró",
    "Netherlands": "Hollandia",
    "North Macedonia": "Észak-Macedónia",
    "Norway": "Norvégia",
    "Poland": "Lengyelország",
    "Portugal": "Portugália",
    "Romania": "Románia",
    "San Marino": "San Marino",
    "Serbia": "Szerbia",
    "Slovak Republic": "Szlovákia",
    "Slovenia": "Szlovénia",
    "Spain": "Spanyolország",
    "Sweden": "Svédország",
    "Switzerland": "Svájc",
    "Türkiye": "Törökország",
    "Ukraine": "Ukrajna",
    "United Kingdom": "Egyesült Királyság"
}

def get_countries_from_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    countries = []

    # Target the specific content div
    content_div = soup.find('div', class_='journal-content-article')

    if content_div:
        for link in content_div.find_all('a'):
            # Only count links that contain an image (flag) to avoid menu links
            if link.find('img'):
                text = link.get_text(strip=True)
                
                # Basic validation
                if text and len(text) > 3 and "©" not in text:
                    countries.append(text)
    
    return sorted(list(set(countries)))

# --- MAIN EXECUTION ---
file_path = 'Member States of the Council of Europe - Portal.html'
scraped_countries = get_countries_from_html(file_path)

print(f"✅ Scraped {len(scraped_countries)} countries.")

# Prepare list for sorting: (English Value, Hungarian Label)
final_list = []

for eng_name in scraped_countries:
    # Get translation, fallback to English if missing
    hun_name = country_map.get(eng_name, eng_name) 
    final_list.append((eng_name, hun_name))

# Sort by the HUNGARIAN name (User Friendly)
final_list.sort(key=lambda x: x[1])

# --- GENERATE HTML OUTPUT ---
print("\n")
print('<select name="country" id="countrySelector" required onchange="toggleZipPattern()">')
print('    <option value="" disabled selected>Válasszon országot...</option>')

for eng, hun in final_list:
    print(f'    <option value="{eng}">{hun}</option>')

print('</select>')