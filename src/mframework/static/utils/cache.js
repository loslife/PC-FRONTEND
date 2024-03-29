define(function (require, exports, module) {

    Storage.prototype.setObject = function(key, value) {
        try{
            this.setItem(key, JSON.stringify(value));
        }
        catch(e){
            this.clear();

        }
    }

    Storage.prototype.getObject = function(key) {
        return JSON.parse(this.getItem(key));
    }

    /*
     * Dustin Diaz's CacheProvider
     * From: http://www.dustindiaz.com/javascript-cache-provider/
     */

    function CacheProvider() {
        // values will be stored here
        CacheProvider.hasLocalStorage = ('localStorage' in window) && window['localStorage'] !== null && typeof Storage !== 'undefined';
        this._cache = {};
    }

    CacheProvider.prototype = {

        /**
         * {String} k - the key
         * {Boolean} local - get this from local storage?
         * {Boolean} o - is the value you put in local storage an object?
         */
        get: function(k, local, o) {
            if (local && CacheProvider.hasLocalStorage) {
                var action = o ? 'getObject' : 'getItem';
                return localStorage[action](k) || undefined;
            } else {
                return this._cache[k] || undefined;
            }
        },
        getObject: function(k) {
            if (CacheProvider.hasLocalStorage) {
                return localStorage["getObject"](k) || undefined;
            } else {
                return this._cache[k] || undefined;
            }
        },

        /**
         * {String} k - the key
         * {Object} v - any kind of value you want to store
         * however only objects and strings are allowed in local storage
         * {Boolean} local - put this in local storage
         */
        set: function(k, v, local) {

            CacheProvider.hasLocalStorage = ('localStorage' in window) && window['localStorage'] !== null && typeof Storage !== 'undefined';

            if (local && CacheProvider.hasLocalStorage) {
                if (typeof v !== 'string') {
                    // make assumption if it's not a string, then we're storing an object
                    localStorage.setObject(k, v);
                } else {
                    try {
                        localStorage.setItem(k, v);
                    } catch (ex) {
                        if (ex.name == 'QUOTA_EXCEEDED_ERR') {
                            // developer needs to figure out what to start invalidating
                            throw new Exception(v);
                            return;
                        }
                    }
                }
            } else {
                // put in our local object
                this._cache[k] = v;
            }
            // return our newly cached item
            return v;
        },

        /**
         * {String} k - the key
         * {Boolean} local - put this in local storage
         * {Boolean} o - is this an object you want to put in local storage?
         */
        clear: function(k, local, o) {
            if (local && CacheProvider.hasLocalStorage) {
                localStorage.removeItem(k);
            }
            // delete in both caches - doesn't hurt.
            delete this._cache[k];
        }

    };


    exports.CacheProvider = CacheProvider

})
