import CryptoJS from "crypto-js";
import * as pako from "pako";
import { allFakers } from "@faker-js/faker";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function strToBytes(s: string): Uint8Array {
  return new TextEncoder().encode(s);
}

function bytesToStr(b: Uint8Array): string {
  return new TextDecoder().decode(b);
}

function wordArrayToHex(wa: CryptoJS.lib.WordArray): string {
  return wa.toString(CryptoJS.enc.Hex);
}

function strToWordArray(s: string): CryptoJS.lib.WordArray {
  return CryptoJS.enc.Utf8.parse(s);
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
  const padded = input + (pad ? "=".repeat(4 - pad) : "");
  return d_base64(padded.replace(/-/g, "+").replace(/_/g, "/"));
}

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32(input: string): string {
  const bytes = strToBytes(input);
  let bits = 0, value = 0, output = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32_CHARS[(value >>> bits) & 31];
    }
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
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) { bits -= 8; bytes.push((value >>> bits) & 0xff); }
  }
  return bytesToStr(new Uint8Array(bytes));
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function base58(input: string): string {
  const bytes = Array.from(strToBytes(input));
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) { digits.push(carry % 58); carry = Math.floor(carry / 58); }
  }
  let result = "";
  for (let i = bytes.findIndex(b => b !== 0); i < bytes.length; i++) {
    if (bytes[i] !== 0) break;
    result += BASE58_ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) result += BASE58_ALPHABET[digits[i]];
  return result;
}

export function d_base58(input: string): string {
  const bytes: number[] = [0];
  for (const c of input) {
    const idx = BASE58_ALPHABET.indexOf(c);
    if (idx === -1) throw new Error(`Invalid base58 char: ${c}`);
    let carry = idx;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 58;
      bytes[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) { bytes.push(carry & 0xff); carry >>= 8; }
  }
  const result: number[] = [];
  for (let i = 0; i < input.length && input[i] === BASE58_ALPHABET[0]; i++) result.push(0);
  for (let i = bytes.length - 1; i >= 0; i--) result.push(bytes[i]);
  return bytesToStr(new Uint8Array(result));
}

// ─── Hex ──────────────────────────────────────────────────────────────────────

export function hex(input: string, separator: string = " "): string {
  return Array.from(strToBytes(input))
    .map(b => b.toString(16).padStart(2, "0"))
    .join(separator);
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
  return input.replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, h) =>
    String.fromCodePoint(parseInt(h, 16))
  );
}

// ─── HTML Entities ────────────────────────────────────────────────────────────

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;"
};

