// NPC Relationship Web — fandom-independent relationship and genealogy editor for SillyTavern.

const VERSION = '2.2.0';
const MODULE = 'st-relationship-web';
const INJECT_KEY = 'relationship_web';

const REL_TYPES = ['dating', 'ex', 'friends', 'enemies', 'family', 'parent', 'child', 'sibling', 'spouse', 'crew', 'crush', 'ally', 'rival'];

const REL_COLORS = {
    dating: '#e91e8c',
    ex: '#9c27b0',
    friends: '#4caf50',
    enemies: '#f44336',
    family: '#2196f3',
    parent: '#00bcd4',
    child: '#03a9f4',
    sibling: '#64b5f6',
    spouse: '#ff4081',
    crew: '#ff9800',
    crush: '#ff80ab',
    ally: '#8bc34a',
    rival: '#ff5722',
};

const L10N = {
    en: {
        title: '🕸️ Relationship Web',
        enabled: 'Enabled',
        inject: 'Inject relationships into prompt',
        autoParse: 'Auto-parse [REL: A x B = type] tags from AI messages',
        language: 'Language',
        mode: 'View mode',
        webMode: 'Relationship web',
        treeMode: 'Genealogy tree',
        openWeb: 'Open web',
        addRel: 'Add relation',
        addPerson: 'Add person',
        people: 'People',
        relations: 'Relations',
        templates: 'Templates',
        haleTpl: 'Add Hale University template',
        voodooTpl: 'Add Voodoo & Bayou template',
        clearAll: 'Clear all',
        namePh: 'Name…',
        rolePh: 'Role / group / faction…',
        personNotePh: 'Person note (optional)…',
        aPh: 'Name A…',
        bPh: 'Name B…',
        notePh: 'Relation note (optional)…',
        remove: 'Remove',
        relTypes: {
            dating: 'dating', ex: 'exes', friends: 'friends', enemies: 'enemies', family: 'family',
            parent: 'parent of', child: 'child of', sibling: 'siblings', spouse: 'spouses', crew: 'same group',
            crush: 'crush', ally: 'allies', rival: 'rivals',
        },
        injectHeader: '[Current character relationship map. Keep these facts consistent:',
        injectPeople: 'People:',
        injectRelations: 'Relationships:',
        injectFooter: 'The user can edit this map manually. To suggest an update, append [REL: Name A x Name B = type | optional note] at the end of the reply.]',
        parsedToast: (a, b, type) => `${a} × ${b}: ${type}`,
        webTitle: 'Relationship Web',
        close: 'Close',
        zoomIn: 'Zoom +',
        zoomOut: 'Zoom −',
        resetZoom: 'Fit',
        dragHint: 'Drag the map; use +/− to zoom.',
        confirmClear: 'Clear all people and relations?',
    },
    ru: {
        title: '🕸️ Карта отношений',
        enabled: 'Включено',
        inject: 'Внедрять отношения в промпт',
        autoParse: 'Авто-парсинг тегов [REL: A x B = type] из ответов ИИ',
        language: 'Язык',
        mode: 'Режим отображения',
        webMode: 'Карта отношений',
        treeMode: 'Генеалогическое дерево',
        openWeb: 'Открыть карту',
        addRel: 'Добавить связь',
        addPerson: 'Добавить персонажа',
        people: 'Персонажи',
        relations: 'Связи',
        templates: 'Шаблоны',
        haleTpl: 'Добавить шаблон Hale University',
        voodooTpl: 'Добавить шаблон Voodoo & Bayou',
        clearAll: 'Очистить всё',
        namePh: 'Имя…',
        rolePh: 'Роль / группа / фракция…',
        personNotePh: 'Заметка о персонаже…',
        aPh: 'Имя A…',
        bPh: 'Имя B…',
        notePh: 'Заметка о связи…',
        remove: 'Удалить',
        relTypes: {
            dating: 'встречаются', ex: 'бывшие', friends: 'друзья', enemies: 'враги', family: 'семья',
            parent: 'родитель', child: 'ребёнок', sibling: 'сиблинг/родня', spouse: 'супруги', crew: 'одна группа',
            crush: 'влюблённость', ally: 'союзники', rival: 'соперники',
        },
        injectHeader: '[Текущая карта персонажей и связей. ИИ обязан сохранять эти факты:',
        injectPeople: 'Персонажи:',
        injectRelations: 'Связи:',
        injectFooter: 'Пользователь может редактировать карту вручную. Чтобы предложить обновление, добавь в конце ответа [REL: Имя A x Имя B = type | необязательная заметка].]',
        parsedToast: (a, b, type) => `${a} × ${b}: ${type}`,
        webTitle: 'Карта отношений',
        close: 'Закрыть',
        zoomIn: 'Масштаб +',
        zoomOut: 'Масштаб −',
        resetZoom: 'Вписать',
        dragHint: 'Тяни карту пальцем; +/− меняют масштаб.',
        confirmClear: 'Очистить всех персонажей и связи?',
    },
};

