// NPC Relationship Web — SillyTavern extension
// Interactive canvas graph of NPC relationships. Auto-updates from [REL: A x B = type] tags
// in AI messages, optionally injects the whole web into the prompt. EN/RU UI.

const MODULE = 'st-relationship-web';
const INJECT_KEY = 'relationship_web';

const REL_TYPES = ['dating', 'ex', 'friends', 'enemies', 'family', 'crew', 'crush'];

const REL_COLORS = {
    dating: '#e91e8c',
    ex: '#9c27b0',
    friends: '#4caf50',
    enemies: '#f44336',
    family: '#2196f3',
    crew: '#ff9800',
    crush: '#ff80ab',
};

const L10N = {
    en: {
        title: '🕸️ Relationship Web',
        enabled: 'Enabled',
        inject: 'Inject relationship web into prompt',
        autoParse: 'Auto-parse [REL: A x B = type] tags from AI messages',
        language: 'Language',
        openWeb: 'Open web',
        addRel: 'Add relation',
        aPh: 'Name A…',
        bPh: 'Name B…',
        notePh: 'Note (optional)…',
        remove: 'Remove',
        relTypes: { dating: 'dating', ex: 'exes', friends: 'friends', enemies: 'enemies', family: 'family', crew: 'same crew', crush: 'crush' },
        injectHeader: '[Current relationships between characters (the AI must keep these consistent):',
        injectFooter: 'To update a relationship, append a tag like [REL: Name A x Name B = dating] (types: dating, ex, friends, enemies, family, crew, crush) at the very end of the reply.]',
        parsedToast: (a, b, type) => `${a} × ${b}: ${type}`,
        webTitle: 'Relationship Web',
        close: 'Close',
    },
    ru: {
        title: '🕸️ Карта отношений',
        enabled: 'Включено',
        inject: 'Внедрять карту отношений в промпт',
        autoParse: 'Авто-парсинг тегов [REL: A x B = type] из ответов ИИ',
        language: 'Язык',
        openWeb: 'Открыть карту',
        addRel: 'Добавить связь',
        aPh: 'Имя A…',
        bPh: 'Имя B…',
        notePh: 'Заметка (необязательно)…',
        remove: 'Удалить',
        relTypes: { dating: 'встречаются', ex: 'бывшие', friends: 'друзья', enemies: 'враги', family: 'семья', crew: 'одна банда', crush: 'влюблённость' },
        injectHeader: '[Текущие отношения между персонажами (ИИ обязан их учитывать):',
        injectFooter: 'Чтобы обновить отношения, добавляй тег вида [REL: Имя A x Имя B = dating] (типы: dating, ex, friends, enemies, family, crew, crush) в самом конце ответа.]',
        parsedToast: (a, b, type) => `${a} × ${b}: ${type}`,
        webTitle: 'Карта отношений',
        close: 'Закрыть',
    },
};

const DEFAULT_RELATIONS = [
    { a: 'Sabrina Mitchell', b: 'River Sinclair', type: 'dating', note: '' },
    { a: 'Thane de Nassau', b: 'Soren de Nassau', type: 'family', note: 'brothers' },
    { a: 'Rhyss Renner', b: 'Rhett Renner', type: 'family', note: 'Renner twins' },
    { a: 'Avery Renaud', b: 'Ezra Renaud', type: 'family', note: '' },
    { a: 'Vance King', b: 'Soren de Nassau', type: 'friends', note: 'Knights inner circle' },
    { a: 'Bayou Crew', b: 'Voodoo Boys', type: 'enemies', note: 'gang rivalry' },
];

const defaultSettings = {
    lang: 'en',
    enabled: true,
    inject: true,
    autoParse: true,
    relations: structuredClone(DEFAULT_RELATIONS),
};

function ctx() { return SillyTavern.getContext(); }

function settings() {
    const es = ctx().extensionSettings;
    if (!es[MODULE]) es[MODULE] = structuredClone(defaultSettings);
    for (const k of Object.keys(defaultSettings)) {
        if (es[MODULE][k] === undefined) es[MODULE][k] = structuredClone(defaultSettings[k]);
    }
    return es[MODULE];
}

function t() { return L10N[settings().lang] || L10N.en; }
function save() { ctx().saveSettingsDebounced(); }

function relLabel(type) {
    return t().relTypes[type] || type;
}

