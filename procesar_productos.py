import requests
import json
import time
import re
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
from playwright.sync_api import sync_playwright

DESCUENTO_MINIMO = 30
JSON_OUTPUT = "productos_descuento.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "es-419,es;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

session = requests.Session()
retries = Retry(total=3, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504, 429])
session.mount('http://', HTTPAdapter(max_retries=retries))
session.mount('https://', HTTPAdapter(max_retries=retries))

# ============================================================
# TIENDAS
# ============================================================

TIENDAS_VTEX = {
    "Asics": "https://www.asics.com.ar", "Chelsea": "https://www.chelsea.com.ar",
    "Fila": "https://www.fila.com.ar", "Grid": "https://www.grid.com.ar",
    "Onsports": "https://www.onsports.com.ar", "Sportline": "https://www.sportline.com.ar",
    "Topper": "https://www.topper.com.ar", "Nike": "https://www.nike.com.ar",
    "47 Street": "https://www.47street.com.ar", "Levi's": "https://www.levi.com.ar",
    "Mimo & Co": "https://www.mimo.com.ar", "Sarkany": "https://www.rickysarkany.com",
    "StyleStore": "https://www.stylestore.com.ar", "Tascani": "https://www.tascani.com.ar",
    "XLShop": "https://www.xlshop.com.ar", "Cetrogar": "https://www.cetrogar.com.ar",
    "Compra Cierta": "https://www.compracierta.com.ar", "Coppel": "https://www.coppel.com.ar",
    "Electrolux": "https://www.electrolux.com.ar", "Fravega": "https://www.fravega.com",
    "Naldo": "https://www.naldo.com.ar", "Pardo": "https://www.pardo.com.ar",
    "Sony": "https://store.sony.com.ar", "Whirlpool": "https://www.whirlpool.com.ar",
    "Arredo": "https://www.arredo.com.ar", "Easy": "https://www.easy.com.ar",
    "La Cardeuse": "https://www.lacardeuse.com.ar", "Simmons": "https://www.simmons.com.ar",
    "Juleriaque": "https://www.juleriaque.com.ar", "Perfumería Pigmento": "https://www.perfumeriaspigmento.com.ar",
    "Rouge": "https://www.perfumeriasrouge.com",
}

TIENDAS_SHOPIFY = {
    "Reebok": "https://www.reebok.com.ar",
}

# URLs restauradas a su página principal (Evitamos errores 404)
TIENDAS_PLAYWRIGHT = [
    ("Adidas", "https://www.adidas.com.ar"),
    ("Puma", "https://ar.puma.com"),
    ("Vans", "https://www.vans.com.ar"),
    ("Montagne", "https://www.montagne.com.ar"),
    ("Megatone", "https://www.megatone.net"),
    ("Dexter", "https://www.dexter.com.ar"),
    ("Moov", "https://www.moov.com.ar"),
    ("Solo Deportes", "https://www.solodeportes.com.ar"),
    ("Anfibia", "https://www.anfibia.com.ar"),
    ("Isadora", "https://ar.isadoraonline.com"),
    ("Todomoda", "https://ar.todomoda.com"),
    ("Rodo", "https://www.rodo.com.ar"),
    ("BedTime", "https://www.bedtime.com.ar"),
    ("Sommier Center", "https://www.sommiercenter.com"),
    ("Stock Center", "https://www.stockcenter.com.ar"),
    ("Bowen", "https://www.bowen.com.ar"),
    ("Rosen", "https://www.rosen.com.ar"),
    ("Cannon", "https://www.colchonescannon.com.ar"),
    ("Parfumerie", "https://www.parfumerie.com.ar"),
]

def prod_json(id, tienda, nombre, genero, original, oferta, desc, link, imagen, talles):
    return {'id': id, 'tienda': tienda, 'nombre': nombre, 'genero': genero,
            'precio_original': original, 'precio_oferta': oferta, 'descuento': round(desc, 1),
            'link': link, 'imagen': imagen, 'talles': talles}

