window.BMAP_AUTHENTIC_KEY = "077cf00d4471f3852b96fba32ff879fd";
(function () {
    var aa = void 0, i = !0, n = null, o = !1;

    function q() {
        return function () {
        }
    }

    function ba(a) {
        return function (b) {
            this[a] = b
        }
    }

    function s(a) {
        return function () {
            return this[a]
        }
    }

    function ca(a) {
        return function () {
            return a
        }
    }

    var ea = [];

    function fa(a) {
        return function () {
            return ea[a].apply(this, arguments)
        }
    }

    function ga(a, b) {
        return ea[a] = b
    }

    var ha, t = ha = t || {version: "1.3.4"};
    t.L = "$BAIDU$";
    window[t.L] = window[t.L] || {};
    t.object = t.object || {};
    t.extend = t.object.extend = function (a, b) {
        for (var c in b)b.hasOwnProperty(c) && (a[c] = b[c]);
        return a
    };
    t.z = t.z || {};
    t.z.R = function (a) {
        return"string" == typeof a || a instanceof String ? document.getElementById(a) : a && a.nodeName && (1 == a.nodeType || 9 == a.nodeType) ? a : n
    };
    t.R = t.uc = t.z.R;
    t.z.H = function (a) {
        a = t.z.R(a);
        a.style.display = "none";
        return a
    };
    t.H = t.z.H;
    t.lang = t.lang || {};
    t.lang.qe = function (a) {
        return"[object String]" == Object.prototype.toString.call(a)
    };
    t.qe = t.lang.qe;
    t.z.Lg = function (a) {
        return t.lang.qe(a) ? document.getElementById(a) : a
    };
    t.Lg = t.z.Lg;
    t.z.contains = function (a, b) {
        var c = t.z.Lg, a = c(a), b = c(b);
        return a.contains ? a != b && a.contains(b) : !!(a.compareDocumentPosition(b) & 16)
    };
    t.M = t.M || {};
    /msie (\d+\.\d)/i.test(navigator.userAgent) && (t.M.S = t.S = document.documentMode || +RegExp.$1);
    var ia = {cellpadding: "cellPadding", cellspacing: "cellSpacing", colspan: "colSpan", rowspan: "rowSpan", valign: "vAlign", usemap: "useMap", frameborder: "frameBorder"};
    8 > t.M.S ? (ia["for"] = "htmlFor", ia["class"] = "className") : (ia.htmlFor = "for", ia.className = "class");
    t.z.Nv = ia;
    t.z.Tu = function (a, b, c) {
        a = t.z.R(a);
        if ("style" == b)a.style.cssText = c; else {
            b = t.z.Nv[b] || b;
            a.setAttribute(b, c)
        }
        return a
    };
    t.Tu = t.z.Tu;
    t.z.Uu = function (a, b) {
        var a = t.z.R(a), c;
        for (c in b)t.z.Tu(a, c, b[c]);
        return a
    };
    t.Uu = t.z.Uu;
    t.df = t.df || {};
    (function () {
        var a = RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+$)", "g");
        t.df.trim = function (b) {
            return("" + b).replace(a, "")
        }
    })();
    t.trim = t.df.trim;
    t.df.Gi = function (a, b) {
        var a = "" + a, c = Array.prototype.slice.call(arguments, 1), d = Object.prototype.toString;
        if (c.length) {
            c = c.length == 1 ? b !== n && /\[object Array\]|\[object Object\]/.test(d.call(b)) ? b : c : c;
            return a.replace(/#\{(.+?)\}/g, function (a, b) {
                var g = c[b];
                "[object Function]" == d.call(g) && (g = g(b));
                return"undefined" == typeof g ? "" : g
            })
        }
        return a
    };
    t.Gi = t.df.Gi;
    t.z.Rb = function (a, b) {
        for (var a = t.z.R(a), c = a.className.split(/\s+/), d = b.split(/\s+/), e, f = d.length, g, j = 0; j < f; ++j) {
            g = 0;
            for (e = c.length; g < e; ++g)if (c[g] == d[j]) {
                c.splice(g, 1);
                break
            }
        }
        a.className = c.join(" ");
        return a
    };
    t.Rb = t.z.Rb;
    t.z.eu = function (a, b, c) {
        var a = t.z.R(a), d;
        if (a.insertAdjacentHTML)a.insertAdjacentHTML(b, c); else {
            d = a.ownerDocument.createRange();
            b = b.toUpperCase();
            if (b == "AFTERBEGIN" || b == "BEFOREEND") {
                d.selectNodeContents(a);
                d.collapse(b == "AFTERBEGIN")
            } else {
                b = b == "BEFOREBEGIN";
                d[b ? "setStartBefore" : "setEndAfter"](a);
                d.collapse(b)
            }
            d.insertNode(d.createContextualFragment(c))
        }
        return a
    };
    t.eu = t.z.eu;
    t.z.show = function (a) {
        a = t.z.R(a);
        a.style.display = "";
        return a
    };
    t.show = t.z.show;
    t.z.Et = function (a) {
        a = t.z.R(a);
        return a.nodeType == 9 ? a : a.ownerDocument || a.document
    };
    t.z.$a = function (a, b) {
        for (var a = t.z.R(a), c = b.split(/\s+/), d = a.className, e = " " + d + " ", f = 0, g = c.length; f < g; f++)e.indexOf(" " + c[f] + " ") < 0 && (d = d + (" " + c[f]));
        a.className = d;
        return a
    };
    t.$a = t.z.$a;
    t.z.hs = t.z.hs || {};
    t.z.ei = t.z.ei || [];
    t.z.ei.filter = function (a, b, c) {
        for (var d = 0, e = t.z.ei, f; f = e[d]; d++)if (f = f[c])b = f(a, b);
        return b
    };
    t.df.rB = function (a) {
        return a.indexOf("-") < 0 && a.indexOf("_") < 0 ? a : a.replace(/[-_][^-_]/g, function (a) {
            return a.charAt(1).toUpperCase()
        })
    };
    t.z.XM = function (a, b) {
        t.z.$t(a, b) ? t.z.Rb(a, b) : t.z.$a(a, b)
    };
    t.z.$t = function (a) {
        if (arguments.length <= 0 || typeof a === "function")return this;
        if (this.size() <= 0)return o;
        var a = a.replace(/^\s+/g, "").replace(/\s+$/g, "").replace(/\s+/g, " "), b = a.split(" "), c;
        t.forEach(this, function (a) {
            for (var a = a.className, e = 0; e < b.length; e++)if (!~(" " + a + " ").indexOf(" " + b[e] + " ")) {
                c = o;
                return
            }
            c !== o && (c = i)
        });
        return c
    };
    t.z.xg = function (a, b) {
        var c = t.z, a = c.R(a), b = t.df.rB(b), d = a.style[b];
        if (!d)var e = c.hs[b], d = a.currentStyle || (t.M.S ? a.style : getComputedStyle(a, n)), d = e && e.get ? e.get(a, d) : d[e || b];
        if (e = c.ei)d = e.filter(b, d, "get");
        return d
    };
    t.xg = t.z.xg;
    /opera\/(\d+\.\d)/i.test(navigator.userAgent) && (t.M.opera = +RegExp.$1);
    t.M.Wz = /webkit/i.test(navigator.userAgent);
    t.M.yI = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
    t.M.lu = "CSS1Compat" == document.compatMode;
    t.z.ca = function (a) {
        var a = t.z.R(a), b = t.z.Et(a), c = t.M, d = t.z.xg;
        c.yI > 0 && b.getBoxObjectFor && d(a, "position");
        var e = {left: 0, top: 0}, f;
        if (a == (c.S && !c.lu ? b.body : b.documentElement))return e;
        if (a.getBoundingClientRect) {
            a = a.getBoundingClientRect();
            e.left = Math.floor(a.left) + Math.max(b.documentElement.scrollLeft, b.body.scrollLeft);
            e.top = Math.floor(a.top) + Math.max(b.documentElement.scrollTop, b.body.scrollTop);
            e.left = e.left - b.documentElement.clientLeft;
            e.top = e.top - b.documentElement.clientTop;
            a = b.body;
            b = parseInt(d(a, "borderLeftWidth"));
            d = parseInt(d(a, "borderTopWidth"));
            if (c.S && !c.lu) {
                e.left = e.left - (isNaN(b) ? 2 : b);
                e.top = e.top - (isNaN(d) ? 2 : d)
            }
        } else {
            f = a;
            do {
                e.left = e.left + f.offsetLeft;
                e.top = e.top + f.offsetTop;
                if (c.Wz > 0 && d(f, "position") == "fixed") {
                    e.left = e.left + b.body.scrollLeft;
                    e.top = e.top + b.body.scrollTop;
                    break
                }
                f = f.offsetParent
            } while (f && f != a);
            if (c.opera > 0 || c.Wz > 0 && d(a, "position") == "absolute")e.top = e.top - b.body.offsetTop;
            for (f = a.offsetParent; f && f != b.body;) {
                e.left = e.left - f.scrollLeft;
                if (!c.opera || f.tagName != "TR")e.top = e.top - f.scrollTop;
                f = f.offsetParent
            }
        }
        return e
    };
    /firefox\/(\d+\.\d)/i.test(navigator.userAgent) && (t.M.Pe = +RegExp.$1);
    var ja = navigator.userAgent;
    /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ja) && !/chrome/i.test(ja) && (t.M.BJ = +(RegExp.$1 || RegExp.$2));
    /chrome\/(\d+\.\d)/i.test(navigator.userAgent) && (t.M.uy = +RegExp.$1);
    t.Mb = t.Mb || {};
    t.Mb.Xd = function (a, b) {
        var c, d, e = a.length;
        if ("function" == typeof b)for (d = 0; d < e; d++) {
            c = a[d];
            c = b.call(a, c, d);
            if (c === o)break
        }
        return a
    };
    t.Xd = t.Mb.Xd;
    t.lang.L = function () {
        return"TANGRAM__" + (window[t.L]._counter++).toString(36)
    };
    window[t.L]._counter = window[t.L]._counter || 1;
    window[t.L]._instances = window[t.L]._instances || {};
    t.lang.jk = function (a) {
        return"[object Function]" == Object.prototype.toString.call(a)
    };
    t.lang.la = function (a) {
        this.L = a || t.lang.L();
        window[t.L]._instances[this.L] = this
    };
    window[t.L]._instances = window[t.L]._instances || {};
    t.lang.la.prototype.Df = fa(1);
    t.lang.la.prototype.toString = function () {
        return"[object " + (this.hw || "Object") + "]"
    };
    t.lang.oq = function (a, b) {
        this.type = a;
        this.returnValue = i;
        this.target = b || n;
        this.currentTarget = n
    };
    t.lang.la.prototype.addEventListener = function (a, b, c) {
        if (t.lang.jk(b)) {
            !this.$f && (this.$f = {});
            var d = this.$f, e;
            if (typeof c == "string" && c) {
                if (/[^\w\-]/.test(c))throw"nonstandard key:" + c;
                e = b.Cz = c
            }
            a.indexOf("on") != 0 && (a = "on" + a);
            typeof d[a] != "object" && (d[a] = {});
            e = e || t.lang.L();
            b.Cz = e;
            d[a][e] = b
        }
    };
    t.lang.la.prototype.removeEventListener = function (a, b) {
        if (t.lang.jk(b))b = b.Cz; else if (!t.lang.qe(b))return;
        !this.$f && (this.$f = {});
        a.indexOf("on") != 0 && (a = "on" + a);
        var c = this.$f;
        c[a] && c[a][b] && delete c[a][b]
    };
    t.lang.la.prototype.dispatchEvent = function (a, b) {
        t.lang.qe(a) && (a = new t.lang.oq(a));
        !this.$f && (this.$f = {});
        var b = b || {}, c;
        for (c in b)a[c] = b[c];
        var d = this.$f, e = a.type;
        a.target = a.target || this;
        a.currentTarget = this;
        e.indexOf("on") != 0 && (e = "on" + e);
        t.lang.jk(this[e]) && this[e].apply(this, arguments);
        if (typeof d[e] == "object")for (c in d[e])d[e][c].apply(this, arguments);
        return a.returnValue
    };
    t.lang.ia = function (a, b, c) {
        var d, e, f = a.prototype;
        e = new Function;
        e.prototype = b.prototype;
        e = a.prototype = new e;
        for (d in f)e[d] = f[d];
        a.prototype.constructor = a;
        a.jB = b.prototype;
        if ("string" == typeof c)e.hw = c
    };
    t.ia = t.lang.ia;
    t.lang.Bc = function (a) {
        return window[t.L]._instances[a] || n
    };
    t.platform = t.platform || {};
    t.platform.CI = /macintosh/i.test(navigator.userAgent);
    t.platform.Xz = /windows/i.test(navigator.userAgent);
    t.platform.II = /x11/i.test(navigator.userAgent);
    t.platform.ik = /android/i.test(navigator.userAgent);
    /android (\d+\.\d)/i.test(navigator.userAgent) && (t.platform.dy = t.dy = RegExp.$1);
    t.platform.AI = /ipad/i.test(navigator.userAgent);
    t.platform.BI = /iphone/i.test(navigator.userAgent);
    function y(a, b) {
        b = window.event || b;
        a.clientX = b.clientX || b.pageX;
        a.clientY = b.clientY || b.pageY;
        a.offsetX = b.offsetX || b.layerX;
        a.offsetY = b.offsetY || b.layerY;
        a.screenX = b.screenX;
        a.screenY = b.screenY;
        a.ctrlKey = b.ctrlKey || b.metaKey;
        a.shiftKey = b.shiftKey;
        a.altKey = b.altKey;
        if (b.touches) {
            a.touches = [];
            for (var c = 0; c < b.touches.length; c++)a.touches.push({clientX: b.touches[c].clientX, clientY: b.touches[c].clientY, screenX: b.touches[c].screenX, screenY: b.touches[c].screenY, pageX: b.touches[c].pageX, pageY: b.touches[c].pageY, target: b.touches[c].target, identifier: b.touches[c].identifier})
        }
        if (b.changedTouches) {
            a.changedTouches = [];
            for (c = 0; c < b.changedTouches.length; c++)a.changedTouches.push({clientX: b.changedTouches[c].clientX, clientY: b.changedTouches[c].clientY, screenX: b.changedTouches[c].screenX, screenY: b.changedTouches[c].screenY, pageX: b.changedTouches[c].pageX, pageY: b.changedTouches[c].pageY, target: b.changedTouches[c].target, identifier: b.changedTouches[c].identifier})
        }
        if (b.targetTouches) {
            a.targetTouches = [];
            for (c = 0; c < b.targetTouches.length; c++)a.targetTouches.push({clientX: b.targetTouches[c].clientX, clientY: b.targetTouches[c].clientY, screenX: b.targetTouches[c].screenX, screenY: b.targetTouches[c].screenY, pageX: b.targetTouches[c].pageX, pageY: b.targetTouches[c].pageY, target: b.targetTouches[c].target, identifier: b.targetTouches[c].identifier})
        }
        a.rotation = b.rotation;
        a.scale = b.scale;
        return a
    }

    t.lang.Xo = function (a) {
        var b = window[t.L];
        b.YD && delete b.YD[a]
    };
    t.event = {};
    t.C = t.event.C = function (a, b, c) {
        if (!(a = t.R(a)))return a;
        b = b.replace(/^on/, "");
        a.addEventListener ? a.addEventListener(b, c, o) : a.attachEvent && a.attachEvent("on" + b, c);
        return a
    };
    t.Yc = t.event.Yc = function (a, b, c) {
        if (!(a = t.R(a)))return a;
        b = b.replace(/^on/, "");
        a.removeEventListener ? a.removeEventListener(b, c, o) : a.detachEvent && a.detachEvent("on" + b, c);
        return a
    };
    t.z.$t = function (a, b) {
        if (!a || !a.className || typeof a.className != "string")return o;
        var c = -1;
        try {
            c = a.className == b || a.className.search(RegExp("(\\s|^)" + b + "(\\s|$)"))
        } catch (d) {
            return o
        }
        return c > -1
    };
    t.it = function () {
        function a(a) {
            document.addEventListener && (this.element = a, this.$y = this.Ri ? "touchstart" : "mousedown", this.mt = this.Ri ? "touchmove" : "mousemove", this.lt = this.Ri ? "touchend" : "mouseup", this.uu = o, this.fB = this.eB = 0, this.element.addEventListener(this.$y, this, o), ha.C(this.element, "mousedown", q()), this.handleEvent(n))
        }

        a.prototype = {Ri: "ontouchstart"in window || "createTouch"in document, start: function (a) {
            A(a);
            this.uu = o;
            this.eB = this.Ri ? a.touches[0].clientX : a.clientX;
            this.fB = this.Ri ? a.touches[0].clientY : a.clientY;
            this.element.addEventListener(this.mt, this, o);
            this.element.addEventListener(this.lt, this, o)
        }, move: function (a) {
            ka(a);
            var c = this.Ri ? a.touches[0].clientY : a.clientY;
            if (10 < Math.abs((this.Ri ? a.touches[0].clientX : a.clientX) - this.eB) || 10 < Math.abs(c - this.fB))this.uu = i
        }, end: function (a) {
            ka(a);
            this.uu || (a = document.createEvent("Event"), a.initEvent("tap", o, i), this.element.dispatchEvent(a));
            this.element.removeEventListener(this.mt, this, o);
            this.element.removeEventListener(this.lt, this, o)
        }, handleEvent: function (a) {
            if (a)switch (a.type) {
                case this.$y:
                    this.start(a);
                    break;
                case this.mt:
                    this.move(a);
                    break;
                case this.lt:
                    this.end(a)
            }
        }};
        return function (b) {
            return new a(b)
        }
    }();
    var B = window.BMap || {};
    B.version = "2.0";
    B.El = [];
    B.rd = function (a) {
        this.El.push(a)
    };
    B.Qr = [];
    B.Au = function (a) {
        this.Qr.push(a)
    };
    B.HF = B.apiLoad || q();
    var la = window.BMAP_AUTHENTIC_KEY;
    window.BMAP_AUTHENTIC_KEY = n;
    var ma = window.BMap_loadScriptTime, na = (new Date).getTime(), oa = n, pa = i;

    function qa(a, b) {
        if (a = t.R(a)) {
            var c = this;
            t.lang.la.call(c);
            b = b || {};
            c.F = {Fs: 200, Eb: i, cp: o, ct: i, gm: o, im: o, gt: i, hm: i, ap: i, ld: 25, QK: 240, vF: 450, mb: C.mb, mc: C.mc, wp: !!b.wp, oc: b.minZoom || 1, od: b.maxZoom || 18, yb: b.mapType || ra, MM: o, bp: o, Ws: 500, NL: b.enableHighResolution !== o, dp: b.enableMapClick !== o, devicePixelRatio: b.devicePixelRatio || window.devicePixelRatio || 1, DB: b.vectorMapLevel || 12, nc: b.mapStyle || n, jA: b.logoControl === o ? o : i, OF: ["chrome"]};
            c.F.nc && (this.Kz(c.F.nc.controls), this.Lz(c.F.nc.geotableId));
            c.F.nc && c.F.nc.styleId && c.yz(c.F.nc.styleId);
            c.F.Cf = {dark: {backColor: "#2D2D2D", textColor: "#bfbfbf", iconUrl: "dicons"}, normal: {backColor: "#F3F1EC", textColor: "#c61b1b", iconUrl: "icons"}, light: {backColor: "#EBF8FC", textColor: "#017fb4", iconUrl: "licons"}};
            b.enableAutoResize && (c.F.ap = b.enableAutoResize);
            t.platform.ik && 1.5 < window.devicePixelRatio && (c.F.devicePixelRatio = 1.5);
            for (var d = c.F.OF, e = 0, f = d.length; e < f; e++)if (t.M[d[e]]) {
                c.F.devicePixelRatio = 1;
                break
            }
            c.xa = a;
            c.cs(a);
            a.unselectable = "on";
            a.innerHTML = "";
            a.appendChild(c.ua());
            b.size && this.Ic(b.size);
            d = c.Fb();
            c.width = d.width;
            c.height = d.height;
            c.offsetX = 0;
            c.offsetY = 0;
            c.platform = a.firstChild;
            c.Hd = c.platform.firstChild;
            c.Hd.style.width = c.width + "px";
            c.Hd.style.height = c.height + "px";
            c.Lc = {};
            c.Le = new F(0, 0);
            c.Ob = new F(0, 0);
            c.na = 1;
            c.ac = 0;
            c.Ns = n;
            c.Ms = n;
            c.Db = "";
            c.As = "";
            c.rf = {};
            c.rf.custom = {};
            c.ya = 0;
            c.Q = new sa(a, {Uj: "api"});
            c.Q.H();
            c.Q.Xu(c);
            b = b || {};
            d = c.yb = c.F.yb;
            c.Tc = d.Ni();
            d === ta && ua(5002);
            (d === va || d === xa) && ua(5003);
            d = c.F;
            d.zB = b.minZoom;
            d.yB = b.maxZoom;
            c.Lq();
            c.D = {Gb: o, kb: 0, Cm: 0, bA: 0, qM: 0, ys: o, Ku: -1, yd: []};
            c.platform.style.cursor = c.F.mb;
            for (e = 0; e < B.El.length; e++)B.El[e](c);
            c.D.Ku = e;
            c.N();
            G.load("map", function () {
                c.Wb()
            });
            c.F.dp && (setTimeout(function () {
                ua("load_mapclick")
            }, 1E3), G.load("mapclick", function () {
                window.MPC_Mgr = new ya(c)
            }, i));
            za() && G.load("oppc", function () {
                c.Fq()
            });
            H() && G.load("opmb", function () {
                c.Fq()
            });
            a = n;
            c.ms = []
        }
    }

    t.lang.ia(qa, t.lang.la, "Map");
    t.extend(qa.prototype, {ua: function () {
        var a = J("div"), b = a.style;
        b.overflow = "visible";
        b.position = "absolute";
        b.zIndex = "0";
        b.top = b.left = "0px";
        var b = J("div", {"class": "BMap_mask"}), c = b.style;
        c.position = "absolute";
        c.top = c.left = "0px";
        c.zIndex = "9";
        c.overflow = "hidden";
        c.WebkitUserSelect = "none";
        a.appendChild(b);
        return a
    }, cs: function (a) {
        var b = a.style;
        b.overflow = "hidden";
        "absolute" != Aa(a).position && (b.position = "relative", b.zIndex = 0);
        b.backgroundColor = "#F3F1EC";
        b.color = "#000";
        b.textAlign = "left"
    }, N: function () {
        var a = this;
        a.Ml = function () {
            var b = a.Fb();
            if (a.width != b.width || a.height != b.height) {
                var c = new K(a.width, a.height), d = new L("onbeforeresize");
                d.size = c;
                a.dispatchEvent(d);
                a.Wg((b.width - a.width) / 2, (b.height - a.height) / 2);
                a.Hd.style.width = (a.width = b.width) + "px";
                a.Hd.style.height = (a.height = b.height) + "px";
                c = new L("onresize");
                c.size = b;
                a.dispatchEvent(c)
            }
        };
        a.F.ap && (a.D.Pl = setInterval(a.Ml, 80))
    }, Wg: function (a, b, c, d) {
        var e = this.ha().Ib(this.U()), f = this.Tc, g = i;
        c && F.Oz(c) && (this.Le = new F(c.lng, c.lat), g = o);
        if (c = c && d ? f.Vi(c, this.Db) : this.Ob)if (this.Ob = new F(c.lng + a * e, c.lat - b * e), (a = f.uh(this.Ob, this.Db)) && g)this.Le = a
    }, gf: function (a, b) {
        if (Ba(a) && (a = this.xj(a).zoom, a != this.na)) {
            this.ac = this.na;
            this.na = a;
            var c;
            b ? c = b : this.Se() && (c = this.Se().ca());
            c && (c = this.nb(c, this.ac), this.Wg(this.width / 2 - c.x, this.height / 2 - c.y, this.Ua(c, this.ac), i));
            this.dispatchEvent(new L("onzoomstart"));
            this.dispatchEvent(new L("onzoomstartcode"))
        }
    }, Jc: function (a) {
        this.gf(a)
    }, pv: function (a) {
        this.gf(this.na + 1, a)
    }, qv: function (a) {
        this.gf(this.na - 1, a)
    }, ue: function (a) {
        a instanceof F && (this.Ob = this.Tc.Vi(a, this.Db), this.Le = F.Oz(a) ? new F(a.lng, a.lat) : this.Tc.uh(this.Ob, this.Db))
    }, te: function (a, b) {
        a = Math.round(a) || 0;
        b = Math.round(b) || 0;
        this.Wg(-a, -b)
    }, Eo: function (a) {
        a && Ca(a.Qd) && (a.Qd(this), this.dispatchEvent(new L("onaddcontrol", a)))
    }, NA: function (a) {
        a && Ca(a.remove) && (a.remove(), this.dispatchEvent(new L("onremovecontrol", a)))
    }, Oj: function (a) {
        a && Ca(a.ta) && (a.ta(this), this.dispatchEvent(new L("onaddcontextmenu", a)))
    }, rk: function (a) {
        a && Ca(a.remove) && (this.dispatchEvent(new L("onremovecontextmenu", a)), a.remove())
    }, Wa: function (a) {
        a && Ca(a.Qd) && (a.Qd(this), this.dispatchEvent(new L("onaddoverlay", a)))
    }, Uc: function (a) {
        a && Ca(a.remove) && (a.remove(), this.dispatchEvent(new L("onremoveoverlay", a)))
    }, wy: function () {
        this.dispatchEvent(new L("onclearoverlays"))
    }, Af: function (a) {
        a && this.dispatchEvent(new L("onaddtilelayer", a))
    }, Qf: function (a) {
        a && this.dispatchEvent(new L("onremovetilelayer", a))
    }, Cg: function (a) {
        if (this.yb !== a) {
            var b = new L("onsetmaptype");
            b.HM = this.yb;
            this.yb = this.F.yb = a;
            this.Tc = this.yb.Ni();
            this.Wg(0, 0, this.Ga(), i);
            this.Lq();
            var c = this.xj(this.U()).zoom;
            this.gf(c);
            this.dispatchEvent(b);
            b = new L("onmaptypechange");
            b.na = c;
            b.yb = a;
            this.dispatchEvent(b);
            (a === va || a === xa) && ua(5003)
        }
    }, ve: function (a) {
        var b = this;
        if (a instanceof F)b.ue(a, {noAnimation: i}); else if (Da(a))if (b.yb == ta) {
            var c = C.Cs[a];
            c && (pt = c.m, b.ve(pt))
        } else {
            var d = this.Kw();
            d.Zu(function (c) {
                0 == d.Oi() && 2 == d.oa.result.type && (b.ve(c.kh(0).point), ta.Wj(a) && b.Wu(a))
            });
            d.search(a, {log: "center"})
        }
    }, Wd: function (a, b) {
        var c = this;
        if (Da(a))if (c.yb == ta) {
            var d = C.Cs[a];
            d && (pt = d.m, c.Wd(pt, b))
        } else {
            var e = c.Kw();
            e.Zu(function (d) {
                if (0 == e.Oi() && 2 == e.oa.result.type) {
                    var d = d.kh(0).point, f = b || N.yt(e.oa.content.level, c);
                    c.Wd(d, f);
                    ta.Wj(a) && c.Wu(a)
                }
            });
            e.search(a, {log: "center"})
        } else if (a instanceof F && b) {
            b = c.xj(b).zoom;
            c.ac = c.na || b;
            c.na = b;
            c.Le = new F(a.lng, a.lat);
            c.Ob = c.Tc.Vi(c.Le, c.Db);
            c.Ns = c.Ns || c.na;
            c.Ms = c.Ms || c.Le;
            var d = new L("onload"), f = new L("onloadcode");
            d.point = new F(a.lng, a.lat);
            d.pixel = c.nb(c.Le, c.na);
            d.zoom = b;
            c.loaded || (c.loaded = i, c.dispatchEvent(d), oa || (oa = Ea()));
            c.dispatchEvent(f);
            c.dispatchEvent(new L("onmoveend"));
            c.ac != c.na && c.dispatchEvent(new L("onzoomend"))
        }
    }, Kw: function () {
        this.D.fA || (this.D.fA = new Fa(1));
        return this.D.fA
    }, reset: function () {
        this.Wd(this.Ms, this.Ns, i)
    }, enableDragging: function () {
        this.F.Eb = i
    }, disableDragging: function () {
        this.F.Eb = o
    }, enableInertialDragging: function () {
        this.F.bp = i
    }, disableInertialDragging: function () {
        this.F.bp = o
    }, enableScrollWheelZoom: function () {
        this.F.im = i
    }, disableScrollWheelZoom: function () {
        this.F.im = o
    }, enableContinuousZoom: function () {
        this.F.gm = i
    }, disableContinuousZoom: function () {
        this.F.gm = o
    }, enableDoubleClickZoom: function () {
        this.F.ct = i
    }, disableDoubleClickZoom: function () {
        this.F.ct = o
    }, enableKeyboard: function () {
        this.F.cp = i
    }, disableKeyboard: function () {
        this.F.cp = o
    }, enablePinchToZoom: function () {
        this.F.hm = i
    }, disablePinchToZoom: function () {
        this.F.hm = o
    }, enableAutoResize: function () {
        this.F.ap = i;
        this.Ml();
        this.D.Pl || (this.D.Pl = setInterval(this.Ml, 80))
    }, disableAutoResize: function () {
        this.F.ap = o;
        this.D.Pl && (clearInterval(this.D.Pl), this.D.Pl = n)
    }, Fb: function () {
        return this.$l && this.$l instanceof K ? new K(this.$l.width, this.$l.height) : new K(this.xa.clientWidth, this.xa.clientHeight)
    }, Ic: function (a) {
        a && a instanceof K ? (this.$l = a, this.xa.style.width = a.width + "px", this.xa.style.height = a.height + "px") : this.$l = n
    }, Ga: s("Le"), U: s("na"), bG: function () {
        this.Ml()
    }, xj: function (a) {
        var b = this.F.oc, c = this.F.od, d = o;
        a < b && (d = i, a = b);
        a > c && (d = i, a = c);
        return{zoom: a, nt: d}
    }, Ba: s("xa"), nb: function (a, b) {
        b = b || this.U();
        return this.Tc.nb(a, b, this.Ob, this.Fb(), this.Db)
    }, Ua: function (a, b) {
        b = b || this.U();
        return this.Tc.Ua(a, b, this.Ob, this.Fb(), this.Db)
    }, $e: function (a, b) {
        if (a) {
            var c = this.nb(new F(a.lng, a.lat), b);
            c.x -= this.offsetX;
            c.y -= this.offsetY;
            return c
        }
    }, FA: function (a, b) {
        if (a) {
            var c = new O(a.x, a.y);
            c.x += this.offsetX;
            c.y += this.offsetY;
            return this.Ua(c, b)
        }
    }, pointToPixelFor3D: function (a, b) {
        var c = map.Db;
        this.yb == ta && c && Ga.By(a, this, b)
    }, CM: function (a, b) {
        var c = map.Db;
        this.yb == ta && c && Ga.Ay(a, this, b)
    }, DM: function (a, b) {
        var c = this, d = map.Db;
        c.yb == ta && d && Ga.By(a, c, function (a) {
            a.x -= c.offsetX;
            a.y -= c.offsetY;
            b && b(a)
        })
    }, BM: function (a, b) {
        var c = map.Db;
        this.yb == ta && c && (a.x += this.offsetX, a.y += this.offsetY, Ga.Ay(a, this, b))
    }, vg: function (a) {
        if (!this.iu())return new Ia;
        var b = a || {}, a = b.margins || [0, 0, 0, 0], c = b.zoom || n, b = this.Ua({x: a[3], y: this.height - a[2]}, c), a = this.Ua({x: this.width - a[1], y: a[0]}, c);
        return new Ia(b, a)
    }, iu: function () {
        return!!this.loaded
    }, sD: function (a, b) {
        for (var c = this.ha(), d = b.margins || [10, 10, 10, 10], e = b.zoomFactor || 0, f = d[1] + d[3], d = d[0] + d[2], g = c.Yj(), j = c = c.Li(); j >= g; j--) {
            var k = this.ha().Ib(j);
            if (a.lv().lng / k < this.width - f && a.lv().lat / k < this.height - d)break
        }
        j += e;
        j < g && (j = g);
        j > c && (j = c);
        return j
    }, qp: function (a, b) {
        var c = {center: this.Ga(), zoom: this.U()};
        if (!a || !a instanceof Ia && 0 == a.length || a instanceof Ia && a.zg())return c;
        var d = [];
        a instanceof Ia ? (d.push(a.oe()), d.push(a.pe())) : d = a.slice(0);
        for (var b = b || {}, e = [], f = 0, g = d.length; f < g; f++)e.push(this.Tc.Vi(d[f], this.Db));
        d = new Ia;
        for (f = e.length - 1; 0 <= f; f--)d.extend(e[f]);
        if (d.zg())return c;
        c = d.Ga();
        e = this.sD(d, b);
        b.margins && (d = b.margins, f = (d[1] - d[3]) / 2, d = (d[0] - d[2]) / 2, g = this.ha().Ib(e), b.offset && (f = b.offset.width, d = b.offset.height), c.lng += g * f, c.lat += g * d);
        c = this.Tc.uh(c, this.Db);
        return{center: c, zoom: e}
    }, zk: function (a, b) {
        var c;
        c = a && a.center ? a : this.qp(a, b);
        var b = b || {}, d = b.delay || 200;
        if (c.zoom == this.na && b.enableAnimation != o) {
            var e = this;
            setTimeout(function () {
                e.ue(c.center, {duration: 210})
            }, d)
        } else this.Wd(c.center, c.zoom)
    }, Ue: s("Lc"), Se: function () {
        return this.D.Ja && this.D.Ja.za() ? this.D.Ja : n
    }, getDistance: function (a, b) {
        if (a && b) {
            var c = 0, c = P.Dt(a, b);
            if (c == n || c == aa)c = 0;
            return c
        }
    }, Pt: function () {
        var a = [], b = this.fa, c = this.ad;
        if (b)for (var d in b)b[d]instanceof Q && a.push(b[d]);
        if (c) {
            d = 0;
            for (b = c.length; d < b; d++)a.push(c[d])
        }
        return a
    }, ha: s("yb"), Fq: function () {
        for (var a = this.D.Ku; a < B.El.length; a++)B.El[a](this);
        this.D.Ku = a
    }, Wu: function (a) {
        this.Db = ta.Wj(a);
        this.As = ta.qH(this.Db);
        this.yb == ta && this.Tc instanceof Ja && (this.Tc.Is = this.Db)
    }, setDefaultCursor: function (a) {
        this.F.mb = a;
        this.platform && (this.platform.style.cursor = this.F.mb)
    }, getDefaultCursor: function () {
        return this.F.mb
    }, setDraggingCursor: function (a) {
        this.F.mc = a
    }, getDraggingCursor: function () {
        return this.F.mc
    }, ph: ca(o), Ho: function (a, b) {
        b ? this.rf[b] || (this.rf[b] = {}) : b = "custom";
        a.tag = b;
        a instanceof Ka && (this.rf[b][a.L] = a, a.ta(this));
        var c = this;
        G.load("hotspot", function () {
            c.Fq()
        })
    }, qJ: function (a, b) {
        b || (b = "custom");
        this.rf[b][a.L] && delete this.rf[b][a.L]
    }, si: function (a) {
        a || (a = "custom");
        this.rf[a] = {}
    }, Lq: function () {
        var a = this.ph() ? this.yb.k.kI : this.yb.Yj(), b = this.ph() ? this.yb.k.jI : this.yb.Li(), c = this.F;
        c.oc = c.zB || a;
        c.od = c.yB || b;
        c.oc < a && (c.oc = a);
        c.od > b && (c.od = b)
    }, setMinZoom: function (a) {
        a > this.F.od && (a = this.F.od);
        this.F.zB = a;
        this.Px()
    }, setMaxZoom: function (a) {
        a < this.F.oc && (a = this.F.oc);
        this.F.yB = a;
        this.Px()
    }, Px: function () {
        this.Lq();
        var a = this.F;
        this.na < a.oc ? this.Jc(a.oc) : this.na > a.od && this.Jc(a.od);
        var b = new L("onzoomspanchange");
        b.oc = a.oc;
        b.od = a.od;
        this.dispatchEvent(b)
    }, iM: s("ms"), getKey: function () {
        return la
    }, XA: function (a) {
        if (a && (a.styleId ? this.yz(a.styleId) : (this.F.nc = a, this.dispatchEvent(new L("onsetcustomstyles", a)), this.Kz(a.controls), this.Lz(this.F.nc.geotableId)), a.style))a = this.F.Cf[a.style] ? this.F.Cf[a.style].backColor : this.F.Cf.normal.backColor, this.Ba().style.backgroundColor = a
    }, yz: function (a) {
        var b = this;
        La("http://api.map.baidu.com/style/poi/personalize?method=get&ak=" + la + "&id=" + a, function (a) {
            if (a && a.content && 0 < a.content.length) {
                var a = a.content[0], d = {};
                a.features && 0 < a.features.length && (d.features = a.features);
                a.controllers && 0 < a.controllers.length && (d.controls = a.controllers);
                a.style && "" != a.style && (d.style = a.style);
                a.geotable_id && "" != a.geotable_id && (d.geotableId = a.geotable_id);
                setTimeout(function () {
                    b.XA(d)
                }, 200)
            }
        })
    }, Kz: function (a) {
        this.controls || (this.controls = {navigationControl: new Ma, scaleControl: new Na, overviewMapControl: new Oa, mapTypeControl: new Pa});
        var b = this, c;
        for (c in this.controls)b.NA(b.controls[c]);
        a = a || [];
        t.Mb.Xd(a, function (a) {
            b.Eo(b.controls[a])
        })
    }, Lz: function (a) {
        a ? this.Yl && this.Yl.he == a || (this.Qf(this.Yl), this.Yl = new Qa({geotableId: a}), this.Af(this.Yl)) : this.Qf(this.Yl)
    }, tc: function () {
        var a = this.U() >= this.F.DB && this.ha() == ra && 18 >= this.U(), b = o;
        try {
            document.createElement("canvas").getContext("2d"), b = i
        } catch (c) {
            b = o
        }
        return a && b
    }, getCurrentCity: function () {
        return{name: this.Tl, code: this.vs}
    }, getPanorama: s("Q"), setPanorama: function (a) {
        this.Q = a;
        this.Q.Xu(this)
    }});
    function ua(a, b) {
        if (a) {
            var b = b || {}, c = "", d;
            for (d in b)c = c + "&" + d + "=" + encodeURIComponent(b[d]);
            var e = function (a) {
                a && (Ra = i, setTimeout(function () {
                    Sa.src = "http://api.map.baidu.com/images/blank.gif?" + a.src
                }, 50))
            }, f = function () {
                var a = Ta.shift();
                a && e(a)
            };
            d = (1E8 * Math.random()).toFixed(0);
            Ra ? Ta.push({src: "product=jsapi&v=" + B.version + "&t=" + d + "&code=" + a + c}) : e({src: "product=jsapi&v=" + B.version + "&t=" + d + "&code=" + a + c});
            Ua || (t.C(Sa, "load", function () {
                Ra = o;
                f()
            }), t.C(Sa, "error", function () {
                Ra = o;
                f()
            }), Ua = i)
        }
    }

    var Ra, Ua, Ta = [], Sa = new Image;
    ua(5E3);
    function Va(a) {
        var b = {duration: 1E3, ld: 30, dh: 0, ae: Wa.dA, yu: q()};
        this.be = [];
        if (a)for (var c in a)b[c] = a[c];
        this.k = b;
        if (Ba(b.dh)) {
            var d = this;
            setTimeout(function () {
                d.start()
            }, b.dh)
        } else b.dh != Xa && this.start()
    }

    var Xa = "INFINITE";
    Va.prototype.start = function () {
        this.Bn = Ea();
        this.br = this.Bn + this.k.duration;
        Ya(this)
    };
    Va.prototype.add = fa(0);
    function Ya(a) {
        var b = Ea();
        b >= a.br ? (Ca(a.k.ua) && a.k.ua(a.k.ae(1)), Ca(a.k.finish) && a.k.finish(), 0 < a.be.length && (b = a.be[0], b.be = [].concat(a.be.slice(1)), b.start())) : (a.Vp = a.k.ae((b - a.Bn) / a.k.duration), Ca(a.k.ua) && a.k.ua(a.Vp), a.gv || (a.Kl = setTimeout(function () {
            Ya(a)
        }, 1E3 / a.k.ld)))
    }

    Va.prototype.stop = function (a) {
        this.gv = i;
        for (var b = 0; b < this.be.length; b++)this.be[b].stop(), this.be[b] = n;
        this.be.length = 0;
        this.Kl && (clearTimeout(this.Kl), this.Kl = n);
        this.k.yu(this.Vp);
        a && (this.br = this.Bn, Ya(this))
    };
    Va.prototype.cancel = fa(2);
    var Wa = {dA: function (a) {
        return a
    }, reverse: function (a) {
        return 1 - a
    }, $s: function (a) {
        return a * a
    }, $G: function (a) {
        return Math.pow(a, 3)
    }, bH: function (a) {
        return-(a * (a - 2))
    }, aH: function (a) {
        return Math.pow(a - 1, 3) + 1
    }, Wy: function (a) {
        return 0.5 > a ? 2 * a * a : -2 * (a - 2) * a - 1
    }, IL: function (a) {
        return 0.5 > a ? 4 * Math.pow(a, 3) : 4 * Math.pow(a - 1, 3) + 1
    }, JL: function (a) {
        return(1 - Math.cos(Math.PI * a)) / 2
    }};
    Wa["ease-in"] = Wa.$s;
    Wa["ease-out"] = Wa.bH;
    var C = {ba: "http://api0.map.bdimg.com/images/", Cs: {"\u5317\u4eac": {Np: "bj", m: new F(116.403874, 39.914889)}, "\u4e0a\u6d77": {Np: "sh", m: new F(121.487899, 31.249162)}, "\u6df1\u5733": {Np: "sz", m: new F(114.025974, 22.546054)}, "\u5e7f\u5dde": {Np: "gz", m: new F(113.30765, 23.120049)}}, fontFamily: "arial,sans-serif"};
    t.M.Pe ? (t.extend(C, {Ny: "url(" + C.ba + "ruler.cur),crosshair", mb: "-moz-grab", mc: "-moz-grabbing"}), t.platform.Xz && (C.fontFamily = "arial,simsun,sans-serif")) : t.M.uy || t.M.BJ ? t.extend(C, {Ny: "url(" + C.ba + "ruler.cur) 2 6,crosshair", mb: "url(" + C.ba + "openhand.cur) 8 8,default", mc: "url(" + C.ba + "closedhand.cur) 8 8,move"}) : t.extend(C, {Ny: "url(" + C.ba + "ruler.cur),crosshair", mb: "url(" + C.ba + "openhand.cur),default", mc: "url(" + C.ba + "closedhand.cur),move"});
    function Za(a, b) {
        var c = a.style;
        c.left = b[0] + "px";
        c.top = b[1] + "px"
    }

    function $a(a) {
        0 < t.M.S ? a.unselectable = "on" : a.style.MozUserSelect = "none"
    }

    function ab(a) {
        return a && a.parentNode && 11 != a.parentNode.nodeType
    }

    function bb(a, b) {
        t.z.eu(a, "beforeEnd", b);
        return a.lastChild
    }

    function cb(a) {
        for (var b = {left: 0, top: 0}; a && a.offsetParent;)b.left += a.offsetLeft, b.top += a.offsetTop, a = a.offsetParent;
        return b
    }

    function A(a) {
        a = window.event || a;
        a.stopPropagation ? a.stopPropagation() : a.cancelBubble = i
    }

    function db(a) {
        a = window.event || a;
        a.preventDefault ? a.preventDefault() : a.returnValue = o;
        return o
    }

    function ka(a) {
        A(a);
        return db(a)
    }

    function eb() {
        var a = document.documentElement, b = document.body;
        return a && (a.scrollTop || a.scrollLeft) ? [a.scrollTop, a.scrollLeft] : b ? [b.scrollTop, b.scrollLeft] : [0, 0]
    }

    function fb(a, b) {
        if (a && b)return Math.round(Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)))
    }

    function gb(a, b) {
        var c = [], b = b || function (a) {
            return a
        }, d;
        for (d in a)c.push(d + "=" + b(a[d]));
        return c.join("&")
    }

    function J(a, b, c) {
        var d = document.createElement(a);
        c && (d = document.createElementNS(c, a));
        return t.z.Uu(d, b || {})
    }

    function Aa(a) {
        if (a.currentStyle)return a.currentStyle;
        if (a.ownerDocument && a.ownerDocument.defaultView)return a.ownerDocument.defaultView.getComputedStyle(a, n)
    }

    function Ca(a) {
        return"function" == typeof a
    }

    function Ba(a) {
        return"number" == typeof a
    }

    function Da(a) {
        return"string" == typeof a
    }

    function hb(a) {
        return"undefined" != typeof a
    }

    function ib(a) {
        return"object" == typeof a
    }

    var jb = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

    function lb(a) {
        var b = "", c, d, e = "", f, g = "", j = 0;
        f = /[^A-Za-z0-9\+\/\=]/g;
        if (!a || f.exec(a))return a;
        a = a.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        do c = jb.indexOf(a.charAt(j++)), d = jb.indexOf(a.charAt(j++)), f = jb.indexOf(a.charAt(j++)), g = jb.indexOf(a.charAt(j++)), c = c << 2 | d >> 4, d = (d & 15) << 4 | f >> 2, e = (f & 3) << 6 | g, b += String.fromCharCode(c), 64 != f && (b += String.fromCharCode(d)), 64 != g && (b += String.fromCharCode(e)); while (j < a.length);
        return b
    }

    var L = t.lang.oq;

    function H() {
        return!(!t.platform.BI && !t.platform.AI && !t.platform.ik)
    }

    function za() {
        return!(!t.platform.Xz && !t.platform.CI && !t.platform.II)
    }

    function Ea() {
        return(new Date).getTime()
    }

    function mb() {
        var a = document.body.appendChild(J("div"));
        a.innerHTML = '<v:shape id="vml_tester1" adj="1" />';
        var b = a.firstChild;
        if (!b.style)return o;
        b.style.behavior = "url(#default#VML)";
        b = b ? "object" == typeof b.adj : i;
        a.parentNode.removeChild(a);
        return b
    }

    function nb() {
        return!!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1")
    }

    function ob() {
        return!!J("canvas").getContext
    };
    function La(a, b) {
        if (b) {
            var c = (1E5 * Math.random()).toFixed(0);
            B._rd["_cbk" + c] = function (a) {
                b && b(a);
                delete B._rd["_cbk" + c]
            };
            a += "&callback=BMap._rd._cbk" + c
        }
        var d = J("script", {src: a, type: "text/javascript", charset: "utf-8"});
        d.addEventListener ? d.addEventListener("load", function (a) {
            a = a.target;
            a.parentNode.removeChild(a)
        }, o) : d.attachEvent && d.attachEvent("onreadystatechange", function () {
            var a = window.event.srcElement;
            a && ("loaded" == a.readyState || "complete" == a.readyState) && a.parentNode.removeChild(a)
        });
        setTimeout(function () {
            document.getElementsByTagName("head")[0].appendChild(d);
            d = n
        }, 1)
    };
    var pb = {map: "yzm00d", common: "gdx5gm", tile: "a3eyso", marker: "jhxop3", markeranimation: "ygp4ek", poly: "ueadjd", draw: "xvide4", drawbysvg: "urehax", drawbyvml: "cckpb2", drawbycanvas: "v0bddq", infowindow: "eicb5o", oppc: "4onuhp", opmb: "oskerp", menu: "l2utkb", control: "d1gwmb", navictrl: "hhwgz2", geoctrl: "lw1gax", copyrightctrl: "oe0kxo", scommon: "ojthft", local: "b1ev55", route: "fqqtny", othersearch: "2r3kzj", mapclick: "ajps3r", buslinesearch: "3myxaq", hotspot: "ndeby4", autocomplete: "uquuxf", coordtrans: "bpmno5", coordtransutils: "c5cfrn", clayer: "frdiae", panorama: "gsoea1", panoramaservice: "3fomck", panoramaflash: "nbtqkc", mapclick: "ajps3r", vector: "wiheem"};
    t.eq = function () {
        function a(a) {
            return d && !!c[b + a + "_" + pb[a]]
        }

        var b = "BMap_", c = window.localStorage, d = "localStorage"in window && c !== n && c !== aa;
        return{FI: d, set: function (a, f) {
            if (d) {
                for (var g = b + a + "_", j = c.length, k; j--;)k = c.key(j), -1 < k.indexOf(g) && c.removeItem(k);
                try {
                    c.setItem(b + a + "_" + pb[a], f)
                } catch (l) {
                    c.clear()
                }
            }
        }, get: function (e) {
            return d && a(e) ? c.getItem(b + e + "_" + pb[e]) : o
        }, qy: a}
    }();
    function G() {
    }

    t.object.extend(G, {Fg: {Bv: -1, cC: 0, Ik: 1}, jz: function () {
        var a = "drawbysvg";
        nb() ? a = "drawbysvg" : mb() ? a = "drawbyvml" : ob() && (a = "drawbycanvas");
        return{control: [], marker: [], poly: ["marker", a], drawbysvg: ["draw"], drawbyvml: ["draw"], drawbycanvas: ["draw"], infowindow: ["common", "marker"], menu: [], oppc: [], opmb: [], scommon: [], local: ["scommon"], route: ["scommon"], othersearch: ["scommon"], autocomplete: ["scommon"], mapclick: ["scommon"], buslinesearch: ["route"], hotspot: [], coordtransutils: ["coordtrans"], clayer: ["tile"], panoramaservice: [], panorama: ["marker", "panoramaservice"], panoramaflash: ["panoramaservice"]}
    }, GM: {}, uv: {jC: "http://api0.map.bdimg.com/getmodules?v=2.0", sF: 5E3}, Os: o, vc: {Vh: {}, qj: [], so: []}, load: function (a, b, c) {
        var d = this.Xl(a);
        if (d.Ac == this.Fg.Ik)c && b(); else {
            if (d.Ac == this.Fg.Bv) {
                this.yy(a);
                this.LA(a);
                var e = this;
                e.Os == o && (e.Os = i, setTimeout(function () {
                    for (var a = [], b = 0, c = e.vc.qj.length; b < c; b++) {
                        var d = e.vc.qj[b], l = "";
                        ha.eq.qy(d) ? l = ha.eq.get(d) : (l = "", a.push(d + "_" + pb[d]));
                        e.vc.so.push({pA: d, su: l})
                    }
                    e.Os = o;
                    e.vc.qj.length = 0;
                    0 == a.length ? e.Zy() : La(e.uv.jC + "&mod=" + a.join(","))
                }, 1));
                d.Ac = this.Fg.cC
            }
            d.Cn.push(b)
        }
    }, yy: function (a) {
        if (a && this.jz()[a])for (var a = this.jz()[a], b = 0; b < a.length; b++)this.yy(a[b]), this.vc.Vh[a[b]] || this.LA(a[b])
    }, LA: function (a) {
        for (var b = 0; b < this.vc.qj.length; b++)if (this.vc.qj[b] == a)return;
        this.vc.qj.push(a)
    }, AJ: function (a, b) {
        var c = this.Xl(a);
        try {
            eval(b)
        } catch (d) {
            return
        }
        c.Ac = this.Fg.Ik;
        for (var e = 0, f = c.Cn.length; e < f; e++)c.Cn[e]();
        c.Cn.length = 0
    }, qy: function (a, b) {
        var c = this;
        c.timeout = setTimeout(function () {
            c.vc.Vh[a].Ac != c.Fg.Ik ? (c.remove(a), c.load(a, b)) : clearTimeout(c.timeout)
        }, c.uv.sF)
    }, Xl: function (a) {
        this.vc.Vh[a] || (this.vc.Vh[a] = {}, this.vc.Vh[a].Ac = this.Fg.Bv, this.vc.Vh[a].Cn = []);
        return this.vc.Vh[a]
    }, remove: function (a) {
        delete this.Xl(a)
    }, $F: function (a, b) {
        for (var c = this.vc.so, d = i, e = 0, f = c.length; e < f; e++)"" == c[e].su && (c[e].pA == a ? c[e].su = b : d = o);
        d && this.Zy()
    }, Zy: function () {
        for (var a = this.vc.so, b = 0, c = a.length; b < c; b++)this.AJ(a[b].pA, a[b].su);
        this.vc.so.length = 0
    }});
    function O(a, b) {
        this.x = a || 0;
        this.y = b || 0;
        this.x = this.x;
        this.y = this.y
    }

    O.prototype.bb = function (a) {
        return a && a.x == this.x && a.y == this.y
    };
    function K(a, b) {
        this.width = a || 0;
        this.height = b || 0
    }

    K.prototype.bb = function (a) {
        return a && this.width == a.width && this.height == a.height
    };
    function Ka(a, b) {
        a && (this.qb = a, this.L = "spot" + Ka.L++, b = b || {}, this.lg = b.text || "", this.io = b.offsets ? b.offsets.slice(0) : [5, 5, 5, 5], this.Qx = b.userData || n, this.uf = b.minZoom || n, this.Td = b.maxZoom || n)
    }

    Ka.L = 0;
    t.extend(Ka.prototype, {ta: function (a) {
        this.uf == n && (this.uf = a.F.oc);
        this.Td == n && (this.Td = a.F.od)
    }, da: function (a) {
        a instanceof F && (this.qb = a)
    }, ca: s("qb"), Vm: ba("lg"), Vt: s("lg"), setUserData: ba("Qx"), getUserData: s("Qx")});
    function R() {
        this.A = n;
        this.wb = "control";
        this.vb = this.ky = i
    }

    t.lang.ia(R, t.lang.la, "Control");
    t.extend(R.prototype, {initialize: function (a) {
        this.A = a;
        if (this.B)return a.xa.appendChild(this.B), this.B
    }, Qd: function (a) {
        !this.B && (this.initialize && Ca(this.initialize)) && (this.B = this.initialize(a));
        this.k = this.k || {bf: o};
        this.cs();
        this.no();
        this.B && (this.B.sl = this)
    }, cs: function () {
        var a = this.B;
        if (a) {
            var b = a.style;
            b.position = "absolute";
            b.zIndex = this.Hq || "10";
            b.MozUserSelect = "none";
            b.WebkitTextSizeAdjust = "none";
            this.k.bf || t.z.$a(a, "BMap_noprint");
            H() || t.C(a, "contextmenu", ka)
        }
    }, remove: function () {
        this.A = n;
        this.B && (this.B.parentNode && this.B.parentNode.removeChild(this.B), this.B = this.B.sl = n)
    }, ab: function () {
        this.B = bb(this.A.xa, "<div unselectable='on'></div>");
        this.vb == o && t.z.H(this.B);
        return this.B
    }, no: function () {
        this.Sb(this.k.anchor)
    }, Sb: function (a) {
        if (this.tL || !Ba(a) || isNaN(a) || a < qb || 3 < a)a = this.defaultAnchor;
        this.k = this.k || {bf: o};
        this.k.ga = this.k.ga || this.defaultOffset;
        var b = this.k.anchor;
        this.k.anchor = a;
        if (this.B) {
            var c = this.B, d = this.k.ga.width, e = this.k.ga.height;
            c.style.left = c.style.top = c.style.right = c.style.bottom = "auto";
            switch (a) {
                case qb:
                    c.style.top = e + "px";
                    c.style.left = d + "px";
                    break;
                case rb:
                    c.style.top = e + "px";
                    c.style.right = d + "px";
                    break;
                case sb:
                    c.style.bottom = e + "px";
                    c.style.left = d + "px";
                    break;
                case 3:
                    c.style.bottom = e + "px", c.style.right = d + "px"
            }
            c = ["TL", "TR", "BL", "BR"];
            t.z.Rb(this.B, "anchor" + c[b]);
            t.z.$a(this.B, "anchor" + c[a])
        }
    }, wt: function () {
        return this.k.anchor
    }, Vc: function (a) {
        a instanceof K && (this.k = this.k || {bf: o}, this.k.ga = new K(a.width, a.height), this.B && this.Sb(this.k.anchor))
    }, Te: function () {
        return this.k.ga
    }, md: s("B"), show: function () {
        this.vb != i && (this.vb = i, this.B && t.z.show(this.B))
    }, H: function () {
        this.vb != o && (this.vb = o, this.B && t.z.H(this.B))
    }, isPrintable: function () {
        return!!this.k.bf
    }, Ag: function () {
        return!this.B && !this.A ? o : !!this.vb
    }});
    var qb = 0, rb = 1, sb = 2;

    function Ma(a) {
        R.call(this);
        a = a || {};
        this.k = {bf: o, bv: a.showZoomInfo || i, anchor: a.anchor, ga: a.offset, type: a.type};
        this.defaultAnchor = H() ? 3 : qb;
        this.defaultOffset = new K(10, 10);
        this.Sb(a.anchor);
        this.jj(a.type);
        this.Nd()
    }

    t.lang.ia(Ma, R, "NavigationControl");
    t.extend(Ma.prototype, {initialize: function (a) {
        this.A = a;
        return this.B
    }, jj: function (a) {
        this.k.type = Ba(a) && 0 <= a && 3 >= a ? a : 0
    }, ek: function () {
        return this.k.type
    }, Nd: function () {
        var a = this;
        G.load("navictrl", function () {
            a.Md()
        })
    }});
    function tb(a) {
        R.call(this);
        a = a || {};
        this.k = {anchor: a.anchor, ga: a.offset, dK: a.showAddressBar, Xy: a.enableAutoLocation, iA: a.locationIcon};
        this.defaultAnchor = sb;
        this.defaultOffset = new K(0, 4);
        this.Nd()
    }

    t.lang.ia(tb, R, "GeolocationControl");
    t.extend(tb.prototype, {initialize: function (a) {
        this.A = a;
        return this.B
    }, Nd: function () {
        var a = this;
        G.load("geoctrl", function () {
            a.Md()
        })
    }, getAddressComponent: function () {
        return this.by || n
    }, location: function () {
        this.k.Xy = i
    }});
    function ub(a) {
        R.call(this);
        a = a || {};
        this.k = {bf: o, anchor: a.anchor, ga: a.offset};
        this.hb = [];
        this.defaultAnchor = sb;
        this.defaultOffset = new K(5, 2);
        this.Sb(a.anchor);
        this.ky = o;
        this.Nd()
    }

    t.lang.ia(ub, R, "CopyrightControl");
    t.object.extend(ub.prototype, {initialize: function (a) {
        this.A = a;
        return this.B
    }, Fo: function (a) {
        if (a && Ba(a.id) && !isNaN(a.id)) {
            var b = {bounds: n, content: ""}, c;
            for (c in a)b[c] = a[c];
            if (a = this.Ii(a.id))for (var d in b)a[d] = b[d]; else this.hb.push(b)
        }
    }, Ii: function (a) {
        for (var b = 0, c = this.hb.length; b < c; b++)if (this.hb[b].id == a)return this.hb[b]
    }, Ct: s("hb"), Lu: function (a) {
        for (var b = 0, c = this.hb.length; b < c; b++)this.hb[b].id == a && (r = this.hb.splice(b, 1), b--, c = this.hb.length)
    }, Nd: function () {
        var a = this;
        G.load("copyrightctrl", function () {
            a.Md()
        })
    }});
    function Oa(a) {
        R.call(this);
        a = a || {};
        this.k = {bf: o, size: a.size || new K(150, 150), padding: 5, za: a.isOpen === i ? i : o, OK: 4, ga: a.offset, anchor: a.anchor};
        this.defaultAnchor = 3;
        this.defaultOffset = new K(0, 0);
        this.Wk = this.Xk = 13;
        this.Sb(a.anchor);
        this.Ic(this.k.size);
        this.Nd()
    }

    t.lang.ia(Oa, R, "OverviewMapControl");
    t.extend(Oa.prototype, {initialize: function (a) {
        this.A = a;
        return this.B
    }, Sb: function (a) {
        R.prototype.Sb.call(this, a)
    }, Mc: function () {
        this.Mc.Gj = i;
        this.k.za = !this.k.za;
        this.B || (this.Mc.Gj = o)
    }, Ic: function (a) {
        a instanceof K || (a = new K(150, 150));
        a.width = 0 < a.width ? a.width : 150;
        a.height = 0 < a.height ? a.height : 150;
        this.k.size = a
    }, Fb: function () {
        return this.k.size
    }, za: function () {
        return this.k.za
    }, Nd: function () {
        var a = this;
        G.load("control", function () {
            a.Md()
        })
    }});
    function Na(a) {
        R.call(this);
        a = a || {};
        this.k = {bf: o, color: "black", Tb: "metric", ga: a.offset};
        this.defaultAnchor = sb;
        this.defaultOffset = new K(81, 18);
        this.Sb(a.anchor);
        this.xf = {metric: {name: "metric", zy: 1, Jz: 1E3, uB: "\u7c73", vB: "\u516c\u91cc"}, us: {name: "us", zy: 3.2808, Jz: 5280, uB: "\u82f1\u5c3a", vB: "\u82f1\u91cc"}};
        this.xf[this.k.Tb] || (this.k.Tb = "metric");
        this.xx = n;
        this.dx = {};
        this.Nd()
    }

    t.lang.ia(Na, R, "ScaleControl");
    t.object.extend(Na.prototype, {initialize: function (a) {
        this.A = a;
        return this.B
    }, Vu: function (a) {
        this.k.color = a + ""
    }, SL: function () {
        return this.k.color
    }, av: function (a) {
        this.k.Tb = this.xf[a] && this.xf[a].name || this.k.Tb
    }, bI: function () {
        return this.k.Tb
    }, Nd: function () {
        var a = this;
        G.load("control", function () {
            a.Md()
        })
    }});
    var wb = 0;

    function Pa(a) {
        R.call(this);
        a = a || {};
        this.defaultAnchor = rb;
        this.defaultOffset = new K(10, 10);
        this.k = {bf: o, Xe: [ra, va, xa, ta], type: a.type || wb, ga: a.offset || this.defaultOffset, PL: i};
        this.Sb(a.anchor);
        "[object Array]" == Object.prototype.toString.call(a.mapTypes) && (this.k.Xe = a.mapTypes.slice(0));
        this.Nd()
    }

    t.lang.ia(Pa, R, "MapTypeControl");
    t.object.extend(Pa.prototype, {initialize: function (a) {
        this.A = a;
        return this.B
    }, Nd: function () {
        var a = this;
        G.load("control", function () {
            a.Md()
        })
    }});
    function xb(a) {
        R.call(this);
        a = a || {};
        this.k = {bf: o, ga: a.offset, anchor: a.anchor};
        this.fg = o;
        this.vo = n;
        this.lx = new yb({Uj: "api"});
        this.mx = new zb(n, {Uj: "api"});
        this.defaultAnchor = rb;
        this.defaultOffset = new K(10, 10);
        this.Sb(a.anchor);
        this.Nd();
        ua(5042)
    }

    t.lang.ia(xb, R, "PanoramaControl");
    t.extend(xb.prototype, {initialize: function (a) {
        this.A = a;
        return this.B
    }, Nd: function () {
        var a = this;
        G.load("control", function () {
            a.Md()
        })
    }});
    function Ab(a) {
        t.lang.la.call(this);
        this.k = {xa: n, cursor: "default"};
        this.k = t.extend(this.k, a);
        this.wb = "contextmenu";
        this.A = n;
        this.ea = [];
        this.Ud = [];
        this.bd = [];
        this.Vo = this.Wl = n;
        this.sf = o;
        var b = this;
        G.load("menu", function () {
            b.Wb()
        })
    }

    t.lang.ia(Ab, t.lang.la, "ContextMenu");
    t.object.extend(Ab.prototype, {ta: function (a, b) {
        this.A = a;
        this.Zh = b || n
    }, remove: function () {
        this.A = this.Zh = n
    }, Io: function (a) {
        if (a && !("menuitem" != a.wb || "" == a.lg || 0 >= a.uF)) {
            for (var b = 0, c = this.ea.length; b < c; b++)if (this.ea[b] === a)return;
            this.ea.push(a);
            this.Ud.push(a)
        }
    }, removeItem: function (a) {
        if (a && "menuitem" == a.wb) {
            for (var b = 0, c = this.ea.length; b < c; b++)this.ea[b] === a && (this.ea[b].remove(), this.ea.splice(b, 1), c--);
            b = 0;
            for (c = this.Ud.length; b < c; b++)this.Ud[b] === a && (this.Ud[b].remove(), this.Ud.splice(b, 1), c--)
        }
    }, qs: function () {
        this.ea.push({wb: "divider", Jg: this.bd.length});
        this.bd.push({z: n})
    }, Nu: function (a) {
        if (this.bd[a]) {
            for (var b = 0, c = this.ea.length; b < c; b++)this.ea[b] && ("divider" == this.ea[b].wb && this.ea[b].Jg == a) && (this.ea.splice(b, 1), c--), this.ea[b] && ("divider" == this.ea[b].wb && this.ea[b].Jg > a) && this.ea[b].Jg--;
            this.bd.splice(a, 1)
        }
    }, md: s("B"), show: function () {
        this.sf != i && (this.sf = i)
    }, H: function () {
        this.sf != o && (this.sf = o)
    }, LJ: function (a) {
        a && (this.k.cursor = a)
    }, getItem: function (a) {
        return this.Ud[a]
    }});
    function Bb(a, b, c) {
        if (a && Ca(b)) {
            t.lang.la.call(this);
            this.k = {width: 100, id: ""};
            c = c || {};
            this.k.width = 1 * c.width ? c.width : 100;
            this.k.id = c.id ? c.id : "";
            this.lg = a + "";
            this.kf = b;
            this.A = n;
            this.wb = "menuitem";
            this.B = this.mf = n;
            this.pf = i;
            var d = this;
            G.load("menu", function () {
                d.Wb()
            })
        }
    }

    t.lang.ia(Bb, t.lang.la, "MenuItem");
    t.object.extend(Bb.prototype, {ta: function (a, b) {
        this.A = a;
        this.mf = b
    }, remove: function () {
        this.A = this.mf = n
    }, Vm: function (a) {
        a && (this.lg = a + "")
    }, md: s("B"), enable: function () {
        this.pf = i
    }, disable: function () {
        this.pf = o
    }});
    function Ia(a, b) {
        a && !b && (b = a);
        this.ed = this.dd = this.hd = this.gd = this.gi = this.Yh = n;
        a && (this.gi = new F(a.lng, a.lat), this.Yh = new F(b.lng, b.lat), this.hd = a.lng, this.gd = a.lat, this.ed = b.lng, this.dd = b.lat)
    }

    t.object.extend(Ia.prototype, {zg: function () {
        return!this.gi || !this.Yh
    }, bb: function (a) {
        return!(a instanceof Ia) || this.zg() ? o : this.pe().bb(a.pe()) && this.oe().bb(a.oe())
    }, pe: s("gi"), oe: s("Yh"), lG: function (a) {
        return!(a instanceof Ia) || this.zg() || a.zg() ? o : a.hd > this.hd && a.ed < this.ed && a.gd > this.gd && a.dd < this.dd
    }, Ga: function () {
        return this.zg() ? n : new F((this.hd + this.ed) / 2, (this.gd + this.dd) / 2)
    }, Mz: function (a) {
        if (!(a instanceof Ia) || Math.max(a.hd, a.ed) < Math.min(this.hd, this.ed) || Math.min(a.hd, a.ed) > Math.max(this.hd, this.ed) || Math.max(a.gd, a.dd) < Math.min(this.gd, this.dd) || Math.min(a.gd, a.dd) > Math.max(this.gd, this.dd))return n;
        var b = Math.max(this.hd, a.hd), c = Math.min(this.ed, a.ed), d = Math.max(this.gd, a.gd), a = Math.min(this.dd, a.dd);
        return new Ia(new F(b, d), new F(c, a))
    }, mG: function (a) {
        return!(a instanceof F) || this.zg() ? o : a.lng >= this.hd && a.lng <= this.ed && a.lat >= this.gd && a.lat <= this.dd
    }, extend: function (a) {
        if (a instanceof F) {
            var b = a.lng, a = a.lat;
            this.gi || (this.gi = new F(0, 0));
            this.Yh || (this.Yh = new F(0, 0));
            if (!this.hd || this.hd > b)this.gi.lng = this.hd = b;
            if (!this.ed || this.ed < b)this.Yh.lng = this.ed = b;
            if (!this.gd || this.gd > a)this.gi.lat = this.gd = a;
            if (!this.dd || this.dd < a)this.Yh.lat = this.dd = a
        }
    }, lv: function () {
        return this.zg() ? new F(0, 0) : new F(Math.abs(this.ed - this.hd), Math.abs(this.dd - this.gd))
    }});
    function F(a, b) {
        isNaN(a) && (a = lb(a), a = isNaN(a) ? 0 : a);
        Da(a) && (a = parseFloat(a));
        isNaN(b) && (b = lb(b), b = isNaN(b) ? 0 : b);
        Da(b) && (b = parseFloat(b));
        this.lng = a;
        this.lat = b
    }

    F.Oz = function (a) {
        return a && 180 >= a.lng && -180 <= a.lng && 74 >= a.lat && -74 <= a.lat
    };
    F.prototype.bb = function (a) {
        return a && this.lat == a.lat && this.lng == a.lng
    };
    function Cb() {
    }

    Cb.prototype.Em = function () {
        throw"lngLatToPoint\u65b9\u6cd5\u672a\u5b9e\u73b0";
    };
    Cb.prototype.xh = function () {
        throw"pointToLngLat\u65b9\u6cd5\u672a\u5b9e\u73b0";
    };
    function Db() {
    };
    var Ga = {By: function (a, b, c) {
        G.load("coordtransutils", function () {
            Ga.NF(a, b, c)
        }, i)
    }, Ay: function (a, b, c) {
        G.load("coordtransutils", function () {
            Ga.MF(a, b, c)
        }, i)
    }};

    function P() {
    }

    P.prototype = new Cb;
    t.extend(P, {LB: 6370996.81, Ev: [1.289059486E7, 8362377.87, 5591021, 3481989.83, 1678043.12, 0], wn: [75, 60, 45, 30, 15, 0], OB: [
        [1.410526172116255E-8, 8.98305509648872E-6, -1.9939833816331, 200.9824383106796, -187.2403703815547, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653, 1.73379812E7],
        [-7.435856389565537E-9, 8.983055097726239E-6, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 1.026014486E7],
        [-3.030883460898826E-8, 8.98305509983578E-6, 0.30071316287616, 59.74293618442277, 7.357984074871, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6856817.37],
        [-1.981981304930552E-8, 8.983055099779535E-6, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4482777.06],
        [3.09191371068437E-9, 8.983055096812155E-6, 6.995724062E-5, 23.10934304144901, -2.3663490511E-4, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2555164.4],
        [2.890871144776878E-9, 8.983055095805407E-6, -3.068298E-8, 7.47137025468032, -3.53937994E-6, -0.02145144861037, -1.234426596E-5, 1.0322952773E-4, -3.23890364E-6, 826088.5]
    ], Cv: [
        [-0.0015702102444, 111320.7020616939, 1704480524535203, -10338987376042340, 26112667856603880, -35149669176653700, 26595700718403920, -10725012454188240, 1800819912950474, 82.5],
        [8.277824516172526E-4, 111320.7020463578, 6.477955746671607E8, -4.082003173641316E9, 1.077490566351142E10, -1.517187553151559E10, 1.205306533862167E10, -5.124939663577472E9, 9.133119359512032E8, 67.5],
        [0.00337398766765, 111320.7020202162, 4481351.045890365, -2.339375119931662E7, 7.968221547186455E7, -1.159649932797253E8, 9.723671115602145E7, -4.366194633752821E7, 8477230.501135234, 52.5],
        [0.00220636496208, 111320.7020209128, 51751.86112841131, 3796837.749470245, 992013.7397791013, -1221952.21711287, 1340652.697009075, -620943.6990984312, 144416.9293806241, 37.5],
        [-3.441963504368392E-4, 111320.7020576856, 278.2353980772752, 2485758.690035394, 6070.750963243378, 54821.18345352118, 9540.606633304236, -2710.55326746645, 1405.483844121726, 22.5],
        [-3.218135878613132E-4, 111320.7020701615, 0.00369383431289, 823725.6402795718, 0.46104986909093, 2351.343141331292, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]
    ], UL: function (a, b) {
        if (!a || !b)return 0;
        var c, d, a = this.lb(a);
        if (!a)return 0;
        c = this.Fh(a.lng);
        d = this.Fh(a.lat);
        b = this.lb(b);
        return!b ? 0 : this.Cd(c, this.Fh(b.lng), d, this.Fh(b.lat))
    }, Dt: function (a, b) {
        if (!a || !b)return 0;
        a.lng = this.Lt(a.lng, -180, 180);
        a.lat = this.Rt(a.lat, -74, 74);
        b.lng = this.Lt(b.lng, -180, 180);
        b.lat = this.Rt(b.lat, -74, 74);
        return this.Cd(this.Fh(a.lng), this.Fh(b.lng), this.Fh(a.lat), this.Fh(b.lat))
    }, lb: function (a) {
        var b, c;
        b = new F(Math.abs(a.lng), Math.abs(a.lat));
        for (var d = 0; d < this.Ev.length; d++)if (b.lat >= this.Ev[d]) {
            c = this.OB[d];
            break
        }
        a = this.Cy(a, c);
        return a = new F(a.lng.toFixed(6), a.lat.toFixed(6))
    }, sb: function (a) {
        var b, c;
        a.lng = this.Lt(a.lng, -180, 180);
        a.lat = this.Rt(a.lat, -74, 74);
        b = new F(a.lng, a.lat);
        for (var d = 0; d < this.wn.length; d++)if (b.lat >= this.wn[d]) {
            c = this.Cv[d];
            break
        }
        if (!c)for (d = this.wn.length - 1; 0 <= d; d--)if (b.lat <= -this.wn[d]) {
            c = this.Cv[d];
            break
        }
        a = this.Cy(a, c);
        return a = new F(a.lng.toFixed(2), a.lat.toFixed(2))
    }, Cy: function (a, b) {
        if (a && b) {
            var c = b[0] + b[1] * Math.abs(a.lng), d = Math.abs(a.lat) / b[9], d = b[2] + b[3] * d + b[4] * d * d + b[5] * d * d * d + b[6] * d * d * d * d + b[7] * d * d * d * d * d + b[8] * d * d * d * d * d * d, c = c * (0 > a.lng ? -1 : 1), d = d * (0 > a.lat ? -1 : 1);
            return new F(c, d)
        }
    }, Cd: function (a, b, c, d) {
        return this.LB * Math.acos(Math.sin(c) * Math.sin(d) + Math.cos(c) * Math.cos(d) * Math.cos(b - a))
    }, Fh: function (a) {
        return Math.PI * a / 180
    }, WM: function (a) {
        return 180 * a / Math.PI
    }, Rt: function (a, b, c) {
        b != n && (a = Math.max(a, b));
        c != n && (a = Math.min(a, c));
        return a
    }, Lt: function (a, b, c) {
        for (; a > c;)a -= c - b;
        for (; a < b;)a += c - b;
        return a
    }});
    t.extend(P.prototype, {Vi: function (a) {
        return P.sb(a)
    }, Em: function (a) {
        a = P.sb(a);
        return new O(a.lng, a.lat)
    }, uh: function (a) {
        return P.lb(a)
    }, xh: function (a) {
        a = new F(a.x, a.y);
        return P.lb(a)
    }, nb: function (a, b, c, d, e) {
        if (a)return a = this.Vi(a, e), b = this.Ib(b), new O(Math.round((a.lng - c.lng) / b + d.width / 2), Math.round((c.lat - a.lat) / b + d.height / 2))
    }, Ua: function (a, b, c, d, e) {
        if (a)return b = this.Ib(b), this.uh(new F(c.lng + b * (a.x - d.width / 2), c.lat - b * (a.y - d.height / 2)), e)
    }, Ib: function (a) {
        return Math.pow(2, 18 - a)
    }});
    Eb.Bj = new P;
    function Eb() {
    }

    t.extend(Eb, {JG: function (a, b, c) {
        c = t.lang.Bc(c);
        b = {data: b};
        "position_changed" == a && (b.data = Eb.Bj.xh(new O(b.data.mercatorX, b.data.mercatorY)));
        c.dispatchEvent(new L("on" + a), b)
    }});
    var Fb = Eb;
    S(Fb, {dispatchFlashEvent: Fb.JG});
    function Ja() {
        this.Is = "bj"
    }

    Ja.prototype = new P;
    t.extend(Ja.prototype, {Vi: function (a, b) {
        return this.AC(b, P.sb(a))
    }, uh: function (a, b) {
        return P.lb(this.BC(b, a))
    }, lngLatToPointFor3D: function (a, b) {
        var c = this, d = P.sb(a);
        G.load("coordtrans", function () {
            var a = Db.Ot(c.Is || "bj", d), a = new O(a.x, a.y);
            b && b(a)
        }, i)
    }, pointToLngLatFor3D: function (a, b) {
        var c = this, d = new F(a.x, a.y);
        G.load("coordtrans", function () {
            var a = Db.Nt(c.Is || "bj", d), a = new F(a.lng, a.lat), a = P.lb(a);
            b && b(a)
        }, i)
    }, AC: function (a, b) {
        if (G.Xl("coordtrans").Ac == G.Fg.Ik) {
            var c = Db.Ot(a || "bj", b);
            return new F(c.x, c.y)
        }
        G.load("coordtrans", q());
        return new F(0, 0)
    }, BC: function (a, b) {
        if (G.Xl("coordtrans").Ac == G.Fg.Ik) {
            var c = Db.Nt(a || "bj", b);
            return new F(c.lng, c.lat)
        }
        G.load("coordtrans", q());
        return new F(0, 0)
    }, Ib: function (a) {
        return Math.pow(2, 20 - a)
    }});
    function Gb() {
        this.wb = "overlay"
    }

    t.lang.ia(Gb, t.lang.la, "Overlay");
    Gb.um = function (a) {
        a *= 1;
        return!a ? 0 : -1E5 * a << 1
    };
    t.extend(Gb.prototype, {Qd: function (a) {
        if (!this.J && Ca(this.initialize) && (this.J = this.initialize(a)))this.J.style.WebkitUserSelect = "none";
        this.draw()
    }, initialize: function () {
        throw"initialize\u65b9\u6cd5\u672a\u5b9e\u73b0";
    }, draw: function () {
        throw"draw\u65b9\u6cd5\u672a\u5b9e\u73b0";
    }, remove: function () {
        this.J && this.J.parentNode && this.J.parentNode.removeChild(this.J);
        this.J = n;
        this.dispatchEvent(new L("onremove"))
    }, H: function () {
        this.J && t.z.H(this.J)
    }, show: function () {
        this.J && t.z.show(this.J)
    }, Ag: function () {
        return!this.J || "none" == this.J.style.display || "hidden" == this.J.style.visibility ? o : i
    }});
    B.rd(function (a) {
        function b(a, b) {
            var c = J("div"), g = c.style;
            g.position = "absolute";
            g.top = g.left = g.width = g.height = "0";
            g.zIndex = b;
            a.appendChild(c);
            return c
        }

        var c = a.D;
        c.Jd = a.Jd = b(a.platform, 200);
        a.Lc.ut = b(c.Jd, 800);
        a.Lc.qu = b(c.Jd, 700);
        a.Lc.cz = b(c.Jd, 600);
        a.Lc.aA = b(c.Jd, 500);
        a.Lc.lA = b(c.Jd, 400);
        a.Lc.mA = b(c.Jd, 300);
        a.Lc.KK = b(c.Jd, 201);
        a.Lc.Cp = b(c.Jd, 200)
    });
    function Q() {
        t.lang.la.call(this);
        Gb.call(this);
        this.map = n;
        this.vb = i;
        this.xb = n;
        this.nw = 0
    }

    t.lang.ia(Q, Gb, "OverlayInternal");
    t.extend(Q.prototype, {initialize: function (a) {
        this.map = a;
        t.lang.la.call(this, this.L);
        return n
    }, Mt: s("map"), draw: q(), remove: function () {
        this.map = n;
        t.lang.Xo(this.L);
        Gb.prototype.remove.call(this)
    }, H: function () {
        this.vb != o && (this.vb = o)
    }, show: function () {
        this.vb != i && (this.vb = i)
    }, Ag: function () {
        return!this.J ? o : !!this.vb
    }, Ba: s("J"), TA: function (a) {
        var a = a || {}, b;
        for (b in a)this.w[b] = a[b]
    }, aq: ba("zIndex"), gh: function () {
        this.w.gh = i
    }, GG: function () {
        this.w.gh = o
    }, Oj: ba("Aj"), rk: function () {
        this.Aj = n
    }});
    function Hb() {
        this.map = n;
        this.fa = {};
        this.ad = []
    }

    B.rd(function (a) {
        var b = new Hb;
        b.map = a;
        a.fa = b.fa;
        a.ad = b.ad;
        a.addEventListener("load", function (a) {
            b.draw(a)
        });
        a.addEventListener("moveend", function (a) {
            b.draw(a)
        });
        t.M.S && 8 > t.M.S || "BackCompat" == document.compatMode ? a.addEventListener("zoomend", function (a) {
            setTimeout(function () {
                b.draw(a)
            }, 20)
        }) : a.addEventListener("zoomend", function (a) {
            b.draw(a)
        });
        a.addEventListener("maptypechange", function (a) {
            b.draw(a)
        });
        a.addEventListener("addoverlay", function (a) {
            a = a.target;
            if (a instanceof Q)b.fa[a.L] || (b.fa[a.L] = a); else {
                for (var d = o, e = 0, f = b.ad.length; e < f; e++)if (b.ad[e] === a) {
                    d = i;
                    break
                }
                d || b.ad.push(a)
            }
        });
        a.addEventListener("removeoverlay", function (a) {
            a = a.target;
            if (a instanceof Q)delete b.fa[a.L]; else for (var d = 0, e = b.ad.length; d < e; d++)if (b.ad[d] === a) {
                b.ad.splice(d, 1);
                break
            }
        });
        a.addEventListener("clearoverlays", function () {
            this.kc();
            for (var a in b.fa)b.fa[a].w.gh && (b.fa[a].remove(), delete b.fa[a]);
            a = 0;
            for (var d = b.ad.length; a < d; a++)b.ad[a].gh != o && (b.ad[a].remove(), b.ad[a] = n, b.ad.splice(a, 1), a--, d--)
        });
        a.addEventListener("infowindowopen", function () {
            var a = this.xb;
            a && (t.z.H(a.zb), t.z.H(a.ob))
        });
        a.addEventListener("movestart", function () {
            this.Se() && this.Se().Bx()
        });
        a.addEventListener("moveend", function () {
            this.Se() && this.Se().vx()
        })
    });
    Hb.prototype.draw = function () {
        for (var a in this.fa)this.fa[a].draw();
        t.Mb.Xd(this.ad, function (a) {
            a.draw()
        });
        this.map.D.Ja && this.map.D.Ja.da();
        B.tn && B.tn.lm(this.map).Yu()
    };
    function Ib(a) {
        Q.call(this);
        a = a || {};
        this.w = {strokeColor: a.strokeColor || "#3a6bdb", ef: a.strokeWeight || 5, ye: a.strokeOpacity || 0.65, strokeStyle: a.strokeStyle || "solid", gh: a.enableMassClear === o ? o : i, jh: n, Mi: n, Yd: a.enableEditing === i ? i : o, uA: 15, GK: o, xd: a.enableClicking === o ? o : i};
        0 >= this.w.ef && (this.w.ef = 5);
        if (0 > this.w.ye || 1 < this.w.ye)this.w.ye = 0.65;
        if (0 > this.w.Fi || 1 < this.w.Fi)this.w.Fi = 0.65;
        "solid" != this.w.strokeStyle && "dashed" != this.w.strokeStyle && (this.w.strokeStyle = "solid");
        this.J = n;
        this.Gq = new Ia(0, 0);
        this.ud = [];
        this.pb = [];
        this.ra = {}
    }

    t.lang.ia(Ib, Q, "Graph");
    Ib.jp = function (a) {
        var b = [];
        if (!a)return b;
        Da(a) && t.Mb.Xd(a.split(";"), function (a) {
            a = a.split(",");
            b.push(new F(a[0], a[1]))
        });
        "[object Array]" == Object.prototype.toString.apply(a) && 0 < a.length && (b = a);
        return b
    };
    Ib.Cu = [0.09, 0.005, 1.0E-4, 1.0E-5];
    t.extend(Ib.prototype, {initialize: function (a) {
        this.map = a;
        return n
    }, draw: q(), Il: function (a) {
        this.ud.length = 0;
        this.W = Ib.jp(a).slice(0);
        this.jf()
    }, Wc: function (a) {
        this.Il(a)
    }, jf: function () {
        if (this.W) {
            var a = this;
            a.Gq = new Ia;
            t.Mb.Xd(this.W, function (b) {
                a.Gq.extend(b)
            })
        }
    }, Pc: s("W"), ij: function (a, b) {
        b && this.W[a] && (this.ud.length = 0, this.W[a] = new F(b.lng, b.lat), this.jf())
    }, setStrokeColor: function (a) {
        this.w.strokeColor = a
    }, SH: function () {
        return this.w.strokeColor
    }, Um: function (a) {
        0 < a && (this.w.ef = a)
    }, xz: function () {
        return this.w.ef
    }, Sm: function (a) {
        a == aa || (1 < a || 0 > a) || (this.w.ye = a)
    }, TH: function () {
        return this.w.ye
    }, Wp: function (a) {
        1 < a || 0 > a || (this.w.Fi = a)
    }, xH: function () {
        return this.w.Fi
    }, Tm: function (a) {
        "solid" != a && "dashed" != a || (this.w.strokeStyle = a)
    }, wz: function () {
        return this.w.strokeStyle
    }, setFillColor: function (a) {
        this.w.fillColor = a || ""
    }, wH: function () {
        return this.w.fillColor
    }, vg: s("Gq"), remove: function () {
        this.map && this.map.removeEventListener("onmousemove", this.Rn);
        Q.prototype.remove.call(this);
        this.ud.length = 0
    }, Yd: function () {
        if (!(2 > this.W.length)) {
            this.w.Yd = i;
            var a = this;
            G.load("poly", function () {
                a.li()
            }, i)
        }
    }, FG: function () {
        this.w.Yd = o;
        var a = this;
        G.load("poly", function () {
            a.Zg()
        }, i)
    }});
    function Jb(a) {
        Q.call(this);
        this.J = this.map = n;
        this.w = {width: 0, height: 0, ga: new K(0, 0), opacity: 1, background: "transparent", yp: 1, cA: "#000", OI: "solid", O: n};
        this.TA(a);
        this.O = this.w.O
    }

    t.lang.ia(Jb, Q, "Division");
    t.extend(Jb.prototype, {Rk: function () {
        var a = this.w, b = this.content, c = ['<div class="BMap_Division" style="position:absolute;'];
        c.push("width:" + a.width + "px;display:block;");
        c.push("overflow:hidden;");
        "none" != a.borderColor && c.push("border:" + a.yp + "px " + a.OI + " " + a.cA + ";");
        c.push("opacity:" + a.opacity + "; filter:(opacity=" + 100 * a.opacity + ")");
        c.push("background:" + a.background + ";");
        c.push('z-index:60;">');
        c.push(b);
        c.push("</div>");
        this.J = bb(this.map.Ue().qu, c.join(""))
    }, initialize: function (a) {
        this.map = a;
        this.Rk();
        this.J && t.C(this.J, H() ? "touchstart" : "mousedown", function (a) {
            A(a)
        });
        return this.J
    }, draw: function () {
        var a = this.map.$e(this.w.O);
        this.w.ga = new K(-Math.round(this.w.width / 2) - Math.round(this.w.yp), -Math.round(this.w.height / 2) - Math.round(this.w.yp));
        this.J.style.left = a.x + this.w.ga.width + "px";
        this.J.style.top = a.y + this.w.ga.height + "px"
    }, ca: function () {
        return this.w.O
    }, gL: function () {
        return this.map.nb(this.ca())
    }, da: function (a) {
        this.w.O = a;
        this.draw()
    }, MJ: function (a, b) {
        this.w.width = Math.round(a);
        this.w.height = Math.round(b);
        this.J && (this.J.style.width = this.w.width + "px", this.J.style.height = this.w.height + "px", this.draw())
    }});
    function Kb(a, b, c) {
        a && b && (this.imageUrl = a, this.size = b, a = new K(Math.floor(b.width / 2), Math.floor(b.height / 2)), c = c || {}, a = c.anchor || a, b = c.imageOffset || new K(0, 0), this.imageSize = c.imageSize, this.anchor = a, this.imageOffset = b, this.infoWindowAnchor = c.infoWindowAnchor || this.anchor, this.printImageUrl = c.printImageUrl || "")
    }

    t.extend(Kb.prototype, {QJ: function (a) {
        a && (this.imageUrl = a)
    }, aK: function (a) {
        a && (this.printImageUrl = a)
    }, Ic: function (a) {
        a && (this.size = new K(a.width, a.height))
    }, Sb: function (a) {
        a && (this.anchor = new K(a.width, a.height))
    }, Pm: function (a) {
        a && (this.imageOffset = new K(a.width, a.height))
    }, SJ: function (a) {
        a && (this.infoWindowAnchor = new K(a.width, a.height))
    }, PJ: function (a) {
        a && (this.imageSize = new K(a.width, a.height))
    }, toString: ca("Icon")});
    function Lb(a, b) {
        t.lang.la.call(this);
        this.content = a;
        this.map = n;
        b = b || {};
        this.w = {width: b.width || 0, height: b.height || 0, maxWidth: b.maxWidth || 600, ga: b.offset || new K(0, 0), title: b.title || "", ru: b.maxContent || "", Oe: b.enableMaximize || o, fm: b.enableAutoPan === o ? o : i, bt: b.enableCloseOnClick === o ? o : i, margin: b.margin || [10, 10, 40, 10], Hs: b.collisions || [
            [10, 10],
            [10, 10],
            [10, 10],
            [10, 10]
        ], qI: o, tM: ca(i), ft: b.enableMessage === o ? o : i, message: b.message, ht: b.enableSearchTool === i ? i : o, rp: b.headerContent || ""};
        if (0 != this.w.width && (220 > this.w.width && (this.w.width = 220), 730 < this.w.width))this.w.width = 730;
        if (0 != this.w.height && (60 > this.w.height && (this.w.height = 60), 650 < this.w.height))this.w.height = 650;
        if (0 != this.w.maxWidth && (220 > this.w.maxWidth && (this.w.maxWidth = 220), 730 < this.w.maxWidth))this.w.maxWidth = 730;
        this.Cc = o;
        this.Xf = C.ba;
        this.Ka = n;
        var c = this;
        G.load("infowindow", function () {
            c.Wb()
        })
    }

    t.lang.ia(Lb, t.lang.la, "InfoWindow");
    t.extend(Lb.prototype, {setWidth: function (a) {
        !a && 0 != a || (isNaN(a) || 0 > a) || (0 != a && (220 > a && (a = 220), 730 < a && (a = 730)), this.w.width = a)
    }, setHeight: function (a) {
        !a && 0 != a || (isNaN(a) || 0 > a) || (0 != a && (60 > a && (a = 60), 650 < a && (a = 650)), this.w.height = a)
    }, ZA: function (a) {
        !a && 0 != a || (isNaN(a) || 0 > a) || (0 != a && (220 > a && (a = 220), 730 < a && (a = 730)), this.w.maxWidth = a)
    }, bc: function (a) {
        this.w.title = a
    }, getTitle: function () {
        return this.w.title
    }, Hc: ba("content"), hz: s("content"), Qm: function (a) {
        this.w.ru = a + ""
    }, Gc: q(), fm: function () {
        this.w.fm = i
    }, disableAutoPan: function () {
        this.w.fm = o
    }, enableCloseOnClick: function () {
        this.w.bt = i
    }, disableCloseOnClick: function () {
        this.w.bt = o
    }, Oe: function () {
        this.w.Oe = i
    }, Zo: function () {
        this.w.Oe = o
    }, show: function () {
        this.vb = i
    }, H: function () {
        this.vb = o
    }, close: function () {
        this.H()
    }, Dp: function () {
        this.Cc = i
    }, restore: function () {
        this.Cc = o
    }, Ag: function () {
        return this.za()
    }, za: ca(o), ca: function () {
        if (this.Ka && this.Ka.ca)return this.Ka.ca()
    }, Te: function () {
        return this.w.ga
    }});
    qa.prototype.Pb = function (a, b) {
        if (a instanceof Lb && b instanceof F) {
            var c = this.D;
            c.Wi ? c.Wi.da(b) : (c.Wi = new T(b, {icon: new Kb(C.ba + "blank.gif", {width: 1, height: 1}), offset: new K(0, 0), clickable: o}), c.Wi.kD = 1);
            this.Wa(c.Wi);
            c.Wi.Pb(a)
        }
    };
    qa.prototype.kc = function () {
        var a = this.D.Ja || this.D.Qh;
        a && a.Ka && a.Ka.kc()
    };
    Q.prototype.Pb = function (a) {
        this.map && (this.map.kc(), a.vb = i, this.map.D.Qh = a, a.Ka = this, t.lang.la.call(a, a.L))
    };
    Q.prototype.kc = function () {
        this.map && this.map.D.Qh && (this.map.D.Qh.vb = o, t.lang.Xo(this.map.D.Qh.L), this.map.D.Qh = n)
    };
    function Mb(a, b) {
        Q.call(this);
        this.content = a;
        this.J = this.map = n;
        b = b || {};
        this.w = {width: 0, ga: b.offset || new K(0, 0), Bk: {backgroundColor: "#fff", border: "1px solid #f00", padding: "1px", whiteSpace: "nowrap", font: "12px " + C.fontFamily, zIndex: "80", MozUserSelect: "none"}, position: b.position || n, gh: b.enableMassClear === o ? o : i, xd: i};
        0 > this.w.width && (this.w.width = 0);
        hb(b.enableClicking) && (this.w.xd = b.enableClicking);
        this.O = this.w.position;
        var c = this;
        G.load("marker", function () {
            c.Wb()
        })
    }

    t.lang.ia(Mb, Q, "Label");
    t.extend(Mb.prototype, {ca: function () {
        return this.eo ? this.eo.ca() : this.O
    }, da: function (a) {
        a instanceof F && !this.mp() && (this.O = this.w.position = new F(a.lng, a.lat))
    }, Hc: ba("content"), VJ: function (a) {
        0 <= a && 1 >= a && (this.w.opacity = a)
    }, Vc: function (a) {
        a instanceof K && (this.w.ga = new K(a.width, a.height))
    }, Te: function () {
        return this.w.ga
    }, qc: function (a) {
        a = a || {};
        this.w.Bk = t.extend(this.w.Bk, a)
    }, Ch: function (a) {
        return this.qc(a)
    }, bc: function (a) {
        this.w.title = a || ""
    }, getTitle: function () {
        return this.w.title
    }, YA: function (a) {
        this.O = (this.eo = a) ? this.w.position = a.ca() : this.w.position = n
    }, mp: function () {
        return this.eo || n
    }});
    var Nb = new Kb(C.ba + "marker_red_sprite.png", new K(19, 25), {anchor: new K(10, 25), infoWindowAnchor: new K(10, 0)}), Pb = new Kb(C.ba + "marker_red_sprite.png", new K(20, 11), {anchor: new K(6, 11), imageOffset: new K(-19, -13)});

    function T(a, b) {
        Q.call(this);
        b = b || {};
        this.O = a;
        this.Tk = this.map = n;
        this.w = {ga: b.offset || new K(0, 0), Ve: b.icon || Nb, Dh: Pb, title: b.title || "", label: n, iy: b.baseZIndex || 0, xd: i, fN: o, mu: o, gh: b.enableMassClear === o ? o : i, Eb: o, MA: b.raiseOnDrag === i ? i : o, QA: o, mc: b.draggingCursor || C.mc};
        b.icon && !b.shadow && (this.w.Dh = n);
        b.enableDragging && (this.w.Eb = b.enableDragging);
        hb(b.enableClicking) && (this.w.xd = b.enableClicking);
        var c = this;
        G.load("marker", function () {
            c.Wb()
        })
    }

    T.zn = Gb.um(-90) + 1E6;
    T.zv = T.zn + 1E6;
    t.lang.ia(T, Q, "Marker");
    t.extend(T.prototype, {Rf: function (a) {
        a instanceof Kb && (this.w.Ve = a)
    }, nz: function () {
        return this.w.Ve
    }, $p: function (a) {
        a instanceof Kb && (this.w.Dh = a)
    }, getShadow: function () {
        return this.w.Dh
    }, gj: function (a) {
        this.w.label = a || n
    }, oz: function () {
        return this.w.label
    }, Eb: function () {
        this.w.Eb = i
    }, Ps: function () {
        this.w.Eb = o
    }, ca: s("O"), da: function (a) {
        a instanceof F && (this.O = new F(a.lng, a.lat))
    }, yk: function (a, b) {
        this.w.mu = !!a;
        a && (this.Sv = b || 0)
    }, bc: function (a) {
        this.w.title = a + ""
    }, getTitle: function () {
        return this.w.title
    }, Vc: function (a) {
        a instanceof K && (this.w.ga = a)
    }, Te: function () {
        return this.w.ga
    }, fj: ba("Tk")});
    function Qb(a, b) {
        Ib.call(this, b);
        b = b || {};
        this.w.Fi = b.fillOpacity ? b.fillOpacity : 0.65;
        this.w.fillColor = "" == b.fillColor ? "" : b.fillColor ? b.fillColor : "#fff";
        this.Wc(a);
        var c = this;
        G.load("poly", function () {
            c.Wb()
        })
    }

    t.lang.ia(Qb, Ib, "Polygon");
    t.extend(Qb.prototype, {Wc: function (a, b) {
        this.Lj = Ib.jp(a).slice(0);
        var c = Ib.jp(a).slice(0);
        1 < c.length && c.push(new F(c[0].lng, c[0].lat));
        Ib.prototype.Wc.call(this, c, b)
    }, ij: function (a, b) {
        this.Lj[a] && (this.Lj[a] = new F(b.lng, b.lat), this.W[a] = new F(b.lng, b.lat), 0 == a && !this.W[0].bb(this.W[this.W.length - 1]) && (this.W[this.W.length - 1] = new F(b.lng, b.lat)), this.jf())
    }, Pc: function () {
        var a = this.Lj;
        0 == a.length && (a = this.W);
        return a
    }});
    function Rb(a, b) {
        Ib.call(this, b);
        this.Il(a);
        var c = this;
        G.load("poly", function () {
            c.Wb()
        })
    }

    t.lang.ia(Rb, Ib, "Polyline");
    function Sb(a, b, c) {
        this.O = a;
        this.Ca = Math.abs(b);
        Qb.call(this, [], c)
    }

    Sb.Cu = [0.01, 1.0E-4, 1.0E-5, 4.0E-6];
    t.lang.ia(Sb, Qb, "Circle");
    t.extend(Sb.prototype, {initialize: function (a) {
        this.map = a;
        this.W = this.Pn(this.O, this.Ca);
        this.jf();
        return n
    }, Ga: s("O"), ve: function (a) {
        a && (this.O = a)
    }, LH: s("Ca"), Zp: function (a) {
        this.Ca = Math.abs(a)
    }, Pn: function (a, b) {
        if (!a || !b || !this.map)return[];
        for (var c = [], d = b / 6378800, e = Math.PI / 180 * a.lat, f = Math.PI / 180 * a.lng, g = 0; 360 > g; g += 9) {
            var j = Math.PI / 180 * g, k = Math.asin(Math.sin(e) * Math.cos(d) + Math.cos(e) * Math.sin(d) * Math.cos(j)), j = new F(((f - Math.atan2(Math.sin(j) * Math.sin(d) * Math.cos(e), Math.cos(d) - Math.sin(e) * Math.sin(k)) + Math.PI) % (2 * Math.PI) - Math.PI) * (180 / Math.PI), k * (180 / Math.PI));
            c.push(j)
        }
        d = c[0];
        c.push(new F(d.lng, d.lat));
        return c
    }});
    var Tb = {};

    function Ub(a) {
        this.map = a;
        this.mk = [];
        this.$d = [];
        this.Be = [];
        this.XF = 300;
        this.Ju = 0;
        this.re = {};
        this.qg = {};
        this.Ze = 0;
        this.hu = i;
        this.Hy = {};
        this.co = this.bl(1);
        this.le = this.bl(2);
        this.xl = this.bl(3);
        a.platform.appendChild(this.co);
        a.platform.appendChild(this.le);
        a.platform.appendChild(this.xl)
    }

    B.rd(function (a) {
        var b = new Ub(a);
        b.ta();
        a.tb = b
    });
    t.extend(Ub.prototype, {ta: function () {
        var a = this, b = a.map;
        b.addEventListener("loadcode", function () {
            a.zp()
        });
        b.addEventListener("addtilelayer", function (b) {
            a.Af(b)
        });
        b.addEventListener("removetilelayer", function (b) {
            a.Qf(b)
        });
        b.addEventListener("setmaptype", function (b) {
            a.Cg(b)
        });
        b.addEventListener("zoomstartcode", function (b) {
            a.Yb(b)
        });
        b.addEventListener("setcustomstyles", function () {
            a.Ye(i)
        })
    }, zp: function () {
        var a = this;
        if (t.M.S)try {
            document.execCommand("BackgroundImageCache", o, i)
        } catch (b) {
        }
        this.loaded || a.vp();
        a.Ye();
        this.loaded || (this.loaded = i, G.load("tile", function () {
            a.iC()
        }))
    }, vp: function () {
        for (var a = this.map.ha().tl, b = 0; b < a.length; b++) {
            var c = new Vb;
            t.extend(c, a[b]);
            this.mk.push(c);
            c.ta(this.map, this.co)
        }
    }, bl: function (a) {
        var b = J("div");
        b.style.position = "absolute";
        b.style.overflow = "visible";
        b.style.left = b.style.top = "0";
        b.style.zIndex = a;
        return b
    }, De: function () {
        this.Ze--;
        var a = this;
        this.hu && (this.map.dispatchEvent(new L("onfirsttileloaded")), this.hu = o);
        0 == this.Ze && (this.dg && (clearTimeout(this.dg), this.dg = n), this.dg = setTimeout(function () {
            if (a.Ze == 0) {
                a.map.dispatchEvent(new L("ontilesloaded"));
                a.hu = i
            }
            a.dg = n
        }, 80))
    }, Wt: function (a, b) {
        return"TILE-" + b.L + "-" + a[0] + "-" + a[1] + "-" + a[2]
    }, sp: function (a) {
        var b = a.Va;
        b && ab(b) && b.parentNode.removeChild(b);
        delete this.re[a.name];
        a.loaded || (Wb(a), a.Va = n, a.Xi = n)
    }, dk: function (a, b, c) {
        var d = this.map, e = d.ha(), f = d.na, g = d.Ob, j = e.Ib(f), k = this.sH(), l = k[0], m = k[1], p = k[2], u = k[3], v = k[4], c = "undefined" != typeof c ? c : 0, e = e.k.Jb, k = d.L.replace(/^TANGRAM_/, "");
        for (this.Uf ? this.Uf.length = 0 : this.Uf = []; l < p; l++)for (var w = m; w < u; w++) {
            var z = l, E = w;
            this.Uf.push([z, E]);
            z = k + "_" + b + "_" + z + "_" + E + "_" + f;
            this.Hy[z] = z
        }
        this.Uf.sort(function (a) {
            return function (b, c) {
                return 0.4 * Math.abs(b[0] - a[0]) + 0.6 * Math.abs(b[1] - a[1]) - (0.4 * Math.abs(c[0] - a[0]) + 0.6 * Math.abs(c[1] - a[1]))
            }
        }([v[0] - 1, v[1] - 1]));
        g = [Math.round(-g.lng / j), Math.round(g.lat / j)];
        l = -d.offsetY + d.height / 2;
        a.style.left = -d.offsetX + d.width / 2 + "px";
        a.style.top = l + "px";
        this.oi ? this.oi.length = 0 : this.oi = [];
        l = 0;
        for (d = a.childNodes.length; l < d; l++)w = a.childNodes[l], w.Uw = o, this.oi.push(w);
        if (l = this.wu)for (var x in l)delete l[x]; else this.wu = {};
        this.pi ? this.pi.length = 0 : this.pi = [];
        l = 0;
        for (d = this.Uf.length; l < d; l++) {
            x = this.Uf[l][0];
            j = this.Uf[l][1];
            w = 0;
            for (m = this.oi.length; w < m; w++)if (p = this.oi[w], p.id == k + "_" + b + "_" + x + "_" + j + "_" + f) {
                p.Uw = i;
                this.wu[p.id] = p;
                break
            }
        }
        l = 0;
        for (d = this.oi.length; l < d; l++)p = this.oi[l], p.Uw || this.pi.push(p);
        this.iv = [];
        w = (e + c) * this.map.F.devicePixelRatio;
        l = 0;
        for (d = this.Uf.length; l < d; l++)x = this.Uf[l][0], j = this.Uf[l][1], u = x * e + g[0] - c / 2, v = (-1 - j) * e + g[1] - c / 2, z = k + "_" + b + "_" + x + "_" + j + "_" + f, m = this.wu[z], p = n, m ? (p = m.style, p.left = u + "px", p.top = v + "px", m.Ee || this.iv.push([x, j, m])) : (0 < this.pi.length ? (m = this.pi.shift(), m.getContext("2d").clearRect(-c / 2, -c / 2, w, w), p = m.style) : (m = document.createElement("canvas"), p = m.style, p.position = "absolute", p.width = e + c + "px", p.height = e + c + "px", this.Uz() && (p.WebkitTransform = "scale(1.001)"), m.setAttribute("width", w), m.setAttribute("height", w), a.appendChild(m)), m.id = z, p.left = u + "px", p.top = v + "px", -1 < z.indexOf("bg") && (u = "#F3F1EC", this.map.F.nc && this.map.F.nc.style && (u = this.map.F.Cf[this.map.F.nc.style].backColor), p.background = u ? u : ""), this.iv.push([x, j, m])), m.style.visibility = "";
        l = 0;
        for (d = this.pi.length; l < d; l++)this.pi[l].style.visibility = "hidden";
        return this.iv
    }, Uz: function () {
        return/M040/i.test(navigator.userAgent)
    }, sH: function () {
        var a = this.map, b = a.ha(), c = a.na;
        b.Ib(c);
        var c = b.Az(c), d = a.Ob, e = Math.ceil(d.lng / c), f = Math.ceil(d.lat / c), b = b.k.Jb, c = [e, f, (d.lng - e * c) / c * b, (d.lat - f * c) / c * b];
        return[c[0] - Math.ceil((a.width / 2 - c[2]) / b), c[1] - Math.ceil((a.height / 2 - c[3]) / b), c[0] + Math.ceil((a.width / 2 + c[2]) / b), c[1] + Math.ceil((a.height / 2 + c[3]) / b), c]
    }, fK: function (a, b, c, d) {
        var e = this;
        e.BL = b;
        var f = this.map.ha(), g = e.Wt(a, c), j = f.k.Jb, b = [a[0] * j + b[0], (-1 - a[1]) * j + b[1]], k = this.re[g];
        k && k.Va ? (Za(k.Va, b), d && (d = new O(a[0], a[1]), f = this.map.F.nc ? this.map.F.nc.style : "normal", d = c.getTilesUrl(d, a[2], f), k.loaded = o, Xb(k, d)), k.loaded ? this.De() : Yb(k, function () {
            e.De()
        })) : (k = this.qg[g]) && k.Va ? (c.gb.insertBefore(k.Va, c.gb.lastChild), this.re[g] = k, Za(k.Va, b), d && (d = new O(a[0], a[1]), f = this.map.F.nc ? this.map.F.nc.style : "normal", d = c.getTilesUrl(d, a[2], f), k.loaded = o, Xb(k, d)), k.loaded ? this.De() : Yb(k, function () {
            e.De()
        })) : (k = j * Math.pow(2, f.Li() - a[2]), new F(a[0] * k, a[1] * k), d = new O(a[0], a[1]), f = this.map.F.nc ? this.map.F.nc.style : "normal", d = c.getTilesUrl(d, a[2], f), k = new Zb(this, d, b, a, c), Yb(k, function () {
            e.De()
        }), $b(k), this.re[g] = k)
    }, De: function () {
        this.Ze--;
        var a = this;
        0 == this.Ze && (this.dg && (clearTimeout(this.dg), this.dg = n), this.dg = setTimeout(function () {
            if (a.Ze == 0) {
                a.map.dispatchEvent(new L("ontilesloaded"));
                if (pa) {
                    if (ma && na && oa) {
                        var b = Ea(), c = a.map.Fb();
                        setTimeout(function () {
                            ua(5030, {load_script_time: na - ma, load_tiles_time: b - oa, map_width: c.width, map_height: c.height, map_size: c.width * c.height})
                        }, 1E4)
                    }
                    pa = o
                }
            }
            a.dg = n
        }, 80))
    }, Wt: function (a, b) {
        return this.map.ha() === ta ? "TILE-" + b.L + "-" + this.map.As + "-" + a[0] + "-" + a[1] + "-" + a[2] : "TILE-" + b.L + "-" + a[0] + "-" + a[1] + "-" + a[2]
    }, sp: function (a) {
        var b = a.Va;
        b && (ac(b), ab(b) && b.parentNode.removeChild(b));
        delete this.re[a.name];
        a.loaded || (ac(b), Wb(a), a.Va = n, a.Xi = n)
    }, Ye: function (a) {
        var b = this;
        if (b.map.ha() == ta)G.load("coordtrans", function () {
            b.$w()
        }, i); else {
            if (a && a)for (var c in this.qg)delete this.qg[c];
            b.$w(a)
        }
    }, $w: function (a) {
        for (var b = this.mk.concat(this.$d), c = b.length, d = 0; d < c; d++) {
            var e = b[d];
            if (e.oc && l.na < e.oc)break;
            if (e.Mo) {
                var f = this.gb = e.gb;
                if (a) {
                    var g = f;
                    if (g && g.childNodes)for (var j = g.childNodes.length, k = j - 1; 0 <= k; k--)j = g.childNodes[k], g.removeChild(j), j = n
                }
                if (this.map.tc()) {
                    this.le.style.display = "block";
                    f.style.display = "none";
                    this.map.dispatchEvent(new L("vectorchanged"), {isvector: i});
                    continue
                } else f.style.display = "block", this.le.style.display = "none", this.map.dispatchEvent(new L("vectorchanged"), {isvector: o})
            }
            if (!(e.kk && !this.map.tc() || e.Tz && this.map.tc())) {
                var l = this.map, m = l.ha(), f = m.Ni(), j = l.na, p = l.Ob;
                m == ta && p.bb(new F(0, 0)) && (p = l.Ob = f.Vi(l.Le, l.Db));
                var u = m.Ib(j), j = m.Az(j), f = Math.ceil(p.lng / j), g = Math.ceil(p.lat / j), v = m.k.Jb, j = [f, g, (p.lng - f * j) / j * v, (p.lat - g * j) / j * v], k = j[0] - Math.ceil((l.width / 2 - j[2]) / v), f = j[1] - Math.ceil((l.height / 2 - j[3]) / v), g = j[0] + Math.ceil((l.width / 2 + j[2]) / v), w = 0;
                m === ta && 15 == l.U() && (w = 1);
                m = j[1] + Math.ceil((l.height / 2 + j[3]) / v) + w;
                this.fy = new F(p.lng, p.lat);
                var z = this.re, v = -this.fy.lng / u, w = this.fy.lat / u, u = [Math.ceil(v), Math.ceil(w)], p = l.U(), E;
                for (E in z) {
                    var x = z[E], I = x.info;
                    (I[2] != p || I[2] == p && (k > I[0] || g <= I[0] || f > I[1] || m <= I[1])) && this.sp(x)
                }
                z = -l.offsetX + l.width / 2;
                x = -l.offsetY + l.height / 2;
                e.gb && (e.gb.style.left = Math.ceil(v + z) - u[0] + "px", e.gb.style.top = Math.ceil(w + x) - u[1] + "px");
                v = [];
                for (l.ms = []; k < g; k++)for (w = f; w < m; w++)v.push([k, w]), l.ms.push({x: k, y: w});
                v.sort(function (a) {
                    return function (b, c) {
                        return 0.4 * Math.abs(b[0] - a[0]) + 0.6 * Math.abs(b[1] - a[1]) - (0.4 * Math.abs(c[0] - a[0]) + 0.6 * Math.abs(c[1] - a[1]))
                    }
                }([j[0] - 1, j[1] - 1]));
                this.Ze += v.length;
                k = 0;
                for (j = v.length; k < j; k++)this.fK([v[k][0], v[k][1], p], u, e, a)
            }
        }
    }, Af: function (a) {
        var b = this, c = a.target;
        c.Ae && this.map.Af(c.Ae);
        if (c.kk) {
            for (a = 0; a < b.Be.length; a++)if (b.Be[a] == c)return;
            G.load("vector", function () {
                c.ta(b.map, b.le);
                b.Be.push(c)
            }, i)
        } else {
            for (a = 0; a < b.$d.length; a++)if (b.$d[a] == c)return;
            c.ta(this.map, this.xl);
            b.$d.push(c)
        }
    }, Qf: function (a) {
        a = a.target;
        a.Ae && this.map.Qf(a.Ae);
        if (a.kk)for (var b = 0, c = this.Be.length; b < c; b++)a == this.Be[b] && this.Be.splice(b, 1); else {
            b = 0;
            for (c = this.$d.length; b < c; b++)a == this.$d[b] && this.$d.splice(b, 1)
        }
        a.remove()
    }, Cg: function () {
        for (var a = this.mk, b = 0, c = a.length; b < c; b++)a[b].remove();
        delete this.gb;
        this.mk = [];
        this.qg = this.re = {};
        this.vp();
        this.Ye()
    }, Yb: function () {
        var a = this;
        a.fc && t.z.H(a.fc);
        setTimeout(function () {
            a.Ye();
            a.map.dispatchEvent(new L("onzoomend"))
        }, 10)
    }, $M: q()});
    function Zb(a, b, c, d, e) {
        this.Xi = a;
        this.position = c;
        this.Dn = [];
        this.name = a.Wt(d, e);
        this.info = d;
        this.Ox = e.Bm();
        d = J("img");
        $a(d);
        d.ez = o;
        var f = d.style, a = a.map.ha();
        f.position = "absolute";
        f.border = "none";
        f.width = a.k.Jb + "px";
        f.height = a.k.Jb + "px";
        f.left = c[0] + "px";
        f.top = c[1] + "px";
        f.maxWidth = "none";
        this.Va = d;
        this.src = b;
        bc && (this.Va.style.opacity = 0);
        var g = this;
        this.Va.onload = function () {
            g.loaded = i;
            if (g.Xi) {
                var a = g.Xi, b = a.qg;
                if (!b[g.name]) {
                    a.Ju++;
                    b[g.name] = g
                }
                if (g.Va && !ab(g.Va) && e.gb) {
                    e.gb.appendChild(g.Va);
                    if (t.M.S <= 6 && t.M.S > 0 && g.Ox)g.Va.style.cssText = g.Va.style.cssText + (';filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + g.src + '",sizingMethod=scale);')
                }
                var c = a.Ju - a.XF, d;
                for (d in b) {
                    if (c <= 0)break;
                    if (!a.re[d]) {
                        b[d].Xi = n;
                        var f = b[d].Va;
                        if (f && f.parentNode) {
                            f.parentNode.removeChild(f);
                            ac(f)
                        }
                        f = n;
                        b[d].Va = n;
                        delete b[d];
                        a.Ju--;
                        c--
                    }
                }
                bc && new Va({ld: 20, duration: 200, ua: function (a) {
                    if (g.Va && g.Va.style)g.Va.style.opacity = a * 1
                }, finish: function () {
                    g.Va && g.Va.style && delete g.Va.style.opacity
                }});
                Wb(g)
            }
        };
        this.Va.onerror = function () {
            Wb(g);
            if (g.Xi) {
                var a = g.Xi.map.ha();
                if (a.k.kt) {
                    g.error = i;
                    g.Va.src = a.k.kt;
                    g.Va && !ab(g.Va) && e.gb.appendChild(g.Va)
                }
            }
        };
        d = n
    }

    function Yb(a, b) {
        a.Dn.push(b)
    }

    function $b(a) {
        a.Va.src = 0 < t.M.S && 6 >= t.M.S && a.Ox ? C.ba + "blank.gif" : "" !== a.src && a.Va.src == a.src ? a.src + "&t = " + Date.now() : a.src
    }

    function Wb(a) {
        for (var b = 0; b < a.Dn.length; b++)a.Dn[b]();
        a.Dn.length = 0
    }

    function ac(a) {
        if (a) {
            a.onload = a.onerror = n;
            var b = a.attributes, c, d, e;
            if (b) {
                d = b.length;
                for (c = 0; c < d; c += 1)e = b[c].name, Ca(a[e]) && (a[e] = n)
            }
            if (b = a.children) {
                d = b.length;
                for (c = 0; c < d; c += 1)ac(a.children[c])
            }
        }
    }

    function Xb(a, b) {
        a.src = b;
        $b(a)
    }

    var bc = !t.M.S || 8 < t.M.S;

    function Vb(a) {
        this.ok = a || {};
        this.oG = this.ok.copyright || n;
        this.EK = this.ok.transparentPng || o;
        this.Mo = this.ok.baseLayer || o;
        this.zIndex = this.ok.zIndex || 0;
        this.L = Vb.RD++
    }

    Vb.RD = 0;
    t.lang.ia(Vb, t.lang.la, "TileLayer");
    t.extend(Vb.prototype, {ta: function (a, b) {
        this.Mo && (this.zIndex = -100);
        this.map = a;
        if (!this.gb) {
            var c = J("div"), d = c.style;
            d.position = "absolute";
            d.overflow = "visible";
            d.zIndex = this.zIndex;
            d.left = Math.ceil(-a.offsetX + a.width / 2) + "px";
            d.top = Math.ceil(-a.offsetY + a.height / 2) + "px";
            b.appendChild(c);
            this.gb = c
        }
        c = a.ha();
        a.ph() && c == ra && (c.k.Jb = 128, d = function (a) {
            return Math.pow(2, 18 - a) * 2
        }, c.Ib = d, c.k.Tc.Ib = d)
    }, remove: function () {
        this.gb && this.gb.parentNode && (this.gb.innerHTML = "", this.gb.parentNode.removeChild(this.gb));
        delete this.gb
    }, Bm: s("EK"), getTilesUrl: function (a, b) {
        var c = "";
        this.ok.tileUrlTemplate && (c = this.ok.tileUrlTemplate.replace(/\{X\}/, a.x), c = c.replace(/\{Y\}/, a.y), c = c.replace(/\{Z\}/, b));
        return c
    }, Ii: s("oG"), ha: function () {
        return this.yb || ra
    }});
    function cc(a, b) {
        ib(a) ? b = a || {} : (b = b || {}, b.databoxId = a);
        this.k = {Iy: b.databoxId, Qe: b.geotableId, Rp: b.q || "", bn: b.tags || "", filter: b.filter || "", lK: b.styleId || "", mi: b.ak || la, Lo: b.age || 36E5, zIndex: 11, MI: "VectorCloudLayer", qh: b.hotspotName || "vector_md_" + (1E5 * Math.random()).toFixed(0), GF: "LBS\u4e91\u9ebb\u70b9\u5c42"};
        this.kk = i;
        Vb.call(this, this.k);
        this.hI = "http://api.map.baidu.com/georender/gss/data?";
        this.AG = "http://api.map.baidu.com/geosearch/detail/";
        this.BG = "http://api.map.baidu.com/geosearch/v2/detail/";
        this.fk = {}
    }

    t.ia(cc, Vb, "VectorCloudLayer");
    function dc(a) {
        a = a || {};
        this.k = t.extend(a, {zIndex: 1, MI: "VectorTrafficLayer", GF: "\u77e2\u91cf\u8def\u51b5\u5c42"});
        this.kk = i;
        Vb.call(this, this.k);
        this.CK = "http://or.map.bdimg.com:8080/gvd/?qt=lgvd&styles=pl&layers=tf";
        this.jd = {"0": [2, 1354709503, 2, 2, 0, [], 0, 0], 1: [2, 1354709503, 3, 2, 0, [], 0, 0], 10: [2, -231722753, 2, 2, 0, [], 0, 0], 11: [2, -231722753, 3, 2, 0, [], 0, 0], 12: [2, -231722753, 4, 2, 0, [], 0, 0], 13: [2, -231722753, 5, 2, 0, [], 0, 0], 14: [2, -231722753, 6, 2, 0, [], 0, 0], 15: [2, -1, 4, 0, 0, [], 0, 0], 16: [2, -1, 5.5, 0, 0, [], 0, 0], 17: [2, -1, 7, 0, 0, [], 0, 0], 18: [2, -1, 8.5, 0, 0, [], 0, 0], 19: [2, -1, 10, 0, 0, [], 0, 0], 2: [2, 1354709503, 4, 2, 0, [], 0, 0], 3: [2, 1354709503, 5, 2, 0, [], 0, 0], 4: [2, 1354709503, 6, 2, 0, [], 0, 0], 5: [2, -6350337, 2, 2, 0, [], 0, 0], 6: [2, -6350337, 3, 2, 0, [], 0, 0], 7: [2, -6350337, 4, 2, 0, [], 0, 0], 8: [2, -6350337, 5, 2, 0, [], 0, 0], 9: [2, -6350337, 6, 2, 0, [], 0, 0]}
    }

    t.ia(dc, Vb, "VectorTrafficLayer");
    function ec(a) {
        Vb.call(this, a);
        this.k = a || {};
        this.Tz = i;
        this.Ae = new dc;
        this.Ae.gq = this;
        if (this.k.predictDate) {
            if (1 > this.k.predictDate.weekday || 7 < this.k.predictDate.weekday)this.k.predictDate = 1;
            if (0 > this.k.predictDate.hour || 23 < this.k.predictDate.hour)this.k.predictDate.hour = 0
        }
        this.rF = "http://its.map.baidu.com:8002/traffic/"
    }

    ec.prototype = new Vb;
    ec.prototype.ta = function (a, b) {
        Vb.prototype.ta.call(this, a, b);
        this.A = a
    };
    ec.prototype.Bm = ca(i);
    ec.prototype.getTilesUrl = function (a, b) {
        var c = "";
        this.k.predictDate ? c = "HistoryService?day=" + (this.k.predictDate.weekday - 1) + "&hour=" + this.k.predictDate.hour + "&t=" + (new Date).getTime() + "&" : (c = "TrafficTileService?time=" + (new Date).getTime() + "&", this.A.ph() || (c += "label=web2D&v=016&"));
        return(this.rF + c + "level=" + b + "&x=" + a.x + "&y=" + a.y).replace(/-(\d+)/gi, "M$1")
    };
    function Qa(a, b) {
        Vb.call(this);
        var c = this;
        this.Tz = i;
        var d = o;
        try {
            document.createElement("canvas").getContext("2d"), d = i
        } catch (e) {
            d = o
        }
        d && (this.Ae = new cc(a, b), this.Ae.gq = this);
        ib(a) ? b = a || {} : (c.dl = a, b = b || {});
        b.geotableId && (c.he = b.geotableId);
        b.databoxId && (c.dl = b.databoxId);
        c.zc = {pI: "http://api.map.baidu.com/georender/gss/image", mI: "http://api.map.baidu.com/georender/gss/data", nI: "http://api.map.baidu.com/geosearch/detail/", oI: "http://api.map.baidu.com/geosearch/v2/detail/", Lo: b.age || 36E5, Rp: b.q || "", tK: "png", jM: [5, 5, 5, 5], LI: {backgroundColor: "#FFFFD5", borderColor: "#808080"}, mi: b.ak || la, bn: b.tags || "", filter: b.filter || "", qh: b.hotspotName || "tile_md_" + (1E5 * Math.random()).toFixed(0)};
        G.load("clayer", function () {
            c.wc()
        })
    }

    Qa.prototype = new Vb;
    Qa.prototype.ta = function (a, b) {
        Vb.prototype.ta.call(this, a, b);
        this.A = a
    };
    Qa.prototype.getTilesUrl = function (a, b) {
        var c = this.zc, c = c.pI + "?grids=" + a.x + "_" + a.y + "_" + b + "&q=" + c.Rp + "&tags=" + c.bn + "&filter=" + c.filter + "&ak=" + this.zc.mi + "&age=" + c.Lo + "&format=" + c.tK;
        this.he ? c += "&geotable_id=" + this.he : this.dl && (c += "&databox_id=" + this.dl);
        return c
    };
    Qa.TE = /^point\(|\)$/ig;
    Qa.UE = /\s+/;
    Qa.WE = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    function fc(a, b, c) {
        this.vl = a;
        this.tl = b instanceof Vb ? [b] : b.slice(0);
        c = c || {};
        this.k = {uK: c.tips || "", pu: "", oc: c.minZoom || 3, od: c.maxZoom || 18, kI: c.minZoom || 3, jI: c.maxZoom || 18, Jb: 256, sK: c.textColor || "black", kt: c.errorImageUrl || "", Tc: c.projection || new P};
        1 <= this.tl.length && (this.tl[0].Mo = i);
        t.extend(this.k, c)
    }

    t.extend(fc.prototype, {getName: s("vl"), tm: function () {
        return this.k.uK
    }, YL: function () {
        return this.k.pu
    }, YH: function () {
        return this.tl[0]
    }, hM: s("tl"), ZH: function () {
        return this.k.Jb
    }, Yj: function () {
        return this.k.oc
    }, Li: function () {
        return this.k.od
    }, sm: function () {
        return this.k.sK
    }, Ni: function () {
        return this.k.Tc
    }, VL: function () {
        return this.k.kt
    }, ZH: function () {
        return this.k.Jb
    }, Ib: function (a) {
        return Math.pow(2, 18 - a)
    }, Az: function (a) {
        return this.Ib(a) * this.k.Jb
    }});
    var gc = ["http://shangetu0.map.bdimg.com/it/", "http://shangetu1.map.bdimg.com/it/", "http://shangetu2.map.bdimg.com/it/", "http://shangetu3.map.bdimg.com/it/", "http://shangetu4.map.bdimg.com/it/"], hc = ["http://online0.map.bdimg.com/tile/", "http://online1.map.bdimg.com/tile/", "http://online2.map.bdimg.com/tile/", "http://online3.map.bdimg.com/tile/", "http://online4.map.bdimg.com/tile/"], hc = ["http://or.map.bdimg.com:8080/tile/", "http://or0.map.bdimg.com:8080/tile/", "http://or1.map.bdimg.com:8080/tile/", "http://or2.map.bdimg.com:8080/tile/", "http://or3.map.bdimg.com:8080/tile/"], ic = {dark: "dl", light: "ll", normal: "pl"}, jc = new Vb;
    jc.getTilesUrl = function (a, b, c) {
        var d = a.x, a = a.y, e = "pl";
        this.map.ph();
        e = ic[c];
        return(hc[Math.abs(d + a) % hc.length] + "?qt=tile&x=" + (d + "").replace(/-/gi, "M") + "&y=" + (a + "").replace(/-/gi, "M") + "&z=" + b + "&styles=" + e + (6 == t.M.S ? "&color_dep=32&colors=50" : "") + "&udt=20130822").replace(/-(\d+)/gi, "M$1")
    };
    var ra = new fc("\u5730\u56fe", jc, {tips: "\u663e\u793a\u666e\u901a\u5730\u56fe"}), lc = new Vb;
    lc.nB = ["http://d0.map.baidu.com/resource/mappic/", "http://d1.map.baidu.com/resource/mappic/", "http://d2.map.baidu.com/resource/mappic/", "http://d3.map.baidu.com/resource/mappic/"];
    lc.getTilesUrl = function (a, b) {
        var c = a.x, d = a.y, e = 256 * Math.pow(2, 20 - b), d = Math.round((9998336 - e * d) / e) - 1;
        return url = this.nB[Math.abs(c + d) % this.nB.length] + this.map.Db + "/" + this.map.As + "/3/lv" + (21 - b) + "/" + c + "," + d + ".jpg"
    };
    var ta = new fc("\u4e09\u7ef4", lc, {tips: "\u663e\u793a\u4e09\u7ef4\u5730\u56fe", minZoom: 15, maxZoom: 20, textColor: "white", projection: new Ja});
    ta.Ib = function (a) {
        return Math.pow(2, 20 - a)
    };
    ta.Wj = function (a) {
        if (!a)return"";
        var b = C.Cs, c;
        for (c in b)if (-1 < a.search(c))return b[c].Np;
        return""
    };
    ta.qH = function (a) {
        return{bj: 2, gz: 1, sz: 14, sh: 4}[a]
    };
    var mc = new Vb({Mo: i});
    mc.getTilesUrl = function (a, b) {
        var c = a.x, d = a.y;
        return(gc[Math.abs(c + d) % gc.length] + "u=x=" + c + ";y=" + d + ";z=" + b + ";v=009;type=sate&fm=46").replace(/-(\d+)/gi, "M$1")
    };
    var va = new fc("\u536b\u661f", mc, {tips: "\u663e\u793a\u536b\u661f\u5f71\u50cf", minZoom: 1, maxZoom: 19, textColor: "white"}), nc = new Vb({transparentPng: i});
    nc.getTilesUrl = function (a, b) {
        var c = a.x, d = a.y;
        return(hc[Math.abs(c + d) % hc.length] + "?qt=tile&x=" + (c + "").replace(/-/gi, "M") + "&y=" + (d + "").replace(/-/gi, "M") + "&z=" + b + "&styles=sl" + (6 == t.M.S ? "&color_dep=32&colors=50" : "") + "&udt=20130712").replace(/-(\d+)/gi, "M$1")
    };
    var xa = new fc("\u6df7\u5408", [mc, nc], {tips: "\u663e\u793a\u5e26\u6709\u8857\u9053\u7684\u536b\u661f\u5f71\u50cf", labelText: "\u8def\u7f51", minZoom: 1, maxZoom: 19, textColor: "white"});
    var oc = 1, U = {};
    window.RK = U;
    function V(a, b) {
        t.lang.la.call(this);
        this.hc = {};
        this.hj(a);
        b = b || {};
        b.$ = b.renderOptions || {};
        this.k = {$: {wa: b.$.panel || n, map: b.$.map || n, Ke: b.$.autoViewport || i, Nm: b.$.selectFirstResult, wm: b.$.highlightMode, Eb: b.$.enableDragging || o}, Jp: b.onSearchComplete || q(), CA: b.onMarkersSet || q(), BA: b.onInfoHtmlSet || q(), DA: b.onResultsHtmlSet || q(), AA: b.onGetBusListComplete || q(), zA: b.onGetBusLineComplete || q(), yA: b.onBusListHtmlSet || q(), xA: b.onBusLineHtmlSet || q(), xu: b.onPolylinesSet || q(), sk: b.reqFrom || ""};
        this.k.$.Ke = "undefined" != typeof b && "undefined" != typeof b.renderOptions && "undefined" != typeof b.renderOptions.autoViewport ? b.renderOptions.autoViewport : i;
        this.k.$.wa = t.uc(this.k.$.wa)
    }

    t.ia(V, t.lang.la);
    t.extend(V.prototype, {getResults: function () {
        return this.Cb ? this.ag : this.P
    }, enableAutoViewport: function () {
        this.k.$.Ke = i
    }, disableAutoViewport: function () {
        this.k.$.Ke = o
    }, hj: function (a) {
        a && (this.hc.src = a)
    }, Zu: function (a) {
        this.k.Jp = a || q()
    }, setMarkersSetCallback: function (a) {
        this.k.CA = a || q()
    }, setPolylinesSetCallback: function (a) {
        this.k.xu = a || q()
    }, setInfoHtmlSetCallback: function (a) {
        this.k.BA = a || q()
    }, setResultsHtmlSetCallback: function (a) {
        this.k.DA = a || q()
    }, Oi: s("Ac")});
    var pc = {VB: "http://api.map.baidu.com/", Qa: function (a, b, c, d, e) {
        var f = (1E5 * Math.random()).toFixed(0);
        B._rd["_cbk" + f] = function (b) {
            c = c || {};
            a && a(b, c);
            delete B._rd["_cbk" + f]
        };
        d = d || "";
        b = c && c.wB ? gb(b, encodeURI) : gb(b, encodeURIComponent);
        d = this.VB + d + "?" + b + "&ie=utf-8&oue=1&fromproduct=jsapi";
        e || (d += "&res=api");
        La(d + ("&callback=BMap._rd._cbk" + f))
    }};
    window.VK = pc;
    B._rd = {};
    var N = {};
    window.UK = N;
    N.OA = function (a) {
        return a.replace(/<\/?b>/g, "")
    };
    N.hJ = function (a) {
        return a.replace(/([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0|[1-9]\d*),([1-9]\d*\.\d*|0\.\d*[1-9]\d*|0?\.0+|0|[1-9]\d*)(,)/g, "$1,$2;")
    };
    N.iJ = function (a, b) {
        return a.replace(RegExp("(((-?\\d+)(\\.\\d+)?),((-?\\d+)(\\.\\d+)?);)(((-?\\d+)(\\.\\d+)?),((-?\\d+)(\\.\\d+)?);){" + b + "}", "ig"), "$1")
    };
    var qc = 2, rc = 3, sc = 0, tc = "bt", uc = "nav", vc = "walk", wc = "bl", xc = "bsl", yc = 14, zc = 15, Ac = 18, Bc = 20, Cc = 31;
    B.I = window.Instance = t.lang.Bc;
    function Fa(a, b) {
        V.call(this, a, b);
        b = b || {};
        b.renderOptions = b.renderOptions || {};
        this.xk(b.pageCapacity);
        "undefined" != typeof b.renderOptions.selectFirstResult && !b.renderOptions.selectFirstResult ? this.Qs() : this.dt();
        this.fa = [];
        this.Ld = [];
        this.Ha = -1;
        this.pa = [];
        var c = this;
        G.load("local", function () {
            c.Kq()
        }, i)
    }

    t.ia(Fa, V, "LocalSearch");
    Fa.Kk = 10;
    Fa.SK = 1;
    Fa.oj = 100;
    Fa.xv = 2E3;
    Fa.Dv = 1E5;
    t.extend(Fa.prototype, {search: function (a, b) {
        this.pa.push({method: "search", arguments: [a, b]})
    }, ej: function (a, b, c) {
        this.pa.push({method: "searchInBounds", arguments: [a, b, c]})
    }, vk: function (a, b, c, d) {
        this.pa.push({method: "searchNearby", arguments: [a, b, c, d]})
    }, kd: function () {
        delete this.oa;
        delete this.Ac;
        delete this.P;
        delete this.V;
        this.Ha = -1;
        this.Sa();
        this.k.$.wa && (this.k.$.wa.innerHTML = "")
    }, Qi: q(), dt: function () {
        this.k.$.Nm = i
    }, Qs: function () {
        this.k.$.Nm = o
    }, xk: function (a) {
        this.k.wh = "number" == typeof a && !isNaN(a) ? 1 > a ? Fa.Kk : a > Fa.oj ? Fa.Kk : a : Fa.Kk
    }, Ed: function () {
        return this.k.wh
    }, toString: ca("LocalSearch")});
    var Dc = Fa.prototype;
    S(Dc, {clearResults: Dc.kd, setPageCapacity: Dc.xk, getPageCapacity: Dc.Ed, gotoPage: Dc.Qi, searchNearby: Dc.vk, searchInBounds: Dc.ej, search: Dc.search, enableFirstResultSelection: Dc.dt, disableFirstResultSelection: Dc.Qs});
    function Ec(a, b) {
        V.call(this, a, b)
    }

    t.ia(Ec, V, "BaseRoute");
    t.extend(Ec.prototype, {kd: q()});
    function Fc(a, b) {
        V.call(this, a, b);
        b = b || {};
        this.Rm(b.policy);
        this.xk(b.pageCapacity);
        this.Yf = tc;
        this.xn = yc;
        this.wq = oc;
        this.fa = [];
        this.Ha = -1;
        this.pa = [];
        var c = this;
        G.load("route", function () {
            c.wc()
        })
    }

    Fc.oj = 100;
    Fc.MB = [0, 1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 1, 1];
    t.ia(Fc, Ec, "TransitRoute");
    t.extend(Fc.prototype, {Rm: function (a) {
        this.k.Sc = 0 <= a && 4 >= a ? a : 0
    }, ZD: function (a, b) {
        this.pa.push({method: "_internalSearch", arguments: [a, b]})
    }, search: function (a, b) {
        this.pa.push({method: "search", arguments: [a, b]})
    }, xk: function (a) {
        if ("string" == typeof a && (a = parseInt(a), isNaN(a))) {
            this.k.wh = Fc.oj;
            return
        }
        this.k.wh = "number" != typeof a ? Fc.oj : 1 <= a && a <= Fc.oj ? Math.round(a) : Fc.oj
    }, toString: ca("TransitRoute"), fF: function (a) {
        return a.replace(/\(.*\)/, "")
    }});
    function Gc(a, b) {
        V.call(this, a, b);
        this.fa = [];
        this.Ha = -1;
        this.pa = [];
        var c = this, d = this.k.$;
        1 != d.wm && 2 != d.wm && (d.wm = 1);
        this.$q = this.k.$.Eb ? i : o;
        G.load("route", function () {
            c.wc()
        });
        this.du && this.du()
    }

    Gc.YB = " \u73af\u5c9b \u65e0\u5c5e\u6027\u9053\u8def \u4e3b\u8def \u9ad8\u901f\u8fde\u63a5\u8def \u4ea4\u53c9\u70b9\u5185\u8def\u6bb5 \u8fde\u63a5\u9053\u8def \u505c\u8f66\u573a\u5185\u90e8\u9053\u8def \u670d\u52a1\u533a\u5185\u90e8\u9053\u8def \u6865 \u6b65\u884c\u8857 \u8f85\u8def \u531d\u9053 \u5168\u5c01\u95ed\u9053\u8def \u672a\u5b9a\u4e49\u4ea4\u901a\u533a\u57df POI\u8fde\u63a5\u8def \u96a7\u9053 \u6b65\u884c\u9053 \u516c\u4ea4\u4e13\u7528\u9053 \u63d0\u524d\u53f3\u8f6c\u9053".split(" ");
    t.ia(Gc, Ec, "DWRoute");
    t.extend(Gc.prototype, {search: function (a, b, c) {
        this.pa.push({method: "search", arguments: [a, b, c]})
    }});
    function Hc(a, b) {
        Gc.call(this, a, b);
        b = b || {};
        this.Rm(b.policy);
        this.Yf = uc;
        this.xn = Bc;
        this.wq = rc
    }

    t.ia(Hc, Gc, "DrivingRoute");
    t.extend(Hc.prototype, {Rm: function (a) {
        this.k.Sc = 0 <= a && 2 >= a ? a : 0
    }});
    function Ic(a, b) {
        Gc.call(this, a, b);
        this.Yf = vc;
        this.xn = Cc;
        this.wq = qc;
        this.$q = o
    }

    t.ia(Ic, Gc, "WalkingRoute");
    function Jc(a) {
        this.k = {};
        t.extend(this.k, a);
        this.pa = [];
        var b = this;
        G.load("othersearch", function () {
            b.wc()
        })
    }

    t.ia(Jc, t.lang.la, "Geocoder");
    t.extend(Jc.prototype, {Qt: function (a, b, c) {
        this.pa.push({method: "getPoint", arguments: [a, b, c]})
    }, lp: function (a, b, c) {
        this.pa.push({method: "getLocation", arguments: [a, b, c]})
    }, toString: ca("Geocoder")});
    var Kc = Jc.prototype;
    S(Kc, {getPoint: Kc.Qt, getLocation: Kc.lp});
    function Geolocation(a) {
        this.k = {};
        t.extend(this.k, a);
        this.pa = [];
        var b = this;
        G.load("othersearch", function () {
            b.wc()
        })
    }

    t.extend(Geolocation.prototype, {getCurrentPosition: function (a, b) {
        this.pa.push({method: "getCurrentPosition", arguments: [a, b]})
    }, Oi: s("Ac")});
    var Lc = Geolocation.prototype;
    S(Lc, {getCurrentPosition: Lc.getCurrentPosition, getStatus: Lc.Oi});
    function Mc(a) {
        a = a || {};
        a.$ = a.renderOptions || {};
        this.k = {$: {map: a.$.map || n}};
        this.pa = [];
        var b = this;
        G.load("othersearch", function () {
            b.wc()
        })
    }

    t.ia(Mc, t.lang.la, "LocalCity");
    t.extend(Mc.prototype, {get: function (a) {
        this.pa.push({method: "get", arguments: [a]})
    }, toString: ca("LocalCity")});
    function Nc() {
        this.pa = [];
        var a = this;
        G.load("othersearch", function () {
            a.wc()
        })
    }

    t.ia(Nc, t.lang.la, "Boundary");
    t.extend(Nc.prototype, {get: function (a, b) {
        this.pa.push({method: "get", arguments: [a, b]})
    }, toString: ca("Boundary")});
    function Oc(a, b) {
        V.call(this, a, b);
        this.UB = wc;
        this.XB = zc;
        this.TB = xc;
        this.WB = Ac;
        this.pa = [];
        var c = this;
        G.load("buslinesearch", function () {
            c.wc()
        })
    }

    Oc.Un = C.ba + "iw_plus.gif";
    Oc.VD = C.ba + "iw_minus.gif";
    Oc.nF = C.ba + "stop_icon.png";
    t.ia(Oc, V);
    t.extend(Oc.prototype, {getBusList: function (a) {
        this.pa.push({method: "getBusList", arguments: [a]})
    }, getBusLine: function (a) {
        this.pa.push({method: "getBusLine", arguments: [a]})
    }, setGetBusListCompleteCallback: function (a) {
        this.k.AA = a || q()
    }, setGetBusLineCompleteCallback: function (a) {
        this.k.zA = a || q()
    }, setBusListHtmlSetCallback: function (a) {
        this.k.yA = a || q()
    }, setBusLineHtmlSetCallback: function (a) {
        this.k.xA = a || q()
    }, setPolylinesSetCallback: function (a) {
        this.k.xu = a || q()
    }});
    function Pc(a) {
        V.call(this, a);
        a = a || {};
        this.zc = {input: a.input || n, ss: a.baseDom || n, types: a.types || [], Jp: a.onSearchComplete || q()};
        this.hc.src = a.location || "\u5168\u56fd";
        this.og = "";
        this.ke = n;
        this.Tw = "";
        this.Fe();
        ua(5011);
        var b = this;
        G.load("autocomplete", function () {
            b.wc()
        })
    }

    t.ia(Pc, V, "Autocomplete");
    t.extend(Pc.prototype, {Fe: q(), show: q(), H: q(), $u: function (a) {
        this.zc.types = a
    }, hj: function (a) {
        this.hc.src = a
    }, search: ba("og"), Xp: ba("Tw")});
    var ya;

    function sa(a, b) {
        this.B = "string" == typeof a ? t.R(a) : a;
        this.k = {linksControl: i, enableScrollWheelZoom: i, navigationControl: i, panoramaRenderer: "flash", swfSrc: "http://api.map.baidu.com/res/swf/APILoader.swf", visible: i};
        var b = b || {}, c;
        for (c in b)this.k[c] = b[c];
        this.Ra = {heading: 0, pitch: 0};
        this.Zn = [];
        this.qb = this.Oa = n;
        this.Fl = this.ll();
        this.fa = [];
        this.Yb = 1;
        this.Al = this.iE = this.Kg = "";
        this.He = [];
        this.Bl = [];
        var d = this;
        za() && !H() && "javascript" != b.panoramaRenderer ? G.load("panoramaflash", function () {
            d.Fe()
        }, i) : G.load("panorama", function () {
            d.Wb()
        }, i);
        ua(5044, {type: b.panoramaRenderer});
        "api" == b.Uj ? ua(5036) : ua(5039)
    }

    var Qc = 4, Rc = 1;
    t.lang.ia(sa, t.lang.la, "Panorama");
    t.extend(sa.prototype, {BH: s("Zn"), Dd: s("Oa"), $H: s("wo"), aB: s("wo"), ca: s("qb"), Xa: s("Ra"), U: s("Yb"), Ki: s("Kg"), cM: function () {
        return this.mL || []
    }, $L: s("iE"), we: function (a, b) {
        a != this.Oa && (this.Uh = this.Oa, this.Wn = this.qb, this.Oa = a, this.Al = b || "street", this.qb = n)
    }, da: function (a) {
        a.bb(this.qb) || (this.Uh = this.Oa, this.Wn = this.qb, this.qb = a, this.Oa = n)
    }, Sf: function (a) {
        this.Ra = a;
        a = this.Ra.pitch;
        "cvsRender" == this.ll() ? (90 < a && (a = 90), -90 > a && (a = -90)) : "cssRender" == this.ll() && (45 < a && (a = 45), -45 > a && (a = -45));
        this.Ra.pitch = a
    }, Jc: function (a) {
        a != this.Yb && (a > Qc && (a = Qc), a < Rc && (a = Rc), a != this.Yb && (this.Yb = a))
    }, as: function () {
        if (this.A)for (var a = this.A.Pt(), b = 0; b < a.length; b++)(a[b]instanceof T || a[b]instanceof Mb) && a[b].O && this.fa.push(a[b])
    }, Xu: ba("A"), oh: function () {
        this.Sg.style.display = "none"
    }, bq: function () {
        this.Sg.style.display = "block"
    }, cH: function () {
        this.k.enableScrollWheelZoom = i
    }, HG: function () {
        this.k.enableScrollWheelZoom = o
    }, show: function () {
        this.k.visible = i
    }, H: function () {
        this.k.visible = o
    }, ll: function () {
        return!H() && ob() ? "cvsRender" : "cssRender"
    }, cI: function () {
        return this.k.visible
    }, os: function (a) {
        function b(a, b) {
            return function () {
                a.Bl.push({rA: b, qA: arguments})
            }
        }

        for (var c = a.getPanoMethodList(), d = "", e = 0, f = c.length; e < f; e++)d = c[e], this[d] = b(this, d);
        this.He.push(a)
    }, Mu: function (a) {
        for (var b = this.He.length; b--;)this.He[b] === a && this.He.splice(b, 1)
    }});
    var W = sa.prototype;
    S(W, {setId: W.we, setPosition: W.da, setPov: W.Sf, setZoom: W.Jc, getId: W.Dd, getPosition: W.ca, getPov: W.Xa, getZoom: W.U, getLinks: W.BH, enableDoubleClickZoom: W.ML, disableDoubleClickZoom: W.GL, enableScrollWheelZoom: W.cH, disableScrollWheelZoom: W.HG, show: W.show, hide: W.H, addPlugin: W.os, removePlugin: W.Mu, getVisible: W.cI});
    function zb(a, b) {
        this.Q = a || n;
        var c = this;
        c.Q && c.N();
        G.load("panoramaservice", function () {
            c.wC()
        });
        "api" == (b || {}).Uj ? ua(5037) : ua(5040)
    }

    B.Au(function (a) {
        new zb(a, {Uj: "api"})
    });
    t.extend(zb.prototype, {N: function () {
        function a(a) {
            if (a) {
                if (a.id != b.wo) {
                    b.aB(a.id);
                    var c = new L("ondataload");
                    c.data = a;
                    b.Oa = a.id;
                    b.qb = a.position;
                    b.jL = a.Hu;
                    b.kL = a.Iu;
                    b.Kg = a.description;
                    b.Zn = a.links;
                    b.dispatchEvent(c);
                    b.dispatchEvent(new L("onposition_changed"));
                    b.dispatchEvent(new L("onlinks_changed"))
                }
            } else b.Oa = b.Uh, b.qb = b.Wn, b.dispatchEvent(new L("onnoresult"))
        }

        var b = this.Q, c = this;
        b.addEventListener("id_changed", function () {
            c.rm(b.Dd(), a)
        });
        b.addEventListener("position_changed_inner", function () {
            c.ih(b.ca(), a)
        })
    }, rm: function (a, b) {
        this.Oa = a;
        this.kf = b;
        this.Er = n
    }, ih: function (a, b) {
        this.Er = a;
        this.kf = b;
        this.Oa = n
    }});
    var Sc = zb.prototype;
    S(Sc, {getPanoramaById: Sc.rm, getPanoramaByLocation: Sc.ih});
    function yb(a) {
        Vb.call(this);
        "api" == (a || {}).Uj ? ua(5038) : ua(5041)
    }

    yb.Kv = ["http://pcsv0.map.bdimg.com/tile/", "http://pcsv1.map.bdimg.com/tile/"];
    yb.prototype = new Vb;
    yb.prototype.getTilesUrl = function (a, b) {
        return yb.Kv[(a.x + a.y) % yb.Kv.length] + "?udt=v&qt=tile&styles=pl&x=" + a.x + "&y=" + a.y + "&z=" + b
    };
    yb.prototype.Bm = ca(i);
    B.Map = qa;
    B.Hotspot = Ka;
    B.MapType = fc;
    B.Point = F;
    B.Pixel = O;
    B.Size = K;
    B.Bounds = Ia;
    B.TileLayer = Vb;
    B.Projection = Cb;
    B.MercatorProjection = P;
    B.PerspectiveProjection = Ja;
    B.Copyright = function (a, b, c) {
        this.id = a;
        this.rb = b;
        this.content = c
    };
    B.Overlay = Gb;
    B.Label = Mb;
    B.Marker = T;
    B.Icon = Kb;
    B.Polyline = Rb;
    B.Polygon = Qb;
    B.InfoWindow = Lb;
    B.Circle = Sb;
    B.Control = R;
    B.NavigationControl = Ma;
    B.GeolocationControl = tb;
    B.OverviewMapControl = Oa;
    B.CopyrightControl = ub;
    B.ScaleControl = Na;
    B.MapTypeControl = Pa;
    B.PanoramaControl = xb;
    B.TrafficLayer = ec;
    B.CustomLayer = Qa;
    B.ContextMenu = Ab;
    B.MenuItem = Bb;
    B.LocalSearch = Fa;
    B.TransitRoute = Fc;
    B.DrivingRoute = Hc;
    B.WalkingRoute = Ic;
    B.Autocomplete = Pc;
    B.Geocoder = Jc;
    B.LocalCity = Mc;
    B.Geolocation = Geolocation;
    B.BusLineSearch = Oc;
    B.Boundary = Nc;
    B.VectorCloudLayer = cc;
    B.VectorTrafficLayer = dc;
    B.Panorama = sa;
    B.PanoramaService = zb;
    B.PanoramaCoverageLayer = yb;
    B.PanoramaFlashInterface = Eb;
    function S(a, b) {
        for (var c in b)a[c] = b[c]
    }

    S(window, {BMap: B, _jsload: function (a, b) {
        ha.eq.FI && ha.eq.set(a, b);
        G.$F(a, b)
    }, BMAP_API_VERSION: "1.5"});
    var X = qa.prototype;
    S(X, {getBounds: X.vg, getCenter: X.Ga, getMapType: X.ha, getSize: X.Fb, setSize: X.Ic, getViewport: X.qp, getZoom: X.U, centerAndZoom: X.Wd, panTo: X.ue, panBy: X.te, setCenter: X.ve, setCurrentCity: X.Wu, setMapType: X.Cg, setViewport: X.zk, setZoom: X.Jc, highResolutionEnabled: X.ph, zoomTo: X.gf, zoomIn: X.pv, zoomOut: X.qv, addHotspot: X.Ho, removeHotspot: X.qJ, clearHotspots: X.si, checkResize: X.bG, addControl: X.Eo, removeControl: X.NA, getContainer: X.Ba, addContextMenu: X.Oj, removeContextMenu: X.rk, addOverlay: X.Wa, removeOverlay: X.Uc, clearOverlays: X.wy, openInfoWindow: X.Pb, closeInfoWindow: X.kc, pointToOverlayPixel: X.$e, overlayPixelToPoint: X.FA, getInfoWindow: X.Se, getOverlays: X.Pt, getPanes: function () {
        return{floatPane: this.Lc.ut, markerMouseTarget: this.Lc.qu, floatShadow: this.Lc.cz, labelPane: this.Lc.aA, markerPane: this.Lc.lA, markerShadow: this.Lc.mA, mapPane: this.Lc.Cp}
    }, addTileLayer: X.Af, removeTileLayer: X.Qf, pixelToPoint: X.Ua, pointToPixel: X.nb, setFeatureStyle: X.UA, selectBaseElement: X.PM, setMapStyle: X.XA});
    var Tc = fc.prototype;
    S(Tc, {getTileLayer: Tc.YH, getMinZoom: Tc.Yj, getMaxZoom: Tc.Li, getProjection: Tc.Ni, getTextColor: Tc.sm, getTips: Tc.tm});
    S(window, {BMAP_NORMAL_MAP: ra, BMAP_PERSPECTIVE_MAP: ta, BMAP_SATELLITE_MAP: va, BMAP_HYBRID_MAP: xa});
    var Uc = P.prototype;
    S(Uc, {lngLatToPoint: Uc.Em, pointToLngLat: Uc.xh});
    var Vc = Ja.prototype;
    S(Vc, {lngLatToPoint: Vc.Em, pointToLngLat: Vc.xh});
    var Wc = Ia.prototype;
    S(Wc, {equals: Wc.bb, containsPoint: Wc.mG, containsBounds: Wc.lG, intersects: Wc.Mz, extend: Wc.extend, getCenter: Wc.Ga, isEmpty: Wc.zg, getSouthWest: Wc.pe, getNorthEast: Wc.oe, toSpan: Wc.lv});
    var Xc = Gb.prototype;
    S(Xc, {isVisible: Xc.Ag, show: Xc.show, hide: Xc.H});
    Gb.getZIndex = Gb.um;
    var Yc = Q.prototype;
    S(Yc, {openInfoWindow: Yc.Pb, closeInfoWindow: Yc.kc, enableMassClear: Yc.gh, disableMassClear: Yc.GG, show: Yc.show, hide: Yc.H, getMap: Yc.Mt, addContextMenu: Yc.Oj, removeContextMenu: Yc.rk});
    var Zc = T.prototype;
    S(Zc, {setIcon: Zc.Rf, getIcon: Zc.nz, setPosition: Zc.da, getPosition: Zc.ca, setOffset: Zc.Vc, getOffset: Zc.Te, getLabel: Zc.oz, setLabel: Zc.gj, setTitle: Zc.bc, setTop: Zc.yk, enableDragging: Zc.Eb, disableDragging: Zc.Ps, setZIndex: Zc.aq, getMap: Zc.Mt, setAnimation: Zc.fj, setShadow: Zc.$p, hide: Zc.H});
    S(window, {BMAP_ANIMATION_DROP: 1, BMAP_ANIMATION_BOUNCE: 2});
    var $c = Mb.prototype;
    S($c, {setStyle: $c.qc, setStyles: $c.Ch, setContent: $c.Hc, setPosition: $c.da, getPosition: $c.ca, setOffset: $c.Vc, getOffset: $c.Te, setTitle: $c.bc, setZIndex: $c.aq, getMap: $c.Mt});
    var ad = Kb.prototype;
    S(ad, {setImageUrl: ad.QJ, setSize: ad.Ic, setAnchor: ad.Sb, setImageOffset: ad.Pm, setImageSize: ad.PJ, setInfoWindowAnchor: ad.SJ, setPrintImageUrl: ad.aK});
    var bd = Lb.prototype;
    S(bd, {redraw: bd.Gc, setTitle: bd.bc, setContent: bd.Hc, getContent: bd.hz, getPosition: bd.ca, enableMaximize: bd.Oe, disableMaximize: bd.Zo, isOpen: bd.za, setMaxContent: bd.Qm, maximize: bd.Dp, enableAutoPan: bd.fm});
    var cd = Ib.prototype;
    S(cd, {getPath: cd.Pc, setPath: cd.Wc, setPositionAt: cd.ij, getStrokeColor: cd.SH, setStrokeWeight: cd.Um, getStrokeWeight: cd.xz, setStrokeOpacity: cd.Sm, getStrokeOpacity: cd.TH, setFillOpacity: cd.Wp, getFillOpacity: cd.xH, setStrokeStyle: cd.Tm, getStrokeStyle: cd.wz, getFillColor: cd.wH, getBounds: cd.vg, enableEditing: cd.Yd, disableEditing: cd.FG});
    var dd = Sb.prototype;
    S(dd, {setCenter: dd.ve, getCenter: dd.Ga, getRadius: dd.LH, setRadius: dd.Zp});
    var ed = Qb.prototype;
    S(ed, {getPath: ed.Pc, setPath: ed.Wc, setPositionAt: ed.ij});
    var fd = Ka.prototype;
    S(fd, {getPosition: fd.ca, setPosition: fd.da, getText: fd.Vt, setText: fd.Vm});
    F.prototype.equals = F.prototype.bb;
    O.prototype.equals = O.prototype.bb;
    K.prototype.equals = K.prototype.bb;
    S(window, {BMAP_ANCHOR_TOP_LEFT: qb, BMAP_ANCHOR_TOP_RIGHT: rb, BMAP_ANCHOR_BOTTOM_LEFT: sb, BMAP_ANCHOR_BOTTOM_RIGHT: 3});
    var gd = R.prototype;
    S(gd, {setAnchor: gd.Sb, getAnchor: gd.wt, setOffset: gd.Vc, getOffset: gd.Te, show: gd.show, hide: gd.H, isVisible: gd.Ag, toString: gd.toString});
    var hd = Ma.prototype;
    S(hd, {getType: hd.ek, setType: hd.jj});
    S(window, {BMAP_NAVIGATION_CONTROL_LARGE: 0, BMAP_NAVIGATION_CONTROL_SMALL: 1, BMAP_NAVIGATION_CONTROL_PAN: 2, BMAP_NAVIGATION_CONTROL_ZOOM: 3});
    var id = Oa.prototype;
    S(id, {changeView: id.Mc, setSize: id.Ic, getSize: id.Fb});
    var kd = Na.prototype;
    S(kd, {getUnit: kd.bI, setUnit: kd.av});
    S(window, {BMAP_UNIT_METRIC: "metric", BMAP_UNIT_IMPERIAL: "us"});
    var ld = ub.prototype;
    S(ld, {addCopyright: ld.Fo, removeCopyright: ld.Lu, getCopyright: ld.Ii, getCopyrightCollection: ld.Ct});
    S(window, {BMAP_MAPTYPE_CONTROL_HORIZONTAL: wb, BMAP_MAPTYPE_CONTROL_DROPDOWN: 1});
    var md = Vb.prototype;
    S(md, {getMapType: md.ha, getCopyright: md.Ii, isTransparentPng: md.Bm});
    var nd = Ab.prototype;
    S(nd, {addItem: nd.Io, addSeparator: nd.qs, removeSeparator: nd.Nu});
    var od = Bb.prototype;
    S(od, {setText: od.Vm});
    var pd = V.prototype;
    S(pd, {getStatus: pd.Oi, setSearchCompleteCallback: pd.Zu, getPageCapacity: pd.Ed, setPageCapacity: pd.xk, setLocation: pd.hj, disableFirstResultSelection: pd.Qs, enableFirstResultSelection: pd.dt, gotoPage: pd.Qi, searchNearby: pd.vk, searchInBounds: pd.ej, search: pd.search});
    S(window, {BMAP_STATUS_SUCCESS: 0, BMAP_STATUS_CITY_LIST: 1, BMAP_STATUS_UNKNOWN_LOCATION: 2, BMAP_STATUS_UNKNOWN_ROUTE: 3, BMAP_STATUS_INVALID_KEY: 4, BMAP_STATUS_INVALID_REQUEST: 5, BMAP_STATUS_PERMISSION_DENIED: 6, BMAP_STATUS_SERVICE_UNAVAILABLE: 7, BMAP_STATUS_TIMEOUT: 8});
    S(window, {BMAP_POI_TYPE_NORMAL: 0, BMAP_POI_TYPE_BUSSTOP: 1, BMAP_POI_TYPE_BUSLINE: 2, BMAP_POI_TYPE_SUBSTOP: 3, BMAP_POI_TYPE_SUBLINE: 4});
    S(window, {BMAP_TRANSIT_POLICY_LEAST_TIME: 0, BMAP_TRANSIT_POLICY_LEAST_TRANSFER: 2, BMAP_TRANSIT_POLICY_LEAST_WALKING: 3, BMAP_TRANSIT_POLICY_AVOID_SUBWAYS: 4, BMAP_LINE_TYPE_BUS: 0, BMAP_LINE_TYPE_SUBWAY: 1, BMAP_LINE_TYPE_FERRY: 2});
    var qd = Ec.prototype;
    S(qd, {clearResults: qd.kd});
    var rd = Fc.prototype;
    S(rd, {setPolicy: rd.Rm, toString: rd.toString, setPageCapacity: rd.xk});
    S(window, {BMAP_DRIVING_POLICY_LEAST_TIME: 0, BMAP_DRIVING_POLICY_LEAST_DISTANCE: 1, BMAP_DRIVING_POLICY_AVOID_HIGHWAYS: 2});
    S(window, {BMAP_HIGHLIGHT_STEP: 1, BMAP_HIGHLIGHT_ROUTE: 2});
    S(window, {BMAP_ROUTE_TYPE_DRIVING: rc, BMAP_ROUTE_TYPE_WALKING: qc});
    S(window, {BMAP_ROUTE_STATUS_NORMAL: sc, BMAP_ROUTE_STATUS_EMPTY: 1, BMAP_ROUTE_STATUS_ADDRESS: 2});
    var sd = Hc.prototype;
    S(sd, {setPolicy: sd.Rm});
    var td = Pc.prototype;
    S(td, {show: td.show, hide: td.H, setTypes: td.$u, setLocation: td.hj, search: td.search, setInputValue: td.Xp});
    S(Qa.prototype, {});
    var ud = Nc.prototype;
    S(ud, {get: ud.get});
    S(yb.prototype, {});
    B.HF();
})()