const TEMPLATES = {
    hale: {
        people: [
            { name: 'Sabrina Mitchell', role: 'Hale University', note: 'student social circle' },
            { name: 'River Sinclair', role: 'Hale University', note: '' },
            { name: 'Thane de Nassau', role: 'de Nassau family', note: '' },
            { name: 'Soren de Nassau', role: 'de Nassau family', note: '' },
            { name: 'Rhyss Renner', role: 'Renner family', note: '' },
            { name: 'Rhett Renner', role: 'Renner family', note: '' },
            { name: 'Avery Renaud', role: 'Renaud family', note: '' },
            { name: 'Ezra Renaud', role: 'Renaud family', note: '' },
            { name: 'Vance King', role: 'Knights inner circle', note: '' },
        ],
        relations: [
            { a: 'Sabrina Mitchell', b: 'River Sinclair', type: 'dating', note: '' },
            { a: 'Thane de Nassau', b: 'Soren de Nassau', type: 'sibling', note: 'brothers' },
            { a: 'Rhyss Renner', b: 'Rhett Renner', type: 'sibling', note: 'Renner twins' },
            { a: 'Avery Renaud', b: 'Ezra Renaud', type: 'family', note: '' },
            { a: 'Vance King', b: 'Soren de Nassau', type: 'friends', note: 'Knights inner circle' },
        ],
    },
    voodoo: {
        people: [
            { name: 'Baron', role: 'Voodoo Boys', note: 'runs Club Zion and citywide influence' },
            { name: 'Leon Valentino', role: 'Bayou Crew', note: 'hotheaded leader' },
            { name: 'Voodoo Boys', role: 'faction', note: 'controls French Quarter and port influence' },
            { name: 'Bayou Crew', role: 'faction', note: 'controls bayou territory through violence and loyalty' },
            { name: 'NOPD', role: 'law enforcement', note: 'corrupt officials are split by bribes and pressure' },
            { name: 'Club Zion', role: 'neutral ground', note: 'Baron’s club under the truce' },
            { name: 'CASH Casino', role: 'neutral ground', note: 'shared money-laundering territory' },
        ],
        relations: [
            { a: 'Baron', b: 'Voodoo Boys', type: 'parent', note: 'leader / boss' },
            { a: 'Leon Valentino', b: 'Bayou Crew', type: 'parent', note: 'leader / boss' },
            { a: 'Voodoo Boys', b: 'Bayou Crew', type: 'enemies', note: 'fragile truce after the gang war' },
            { a: 'Baron', b: 'Club Zion', type: 'crew', note: 'owned and controlled by Baron' },
            { a: 'Voodoo Boys', b: 'CASH Casino', type: 'crew', note: 'shared laundering territory' },
            { a: 'Bayou Crew', b: 'CASH Casino', type: 'crew', note: 'shared laundering territory' },
            { a: 'NOPD', b: 'Voodoo Boys', type: 'ally', note: 'corrupt contacts and paid protection' },
        ],
    },
};

const defaultSettings = {
    lang: 'ru',
    enabled: true,
    inject: true,
    autoParse: true,
    mode: 'web',
    people: [],
    relations: [],
};

function clone(value) { return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value)); }
function ctx() { return SillyTavern.getContext(); }