export function html_entities(input: string): string {
  return input.replace(/[&<>"']/g, c => HTML_ENTITIES[c] || c);
}

export function html5_entities(input: string): string {
  return Array.from(input).map(c => {
    const cp = c.codePointAt(0)!;
    if (cp > 127 || HTML_ENTITIES[c]) return `&#x${cp.toString(16)};`;
    return c;
  }).join("");
}

export function d_html_entities(input: string): string {
  const d = document.createElement("textarea");
  d.innerHTML = input;
  return d.value;
}

export function d_html5_entities(input: string): string {
  return d_html_entities(input);
}

// ─── URL Encoding ─────────────────────────────────────────────────────────────

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
  return encodeURIComponent(input).replace(/[!'()*]/g, c =>
    "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

export function d_url(input: string): string {
  return decodeURIComponent(input.replace(/\+/g, " "));
}

export function d_burp_url(input: string): string {
  return decodeURIComponent(input);
}

// ─── String Encodings ─────────────────────────────────────────────────────────

export function js_string(input: string): string {
  return input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
    .replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}

export function decode_js_string(input: string): string {
  try {
    return JSON.parse(`"${input}"`);
  } catch {
    return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
      .replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t")
      .replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
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
  return input.replace(/=\r?\n/g, "").replace(/=([0-9A-Fa-f]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  );
}

export function php_chr(input: string): string {
  return Array.from(strToBytes(input)).map(b => `chr(${b})`).join(".");
}

export function sql_hex(input: string): string {
  const h = Array.from(strToBytes(input)).map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${h}`;
}

export function saml(input: string): string {
  const compressed = pako.deflateRaw(strToBytes(input));
  return btoa(String.fromCharCode(...compressed));
}

export function d_saml(input: string): string {
  const compressed = Uint8Array.from(atob(input), c => c.charCodeAt(0));
  return bytesToStr(pako.inflateRaw(compressed));
}

export function utf7(input: string, exclude: string = ""): string {
  const excludeSet = new Set(exclude);
  let result = "";
  let inBase64 = false;
  let buffer = "";

  const flushBuffer = () => {
    if (buffer) {
      const bytes: number[] = [];
      for (const c of buffer) {
        const cp = c.codePointAt(0)!;
        bytes.push((cp >> 8) & 0xff, cp & 0xff);
      }
      result += `+${btoa(String.fromCharCode(...bytes)).replace(/=+$/, "")}-`;
      buffer = "";
    }
    inBase64 = false;
  };

  for (const c of input) {
    if (c === "+") { result += "+-"; continue; }
    const cp = c.codePointAt(0)!;
    if (cp < 128 && !excludeSet.has(c)) {
      if (inBase64) flushBuffer();
      result += c;
    } else {
      inBase64 = true;
      buffer += c;
    }
  }
  if (inBase64) flushBuffer();
  return result;
}

export function d_utf7(input: string): string {
  return input.replace(/\+([A-Za-z0-9+/]*)-?/g, (match, b64) => {
    if (!b64) return "+";
    const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    let result = "";
    for (let i = 0; i < bytes.length - 1; i += 2) {
      result += String.fromCharCode((bytes[i] << 8) | bytes[i + 1]);
    }
    return result;
  });
}

export function unicode_alternatives(input: string): string {
  const alternatives: Record<string, string[]> = {
    "a": ["\u0061", "\u0430", "\u0251", "\u00e0"],
    "e": ["\u0065", "\u0435", "\u00e8"],
    "i": ["\u0069", "\u0456", "\u00ec"],
    "o": ["\u006f", "\u043e", "\u00f3"],
  };
  return input.split("").map(c => {
    const alts = alternatives[c.toLowerCase()];
    if (alts && alts.length > 1) return alts[1];
    return c;
  }).join("");
}

// ─── ASCII / Binary / Hex Conversions ─────────────────────────────────────────

export function ascii2hex(input: string, separator: string = " "): string {
  return hex(input, separator);
}

export function hex2ascii(input: string): string {
  return input.replace(/[^0-9a-fA-F]/g, "").replace(/../g, h =>
    String.fromCharCode(parseInt(h, 16))
  );
}

export function ascii2bin(input: string): string {
  return Array.from(strToBytes(input)).map(b => b.toString(2).padStart(8, "0")).join(" ");
}

export function bin2ascii(input: string): string {
  return input.split(/\s+/).filter(Boolean).map(b =>
    String.fromCharCode(parseInt(b, 2))
  ).join("");
}

export function ascii2reverse_hex(input: string, separator: string = ""): string {
  return Array.from(strToBytes(input)).reverse().map(b =>
    b.toString(16).padStart(2, "0")
  ).join(separator);
}

export function hex2dec(input: string, regex: string = "((?:0x)?[a-f0-9]+)"): string {
  return input.replace(new RegExp(regex, "gi"), (_, h) =>
    parseInt(h.replace(/^0x/i, ""), 16).toString()
  );
}

export function dec2hex(input: string, regex: string = "(\\d+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, d) =>
    parseInt(d).toString(16)
  );
}

export function dec2oct(input: string, regex: string = "(\\d+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, d) => parseInt(d).toString(8));
}

export function oct2dec(input: string, regex: string = "([0-7]+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, o) => parseInt(o, 8).toString());
}

export function dec2bin(input: string, regex: string = "(\\d+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, d) => parseInt(d).toString(2));
}

export function bin2dec(input: string, regex: string = "([0-1]+)"): string {
  return input.replace(new RegExp(regex, "g"), (_, b) => parseInt(b, 2).toString());
}

export function chunked_dec2hex(input: string): string {
  return input.split(/\s+/).filter(Boolean).map(s => {
    const n = parseInt(s);
    return isNaN(n) ? s : n.toString(16);
  }).join(" ");
}

export function to_charcode(input: string): string {
  return Array.from(input).map(c => c.codePointAt(0)!).join(",");
}

export function from_charcode(input: string): string {
  return input.split(",").map(n => String.fromCodePoint(parseInt(n.trim()))).join("");
}

export function convert_base(input: string, splitChar: string, from: number, to: number): string {
  return input.split(splitChar).map(s => {
    const n = parseInt(s.trim(), from);
    return isNaN(n) ? s : n.toString(to);
  }).join(splitChar);
}

// ─── String Operations ────────────────────────────────────────────────────────

export function uppercase(input: string): string { return input.toUpperCase(); }
export function lowercase(input: string): string { return input.toLowerCase(); }
export function reverse(input: string): string { return [...input].reverse().join(""); }
export function len(input: string): string { return input.length.toString(); }

export function capitalise(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export function unique(input: string): string {
  return [...new Set(input)].join("");
}

export function find(input: string, pattern: string, group: number = -1): string {
  const re = new RegExp(pattern, "g");
  const matches: string[] = [];
  let m;
  while ((m = re.exec(input)) !== null) {
    matches.push(group >= 0 ? (m[group] ?? "") : m[0]);
  }
  return matches.join("\n");
}

export function replace(input: string, find: string, replacement: string): string {
  return input.split(find).join(replacement);
}

export function regex_replace(input: string, find: string, replacement: string): string {
  return input.replace(new RegExp(find, "g"), replacement);
}

export function repeat(input: string, amount: number): string {
  return input.repeat(amount);
}

export function substring(input: string, start: number, end: number): string {
  return input.slice(start, end);
}

export function split_join(input: string, splitChar: string, joinChar: string): string {
  return input.split(splitChar).join(joinChar);
}

export function remove_newlines(input: string): string {
  return input.replace(/[\r\n]/g, "");
}


export function if_regex(input: string, regex: string, value: string): string {
  return new RegExp(regex).test(input) ? value : input;
}

export function if_not_regex(input: string, regex: string, value: string): string {
  return !new RegExp(regex).test(input) ? value : input;
}

export function zeropad(input: string, splitChar: string, amount: number): string {
  return input.split(splitChar).map(s => s.padStart(amount, "0")).join(splitChar);
}

// ─── Math / Random ────────────────────────────────────────────────────────────

export function uuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function timestamp(): string {
  return Math.floor(Date.now() / 1000).toString();
}

export function date(format: string, timezone: string = "UTC"): string {
  const now = new Date();
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: timezone || "UTC",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  };
  const parts = new Intl.DateTimeFormat("en-US", opts).formatToParts(now);
  const p: Record<string, string> = {};
  for (const { type, value } of parts) p[type] = value;
  return format
    .replace("yyyy", p.year).replace("MM", p.month).replace("dd", p.day)
    .replace("HH", p.hour).replace("mm", p.minute).replace("ss", p.second);
}

export function range(input: string, from: number, to: number, step: number = 1): string {
  const result: string[] = [];
  for (let i = from; i <= to; i += step) result.push(i.toString());
  return result.join("\n");
}

export function total(input: string): string {
  const nums = input.split(/[\s,]+/).filter(Boolean).map(Number).filter(n => !isNaN(n));
  return nums.reduce((a, b) => a + b, 0).toString();
}

export function arithmetic(input: string, amount: number, operation: string, splitChar: string = ","): string {
  return input.split(splitChar).map(s => {
    const n = parseFloat(s.trim());
    if (isNaN(n)) return s;
    switch (operation) {
      case "+": return (n + amount).toString();
      case "-": return (n - amount).toString();
      case "*": return (n * amount).toString();
      case "/": return (n / amount).toString();
      case "%": return (n % amount).toString();
      default: return s;
    }
  }).join(splitChar);
}

function randomChars(chars: string, len: number, everyCharOnce: boolean): string {
  if (everyCharOnce) {
    const arr = chars.split("").sort(() => Math.random() - 0.5);
    return arr.slice(0, len).join("");
  }
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function random(chars: string, len: number, everyCharOnce: boolean = false): string {
  return randomChars(chars, len, everyCharOnce);
}

export function random_alpha_lower(len: number = 10): string {
  return randomChars("abcdefghijklmnopqrstuvwxyz", len, false);
}

export function random_alpha_upper(len: number = 10): string {
  return randomChars("ABCDEFGHIJKLMNOPQRSTUVWXYZ", len, false);
}

export function random_alpha_mixed(len: number = 10): string {
  return randomChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", len, false);
}

export function random_alphanum_lower(len: number = 10): string {
  return randomChars("abcdefghijklmnopqrstuvwxyz0123456789", len, false);
}

export function random_alphanum_upper(len: number = 10): string {
  return randomChars("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", len, false);
}

export function random_alphanum_mixed(len: number = 10): string {
  return randomChars("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", len, false);
}

export function random_hex(len: number = 10): string {
  return randomChars("0123456789abcdef", len, false);
}

export function random_hex_mixed(len: number = 10): string {
  return randomChars("0123456789abcdefABCDEF", len, false);
}

export function random_num(len: number = 10): string {
  return randomChars("0123456789", len, false);
}

export function random_unicode(from: number = 0, to: number = 0xffff, amount: number = 10): string {
  return Array.from({ length: amount }, () =>
    String.fromCodePoint(from + Math.floor(Math.random() * (to - from + 1)))
  ).join("");
}

// ─── Hashing ──────────────────────────────────────────────────────────────────

export function md5(input: string): string {
  return CryptoJS.MD5(input).toString();
}

export function sha1(input: string): string {
  return CryptoJS.SHA1(input).toString();
}

export function sha224(input: string): string {
  return CryptoJS.SHA224(input).toString();
}

export function sha256(input: string): string {
  return CryptoJS.SHA256(input).toString();
}

export function sha384(input: string): string {
  return CryptoJS.SHA384(input).toString();
}

export function sha512(input: string): string {
  return CryptoJS.SHA512(input).toString();
}

export function sha3(input: string): string {
  return CryptoJS.SHA3(input, { outputLength: 512 }).toString();
}

export function sha3_224(input: string): string {
  return CryptoJS.SHA3(input, { outputLength: 224 }).toString();
}

export function sha3_256(input: string): string {
  return CryptoJS.SHA3(input, { outputLength: 256 }).toString();
}

export function sha3_384(input: string): string {
  return CryptoJS.SHA3(input, { outputLength: 384 }).toString();
}

export function sha3_512(input: string): string {
  return CryptoJS.SHA3(input, { outputLength: 512 }).toString();
}

export function ripemd160(input: string): string {
  return CryptoJS.RIPEMD160(input).toString();
}

// ─── HMAC ─────────────────────────────────────────────────────────────────────

export function hmac_md5(input: string, key: string): string {
  return CryptoJS.HmacMD5(input, key).toString();
}

export function hmac_sha1(input: string, key: string): string {
  return CryptoJS.HmacSHA1(input, key).toString();
}

export function hmac_sha224(input: string, key: string): string {
  return CryptoJS.HmacSHA224(input, key).toString();
}

export function hmac_sha256(input: string, key: string): string {
  return CryptoJS.HmacSHA256(input, key).toString();
}

export function hmac_sha384(input: string, key: string): string {
  return CryptoJS.HmacSHA384(input, key).toString();
}

export function hmac_sha512(input: string, key: string): string {
  return CryptoJS.HmacSHA512(input, key).toString();
}

// ─── Encryption ───────────────────────────────────────────────────────────────

export function aes_encrypt(input: string, key: string, transformation: string = "AES/ECB/PKCS5PADDING", iv: string = ""): string {
  const parts = transformation.toUpperCase().split("/");
  const mode = parts[1] || "ECB";
  const keyWA = strToWordArray(key);

  const opts: Record<string, unknown> = {};
  if (mode === "CBC" && iv) opts["iv"] = strToWordArray(iv);
  if (mode === "ECB") opts["mode"] = CryptoJS.mode.ECB;

  const encrypted = CryptoJS.AES.encrypt(input, keyWA, opts as Parameters<typeof CryptoJS.AES.encrypt>[2]);
  return encrypted.toString();
}

export function aes_decrypt(input: string, key: string, transformation: string = "AES/ECB/PKCS5PADDING", iv: string = ""): string {
  const parts = transformation.toUpperCase().split("/");
  const mode = parts[1] || "ECB";
  const keyWA = strToWordArray(key);

  const opts: Record<string, unknown> = {};
  if (mode === "CBC" && iv) opts["iv"] = strToWordArray(iv);
  if (mode === "ECB") opts["mode"] = CryptoJS.mode.ECB;

  const decrypted = CryptoJS.AES.decrypt(input, keyWA, opts as Parameters<typeof CryptoJS.AES.decrypt>[2]);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function xor(input: string, key: string): string {
  const inputBytes = strToBytes(input);
  const keyBytes = strToBytes(key);
  const result = inputBytes.map((b, i) => b ^ keyBytes[i % keyBytes.length]);
  return toHex(result);
}

export function xor_decrypt(input: string, keyLength: number, _hex: boolean = false): string {
  const bytes = input.match(/../g)?.map(h => parseInt(h, 16)) ?? [];
  const key: number[] = new Array(keyLength).fill(0);
  for (let i = 0; i < bytes.length; i++) key[i % keyLength] ^= bytes[i];
  return key.map(b => String.fromCharCode(b)).join("");
}

export function xor_getkey(input: string): string {
  const bytes = input.match(/../g)?.map(h => parseInt(h, 16)) ?? [];
  let best = "";
  let bestScore = -Infinity;
  for (let kl = 1; kl <= 16; kl++) {
    const key: number[] = new Array(kl).fill(0);
    for (let i = 0; i < bytes.length; i++) key[i % kl] ^= bytes[i];
    const keyStr = key.map(b => String.fromCharCode(b)).join("");
    const decoded = bytes.map((b, i) => String.fromCharCode(b ^ key[i % kl])).join("");
    const score = (decoded.match(/[a-zA-Z ]/g) || []).length;
    if (score > bestScore) { bestScore = score; best = keyStr; }
  }
  return best;
}

export function rotN(input: string, n: number = 13): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26) + base);
  });
}

export function rotN_bruteforce(input: string): string {
  return Array.from({ length: 26 }, (_, i) => `ROT${i}: ${rotN(input, i)}`).join("\n");
}

export function affine_encrypt(input: string, a: number = 5, b: number = 9): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    const x = c.charCodeAt(0) - base;
    return String.fromCharCode(((a * x + b) % 26) + base);
  });
}

export function affine_decrypt(input: string, a: number = 5, b: number = 9): string {
  const modInverse = (a: number, m: number): number => {
    for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
    return 1;
  };
  const aInv = modInverse(a, 26);
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    const y = c.charCodeAt(0) - base;
    return String.fromCharCode(((aInv * (y - b + 26)) % 26) + base);
  });
}

export function atbash_encrypt(input: string): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c >= "a" ? 97 : 65;
    return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
  });
}

export function atbash_decrypt(input: string): string {
  return atbash_encrypt(input);
}

export function rail_fence_encrypt(input: string, rails: number = 4): string {
  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0, dir = 1;
  for (const c of input) {
    fence[rail].push(c);
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return fence.map(r => r.join("")).join("");
}

export function rail_fence_decrypt(input: string, rails: number = 4): string {
  const n = input.length;
  const pattern: number[] = new Array(n);
  let rail = 0, dir = 1;
  for (let i = 0; i < n; i++) {
    pattern[i] = rail;
    if (rail === 0) dir = 1;
    else if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  const positions = Array.from({ length: rails }, (_, r) =>
    pattern.map((p, i) => ({ r: p, i })).filter(x => x.r === r).map(x => x.i)
  );
  const result: string[] = new Array(n);
  let pos = 0;
  for (let r = 0; r < rails; r++) {
    for (const idx of positions[r]) result[idx] = input[pos++];
  }
  return result.join("");
}

export function substitution_encrypt(input: string, key: string = "phqgiumeaylnofdxjkrcvstzwb"): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const isUpper = c >= "A";
    const idx = c.toLowerCase().charCodeAt(0) - 97;
    const sub = key[idx] || c;
    return isUpper ? sub.toUpperCase() : sub;
  });
}

export function substitution_decrypt(input: string, key: string = "phqgiumeaylnofdxjkrcvstzwb"): string {
  return input.replace(/[a-zA-Z]/g, c => {
    const isUpper = c >= "A";
    const idx = key.indexOf(c.toLowerCase());
    if (idx === -1) return c;
    const plain = String.fromCharCode(97 + idx);
    return isUpper ? plain.toUpperCase() : plain;
  });
}

// ─── Compression ─────────────────────────────────────────────────────────────

export function gzip_compress(input: string): string {
  const compressed = pako.gzip(strToBytes(input));
  return btoa(String.fromCharCode(...compressed));
}

export function gzip_decompress(input: string): string {
  const bytes = Uint8Array.from(atob(input), c => c.charCodeAt(0));
  return bytesToStr(pako.ungzip(bytes));
}

export function deflate_compress(input: string, compressionType: string = "fixed"): string {
  const compressed = pako.deflate(strToBytes(input));
  return btoa(String.fromCharCode(...compressed));
}

export function deflate_decompress(input: string): string {
  const bytes = Uint8Array.from(atob(input), c => c.charCodeAt(0));
  return bytesToStr(pako.inflate(bytes));
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

export function jwt_sign(payload: string, algo: string = "HS256", secret: string = "secret"): string {
  try {
    const claims = JSON.parse(payload);
    const header = btoa(JSON.stringify({ alg: algo, typ: "JWT" })).replace(/=+$/, "")
      .replace(/\+/g, "-").replace(/\//g, "_");
    const body = btoa(JSON.stringify(claims)).replace(/=+$/, "")
      .replace(/\+/g, "-").replace(/\//g, "_");
    const sigInput = `${header}.${body}`;
    const sig = hmac_sha256_bytes(sigInput, secret);
    return `${sigInput}.${sig}`;
  } catch {
    return "[JWT error: invalid payload]";
  }
}

function hmac_sha256_bytes(input: string, key: string): string {
  const result = CryptoJS.HmacSHA256(input, key);
  return result.toString(CryptoJS.enc.Base64)
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function d_jwt_get_payload(input: string): string {
  try {
    const parts = input.split(".");
    if (parts.length < 2) return "[invalid JWT]";
    return atob(parts[1].replace(/-/g, "+").replace(/_/g, "/") + "==");
  } catch {
    return "[invalid JWT]";
  }
}

export function d_jwt_get_header(input: string): string {
  try {
    const parts = input.split(".");
    if (parts.length < 1) return "[invalid JWT]";
    return atob(parts[0].replace(/-/g, "+").replace(/_/g, "/") + "==");
  } catch {
    return "[invalid JWT]";
  }
}

export function d_jwt_verify(input: string, secret: string): string {
  try {
    const parts = input.split(".");
    if (parts.length !== 3) return "false";
    const sigInput = `${parts[0]}.${parts[1]}`;
    const expected = hmac_sha256_bytes(sigInput, secret);
    return expected === parts[2] ? "true" : "false";
  } catch {
    return "false";
  }
}

// ─── XSS Payloads ─────────────────────────────────────────────────────────────

export function css_expression(input: string): string {
  return `<div style="width:expression(${input})">`;
}

export function eval_fromcharcode(input: string): string {
  const codes = Array.from(strToBytes(input)).join(",");
  return `<script>eval(String.fromCharCode(${codes}))</script>`;
}

export function iframe_data_url(input: string): string {
  return `<iframe src="data:text/html;base64,${base64(input)}">`;
}

export function iframe_src_doc(input: string): string {
  return `<iframe srcdoc="${html_entities(input)}">`;
}

export function script_data(input: string): string {
  return `<script>${input}</script>`;
}

export function uppercase_script(input: string): string {
  return `<SCRIPT>${input}</SCRIPT>`;
}

export function template_eval(input: string): string {
  return `\${${input}}`;
}

export function throw_eval(input: string): string {
  return `<img src=x onerror="throw/${input}/">`;
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

export function json_parse(input: string, properties: string): string {
  try {
    const obj = JSON.parse(input);
    return properties.split(/\s+/).map(prop => {
      const path = prop.replace(/^\$/, "").split("-");
      let val: unknown = obj;
      for (const p of path) {
        if (val && typeof val === "object") val = (val as Record<string, unknown>)[p];
        else val = undefined;
      }
      return val !== undefined ? String(val) : "";
    }).join(" ");
  } catch {
    return "[invalid JSON]";
  }
}

// ─── Variables ────────────────────────────────────────────────────────────────

export function set_variable(name: string, value: string, variables: Map<string, string>, global: boolean = false): string {
  variables.set(name, value);
  if (global) variables.set(`__global_${name}`, value);
  return value;
}

export function get_variable(name: string, variables: Map<string, string>): string {
  return variables.get(name) ?? variables.get(`__global_${name}`) ?? "UNDEFINED";
}

export function increment_var(start: number, varName: string, variables: Map<string, string>, enabled: boolean = false): string {
  if (!enabled) return "";
  const current = parseInt(variables.get(varName) ?? start.toString());
  const next = isNaN(current) ? start + 1 : current + 1;
  variables.set(varName, next.toString());
  return next.toString();
}

export function decrement_var(start: number, varName: string, variables: Map<string, string>, enabled: boolean = false): string {
  if (!enabled) return "";
  const current = parseInt(variables.get(varName) ?? start.toString());
  const next = isNaN(current) ? start - 1 : current - 1;
  variables.set(varName, next.toString());
  return next.toString();
}

// ─── Fake Data ────────────────────────────────────────────────────────────────

function getFaker(loc?: string) {
  const key = (loc && loc.length > 0 ? loc : "en") as keyof typeof allFakers;
  return allFakers[key] ?? allFakers["en"];
}

export function fake_email(loc?: string): string { return getFaker(loc).internet.email(); }
export function fake_username(loc?: string): string { return getFaker(loc).internet.username(); }
export function fake_firstname(loc?: string): string { return getFaker(loc).person.firstName(); }
export function fake_lastname(loc?: string): string { return getFaker(loc).person.lastName(); }
export function fake_fullname(loc?: string): string { return getFaker(loc).person.fullName(); }
export function fake_phone(loc?: string): string { return getFaker(loc).phone.number(); }
export function fake_url(loc?: string): string { return getFaker(loc).internet.url(); }
export function fake_ip(loc?: string): string { return getFaker(loc).internet.ipv4(); }
export function fake_ipv6(loc?: string): string { return getFaker(loc).internet.ipv6(); }
export function fake_mac(loc?: string): string { return getFaker(loc).internet.mac(); }
export function fake_uuid(loc?: string): string { return getFaker(loc).string.uuid(); }
export function fake_password(loc?: string): string { return getFaker(loc).internet.password(); }
export function fake_useragent(loc?: string): string { return getFaker(loc).internet.userAgent(); }
export function fake_company(loc?: string): string { return getFaker(loc).company.name(); }
export function fake_street(loc?: string): string { return getFaker(loc).location.streetAddress(); }
export function fake_city(loc?: string): string { return getFaker(loc).location.city(); }
export function fake_country(loc?: string): string { return getFaker(loc).location.country(); }
export function fake_zipcode(loc?: string): string { return getFaker(loc).location.zipCode(); }
export function fake_creditcard(loc?: string): string { return getFaker(loc).finance.creditCardNumber(); }
export function fake_iban(loc?: string): string { return getFaker(loc).finance.iban(); }
export function fake_color(loc?: string): string { return getFaker(loc).color.human(); }
export function fake_word(loc?: string): string { return getFaker(loc).lorem.word(); }
export function fake_sentence(loc?: string): string { return getFaker(loc).lorem.sentence(); }
export function fake_paragraph(loc?: string): string { return getFaker(loc).lorem.paragraph(); }

export function bchar(): string { return '${{<%[%\'"}}%\\.'; }
export function canary(prefix?: string): string {
  const p = (prefix && prefix.length > 0) ? prefix : "pastis";
  return `${p}${Date.now()}${bchar()}${p}`;
}
