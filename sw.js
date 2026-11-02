'use strict';
var SHELL = 'stampkun-shell-v4';
var ASSETS = 'stampkun-assets-v2';
var CDN = 'stampkun-cdn-v2';
var CPS = '1f34e,1f37a,1f383,1f389,1f3c2,1f3c6,1f431,1f436,1f438,1f43b,1f43c,1f44d,1f44f,1f47b,1f47d,1f480,1f4a4,1f4a6,1f4aa,1f4af,1f525,1f600,1f601,1f602,1f603,1f604,1f605,1f606,1f608,1f609,1f60a,1f60b,1f60c,1f60d,1f60e,1f60f,1f610,1f611,1f612,1f618,1f61c,1f622,1f62d,1f631,1f633,1f634,1f637,1f63a,1f643,1f644,1f648,1f649,1f64a,1f64f,1f912,1f914,1f916,1f917,1f923,1f929,1f92a,1f92f,1f970,1f971,1f973,1f974,1f975,1f976,1f97a,1fae1,1fae7,263a,2728,2753,2757,2764,2b50'.split(',');
var DIRS = ['assets/emoji/', 'assets/emoji-noto/', 'assets/emoji-openmoji/', 'assets/emoji-fluent-color/', 'assets/emoji-fluent-flat/'];
self.addEventListener('install', function(e){
  e.waitUntil((async function(){
    var shell = await caches.open(SHELL);
    await shell.addAll(['./', 'index.html', 'manifest.webmanifest', 'icon.svg']);
    var assets = await caches.open(ASSETS);
    var urls = [];
    DIRS.forEach(function(d){ CPS.forEach(function(cp){ urls.push(d + cp + '.svg'); }); });
    await Promise.all(urls.map(function(u){
      return assets.add(u).catch(function(){});
    }));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){
      if(k !== SHELL && k !== ASSETS && k !== CDN) return caches.delete(k);
    }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(SHELL).then(function(c){ c.put('index.html', copy); });
      return res;
    }).catch(function(){ return caches.match('index.html'); }));
    return;
  }
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(function(hit){
    if(hit) return hit;
    return fetch(e.request).then(function(res){
      if(res && (res.status === 200 || res.type === 'opaque')){
        var copy = res.clone();
        var dest = (url.origin === location.origin) ? ASSETS : CDN;
        caches.open(dest).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    });
  }));
});