function settings() {
    const es = ctx().extensionSettings;
    if (!es[MODULE]) es[MODULE] = clone(defaultSettings);
    for (const k of Object.keys(defaultSettings)) {
        if (es[MODULE][k] === undefined) es[MODULE][k] = clone(defaultSettings[k]);
    }
    if (!Array.isArray(es[MODULE].people)) es[MODULE].people = [];
    if (!Array.isArray(es[MODULE].relations)) es[MODULE].relations = [];
    return es[MODULE];
}

function t() { return L10N[settings().lang] || L10N.en; }
function save() { ctx().saveSettingsDebounced(); }
function relLabel(type) { return t().relTypes[type] || type; }

function normalizeName(name) { return String(name || '').trim(); }
function keyName(name) { return normalizeName(name).toLowerCase(); }

function ensurePerson(name, role = '', note = '') {
    name = normalizeName(name);
    if (!name) return;
    const s = settings();
    const existing = s.people.find(p => keyName(p.name) === keyName(name));
    if (existing) {
        if (role && !existing.role) existing.role = role;
        if (note && !existing.note) existing.note = note;
    } else {
        s.people.push({ name, role, note });
    }
}

function allPeople() {
    const map = new Map();
    for (const p of settings().people) {
        if (normalizeName(p.name)) map.set(keyName(p.name), { name: normalizeName(p.name), role: p.role || '', note: p.note || '' });
    }
    for (const r of settings().relations) {
        for (const name of [r.a, r.b]) {
            if (normalizeName(name) && !map.has(keyName(name))) map.set(keyName(name), { name: normalizeName(name), role: '', note: '' });
        }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function addPerson(name, role = '', note = '') {
    ensurePerson(name, role, note);
    save();
    renderPanel();
    updateInjection();
    drawCurrentView();
}

function upsertRelation(a, b, type, note = '') {
    a = normalizeName(a);
    b = normalizeName(b);
    type = String(type || 'friends').toLowerCase();
    if (!a || !b || !REL_TYPES.includes(type)) return;
    ensurePerson(a);
    ensurePerson(b);
    const s = settings();
    const found = s.relations.find(r =>
        (keyName(r.a) === keyName(a) && keyName(r.b) === keyName(b)) ||
        (keyName(r.a) === keyName(b) && keyName(r.b) === keyName(a)));
    if (found) {
        found.a = a;
        found.b = b;
        found.type = type;
        found.note = note || found.note || '';
    } else {
        s.relations.push({ a, b, type, note });
    }
    save();
    renderPanel();
    updateInjection();
    drawCurrentView();
}

function addTemplate(name) {
    const tpl = TEMPLATES[name];
    if (!tpl) return;
    for (const p of tpl.people) ensurePerson(p.name, p.role, p.note);
    for (const r of tpl.relations) upsertRelation(r.a, r.b, r.type, r.note);
    save();
    renderPanel();
    updateInjection();
    drawCurrentView();
}

function updateInjection() {
    const s = settings();
    const c = ctx();
    const people = allPeople();
    if (!s.enabled || !s.inject || (!people.length && !s.relations.length)) {
        c.setExtensionPrompt(INJECT_KEY, '', 1, 4);
        return;
    }
    const lines = [t().injectHeader];
    if (people.length) {
        lines.push(t().injectPeople);
        for (const p of people.slice(0, 60)) {
            lines.push(`- ${p.name}${p.role ? ` — ${p.role}` : ''}${p.note ? ` (${p.note})` : ''}`);
        }
    }
    if (s.relations.length) {
        lines.push(t().injectRelations);
        for (const r of s.relations.slice(0, 80)) {
            lines.push(`- ${r.a} × ${r.b}: ${relLabel(r.type)}${r.note ? ` (${r.note})` : ''}`);
        }
    }
    lines.push(t().injectFooter);
    c.setExtensionPrompt(INJECT_KEY, lines.join('\n'), 1, 4);
}

function parseMessage(messageId) {
    const s = settings();
    if (!s.enabled || !s.autoParse) return;
    const c = ctx();
    const message = c.chat?.[messageId];
    if (!message || message.is_user || message.is_system) return;

    const re = /\[REL:\s*([^\]=|]+?)\s*[x×]\s*([^\]=|]+?)\s*=\s*(\w+)\s*(?:\|\s*([^\]]+?))?\s*\]/gi;
    let changed = false;
    let match;
    while ((match = re.exec(message.mes)) !== null) {
        const [, a, b, typeRaw, noteRaw] = match;
        const type = typeRaw.toLowerCase();
        if (!REL_TYPES.includes(type)) continue;
        upsertRelation(a, b, type, noteRaw || '');
        toastr.info(t().parsedToast(a.trim(), b.trim(), relLabel(type)), t().title);
        changed = true;
    }
    if (changed) {
        message.mes = message.mes.replace(re, '').trimEnd();
        c.updateMessageBlock?.(messageId, message);
        save();
    }
}

