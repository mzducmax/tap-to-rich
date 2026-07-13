import urllib.request
import urllib.parse
import re
import os

def search_google_images(query):
    url = f"https://www.google.com/search?q={urllib.parse.quote(query)}&tbm=isch"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
        
        # Google Images JSON/Script tag parsing
        # Standard regex to find image URLs
        urls = re.findall(r'\"(https://[^\"]+?\.(?:png|jpg|jpeg|webp))\"', html)
        # Filter for CDN or common image hosts
        filtered_urls = []
        for u in urls:
            if 'tiktok' in u or 'p16-webcast' in u or 'streamdps' in u or 'brofinity' in u:
                filtered_urls.append(u)
        
        # If no specific hosts, just return the first few URLs
        if not filtered_urls:
            # Let's find any img url
            img_urls = re.findall(r'https?://[^\s\"\']+\.(?:png|jpg|jpeg|webp)', html)
            return list(set(img_urls))[:15]
            
        return list(set(filtered_urls))[:15]
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []

queries = {
    "rose": "tiktok rose gift png",
    "gg": "tiktok gg gift png",
    "heart_planet": "tiktok galaxy gift png"
}

for name, q in queries.items():
    print(f"\n--- Results for {name} ---")
    urls = search_google_images(q)
    for u in urls:
        print(u)
