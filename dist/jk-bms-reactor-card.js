/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var _a;
const t$1 = globalThis, e$2 = t$1.ShadowRoot && (void 0 === t$1.ShadyCSS || t$1.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$2 = Symbol(), o$4 = /* @__PURE__ */ new WeakMap();
let n$3 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$2) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$2 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$4.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$4.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$3("string" == typeof t2 ? t2 : t2 + "", void 0, s$2), i$3 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$3(o2, t2, s$2);
}, S$1 = (s2, o2) => {
  if (e$2) s2.adoptedStyleSheets = o2.map((t2) => t2 instanceof CSSStyleSheet ? t2 : t2.styleSheet);
  else for (const e2 of o2) {
    const o3 = document.createElement("style"), n3 = t$1.litNonce;
    void 0 !== n3 && o3.setAttribute("nonce", n3), o3.textContent = e2.cssText, s2.appendChild(o3);
  }
}, c$2 = e$2 ? (t2) => t2 : (t2) => t2 instanceof CSSStyleSheet ? ((t3) => {
  let e2 = "";
  for (const s2 of t3.cssRules) e2 += s2.cssText;
  return r$4(e2);
})(t2) : t2;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: i$2, defineProperty: e$1, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$3, getPrototypeOf: n$2 } = Object, a$1 = globalThis, c$1 = a$1.trustedTypes, l$1 = c$1 ? c$1.emptyScript : "", p$1 = a$1.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$1 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$1 : null;
      break;
    case Object:
    case Array:
      t2 = null == t2 ? t2 : JSON.stringify(t2);
  }
  return t2;
}, fromAttribute(t2, s2) {
  let i2 = t2;
  switch (s2) {
    case Boolean:
      i2 = null !== t2;
      break;
    case Number:
      i2 = null === t2 ? null : Number(t2);
      break;
    case Object:
    case Array:
      try {
        i2 = JSON.parse(t2);
      } catch (t3) {
        i2 = null;
      }
  }
  return i2;
} }, f$1 = (t2, s2) => !i$2(t2, s2), b$1 = { attribute: true, type: String, converter: u$1, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a$1.litPropertyMetadata ?? (a$1.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let y$1 = class y extends HTMLElement {
  static addInitializer(t2) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t2);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t2, s2 = b$1) {
    if (s2.state && (s2.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t2) && ((s2 = Object.create(s2)).wrapped = true), this.elementProperties.set(t2, s2), !s2.noAccessor) {
      const i2 = Symbol(), h2 = this.getPropertyDescriptor(t2, i2, s2);
      void 0 !== h2 && e$1(this.prototype, t2, h2);
    }
  }
  static getPropertyDescriptor(t2, s2, i2) {
    const { get: e2, set: r2 } = h$1(this.prototype, t2) ?? { get() {
      return this[s2];
    }, set(t3) {
      this[s2] = t3;
    } };
    return { get: e2, set(s3) {
      const h2 = e2 == null ? void 0 : e2.call(this);
      r2 == null ? void 0 : r2.call(this, s3), this.requestUpdate(t2, h2, i2);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t2) {
    return this.elementProperties.get(t2) ?? b$1;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d$1("elementProperties"))) return;
    const t2 = n$2(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$3(t3)];
      for (const i2 of s2) this.createProperty(i2, t3[i2]);
    }
    const t2 = this[Symbol.metadata];
    if (null !== t2) {
      const s2 = litPropertyMetadata.get(t2);
      if (void 0 !== s2) for (const [t3, i2] of s2) this.elementProperties.set(t3, i2);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t3, s2] of this.elementProperties) {
      const i2 = this._$Eu(t3, s2);
      void 0 !== i2 && this._$Eh.set(i2, t3);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s2) {
    const i2 = [];
    if (Array.isArray(s2)) {
      const e2 = new Set(s2.flat(1 / 0).reverse());
      for (const s3 of e2) i2.unshift(c$2(s3));
    } else void 0 !== s2 && i2.push(c$2(s2));
    return i2;
  }
  static _$Eu(t2, s2) {
    const i2 = s2.attribute;
    return false === i2 ? void 0 : "string" == typeof i2 ? i2 : "string" == typeof t2 ? t2.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    var _a2;
    this._$ES = new Promise((t2) => this.enableUpdating = t2), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), (_a2 = this.constructor.l) == null ? void 0 : _a2.forEach((t2) => t2(this));
  }
  addController(t2) {
    var _a2;
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t2), void 0 !== this.renderRoot && this.isConnected && ((_a2 = t2.hostConnected) == null ? void 0 : _a2.call(t2));
  }
  removeController(t2) {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.delete(t2);
  }
  _$E_() {
    const t2 = /* @__PURE__ */ new Map(), s2 = this.constructor.elementProperties;
    for (const i2 of s2.keys()) this.hasOwnProperty(i2) && (t2.set(i2, this[i2]), delete this[i2]);
    t2.size > 0 && (this._$Ep = t2);
  }
  createRenderRoot() {
    const t2 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S$1(t2, this.constructor.elementStyles), t2;
  }
  connectedCallback() {
    var _a2;
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t2) => {
      var _a3;
      return (_a3 = t2.hostConnected) == null ? void 0 : _a3.call(t2);
    });
  }
  enableUpdating(t2) {
  }
  disconnectedCallback() {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t2) => {
      var _a3;
      return (_a3 = t2.hostDisconnected) == null ? void 0 : _a3.call(t2);
    });
  }
  attributeChangedCallback(t2, s2, i2) {
    this._$AK(t2, i2);
  }
  _$ET(t2, s2) {
    var _a2;
    const i2 = this.constructor.elementProperties.get(t2), e2 = this.constructor._$Eu(t2, i2);
    if (void 0 !== e2 && true === i2.reflect) {
      const h2 = (void 0 !== ((_a2 = i2.converter) == null ? void 0 : _a2.toAttribute) ? i2.converter : u$1).toAttribute(s2, i2.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    var _a2, _b;
    const i2 = this.constructor, e2 = i2._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i2.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== ((_a2 = t3.converter) == null ? void 0 : _a2.fromAttribute) ? t3.converter : u$1;
      this._$Em = e2;
      const r2 = h2.fromAttribute(s2, t3.type);
      this[e2] = r2 ?? ((_b = this._$Ej) == null ? void 0 : _b.get(e2)) ?? r2, this._$Em = null;
    }
  }
  requestUpdate(t2, s2, i2, e2 = false, h2) {
    var _a2;
    if (void 0 !== t2) {
      const r2 = this.constructor;
      if (false === e2 && (h2 = this[t2]), i2 ?? (i2 = r2.getPropertyOptions(t2)), !((i2.hasChanged ?? f$1)(h2, s2) || i2.useDefault && i2.reflect && h2 === ((_a2 = this._$Ej) == null ? void 0 : _a2.get(t2)) && !this.hasAttribute(r2._$Eu(t2, i2)))) return;
      this.C(t2, s2, i2);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t2, s2, { useDefault: i2, reflect: e2, wrapped: h2 }, r2) {
    i2 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t2) && (this._$Ej.set(t2, r2 ?? s2 ?? this[t2]), true !== h2 || void 0 !== r2) || (this._$AL.has(t2) || (this.hasUpdated || i2 || (s2 = void 0), this._$AL.set(t2, s2)), true === e2 && this._$Em !== t2 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t2));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t3) {
      Promise.reject(t3);
    }
    const t2 = this.scheduleUpdate();
    return null != t2 && await t2, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    var _a2;
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t4, s3] of this._$Ep) this[t4] = s3;
        this._$Ep = void 0;
      }
      const t3 = this.constructor.elementProperties;
      if (t3.size > 0) for (const [s3, i2] of t3) {
        const { wrapped: t4 } = i2, e2 = this[s3];
        true !== t4 || this._$AL.has(s3) || void 0 === e2 || this.C(s3, void 0, i2, e2);
      }
    }
    let t2 = false;
    const s2 = this._$AL;
    try {
      t2 = this.shouldUpdate(s2), t2 ? (this.willUpdate(s2), (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t3) => {
        var _a3;
        return (_a3 = t3.hostUpdate) == null ? void 0 : _a3.call(t3);
      }), this.update(s2)) : this._$EM();
    } catch (s3) {
      throw t2 = false, this._$EM(), s3;
    }
    t2 && this._$AE(s2);
  }
  willUpdate(t2) {
  }
  _$AE(t2) {
    var _a2;
    (_a2 = this._$EO) == null ? void 0 : _a2.forEach((t3) => {
      var _a3;
      return (_a3 = t3.hostUpdated) == null ? void 0 : _a3.call(t3);
    }), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t2)), this.updated(t2);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t2) {
    return true;
  }
  update(t2) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t3) => this._$ET(t3, this[t3]))), this._$EM();
  }
  updated(t2) {
  }
  firstUpdated(t2) {
  }
};
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1 == null ? void 0 : p$1({ ReactiveElement: y$1 }), (a$1.reactiveElementVersions ?? (a$1.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = globalThis, i$1 = (t2) => t2, s$1 = t.trustedTypes, e = s$1 ? s$1.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$2 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$1 = "?" + o$2, r$2 = `<${n$1}>`, l = document, c = () => l.createComment(""), a = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u = Array.isArray, d = (t2) => u(t2) || "function" == typeof (t2 == null ? void 0 : t2[Symbol.iterator]), f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i2, ...s2) => ({ _$litType$: t2, strings: i2, values: s2 }), b = x(1), w = x(2), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = /* @__PURE__ */ new WeakMap(), P = l.createTreeWalker(l, 129);
function V(t2, i2) {
  if (!u(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e ? e.createHTML(i2) : i2;
}
const N = (t2, i2) => {
  const s2 = t2.length - 1, e2 = [];
  let n3, l2 = 2 === i2 ? "<svg>" : 3 === i2 ? "<math>" : "", c2 = v;
  for (let i3 = 0; i3 < s2; i3++) {
    const s3 = t2[i3];
    let a2, u2, d2 = -1, f2 = 0;
    for (; f2 < s3.length && (c2.lastIndex = f2, u2 = c2.exec(s3), null !== u2); ) f2 = c2.lastIndex, c2 === v ? "!--" === u2[1] ? c2 = _ : void 0 !== u2[1] ? c2 = m : void 0 !== u2[2] ? (y2.test(u2[2]) && (n3 = RegExp("</" + u2[2], "g")), c2 = p) : void 0 !== u2[3] && (c2 = p) : c2 === p ? ">" === u2[0] ? (c2 = n3 ?? v, d2 = -1) : void 0 === u2[1] ? d2 = -2 : (d2 = c2.lastIndex - u2[2].length, a2 = u2[1], c2 = void 0 === u2[3] ? p : '"' === u2[3] ? $ : g) : c2 === $ || c2 === g ? c2 = p : c2 === _ || c2 === m ? c2 = v : (c2 = p, n3 = void 0);
    const x2 = c2 === p && t2[i3 + 1].startsWith("/>") ? " " : "";
    l2 += c2 === v ? s3 + r$2 : d2 >= 0 ? (e2.push(a2), s3.slice(0, d2) + h + s3.slice(d2) + o$2 + x2) : s3 + o$2 + (-2 === d2 ? i3 : x2);
  }
  return [V(t2, l2 + (t2[s2] || "<?>") + (2 === i2 ? "</svg>" : 3 === i2 ? "</math>" : "")), e2];
};
class S {
  constructor({ strings: t2, _$litType$: i2 }, e2) {
    let r2;
    this.parts = [];
    let l2 = 0, a2 = 0;
    const u2 = t2.length - 1, d2 = this.parts, [f2, v2] = N(t2, i2);
    if (this.el = S.createElement(f2, e2), P.currentNode = this.el.content, 2 === i2 || 3 === i2) {
      const t3 = this.el.content.firstChild;
      t3.replaceWith(...t3.childNodes);
    }
    for (; null !== (r2 = P.nextNode()) && d2.length < u2; ) {
      if (1 === r2.nodeType) {
        if (r2.hasAttributes()) for (const t3 of r2.getAttributeNames()) if (t3.endsWith(h)) {
          const i3 = v2[a2++], s2 = r2.getAttribute(t3).split(o$2), e3 = /([.?@])?(.*)/.exec(i3);
          d2.push({ type: 1, index: l2, name: e3[2], strings: s2, ctor: "." === e3[1] ? I : "?" === e3[1] ? L : "@" === e3[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$2) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$2), i3 = t3.length - 1;
          if (i3 > 0) {
            r2.textContent = s$1 ? s$1.emptyScript : "";
            for (let s2 = 0; s2 < i3; s2++) r2.append(t3[s2], c()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i3], c());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$1) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$2, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$2.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i2) {
    const s2 = l.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function M(t2, i2, s2 = t2, e2) {
  var _a2, _b;
  if (i2 === E) return i2;
  let h2 = void 0 !== e2 ? (_a2 = s2._$Co) == null ? void 0 : _a2[e2] : s2._$Cl;
  const o2 = a(i2) ? void 0 : i2._$litDirective$;
  return (h2 == null ? void 0 : h2.constructor) !== o2 && ((_b = h2 == null ? void 0 : h2._$AO) == null ? void 0 : _b.call(h2, false), void 0 === o2 ? h2 = void 0 : (h2 = new o2(t2), h2._$AT(t2, s2, e2)), void 0 !== e2 ? (s2._$Co ?? (s2._$Co = []))[e2] = h2 : s2._$Cl = h2), void 0 !== h2 && (i2 = M(t2, h2._$AS(t2, i2.values), h2, e2)), i2;
}
class R {
  constructor(t2, i2) {
    this._$AV = [], this._$AN = void 0, this._$AD = t2, this._$AM = i2;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t2) {
    const { el: { content: i2 }, parts: s2 } = this._$AD, e2 = ((t2 == null ? void 0 : t2.creationScope) ?? l).importNode(i2, true);
    P.currentNode = e2;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s2[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i3;
        2 === r2.type ? i3 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i3 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i3 = new Z(h2, this, t2)), this._$AV.push(i3), r2 = s2[++n3];
      }
      o2 !== (r2 == null ? void 0 : r2.index) && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l, e2;
  }
  p(t2) {
    let i2 = 0;
    for (const s2 of this._$AV) void 0 !== s2 && (void 0 !== s2.strings ? (s2._$AI(t2, s2, i2), i2 += s2.strings.length - 2) : s2._$AI(t2[i2])), i2++;
  }
}
class k {
  get _$AU() {
    var _a2;
    return ((_a2 = this._$AM) == null ? void 0 : _a2._$AU) ?? this._$Cv;
  }
  constructor(t2, i2, s2, e2) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t2, this._$AB = i2, this._$AM = s2, this.options = e2, this._$Cv = (e2 == null ? void 0 : e2.isConnected) ?? true;
  }
  get parentNode() {
    let t2 = this._$AA.parentNode;
    const i2 = this._$AM;
    return void 0 !== i2 && 11 === (t2 == null ? void 0 : t2.nodeType) && (t2 = i2.parentNode), t2;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t2, i2 = this) {
    t2 = M(this, t2, i2), a(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l.createTextNode(t2)), this._$AH = t2;
  }
  $(t2) {
    var _a2;
    const { values: i2, _$litType$: s2 } = t2, e2 = "number" == typeof s2 ? this._$AC(t2) : (void 0 === s2.el && (s2.el = S.createElement(V(s2.h, s2.h[0]), this.options)), s2);
    if (((_a2 = this._$AH) == null ? void 0 : _a2._$AD) === e2) this._$AH.p(i2);
    else {
      const t3 = new R(e2, this), s3 = t3.u(this.options);
      t3.p(i2), this.T(s3), this._$AH = t3;
    }
  }
  _$AC(t2) {
    let i2 = C.get(t2.strings);
    return void 0 === i2 && C.set(t2.strings, i2 = new S(t2)), i2;
  }
  k(t2) {
    u(this._$AH) || (this._$AH = [], this._$AR());
    const i2 = this._$AH;
    let s2, e2 = 0;
    for (const h2 of t2) e2 === i2.length ? i2.push(s2 = new k(this.O(c()), this.O(c()), this, this.options)) : s2 = i2[e2], s2._$AI(h2), e2++;
    e2 < i2.length && (this._$AR(s2 && s2._$AB.nextSibling, e2), i2.length = e2);
  }
  _$AR(t2 = this._$AA.nextSibling, s2) {
    var _a2;
    for ((_a2 = this._$AP) == null ? void 0 : _a2.call(this, false, true, s2); t2 !== this._$AB; ) {
      const s3 = i$1(t2).nextSibling;
      i$1(t2).remove(), t2 = s3;
    }
  }
  setConnected(t2) {
    var _a2;
    void 0 === this._$AM && (this._$Cv = t2, (_a2 = this._$AP) == null ? void 0 : _a2.call(this, t2));
  }
}
class H {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t2, i2, s2, e2, h2) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t2, this.name = i2, this._$AM = e2, this.options = h2, s2.length > 2 || "" !== s2[0] || "" !== s2[1] ? (this._$AH = Array(s2.length - 1).fill(new String()), this.strings = s2) : this._$AH = A;
  }
  _$AI(t2, i2 = this, s2, e2) {
    const h2 = this.strings;
    let o2 = false;
    if (void 0 === h2) t2 = M(this, t2, i2, 0), o2 = !a(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e3[s2 + n3], i2, n3), r2 === E && (r2 = this._$AH[n3]), o2 || (o2 = !a(r2) || r2 !== this._$AH[n3]), r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
    }
    o2 && !e2 && this.j(t2);
  }
  j(t2) {
    t2 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t2 ?? "");
  }
}
class I extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t2) {
    this.element[this.name] = t2 === A ? void 0 : t2;
  }
}
class L extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t2) {
    this.element.toggleAttribute(this.name, !!t2 && t2 !== A);
  }
}
class z extends H {
  constructor(t2, i2, s2, e2, h2) {
    super(t2, i2, s2, e2, h2), this.type = 5;
  }
  _$AI(t2, i2 = this) {
    if ((t2 = M(this, t2, i2, 0) ?? A) === E) return;
    const s2 = this._$AH, e2 = t2 === A && s2 !== A || t2.capture !== s2.capture || t2.once !== s2.once || t2.passive !== s2.passive, h2 = t2 !== A && (s2 === A || e2);
    e2 && this.element.removeEventListener(this.name, this, s2), h2 && this.element.addEventListener(this.name, this, t2), this._$AH = t2;
  }
  handleEvent(t2) {
    var _a2;
    "function" == typeof this._$AH ? this._$AH.call(((_a2 = this.options) == null ? void 0 : _a2.host) ?? this.element, t2) : this._$AH.handleEvent(t2);
  }
}
class Z {
  constructor(t2, i2, s2) {
    this.element = t2, this.type = 6, this._$AN = void 0, this._$AM = i2, this.options = s2;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t2) {
    M(this, t2);
  }
}
const B = t.litHtmlPolyfillSupport;
B == null ? void 0 : B(S, k), (t.litHtmlVersions ?? (t.litHtmlVersions = [])).push("3.3.2");
const D = (t2, i2, s2) => {
  const e2 = (s2 == null ? void 0 : s2.renderBefore) ?? i2;
  let h2 = e2._$litPart$;
  if (void 0 === h2) {
    const t3 = (s2 == null ? void 0 : s2.renderBefore) ?? null;
    e2._$litPart$ = h2 = new k(i2.insertBefore(c(), t3), t3, void 0, s2 ?? {});
  }
  return h2._$AI(t2), h2;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const s = globalThis;
class i extends y$1 {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a2;
    const t2 = super.createRenderRoot();
    return (_a2 = this.renderOptions).renderBefore ?? (_a2.renderBefore = t2.firstChild), t2;
  }
  update(t2) {
    const r2 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t2), this._$Do = D(r2, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    var _a2;
    super.connectedCallback(), (_a2 = this._$Do) == null ? void 0 : _a2.setConnected(true);
  }
  disconnectedCallback() {
    var _a2;
    super.disconnectedCallback(), (_a2 = this._$Do) == null ? void 0 : _a2.setConnected(false);
  }
  render() {
    return E;
  }
}
i._$litElement$ = true, i["finalized"] = true, (_a = s.litElementHydrateSupport) == null ? void 0 : _a.call(s, { LitElement: i });
const o$1 = s.litElementPolyfillSupport;
o$1 == null ? void 0 : o$1({ LitElement: i });
(s.litElementVersions ?? (s.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o = { attribute: true, type: String, converter: u$1, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o, e2, r2) => {
  const { kind: n3, metadata: i2 } = r2;
  let s2 = globalThis.litPropertyMetadata.get(i2);
  if (void 0 === s2 && globalThis.litPropertyMetadata.set(i2, s2 = /* @__PURE__ */ new Map()), "setter" === n3 && ((t2 = Object.create(t2)).wrapped = true), s2.set(r2.name, t2), "accessor" === n3) {
    const { name: o2 } = r2;
    return { set(r3) {
      const n4 = e2.get.call(this);
      e2.set.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    }, init(e3) {
      return void 0 !== e3 && this.C(o2, void 0, t2, e3), e3;
    } };
  }
  if ("setter" === n3) {
    const { name: o2 } = r2;
    return function(r3) {
      const n4 = this[o2];
      e2.call(this, r3), this.requestUpdate(o2, n4, t2, true, r3);
    };
  }
  throw Error("Unsupported decorator location: " + n3);
};
function n2(t2) {
  return (e2, o2) => "object" == typeof o2 ? r$1(t2, e2, o2) : ((t3, e3, o3) => {
    const r2 = e3.hasOwnProperty(o3);
    return e3.constructor.createProperty(o3, t3), r2 ? Object.getOwnPropertyDescriptor(e3, o3) : void 0;
  })(t2, e2, o2);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function r(r2) {
  return n2({ ...r2, state: true, attribute: false });
}
function getEntityState(hass, entityId) {
  const entity = hass.states[entityId];
  return (entity == null ? void 0 : entity.state) ?? null;
}
function parseFloat(state) {
  if (state === null || state === "unknown" || state === "unavailable") {
    return null;
  }
  const value = Number(state);
  return isNaN(value) ? null : value;
}
function getNumericValue(hass, entityId) {
  const state = getEntityState(hass, entityId);
  return parseFloat(state);
}
function isEntityOn(hass, entityId) {
  const state = getEntityState(hass, entityId);
  if (!state) return false;
  return state.toLowerCase() === "on" || state === "1" || state === "true";
}
function getCellEntityIds(config) {
  if (config.cells && config.cells.length > 0) {
    return config.cells;
  }
  if (config.cells_prefix && config.cells_count) {
    const count = config.cells_count;
    return Array.from({ length: count }, (_2, i2) => `${config.cells_prefix}${i2 + 1}`);
  }
  return [];
}
function getCellVoltages(hass, config) {
  const entityIds = getCellEntityIds(config);
  return entityIds.map((id) => getNumericValue(hass, id) ?? 0);
}
function getBalancingCells(hass, config, cellVoltages, current, delta) {
  const balancingEntity = config.balancing;
  if (balancingEntity) {
    const isBalancing = isEntityOn(hass, balancingEntity);
    if (!isBalancing) {
      return cellVoltages.map(() => false);
    }
  }
  const maxVoltage = Math.max(...cellVoltages);
  const threshold = config.balance_threshold_v ?? 0.01;
  const chargeThreshold = config.charge_threshold_a ?? 0.5;
  const isCharging = current !== null && current > chargeThreshold;
  const hasSignificantDelta = delta !== null && delta > 0.02;
  const hasHighCell = maxVoltage > 3.35;
  if (config.balancing && isEntityOn(hass, config.balancing)) {
    return cellVoltages.map((v2) => Math.abs(v2 - maxVoltage) <= threshold);
  } else if (isCharging && (hasSignificantDelta || hasHighCell)) {
    return cellVoltages.map((v2) => Math.abs(v2 - maxVoltage) <= threshold);
  }
  return cellVoltages.map(() => false);
}
function computePackState(hass, config) {
  const voltage = getNumericValue(hass, config.pack_voltage);
  const current = getNumericValue(hass, config.current);
  const soc = getNumericValue(hass, config.soc);
  const cellVoltages = getCellVoltages(hass, config);
  let delta = null;
  if (config.delta) {
    delta = getNumericValue(hass, config.delta);
  } else if (cellVoltages.length > 0) {
    const validVoltages = cellVoltages.filter((v2) => v2 > 0);
    if (validVoltages.length > 0) {
      const minV = Math.min(...validVoltages);
      const maxV = Math.max(...validVoltages);
      delta = maxV - minV;
    }
  }
  const minCell = cellVoltages.length > 0 ? Math.min(...cellVoltages.filter((v2) => v2 > 0)) : null;
  const maxCell = cellVoltages.length > 0 ? Math.max(...cellVoltages) : null;
  const balancingFlags = getBalancingCells(hass, config, cellVoltages, current, delta);
  const isBalancing = balancingFlags.some((b2) => b2);
  const cells = cellVoltages.map((voltage2, index) => ({
    index,
    voltage: voltage2,
    isBalancing: balancingFlags[index]
  }));
  const chargeThreshold = config.charge_threshold_a ?? 0.5;
  const dischargeThreshold = config.discharge_threshold_a ?? 0.5;
  const isCharging = current !== null && current > chargeThreshold;
  const isDischarging = current !== null && current < -dischargeThreshold;
  return {
    voltage,
    current,
    soc,
    cells,
    delta,
    minCell,
    maxCell,
    isBalancing,
    isCharging,
    isDischarging
  };
}
function formatNumber(value, decimals = 2) {
  if (value === null) return "—";
  return value.toFixed(decimals);
}
function getCellPositions(cellCount = 16) {
  const positions = [];
  const cols = 4;
  const cellSize = 80;
  const gapSize = 20;
  const offsetX = 50;
  const offsetY = 50;
  for (let i2 = 0; i2 < cellCount; i2++) {
    const row = Math.floor(i2 / cols);
    const col = i2 % cols;
    positions.push({
      index: i2,
      x: offsetX + col * (cellSize + gapSize) + cellSize / 2,
      y: offsetY + row * (cellSize + gapSize) + cellSize / 2
    });
  }
  return positions;
}
function getReactorViewBox(cellCount = 16) {
  const cols = 4;
  const rows = Math.ceil(cellCount / cols);
  const cellSize = 80;
  const gapSize = 20;
  const padding = 100;
  const width = cols * cellSize + (cols - 1) * gapSize + padding * 2;
  const height = rows * cellSize + (rows - 1) * gapSize + padding * 2;
  return `0 0 ${width} ${height}`;
}
function renderBalanceOverlay(cells, isBalancing) {
  if (!isBalancing) {
    return w``;
  }
  const positions = getCellPositions(cells.length);
  const balancingCells = cells.filter((c2) => c2.isBalancing);
  const balancingPositions = balancingCells.map((c2) => positions[c2.index]);
  if (balancingPositions.length === 0) {
    return w``;
  }
  const lines = [];
  const centerX = positions.reduce((sum, p2) => sum + p2.x, 0) / positions.length;
  const centerY = positions.reduce((sum, p2) => sum + p2.y, 0) / positions.length;
  for (const pos of balancingPositions) {
    lines.push(w`
      <line
        x1="${centerX}"
        y1="${centerY}"
        x2="${pos.x}"
        y2="${pos.y}"
        class="balance-line"
        stroke="var(--balance-color, #ffa500)"
        stroke-width="2"
        stroke-dasharray="5,5"
      />
    `);
  }
  const glowCircles = balancingPositions.map((pos) => w`
    <circle
      cx="${pos.x}"
      cy="${pos.y}"
      r="35"
      class="balance-glow"
      fill="none"
      stroke="var(--balance-color, #ffa500)"
      stroke-width="2"
      opacity="0.6"
    />
  `);
  return w`
    <g class="balance-overlay">
      ${lines}
      ${glowCircles}
      <circle
        cx="${centerX}"
        cy="${centerY}"
        r="10"
        class="balance-center"
        fill="var(--balance-color, #ffa500)"
        opacity="0.8"
      />
    </g>
  `;
}
function renderEnergyFlow(isCharging, isDischarging) {
  if (!isCharging && !isDischarging) {
    return w``;
  }
  const direction = isCharging ? "charging" : "discharging";
  const positions = getCellPositions(16);
  const particles = [];
  for (let i2 = 0; i2 < 8; i2++) {
    const angle = i2 / 8 * Math.PI * 2;
    const centerX = positions.reduce((sum, p2) => sum + p2.x, 0) / positions.length;
    const centerY = positions.reduce((sum, p2) => sum + p2.y, 0) / positions.length;
    const radius = 80;
    particles.push(w`
      <circle
        cx="${centerX + Math.cos(angle) * radius}"
        cy="${centerY + Math.sin(angle) * radius}"
        r="3"
        class="energy-particle ${direction}"
        fill="var(--energy-color, #4CAF50)"
        opacity="0.7"
      />
    `);
  }
  return w`
    <g class="energy-flow ${direction}">
      ${particles}
    </g>
  `;
}
const styles = i$3`
  :host {
    display: block;
    --primary-color: #03a9f4;
    --balance-color: #ffa500;
    --energy-color: #4caf50;
    --warning-color: #ff9800;
    --danger-color: #f44336;
    --text-primary: var(--primary-text-color, #212121);
    --text-secondary: var(--secondary-text-color, #727272);
    --card-background: var(--ha-card-background, var(--card-background-color, #fff));
    --divider-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .card-content {
    padding: 16px;
    background: var(--card-background);
  }

  .pack-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .info-item {
    text-align: center;
    padding: 8px;
    background: var(--primary-background-color, #fafafa);
    border-radius: 8px;
  }

  .info-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .info-unit {
    font-size: 14px;
    color: var(--text-secondary);
    margin-left: 2px;
  }

  .reactor-container {
    position: relative;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
  }

  .reactor-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    position: relative;
  }

  .cell {
    aspect-ratio: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .cell.balancing {
    animation: pulse-glow 2s ease-in-out infinite;
    box-shadow: 0 0 20px var(--balance-color);
  }

  .cell-label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 4px;
    font-weight: 500;
  }

  .cell-voltage {
    font-size: 16px;
    font-weight: 700;
    color: #fff;
  }

  .cell-voltage-unit {
    font-size: 11px;
    margin-left: 2px;
    opacity: 0.9;
  }

  .overlay-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
  }

  /* Balancing animations */
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 10px var(--balance-color);
      transform: scale(1);
    }
    50% {
      box-shadow: 0 0 25px var(--balance-color);
      transform: scale(1.02);
    }
  }

  .balance-line {
    animation: dash-flow 2s linear infinite;
  }

  @keyframes dash-flow {
    to {
      stroke-dashoffset: -10;
    }
  }

  .balance-glow {
    animation: glow-pulse 2s ease-in-out infinite;
  }

  @keyframes glow-pulse {
    0%, 100% {
      opacity: 0.3;
      r: 35;
    }
    50% {
      opacity: 0.8;
      r: 38;
    }
  }

  .balance-center {
    animation: center-pulse 2s ease-in-out infinite;
  }

  @keyframes center-pulse {
    0%, 100% {
      opacity: 0.6;
      transform: scale(1);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  /* Energy flow animations */
  .energy-flow.charging .energy-particle {
    animation: flow-up 3s ease-in-out infinite;
  }

  .energy-flow.discharging .energy-particle {
    animation: flow-down 3s ease-in-out infinite;
  }

  @keyframes flow-up {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0;
      transform: translateY(-20px);
    }
  }

  @keyframes flow-down {
    0% {
      opacity: 0;
      transform: translateY(-20px);
    }
    50% {
      opacity: 0.7;
    }
    100% {
      opacity: 0;
      transform: translateY(20px);
    }
  }

  .energy-particle {
    animation-delay: calc(var(--particle-index, 0) * 0.2s);
  }

  /* Status indicators */
  .status-bar {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    flex-wrap: wrap;
  }

  .status-badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-badge.charging {
    background: rgba(76, 175, 80, 0.1);
    color: #4caf50;
  }

  .status-badge.discharging {
    background: rgba(33, 150, 243, 0.1);
    color: #2196f3;
  }

  .status-badge.balancing {
    background: rgba(255, 165, 0, 0.1);
    color: #ffa500;
  }

  .status-indicator {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    animation: blink 1.5s ease-in-out infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  /* Cell voltage color coding */
  .cell.low-voltage {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .cell.high-voltage {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .cell.normal-voltage {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }

  /* Responsive design */
  @media (max-width: 600px) {
    .pack-info {
      grid-template-columns: repeat(2, 1fr);
    }

    .info-value {
      font-size: 16px;
    }

    .cell-voltage {
      font-size: 14px;
    }

    .reactor-grid {
      gap: 8px;
    }
  }
`;
var __defProp$1 = Object.defineProperty;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp$1(target, key, result);
  return result;
};
class JkBmsReactorCard extends i {
  static get styles() {
    return styles;
  }
  setConfig(config) {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = {
      ...config,
      // Apply defaults only if not provided
      pack_voltage: config.pack_voltage ?? "",
      current: config.current ?? "",
      soc: config.soc ?? "",
      cells_prefix: config.cells_prefix ?? "sensor.jk_bms_cell_",
      cells_count: config.cells_count ?? 16,
      show_overlay: config.show_overlay ?? true,
      show_cell_labels: config.show_cell_labels ?? true,
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5
    };
  }
  getCardSize() {
    return 6;
  }
  static getConfigElement() {
    return document.createElement("jk-bms-reactor-card-editor");
  }
  static getStubConfig() {
    return {
      type: "custom:jk-bms-reactor-card",
      pack_voltage: "",
      current: "",
      soc: "",
      cells_prefix: "sensor.jk_bms_cell_",
      cells_count: 16
    };
  }
  _getCellVoltageClass(voltage, minCell, maxCell) {
    if (voltage < 3) return "low-voltage";
    if (voltage > 3.5) return "high-voltage";
    return "normal-voltage";
  }
  render() {
    if (!this.hass || !this._config) {
      return b``;
    }
    const hasRequiredConfig = this._config.pack_voltage && this._config.current && this._config.soc;
    const hasCellsConfig = this._config.cells || this._config.cells_prefix && this._config.cells_count;
    if (!hasRequiredConfig || !hasCellsConfig) {
      return b`
                <ha-card>
                    <div class="card-content" style="padding: 24px; text-align: center;">
                        <ha-icon icon="mdi:alert-circle-outline" style="font-size: 48px; color: var(--warning-color);"></ha-icon>
                        <h3 style="margin: 16px 0 8px;">Configuration Required</h3>
                        <p style="color: var(--secondary-text-color); margin: 0;">
                            Please configure the card using the visual editor.
                        </p>
                        <ul style="text-align: left; display: inline-block; margin-top: 16px;">
                            ${!this._config.pack_voltage ? b`<li>Pack Voltage entity</li>` : ""}
                            ${!this._config.current ? b`<li>Current entity</li>` : ""}
                            ${!this._config.soc ? b`<li>SOC entity</li>` : ""}
                            ${!hasCellsConfig ? b`<li>Cell configuration (cells array or prefix+count)</li>` : ""}
                        </ul>
                    </div>
                </ha-card>
            `;
    }
    const packState = computePackState(this.hass, this._config);
    return b`
            <ha-card>
                <div class="card-content">
                    ${this._renderPackInfo(packState)}
                    ${this._renderReactor(packState)}
                    ${this._renderStatusBar(packState)}
                </div>
            </ha-card>
        `;
  }
  _renderPackInfo(packState) {
    return b`
      <div class="pack-info">
        <div class="info-item">
          <div class="info-label">Voltage</div>
          <div class="info-value">
            ${formatNumber(packState.voltage, 2)}
            <span class="info-unit">V</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Current</div>
          <div class="info-value">
            ${formatNumber(packState.current, 2)}
            <span class="info-unit">A</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">SOC</div>
          <div class="info-value">
            ${formatNumber(packState.soc, 0)}
            <span class="info-unit">%</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Delta</div>
          <div class="info-value">
            ${formatNumber(packState.delta, 3)}
            <span class="info-unit">V</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Min Cell</div>
          <div class="info-value">
            ${formatNumber(packState.minCell, 3)}
            <span class="info-unit">V</span>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-label">Max Cell</div>
          <div class="info-value">
            ${formatNumber(packState.maxCell, 3)}
            <span class="info-unit">V</span>
          </div>
        </div>
      </div>
    `;
  }
  _renderReactor(packState) {
    const showOverlay = this._config.show_overlay !== false;
    const showLabels = this._config.show_cell_labels !== false;
    return b`
      <div class="reactor-container">
        <div class="reactor-grid">
          ${packState.cells.map((cell, index) => {
      const cellClass = this._getCellVoltageClass(
        cell.voltage,
        packState.minCell,
        packState.maxCell
      );
      return b`
              <div class="cell ${cellClass} ${cell.isBalancing ? "balancing" : ""}">
                ${showLabels ? b`<div class="cell-label">Cell ${index + 1}</div>` : ""}
                <div class="cell-voltage">
                  ${formatNumber(cell.voltage, 3)}
                  <span class="cell-voltage-unit">V</span>
                </div>
              </div>
            `;
    })}
          
          ${showOverlay ? this._renderOverlay(packState) : ""}
        </div>
      </div>
    `;
  }
  _renderOverlay(packState) {
    getCellPositions(packState.cells.length);
    const viewBox = getReactorViewBox(packState.cells.length);
    return b`
      <svg class="overlay-svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">
        ${renderBalanceOverlay(packState.cells, packState.isBalancing)}
        ${renderEnergyFlow(packState.isCharging, packState.isDischarging)}
      </svg>
    `;
  }
  _renderStatusBar(packState) {
    const badges = [];
    if (packState.isCharging) {
      badges.push(b`
        <div class="status-badge charging">
          <span class="status-indicator"></span>
          Charging
        </div>
      `);
    }
    if (packState.isDischarging) {
      badges.push(b`
        <div class="status-badge discharging">
          <span class="status-indicator"></span>
          Discharging
        </div>
      `);
    }
    if (packState.isBalancing) {
      badges.push(b`
        <div class="status-badge balancing">
          <span class="status-indicator"></span>
          Balancing
        </div>
      `);
    }
    if (badges.length === 0) {
      return b``;
    }
    return b`
      <div class="status-bar">
        ${badges}
      </div>
    `;
  }
}
__decorateClass$1([
  n2({ attribute: false })
], JkBmsReactorCard.prototype, "hass");
__decorateClass$1([
  r()
], JkBmsReactorCard.prototype, "_config");
var __defProp = Object.defineProperty;
var __decorateClass = (decorators, target, key, kind) => {
  var result = void 0;
  for (var i2 = decorators.length - 1, decorator; i2 >= 0; i2--)
    if (decorator = decorators[i2])
      result = decorator(target, key, result) || result;
  if (result) __defProp(target, key, result);
  return result;
};
class JkBmsReactorCardEditor extends i {
  static get styles() {
    return i$3`
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .option {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .option label {
        font-weight: 500;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .option .description {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: -2px;
      }

      ha-textfield,
      ha-switch {
        width: 100%;
      }

      .section-title {
        font-weight: 600;
        font-size: 16px;
        margin-top: 8px;
        margin-bottom: 8px;
        color: var(--primary-text-color);
      }

      .cells-mode {
        display: flex;
        gap: 8px;
        margin-bottom: 12px;
      }

      .cells-mode ha-button {
        flex: 1;
      }

      .cells-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }

      .cell-input {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .cell-input ha-textfield {
        flex: 1;
      }

      .add-cell-btn {
        margin-top: 8px;
      }
    `;
  }
  setConfig(config) {
    this._config = {
      ...config,
      pack_voltage: config.pack_voltage ?? "",
      current: config.current ?? "",
      soc: config.soc ?? "",
      cells_prefix: config.cells_prefix ?? "sensor.jk_bms_cell_",
      cells_count: config.cells_count ?? 16,
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5,
      show_overlay: config.show_overlay ?? true,
      show_cell_labels: config.show_cell_labels ?? true
    };
  }
  render() {
    if (!this._config) {
      return b``;
    }
    if (!this.hass) {
      return b`
        <div class="card-config">
          <div class="option">
            <p>Loading...</p>
          </div>
        </div>
      `;
    }
    const useCellsArray = Array.isArray(this._config.cells) && this._config.cells.length > 0;
    return b`
      <div class="card-config">
        <div class="section-title">Required Settings</div>

        <div class="option">
          <label>Pack Voltage Entity</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.pack_voltage || ""}
            .configValue=${"pack_voltage"}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for total pack voltage</div>
        </div>

        <div class="option">
          <label>Current Entity</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.current || ""}
            .configValue=${"current"}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for pack current (positive = charging)</div>
        </div>

        <div class="option">
          <label>State of Charge (SOC) Entity</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.soc || ""}
            .configValue=${"soc"}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for battery state of charge (%)</div>
        </div>

        <div class="section-title">Cell Configuration</div>
        
        <div class="cells-mode">
          <mwc-button
            ?raised=${useCellsArray}
            @click=${() => this._setCellsMode("array")}
          >
            Individual Cells
          </mwc-button>
          <mwc-button
            ?raised=${!useCellsArray}
            @click=${() => this._setCellsMode("prefix")}
          >
            Prefix + Count
          </mwc-button>
        </div>

        ${useCellsArray ? this._renderCellsArray() : this._renderCellsPrefix()}

        <div class="section-title">Optional Settings</div>

        <div class="option">
          <label>Balancing Entity (Optional)</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.balancing || ""}
            .configValue=${"balancing"}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Binary sensor for balancing status</div>
        </div>

        <div class="option">
          <label>Delta Voltage Entity (Optional)</label>
          <ha-entity-picker
            .hass=${this.hass}
            .value=${this._config.delta || ""}
            .configValue=${"delta"}
            @value-changed=${this._valueChanged}
            allow-custom-entity
          ></ha-entity-picker>
          <div class="description">Entity for cell voltage delta (auto-calculated if not provided)</div>
        </div>

        <div class="section-title">Thresholds</div>

        <div class="option">
          <label>Balance Threshold (V)</label>
          <ha-textfield
            type="number"
            step="0.001"
            .value=${this._config.balance_threshold_v ?? 0.01}
            .configValue=${"balance_threshold_v"}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Voltage difference to mark cells as balancing (default: 0.01V)</div>
        </div>

        <div class="option">
          <label>Charge Threshold (A)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.charge_threshold_a ?? 0.5}
            .configValue=${"charge_threshold_a"}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Current threshold for charging animation (default: 0.5A)</div>
        </div>

        <div class="option">
          <label>Discharge Threshold (A)</label>
          <ha-textfield
            type="number"
            step="0.1"
            .value=${this._config.discharge_threshold_a ?? 0.5}
            .configValue=${"discharge_threshold_a"}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Current threshold for discharging animation (default: 0.5A)</div>
        </div>

        <div class="section-title">Display Options</div>

        <div class="option">
          <ha-switch
            .checked=${this._config.show_overlay !== false}
            .configValue=${"show_overlay"}
            @change=${this._toggleChanged}
          >
            <span slot="label">Show Balancing Overlay</span>
          </ha-switch>
          <div class="description">Display SVG overlay with balancing animations</div>
        </div>

        <div class="option">
          <ha-switch
            .checked=${this._config.show_cell_labels !== false}
            .configValue=${"show_cell_labels"}
            @change=${this._toggleChanged}
          >
            <span slot="label">Show Cell Labels</span>
          </ha-switch>
          <div class="description">Display cell numbers on each cell</div>
        </div>
      </div>
    `;
  }
  _renderCellsPrefix() {
    return b`
      <div class="option">
        <label>Cell Entity Prefix</label>
        <ha-textfield
          .value=${this._config.cells_prefix || ""}
          .configValue=${"cells_prefix"}
          @input=${this._valueChanged}
          placeholder="sensor.jk_bms_cell_"
        ></ha-textfield>
        <div class="description">Prefix for cell entities (e.g., sensor.jk_bms_cell_)</div>
      </div>

      <div class="option">
        <label>Number of Cells</label>
        <ha-textfield
          type="number"
          .value=${this._config.cells_count || 16}
          .configValue=${"cells_count"}
          @input=${this._valueChanged}
          min="1"
          max="32"
        ></ha-textfield>
        <div class="description">Total number of cells (default: 16)</div>
      </div>
    `;
  }
  _renderCellsArray() {
    const cells = this._config.cells || [];
    return b`
      <div class="option">
        <label>Cell Entities</label>
        <div class="cells-list">
          ${cells.map((cell, index) => b`
            <div class="cell-input">
              <span style="min-width: 60px;">Cell ${index + 1}:</span>
              <ha-entity-picker
                .hass=${this.hass}
                .value=${cell}
                .index=${index}
                @value-changed=${this._cellChanged}
                allow-custom-entity
              ></ha-entity-picker>
              <mwc-icon-button
                @click=${() => this._removeCell(index)}
              >
                <ha-icon icon="mdi:delete"></ha-icon>
              </mwc-icon-button>
            </div>
          `)}
        </div>
        <mwc-button
          class="add-cell-btn"
          @click=${this._addCell}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Cell
        </mwc-button>
      </div>
    `;
  }
  _setCellsMode(mode) {
    const newConfig = { ...this._config };
    if (mode === "array") {
      const count = newConfig.cells_count || 16;
      const prefix = newConfig.cells_prefix || "sensor.jk_bms_cell_";
      newConfig.cells = Array.from({ length: count }, (_2, i2) => `${prefix}${i2 + 1}`);
      delete newConfig.cells_prefix;
      delete newConfig.cells_count;
    } else {
      const cellCount = Array.isArray(newConfig.cells) ? newConfig.cells.length : 16;
      newConfig.cells_prefix = "sensor.jk_bms_cell_";
      newConfig.cells_count = cellCount;
      delete newConfig.cells;
    }
    this._config = newConfig;
    this._configChanged();
  }
  _addCell() {
    const cells = [...this._config.cells || []];
    cells.push("");
    this._config = { ...this._config, cells };
    this._configChanged();
  }
  _removeCell(index) {
    const cells = [...this._config.cells || []];
    cells.splice(index, 1);
    this._config = { ...this._config, cells };
    this._configChanged();
  }
  _cellChanged(ev) {
    const target = ev.target;
    const index = target.index;
    const value = ev.detail.value;
    const cells = [...this._config.cells || []];
    cells[index] = value;
    this._config = { ...this._config, cells };
    this._configChanged();
  }
  _valueChanged(ev) {
    const target = ev.target;
    const configValue = target.configValue;
    let value = target.value;
    if (ev.detail && ev.detail.value !== void 0) {
      value = ev.detail.value;
    }
    if (target.type === "number") {
      value = value === "" ? void 0 : Number(value);
    }
    if (!configValue) return;
    this._config = {
      ...this._config,
      [configValue]: value
    };
    this._configChanged();
  }
  _toggleChanged(ev) {
    const target = ev.target;
    const configValue = target.configValue;
    const checked = target.checked;
    if (!configValue) return;
    this._config = {
      ...this._config,
      [configValue]: checked
    };
    this._configChanged();
  }
  _configChanged() {
    const event = new CustomEvent("config-changed", {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}
__decorateClass([
  n2({ attribute: false })
], JkBmsReactorCardEditor.prototype, "hass");
__decorateClass([
  r()
], JkBmsReactorCardEditor.prototype, "_config");
customElements.define("jk-bms-reactor-card", JkBmsReactorCard);
customElements.define("jk-bms-reactor-card-editor", JkBmsReactorCardEditor);
console.info(
  "%c JK-BMS-REACTOR-CARD %c v1.0.0 ",
  "color: white; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: white; font-weight: 700;"
);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "jk-bms-reactor-card",
  name: "JK BMS Reactor Card",
  description: "A reactor-style visualization card for JK BMS battery packs",
  preview: false
});