const graphView = { scale: 1, x: 0, y: 0, fitted: false, dragging: false, lastX: 0, lastY: 0 };

function graphDimensions() {
    const people = allPeople();
    if (settings().mode === 'tree') {
        const levels = genealogyLevels(people.map(p => p.name));
        const maxInLevel = Math.max(1, ...Object.values(levels.grouped).map(g => g.length));
        const levelCount = Math.max(1, Object.keys(levels.grouped).length);
        return { width: Math.max(980, maxInLevel * 220), height: Math.max(560, levelCount * 150 + 120) };
    }
    return { width: Math.max(980, people.length * 170), height: Math.max(560, Math.min(900, people.length * 70)) };
}

function applyCanvasDimensions() {
    const canvas = $('#rweb_canvas');
    if (!canvas.length) return;
    const dim = graphDimensions();
    canvas.css({ width: `${dim.width}px`, height: `${dim.height}px` });
    applyGraphTransform();
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function applyGraphTransform() {
    const canvas = $('#rweb_canvas');
    if (!canvas.length) return;
    canvas.css('transform', `translate(${graphView.x}px, ${graphView.y}px) scale(${graphView.scale})`);
    $('#rweb_zoom_label').text(`${Math.round(graphView.scale * 100)}%`);
}

function fitGraphView() {
    const viewport = document.getElementById('rweb_canvas_viewport');
    const canvas = document.getElementById('rweb_canvas');
    if (!viewport || !canvas) return;
    const cw = parseFloat(canvas.style.width) || canvas.offsetWidth || 980;
    const ch = parseFloat(canvas.style.height) || canvas.offsetHeight || 560;
    const scale = clamp(Math.min(viewport.clientWidth / cw, viewport.clientHeight / ch), 0.25, 1.2);
    graphView.scale = scale;
    graphView.x = Math.max(0, (viewport.clientWidth - cw * scale) / 2);
    graphView.y = Math.max(0, (viewport.clientHeight - ch * scale) / 2);
    graphView.fitted = true;
    applyGraphTransform();
}

function zoomGraph(factor) {
    const viewport = document.getElementById('rweb_canvas_viewport');
    if (!viewport) return;
    const oldScale = graphView.scale;
    const newScale = clamp(oldScale * factor, 0.25, 3);
    const cx = viewport.clientWidth / 2;
    const cy = viewport.clientHeight / 2;
    graphView.x = cx - (cx - graphView.x) * (newScale / oldScale);
    graphView.y = cy - (cy - graphView.y) * (newScale / oldScale);
    graphView.scale = newScale;
    graphView.fitted = true;
    applyGraphTransform();
}

function bindGraphControls() {
    $('#rweb_zoom_in').on('click', () => zoomGraph(1.2));
    $('#rweb_zoom_out').on('click', () => zoomGraph(1 / 1.2));
    $('#rweb_zoom_reset').on('click', fitGraphView);
    const viewport = document.getElementById('rweb_canvas_viewport');
    if (!viewport) return;
    viewport.addEventListener('pointerdown', (event) => {
        graphView.dragging = true;
        graphView.lastX = event.clientX;
        graphView.lastY = event.clientY;
        viewport.setPointerCapture?.(event.pointerId);
        viewport.classList.add('dragging');
    });
    viewport.addEventListener('pointermove', (event) => {
        if (!graphView.dragging) return;
        graphView.x += event.clientX - graphView.lastX;
        graphView.y += event.clientY - graphView.lastY;
        graphView.lastX = event.clientX;
        graphView.lastY = event.clientY;
        applyGraphTransform();
    });
    const endDrag = (event) => {
        graphView.dragging = false;
        viewport.releasePointerCapture?.(event.pointerId);
        viewport.classList.remove('dragging');
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('wheel', (event) => {
        event.preventDefault();
        zoomGraph(event.deltaY < 0 ? 1.12 : 1 / 1.12);
    }, { passive: false });
}

function genealogyLevels(people) {
    const levels = Object.fromEntries(people.map(name => [name, 0]));
    const parentEdges = [];
    for (const r of settings().relations) {
        if (r.type === 'parent') parentEdges.push([r.a, r.b]);
        if (r.type === 'child') parentEdges.push([r.b, r.a]);
    }
    for (let pass = 0; pass < people.length + 2; pass++) {
        for (const [parent, child] of parentEdges) {
            levels[child] = Math.max(levels[child] ?? 0, (levels[parent] ?? 0) + 1);
        }
    }
    const grouped = {};
    for (const name of people) (grouped[levels[name] ?? 0] ??= []).push(name);
    return { levels, grouped };
}

function sizeCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(parseFloat(canvas.style.width) || canvas.offsetWidth || 900));
    const height = Math.max(300, Math.floor(parseFloat(canvas.style.height) || canvas.offsetHeight || 560));
    if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
    }
    const g = canvas.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { g, W: width, H: height };
}

