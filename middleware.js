export const config = { matcher: '/' };

const SYNC_SCRIPT = `
<script>
(function(){
  var SKIP_PREFIX = 'g360:finance:';
    var lastSynced = {};
      function apiGet(key){
          return fetch('/api/data?key=' + encodeURIComponent(key))
                .then(function(r){ return r.ok ? r.json() : { value: null }; })
                      .catch(function(){ return { value: null }; });
                        }
                          function apiSet(key, value){
                              return fetch('/api/data', {
                                    method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ key: key, value: value })
                                                    }).catch(function(){});
                                                      }
                                                        function localKeys(){
                                                            return Object.keys(localStorage).filter(function(k){ return k.indexOf(SKIP_PREFIX) !== 0; });
                                                              }
                                                                function hydrate(){
                                                                    var keys = localKeys();
                                                                        return Promise.all(keys.map(function(k){
                                                                              return apiGet(k).then(function(res){
                                                                                      var remote = res && res.value;
                                                                                              if (remote !== null && remote !== undefined) {
                                                                                                        var remoteStr = typeof remote === 'string' ? remote : JSON.stringify(remote);
                                                                                                                  try { localStorage.setItem(k, remoteStr); } catch(e){}
                                                                                                                            lastSynced[k] = remoteStr;
                                                                                                                                    } else {
                                                                                                                                              var local = null;
                                                                                                                                                        try { local = localStorage.getItem(k); } catch(e){}
                                                                                                                                                                  if (local !== null) { apiSet(k, local); lastSynced[k] = local; }
                                                                                                                                                                          }
                                                                                                                                                                                });
                                                                                                                                                                                    }));
                                                                                                                                                                                      }
                                                                                                                                                                                        function pushChanges(){
                                                                                                                                                                                            localKeys().forEach(function(k){
                                                                                                                                                                                                  var cur = null;
                                                                                                                                                                                                        try { cur = localStorage.getItem(k); } catch(e){}
                                                                                                                                                                                                              if (cur !== null && cur !== lastSynced[k]) {
                                                                                                                                                                                                                      lastSynced[k] = cur;
                                                                                                                                                                                                                              apiSet(k, cur);
                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                          }
                                                                                                                                                                                                                                            hydrate().then(function(){ setInterval(pushChanges, 4000); });
                                                                                                                                                                                                                                            })();
                                                                                                                                                                                                                                            </script>
                                                                                                                                                                                                                                            </body>`;
                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                            export default async function middleware(request) {
                                                                                                                                                                                                                                              try {
                                                                                                                                                                                                                                                  const originUrl = new URL('/index.html', request.url);
                                                                                                                                                                                                                                                      const originRes = await fetch(originUrl.toString());
                                                                                                                                                                                                                                                          if (!originRes.ok) {
                                                                                                                                                                                                                                                                return fetch(request);
                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                        let html = await originRes.text();
                                                                                                                                                                                                                                                                            if (html.includes('</body>')) {
                                                                                                                                                                                                                                                                                  html = html.replace('</body>', SYNC_SCRIPT);
                                                                                                                                                                                                                                                                                      } else {
                                                                                                                                                                                                                                                                                            html += SYNC_SCRIPT;
                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                    return new Response(html, {
                                                                                                                                                                                                                                                                                                          status: 200,
                                                                                                                                                                                                                                                                                                                headers: { 'content-type': 'text/html; charset=utf-8' }
                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                      } catch (err) {
                                                                                                                                                                                                                                                                                                                          return fetch(request);
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                            
