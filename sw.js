'use strict';
var CACHE = 'stampkun-v1';
self.addEventListener('install', function(e){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var url = new URL(e.request.url);
  if(e.request.method !== 'GET') return;
  if(url.origin === location.origin && url.pathname.indexOf('/assets/') >= 0){
    e.respondWith(caches.open(CACHE).then(function(c){
      return c.match(e.request).then(function(hit){
        if(hit) return hit;
        return fetch(e.request).then(function(res){ c.put(e.request, res.clone()); return res; });
      });
    }));
  } else if(e.request.mode === 'navigate'){
    e.respondWith(fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put('index.html', copy); });
      return res;
    }).catch(function(){ return caches.match('index.html'); }));
  }
});
