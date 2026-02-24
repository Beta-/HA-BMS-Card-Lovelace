/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
var _a;
const t$1 = globalThis, e$2 = t$1.ShadowRoot && (void 0 === t$1.ShadyCSS || t$1.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, s$3 = Symbol(), o$5 = /* @__PURE__ */ new WeakMap();
let n$4 = class n {
  constructor(t2, e2, o2) {
    if (this._$cssResult$ = true, o2 !== s$3) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t2, this.t = e2;
  }
  get styleSheet() {
    let t2 = this.o;
    const s2 = this.t;
    if (e$2 && void 0 === t2) {
      const e2 = void 0 !== s2 && 1 === s2.length;
      e2 && (t2 = o$5.get(s2)), void 0 === t2 && ((this.o = t2 = new CSSStyleSheet()).replaceSync(this.cssText), e2 && o$5.set(s2, t2));
    }
    return t2;
  }
  toString() {
    return this.cssText;
  }
};
const r$4 = (t2) => new n$4("string" == typeof t2 ? t2 : t2 + "", void 0, s$3), i$3 = (t2, ...e2) => {
  const o2 = 1 === t2.length ? t2[0] : e2.reduce((e3, s2, o3) => e3 + ((t3) => {
    if (true === t3._$cssResult$) return t3.cssText;
    if ("number" == typeof t3) return t3;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t3 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s2) + t2[o3 + 1], t2[0]);
  return new n$4(o2, t2, s$3);
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
const { is: i$2, defineProperty: e$1, getOwnPropertyDescriptor: h$1, getOwnPropertyNames: r$3, getOwnPropertySymbols: o$4, getPrototypeOf: n$3 } = Object, a$2 = globalThis, c$1 = a$2.trustedTypes, l$2 = c$1 ? c$1.emptyScript : "", p$1 = a$2.reactiveElementPolyfillSupport, d$1 = (t2, s2) => t2, u$2 = { toAttribute(t2, s2) {
  switch (s2) {
    case Boolean:
      t2 = t2 ? l$2 : null;
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
} }, f$1 = (t2, s2) => !i$2(t2, s2), b$1 = { attribute: true, type: String, converter: u$2, reflect: false, useDefault: false, hasChanged: f$1 };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a$2.litPropertyMetadata ?? (a$2.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
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
    const t2 = n$3(this);
    t2.finalize(), void 0 !== t2.l && (this.l = [...t2.l]), this.elementProperties = new Map(t2.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d$1("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d$1("properties"))) {
      const t3 = this.properties, s2 = [...r$3(t3), ...o$4(t3)];
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
      const h2 = (void 0 !== ((_a2 = i2.converter) == null ? void 0 : _a2.toAttribute) ? i2.converter : u$2).toAttribute(s2, i2.type);
      this._$Em = t2, null == h2 ? this.removeAttribute(e2) : this.setAttribute(e2, h2), this._$Em = null;
    }
  }
  _$AK(t2, s2) {
    var _a2, _b;
    const i2 = this.constructor, e2 = i2._$Eh.get(t2);
    if (void 0 !== e2 && this._$Em !== e2) {
      const t3 = i2.getPropertyOptions(e2), h2 = "function" == typeof t3.converter ? { fromAttribute: t3.converter } : void 0 !== ((_a2 = t3.converter) == null ? void 0 : _a2.fromAttribute) ? t3.converter : u$2;
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
y$1.elementStyles = [], y$1.shadowRootOptions = { mode: "open" }, y$1[d$1("elementProperties")] = /* @__PURE__ */ new Map(), y$1[d$1("finalized")] = /* @__PURE__ */ new Map(), p$1 == null ? void 0 : p$1({ ReactiveElement: y$1 }), (a$2.reactiveElementVersions ?? (a$2.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t = globalThis, i$1 = (t2) => t2, s$2 = t.trustedTypes, e = s$2 ? s$2.createPolicy("lit-html", { createHTML: (t2) => t2 }) : void 0, h = "$lit$", o$3 = `lit$${Math.random().toFixed(9).slice(2)}$`, n$2 = "?" + o$3, r$2 = `<${n$2}>`, l$1 = document, c = () => l$1.createComment(""), a$1 = (t2) => null === t2 || "object" != typeof t2 && "function" != typeof t2, u$1 = Array.isArray, d = (t2) => u$1(t2) || "function" == typeof (t2 == null ? void 0 : t2[Symbol.iterator]), f = "[ 	\n\f\r]", v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, _ = /-->/g, m = />/g, p = RegExp(`>|${f}(?:([^\\s"'>=/]+)(${f}*=${f}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), g = /'/g, $ = /"/g, y2 = /^(?:script|style|textarea|title)$/i, x = (t2) => (i2, ...s2) => ({ _$litType$: t2, strings: i2, values: s2 }), b = x(1), w = x(2), E = Symbol.for("lit-noChange"), A = Symbol.for("lit-nothing"), C = /* @__PURE__ */ new WeakMap(), P = l$1.createTreeWalker(l$1, 129);
function V(t2, i2) {
  if (!u$1(t2) || !t2.hasOwnProperty("raw")) throw Error("invalid template strings array");
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
    l2 += c2 === v ? s3 + r$2 : d2 >= 0 ? (e2.push(a2), s3.slice(0, d2) + h + s3.slice(d2) + o$3 + x2) : s3 + o$3 + (-2 === d2 ? i3 : x2);
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
          const i3 = v2[a2++], s2 = r2.getAttribute(t3).split(o$3), e3 = /([.?@])?(.*)/.exec(i3);
          d2.push({ type: 1, index: l2, name: e3[2], strings: s2, ctor: "." === e3[1] ? I : "?" === e3[1] ? L : "@" === e3[1] ? z : H }), r2.removeAttribute(t3);
        } else t3.startsWith(o$3) && (d2.push({ type: 6, index: l2 }), r2.removeAttribute(t3));
        if (y2.test(r2.tagName)) {
          const t3 = r2.textContent.split(o$3), i3 = t3.length - 1;
          if (i3 > 0) {
            r2.textContent = s$2 ? s$2.emptyScript : "";
            for (let s2 = 0; s2 < i3; s2++) r2.append(t3[s2], c()), P.nextNode(), d2.push({ type: 2, index: ++l2 });
            r2.append(t3[i3], c());
          }
        }
      } else if (8 === r2.nodeType) if (r2.data === n$2) d2.push({ type: 2, index: l2 });
      else {
        let t3 = -1;
        for (; -1 !== (t3 = r2.data.indexOf(o$3, t3 + 1)); ) d2.push({ type: 7, index: l2 }), t3 += o$3.length - 1;
      }
      l2++;
    }
  }
  static createElement(t2, i2) {
    const s2 = l$1.createElement("template");
    return s2.innerHTML = t2, s2;
  }
}
function M(t2, i2, s2 = t2, e2) {
  var _a2, _b;
  if (i2 === E) return i2;
  let h2 = void 0 !== e2 ? (_a2 = s2._$Co) == null ? void 0 : _a2[e2] : s2._$Cl;
  const o2 = a$1(i2) ? void 0 : i2._$litDirective$;
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
    const { el: { content: i2 }, parts: s2 } = this._$AD, e2 = ((t2 == null ? void 0 : t2.creationScope) ?? l$1).importNode(i2, true);
    P.currentNode = e2;
    let h2 = P.nextNode(), o2 = 0, n3 = 0, r2 = s2[0];
    for (; void 0 !== r2; ) {
      if (o2 === r2.index) {
        let i3;
        2 === r2.type ? i3 = new k(h2, h2.nextSibling, this, t2) : 1 === r2.type ? i3 = new r2.ctor(h2, r2.name, r2.strings, this, t2) : 6 === r2.type && (i3 = new Z(h2, this, t2)), this._$AV.push(i3), r2 = s2[++n3];
      }
      o2 !== (r2 == null ? void 0 : r2.index) && (h2 = P.nextNode(), o2++);
    }
    return P.currentNode = l$1, e2;
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
    t2 = M(this, t2, i2), a$1(t2) ? t2 === A || null == t2 || "" === t2 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t2 !== this._$AH && t2 !== E && this._(t2) : void 0 !== t2._$litType$ ? this.$(t2) : void 0 !== t2.nodeType ? this.T(t2) : d(t2) ? this.k(t2) : this._(t2);
  }
  O(t2) {
    return this._$AA.parentNode.insertBefore(t2, this._$AB);
  }
  T(t2) {
    this._$AH !== t2 && (this._$AR(), this._$AH = this.O(t2));
  }
  _(t2) {
    this._$AH !== A && a$1(this._$AH) ? this._$AA.nextSibling.data = t2 : this.T(l$1.createTextNode(t2)), this._$AH = t2;
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
    u$1(this._$AH) || (this._$AH = [], this._$AR());
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
    if (void 0 === h2) t2 = M(this, t2, i2, 0), o2 = !a$1(t2) || t2 !== this._$AH && t2 !== E, o2 && (this._$AH = t2);
    else {
      const e3 = t2;
      let n3, r2;
      for (t2 = h2[0], n3 = 0; n3 < h2.length - 1; n3++) r2 = M(this, e3[s2 + n3], i2, n3), r2 === E && (r2 = this._$AH[n3]), o2 || (o2 = !a$1(r2) || r2 !== this._$AH[n3]), r2 === A ? t2 = A : t2 !== A && (t2 += (r2 ?? "") + h2[n3 + 1]), this._$AH[n3] = r2;
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
const s$1 = globalThis;
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
i._$litElement$ = true, i["finalized"] = true, (_a = s$1.litElementHydrateSupport) == null ? void 0 : _a.call(s$1, { LitElement: i });
const o$2 = s$1.litElementPolyfillSupport;
o$2 == null ? void 0 : o$2({ LitElement: i });
(s$1.litElementVersions ?? (s$1.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const o$1 = { attribute: true, type: String, converter: u$2, reflect: false, hasChanged: f$1 }, r$1 = (t2 = o$1, e2, r2) => {
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
function n$1(t2) {
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
  return n$1({ ...r2, state: true, attribute: false });
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
    return Array.from({ length: count }, (_2, i2) => `${config.cells_prefix}${String(i2 + 1).padStart(2, "0")}`);
  }
  return [];
}
function getCellVoltages(hass, config) {
  const entityIds = getCellEntityIds(config);
  return entityIds.map((id) => getNumericValue(hass, id) ?? 0);
}
function getBalancingCells(hass, config, cellVoltages, current, delta, balanceCurrent) {
  const balancingEntity = config.balancing;
  if (balancingEntity && !isEntityOn(hass, balancingEntity)) {
    return cellVoltages.map(() => ({ isBalancing: false, direction: null }));
  }
  const hasDirection = balanceCurrent !== null && balanceCurrent !== void 0 && Math.abs(balanceCurrent) >= 1e-3;
  const valid = cellVoltages.map((v2, i2) => ({ v: v2, i: i2 })).filter((x2) => x2.v > 0);
  if (valid.length < 2) {
    return cellVoltages.map(() => ({ isBalancing: false, direction: null }));
  }
  const min = valid.reduce((a2, b2) => b2.v < a2.v ? b2 : a2);
  const max = valid.reduce((a2, b2) => b2.v > a2.v ? b2 : a2);
  const voltageDelta = max.v - min.v;
  const threshold = config.balance_threshold_v ?? 0.01;
  if (voltageDelta < threshold) {
    return cellVoltages.map(() => ({ isBalancing: false, direction: null }));
  }
  const out = cellVoltages.map(() => ({ isBalancing: false, direction: null }));
  if (!hasDirection) {
    out[max.i] = { isBalancing: true, direction: null };
    return out;
  }
  if (balanceCurrent >= 0) {
    out[max.i] = { isBalancing: true, direction: "charging" };
    out[min.i] = { isBalancing: true, direction: "discharging" };
  } else {
    out[max.i] = { isBalancing: true, direction: "discharging" };
    out[min.i] = { isBalancing: true, direction: "charging" };
  }
  return out;
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
  const balanceCurrent = config.balancing_current ? getNumericValue(hass, config.balancing_current) : null;
  const balancingData = getBalancingCells(hass, config, cellVoltages, current, delta, balanceCurrent);
  const isBalancing = balancingData.some((b2) => b2.isBalancing);
  const cells = cellVoltages.map((voltage2, index) => ({
    index,
    voltage: voltage2,
    isBalancing: balancingData[index].isBalancing,
    balanceDirection: balancingData[index].direction
  }));
  const chargeThreshold = config.charge_threshold_a ?? 0.5;
  const dischargeThreshold = config.discharge_threshold_a ?? 0.5;
  const isCharging = current !== null && current > chargeThreshold;
  const isDischarging = current !== null && current < -dischargeThreshold;
  const mosTemp = config.mos_temp ? getNumericValue(hass, config.mos_temp) : null;
  const temps = (config.temp_sensors ?? []).map((entityId, index) => ({
    index,
    temp: entityId ? getNumericValue(hass, entityId) : null
  }));
  const capacityRemainingAh = config.capacity_remaining ? getNumericValue(hass, config.capacity_remaining) : null;
  return {
    voltage,
    current,
    soc,
    cells,
    delta,
    minCell,
    maxCell,
    isBalancing,
    balanceCurrent,
    isCharging,
    isDischarging,
    mosTemp,
    temps,
    capacityRemainingAh
  };
}
function formatNumber(value, decimals = 2) {
  if (value === null) return "—";
  return value.toFixed(decimals);
}
const styles = i$3`
  :host {
    --accent-color: #41cd52;
    --accent-color-dim: rgba(65, 205, 82, 0.2);
    --discharge-color: #3090c7;
    --discharge-color-dim: rgba(48, 144, 199, 0.2);
    --solar-color: #ffd30f;
    --balancing-color: #ff6333;
    --balance-charge-color: #ff6b6b;
    --balance-discharge-color: #339af0;
    --min-cell-color: #ff6b6b;
    --max-cell-color: #51cf66;
    --flow-in-glow: rgba(81, 207, 102, 0.22);
    --flow-in-border: rgba(81, 207, 102, 0.35);
    --flow-out-glow: rgba(51, 154, 240, 0.22);
    --flow-out-border: rgba(51, 154, 240, 0.35);
    --panel-bg: var(--secondary-background-color, rgba(255, 255, 255, 0.05));
    --panel-border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
  }

  ha-card {
    padding: 16px;
    background: var(--ha-card-background, var(--card-background-color));
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .card-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  /* Flow Section - Top area with charge/reactor/discharge */
  .flow-section {
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    align-items: center;
    gap: 16px;
    position: relative;
    min-height: 180px;
    margin-bottom: 16px;
  }

  .flow-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    z-index: 2;
  }

  .icon-circle {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid var(--secondary-text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--panel-bg);
    transition: all 0.3s ease;
  }

  .icon-circle.clickable {
    cursor: pointer;
  }

  .icon-circle.clickable:hover {
    transform: scale(1.1);
    border-color: var(--accent-color);
  }

  .icon-circle ha-icon {
    --mdc-icon-size: 32px;
    color: #666;
    transition: color 0.3s ease;
  }

  .icon-circle.active-charge {
    border-color: var(--solar-color);
    box-shadow: 0 0 20px var(--solar-color);
  }

  .icon-circle.active-charge ha-icon {
    color: var(--solar-color);
  }

  .icon-circle.active-discharge {
    border-color: var(--discharge-color);
    box-shadow: 0 0 20px var(--discharge-color);
  }

  .icon-circle.active-discharge ha-icon {
    color: var(--discharge-color);
  }

  .node-label {
    font-size: 0.9em;
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  .node-status {
    font-size: 0.85em;
  }

  .node-current {
    font-size: 0.9em;
    font-weight: bold;
    color: var(--accent-color);
    margin-top: 2px;
  }

  /* Reactor Ring Container with Progress */
  .reactor-ring-container {
    position: relative;
    width: 160px;
    height: 160px;
    margin: 0 auto;
  }

  .soc-progress {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .soc-segmented {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .soc-seg {
    stroke-width: 2.2;
    stroke-linecap: butt;
  }

  .soc-seg.inactive {
    stroke: rgba(255, 255, 255, 0.12);
  }

  .soc-seg.active {
    stroke: rgba(255, 255, 255, 0.85);
  }

  .soc-segmented.standby .soc-seg.active {
    stroke: rgba(255, 255, 255, 0.55);
    filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.18));
  }

  .soc-segmented.charging .soc-seg.active {
    stroke: var(--accent-color);
    filter: drop-shadow(0 0 3px var(--flow-in-glow));
  }

  .soc-segmented.discharging .soc-seg.active {
    stroke: var(--discharge-color);
    filter: drop-shadow(0 0 3px var(--flow-out-glow));
  }

  .soc-bg {
    fill: none;
    stroke: var(--panel-bg);
    stroke-width: 8;
  }

  .soc-fill {
    fill: none;
    stroke: var(--accent-color);
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dashoffset 0.5s ease, stroke 0.3s ease;
  }

  .soc-fill.balancing-active {
    stroke: var(--balancing-color);
  }

  .status-on {
    color: var(--accent-color);
    font-weight: bold;
  }

  .status-off {
    color: var(--disabled-text-color, #666);
  }

  /* Reactor Ring - Central SOC Display */
  .reactor-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 130px;
    height: 130px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: var(--card-background-color);
    transition: all 0.3s ease;
  }

  .soc-label {
    font-size: 0.9em;
    color: var(--secondary-text-color);
    margin-bottom: -4px;
  }

  .soc-value {
    font-size: 2.8em;
    font-weight: bold;
    color: var(--accent-color);
    line-height: 1;
  }

  .capacity-text {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  /* SVG Flow Lines */
  .flow-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
  }

  .flow-line {
    stroke-width: 3;
    transition: stroke 0.3s ease;
  }

  .flow-line.active-charge {
    stroke: var(--solar-color);
  }

  .flow-line.active-discharge {
    stroke: var(--discharge-color);
  }

  .flow-line.inactive {
    stroke: #444;
    opacity: 0.3;
  }

  /* Stats Grid */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .stat-panel {
    background: var(--panel-bg);
    border: var(--panel-border);
    border-radius: 10px;
    padding: 12px 8px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .stat-panel.flow-in {
    box-shadow: 0 0 18px var(--flow-in-glow);
    border-color: var(--flow-in-border);
  }

  .stat-panel.flow-out {
    box-shadow: 0 0 18px var(--flow-out-glow);
    border-color: var(--flow-out-border);
  }

  .stat-sparkline {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(65, 205, 82, 0.05) 0%, 
      rgba(65, 205, 82, 0.15) 50%,
      rgba(65, 205, 82, 0.05) 100%);
    opacity: 0.5;
    z-index: 0;
  }

  .stat-sparkline-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.55;
    z-index: 0;
  }

  .stat-sparkline-svg .sparkline {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
  }

  .stat-sparkline-svg .sparkline.voltage {
    stroke: rgba(255, 255, 255, 0.22);
  }

  .stat-panel.flow-in .stat-sparkline-svg .sparkline.current,
  .stat-panel.flow-in .stat-sparkline-svg .sparkline.power {
    stroke: var(--flow-in-border);
  }

  .stat-panel.flow-out .stat-sparkline-svg .sparkline.current,
  .stat-panel.flow-out .stat-sparkline-svg .sparkline.power {
    stroke: var(--flow-out-border);
  }

  .stat-panel:not(.flow-in):not(.flow-out) .stat-sparkline-svg .sparkline.current,
  .stat-panel:not(.flow-in):not(.flow-out) .stat-sparkline-svg .sparkline.power {
    stroke: rgba(255, 255, 255, 0.18);
  }

  .stat-sparkline-svg .sparkline.temp {
    stroke: rgba(255, 211, 15, 0.45);
  }

  .stat-label {
    font-size: 0.85em;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .stat-value {
    font-size: 1.3em;
    font-weight: bold;
    color: var(--primary-text-color);
    position: relative;
    z-index: 1;
  }

  .delta-minmax-panel {
    padding: 10px 8px;
    grid-column: span 2;
  }

  .temps-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    margin-top: -8px;
    margin-bottom: 16px;
  }

  .delta-minmax-container {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 8px;
  }

  .delta-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    flex: 1;
    min-width: 0;
    position: relative;
    overflow: hidden;
  }

  .delta-sparkline-svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    opacity: 0.55;
    z-index: 0;
  }

  .delta-sparkline-svg .sparkline.delta {
    fill: none;
    stroke-width: 2;
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke: rgba(255, 255, 255, 0.22);
  }

  .delta-label {
    font-size: 0.75em;
    color: var(--secondary-text-color);
    font-weight: bold;
    position: relative;
    z-index: 1;
  }

  .delta-value {
    font-weight: bold;
    color: var(--primary-text-color);
    font-size: 1.1em;
    position: relative;
    z-index: 1;
  }

  .delta-divider {
    color: var(--secondary-text-color);
    opacity: 0.3;
    font-size: 1.2em;
    margin: 0 2px;
    display: flex;
    align-items: center;
  }

  .delta-right {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    width: 80px;
    flex: 0 0 auto;
  }

  .minmax-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    line-height: 1;
  }

  .minmax-icon {
    --mdc-icon-size: 14px;
    opacity: 0.85;
  }

  .max-value {
    font-weight: bold;
    color: var(--max-cell-color);
    font-size: 0.9em;
  }

  .minmax-divider {
    width: 100%;
    height: 1px;
    background: var(--divider-color);
    opacity: 0.6;
    margin: 2px 0;
  }

  .min-value {
    font-weight: bold;
    color: var(--min-cell-color);
    font-size: 0.9em;
  }

  .cell.balancing {
    border-color: var(--balancing-color);
    animation: cell-balance-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 15px var(--balancing-color);
    position: relative;
  }

  .cell.balancing::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 14px;
    border: 2px solid var(--balancing-color);
    opacity: 0.5;
    animation: balance-ring-pulse 2s ease-in-out infinite;
  }

  .cell.balancing::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 16px;
    border: 1px solid var(--balancing-color);
    opacity: 0.3;
    animation: balance-ring-pulse 2s ease-in-out infinite 0.5s;
  }

  /* Reactor Grid - Cell Display */
  .reactor-container {
    position: relative;
    width: 100%;
  }

  .reactor-grid {
    display: grid;
    grid-template-columns: 1fr var(--reactor-mid-gap, 28px) 1fr;
    column-gap: 0;
    row-gap: 10px;
    position: relative;
  }

  .cell-wrap {
    display: contents;
  }

  .cell-flow-column {
    grid-column: 2;
    position: relative;
    pointer-events: none;
    display: flex;
    align-items: stretch;
    justify-content: center;
  }

  .cell-flow-svg {
    width: 100%;
    height: 100%;
  }

  .cell-flow-path {
    fill: none;
    stroke: rgba(255, 255, 255, 0.18);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0;
  }

  .cell-flow-path.active {
    opacity: 1;
    stroke-dasharray: 6 8;
    stroke-width: 3;
  }

  .cell-flow-column.dir-down .cell-flow-path.active {
    animation: cell-flow-dash-down 1.1s linear infinite;
  }

  .cell-flow-column.dir-up .cell-flow-path.active {
    animation: cell-flow-dash-up 1.1s linear infinite;
  }

  .cell-flow-dot {
    opacity: 0.9;
    filter: drop-shadow(0 0 3px rgba(255, 255, 255, 0.25));
  }

  @keyframes cell-flow-dash-down {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: -28; }
  }

  @keyframes cell-flow-dash-up {
    from { stroke-dashoffset: 0; }
    to { stroke-dashoffset: 28; }
  }

  .reactor-grid.compact {
    row-gap: 6px;
  }

  .reactor-grid.compact .cell {
    aspect-ratio: auto;
    min-height: 28px;
    padding: 6px 8px;
    border-radius: 10px;
    flex-direction: row;
    justify-content: space-between;
  }

  .reactor-grid.compact .cell-compact-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    padding-right: 12px;
  }

  .reactor-grid.compact .cell-index {
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text-color);
  }

  .reactor-grid.compact .cell-compact-voltage {
    font-size: 13px;
    font-weight: 800;
    color: var(--primary-text-color);
  }

  .reactor-grid.compact .balancing-indicator {
    top: 50%;
    transform: translateY(-50%);
  }

  .cell {
    aspect-ratio: 1;
    background: var(--panel-bg);
    border: 2px solid var(--panel-border);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .cell.balancing-discharging {
    border-color: var(--balance-discharge-color);
    animation: cell-balance-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 15px var(--balance-discharge-color);
    position: relative;
  }

  .cell.balancing-discharging::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 14px;
    border: 2px solid var(--balance-discharge-color);
    opacity: 0.5;
    animation: balance-ring-pulse 2s ease-in-out infinite;
  }

  .cell.balancing-discharging::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 16px;
    border: 1px solid var(--balance-discharge-color);
    opacity: 0.3;
    animation: balance-ring-pulse 2s ease-in-out infinite 0.5s;
  }

  .cell.balancing-charging {
    border-color: var(--balance-charge-color);
    animation: cell-balance-pulse 2s ease-in-out infinite;
    box-shadow: 0 0 15px var(--balance-charge-color);
    position: relative;
  }

  .cell.balancing-charging::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 14px;
    border: 2px solid var(--balance-charge-color);
    opacity: 0.5;
    animation: balance-ring-pulse 2s ease-in-out infinite;
  }

  .cell.balancing-charging::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 16px;
    border: 1px solid var(--balance-charge-color);
    opacity: 0.3;
    animation: balance-ring-pulse 2s ease-in-out infinite 0.5s;
  }

  @keyframes balance-ring-pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 0.3;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.6;
    }
  }

  .balancing-indicator {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--balancing-color);
    animation: balancing-blink 1s ease-in-out infinite;
    box-shadow: 0 0 8px var(--balancing-color);
  }

  .balancing-discharging .balancing-indicator {
    background: var(--balance-discharge-color);
    box-shadow: 0 0 8px var(--balance-discharge-color);
  }

  .balancing-charging .balancing-indicator {
    background: var(--balance-charge-color);
    box-shadow: 0 0 8px var(--balance-charge-color);
  }

  @keyframes balancing-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  @keyframes cell-balance-pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 20px var(--balancing-color);
    }
  }

  .cell-label {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
    font-weight: 500;
  }

  .cell-voltage {
    font-size: 16px;
    font-weight: 700;
    color: var(--primary-text-color);
  }

  .cell-voltage-unit {
    font-size: 11px;
    margin-left: 2px;
    opacity: 0.8;
  }

  /* Cell voltage color coding */
  .cell.low-voltage {
    border-color: #ff9800;
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%);
  }

  .cell.low-voltage .cell-voltage {
    color: #ff9800;
  }

  .cell.high-voltage {
    border-color: #2196f3;
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%);
  }

  .cell.high-voltage .cell-voltage {
    color: #2196f3;
  }

  .cell.normal-voltage {
    border-color: var(--accent-color);
    background: linear-gradient(135deg, var(--accent-color-dim) 0%, rgba(65, 205, 82, 0.05) 100%);
  }

  .cell.normal-voltage .cell-voltage {
    color: var(--accent-color);
  }

  /* Status Bar */
  .status-bar {
    display: flex;
    gap: 8px;
    margin-top: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .status-badge {
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .status-badge.charging {
    background: rgba(255, 211, 15, 0.15);
    color: var(--solar-color);
    border: 1px solid var(--solar-color);
  }

  .status-badge.discharging {
    background: var(--discharge-color-dim);
    color: var(--discharge-color);
    border: 1px solid var(--discharge-color);
  }

  .status-badge.balancing {
    background: rgba(255, 99, 51, 0.15);
    color: var(--balancing-color);
    border: 1px solid var(--balancing-color);
  }

  .status-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
    animation: status-blink 1.5s ease-in-out infinite;
  }

  @keyframes status-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* Responsive design */
  @media (max-width: 600px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .stat-voltage { order: 1; }
    .stat-current { order: 2; }
    .stat-power { order: 3; }
    .stat-mos-temp { order: 4; }
    .stat-delta { order: 5; }

    .delta-minmax-panel {
      grid-column: 1 / -1;
    }

    .flow-section {
      grid-template-columns: 0.8fr 1.2fr 0.8fr;
      min-height: 150px;
    }

    .icon-circle {
      width: 50px;
      height: 50px;
    }

    .icon-circle ha-icon {
      --mdc-icon-size: 26px;
    }

    .reactor-ring-container {
      width: 130px;
      height: 130px;
    }

    .reactor-ring {
      width: 100px;
      height: 100px;
    }

    .soc-value {
      font-size: 2.2em;
    }

    .reactor-grid {
      gap: 6px;
    }

    .cell-voltage {
      font-size: 14px;
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
  constructor() {
    super(...arguments);
    this._uid = Math.random().toString(36).slice(2, 9);
    this._history = {
      voltage: [],
      current: [],
      power: [],
      delta: []
    };
    this._historyByEntity = {};
    this._lastSampleTs = 0;
    this._sampleIntervalMs = 2e3;
    this._historyMax = 60;
    this._historySeeded = false;
  }
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
      compact_cells: config.compact_cells ?? false,
      cell_columns: config.cell_columns ?? 2,
      balance_threshold_v: config.balance_threshold_v ?? 0.01,
      charge_threshold_a: config.charge_threshold_a ?? 0.5,
      discharge_threshold_a: config.discharge_threshold_a ?? 0.5,
      pack_voltage_min: config.pack_voltage_min,
      pack_voltage_max: config.pack_voltage_max,
      capacity_remaining: config.capacity_remaining,
      capacity_total_ah: config.capacity_total_ah,
      cell_order_mode: config.cell_order_mode ?? "linear"
    };
  }
  _sanitizeCssToken(value) {
    return value.replace(/[;\n\r]/g, "").trim();
  }
  _hexToRgba(hex, alpha) {
    const cleaned = hex.trim();
    const m2 = cleaned.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
    if (!m2) return null;
    let h2 = m2[1];
    if (h2.length === 3) {
      h2 = h2.split("").map((c2) => c2 + c2).join("");
    }
    const r2 = parseInt(h2.slice(0, 2), 16);
    const g2 = parseInt(h2.slice(2, 4), 16);
    const b2 = parseInt(h2.slice(4, 6), 16);
    return `rgba(${r2}, ${g2}, ${b2}, ${alpha})`;
  }
  _buildCardStyle() {
    const c2 = this._config;
    const cssVars = {
      "--cell-columns": c2.cell_columns ? String(Math.max(1, Math.min(2, c2.cell_columns))) : void 0,
      "--accent-color": c2.color_accent ? this._sanitizeCssToken(c2.color_accent) : void 0,
      "--solar-color": c2.color_charge ? this._sanitizeCssToken(c2.color_charge) : void 0,
      "--discharge-color": c2.color_discharge ? this._sanitizeCssToken(c2.color_discharge) : void 0,
      "--balance-charge-color": c2.color_balance_charge ? this._sanitizeCssToken(c2.color_balance_charge) : void 0,
      "--balance-discharge-color": c2.color_balance_discharge ? this._sanitizeCssToken(c2.color_balance_discharge) : void 0,
      "--min-cell-color": c2.color_min_cell ? this._sanitizeCssToken(c2.color_min_cell) : void 0,
      "--max-cell-color": c2.color_max_cell ? this._sanitizeCssToken(c2.color_max_cell) : void 0
    };
    const accent = c2.color_accent ? this._sanitizeCssToken(c2.color_accent) : "";
    const discharge = c2.color_discharge ? this._sanitizeCssToken(c2.color_discharge) : "";
    const flowInGlow = this._hexToRgba(accent, 0.22);
    const flowInBorder = this._hexToRgba(accent, 0.35);
    const flowOutGlow = this._hexToRgba(discharge, 0.22);
    const flowOutBorder = this._hexToRgba(discharge, 0.35);
    if (flowInGlow) cssVars["--flow-in-glow"] = flowInGlow;
    if (flowInBorder) cssVars["--flow-in-border"] = flowInBorder;
    if (flowOutGlow) cssVars["--flow-out-glow"] = flowOutGlow;
    if (flowOutBorder) cssVars["--flow-out-border"] = flowOutBorder;
    return Object.entries(cssVars).filter(([, v2]) => v2 !== void 0 && v2 !== "").map(([k2, v2]) => `${k2}: ${v2}`).join("; ");
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
  updated(changedProperties) {
    var _a2;
    super.updated(changedProperties);
    if (!changedProperties.has("hass")) return;
    if (!this.hass || !this._config) return;
    if (!this._historySeeded) {
      this._historySeeded = true;
      this._seedHistoryFromHa().catch(() => {
      });
    }
    const now = Date.now();
    if (now - this._lastSampleTs < this._sampleIntervalMs) return;
    this._lastSampleTs = now;
    const packState = computePackState(this.hass, this._config);
    const voltage = packState.voltage;
    const current = packState.current;
    const power = (voltage ?? 0) * (current ?? 0);
    const push = (key, value) => {
      if (value === null || value === void 0 || Number.isNaN(value)) return;
      const arr = this._history[key];
      arr.push(value);
      if (arr.length > this._historyMax) arr.splice(0, arr.length - this._historyMax);
    };
    push("voltage", voltage);
    push("current", current);
    push("power", power);
    push("delta", packState.delta);
    const pushEntity = (entityId, value) => {
      if (!entityId) return;
      if (value === null || value === void 0 || Number.isNaN(value)) return;
      const arr = this._historyByEntity[entityId] = this._historyByEntity[entityId] ?? [];
      arr.push(value);
      if (arr.length > this._historyMax) arr.splice(0, arr.length - this._historyMax);
    };
    pushEntity(this._config.mos_temp, packState.mosTemp ?? null);
    for (const entityId of this._config.temp_sensors ?? []) {
      if (!entityId) continue;
      const raw = ((_a2 = this.hass.states[entityId]) == null ? void 0 : _a2.state) ?? null;
      const n3 = raw === null ? NaN : Number(raw);
      pushEntity(entityId, Number.isFinite(n3) ? n3 : null);
    }
    this.requestUpdate();
  }
  _downsample(values, max) {
    if (values.length <= max) return values;
    const step = values.length / max;
    const out = [];
    for (let i2 = 0; i2 < max; i2++) {
      out.push(values[Math.floor(i2 * step)]);
    }
    return out;
  }
  async _seedHistoryFromHa() {
    var _a2, _b, _c;
    if (!((_a2 = this.hass) == null ? void 0 : _a2.callApi)) return;
    if (!((_b = this._config) == null ? void 0 : _b.pack_voltage) || !((_c = this._config) == null ? void 0 : _c.current)) return;
    const start = new Date(Date.now() - 2 * 60 * 60 * 1e3).toISOString();
    const entityIds = [
      this._config.pack_voltage,
      this._config.current,
      this._config.delta,
      this._config.mos_temp,
      ...this._config.temp_sensors ?? []
    ].filter(Boolean).join(",");
    const path = `history/period/${start}`;
    const result = await this.hass.callApi("GET", path, {
      filter_entity_id: entityIds,
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: true
    });
    if (!Array.isArray(result)) return;
    const extract = (s2) => {
      const raw = (s2 == null ? void 0 : s2.s) ?? (s2 == null ? void 0 : s2.state);
      const n22 = raw === void 0 || raw === null ? NaN : Number(raw);
      return Number.isFinite(n22) ? n22 : null;
    };
    const perEntity = {};
    for (const entityHistory of result) {
      if (!Array.isArray(entityHistory) || entityHistory.length === 0) continue;
      const first = entityHistory[0];
      const entityId = (first == null ? void 0 : first.entity_id) ?? (first == null ? void 0 : first.e);
      if (!entityId) continue;
      const vals = [];
      for (const st of entityHistory) {
        const v2 = extract(st);
        if (v2 !== null) vals.push(v2);
      }
      perEntity[entityId] = vals;
    }
    const vSeries = this._downsample(perEntity[this._config.pack_voltage] ?? [], this._historyMax);
    const cSeries = this._downsample(perEntity[this._config.current] ?? [], this._historyMax);
    const dSeries = this._config.delta ? this._downsample(perEntity[this._config.delta] ?? [], this._historyMax) : [];
    if (vSeries.length) this._history.voltage = vSeries;
    if (cSeries.length) this._history.current = cSeries;
    if (dSeries.length) this._history.delta = dSeries;
    const n3 = Math.min(this._history.voltage.length, this._history.current.length);
    if (n3 > 0) {
      const p2 = [];
      for (let i2 = 0; i2 < n3; i2++) {
        p2.push(this._history.voltage[i2] * this._history.current[i2]);
      }
      this._history.power = p2;
    }
    const seedEntity = (entityId) => {
      if (!entityId) return;
      const series = this._downsample(perEntity[entityId] ?? [], this._historyMax);
      if (series.length) this._historyByEntity[entityId] = series;
    };
    seedEntity(this._config.mos_temp);
    for (const t2 of this._config.temp_sensors ?? []) seedEntity(t2);
    this.requestUpdate();
  }
  _sparklinePoints(values, width = 100, height = 30, range) {
    if (!values.length) return "";
    const smooth = (arr, window2 = 3) => {
      if (arr.length < 3) return arr;
      const half = Math.floor(window2 / 2);
      return arr.map((_2, i2) => {
        let sum = 0;
        let count = 0;
        for (let j = i2 - half; j <= i2 + half; j++) {
          if (j < 0 || j >= arr.length) continue;
          sum += arr[j];
          count++;
        }
        return count ? sum / count : arr[i2];
      });
    };
    const percentileMinMax = (arr, lowP = 0.1, highP = 0.9) => {
      const sorted = [...arr].sort((a2, b2) => a2 - b2);
      const n3 = sorted.length;
      const lo = sorted[Math.max(0, Math.floor((n3 - 1) * lowP))];
      const hi = sorted[Math.max(0, Math.ceil((n3 - 1) * highP))];
      if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { min: 0, max: 1 };
      if (hi === lo) return { min: lo - 1, max: hi + 1 };
      const pad = (hi - lo) * 0.08;
      return { min: lo - pad, max: hi + pad };
    };
    const smoothed = smooth(values, 3);
    const hasFixedRange = (range == null ? void 0 : range.min) !== void 0 && (range == null ? void 0 : range.max) !== void 0 && Number.isFinite(range.min) && Number.isFinite(range.max) && range.max > range.min;
    const { min, max } = hasFixedRange ? { min: range.min, max: range.max } : percentileMinMax(smoothed, 0.1, 0.9);
    const span = max - min;
    const stepX = values.length > 1 ? width / (values.length - 1) : 0;
    return smoothed.map((v2, i2) => {
      const x2 = i2 * stepX;
      const clamped = Math.min(max, Math.max(min, v2));
      const t2 = span === 0 ? 0.5 : (clamped - min) / span;
      const y3 = height - t2 * height;
      return `${x2.toFixed(2)},${y3.toFixed(2)}`;
    }).join(" ");
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
    const cardStyle = this._buildCardStyle();
    const hasRequiredConfig = this._config.pack_voltage && this._config.current && this._config.soc;
    const hasCellsConfig = this._config.cells || this._config.cells_prefix && this._config.cells_count;
    if (!hasRequiredConfig || !hasCellsConfig) {
      return b`
                <ha-card style=${cardStyle}>
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
        <ha-card style=${cardStyle}>
                <div class="card-content">
                    ${this._renderPackInfo(packState)}
                    ${this._renderReactor(packState)}
                    ${this._renderStatusBar(packState)}
                </div>
            </ha-card>
        `;
  }
  _handleChargeClick() {
    if (this._config.charging_switch && this.hass) {
      this.hass.callService("switch", "toggle", {
        entity_id: this._config.charging_switch
      });
    }
  }
  _handleDischargeClick() {
    if (this._config.discharging_switch && this.hass) {
      this.hass.callService("switch", "toggle", {
        entity_id: this._config.discharging_switch
      });
    }
  }
  _renderPackInfo(packState) {
    const current = packState.current ?? 0;
    const voltage = packState.voltage ?? 0;
    const soc = packState.soc ?? 0;
    const isChargingFlow = packState.isCharging && current > 0;
    const isDischargingFlow = packState.isDischarging && current < 0;
    const power = Math.abs(voltage * current);
    const chargeCurrent = isChargingFlow ? Math.abs(current) : 0;
    const dischargeCurrent = isDischargingFlow ? Math.abs(current) : 0;
    const dotRadiusForPower = (watts) => {
      const scaled = 3 + Math.min(5, Math.log10(watts + 1) * 1.8);
      return Number(scaled.toFixed(2));
    };
    const chargeDotSize = isChargingFlow ? dotRadiusForPower(power) : 3;
    const dischargeDotSize = isDischargingFlow ? dotRadiusForPower(power) : 3;
    const segCount = 360;
    const activeSegs = Math.max(0, Math.min(segCount, Math.round(soc / 100 * segCount)));
    const socGlowClass = isChargingFlow ? "charging" : isDischargingFlow ? "discharging" : "standby";
    const capacityLeftAh = packState.capacityRemainingAh ?? null ?? (this._config.capacity_total_ah !== void 0 && this._config.capacity_total_ah !== null && Number.isFinite(this._config.capacity_total_ah) ? packState.soc !== null && packState.soc !== void 0 ? this._config.capacity_total_ah * (packState.soc / 100) : null : null);
    return b`
      <div class="flow-section">
        <!-- Charger Node -->
        <div class="flow-node">
          <div class="icon-circle ${isChargingFlow ? "active-charge" : ""} clickable"
               @click=${() => this._handleChargeClick()}>
            <ha-icon icon="mdi:power-plug-outline"></ha-icon>
          </div>
          <div class="node-label">Charge</div>
          <div class="node-status">
            <span class="${packState.isCharging ? "status-on" : "status-off"}">
              ${packState.isCharging ? "ON" : "OFF"}
            </span>
          </div>
          ${chargeCurrent > 0 ? b`
            <div class="node-current">${formatNumber(chargeCurrent, 1)} A</div>
          ` : ""}
        </div>

        <!-- Reactor Ring (SOC Progress) -->
        <div class="reactor-ring-container">
          <svg class="soc-segmented ${socGlowClass}" viewBox="0 0 120 120" aria-hidden="true">
            <g transform="translate(60 60)">
              ${Array.from({ length: segCount }, (_2, i2) => {
      const isActive = i2 < activeSegs;
      return w`
                  <line
                    class="soc-seg ${isActive ? "active" : "inactive"}"
                    x1="0" y1="-52" x2="0" y2="-58"
                    transform="rotate(${i2})"
                  ></line>
                `;
    })}
            </g>
          </svg>
          <div class="reactor-ring ${packState.isBalancing ? "balancing-active" : ""}">
            <div class="soc-label">SoC</div>
            <div class="soc-value">${formatNumber(soc, 0)}%</div>
            <div class="capacity-text">
              ${packState.isBalancing && packState.balanceCurrent !== null ? b`${formatNumber(packState.balanceCurrent, 2)} A` : capacityLeftAh !== null ? b`${formatNumber(capacityLeftAh, 1)} Ah` : b`${formatNumber(voltage, 1)}V`}
            </div>
          </div>
        </div>

        <!-- Load/Discharge Node -->
        <div class="flow-node">
          <div class="icon-circle ${isDischargingFlow ? "active-discharge" : ""} clickable"
               @click=${() => this._handleDischargeClick()}>
            <ha-icon icon="mdi:power-socket"></ha-icon>
          </div>
          <div class="node-label">Load</div>
          <div class="node-status">
            <span class="${packState.isDischarging ? "status-on" : "status-off"}">
              ${packState.isDischarging ? "ON" : "OFF"}
            </span>
          </div>
          ${dischargeCurrent > 0 ? b`
            <div class="node-current">${formatNumber(dischargeCurrent, 1)} A</div>
          ` : ""}
        </div>

        <!-- SVG Flow Lines with animated dots -->
        <svg class="flow-svg" viewBox="0 0 400 180" preserveAspectRatio="none">
          <!-- Charge line (left to center) -->
          <line x1="62.5" y1="90" x2="200" y2="90" 
                class="flow-line ${isChargingFlow ? "active-charge" : "inactive"}" />
          ${isChargingFlow ? w`
            <circle class="flow-dot dot-1" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 62.5,90 L 200,90" />
            </circle>
            <circle class="flow-dot dot-2" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 62.5,90 L 200,90" />
            </circle>
            <circle class="flow-dot dot-3" r="${chargeDotSize}" fill="var(--solar-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 62.5,90 L 200,90" />
            </circle>
          ` : ""}
          
          <!-- Discharge line (center to right) -->
          <line x1="200" y1="90" x2="337.5" y2="90" 
                class="flow-line ${isDischargingFlow ? "active-discharge" : "inactive"}" />
          ${isDischargingFlow ? w`
            <circle class="flow-dot dot-1" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 200,90 L 337.5,90" />
            </circle>
            <circle class="flow-dot dot-2" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="0.5s" path="M 200,90 L 337.5,90" />
            </circle>
            <circle class="flow-dot dot-3" r="${dischargeDotSize}" fill="var(--discharge-color)">
              <animateMotion dur="2s" repeatCount="indefinite" begin="1s" path="M 200,90 L 337.5,90" />
            </circle>
          ` : ""}
        </svg>
      </div>

      <!-- Stats Panels with sparklines -->
      <div class="stats-grid">
        <div class="stat-panel stat-voltage">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline voltage" points="${this._sparklinePoints(this._history.voltage, 100, 30, {
      min: this._config.pack_voltage_min,
      max: this._config.pack_voltage_max
    })}"></polyline>
          </svg>
          <div class="stat-label">Voltage</div>
          <div class="stat-value">${formatNumber(packState.voltage, 2)} V</div>
        </div>
        <div class="stat-panel stat-current ${current > 0.5 ? "flow-in" : current < -0.5 ? "flow-out" : ""}">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline current" points="${this._sparklinePoints(this._history.current)}"></polyline>
          </svg>
          <div class="stat-label">Current</div>
          <div class="stat-value">${formatNumber(packState.current, 2)} A</div>
        </div>
        <div class="stat-panel stat-power ${current > 0.5 ? "flow-in" : current < -0.5 ? "flow-out" : ""}">
          <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
            <polyline class="sparkline power" points="${this._sparklinePoints(this._history.power)}"></polyline>
          </svg>
          <div class="stat-label">Power</div>
          <div class="stat-value">${formatNumber(Math.abs((packState.voltage ?? 0) * (packState.current ?? 0)), 1)} W</div>
        </div>
        <div class="stat-panel stat-delta delta-minmax-panel">
          <div class="delta-minmax-container">
            <div class="delta-left">
              <svg class="delta-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
                <polyline class="sparkline delta" points="${this._sparklinePoints(this._history.delta)}"></polyline>
              </svg>
              <div class="delta-label">Delta</div>
              <div class="delta-value">${formatNumber(packState.delta, 3)}V</div>
            </div>
            <div class="delta-divider">|</div>
            <div class="delta-right">
              <div class="minmax-row max">
                <ha-icon class="minmax-icon" icon="mdi:arrow-up-bold"></ha-icon>
                <span class="max-value">${formatNumber(packState.maxCell, 3)}V</span>
              </div>
              <div class="minmax-divider"></div>
              <div class="minmax-row min">
                <ha-icon class="minmax-icon" icon="mdi:arrow-down-bold"></ha-icon>
                <span class="min-value">${formatNumber(packState.minCell, 3)}V</span>
              </div>
            </div>
          </div>
        </div>

        ${this._config.mos_temp ? b`
          <div class="stat-panel stat-mos-temp">
            <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
              <polyline class="sparkline temp" points="${this._sparklinePoints(this._historyByEntity[this._config.mos_temp] ?? [])}"></polyline>
            </svg>
            <div class="stat-label">MOS Temp</div>
            <div class="stat-value">${formatNumber(packState.mosTemp ?? null, 1)} °C</div>
          </div>
        ` : ""}
      </div>

      ${(this._config.temp_sensors ?? []).length ? b`
        <div class="temps-grid">
          ${(packState.temps ?? []).map((t2) => b`
            <div class="stat-panel">
              <svg class="stat-sparkline-svg" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
                <polyline class="sparkline temp" points="${this._sparklinePoints(this._historyByEntity[(this._config.temp_sensors ?? [])[t2.index]] ?? [])}"></polyline>
              </svg>
              <div class="stat-label">Temp ${t2.index + 1}</div>
              <div class="stat-value">${formatNumber(t2.temp ?? null, 1)} °C</div>
            </div>
          `)}
        </div>
      ` : ""}
    `;
  }
  _renderReactor(packState) {
    const showLabels = this._config.show_cell_labels !== false;
    const compact = this._config.compact_cells ?? false;
    const mode = this._config.cell_order_mode ?? "linear";
    const n3 = packState.cells.length;
    const half = Math.ceil(n3 / 2);
    const left = [];
    const right = [];
    if (mode === "bank") {
      for (let i2 = 0; i2 < Math.min(half, n3); i2++) {
        left.push({ cell: packState.cells[i2], originalIndex: i2 });
      }
      for (let i2 = half; i2 < n3; i2++) {
        right.push({ cell: packState.cells[i2], originalIndex: i2 });
      }
    } else {
      for (let i2 = 0; i2 < n3; i2++) {
        if (i2 % 2 === 0) left.push({ cell: packState.cells[i2], originalIndex: i2 });
        else right.push({ cell: packState.cells[i2], originalIndex: i2 });
      }
    }
    const rows = Math.max(left.length, right.length);
    const posForIndex = (idx) => {
      if (mode === "bank") {
        return idx < half ? { row: idx, side: 0 } : { row: idx - half, side: 1 };
      }
      return { row: Math.floor(idx / 2), side: idx % 2 };
    };
    const dischargingIndex = packState.cells.findIndex(
      (c2) => c2.isBalancing && c2.balanceDirection === "discharging"
    );
    const chargingIndex = packState.cells.findIndex(
      (c2) => c2.isBalancing && c2.balanceDirection === "charging"
    );
    const showConnector = packState.isBalancing && dischargingIndex >= 0 && chargingIndex >= 0;
    const startIndex = dischargingIndex;
    const endIndex = chargingIndex;
    const startPos = startIndex >= 0 ? posForIndex(startIndex) : { row: 0, side: 0 };
    const endPos = endIndex >= 0 ? posForIndex(endIndex) : { row: 0, side: 0 };
    const startRow = startPos.row;
    const endRow = endPos.row;
    const startSide = startPos.side;
    const endSide = endPos.side;
    const flowDirClass = showConnector ? startRow > endRow ? "dir-up" : "dir-down" : "";
    const step = 10;
    const y3 = (r2) => r2 * step + step / 2;
    const xL = 0;
    const xR = 100;
    const xM = 50;
    const xStart = startSide === 0 ? xL : xR;
    const xEnd = endSide === 0 ? xL : xR;
    const yStart = y3(startRow);
    const yEnd = y3(endRow);
    const cellTemplate = (cell, originalIndex) => {
      const cellClass = this._getCellVoltageClass(cell.voltage, packState.minCell, packState.maxCell);
      return b`
        <div class="cell ${cellClass} ${cell.isBalancing ? `balancing${cell.balanceDirection ? ` balancing-${cell.balanceDirection}` : ""}` : ""}">
          ${compact ? b`
            <div class="cell-compact-row">
              <span class="cell-index">${originalIndex + 1}:</span>
              <span class="cell-compact-voltage">${formatNumber(cell.voltage, 3)}V</span>
            </div>
          ` : b`
            ${showLabels ? b`<div class="cell-label">Cell ${originalIndex + 1}</div>` : ""}
            <div class="cell-voltage">
              ${formatNumber(cell.voltage, 3)}
              <span class="cell-voltage-unit">V</span>
            </div>
          `}
          ${cell.isBalancing ? b`<div class="balancing-indicator"></div>` : ""}
        </div>
      `;
    };
    const connectorPath = () => {
      if (!showConnector) return "";
      if (startRow === endRow) {
        return `M ${xStart} ${yStart} L ${xM} ${yStart} L ${xEnd} ${yEnd}`;
      }
      return `M ${xStart} ${yStart} L ${xM} ${yStart} L ${xM} ${yEnd} L ${xEnd} ${yEnd}`;
    };
    return b`
      <div class="reactor-container">
        <div class="reactor-grid ${compact ? "compact" : ""}">
          <div class="cell-flow-column ${showConnector ? "active" : ""} ${flowDirClass}" style="grid-row: 1 / span ${Math.max(1, rows)};">
            <svg class="cell-flow-svg" viewBox="0 0 100 ${Math.max(1, rows) * 10}" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient
                  id="cellFlowGrad-${this._uid}"
                  gradientUnits="userSpaceOnUse"
                  x1="${xStart}"
                  y1="${yStart}"
                  x2="${xEnd}"
                  y2="${yEnd}"
                >
                  <stop offset="0%" stop-color="var(--balance-discharge-color)"></stop>
                  <stop offset="100%" stop-color="var(--balance-charge-color)"></stop>
                </linearGradient>
              </defs>
              <path
                id="cellFlowPath-${this._uid}"
                class="cell-flow-path ${showConnector ? "active" : ""}"
                d="${connectorPath()}"
                stroke="url(#cellFlowGrad-${this._uid})"
              ></path>
              ${showConnector ? w`
                <circle class="cell-flow-dot" r="3.2" fill="url(#cellFlowGrad-${this._uid})">
                  <animateMotion dur="1.8s" repeatCount="indefinite" path="${connectorPath()}" />
                </circle>
              ` : ""}
            </svg>
          </div>

          ${Array.from({ length: rows }, (_2, r2) => {
      const l2 = left[r2];
      const rc = right[r2];
      return b`
              ${l2 ? b`<div class="cell-wrap" style="grid-column: 1; grid-row: ${r2 + 1};">${cellTemplate(l2.cell, l2.originalIndex)}</div>` : ""}
              ${rc ? b`<div class="cell-wrap" style="grid-column: 3; grid-row: ${r2 + 1};">${cellTemplate(rc.cell, rc.originalIndex)}</div>` : ""}
            `;
    })}
        </div>
      </div>
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
  n$1({ attribute: false })
], JkBmsReactorCard.prototype, "hass");
__decorateClass$1([
  r()
], JkBmsReactorCard.prototype, "_config");
/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const a = Symbol.for(""), o = (t2) => {
  if ((t2 == null ? void 0 : t2.r) === a) return t2 == null ? void 0 : t2._$litStatic$;
}, s = (t2) => ({ _$litStatic$: t2, r: a }), l = /* @__PURE__ */ new Map(), n2 = (t2) => (r2, ...e2) => {
  const a2 = e2.length;
  let s2, i2;
  const n3 = [], u2 = [];
  let c2, $2 = 0, f2 = false;
  for (; $2 < a2; ) {
    for (c2 = r2[$2]; $2 < a2 && void 0 !== (i2 = e2[$2], s2 = o(i2)); ) c2 += s2 + r2[++$2], f2 = true;
    $2 !== a2 && u2.push(i2), n3.push(c2), $2++;
  }
  if ($2 === a2 && n3.push(r2[a2]), f2) {
    const t3 = n3.join("$$lit$$");
    void 0 === (r2 = l.get(t3)) && (n3.raw = n3, l.set(t3, r2 = n3)), e2 = u2;
  }
  return t2(r2, ...e2);
}, u = n2(b);
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

      .cells-mode ha-button.active {
        background: var(--primary-color);
        color: var(--text-primary-color, white);
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

      .icon-btn {
        width: 36px;
        height: 36px;
        border-radius: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--secondary-text-color);
      }

      .icon-btn:hover {
        background: rgba(255, 255, 255, 0.06);
        color: var(--primary-text-color);
      }

      .radio-group {
        display: flex;
        gap: 14px;
        align-items: center;
        flex-wrap: wrap;
      }

      .radio {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        user-select: none;
        color: var(--primary-text-color);
        font-size: 14px;
      }

      .radio input {
        width: 16px;
        height: 16px;
        accent-color: var(--primary-color);
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
      show_cell_labels: config.show_cell_labels ?? true,
      cell_columns: config.cell_columns ?? 2,
      cell_order_mode: config.cell_order_mode ?? "linear",
      pack_voltage_min: config.pack_voltage_min,
      pack_voltage_max: config.pack_voltage_max,
      capacity_remaining: config.capacity_remaining ?? "",
      capacity_total_ah: config.capacity_total_ah
    };
  }
  _entityPickerTag() {
    if (customElements.get("ha-entity-picker")) return "ha-entity-picker";
    if (customElements.get("hui-entity-picker")) return "hui-entity-picker";
    return null;
  }
  _renderEntityPicker(options) {
    const tag = this._entityPickerTag();
    if (!tag) {
      return b`
        <ha-textfield
          .value=${options.value}
          .configValue=${options.configValue ?? ""}
          @input=${options.onChanged}
        ></ha-textfield>
      `;
    }
    return u`
      <${s(tag)}
        .hass=${this.hass}
        .value=${options.value}
        .configValue=${options.configValue ?? void 0}
        .index=${options.index ?? void 0}
        .includeDomains=${options.includeDomains ?? void 0}
        .allowCustomEntity=${true}
        allow-custom-entity
        @value-changed=${options.onChanged}
      ></${s(tag)}>
    `;
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
          ${this._renderEntityPicker({
      value: this._config.pack_voltage || "",
      configValue: "pack_voltage",
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._valueChanged
    })}
          <div class="description">Entity for total pack voltage</div>
        </div>

        <div class="option">
          <label>Current Entity</label>
          ${this._renderEntityPicker({
      value: this._config.current || "",
      configValue: "current",
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._valueChanged
    })}
          <div class="description">Entity for pack current (positive = charging)</div>
        </div>

        <div class="option">
          <label>State of Charge (SOC) Entity</label>
          ${this._renderEntityPicker({
      value: this._config.soc || "",
      configValue: "soc",
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._valueChanged
    })}
          <div class="description">Entity for battery state of charge (%)</div>
        </div>

        <div class="section-title">Cell Configuration</div>
        
        <div class="cells-mode">
          <ha-button
            class=${useCellsArray ? "active" : ""}
            @click=${() => this._setCellsMode("array")}
          >
            Individual Cells
          </ha-button>
          <ha-button
            class=${!useCellsArray ? "active" : ""}
            @click=${() => this._setCellsMode("prefix")}
          >
            Prefix + Count
          </ha-button>
        </div>

        ${useCellsArray ? this._renderCellsArray() : this._renderCellsPrefix()}

        <div class="option">
          <label>Cell Order Mode</label>
          <div class="radio-group">
            <label class="radio">
              <input
                type="radio"
                name="cell_order_mode"
                .checked=${(this._config.cell_order_mode ?? "linear") === "linear"}
                .value=${"linear"}
                .configValue=${"cell_order_mode"}
                @change=${this._valueChanged}
              />
              Linear (1–2 / 3–4)
            </label>
            <label class="radio">
              <input
                type="radio"
                name="cell_order_mode"
                .checked=${(this._config.cell_order_mode ?? "linear") === "bank"}
                .value=${"bank"}
                .configValue=${"cell_order_mode"}
                @change=${this._valueChanged}
              />
              Bank (1–9 / 2–10)
            </label>
          </div>
          <div class="description">Controls how cells are arranged in the 2-column grid</div>
        </div>

        <div class="section-title">Optional Settings</div>

        <div class="option">
          <label>Balancing Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.balancing || "",
      configValue: "balancing",
      includeDomains: ["binary_sensor", "sensor", "input_boolean", "switch"],
      onChanged: this._valueChanged
    })}
          <div class="description">Binary sensor for balancing status</div>
        </div>

        <div class="option">
          <label>Balancing Current Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.balancing_current || "",
      configValue: "balancing_current",
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._valueChanged
    })}
          <div class="description">Entity for balancing current (displayed in reactor ring)</div>
        </div>

        <div class="option">
          <label>Charging Switch (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.charging_switch || "",
      configValue: "charging_switch",
      includeDomains: ["switch", "input_boolean"],
      onChanged: this._valueChanged
    })}
          <div class="description">Switch entity to control charging (clickable charge icon)</div>
        </div>

        <div class="option">
          <label>Discharging Switch (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.discharging_switch || "",
      configValue: "discharging_switch",
      includeDomains: ["switch", "input_boolean"],
      onChanged: this._valueChanged
    })}
          <div class="description">Switch entity to control discharging (clickable discharge icon)</div>
        </div>

        <div class="option">
          <label>Delta Voltage Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.delta || "",
      configValue: "delta",
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._valueChanged
    })}
          <div class="description">Entity for cell voltage delta (auto-calculated if not provided)</div>
        </div>

        <div class="option">
          <label>MOS Temperature Entity (Optional)</label>
          ${this._renderEntityPicker({
      value: this._config.mos_temp || "",
      configValue: "mos_temp",
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._valueChanged
    })}
          <div class="description">Entity for MOSFET temperature</div>
        </div>

        <div class="option">
          <label>Temperature Sensors (Optional)</label>
          <div class="cells-list">
            ${(this._config.temp_sensors || []).map((temp, index) => b`
              <div class="cell-input">
                <span style="min-width: 70px;">Temp ${index + 1}:</span>
                ${this._renderEntityPicker({
      value: temp,
      index,
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._tempSensorChanged
    })}
                <div class="icon-btn" @click=${() => this._removeTempSensor(index)}>
                  <ha-icon icon="mdi:delete"></ha-icon>
                </div>
              </div>
            `)}
          </div>
                  <div class="section-title">Graphs</div>

                  <div class="option">
                    <label>Pack Voltage Min (V)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.pack_voltage_min ?? ""}
                      .configValue=${"pack_voltage_min"}
                      @input=${this._valueChanged}
                      placeholder="e.g. 44.0"
                    ></ha-textfield>
                    <div class="description">Optional: clamp voltage sparkline lower bound</div>
                  </div>

                  <div class="option">
                    <label>Pack Voltage Max (V)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.pack_voltage_max ?? ""}
                      .configValue=${"pack_voltage_max"}
                      @input=${this._valueChanged}
                      placeholder="e.g. 57.6"
                    ></ha-textfield>
                    <div class="description">Optional: clamp voltage sparkline upper bound</div>
                  </div>

                  <div class="section-title">Capacity (Optional)</div>

                  <div class="option">
                    <label>Capacity Remaining Entity (Ah)</label>
                    ${this._renderEntityPicker({
      value: this._config.capacity_remaining || "",
      configValue: "capacity_remaining",
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._valueChanged
    })}
                    <div class="description">If set, shows remaining capacity under SOC</div>
                  </div>

                  <div class="option">
                    <label>Total Capacity (Ah)</label>
                    <ha-textfield
                      type="number"
                      step="0.1"
                      .value=${this._config.capacity_total_ah ?? ""}
                      .configValue=${"capacity_total_ah"}
                      @input=${this._valueChanged}
                      placeholder="e.g. 280"
                    ></ha-textfield>
                    <div class="description">Used to compute remaining Ah from SOC when no entity is provided</div>
                  </div>
          <ha-button class="add-cell-btn" @click=${this._addTempSensor}>
            <ha-icon icon="mdi:plus"></ha-icon>
            Add Temp Sensor
          </ha-button>
          <div class="description">Add any number of temperature sensor entities</div>
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

        <div class="option">
          <ha-switch
            .checked=${this._config.compact_cells ?? false}
            .configValue=${"compact_cells"}
            @change=${this._toggleChanged}
          >
            <span slot="label">Compact Cells</span>
          </ha-switch>
          <div class="description">Use smaller cell display to save space</div>
        </div>

        <div class="option">
          <label>Cell Voltage Columns</label>
          <ha-textfield
            type="number"
            min="1"
            max="2"
            step="1"
            .value=${this._config.cell_columns ?? 4}
            .configValue=${"cell_columns"}
            @input=${this._valueChanged}
          ></ha-textfield>
          <div class="description">Fixed two-column layout (max: 2)</div>
        </div>

        <div class="section-title">Colors (Optional)</div>

        <div class="option">
          <label>Accent / Charging Color</label>
          <ha-textfield
            .value=${this._config.color_accent || ""}
            .configValue=${"color_accent"}
            @input=${this._valueChanged}
            placeholder="#41cd52"
          ></ha-textfield>
          <div class="description">Used for charging glow + SOC segments</div>
        </div>

        <div class="option">
          <label>Charge Line/Dots Color</label>
          <ha-textfield
            .value=${this._config.color_charge || ""}
            .configValue=${"color_charge"}
            @input=${this._valueChanged}
            placeholder="#ffd30f"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Discharge Color</label>
          <ha-textfield
            .value=${this._config.color_discharge || ""}
            .configValue=${"color_discharge"}
            @input=${this._valueChanged}
            placeholder="#3090c7"
          ></ha-textfield>
          <div class="description">Used for discharge glow + SOC segments</div>
        </div>

        <div class="option">
          <label>Balance Charge Color (Cell Charging)</label>
          <ha-textfield
            .value=${this._config.color_balance_charge || ""}
            .configValue=${"color_balance_charge"}
            @input=${this._valueChanged}
            placeholder="#ff6b6b"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Balance Discharge Color (Cell Discharging)</label>
          <ha-textfield
            .value=${this._config.color_balance_discharge || ""}
            .configValue=${"color_balance_discharge"}
            @input=${this._valueChanged}
            placeholder="#339af0"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Min Cell Color</label>
          <ha-textfield
            .value=${this._config.color_min_cell || ""}
            .configValue=${"color_min_cell"}
            @input=${this._valueChanged}
            placeholder="#ff6b6b"
          ></ha-textfield>
        </div>

        <div class="option">
          <label>Max Cell Color</label>
          <ha-textfield
            .value=${this._config.color_max_cell || ""}
            .configValue=${"color_max_cell"}
            @input=${this._valueChanged}
            placeholder="#51cf66"
          ></ha-textfield>
        </div>
      </div>
    `;
  }
  _addTempSensor() {
    const temp_sensors = [...this._config.temp_sensors || []];
    temp_sensors.push("");
    this._config = { ...this._config, temp_sensors };
    this._configChanged();
  }
  _removeTempSensor(index) {
    const temp_sensors = [...this._config.temp_sensors || []];
    temp_sensors.splice(index, 1);
    this._config = { ...this._config, temp_sensors };
    this._configChanged();
  }
  _tempSensorChanged(ev) {
    var _a2;
    const target = ev.target;
    const index = target.index;
    const value = ((_a2 = ev.detail) == null ? void 0 : _a2.value) ?? target.value;
    const temp_sensors = [...this._config.temp_sensors || []];
    temp_sensors[index] = value;
    this._config = { ...this._config, temp_sensors };
    this._configChanged();
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
              ${this._renderEntityPicker({
      value: cell,
      index,
      includeDomains: ["sensor", "input_number", "number"],
      onChanged: this._cellChanged
    })}
              <div class="icon-btn" @click=${() => this._removeCell(index)}>
                <ha-icon icon="mdi:delete"></ha-icon>
              </div>
            </div>
          `)}
        </div>
        <ha-button
          class="add-cell-btn"
          @click=${this._addCell}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
          Add Cell
        </ha-button>
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
    var _a2;
    const target = ev.target;
    const index = target.index;
    const value = ((_a2 = ev.detail) == null ? void 0 : _a2.value) ?? target.value;
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
  n$1({ attribute: false })
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
  type: "custom:jk-bms-reactor-card",
  name: "JK BMS Reactor Card",
  description: "A reactor-style visualization card for JK BMS battery packs",
  preview: false
});