function drawCurrentView() {
    applyCanvasDimensions();
    if (settings().mode === 'tree') drawGenealogy();
    else drawWeb();
    if (!graphView.fitted) fitGraphView();
    else applyGraphTransform();
}

function drawWeb() {
    const canvas = document.getElementById('rweb_canvas');
    if (!canvas) return;
    const { g, W, H } = sizeCanvas(canvas);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#101214';
    g.fillRect(0, 0, W, H);

    const nodes = allPeople().map(p => p.name);
    if (!nodes.length) return;
    const cx = W / 2;
    const cy = H / 2;
    const rx = Math.max(180, W / 2 - 130);
    const ry = Math.max(150, H / 2 - 105);
    const pos = {};
    nodes.forEach((name, i) => {
        const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
        pos[name] = { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
    });
    drawEdges(g, pos);
    drawNodes(g, pos, W, H);
}

function drawGenealogy() {
    const canvas = document.getElementById('rweb_canvas');
    if (!canvas) return;
    const { g, W, H } = sizeCanvas(canvas);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#101214';
    g.fillRect(0, 0, W, H);

    const people = allPeople().map(p => p.name);
    if (!people.length) return;
    const { grouped } = genealogyLevels(people);
    const levelKeys = Object.keys(grouped).map(Number).sort((a, b) => a - b);
    const pos = {};
    const top = 44;
    const stepY = Math.max(96, (H - 100) / Math.max(1, levelKeys.length));
    for (let li = 0; li < levelKeys.length; li++) {
        const group = grouped[levelKeys[li]];
        const y = top + li * stepY;
        for (let i = 0; i < group.length; i++) {
            const x = Math.max(120, (W / (group.length + 1)) * (i + 1));
            pos[group[i]] = { x, y };
        }
    }
    drawEdges(g, pos, true);
    drawNodes(g, pos, W, H, true);
}

function drawEdges(g, pos, genealogy = false) {
    g.lineWidth = 2;
    g.font = '12px sans-serif';
    for (const r of settings().relations) {
        const p1 = pos[r.a];
        const p2 = pos[r.b];
        if (!p1 || !p2) continue;
        g.strokeStyle = REL_COLORS[r.type] || '#888';
        g.fillStyle = REL_COLORS[r.type] || '#888';
        g.setLineDash(genealogy && !['parent', 'child'].includes(r.type) ? [6, 5] : []);
        g.beginPath();
        if (genealogy && ['parent', 'child'].includes(r.type)) {
            const parent = r.type === 'parent' ? p1 : p2;
            const child = r.type === 'parent' ? p2 : p1;
            const midY = (parent.y + child.y) / 2;
            g.moveTo(parent.x, parent.y + 14);
            g.lineTo(parent.x, midY);
            g.lineTo(child.x, midY);
            g.lineTo(child.x, child.y - 14);
        } else {
            g.moveTo(p1.x, p1.y);
            g.lineTo(p2.x, p2.y);
        }
        g.stroke();
        g.setLineDash([]);
        drawEdgeLabel(g, relLabel(r.type), p1, p2, REL_COLORS[r.type] || '#888');
    }
}

function drawNodes(g, pos, W, H) {
    for (const [name, p] of Object.entries(pos)) {
        const person = allPeople().find(x => x.name === name) || { role: '' };
        g.fillStyle = '#252a30';
        g.strokeStyle = '#d0d7de';
        const boxW = 168;
        const boxH = person.role ? 52 : 42;
        roundRect(g, p.x - boxW / 2, p.y - boxH / 2, boxW, boxH, 14, true, true);
        g.fillStyle = '#f2f2f2';
        g.font = 'bold 12px sans-serif';
        drawCentered(g, name, p.x, person.role ? p.y - 6 : p.y + 4, 154);
        if (person.role) {
            g.fillStyle = '#aeb6c2';
            g.font = '10px sans-serif';
            drawCentered(g, person.role, p.x, p.y + 13, 154);
        }
    }
}

function drawEdgeLabel(g, text, p1, p2, color) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.max(1, Math.hypot(dx, dy));
    const nx = -dy / len;
    const ny = dx / len;
    const x = (p1.x + p2.x) / 2 + nx * 18;
    const y = (p1.y + p2.y) / 2 + ny * 18;
    g.font = '12px sans-serif';
    const w = Math.min(140, g.measureText(text).width + 12);
    g.fillStyle = 'rgba(16, 18, 20, 0.86)';
    g.strokeStyle = color;
    roundRect(g, x - w / 2, y - 12, w, 20, 8, true, true);
    g.fillStyle = color;
    g.fillText(text, x - w / 2 + 6, y + 3, w - 12);
}