# ============================================================
# SCRAPERS VTEX Y SHOPIFY
# ============================================================
def scrapear_vtex(nombre_tienda, url_base, max_productos=20):
    print(f"🔎 [VTEX] {nombre_tienda}...")
    api_url = f"{url_base.rstrip('/')}/api/catalog_system/pub/products/search?O=OrderByBestDiscountDESC&_from=0&_to={max_productos-1}"
    productos = []
    try:
        r = session.get(api_url, headers=HEADERS, timeout=10)
        if r.status_code in [400, 403, 404] and "www." in url_base:
            api_url = f"{url_base.replace('www.', '').rstrip('/')}/api/catalog_system/pub/products/search?O=OrderByBestDiscountDESC&_from=0&_to={max_productos-1}"
            r = session.get(api_url, headers=HEADERS, timeout=10)
        if r.status_code not in [200, 206]: return []
        data = r.json()
        if not isinstance(data, list): return []

        for item in data:
            try:
                pid = item.get('productId')
                if not pid: continue
                nombre, link = item.get('productName', ''), item.get('link', '')
                genero = "Mujer" if any(x in nombre.lower() for x in ["mujer", "dama", "nena"]) else ("Hombre" if any(x in nombre.lower() for x in ["hombre", "varon", "nene"]) else "Unisex")
                fi = item.get('items', [{}])[0]
                offer = fi.get('sellers', [{}])[0].get('commertialOffer', {})
                img = fi.get('images', [{}])[0].get('imageUrl', "") if fi.get('images') else ""
                talles = [sku.get('name', '') for sku in item.get('items', []) if sku.get('sellers', [{}])[0].get('commertialOffer', {}).get('AvailableQuantity', 0) > 0]
                lista, oferta = float(offer.get('ListPrice', 0)), float(offer.get('Price', 0))
                
                if oferta > 0 and lista > oferta:
                    desc = ((lista - oferta) / lista) * 100
                    if desc >= DESCUENTO_MINIMO:
                        productos.append(prod_json(pid, nombre_tienda, nombre, genero, lista, oferta, desc, link, img, talles))
            except Exception: continue
    except Exception: pass
    return productos

def scrapear_shopify(nombre_tienda, url_base, max_productos=20):
    print(f"🔎 [Shopify] {nombre_tienda}...")
    productos = []
    try:
        r = session.get(f"{url_base.rstrip('/')}/products.json?page=1&limit=50", headers=HEADERS, timeout=10)
        if r.status_code == 200:
            for item in r.json().get('products', []):
                pid = str(item.get('id', ''))
                nombre = item.get('title', '')
                link = f"{url_base.rstrip('/')}/products/{item.get('handle', '')}"
                img = item.get('images', [{}])[0].get('src', '') if item.get('images') else ''
                for var in item.get('variants', []):
                    talle = var.get('title', '')
                    oferta = float(var.get('price', 0))
                    lista = float(var.get('compare_at_price', 0) or 0)
                    if oferta > 0 and lista > oferta:
                        desc = ((lista - oferta) / lista) * 100
                        if desc >= DESCUENTO_MINIMO:
                            productos.append(prod_json(f"{pid}_{var.get('id', '')}", nombre_tienda, f"{nombre} - {talle}", "Unisex", lista, oferta, desc, link, img, [talle]))
    except Exception: pass
    return productos

# ============================================================
# PLAYWRIGHT — Debugging: vemos qué responden las páginas
# ============================================================

def extraer_precio(texto):
    if not texto: return 0
    texto = texto.strip()
    if ',' in texto and texto.rfind(',') > len(texto) - 4:
        texto = texto.replace('.', '').replace(',', '.')
    else:
        texto = texto.replace(',', '').replace('.', '').strip()
    m = re.search(r'(\d+\.?\d*)', texto)
    return float(m.group(1)) if m else 0

def parsear_precios(texto):
    precios = set()
    for m in re.finditer(r'(?:ARS?\s*)?\$?\s*([\d.,]+)', texto):
        raw = m.group(1)
        try:
            if ',' in raw and raw.rfind(',') > len(raw) - 4:
                val = float(raw.replace('.', '').replace(',', '.'))
            else:
                val = float(raw.replace(',', '').replace('.', ''))
            if 100 < val < 10000000:
                precios.add(val)
        except ValueError: continue
    ordenados = sorted(precios)
    if len(ordenados) >= 2: return (ordenados[-1], ordenados[0])
    if len(ordenados) == 1: v = ordenados[0]; return (v, v)
    return (0, 0)

LOG_HTML = True  # Cambiar a False si es muy verboso

