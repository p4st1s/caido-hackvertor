import { createHash, createHmac, createCipheriv, createDecipheriv, randomUUID, randomBytes } from "crypto";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function strToBytes(s: string): Uint8Array {
  return Buffer.from(s, "utf8");
}

function bytesToStr(b: Uint8Array): string {
  return Buffer.from(b).toString("utf8");
}

// ─── Base Encodings ───────────────────────────────────────────────────────────

export function base64(input: string): string {
  return btoa(unescape(encodeURIComponent(input)));
}

export function d_base64(input: string): string {
  try { return decodeURIComponent(escape(atob(input.trim()))); }
  catch { return atob(input.trim()); }
}

export function base64url(input: string): string {
  return base64(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function d_base64url(input: string): string {
  const pad = input.length % 4;
  return d_base64((input + (pad ? "=".repeat(4 - pad) : "")).replace(/-/g, "+").replace(/_/g, "/"));
}

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32(input: string): string {
  const bytes = strToBytes(input);
  let bits = 0, value = 0, output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte; bits += 8;
    while (bits >= 5) { bits -= 5; output += BASE32_CHARS[(value >>> bits) & 31]; }
  }
  if (bits > 0) output += BASE32_CHARS[(value << (5 - bits)) & 31];
  while (output.length % 8 !== 0) output += "=";
  return output;
}

export function d_base32(input: string): string {
  input = input.toUpperCase().replace(/=+$/, "");
  let bits = 0, value = 0;
  const bytes: number[] = [];
  for (const c of input) {
    const idx = BASE32_CHARS.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx; bits += 5;
    if (bits >= 8) { bits -= 8; bytes.push((value >>> bits) & 0xff); }
  }
  return bytesToStr(new Uint8Array(bytes));
}

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58(input: string): string {
  const bytes = Array.from(strToBytes(input));
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8; digits[j] = carry % 58; carry = Math.floor(carry / 58);
    }
    while (carry > 0) { digits.push(carry % 58); carry = Math.floor(carry / 58); }
  }
  let result = "";
  for (let i = bytes.findIndex(b => b !== 0); i < bytes.length; i++) {
    if (bytes[i] !== 0) break;
    result += BASE58[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) result += BASE58[digits[i]];
  return result;
}

export function d_base58(input: string): string {
  const bytes: number[] = [0];
  for (const c of input) {
    const idx = BASE58.indexOf(c);
    if (idx === -1) throw new Error(`Invalid base58 char: ${c}`);
    let carry = idx;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58; bytes[j] = carry & 0xff; carry >>= 8;
    }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  const result: number[] = [];
  for (let i = 0; i < input.length && input[i] === BASE58[0]; i++) result.push(0);
  for (let i = bytes.length - 1; i >= 0; i--) result.push(bytes[i]);
  return bytesToStr(new Uint8Array(result));
}

// ─── Hex / Escapes ────────────────────────────────────────────────────────────

export function hex(input: string, sep = " "): string {
  return Array.from(strToBytes(input)).map(b => b.toString(16).padStart(2, "0")).join(sep);
}

export function hex_entities(input: string): string {
  return Array.from(input).map(c => `&#x${c.codePointAt(0)!.toString(16)};`).join("");
}

export function hex_escapes(input: string): string {
  return Array.from(strToBytes(input)).map(b => `\\x${b.toString(16).padStart(2, "0")}`).join("");
}

export function dec_entities(input: string): string {
  return Array.from(input).map(c => `&#${c.codePointAt(0)!};`).join("");
}

export function octal_escapes(input: string): string {
  return Array.from(strToBytes(input)).map(b => `\\${b.toString(8).padStart(3, "0")}`).join("");
}

export function d_octal_escapes(input: string): string {
  return input.replace(/\\([0-7]{1,3})/g, (_, o) => String.fromCharCode(parseInt(o, 8)));
}

export function unicode_escapes(input: string): string {
  return Array.from(input).map(c => `\\u${c.codePointAt(0)!.toString(16).padStart(4, "0")}`).join("");
}

export function css_escapes(input: string): string {
  return Array.from(strToBytes(input)).map(b => `\\${b.toString(16)} `).join("");
}