function roundRect(g, x, y, w, h, r, fill, stroke) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    if (fill) g.fill();
    if (stroke) g.stroke();
}

function drawCentered(g, text, x, y, maxW) {
    const label = text.length > 22 ? text.slice(0, 20) + '…' : text;
    g.fillText(label, x - Math.min(g.measureText(label).width, maxW) / 2, y, maxW);
}

function openWebPopup() {
    $('#rweb_popup').remove();
    const html = `
    <div id="rweb_popup">
        <div id="rweb_popup_inner">
            <div id="rweb_popup_header">
                <b>${t().webTitle} <span class="rweb-version">v${VERSION}</span></b>
                <div class="menu_button" id="rweb_close">${t().close}</div>
            </div>
            <div id="rweb_toolbar">
                <div class="menu_button" id="rweb_zoom_out">${t().zoomOut}</div>
                <span id="rweb_zoom_label">100%</span>
                <div class="menu_button" id="rweb_zoom_in">${t().zoomIn}</div>
                <div class="menu_button" id="rweb_zoom_reset">${t().resetZoom}</div>
                <span class="rweb-drag-hint">${t().dragHint}</span>
            </div>
            <div id="rweb_canvas_viewport"><canvas id="rweb_canvas"></canvas></div>
            <div id="rweb_legend">
                ${REL_TYPES.map(type => `<span><i style="background:${REL_COLORS[type]}"></i>${relLabel(type)}</span>`).join('')}
            </div>
        </div>
    </div>`;
    $('body').append(html);
    $('#rweb_close').on('click', () => $('#rweb_popup').remove());
    $('#rweb_popup').on('click', function (e) { if (e.target === this) $(this).remove(); });
    graphView.scale = 1;
    graphView.x = 0;
    graphView.y = 0;
    graphView.fitted = false;
    bindGraphControls();
    setTimeout(drawCurrentView, 0);
}

