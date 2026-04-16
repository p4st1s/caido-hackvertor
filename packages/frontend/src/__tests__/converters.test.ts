import { describe, it, expect } from "vitest";
import * as C from "../converters";

// ─── Base Encodings ───────────────────────────────────────────────────────────

describe("base64", () => {
  it("encodes known value", () => expect(C.base64("hello")).toBe("aGVsbG8="));
  it("roundtrip", () => expect(C.d_base64(C.base64("Hello World!"))).toBe("Hello World!"));
  it("handles unicode", () => expect(C.d_base64(C.base64("café ñoño"))).toBe("café ñoño"));
  it("empty string", () => expect(C.base64("")).toBe(""));
});

describe("base64url", () => {
  it("no padding or +/", () => {
    const enc = C.base64url("hello world");
    expect(enc).not.toContain("=");
    expect(enc).not.toContain("+");
    expect(enc).not.toContain("/");
  });
  it("roundtrip", () => expect(C.d_base64url(C.base64url("test 🔥"))).toBe("test 🔥"));
});

describe("base32", () => {
  it("encodes known value", () => expect(C.base32("hello")).toBe("NBSWY3DP"));
  it("roundtrip", () => expect(C.d_base32(C.base32("Hello World!"))).toBe("Hello World!"));
  it("empty string", () => expect(C.base32("")).toBe(""));
});

describe("base58", () => {
  it("encodes known value", () => expect(C.base58("hello")).toBe("Cn8eVZg"));
  it("roundtrip", () => expect(C.d_base58(C.base58("Hello World!"))).toBe("Hello World!"));
  it("roundtrip special chars", () => expect(C.d_base58(C.base58("abc123"))).toBe("abc123"));
});

// ─── Hex ──────────────────────────────────────────────────────────────────────

describe("hex", () => {
  it("encodes known value no sep", () => expect(C.hex("AB", "")).toBe("4142"));
  it("encodes with space separator", () => expect(C.hex("AB")).toBe("41 42"));
  it("hex_escapes known value", () => expect(C.hex_escapes("AB")).toBe("\\x41\\x42"));
  it("hex_entities known value", () => expect(C.hex_entities("A")).toBe("&#x41;"));
  it("dec_entities known value", () => expect(C.dec_entities("A")).toBe("&#65;"));
  it("octal_escapes roundtrip", () => expect(C.d_octal_escapes(C.octal_escapes("hello"))).toBe("hello"));
  it("unicode_escapes known value", () => expect(C.unicode_escapes("A")).toBe("\\u0041"));
  it("css_escapes known value", () => expect(C.d_css_escapes(C.css_escapes("AB"))).toBe("AB"));
});

// ─── HTML Entities ────────────────────────────────────────────────────────────

