# 🕸️ NPC Relationship Web — SillyTavern Extension

**EN:** Interactive relationship graph for large RP casts: dating, exes, friends, enemies, family, crew, crush — rendered on canvas with a color legend. Injects the whole web into the prompt so the AI keeps relationships consistent, and auto-updates when the AI emits `[REL: Name A x Name B = type]` tags (they are stripped from the visible message). UI in English or Russian.

**RU:** Интерактивный граф отношений для RP с большим кастом: встречаются, бывшие, друзья, враги, семья, банда, влюблённость — на canvas с цветовой легендой. Внедряет карту в промпт, чтобы ИИ соблюдал отношения, и автоматически обновляется по тегам `[REL: Имя A x Имя B = type]` из ответов ИИ (теги убираются из видимого текста). Интерфейс на английском или русском.

## Install / Установка

Extensions → Install extension → `https://github.com/zhungliwife-del/st-relationship-web`

Or copy this folder to `SillyTavern/data/<user>/extensions/` (ST 1.12+) / Или скопируйте папку в `SillyTavern/data/<пользователь>/extensions/`.

## Usage / Использование

Add relations in the panel (Name A, Name B, type, optional note) and click **Open web** to see the graph. Relation types / типы связей: `dating, ex, friends, enemies, family, crew, crush`.