function renderPeople() {
    const s = settings();
    const list = $('#rweb_people').empty();
    for (const person of s.people) {
        const idx = s.people.indexOf(person);
        const row = $(`
            <div class="rweb-row">
                <span class="rweb-pair" title="${person.note || ''}">${person.name}${person.role ? ` — ${person.role}` : ''}</span>
                <div class="menu_button rweb-del" title="${t().remove}">🗑️</div>
            </div>`);
        row.find('.rweb-del').on('click', () => {
            s.people.splice(idx, 1);
            save();
            renderPanel();
            updateInjection();
            drawCurrentView();
        });
        list.append(row);
    }
}

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
            renderPanel();
            updateInjection();
            drawCurrentView();
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
                <b>${loc.title} <span class="rweb-version">v${VERSION}</span></b>
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
                    <span>${loc.mode}:</span>
                    <select id="rweb_mode" class="text_pole">
                        <option value="web" ${s.mode === 'web' ? 'selected' : ''}>${loc.webMode}</option>
                        <option value="tree" ${s.mode === 'tree' ? 'selected' : ''}>${loc.treeMode}</option>
                    </select>
                    <div class="menu_button" id="rweb_open">${loc.openWeb}</div>
                </div>

                <details class="rweb-section" open>
                    <summary><b>${loc.people}</b></summary>
                    <div id="rweb_people"></div>
                    <div class="rweb-add">
                        <input type="text" id="rweb_person_name" class="text_pole" placeholder="${loc.namePh}">
                        <input type="text" id="rweb_person_role" class="text_pole" placeholder="${loc.rolePh}">
                    </div>
                    <div class="rweb-add">
                        <input type="text" id="rweb_person_note" class="text_pole" placeholder="${loc.personNotePh}">
                        <div class="menu_button" id="rweb_add_person">${loc.addPerson}</div>
                    </div>
                </details>

                <details class="rweb-section" open>
                    <summary><b>${loc.relations}</b></summary>
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
                </details>

                <details class="rweb-section">
                    <summary><b>${loc.templates}</b></summary>
                    <div class="rweb-add">
                        <div class="menu_button" id="rweb_tpl_hale">${loc.haleTpl}</div>
                        <div class="menu_button" id="rweb_tpl_voodoo">${loc.voodooTpl}</div>
                        <div class="menu_button" id="rweb_clear">${loc.clearAll}</div>
                    </div>
                </details>
            </div>
        </div>
    </div>`;
    $('#extensions_settings2').append(html);

    $('#rweb_enabled').on('change', function () { s.enabled = this.checked; save(); updateInjection(); });
    $('#rweb_inject').on('change', function () { s.inject = this.checked; save(); updateInjection(); });
    $('#rweb_autoparse').on('change', function () { s.autoParse = this.checked; save(); });
    $('#rweb_lang').on('change', function () { s.lang = this.value; save(); renderPanel(); updateInjection(); });
    $('#rweb_mode').on('change', function () { s.mode = this.value; save(); graphView.fitted = false; drawCurrentView(); });
    $('#rweb_open').on('click', openWebPopup);
    $('#rweb_add_person').on('click', () => {
        addPerson($('#rweb_person_name').val(), $('#rweb_person_role').val(), $('#rweb_person_note').val());
    });
    $('#rweb_add').on('click', () => {
        upsertRelation($('#rweb_a').val(), $('#rweb_b').val(), $('#rweb_type').val(), $('#rweb_note').val());
    });
    $('#rweb_tpl_hale').on('click', () => addTemplate('hale'));
    $('#rweb_tpl_voodoo').on('click', () => addTemplate('voodoo'));
    $('#rweb_clear').on('click', () => {
        if (!confirm(loc.confirmClear)) return;
        s.people = [];
        s.relations = [];
        save();
        renderPanel();
        updateInjection();
        drawCurrentView();
    });
    renderPeople();
    renderRelations();
}

jQuery(async () => {
    const c = ctx();
    renderPanel();
    updateInjection();
    c.eventSource.on(c.eventTypes.MESSAGE_RECEIVED, parseMessage);
    c.eventSource.on(c.eventTypes.CHAT_CHANGED, updateInjection);
});
