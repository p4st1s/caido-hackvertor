# Hackvertor for Caido

Tag-based data transformation plugin for [Caido](https://caido.io). Wrap any text in request editors with transformation tags — they get processed transparently before the request is sent.

Made by [p4st1s](https://github.com/p4st1s) @ [Offenskill](https://offenskill.com).

## Syntax

```
<@tag_name>content</@tag_name>
<@tag_name("arg1","arg2")>content</@tag_name>
<@tag_name/>                          (no-input tags)
```

Tags can be **nested** — innermost is processed first:

```
<@urlencode><@base64>hello</@base64></@urlencode>
```

## Usage

- **Ctrl+H** in Replay editor → search dialog → select a tag
- **Right-click** on selected text → Hackvertor → search tags
- **Sidebar panel** → Hackvertor page → interactive input/output

---

## Tag Reference

### Encode

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@base64>` | — | Base64 encode |
| `<@base64url>` | — | Base64url encode (URL-safe, no padding) |
| `<@base32>` | — | Base32 encode |
| `<@base58>` | — | Base58 encode |
| `<@hex>` | `sep=" "` | Hex bytes, space-separated by default — use `<@hex("")>` for no separator |
| `<@hex_entities>` | — | Hex HTML entities `&#x61;` |
| `<@hex_escapes>` | — | Hex escape sequences `\x61` |
| `<@dec_entities>` | — | Decimal HTML entities `&#97;` |
| `<@octal_escapes>` | — | Octal escape sequences `\141` |
| `<@unicode_escapes>` | — | Unicode escapes `\u0061` |
| `<@css_escapes>` | — | CSS escape sequences `\61 ` |
| `<@css_escapes6>` | — | CSS 6-digit escape sequences `\000061` |
| `<@html_entities>` | — | HTML entities for special chars |
| `<@html5_entities>` | — | HTML5 named entities |
| `<@urlencode>` | — | URL encode (spaces as `+`) |
| `<@urlencode_not_plus>` | — | URL encode (spaces as `%20`) |
| `<@urlencode_all>` | — | URL encode every character |
| `<@burp_urlencode>` | — | Burp-style URL encode (key chars only) |
| `<@js_string>` | — | JavaScript string escape |
| `<@powershell>` | — | PowerShell string escape / encoding |
| `<@quoted_printable>` | — | Quoted-Printable encoding |
| `<@php_chr>` | — | PHP `chr()` concatenation |
| `<@sql_hex>` | — | SQL hex notation `0x61` |
| `<@saml>` | — | SAML encode (deflate + base64) |
| `<@utf7>` | — | UTF-7 encode |
| `<@unicode_alternatives>` | — | Unicode lookalike characters |
| `<@jwt("HS256","secret")>` | `algo`, `key` | Sign a JSON payload as JWT |

### Decode

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@d_base64>` | — | Base64 decode |
| `<@d_base64url>` | — | Base64url decode |
| `<@d_base32>` | — | Base32 decode |
| `<@d_base58>` | — | Base58 decode |
| `<@d_html_entities>` | — | HTML entities decode |
| `<@d_html5_entities>` | — | HTML5 entities decode |
| `<@d_url>` | — | URL decode |
| `<@d_burp_url>` | — | Burp URL decode |
| `<@d_js_string>` | — | JavaScript string unescape |
| `<@d_unicode_escapes>` | — | Unicode escapes decode |
| `<@d_octal_escapes>` | — | Octal escapes decode |
| `<@d_css_escapes>` | — | CSS escapes decode |
| `<@d_quoted_printable>` | — | Quoted-Printable decode |
| `<@d_saml>` | — | SAML decode (base64 + inflate) |
| `<@d_utf7>` | — | UTF-7 decode |
| `<@d_jwt_get_payload>` | — | Extract JWT payload (decoded JSON) |
| `<@d_jwt_get_header>` | — | Extract JWT header (decoded JSON) |
| `<@d_jwt_verify("secret")>` | `key` | Verify JWT signature, returns payload or error |

### Hash

| Tag | Description |
|-----|-------------|
| `<@md5>` | MD5 hash (hex) |
| `<@sha1>` | SHA-1 hash (hex) |
| `<@sha224>` | SHA-224 hash (hex) |
| `<@sha256>` | SHA-256 hash (hex) |
| `<@sha384>` | SHA-384 hash (hex) |
| `<@sha512>` | SHA-512 hash (hex) |
| `<@sha3>` | SHA-3 512 hash (hex) |
| `<@sha3_224>` | SHA-3 224 hash (hex) |
| `<@sha3_256>` | SHA-3 256 hash (hex) |
| `<@sha3_384>` | SHA-3 384 hash (hex) |
| `<@sha3_512>` | SHA-3 512 hash (hex) |
| `<@ripemd160>` | RIPEMD-160 hash (hex) |

### HMAC

All HMAC tags take a `key` argument and output hex.

| Tag | Arguments |
|-----|-----------|
| `<@hmac_md5("SECRET")>` | `key` |
| `<@hmac_sha1("SECRET")>` | `key` |
| `<@hmac_sha224("SECRET")>` | `key` |
| `<@hmac_sha256("SECRET")>` | `key` |
| `<@hmac_sha384("SECRET")>` | `key` |
| `<@hmac_sha512("SECRET")>` | `key` |

### Encrypt

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@aes_encrypt("key","AES/ECB/PKCS5PADDING","")>` | `key`, `mode`, `iv` | AES encrypt, output base64. Modes: ECB, CBC, CFB, OFB, CTR |
| `<@rotN("13")>` | `n` | ROT-N cipher (ROT13 by default) |
| `<@xor("key")>` | `key` | XOR with repeating key |
| `<@affine_encrypt("5","9")>` | `a`, `b` | Affine cipher encrypt |
| `<@atbash_encrypt>` | — | Atbash cipher |
| `<@rail_fence_encrypt("4")>` | `rails` | Rail fence cipher encrypt |
| `<@substitution_encrypt("phqgiumeaylnofdxjkrcvstzwb")>` | `key` | Substitution cipher encrypt |
| `<@rotN_bruteforce>` | — | Try all 25 ROT-N variants |

### Decrypt

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@aes_decrypt("key","AES/ECB/PKCS5PADDING","")>` | `key`, `mode`, `iv` | AES decrypt from base64 |
| `<@xor_decrypt("3")>` | `keyLen` | XOR brute-force with key length |
| `<@xor_getkey>` | — | Attempt to recover XOR key |
| `<@affine_decrypt("5","9")>` | `a`, `b` | Affine cipher decrypt |
| `<@atbash_decrypt>` | — | Atbash cipher (symmetric) |
| `<@rail_fence_decrypt("4")>` | `rails` | Rail fence cipher decrypt |
| `<@substitution_decrypt("phqgiumeaylnofdxjkrcvstzwb")>` | `key` | Substitution cipher decrypt |

### Compress

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@gzip_compress>` | — | Gzip compress, output base64 |
| `<@gzip_decompress>` | — | Gzip decompress from base64 |
| `<@deflate_compress("fixed")>` | `type` | Deflate compress (`fixed` or `dynamic`) |
| `<@deflate_decompress>` | — | Deflate decompress |
| `<@brotli_decompress>` | — | Brotli decompress |

### Convert

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@hex2dec>` | — | Hex number → decimal |
| `<@dec2hex>` | — | Decimal number → hex |
| `<@dec2oct>` | — | Decimal → octal |
| `<@oct2dec>` | — | Octal → decimal |
| `<@dec2bin>` | — | Decimal → binary |
| `<@bin2dec>` | — | Binary → decimal |
| `<@ascii2hex>` | `sep=" "` | ASCII string → hex bytes |
| `<@hex2ascii>` | — | Hex bytes → ASCII string |
| `<@ascii2bin>` | — | ASCII string → binary bits |
| `<@bin2ascii>` | — | Binary bits → ASCII string |
| `<@chunked_dec2hex>` | — | Comma-separated decimals → hex |
| `<@to_charcode>` | — | String → comma-separated char codes |
| `<@from_charcode>` | — | Comma-separated char codes → string |
| `<@convert_base(",","10","16")>` | `split`, `from`, `to` | Convert numbers between bases |

### String

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@uppercase>` | — | UPPERCASE |
| `<@lowercase>` | — | lowercase |
| `<@capitalise>` | — | Capitalise first letter |
| `<@reverse>` | — | Reverse string |
| `<@length>` | — | Character count |
| `<@unique>` | — | Remove duplicate characters |
| `<@remove_newlines>` | — | Strip `\r` and `\n` |
| `<@space/>` | — | Insert a literal space |
| `<@newline/>` | — | Insert a literal newline |
| `<@find("regex","-1")>` | `regex`, `group` | Regex find, -1 = full match |
| `<@replace("find","replace")>` | `find`, `replace` | String replace (literal) |
| `<@regex_replace("regex","replace")>` | `regex`, `replace` | Regex replace |
| `<@repeat("3")>` | `n` | Repeat input n times |
| `<@substring("0","10")>` | `start`, `end` | Substring |
| `<@split_join(" ","")>` | `split`, `join` | Split and rejoin with different separator |

### Math / Random

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@uuid/>` | — | Random UUID v4 |
| `<@timestamp/>` | — | Unix timestamp (seconds) |
| `<@date("yyyy-MM-dd HH:mm:ss","UTC")/>` | `format`, `tz` | Formatted date/time |
| `<@range("0","100","1")/>` | `from`, `to`, `step` | Comma-separated number range |
| `<@total>` | — | Sum of comma-separated numbers |
| `<@arithmetic("10","+",",")>` | `amount`, `op`, `split` | Apply arithmetic to each number |
| `<@random("10","false")>` | `len`, `unique` | Random digits string |
| `<@random_alpha_lower("10")/>` | `len` | Random lowercase letters |
| `<@random_alpha_upper("10")/>` | `len` | Random uppercase letters |
| `<@random_alphanum_mixed("10")/>` | `len` | Random alphanumeric |
| `<@random_hex("10")/>` | `len` | Random hex string |
| `<@random_num("10")/>` | `len` | Random numeric string |

### XSS Helpers

| Tag | Description |
|-----|-------------|
| `<@eval_fromcharcode>` | Wraps in `eval(String.fromCharCode(...))` |
| `<@iframe_data_url>` | Wraps in `<iframe src="data:text/html;base64,...">` |
| `<@iframe_src_doc>` | Wraps in `<iframe srcdoc="...">` |
| `<@script_data>` | Wraps in `<script>` tag |
| `<@uppercase_script>` | Wraps in uppercase `<SCRIPT>` tag |
| `<@template_eval>` | Template literal eval wrapper |
| `<@throw_eval>` | `throw eval(...)` wrapper |
| `<@css_expression>` | CSS expression wrapper |

### Fake Data

Generate random realistic data. All tags are no-input and accept an optional `locale` argument (e.g. `"fr"`, `"en"`, `"de"`).

| Tag | Description |
|-----|-------------|
| `<@fake_email/>` | Random email address |
| `<@fake_username/>` | Random username |
| `<@fake_firstname/>` | Random first name |
| `<@fake_lastname/>` | Random last name |
| `<@fake_fullname/>` | Random full name |
| `<@fake_phone/>` | Random phone number |
| `<@fake_url/>` | Random URL |
| `<@fake_ip/>` | Random IPv4 address |
| `<@fake_ipv6/>` | Random IPv6 address |
| `<@fake_mac/>` | Random MAC address |
| `<@fake_uuid/>` | Random UUID |
| `<@fake_password/>` | Random password |
| `<@fake_useragent/>` | Random User-Agent string |
| `<@fake_company/>` | Random company name |
| `<@fake_street/>` | Random street address |
| `<@fake_city/>` | Random city |
| `<@fake_country/>` | Random country |
| `<@fake_zipcode/>` | Random zip/postal code |
| `<@fake_creditcard/>` | Random credit card number |
| `<@fake_iban/>` | Random IBAN |
| `<@fake_color/>` | Random color name |
| `<@fake_word/>` | Random word |
| `<@fake_sentence/>` | Random sentence |
| `<@fake_paragraph/>` | Random paragraph |

Example: `<@fake_email("fr")/>` generates a French-locale email.

### Real Values

Static user-defined values configured once in the **Settings panel** and reused across requests. Useful for storing real identities, credentials or account data for pentesting.

| Tag | Description |
|-----|-------------|
| `<@real_email/>` | Your configured email |
| `<@real_username/>` | Your configured username |
| `<@real_firstname/>` | Your configured first name |
| `<@real_lastname/>` | Your configured last name |
| `<@real_fullname/>` | Your configured full name |
| `<@real_phone/>` | Your configured phone number |
| `<@real_company/>` | Your configured company |
| `<@real_url/>` | Your configured URL |
| `<@real_ip/>` | Your configured IP address |
| `<@real_street/>` | Your configured street address |
| `<@real_city/>` | Your configured city |
| `<@real_country/>` | Your configured country |
| `<@real_zipcode/>` | Your configured zip/postal code |

Values are set in the Hackvertor **Settings panel** (toolbar icon) and persisted in localStorage.

### Variables

| Tag | Arguments | Description |
|-----|-----------|-------------|
| `<@set_variable("myvar","false")>` | `name`, `global` | Store content in a variable |
| `<@get_variable("myvar")/>` | `name` | Insert stored variable value |

You can also use the shorthand `<@set_myvar>value</@set_myvar>` and `<@get_myvar/>`.

### JavaScript (custom code)

```
<@javascript("output = input.split('').reverse().join('')")>hello world</@javascript>
```

`input` = the content between tags. Set `output` to the result. Full JS available.

---

## Examples

```http
# Base64 encode a value
GET /?token=<@base64>admin:password</@base64> HTTP/1.1

# SHA-256 hash
GET /?hash=<@sha256>secret</@sha256> HTTP/1.1

# HMAC-SHA256 signature
Authorization: Bearer <@hmac_sha256("mysecretkey")>{"user":"admin"}</@hmac_sha256>

# Nested: URL-encode a base64 value
GET /?data=<@urlencode><@base64>{"id":1}</@base64></@urlencode> HTTP/1.1

# AES encrypt with CBC mode
POST /api HTTP/1.1
Content-Type: application/json

{"data":"<@aes_encrypt("mykey12345678901","AES/CBC/PKCS5PADDING","1234567890123456")>sensitive</@aes_encrypt>"}

# Random UUID in request
POST /items HTTP/1.1

{"id":"<@uuid/>","name":"test"}

# Custom JS: reverse a string
GET /?rev=<@javascript("output = input.split('').reverse().join('')")>hello</@javascript> HTTP/1.1
```
