export interface TagArg {
  type: "string" | "int" | "boolean";
  default: string;
  label: string;
}

export interface TagDef {
  name: string;
  category: string;
  hasInput: boolean;
  args: TagArg[];
}

export const CATEGORIES = [
  "Encode", "Decode", "Hash", "HMAC", "Encrypt", "Decrypt",
  "Compress", "Convert", "String", "Math", "XSS", "Variables", "Languages", "Fake", "Real", "Security",
];

export const TAGS: TagDef[] = [
  // Encode
  { name: "base64", category: "Encode", hasInput: true, args: [] },
  { name: "base64url", category: "Encode", hasInput: true, args: [] },
  { name: "base32", category: "Encode", hasInput: true, args: [] },
  { name: "base58", category: "Encode", hasInput: true, args: [] },
  { name: "hex", category: "Encode", hasInput: true, args: [{ type: "string", default: "", label: "separator" }] },
  { name: "hex_entities", category: "Encode", hasInput: true, args: [] },
  { name: "hex_escapes", category: "Encode", hasInput: true, args: [] },
  { name: "dec_entities", category: "Encode", hasInput: true, args: [] },
  { name: "octal_escapes", category: "Encode", hasInput: true, args: [] },
  { name: "unicode_escapes", category: "Encode", hasInput: true, args: [] },
  { name: "css_escapes", category: "Encode", hasInput: true, args: [] },
  { name: "css_escapes6", category: "Encode", hasInput: true, args: [] },
  { name: "html_entities", category: "Encode", hasInput: true, args: [] },
  { name: "html5_entities", category: "Encode", hasInput: true, args: [] },
  { name: "urlencode", category: "Encode", hasInput: true, args: [] },
  { name: "urlencode_not_plus", category: "Encode", hasInput: true, args: [] },
  { name: "urlencode_all", category: "Encode", hasInput: true, args: [] },
  { name: "burp_urlencode", category: "Encode", hasInput: true, args: [] },
  { name: "js_string", category: "Encode", hasInput: true, args: [] },
  { name: "powershell", category: "Encode", hasInput: true, args: [] },
  { name: "quoted_printable", category: "Encode", hasInput: true, args: [] },
  { name: "php_chr", category: "Encode", hasInput: true, args: [] },
  { name: "sql_hex", category: "Encode", hasInput: true, args: [] },
  { name: "saml", category: "Encode", hasInput: true, args: [] },
  { name: "utf7", category: "Encode", hasInput: true, args: [] },
  { name: "unicode_alternatives", category: "Encode", hasInput: true, args: [] },
  { name: "jwt", category: "Encode", hasInput: true, args: [
    { type: "string", default: "HS256", label: "algo" },
    { type: "string", default: "secret", label: "key" },
  ]},

  // Decode
  { name: "d_base64", category: "Decode", hasInput: true, args: [] },
  { name: "d_base64url", category: "Decode", hasInput: true, args: [] },
  { name: "d_base32", category: "Decode", hasInput: true, args: [] },
  { name: "d_base58", category: "Decode", hasInput: true, args: [] },
  { name: "d_html_entities", category: "Decode", hasInput: true, args: [] },
  { name: "d_html5_entities", category: "Decode", hasInput: true, args: [] },
  { name: "d_url", category: "Decode", hasInput: true, args: [] },
  { name: "d_burp_url", category: "Decode", hasInput: true, args: [] },
  { name: "d_js_string", category: "Decode", hasInput: true, args: [] },
  { name: "d_unicode_escapes", category: "Decode", hasInput: true, args: [] },
  { name: "d_octal_escapes", category: "Decode", hasInput: true, args: [] },
  { name: "d_css_escapes", category: "Decode", hasInput: true, args: [] },
  { name: "d_quoted_printable", category: "Decode", hasInput: true, args: [] },
  { name: "d_saml", category: "Decode", hasInput: true, args: [] },
  { name: "d_utf7", category: "Decode", hasInput: true, args: [] },
  { name: "d_jwt_get_payload", category: "Decode", hasInput: true, args: [] },
  { name: "d_jwt_get_header", category: "Decode", hasInput: true, args: [] },
  { name: "d_jwt_verify", category: "Decode", hasInput: true, args: [{ type: "string", default: "secret", label: "key" }] },

  // Hash
  { name: "md5", category: "Hash", hasInput: true, args: [] },
  { name: "sha1", category: "Hash", hasInput: true, args: [] },
  { name: "sha224", category: "Hash", hasInput: true, args: [] },
  { name: "sha256", category: "Hash", hasInput: true, args: [] },
  { name: "sha384", category: "Hash", hasInput: true, args: [] },
  { name: "sha512", category: "Hash", hasInput: true, args: [] },
  { name: "sha3", category: "Hash", hasInput: true, args: [] },
  { name: "sha3_224", category: "Hash", hasInput: true, args: [] },
  { name: "sha3_256", category: "Hash", hasInput: true, args: [] },
  { name: "sha3_384", category: "Hash", hasInput: true, args: [] },
  { name: "sha3_512", category: "Hash", hasInput: true, args: [] },
  { name: "ripemd160", category: "Hash", hasInput: true, args: [] },

  // HMAC
  { name: "hmac_md5", category: "HMAC", hasInput: true, args: [{ type: "string", default: "SECRET", label: "key" }] },
  { name: "hmac_sha1", category: "HMAC", hasInput: true, args: [{ type: "string", default: "SECRET", label: "key" }] },
  { name: "hmac_sha224", category: "HMAC", hasInput: true, args: [{ type: "string", default: "SECRET", label: "key" }] },
  { name: "hmac_sha256", category: "HMAC", hasInput: true, args: [{ type: "string", default: "SECRET", label: "key" }] },
  { name: "hmac_sha384", category: "HMAC", hasInput: true, args: [{ type: "string", default: "SECRET", label: "key" }] },
  { name: "hmac_sha512", category: "HMAC", hasInput: true, args: [{ type: "string", default: "SECRET", label: "key" }] },

  // Encrypt
  { name: "aes_encrypt", category: "Encrypt", hasInput: true, args: [
    { type: "string", default: "supersecret12356", label: "key" },
    { type: "string", default: "AES/ECB/PKCS5PADDING", label: "mode" },
    { type: "string", default: "", label: "iv" },
  ]},
  { name: "rotN", category: "Encrypt", hasInput: true, args: [{ type: "int", default: "13", label: "n" }] },
  { name: "xor", category: "Encrypt", hasInput: true, args: [{ type: "string", default: "key", label: "key" }] },
  { name: "affine_encrypt", category: "Encrypt", hasInput: true, args: [
    { type: "int", default: "5", label: "a" },
    { type: "int", default: "9", label: "b" },
  ]},
  { name: "atbash_encrypt", category: "Encrypt", hasInput: true, args: [] },
  { name: "rail_fence_encrypt", category: "Encrypt", hasInput: true, args: [{ type: "int", default: "4", label: "rails" }] },
  { name: "substitution_encrypt", category: "Encrypt", hasInput: true, args: [{ type: "string", default: "phqgiumeaylnofdxjkrcvstzwb", label: "key" }] },
  { name: "rotN_bruteforce", category: "Encrypt", hasInput: true, args: [] },

  // Decrypt
  { name: "aes_decrypt", category: "Decrypt", hasInput: true, args: [
    { type: "string", default: "supersecret12356", label: "key" },
    { type: "string", default: "AES/ECB/PKCS5PADDING", label: "mode" },
    { type: "string", default: "", label: "iv" },
  ]},
  { name: "xor_decrypt", category: "Decrypt", hasInput: true, args: [{ type: "int", default: "3", label: "keyLen" }] },
  { name: "xor_getkey", category: "Decrypt", hasInput: true, args: [] },
  { name: "affine_decrypt", category: "Decrypt", hasInput: true, args: [
    { type: "int", default: "5", label: "a" },
    { type: "int", default: "9", label: "b" },
  ]},
  { name: "atbash_decrypt", category: "Decrypt", hasInput: true, args: [] },
  { name: "rail_fence_decrypt", category: "Decrypt", hasInput: true, args: [{ type: "int", default: "4", label: "rails" }] },
  { name: "substitution_decrypt", category: "Decrypt", hasInput: true, args: [{ type: "string", default: "phqgiumeaylnofdxjkrcvstzwb", label: "key" }] },

  // Compress
  { name: "gzip_compress", category: "Compress", hasInput: true, args: [] },
  { name: "gzip_decompress", category: "Compress", hasInput: true, args: [] },
  { name: "deflate_compress", category: "Compress", hasInput: true, args: [{ type: "string", default: "fixed", label: "type" }] },
  { name: "deflate_decompress", category: "Compress", hasInput: true, args: [] },

  // Convert
  { name: "hex2dec", category: "Convert", hasInput: true, args: [] },
  { name: "dec2hex", category: "Convert", hasInput: true, args: [] },
  { name: "dec2oct", category: "Convert", hasInput: true, args: [] },
  { name: "oct2dec", category: "Convert", hasInput: true, args: [] },
  { name: "dec2bin", category: "Convert", hasInput: true, args: [] },
  { name: "bin2dec", category: "Convert", hasInput: true, args: [] },
  { name: "ascii2hex", category: "Convert", hasInput: true, args: [{ type: "string", default: "", label: "sep" }] },
  { name: "ascii2reverse_hex", category: "Convert", hasInput: true, args: [{ type: "string", default: "", label: "sep" }] },
  { name: "hex2ascii", category: "Convert", hasInput: true, args: [] },
  { name: "ascii2bin", category: "Convert", hasInput: true, args: [] },
  { name: "bin2ascii", category: "Convert", hasInput: true, args: [] },
  { name: "chunked_dec2hex", category: "Convert", hasInput: true, args: [] },
  { name: "to_charcode", category: "Convert", hasInput: true, args: [] },
  { name: "from_charcode", category: "Convert", hasInput: true, args: [] },
  { name: "convert_base", category: "Convert", hasInput: true, args: [
    { type: "string", default: ",", label: "split" },
    { type: "int", default: "10", label: "from" },
    { type: "int", default: "16", label: "to" },
  ]},

  // String
  { name: "uppercase", category: "String", hasInput: true, args: [] },
  { name: "lowercase", category: "String", hasInput: true, args: [] },
  { name: "capitalise", category: "String", hasInput: true, args: [] },
  { name: "reverse", category: "String", hasInput: true, args: [] },
  { name: "length", category: "String", hasInput: true, args: [] },
  { name: "unique", category: "String", hasInput: true, args: [] },
  { name: "remove_newlines", category: "String", hasInput: true, args: [] },
  { name: "space", category: "String", hasInput: false, args: [] },
  { name: "newline", category: "String", hasInput: false, args: [] },
  { name: "find", category: "String", hasInput: true, args: [
    { type: "string", default: "regex", label: "regex" },
    { type: "int", default: "-1", label: "group" },
  ]},
  { name: "replace", category: "String", hasInput: true, args: [
    { type: "string", default: "find", label: "find" },
    { type: "string", default: "replace", label: "replace" },
  ]},
  { name: "regex_replace", category: "String", hasInput: true, args: [
    { type: "string", default: "find", label: "regex" },
    { type: "string", default: "replace", label: "replace" },
  ]},
  { name: "repeat", category: "String", hasInput: true, args: [{ type: "int", default: "3", label: "n" }] },
  { name: "substring", category: "String", hasInput: true, args: [
    { type: "int", default: "0", label: "start" },
    { type: "int", default: "10", label: "end" },
  ]},
  { name: "split_join", category: "String", hasInput: true, args: [
    { type: "string", default: " ", label: "split" },
    { type: "string", default: "", label: "join" },
  ]},
  { name: "zeropad", category: "String", hasInput: true, args: [
    { type: "string", default: ",", label: "split" },
    { type: "int", default: "2", label: "pad" },
  ]},
  { name: "if_regex", category: "String", hasInput: true, args: [
    { type: "string", default: "regex", label: "regex" },
    { type: "string", default: "value", label: "value" },
  ]},
  { name: "if_not_regex", category: "String", hasInput: true, args: [
    { type: "string", default: "regex", label: "regex" },
    { type: "string", default: "value", label: "value" },
  ]},

  // Math
  { name: "uuid", category: "Math", hasInput: false, args: [] },
  { name: "timestamp", category: "Math", hasInput: false, args: [] },
  { name: "date", category: "Math", hasInput: false, args: [
    { type: "string", default: "yyyy-MM-dd HH:mm:ss", label: "format" },
    { type: "string", default: "UTC", label: "tz" },
  ]},
  { name: "range", category: "Math", hasInput: false, args: [
    { type: "int", default: "0", label: "from" },
    { type: "int", default: "100", label: "to" },
    { type: "int", default: "1", label: "step" },
  ]},
  { name: "total", category: "Math", hasInput: true, args: [] },
  { name: "arithmetic", category: "Math", hasInput: true, args: [
    { type: "int", default: "10", label: "amount" },
    { type: "string", default: "+", label: "op" },
    { type: "string", default: ",", label: "split" },
  ]},
  { name: "random", category: "Math", hasInput: true, args: [
    { type: "int", default: "10", label: "len" },
    { type: "boolean", default: "false", label: "unique" },
  ]},
  { name: "random_alpha_lower", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_alpha_upper", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_alpha_mixed", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_alphanum_lower", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_alphanum_upper", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_alphanum_mixed", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_hex", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_hex_mixed", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_num", category: "Math", hasInput: false, args: [{ type: "int", default: "10", label: "len" }] },
  { name: "random_unicode", category: "Math", hasInput: false, args: [
    { type: "int", default: "0", label: "from" },
    { type: "int", default: "65535", label: "to" },
    { type: "int", default: "10", label: "len" },
  ]},

  // XSS
  { name: "eval_fromcharcode", category: "XSS", hasInput: true, args: [] },
  { name: "iframe_data_url", category: "XSS", hasInput: true, args: [] },
  { name: "iframe_src_doc", category: "XSS", hasInput: true, args: [] },
  { name: "script_data", category: "XSS", hasInput: true, args: [] },
  { name: "uppercase_script", category: "XSS", hasInput: true, args: [] },
  { name: "template_eval", category: "XSS", hasInput: true, args: [] },
  { name: "throw_eval", category: "XSS", hasInput: true, args: [] },
  { name: "css_expression", category: "XSS", hasInput: true, args: [] },

  // Variables
  { name: "set_variable", category: "Variables", hasInput: true, args: [
    { type: "string", default: "myvar", label: "name" },
    { type: "boolean", default: "false", label: "global" },
  ]},
  { name: "get_variable", category: "Variables", hasInput: false, args: [
    { type: "string", default: "myvar", label: "name" },
  ]},
  { name: "increment_var", category: "Variables", hasInput: false, args: [
    { type: "int", default: "0", label: "start" },
    { type: "string", default: "var", label: "name" },
    { type: "boolean", default: "false", label: "enabled" },
  ]},
  { name: "decrement_var", category: "Variables", hasInput: false, args: [
    { type: "int", default: "0", label: "start" },
    { type: "string", default: "var", label: "name" },
    { type: "boolean", default: "false", label: "enabled" },
  ]},

  // Custom JS
  { name: "javascript", category: "Languages", hasInput: true, args: [
    { type: "string", default: "output = input.toUpperCase()", label: "code" },
  ]},

  // Fake
  { name: "fake_email", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_username", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_firstname", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_lastname", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_fullname", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_phone", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_url", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_ip", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_ipv6", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_mac", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_uuid", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_password", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_useragent", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_company", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_street", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_city", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_country", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_zipcode", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_creditcard", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_iban", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_color", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_word", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_sentence", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },
  { name: "fake_paragraph", category: "Fake", hasInput: false, args: [{ type: "string", default: "", label: "locale" }] },

  // Real
  { name: "real_email", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_username", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_firstname", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_lastname", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_fullname", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_phone", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_company", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_url", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_ip", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_street", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_city", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_country", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },
  { name: "real_zipcode", category: "Real", hasInput: false, args: [{ type: "string", default: "", label: "value" }] },

  // Security
  { name: "bchar", category: "Security", hasInput: false, args: [] },
  { name: "canary", category: "Security", hasInput: false, args: [{ type: "string", default: "pastis", label: "prefix" }] },
  { name: "c", category: "Security", hasInput: false, args: [{ type: "string", default: "pastis", label: "prefix" }] },
];

export function buildTag(tag: TagDef, argValues?: string[]): string {
  const args = (argValues ?? tag.args.map(a => a.default));
  const argStr = args.length ? `(${args.map(a => `"${a}"`).join(",")})` : "";
  if (tag.hasInput) {
    return `<@${tag.name}${argStr}>CONTENT</@${tag.name}>`;
  }
  return `<@${tag.name}${argStr}/>`;
}