function updateInjection() {
    const s = settings();
    const c = ctx();
    if (!s.enabled || !s.inject || s.relations.length === 0) {
        c.setExtensionPrompt(INJECT_KEY, '', 1, 4);
        return;
    }
    const lines = s.relations.map(r => `- ${r.a} × ${r.b}: ${relLabel(r.type)}${r.note ? ` (${r.note})` : ''}`);
    const text = [t().injectHeader, ...lines, t().injectFooter].join('\n');
    c.setExtensionPrompt(INJECT_KEY, text, 1, 4);
}

function upsertRelation(a, b, type, note = '') {
    const s = settings();
    const found = s.relations.find(r =>
        (r.a.toLowerCase() === a.toLowerCase() && r.b.toLowerCase() === b.toLowerCase()) ||
        (r.a.toLowerCase() === b.toLowerCase() && r.b.toLowerCase() === a.toLowerCase()));
    if (found) {
        found.type = type;
        if (note) found.note = note;
    } else {
        s.relations.push({ a, b, type, note });
    }
    save();
    renderRelations();
    updateInjection();
    drawWeb();
}

function parseMessage(messageId) {
    const s = settings();
    if (!s.enabled || !s.autoParse) return;
    const c = ctx();
    const message = c.chat[messageId];
    if (!message || message.is_user || message.is_system) return;

    const re = /\[REL:\s*([^\]=]+?)\s*[x×]\s*([^\]=]+?)\s*=\s*(\w+)\s*\]/gi;
    let match;
    let changed = false;
    while ((match = re.exec(message.mes)) !== null) {
        const [, a, b, typeRaw] = match;
        const type = typeRaw.toLowerCase();
        if (!REL_TYPES.includes(type)) continue;
        upsertRelation(a.trim(), b.trim(), type);
        toastr.info(t().parsedToast(a.trim(), b.trim(), relLabel(type)), t().title);
        changed = true;
    }
    if (changed) {
        message.mes = message.mes.replace(re, '').trimEnd();
        c.updateMessageBlock?.(messageId, message);
        save();
    }
}

// ---------- Canvas rendering ----------

function nodesFromRelations() {
    const names = new Set();
    for (const r of settings().relations) {
        names.add(r.a);
        names.add(r.b);
    }
    return [...names];
}

function drawWeb() {
    const canvas = document.getElementById('rweb_canvas');
    if (!canvas) return;
    const g = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    g.clearRect(0, 0, W, H);

    const nodes = nodesFromRelations();
    if (!nodes.length) return;
    const cx = W / 2;
    const cy = H / 2;
    const R = Math.min(W, H) / 2 - 70;
    const pos = {};
    nodes.forEach((name, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        pos[name] = { x: cx + R * Math.cos(angle), y: cy + R * Math.sin(angle) };
    });

    // edges
    g.lineWidth = 2;
    g.font = '10px sans-serif';
    for (const r of settings().relations) {
        const p1 = pos[r.a];
        const p2 = pos[r.b];
        if (!p1 || !p2) continue;
        g.strokeStyle = REL_COLORS[r.type] || '#888';
        g.beginPath();
        g.moveTo(p1.x, p1.y);
        g.lineTo(p2.x, p2.y);
        g.stroke();
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        g.fillStyle = REL_COLORS[r.type] || '#888';
        g.fillText(relLabel(r.type), mx + 4, my - 4);
    }

    // nodes
    for (const name of nodes) {
        const p = pos[name];
        g.fillStyle = '#333';
        g.strokeStyle = '#aaa';
        g.beginPath();
        g.arc(p.x, p.y, 6, 0, 2 * Math.PI);
        g.fill();
        g.stroke();
        g.fillStyle = '#eee';
        g.font = 'bold 11px sans-serif';
        const label = name.length > 22 ? name.slice(0, 20) + '…' : name;
        const w = g.measureText(label).width;
        g.fillText(label, Math.min(Math.max(p.x - w / 2, 2), W - w - 2), p.y < cy ? p.y - 10 : p.y + 18);
    }
}