export function css_escapes6(input: string): string {
  return Array.from(strToBytes(input)).map(b => `\\${b.toString(16).padStart(6, "0")}`).join("");
}

export function d_css_escapes(input: string): string {
  return input.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, h) => String.fromCodePoint(parseInt(h, 16)));
}

// ─── HTML ─────────────────────────────────────────────────────────────────────

const HTML_MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" };

export function html_entities(input: string): string {
  return input.replace(/[&<>"']/g, c => HTML_MAP[c] || c);
}

export function html5_entities(input: string): string {
  return Array.from(input).map(c => {
    const cp = c.codePointAt(0)!;
    if (cp > 127 || HTML_MAP[c]) return `&#x${cp.toString(16)};`;
    return c;
  }).join("");
}

export function d_html_entities(input: string): string {
  return input
    .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"').replace(/&#x27;/gi, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

// ─── URL ──────────────────────────────────────────────────────────────────────

export function urlencode(input: string): string {
  return encodeURIComponent(input).replace(/%20/g, "+");
}

export function urlencode_not_plus(input: string): string {
  return encodeURIComponent(input);
}

export function urlencode_all(input: string): string {
  return Array.from(strToBytes(input)).map(b => `%${b.toString(16).padStart(2, "0")}`).join("");
}

export function burp_urlencode(input: string): string {
  return encodeURIComponent(input).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

export function d_url(input: string): string {
  return decodeURIComponent(input.replace(/\+/g, " "));
}

export function d_burp_url(input: string): string {
  return decodeURIComponent(input);
}

// ─── String encodings ─────────────────────────────────────────────────────────

export function js_string(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    .replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}

export function decode_js_string(input: string): string {
  return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t")
    .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
}

export function powershell(input: string): string {
  const bytes = strToBytes(input);
  const utf16: number[] = [];
  for (const b of bytes) { utf16.push(b, 0); }
  return btoa(String.fromCharCode(...utf16));
}

export function quoted_printable(input: string): string {
  return Array.from(strToBytes(input)).map(b => {
    if (b === 0x0a) return "\n";
    if (b === 0x0d) return "\r";
    if (b >= 33 && b <= 126 && b !== 61) return String.fromCharCode(b);
    return `=${b.toString(16).toUpperCase().padStart(2, "0")}`;
  }).join("");
}

export function d_quoted_printable(input: string): string {
  return input.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

export function php_chr(input: string): string {
  return Array.from(strToBytes(input)).map(b => `chr(${b})`).join(".");
}

export function sql_hex(input: string): string {
  return "0x" + Array.from(strToBytes(input)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export function saml(input: string): string {
  const bytes = strToBytes(input);
  const deflated = deflateRaw(bytes);
  return btoa(String.fromCharCode(...deflated));
}

export function d_saml(input: string): string {
  const compressed = Uint8Array.from(atob(input), c => c.charCodeAt(0));
  return bytesToStr(inflateRaw(compressed));
}

// ─── ASCII / Binary / Hex Conversions ─────────────────────────────────────────

export function ascii2hex(input: string, sep = " "): string { return hex(input, sep); }
export function hex2ascii(input: string): string {
  return input.replace(/[^0-9a-fA-F]/g, "").replace(/../g, h => String.fromCharCode(parseInt(h, 16)));
}
export function ascii2bin(input: string): string {
  return Array.from(strToBytes(input)).map(b => b.toString(2).padStart(8, "0")).join(" ");
}
export function bin2ascii(input: string): string {
  return input.split(/\s+/).filter(Boolean).map(b => String.fromCharCode(parseInt(b, 2))).join("");
}
export function ascii2reverse_hex(input: string, sep = ""): string {
  return Array.from(strToBytes(input)).reverse().map(b => b.toString(16).padStart(2, "0")).join(sep);
}
export function hex2dec(input: string, regex = "((?:0x)?[a-f0-9]+)"): string {
  return input.replace(new RegExp(regex, "gi"), (_, h) => parseInt(h.replace(/^0x/i, ""), 16).toString());
}
export function dec2hex(input: string, regex = "(\\d+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, d) => parseInt(d).toString(16));
}
export function dec2oct(input: string, regex = "(\\d+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, d) => parseInt(d).toString(8));
}
export function oct2dec(input: string, regex = "([0-7]+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, o) => parseInt(o, 8).toString());
}
export function dec2bin(input: string, regex = "(\\d+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, d) => parseInt(d).toString(2));
}
export function bin2dec(input: string, regex = "([0-1]+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, b) => parseInt(b, 2).toString());
}
export function chunked_dec2hex(input: string): string {
  return input.split(/\s+/).filter(Boolean).map(s => { const n = parseInt(s); return isNaN(n) ? s : n.toString(16); }).join(" ");
}
export function to_charcode(input: string): string {
  return Array.from(input).map(c => c.codePointAt(0)!).join(",");
}
export function from_charcode(input: string): string {
  return input.split(",").map(n => String.fromCodePoint(parseInt(n.trim()))).join("");
}
export function convert_base(input: string, splitChar: string, from: number, to: number): string {
  return input.split(splitChar).map(s => { const n = parseInt(s.trim(), from); return isNaN(n) ? s : n.toString(to); }).join(splitChar);
}

// ─── String Operations ────────────────────────────────────────────────────────

export function uppercase(i: string) { return i.toUpperCase(); }
export function lowercase(i: string) { return i.toLowerCase(); }
export function capitalise(i: string) { return i.charAt(0).toUpperCase() + i.slice(1); }
export function uncapitalise(i: string) { return i.charAt(0).toLowerCase() + i.slice(1); }
export function reverse(i: string) { return [...i].reverse().join(""); }
export function len(i: string) { return i.length.toString(); }
export function unique(i: string) { return [...new Set(i)].join(""); }
export function remove_newlines(i: string) { return i.replace(/[\r\n]/g, ""); }
export function remove_output(_: string) { return ""; }

export function find(input: string, pattern: string, group = -1): string {
  const re = new RegExp(pattern, "g"); const matches: string[] = []; let m;
  while ((m = re.exec(input)) !== null) matches.push(group >= 0 ? (m[group] ?? "") : m[0]);
  return matches.join("\n");
}
export function replace(input: string, find: string, repl: string): string { return input.split(find).join(repl); }
export function regex_replace(input: string, find: string, repl: string): string { return input.replace(new RegExp(find, "g"), repl); }
export function repeat(input: string, n: number): string { return input.repeat(n); }
export function substring(input: string, start: number, end: number): string { return input.slice(start, end); }
export function split_join(input: string, splitChar: string, joinChar: string): string { return input.split(splitChar).join(joinChar); }
export function zeropad(input: string, splitChar: string, amount: number): string { return input.split(splitChar).map(s => s.padStart(amount, "0")).join(splitChar); }

export function if_regex(input: string, regex: string, value: string): string { return new RegExp(regex).test(input) ? value : input; }
export function if_not_regex(input: string, regex: string, value: string): string { return !new RegExp(regex).test(input) ? value : input; }

// ─── Math / Random ────────────────────────────────────────────────────────────

export function uuid(): string { return randomUUID(); }
export function timestamp(): string { return Math.floor(Date.now() / 1000).toString(); }

export function range(_: string, from: number, to: number, step = 1): string {
  const result: string[] = [];
  for (let i = from; i <= to; i += step) result.push(i.toString());
  return result.join("\n");
}

export function total(input: string): string {
  const nums = input.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  return nums.reduce((a, b) => a + b, 0).toString();
}

export function arithmetic(input: string, amount: number, op: string, splitChar = ","): string {
  return input.split(splitChar).map(s => {
    const n = parseFloat(s.trim()); if (isNaN(n)) return s;
    switch (op) { case "+": return (n + amount).toString(); case "-": return (n - amount).toString();
      case "*": return (n * amount).toString(); case "/": return (n / amount).toString(); default: return s; }
  }).join(splitChar);
}

function randomChars(chars: string, n: number): string {
  const rb = randomBytes(n);
  return Array.from(rb).map(b => chars[b % chars.length]).join("");
}
export function random(chars: string, n: number): string { return randomChars(chars, n); }
export function random_alpha_lower(n = 10): string { return randomChars("abcdefghijklmnopqrstuvwxyz", n); }
export function random_alpha_upper(n = 10): string { return randomChars("ABCDEFGHIJKLMNOPQRSTUVWXYZ", n); }
export function random_alpha_mixed(n = 10): string { return randomChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", n); }
export function random_alphanum_lower(n = 10): string { return randomChars("abcdefghijklmnopqrstuvwxyz0123456789", n); }
export function random_alphanum_upper(n = 10): string { return randomChars("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", n); }
export function random_alphanum_mixed(n = 10): string { return randomChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", n); }
export function random_hex(n = 10): string { return randomChars("0123456789abcdef", n); }
export function random_num(n = 10): string { return randomChars("0123456789", n); }

// ─── Hashing ─────────────────────────────────────────────────────────────────

function hash(algo: string, input: string): string {
  return createHash(algo).update(input).digest("hex");
}
export function md5(i: string) { return hash("md5", i); }
export function md4(i: string) { return hash("md4", i); }
export function sha1(i: string) { return hash("sha1", i); }
export function sha256(i: string) { return hash("sha256", i); }
export function sha384(i: string) { return hash("sha384", i); }
export function sha512(i: string) { return hash("sha512", i); }

// ─── HMAC ─────────────────────────────────────────────────────────────────────

function hmac(algo: string, input: string, key: string): string {
  return createHmac(algo, key).update(input).digest("hex");
}
export function hmac_md5(i: string, k: string) { return hmac("md5", i, k); }
export function hmac_sha1(i: string, k: string) { return hmac("sha1", i, k); }
export function hmac_sha256(i: string, k: string) { return hmac("sha256", i, k); }
export function hmac_sha384(i: string, k: string) { return hmac("sha384", i, k); }
export function hmac_sha512(i: string, k: string) { return hmac("sha512", i, k); }

// ─── AES ──────────────────────────────────────────────────────────────────────

export function aes_encrypt(input: string, key: string, transformation = "AES/ECB/PKCS5PADDING", iv = ""): string {
  const [, mode] = transformation.toUpperCase().split("/");
  const keyBuf = Buffer.from(key, "utf8");
  const ivBuf = iv ? Buffer.from(iv, "utf8") : Buffer.alloc(16, 0);
  const algo = `aes-${keyBuf.length * 8}-${(mode || "ecb").toLowerCase()}`;
  const cipher = createCipheriv(algo, keyBuf, mode === "ECB" ? null : ivBuf);
  return Buffer.concat([cipher.update(input, "utf8" as never), cipher.final()]).toString("base64");
}

export function aes_decrypt(input: string, key: string, transformation = "AES/ECB/PKCS5PADDING", iv = ""): string {
  const [, mode] = transformation.toUpperCase().split("/");
  const keyBuf = Buffer.from(key, "utf8");
  const ivBuf = iv ? Buffer.from(iv, "utf8") : Buffer.alloc(16, 0);
  const algo = `aes-${keyBuf.length * 8}-${(mode || "ecb").toLowerCase()}`;
  const decipher = createDecipheriv(algo, keyBuf, mode === "ECB" ? null : ivBuf);
  return Buffer.concat([decipher.update(Buffer.from(input, "base64")), decipher.final()]).toString("utf8");
}

// ─── Classical Ciphers ────────────────────────────────────────────────────────

export function rotN(input: string, n = 13): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26) + base);
  });
}

export function xor(input: string, key: string): string {
  const ib = strToBytes(input), kb = strToBytes(key);
  return Array.from(ib).map((b, i) => (b ^ kb[i % kb.length]).toString(16).padStart(2, "0")).join("");
}

export function atbash_encrypt(input: string): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
  });
}
export function atbash_decrypt(i: string) { return atbash_encrypt(i); }

export function substitution_encrypt(input: string, key = "phqgiumeaylnofdxjkrcvstzwb"): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const up = c >= "A"; const idx = c.toLowerCase().charCodeAt(0) - 97;
    return up ? (key[idx] || c).toUpperCase() : (key[idx] || c);
  });
}
export function substitution_decrypt(input: string, key = "phqgiumeaylnofdxjkrcvstzwb"): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const up = c >= "A"; const idx = key.indexOf(c.toLowerCase()); if (idx === -1) return c;
    return up ? String.fromCharCode(65 + idx) : String.fromCharCode(97 + idx);
  });
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function jwt_sign(payload: string, algo = "HS256", secret = "secret"): string {
  try {
    const header = btoa(JSON.stringify({ alg: algo, typ: "JWT" })).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    const body = btoa(JSON.stringify(JSON.parse(payload))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
    const sig = createHmac("sha256", secret).update(`${header}.${body}`).digest("base64")
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${header}.${body}.${sig}`;
  } catch { return "[JWT error]"; }
}

export function d_jwt_get_payload(input: string): string {
  try { return atob(input.split(".")[1].replace(/-/g, "+").replace(/_/g, "/") + "=="); }
  catch { return "[invalid JWT]"; }
}

export function d_jwt_get_header(input: string): string {
  try { return atob(input.split(".")[0].replace(/-/g, "+").replace(/_/g, "/") + "=="); }
  catch { return "[invalid JWT]"; }
}

// ─── XSS ──────────────────────────────────────────────────────────────────────

export function eval_fromcharcode(input: string): string {
  const codes = Array.from(strToBytes(input)).join(",");
  return `<script>eval(String.fromCharCode(${codes}))<\/script>`;
}
export function iframe_data_url(input: string): string { return `<iframe src="data:text/html;base64,${base64(input)}">` }
export function iframe_src_doc(input: string): string { return `<iframe srcdoc="${html_entities(input)}">` }
export function script_data(input: string): string { return `<script>${input}<\/script>`; }
export function template_eval(input: string): string { return `\${${input}}`; }
export function throw_eval(input: string): string { return `<img src=x onerror="throw/${input}/">`; }

// ─── Minimal deflate/inflate for SAML ─────────────────────────────────────────
// Simple DEFLATE (level 0 / store) — enough for SAML

function deflateRaw(data: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < data.length) {
    const blockSize = Math.min(65535, data.length - i);
    const isLast = (i + blockSize >= data.length) ? 1 : 0;
    out.push(isLast);
    out.push(blockSize & 0xff, (blockSize >> 8) & 0xff);
    out.push((~blockSize) & 0xff, ((~blockSize) >> 8) & 0xff);
    for (let j = 0; j < blockSize; j++) out.push(data[i + j]);
    i += blockSize;
  }
  return new Uint8Array(out);
}

// ─── Fake Data ────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T { return arr[randomBytes(1)[0] % arr.length]; }
function rnd(n: number): number { return randomBytes(1)[0] % n; }
function rndDigits(n: number): string { return Array.from(randomBytes(n)).map(b => b % 10).join(""); }

const FIRST_NAMES = ["Alice","Bob","Charlie","Diana","Eve","Frank","Grace","Henry","Iris","Jack","Kate","Liam","Mia","Noah","Olivia","Paul","Quinn","Ruby","Sam","Tina","Uma","Victor","Wendy","Xander","Yara","Zoe"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Lee","Walker"];
const DOMAINS = ["gmail.com","yahoo.com","outlook.com","proton.me","icloud.com","hotmail.com","example.com"];
const TLDS = ["com","net","org","io","dev","app","co"];
const COMPANIES = ["Acme Corp","Globex","Initech","Umbrella","Stark Industries","Wayne Enterprises","Cyberdyne","Soylent Corp","Nakatomi","Oceanic Airlines"];
const CITIES = ["New York","Los Angeles","London","Paris","Tokyo","Berlin","Sydney","Toronto","Amsterdam","Singapore","Madrid","Rome","Seoul","Dubai","Barcelona"];
const COUNTRIES = ["United States","United Kingdom","France","Germany","Japan","Australia","Canada","Netherlands","Singapore","Spain","Italy","South Korea","Brazil","India","Mexico"];
const STREETS = ["Main St","Oak Ave","Maple Dr","Cedar Ln","Pine Rd","Elm St","Washington Blvd","Park Ave","Lake Dr","River Rd","Hill St","Forest Ave","Valley Rd","Sunset Blvd","Broadway"];
const COLORS = ["red","blue","green","yellow","purple","orange","pink","brown","gray","black","white","cyan","magenta","lime","teal"];
const WORDS = ["lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do","eiusmod","tempor","incididunt","labore","dolore","magna","aliqua","enim","minim","veniam"];
const UAS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
];

export function fake_firstname(_loc?: string): string { return pick(FIRST_NAMES); }
export function fake_lastname(_loc?: string): string { return pick(LAST_NAMES); }
export function fake_fullname(_loc?: string): string { return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`; }
export function fake_username(_loc?: string): string { return `${pick(FIRST_NAMES).toLowerCase()}${rnd(999)}`; }
export function fake_email(_loc?: string): string { return `${pick(FIRST_NAMES).toLowerCase()}.${pick(LAST_NAMES).toLowerCase()}${rnd(99)}@${pick(DOMAINS)}`; }
export function fake_phone(_loc?: string): string { return `+1${rndDigits(3)}${rndDigits(3)}${rndDigits(4)}`; }
export function fake_url(_loc?: string): string { return `https://${pick(LAST_NAMES).toLowerCase()}.${pick(TLDS)}`; }
export function fake_ip(_loc?: string): string { return Array.from(randomBytes(4)).map(b => b).join("."); }
export function fake_ipv6(_loc?: string): string { return Array.from({length:8}, () => randomBytes(2).toString("hex")).join(":"); }
export function fake_mac(_loc?: string): string { return Array.from(randomBytes(6)).map(b => b.toString(16).padStart(2,"0")).join(":"); }
export function fake_uuid(_loc?: string): string { return randomUUID(); }
export function fake_password(_loc?: string): string { return randomChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*", 16); }
export function fake_useragent(_loc?: string): string { return pick(UAS); }
export function fake_company(_loc?: string): string { return pick(COMPANIES); }
export function fake_street(_loc?: string): string { return `${100 + rnd(900)} ${pick(STREETS)}`; }
export function fake_city(_loc?: string): string { return pick(CITIES); }
export function fake_country(_loc?: string): string { return pick(COUNTRIES); }
export function fake_zipcode(_loc?: string): string { return rndDigits(5); }
export function fake_creditcard(_loc?: string): string {
  const digits = Array.from(randomBytes(15)).map(b => b % 10);
  let sum = 0;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if ((digits.length - i) % 2 === 0) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  digits.push((10 - (sum % 10)) % 10);
  return digits.join("").replace(/(\d{4})/g, "$1 ").trim();
}
export function fake_iban(_loc?: string): string { return `GB${rndDigits(2)}BARC${rndDigits(14)}`; }
export function fake_color(_loc?: string): string { return pick(COLORS); }
export function fake_word(_loc?: string): string { return pick(WORDS); }
export function fake_sentence(_loc?: string): string {
  const n = 5 + rnd(6);
  const words = Array.from({length: n}, () => pick(WORDS));
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}
export function fake_paragraph(_loc?: string): string {
  const n = 3 + rnd(3);
  return Array.from({length: n}, () => fake_sentence()).join(" ");
}

export function bchar(): string { return '${{<%[%\'"}}%\\.'; }
export function canary(prefix?: string): string {
  const p = (prefix && prefix.length > 0) ? prefix : "pastis";
  return `${p}${Date.now()}${bchar()}${p}`;
}

function inflateRaw(data: Uint8Array): Uint8Array {
  const out: number[] = [];
  let i = 0;
  while (i < data.length) {
    const bfinal = data[i] & 1;
    const btype = (data[i] >> 1) & 3;
    i++;
    if (btype === 0) {
      i = (i + 3) & ~3;
      const len = data[i] | (data[i + 1] << 8);
      i += 4;
      for (let j = 0; j < len; j++) out.push(data[i++]);
    } else {
      throw new Error("Compressed DEFLATE not supported in backend — use base64 SAML");
    }
    if (bfinal) break;
  }
  return new Uint8Array(out);
}
