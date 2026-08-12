export const config = { matcher: '/' };
const REGISTRY_KEY = '__g360_sync_registry__';
const BOOTSTRAP_KEYS = ['crmComercialAvancadoV1', 'gestao360ExecutiveSnapshotV2'];
const SKIP_PREFIX = 'g360:finance:';
function buildScript() {
    var parts = [];
    parts.push('\n<script>\n(function(){\n');
    parts.push('var REGISTRY_KEY = ' + JSON.stringify(REGISTRY_KEY) + ';\n');
    parts.push('var BOOTSTRAP_KEYS = ' + JSON.stringify(BOOTSTRAP_KEYS) + ';\n');
    parts.push('var SKIP_PREFIX = ' + JSON.stringify(SKIP_PREFIX) + ';\n');
    parts.push('var lastSynced = {};\n');
    parts.push('function syncGet(key){\n');
    parts.push('try {\n');
    parts.push('var xhr = new XMLHttpRequest();\n');
    parts.push('xhr.open("GET", "/api/data?key=" + encodeURIComponent(key), false);\n');
    parts.push('xhr.send(null);\n');
    parts.push('if (xhr.status >= 200 && xhr.status < 300) { return JSON.parse(xhr.responseText); }\n');
    parts.push('} catch(e) {}\n');
    parts.push('return { value: null };\n');
    parts.push('}\n');
    parts.push('function asyncSet(key, value){\n');
    parts.push('try { fetch("/api/data", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: key, value: value }) }).catch(function(){}); } catch(e) {}\n');
    parts.push('}\n');
    parts.push('function hydrateKey(key){\n');
    parts.push('var res = syncGet(key);\n');
    parts.push('var remote = res && res.value;\n');
    parts.push('if (remote !== null && remote !== undefined) {\n');
    parts.push('var remoteStr = typeof remote === "string" ? remote : JSON.stringify(remote);\n');
    parts.push('try { localStorage.setItem(key, remoteStr); } catch(e) {}\n');
    parts.push('lastSynced[key] = remoteStr;\n');
    parts.push('} else {\n');
    parts.push('var local = null;\n');
    parts.push('try { local = localStorage.getItem(key); } catch(e) {}\n');
    parts.push('if (local !== null) { lastSynced[key] = local; asyncSet(key, local); }\n');
    parts.push('}\n');
    parts.push('}\n');
    parts.push('(function bootstrap(){\n');
    parts.push('var reg = syncGet(REGISTRY_KEY);\n');
    parts.push('var regList = [];\n');
    parts.push('try { regList = reg && reg.value ? JSON.parse(reg.value) : []; } catch(e) { regList = []; }\n');
    parts.push('if (!Array.isArray(regList)) regList = [];\n');
    parts.push('var allKeys = regList.slice();\n');
    parts.push('BOOTSTRAP_KEYS.forEach(function(k){ if (allKeys.indexOf(k) === -1) allKeys.push(k); });\n');
    parts.push('allKeys.forEach(hydrateKey);\n');
    parts.push('if (JSON.stringify(allKeys.slice().sort()) !== JSON.stringify(regList.slice().sort())) {\n');
    parts.push('lastSynced[REGISTRY_KEY] = JSON.stringify(allKeys);\n');
    parts.push('asyncSet(REGISTRY_KEY, JSON.stringify(allKeys));\n');
    parts.push('} else {\n');
    parts.push('lastSynced[REGISTRY_KEY] = JSON.stringify(regList);\n');
    parts.push('}\n');
    parts.push('window.__G360_SYNC_KEYS__ = allKeys;\n');
    parts.push('})();\n');
    parts.push('function pushChanges(){\n');
    parts.push('var known = window.__G360_SYNC_KEYS__ || [];\n');
    parts.push('var allLocal = [];\n');
    parts.push('try { allLocal = Object.keys(localStorage); } catch(e) {}\n');
    parts.push('var candidateKeys = known.slice();\n');
    parts.push('allLocal.forEach(function(k){\n');
    parts.push('if (k.indexOf(SKIP_PREFIX) === 0) return;\n');
    parts.push('if (k === REGISTRY_KEY) return;\n');
    parts.push('if (candidateKeys.indexOf(k) === -1) candidateKeys.push(k);\n');
    parts.push('});\n');
    parts.push('var newlyFound = false;\n');
    parts.push('candidateKeys.forEach(function(k){\n');
    parts.push('var cur = null;\n');
    parts.push('try { cur = localStorage.getItem(k); } catch(e) {}\n');
    parts.push('if (cur !== null && cur !== lastSynced[k]) {\n');
    parts.push('lastSynced[k] = cur;\n');
    parts.push('asyncSet(k, cur);\n');
    parts.push('if ((window.__G360_SYNC_KEYS__ || []).indexOf(k) === -1) { window.__G360_SYNC_KEYS__.push(k); newlyFound = true; }\n');
    parts.push('}\n');
    parts.push('});\n');
    parts.push('if (newlyFound) { lastSynced[REGISTRY_KEY] = JSON.stringify(window.__G360_SYNC_KEYS__); asyncSet(REGISTRY_KEY, JSON.stringify(window.__G360_SYNC_KEYS__)); }\n');
    parts.push('}\n');
    parts.push('setInterval(pushChanges, 4000);\n');
    parts.push('})();\n');
    parts.push('</script' + '>\n');
    return parts.join('');
}
export default async function middleware(request) {
    try {
        const originUrl = new URL('/index.html', request.url);
        const originRes = await fetch(originUrl.toString());
        if (!originRes.ok) { return fetch(request); }
        let html = await originRes.text();
        const script = buildScript();
        if (html.indexOf('<head>') !== -1) {
            html = html.replace('<head>', '<head>' + script);
        } else if (/<body[^>]*>/.test(html)) {
            html = html.replace(/<body[^>]*>/, function (m) { return m + script; });
        } else {
            html = script + html;
        }
        return new Response(html, { status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } });
    } catch (err) {
        return fetch(request);
    }
}