function openWebPopup() {
    $('#rweb_popup').remove();
    const html = `
    <div id="rweb_popup">
        <div id="rweb_popup_inner">
            <div id="rweb_popup_header">
                <b>${t().webTitle}</b>
                <div class="menu_button" id="rweb_close">${t().close}</div>
            </div>
            <canvas id="rweb_canvas" width="900" height="650"></canvas>
            <div id="rweb_legend">
                ${REL_TYPES.map(type => `<span><i style="background:${REL_COLORS[type]}"></i>${relLabel(type)}</span>`).join('')}
            </div>
        </div>
    </div>`;
    $('body').append(html);
    $('#rweb_close').on('click', () => $('#rweb_popup').remove());
    $('#rweb_popup').on('click', function (e) { if (e.target === this) $(this).remove(); });
    drawWeb();
}

// ---------- Settings panel ----------

function renderRelations() {
    const s = settings();
    const list = $('#rweb_relations').empty();
    s.relations.forEach((r, i) => {
        const row = $(`
            <div class="rweb-row">
                <span class="rweb-pair" title="${r.note || ''}">${r.a} × ${r.b}</span>
                <span class="rweb-type" style="color:${REL_COLORS[r.type] || '#888'}">${relLabel(r.type)}</span>
                <div class="menu_button rweb-del" title="${t().remove}">🗑️</div>
            </div>`);
        row.find('.rweb-del').on('click', () => {
            s.relations.splice(i, 1);
            save();
            renderRelations();
            updateInjection();
            drawWeb();
        });
        list.append(row);
    });
}

function renderPanel() {
    const s = settings();
    $('#rweb_panel').remove();
    const loc = t();
    const typeOptions = REL_TYPES.map(type => `<option value="${type}">${relLabel(type)}</option>`).join('');
    const html = `
    <div id="rweb_panel" class="extension_container">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>${loc.title}</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <label class="checkbox_label"><input type="checkbox" id="rweb_enabled" ${s.enabled ? 'checked' : ''}><span>${loc.enabled}</span></label>
                <label class="checkbox_label"><input type="checkbox" id="rweb_inject" ${s.inject ? 'checked' : ''}><span>${loc.inject}</span></label>
                <label class="checkbox_label"><input type="checkbox" id="rweb_autoparse" ${s.autoParse ? 'checked' : ''}><span>${loc.autoParse}</span></label>
                <div class="rweb-lang">
                    <span>${loc.language}:</span>
                    <select id="rweb_lang" class="text_pole">
                        <option value="en" ${s.lang === 'en' ? 'selected' : ''}>English</option>
                        <option value="ru" ${s.lang === 'ru' ? 'selected' : ''}>Русский</option>
                    </select>
                    <div class="menu_button" id="rweb_open">${loc.openWeb}</div>
                </div>
                <div id="rweb_relations"></div>
                <div class="rweb-add">
                    <input type="text" id="rweb_a" class="text_pole" placeholder="${loc.aPh}">
                    <input type="text" id="rweb_b" class="text_pole" placeholder="${loc.bPh}">
                    <select id="rweb_type" class="text_pole">${typeOptions}</select>
                </div>
                <div class="rweb-add">
                    <input type="text" id="rweb_note" class="text_pole" placeholder="${loc.notePh}">
                    <div class="menu_button" id="rweb_add">${loc.addRel}</div>
                </div>
            </div>
        </div>
    </div>`;
    $('#extensions_settings2').append(html);

    $('#rweb_enabled').on('change', function () { s.enabled = this.checked; save(); updateInjection(); });
    $('#rweb_inject').on('change', function () { s.inject = this.checked; save(); updateInjection(); });
    $('#rweb_autoparse').on('change', function () { s.autoParse = this.checked; save(); });
    $('#rweb_lang').on('change', function () { s.lang = this.value; save(); renderPanel(); updateInjection(); });
    $('#rweb_open').on('click', openWebPopup);
    $('#rweb_add').on('click', () => {
        const a = String($('#rweb_a').val()).trim();
        const b = String($('#rweb_b').val()).trim();
        const type = String($('#rweb_type').val());
        const note = String($('#rweb_note').val()).trim();
        if (!a || !b) return;
        upsertRelation(a, b, type, note);
        $('#rweb_a, #rweb_b, #rweb_note').val('');
    });
    renderRelations();
}

jQuery(async () => {
    const c = ctx();
    renderPanel();
    updateInjection();
    c.eventSource.on(c.eventTypes.MESSAGE_RECEIVED, parseMessage);
    c.eventSource.on(c.eventTypes.CHAT_CHANGED, updateInjection);
});
