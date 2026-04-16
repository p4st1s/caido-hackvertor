import { parse, HVElement } from "./parser";
import * as C from "./converters";

type TagHandler = (input: string, args: string[], variables: Map<string, string>) => string;

const REGISTRY: Record<string, TagHandler> = {
  base64: (i) => C.base64(i),
  d_base64: (i) => C.d_base64(i),
  base64url: (i) => C.base64url(i),
  d_base64url: (i) => C.d_base64url(i),
  base32: (i) => C.base32(i),
  d_base32: (i) => C.d_base32(i),
  base58: (i) => C.base58(i),
  d_base58: (i) => C.d_base58(i),

  hex: (i, a) => C.hex(i, a[0] ?? ""),
  hex_entities: (i) => C.hex_entities(i),
  hex_escapes: (i) => C.hex_escapes(i),
  dec_entities: (i) => C.dec_entities(i),
  octal_escapes: (i) => C.octal_escapes(i),
  d_octal_escapes: (i) => C.d_octal_escapes(i),
  unicode_escapes: (i) => C.unicode_escapes(i),
  d_unicode_escapes: (i) => C.decode_js_string(i),
  css_escapes: (i) => C.css_escapes(i),
  css_escapes6: (i) => C.css_escapes6(i),
  d_css_escapes: (i) => C.d_css_escapes(i),

  html_entities: (i) => C.html_entities(i),
  html5_entities: (i) => C.html5_entities(i),
  d_html_entities: (i) => C.d_html_entities(i),
  d_html5_entities: (i) => C.d_html5_entities(i),

  urlencode: (i) => C.urlencode(i),
  urlencode_not_plus: (i) => C.urlencode_not_plus(i),
  urlencode_all: (i) => C.urlencode_all(i),
  burp_urlencode: (i) => C.burp_urlencode(i),
  d_url: (i) => C.d_url(i),
  d_burp_url: (i) => C.d_burp_url(i),

  js_string: (i) => C.js_string(i),
  d_js_string: (i) => C.decode_js_string(i),
  powershell: (i) => C.powershell(i),
  quoted_printable: (i) => C.quoted_printable(i),
  d_quoted_printable: (i) => C.d_quoted_printable(i),
  php_chr: (i) => C.php_chr(i),
  sql_hex: (i) => C.sql_hex(i),
  saml: (i) => C.saml(i),
  d_saml: (i) => C.d_saml(i),
  utf7: (i, a) => C.utf7(i, a[0] ?? ""),
  d_utf7: (i) => C.d_utf7(i),
  unicode_alternatives: (i) => C.unicode_alternatives(i),

  ascii2hex: (i, a) => C.ascii2hex(i, a[0] ?? ""),
  hex2ascii: (i) => C.hex2ascii(i),
  ascii2bin: (i) => C.ascii2bin(i),
  bin2ascii: (i) => C.bin2ascii(i),
  ascii2reverse_hex: (i, a) => C.ascii2reverse_hex(i, a[0] ?? ""),
  hex2dec: (i, a) => C.hex2dec(i, a[0]),
  dec2hex: (i, a) => C.dec2hex(i, a[0]),
  dec2oct: (i, a) => C.dec2oct(i, a[0]),
  oct2dec: (i, a) => C.oct2dec(i, a[0]),
  dec2bin: (i, a) => C.dec2bin(i, a[0]),
  bin2dec: (i, a) => C.bin2dec(i, a[0]),
  chunked_dec2hex: (i) => C.chunked_dec2hex(i),
  to_charcode: (i) => C.to_charcode(i),
  from_charcode: (i) => C.from_charcode(i),
  convert_base: (i, a) => C.convert_base(i, a[0] ?? ",", parseInt(a[1] ?? "10"), parseInt(a[2] ?? "16")),

  uppercase: (i) => C.uppercase(i),
  lowercase: (i) => C.lowercase(i),
  capitalise: (i) => C.capitalise(i),
  reverse: (i) => C.reverse(i),
  unique: (i) => C.unique(i),
  length: (i) => C.len(i),
  space: () => " ",
  newline: () => "\n",
  remove_output: () => "",
  remove_newlines: (i) => C.remove_newlines(i),
  find: (i, a) => C.find(i, a[0] ?? "", parseInt(a[1] ?? "-1")),
  replace: (i, a) => C.replace(i, a[0] ?? "", a[1] ?? ""),
  regex_replace: (i, a) => C.regex_replace(i, a[0] ?? "", a[1] ?? ""),
  repeat: (i, a) => C.repeat(i, parseInt(a[0] ?? "1")),
  substring: (i, a) => C.substring(i, parseInt(a[0] ?? "0"), parseInt(a[1] ?? i.length.toString())),
  split_join: (i, a) => C.split_join(i, a[0] ?? " ", a[1] ?? ""),
  zeropad: (i, a) => C.zeropad(i, a[0] ?? ",", parseInt(a[1] ?? "2")),

  if_regex: (i, a) => C.if_regex(i, a[0] ?? "", a[1] ?? ""),
  if_not_regex: (i, a) => C.if_not_regex(i, a[0] ?? "", a[1] ?? ""),

  uuid: () => C.uuid(),
  timestamp: () => C.timestamp(),
  date: (_i, a) => C.date(a[0] ?? "yyyy-MM-dd HH:mm:ss", a[1] ?? "UTC"),

  range: (i, a) => C.range(i, parseInt(a[0] ?? "0"), parseInt(a[1] ?? "100"), parseInt(a[2] ?? "1")),
  total: (i) => C.total(i),
  arithmetic: (i, a) => C.arithmetic(i, parseInt(a[0] ?? "0"), a[1] ?? "+", a[2] ?? ","),
  convert_base_math: (i, a) => C.convert_base(i, a[0] ?? ",", parseInt(a[1] ?? "10"), parseInt(a[2] ?? "16")),
  random: (i, a) => C.random(i, parseInt(a[0] ?? "10"), (a[1] ?? "false") === "true"),
  random_alpha_lower: (_i, a) => C.random_alpha_lower(parseInt(a[0] ?? "10")),
  random_alpha_upper: (_i, a) => C.random_alpha_upper(parseInt(a[0] ?? "10")),
  random_alpha_mixed: (_i, a) => C.random_alpha_mixed(parseInt(a[0] ?? "10")),
  random_alphanum_lower: (_i, a) => C.random_alphanum_lower(parseInt(a[0] ?? "10")),
  random_alphanum_upper: (_i, a) => C.random_alphanum_upper(parseInt(a[0] ?? "10")),
  random_alphanum_mixed: (_i, a) => C.random_alphanum_mixed(parseInt(a[0] ?? "10")),
  random_hex: (_i, a) => C.random_hex(parseInt(a[0] ?? "10")),
  random_hex_mixed: (_i, a) => C.random_hex_mixed(parseInt(a[0] ?? "10")),
  random_num: (_i, a) => C.random_num(parseInt(a[0] ?? "10")),
  random_unicode: (_i, a) => C.random_unicode(parseInt(a[0] ?? "0"), parseInt(a[1] ?? "65535"), parseInt(a[2] ?? "10")),

  md5: (i) => C.md5(i),
  sha1: (i) => C.sha1(i),
  sha224: (i) => C.sha224(i),
  sha256: (i) => C.sha256(i),
  sha384: (i) => C.sha384(i),
  sha512: (i) => C.sha512(i),
  sha3: (i) => C.sha3(i),
  sha3_224: (i) => C.sha3_224(i),
  sha3_256: (i) => C.sha3_256(i),
  sha3_384: (i) => C.sha3_384(i),
  sha3_512: (i) => C.sha3_512(i),
  ripemd160: (i) => C.ripemd160(i),

  hmac_md5: (i, a) => C.hmac_md5(i, a[0] ?? ""),
  hmac_sha1: (i, a) => C.hmac_sha1(i, a[0] ?? ""),
  hmac_sha224: (i, a) => C.hmac_sha224(i, a[0] ?? ""),
  hmac_sha256: (i, a) => C.hmac_sha256(i, a[0] ?? ""),
  hmac_sha384: (i, a) => C.hmac_sha384(i, a[0] ?? ""),
  hmac_sha512: (i, a) => C.hmac_sha512(i, a[0] ?? ""),

  aes_encrypt: (i, a) => C.aes_encrypt(i, a[0] ?? "", a[1] ?? "AES/ECB/PKCS5PADDING", a[2] ?? ""),
  aes_decrypt: (i, a) => C.aes_decrypt(i, a[0] ?? "", a[1] ?? "AES/ECB/PKCS5PADDING", a[2] ?? ""),
  xor: (i, a) => C.xor(i, a[0] ?? ""),
  xor_decrypt: (i, a) => C.xor_decrypt(i, parseInt(a[0] ?? "3")),
  xor_getkey: (i) => C.xor_getkey(i),
  rotn: (i, a) => C.rotN(i, parseInt(a[0] ?? "13")),
  rotn_bruteforce: (i) => C.rotN_bruteforce(i),
  affine_encrypt: (i, a) => C.affine_encrypt(i, parseInt(a[0] ?? "5"), parseInt(a[1] ?? "9")),
  affine_decrypt: (i, a) => C.affine_decrypt(i, parseInt(a[0] ?? "5"), parseInt(a[1] ?? "9")),
  atbash_encrypt: (i) => C.atbash_encrypt(i),
  atbash_decrypt: (i) => C.atbash_decrypt(i),
  rail_fence_encrypt: (i, a) => C.rail_fence_encrypt(i, parseInt(a[0] ?? "4")),
  rail_fence_decrypt: (i, a) => C.rail_fence_decrypt(i, parseInt(a[0] ?? "4")),
  substitution_encrypt: (i, a) => C.substitution_encrypt(i, a[0]),
  substitution_decrypt: (i, a) => C.substitution_decrypt(i, a[0]),

  gzip_compress: (i) => C.gzip_compress(i),
  gzip_decompress: (i) => C.gzip_decompress(i),
  deflate_compress: (i, a) => C.deflate_compress(i, a[0] ?? "fixed"),
  deflate_decompress: (i) => C.deflate_decompress(i),
  jwt: (i, a) => C.jwt_sign(i, a[0] ?? "HS256", a[1] ?? "secret"),
  d_jwt_get_payload: (i) => C.d_jwt_get_payload(i),
  d_jwt_get_header: (i) => C.d_jwt_get_header(i),
  d_jwt_verify: (i, a) => C.d_jwt_verify(i, a[0] ?? "secret"),

  json_parse: (i, a) => C.json_parse(i, a[0] ?? ""),

  css_expression: (i) => C.css_expression(i),
  eval_fromcharcode: (i) => C.eval_fromcharcode(i),
  iframe_data_url: (i) => C.iframe_data_url(i),
  iframe_src_doc: (i) => C.iframe_src_doc(i),
  script_data: (i) => C.script_data(i),
  uppercase_script: (i) => C.uppercase_script(i),
  template_eval: (i) => C.template_eval(i),
  throw_eval: (i) => C.throw_eval(i),

  bchar: () => C.bchar(),
  canary: (_i, a) => C.canary(a[0]),
  c: (_i, a) => C.canary(a[0]),

  fake_email: (_i, a) => C.fake_email(a[0]),
  fake_username: (_i, a) => C.fake_username(a[0]),
  fake_firstname: (_i, a) => C.fake_firstname(a[0]),
  fake_lastname: (_i, a) => C.fake_lastname(a[0]),
  fake_fullname: (_i, a) => C.fake_fullname(a[0]),
  fake_phone: (_i, a) => C.fake_phone(a[0]),
  fake_url: (_i, a) => C.fake_url(a[0]),
  fake_ip: (_i, a) => C.fake_ip(a[0]),
  fake_ipv6: (_i, a) => C.fake_ipv6(a[0]),
  fake_mac: (_i, a) => C.fake_mac(a[0]),
  fake_uuid: (_i, a) => C.fake_uuid(a[0]),
  fake_password: (_i, a) => C.fake_password(a[0]),
  fake_useragent: (_i, a) => C.fake_useragent(a[0]),
  fake_company: (_i, a) => C.fake_company(a[0]),
  fake_street: (_i, a) => C.fake_street(a[0]),
  fake_city: (_i, a) => C.fake_city(a[0]),
  fake_country: (_i, a) => C.fake_country(a[0]),
  fake_zipcode: (_i, a) => C.fake_zipcode(a[0]),
  fake_creditcard: (_i, a) => C.fake_creditcard(a[0]),
  fake_iban: (_i, a) => C.fake_iban(a[0]),
  fake_color: (_i, a) => C.fake_color(a[0]),
  fake_word: (_i, a) => C.fake_word(a[0]),
  fake_sentence: (_i, a) => C.fake_sentence(a[0]),
  fake_paragraph: (_i, a) => C.fake_paragraph(a[0]),

  javascript: (i, a) => {
    const code = a[0] ?? "output = input";
    try {
      const fn = new Function("input", `let output = input; ${code}; return output;`);
      return String(fn(i));
    } catch (e) {
      throw new Error(`JS error: ${e}`);
    }
  },
};