describe("html_entities", () => {
  it("encodes special chars", () => {
    expect(C.html_entities('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });
  it("roundtrip", () => {
    const original = '<div class="test">Hello & World</div>';
    expect(C.d_html_entities(C.html_entities(original))).toBe(original);
  });
  it("encodes ampersand", () => expect(C.html_entities("a & b")).toBe("a &amp; b"));
});

// ─── URL Encoding ─────────────────────────────────────────────────────────────

describe("urlencode", () => {
  it("encodes space as +", () => expect(C.urlencode("hello world")).toBe("hello+world"));
  it("roundtrip", () => expect(C.d_url(C.urlencode("hello world & foo=bar"))).toBe("hello world & foo=bar"));
  it("urlencode_all encodes every byte", () => {
    const enc = C.urlencode_all("AB");
    expect(enc).toBe("%41%42");
  });
  it("urlencode_not_plus uses %20", () => expect(C.urlencode_not_plus("hello world")).toBe("hello%20world"));
});

// ─── String Encodings ─────────────────────────────────────────────────────────

describe("js_string", () => {
  it("encodes backslash and quote", () => {
    expect(C.js_string('say "hello"')).toBe('say \\"hello\\"');
    expect(C.js_string("line1\nline2")).toBe("line1\\nline2");
  });
  it("roundtrip", () => {
    const original = 'hello\nworld\t"test"\\path';
    expect(C.decode_js_string(C.js_string(original))).toBe(original);
  });
});

describe("saml", () => {
  it("roundtrip", () => {
    const xml = '<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol">test</samlp:AuthnRequest>';
    expect(C.d_saml(C.saml(xml))).toBe(xml);
  });
});

describe("quoted_printable", () => {
  it("roundtrip", () => expect(C.d_quoted_printable(C.quoted_printable("Hello World!"))).toBe("Hello World!"));
  it("roundtrip non-ascii", () => {
    const input = "Subject: =?UTF-8?Q?test?=";
    expect(C.d_quoted_printable(C.quoted_printable(input))).toBe(input);
  });
});

// ─── ASCII/Hex Conversions ────────────────────────────────────────────────────

describe("ascii2hex / hex2ascii", () => {
  it("known value", () => expect(C.ascii2hex("AB", "")).toBe("4142"));
  it("roundtrip", () => expect(C.hex2ascii(C.ascii2hex("Hello!", ""))).toBe("Hello!"));
});

describe("ascii2bin / bin2ascii", () => {
  it("roundtrip", () => expect(C.bin2ascii(C.ascii2bin("Hi"))).toBe("Hi"));
});

describe("hex2dec / dec2hex", () => {
  it("hex2dec known value", () => expect(C.hex2dec("ff")).toBe("255"));
  it("dec2hex known value", () => expect(C.dec2hex("255")).toBe("ff"));
  it("roundtrip", () => expect(C.hex2dec(C.dec2hex("1000"))).toBe("1000"));
});

describe("dec2oct / oct2dec", () => {
  it("roundtrip", () => expect(C.oct2dec(C.dec2oct("255"))).toBe("255"));
  it("known value", () => expect(C.dec2oct("8")).toBe("10"));
});

describe("dec2bin / bin2dec", () => {
  it("roundtrip", () => expect(C.bin2dec(C.dec2bin("42"))).toBe("42"));
  it("known value", () => expect(C.dec2bin("10")).toBe("1010"));
});

describe("to_charcode / from_charcode", () => {
  it("roundtrip", () => expect(C.from_charcode(C.to_charcode("Hello"))).toBe("Hello"));
  it("known value", () => expect(C.to_charcode("A")).toBe("65"));
});

// ─── String Operations ────────────────────────────────────────────────────────

describe("string ops", () => {
  it("uppercase", () => expect(C.uppercase("hello")).toBe("HELLO"));
  it("lowercase", () => expect(C.lowercase("HELLO")).toBe("hello"));
  it("reverse", () => expect(C.reverse("hello")).toBe("olleh"));
  it("len", () => expect(C.len("hello")).toBe("5"));
  it("capitalise", () => expect(C.capitalise("hello world")).toBe("Hello world"));
  it("unique", () => expect(C.unique("aabbcc")).toBe("abc"));
  it("remove_newlines", () => expect(C.remove_newlines("line1\r\nline2\nline3")).toBe("line1line2line3"));
  it("replace", () => expect(C.replace("hello world", "world", "you")).toBe("hello you"));
  it("regex_replace", () => expect(C.regex_replace("hello123world", "\\d+", "NUM")).toBe("helloNUMworld"));
  it("repeat", () => expect(C.repeat("ab", 3)).toBe("ababab"));
  it("substring", () => expect(C.substring("hello world", 6, 11)).toBe("world"));
  it("split_join", () => expect(C.split_join("a,b,c", ",", ";")).toBe("a;b;c"));
  it("find", () => expect(C.find("hello world", "\\w+")).toBe("hello\nworld"));
  it("zeropad", () => expect(C.zeropad("1,2,10", ",", 3)).toBe("001,002,010"));
});

describe("if_regex / if_not_regex", () => {
  it("if_regex matches", () => expect(C.if_regex("hello", "hel", "found")).toBe("found"));
  it("if_regex no match", () => expect(C.if_regex("world", "hel", "found")).toBe("world"));
  it("if_not_regex no match", () => expect(C.if_not_regex("world", "hel", "found")).toBe("found"));
});

// ─── ROT / Cipher ─────────────────────────────────────────────────────────────

describe("rotN", () => {
  it("ROT13 roundtrip", () => expect(C.rotN(C.rotN("Hello World!", 13), 13)).toBe("Hello World!"));
  it("ROT13 known value", () => expect(C.rotN("Hello", 13)).toBe("Uryyb"));
  it("ROT1 known value", () => expect(C.rotN("abc", 1)).toBe("bcd"));
});

describe("affine", () => {
  it("roundtrip", () => expect(C.affine_decrypt(C.affine_encrypt("Hello World", 5, 9), 5, 9)).toBe("Hello World"));
});

describe("atbash", () => {
  it("known value", () => expect(C.atbash_encrypt("abc")).toBe("zyx"));
  it("roundtrip (self-inverse)", () => expect(C.atbash_decrypt(C.atbash_encrypt("Hello"))).toBe("Hello"));
});

describe("rail_fence", () => {
  it("roundtrip", () => expect(C.rail_fence_decrypt(C.rail_fence_encrypt("Hello World!", 3), 3)).toBe("Hello World!"));
});

describe("substitution", () => {
  it("roundtrip uppercase", () => expect(C.substitution_decrypt(C.substitution_encrypt("HELLO"))).toBe("HELLO"));
  it("encrypt known value", () => expect(C.substitution_encrypt("HELLO")).not.toBe("HELLO"));
});

// ─── Math / Numbers ───────────────────────────────────────────────────────────

describe("arithmetic", () => {
  it("add", () => expect(C.arithmetic("10,20,30", 5, "+")).toBe("15,25,35"));
  it("multiply", () => expect(C.arithmetic("2,4", 3, "*")).toBe("6,12"));
  it("divide", () => expect(C.arithmetic("10", 2, "/")).toBe("5"));
});

describe("total", () => {
  it("sums numbers", () => expect(C.total("1 2 3 4 5")).toBe("15"));
  it("handles commas", () => expect(C.total("10,20,30")).toBe("60"));
});

describe("range", () => {
  it("generates range", () => expect(C.range("", 1, 5)).toBe("1\n2\n3\n4\n5"));
  it("with step", () => expect(C.range("", 0, 10, 2)).toBe("0\n2\n4\n6\n8\n10"));
});

describe("convert_base", () => {
  it("decimal to hex", () => expect(C.convert_base("10,255", ",", 10, 16)).toBe("a,ff"));
  it("hex to decimal", () => expect(C.convert_base("ff,0a", ",", 16, 10)).toBe("255,10"));
});

// ─── Hashing ──────────────────────────────────────────────────────────────────

describe("hashes", () => {
  it("md5 known value", () => expect(C.md5("hello")).toBe("5d41402abc4b2a76b9719d911017c592"));
  it("sha1 known value", () => expect(C.sha1("hello")).toBe("aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"));
  it("sha256 known value", () => expect(C.sha256("hello")).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"));
  it("sha384 is 96 chars", () => expect(C.sha384("hello")).toHaveLength(96));
  it("sha512 is 128 chars", () => expect(C.sha512("hello")).toHaveLength(128));
  it("sha3_256 is 64 chars", () => expect(C.sha3_256("hello")).toHaveLength(64));
  it("ripemd160 known value", () => expect(C.ripemd160("hello")).toBe("108f07b8382412612c048d07d13f814118445acd"));
});

// ─── HMAC ─────────────────────────────────────────────────────────────────────

describe("hmac", () => {
  it("hmac_sha256 known value", () => {
    expect(C.hmac_sha256("hello", "secret")).toBe("88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b");
  });
  it("hmac_sha1 length", () => expect(C.hmac_sha1("hello", "secret")).toHaveLength(40));
  it("hmac_md5", () => expect(C.hmac_md5("hello", "key")).toHaveLength(32));
  it("hmac_sha512", () => expect(C.hmac_sha512("hello", "key")).toHaveLength(128));
});

// ─── AES ──────────────────────────────────────────────────────────────────────

describe("aes", () => {
  it("ECB roundtrip", () => {
    const key = "0123456789abcdef";
    const cipher = C.aes_encrypt("hello world", key);
    expect(C.aes_decrypt(cipher, key)).toBe("hello world");
  });
  it("CBC roundtrip", () => {
    const key = "0123456789abcdef";
    const iv = "abcdef0123456789";
    const cipher = C.aes_encrypt("secret message", key, "AES/CBC/PKCS5PADDING", iv);
    expect(C.aes_decrypt(cipher, key, "AES/CBC/PKCS5PADDING", iv)).toBe("secret message");
  });
});

// ─── XOR ──────────────────────────────────────────────────────────────────────

describe("xor", () => {
  it("known value", () => {
    expect(C.xor("A", "A")).toBe("00");
  });
  it("produces hex output", () => {
    const result = C.xor("hello", "key");
    expect(result).toMatch(/^[0-9a-f]+$/);
    expect(result).toHaveLength(10);
  });
});

// ─── Compression ──────────────────────────────────────────────────────────────

describe("gzip", () => {
  it("roundtrip", () => expect(C.gzip_decompress(C.gzip_compress("Hello World!"))).toBe("Hello World!"));
  it("roundtrip long text", () => {
    const text = "aaaaaaaaaa".repeat(100);
    expect(C.gzip_decompress(C.gzip_compress(text))).toBe(text);
  });
});

describe("deflate", () => {
  it("roundtrip", () => expect(C.deflate_decompress(C.deflate_compress("Hello World!"))).toBe("Hello World!"));
});

// ─── JWT ──────────────────────────────────────────────────────────────────────

describe("jwt", () => {
  const payload = '{"sub":"1234","name":"John"}';
  const secret = "mysecret";

  it("produces 3-part token", () => {
    const token = C.jwt_sign(payload, "HS256", secret);
    expect(token.split(".")).toHaveLength(3);
  });

  it("decode payload roundtrip", () => {
    const token = C.jwt_sign(payload, "HS256", secret);
    const decoded = C.d_jwt_get_payload(token);
    expect(JSON.parse(decoded)).toEqual(JSON.parse(payload));
  });

  it("verify with correct secret", () => {
    const token = C.jwt_sign(payload, "HS256", secret);
    expect(C.d_jwt_verify(token, secret)).toBe("true");
  });

  it("verify fails with wrong secret", () => {
    const token = C.jwt_sign(payload, "HS256", secret);
    expect(C.d_jwt_verify(token, "wrongsecret")).toBe("false");
  });

  it("invalid jwt returns error marker", () => {
    expect(C.d_jwt_get_payload("notajwt")).toBe("[invalid JWT]");
  });
});

// ─── UTF7 ─────────────────────────────────────────────────────────────────────

describe("utf7", () => {
  it("roundtrip ascii", () => expect(C.d_utf7(C.utf7("hello world"))).toBe("hello world"));
  it("encodes plus sign", () => expect(C.utf7("1+1=2")).toContain("+-"));
});

// ─── PHP / SQL ────────────────────────────────────────────────────────────────

describe("php_chr", () => {
  it("known value", () => expect(C.php_chr("AB")).toBe("chr(65).chr(66)"));
});

describe("sql_hex", () => {
  it("known value", () => expect(C.sql_hex("AB")).toBe("0x4142"));
});

// ─── XSS ──────────────────────────────────────────────────────────────────────

describe("xss helpers", () => {
  it("css_expression wraps input", () => expect(C.css_expression("alert(1)")).toContain("expression(alert(1))"));
  it("eval_fromcharcode produces script tag", () => expect(C.eval_fromcharcode("hi")).toContain("<script>"));
  it("iframe_data_url contains base64", () => expect(C.iframe_data_url("<b>hi</b>")).toContain("data:text/html;base64,"));
  it("iframe_src_doc html-encodes content", () => expect(C.iframe_src_doc("<b>hi</b>")).toContain("&lt;b&gt;"));
});

// ─── Security ─────────────────────────────────────────────────────────────────

describe("bchar", () => {
  it("returns canary string", () => expect(C.bchar()).toBe('${{<%[%\'"}}%\\.'));
});

describe("canary", () => {
  it("contains bchar", () => expect(C.canary()).toContain(C.bchar()));
  it("default prefix is pastis", () => {
    const c = C.canary();
    expect(c.startsWith("pastis")).toBe(true);
    expect(c.endsWith("pastis")).toBe(true);
  });
  it("custom prefix", () => {
    const c = C.canary("myprefix");
    expect(c.startsWith("myprefix")).toBe(true);
    expect(c.endsWith("myprefix")).toBe(true);
  });
});

// ─── Random (structural checks only) ─────────────────────────────────────────

describe("random generators", () => {
  it("uuid format", () => expect(C.uuid()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  it("random_alpha_lower length", () => expect(C.random_alpha_lower(8)).toHaveLength(8));
  it("random_alpha_upper length", () => expect(C.random_alpha_upper(6)).toHaveLength(6));
  it("random_hex format", () => expect(C.random_hex(16)).toMatch(/^[0-9a-f]{16}$/));
  it("random_num digits only", () => expect(C.random_num(5)).toMatch(/^\d{5}$/));
  it("timestamp is numeric", () => expect(C.timestamp()).toMatch(/^\d+$/));
});

// ─── Variables ────────────────────────────────────────────────────────────────

describe("variables", () => {
  it("set and get", () => {
    const vars = new Map<string, string>();
    C.set_variable("foo", "bar", vars);
    expect(C.get_variable("foo", vars)).toBe("bar");
  });

  it("undefined variable returns UNDEFINED", () => {
    const vars = new Map<string, string>();
    expect(C.get_variable("missing", vars)).toBe("UNDEFINED");
  });

  it("increment_var", () => {
    const vars = new Map<string, string>();
    C.increment_var(0, "counter", vars, true);
    expect(vars.get("counter")).toBe("1");
    C.increment_var(0, "counter", vars, true);
    expect(vars.get("counter")).toBe("2");
  });

  it("decrement_var", () => {
    const vars = new Map<string, string>([["n", "10"]]);
    C.decrement_var(0, "n", vars, true);
    expect(vars.get("n")).toBe("9");
  });
});

// ─── Roundtrip combinations ───────────────────────────────────────────────────

describe("roundtrips", () => {
  const INPUTS = ["", "hello", "Hello World!", "Héllo Wörld", "1 + 1 = 2", "a & b < c > d", "line1\nline2"];

  for (const input of INPUTS) {
    it(`base64 roundtrip: ${JSON.stringify(input)}`, () => expect(C.d_base64(C.base64(input))).toBe(input));
    it(`base64url roundtrip: ${JSON.stringify(input)}`, () => expect(C.d_base64url(C.base64url(input))).toBe(input));
    it(`urlencode roundtrip: ${JSON.stringify(input)}`, () => expect(C.d_url(C.urlencode(input))).toBe(input));
    it(`html_entities roundtrip: ${JSON.stringify(input)}`, () => expect(C.d_html_entities(C.html_entities(input))).toBe(input));
    it(`rotN13 roundtrip: ${JSON.stringify(input)}`, () => expect(C.rotN(C.rotN(input, 13), 13)).toBe(input));
  }

  const ASCII_INPUTS = ["hello", "Hello World!", "abc 123"];
  for (const input of ASCII_INPUTS) {
    it(`base32 roundtrip: ${JSON.stringify(input)}`, () => expect(C.d_base32(C.base32(input))).toBe(input));
    it(`gzip roundtrip: ${JSON.stringify(input)}`, () => expect(C.gzip_decompress(C.gzip_compress(input))).toBe(input));
    it(`saml roundtrip: ${JSON.stringify(input)}`, () => expect(C.d_saml(C.saml(input))).toBe(input));
  }
});