def scrapear_con_playwright():
    print("\n🔍 [Playwright] Iniciando navegador (headless=True)...")
    browser = None
    todos = []
    try:
        pw = sync_playwright().start()
        browser = pw.chromium.launch(headless=True, args=[
            "--disable-blink-features=AutomationControlled",
            "--disable-dev-shm-usage"
        ])
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1920, "height": 1080}, locale="es-AR",
        )
        page = context.new_page()

        for nombre, url in TIENDAS_PLAYWRIGHT:
            print(f"\n{'='*60}")
            print(f"📡 [{nombre}] {url}")
            extras = []

            try:
                page.goto(url, timeout=25000, wait_until="domcontentloaded")
                page.wait_for_timeout(4000)

                # DEBUG: info de la página
                titulo = page.title()
                print(f"   Título: {titulo[:100]}")
                print(f"   URL final: {page.url}")

                # DEBUG: estado HTTP
                status_code = page.evaluate("() => performance.getEntriesByType('navigation')[0]?.responseStatus || 'unknown'")
                print(f"   HTTP status: {status_code}")

                # DEBUG: primera parte del body visible
                body_text = page.evaluate("() => document.body?.innerText?.substring(0, 2000) || 'sin body'")
                print(f"   Body text (primeros 2000 chars):")
                for line in body_text.split('\n')[:30]:
                    if line.strip():
                        print(f"      > {line.strip()[:150]}")

                # DEBUG: detectar bloqueo
                if any(x in body_text.lower() for x in ["access denied", "attention required", "cloudflare",
                                                          "verify you are human", "captcha", "blocked"]):
                    print(f"   ⚠️  POSIBLE BLOQUEO detectado en {nombre}!")

                # DEBUG: guardar screenshot
                try:
                    page.screenshot(path=f"debug_{nombre.replace(' ', '_')}.png", full_page=False)
                    print(f"   📸 Screenshot guardado: debug_{nombre.replace(' ', '_')}.png")
                except Exception as e:
                    print(f"   ⚠️ Error screenshot: {e}")

                # Intentar navegar a ofertas
                for termino in ["ofertas", "sale", "outlet", "descuentos"]:
                    try:
                        link = page.get_by_role("link", name=re.compile(termino, re.I)).first
                        if link:
                            print(f"   ➡️ Click en '{termino}'...")
                            link.click(timeout=8000)
                            page.wait_for_timeout(4000)
                            print(f"   URL tras click: {page.url}")
                            body_text = page.evaluate("() => document.body?.innerText?.substring(0, 2000) || ''")
                            print(f"   Body tras click (primeros 1000 chars): {body_text[:1000]}")
                            break
                    except Exception:
                        continue

                # Scroll para cargar lazy loading
                for i in range(6):
                    page.evaluate("window.scrollBy(0, 1000)")
                    page.wait_for_timeout(1500)

                # Obtener el texto visible completo
                full_text = page.evaluate("() => document.body?.innerText || ''")
                print(f"   Total texto visible: {len(full_text)} chars")

                # Buscar precios en todo el texto
                precios_encontrados = set()
                for m in re.finditer(r'(?:ARS?\s*)?\$?\s*([\d.,]+)', full_text):
                    raw = m.group(1)
                    try:
                        if ',' in raw and raw.rfind(',') > len(raw) - 4:
                            val = float(raw.replace('.', '').replace(',', '.'))
                        else:
                            val = float(raw.replace(',', '').replace('.', ''))
                        if 100 < val < 10000000:
                            precios_encontrados.add(val)
                    except: continue
                print(f"   Precios encontrados en texto: {len(precios_encontrados)} — {sorted(precios_encontrados)[:10]}...")

                # Buscar productos en el DOM con selectores
                cards = page.query_selector_all(
                    '[class*="product"],[class*="Product"],[class*="card"],[class*="Card"],'
                    '[class*="item"],[class*="Item"],article,li[class]'
                )
                print(f"   Posibles tarjetas encontradas: {len(cards)}")

                for card in cards[:40]:
                    try:
                        text = card.inner_text()
                        if not text or len(text) < 15: continue
                        original, oferta = parsear_precios(text)
                        if original <= 0: continue

                        name_el = card.query_selector('h1,h2,h3,h4,[class*="name"],[class*="title"]')
                        nombre_prod = name_el.inner_text().strip() if name_el else text.split('\n')[0].strip()
                        if not nombre_prod or len(nombre_prod) < 3: continue

                        link_el = card if card.tag_name == "A" else card.query_selector("a")
                        href = link_el.get_attribute("href") if link_el else ""
                        if href and not href.startswith("http"):
                            href = url.rstrip("/") + href

                        img_el = card.query_selector("img")
                        img = img_el.get_attribute("src") if img_el else ""

                        desc = ((original - oferta) / original * 100) if original > oferta else 0
                        if desc < DESCUENTO_MINIMO: continue

                        pid = f"pw_{nombre}_{hash(nombre_prod) % 10000000}"
                        extras.append(prod_json(pid, nombre, nombre_prod[:80], "Unisex",
                                                original, oferta, desc, href, img, []))
                    except Exception:
                        continue

                print(f"   ✅ {len(extras)} productos con descuento ≥ {DESCUENTO_MINIMO}%")

            except Exception as e:
                print(f"   ⚠️ Error en {nombre}: {e}")

            todos.extend(extras)
            time.sleep(1.0)

        return todos
    finally:
        if browser:
            browser.close()

# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    todos = []

    for n, u in TIENDAS_VTEX.items():
        todos.extend(scrapear_vtex(n, u, max_productos=20))
        time.sleep(0.5)

    for n, u in TIENDAS_SHOPIFY.items():
        todos.extend(scrapear_shopify(n, u, max_productos=20))
        time.sleep(0.5)

    todos.extend(scrapear_con_playwright())
    todos.sort(key=lambda x: x['descuento'], reverse=True)

    with open(JSON_OUTPUT, "w", encoding="utf-8") as f:
        json.dump(todos, f, ensure_ascii=False, indent=4)

    print("\n" + "=" * 70)
    print(f"💾 PROCESO COMPLETADO. Total productos: {len(todos)}")
    print("=" * 70)