function callTag(name: string, input: string, args: string[], variables: Map<string, string>): string {
  const handler = REGISTRY[name];
  if (handler) {
    try {
      return handler(input, args, variables);
    } catch (e) {
      throw new Error(`Tag "${name}" failed: ${e}`);
    }
  }

  if (name.startsWith("set_")) {
    const varName = name.slice(4);
    return C.set_variable(varName, input, variables, (args[0] ?? "false") === "true");
  }
  if (name === "set" || name === "set_var" || name === "set_variable") {
    return C.set_variable(args[0] ?? "var", input, variables, (args[1] ?? "false") === "true");
  }
  if (name.startsWith("get_")) {
    const varName = name.slice(4);
    return variables.get(varName) ?? input;
  }
  if (name === "get" || name === "get_var" || name === "get_variable") {
    return C.get_variable(args[0] ?? "var", variables);
  }
  if (name.startsWith("real_")) {
    return args[0] ?? "";
  }

  if (name === "increment_var") {
    return C.increment_var(parseInt(args[0] ?? "0"), args[1] ?? "var", variables, (args[2] ?? "false") === "true");
  }
  if (name === "decrement_var") {
    return C.decrement_var(parseInt(args[0] ?? "0"), args[1] ?? "var", variables, (args[2] ?? "false") === "true");
  }

  throw new Error(`Unknown tag: "${name}"`);
}

