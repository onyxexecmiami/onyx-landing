# Объединение OPF-страниц — правка после находки про LEEMO/Detailed Drivers

## Действия в GitHub

1. **УДАЛИТЬ из репозитория** (Delete file): `signature-aviation-opf.html`, `atlantic-aviation-opf.html`, `fontainebleau-aviation.html`
   — они ещё не проиндексированы Google, терять нечего, но лучше убрать сейчас, а не позже
2. **Создать новый файл**: `opa-locka-airport-opf.html` — одна страница на весь OPF, с разным текстом по каждому FBO (Signature/Atlantic/Fontainebleau), не copy-paste
3. **Заменить**: `private-aviation.html` (обновлён блок "Find your FBO" — теперь 2 ссылки: MIA и единый OPF, вместо 4)
4. **Заменить**: `sitemap.xml` (3 старых URL убраны, 1 новый добавлен — итого теперь 6 новых страниц с прошлого захода, не 8)

signature-aviation-mia.html НЕ трогать — она остаётся отдельно, другой аэропорт, реально другой контент.

Всё провалидировано строгим парсером — 0 ошибок.