function processQueue(elements: HVElement[], variables: Map<string, string>): string {
  const stack: Array<{ el: HVElement; buffer: string }> = [];
  let currentBuffer = "";

  for (const el of elements) {
    if (el.type === "text") {
      currentBuffer += el.content;
    } else if (el.type === "selfclose") {
      currentBuffer += callTag(el.name, "", el.args, variables);
    } else if (el.type === "start") {
      stack.push({ el, buffer: currentBuffer });
      currentBuffer = "";
    } else if (el.type === "end") {
      if (stack.length === 0) {
        currentBuffer += `</@${el.name}>`;
        continue;
      }
      let frame = stack.pop()!;
      while (stack.length > 0 &&
        (frame.el.type !== "start" || (frame.el as { name: string }).name !== el.name)) {
        const parentFrame = stack.pop()!;
        currentBuffer = frame.buffer + (frame.el as unknown as { toString(): string }).toString?.() + currentBuffer;
        frame = parentFrame;
      }
      if (frame.el.type === "start" && frame.el.name === el.name) {
        const result = callTag(el.name, currentBuffer, frame.el.args, variables);
        currentBuffer = frame.buffer + result;
      } else {
        currentBuffer = frame.buffer + currentBuffer + `</@${el.name}>`;
      }
    }
  }

  return currentBuffer;
}

export function convert(input: string): string {
  const variables = new Map<string, string>();
  const elements = parse(input);
  return processQueue(elements, variables);
}

export function convertWithVars(input: string, variables: Map<string, string>): string {
  const elements = parse(input);
  return processQueue(elements, variables);
}
