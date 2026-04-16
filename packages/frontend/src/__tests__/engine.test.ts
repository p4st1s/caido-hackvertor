import { describe, it, expect } from "vitest";
import { convert, convertWithVars } from "../engine";

// ─── Basic tag processing ──────────────────────────────────────────────────────

describe("convert - basic tags", () => {
  it("plain text passthrough", () => expect(convert("hello world")).toBe("hello world"));
  it("base64 encode", () => expect(convert("<@base64>hello</@base64>")).toBe("aGVsbG8="));
  it("base64 decode", () => expect(convert("<@d_base64>aGVsbG8=</@d_base64>")).toBe("hello"));
  it("uppercase", () => expect(convert("<@uppercase>hello</@uppercase>")).toBe("HELLO"));
  it("lowercase", () => expect(convert("<@lowercase>HELLO</@lowercase>")).toBe("hello"));
  it("reverse", () => expect(convert("<@reverse>hello</@reverse>")).toBe("olleh"));
  it("md5 known value", () => expect(convert("<@md5>hello</@md5>")).toBe("5d41402abc4b2a76b9719d911017c592"));
  it("sha256 known value", () => expect(convert("<@sha256>hello</@sha256>")).toBe("2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"));
  it("urlencode", () => expect(convert("<@urlencode>hello world</@urlencode>")).toBe("hello+world"));
  it("d_url", () => expect(convert("<@d_url>hello+world</@d_url>")).toBe("hello world"));
  it("hex no sep", () => expect(convert('<@hex(" ")>AB</@hex>')).toBe("41 42"));
  it("length returns string length", () => expect(convert("<@length>hello</@length>")).toBe("5"));
  it("remove_newlines", () => expect(convert("<@remove_newlines>a\nb\nc</@remove_newlines>")).toBe("abc"));
});

// ─── Self-closing tags ────────────────────────────────────────────────────────

describe("convert - self-closing tags", () => {
  it("bchar self-close", () => expect(convert("<@bchar/>")).toBe('${{<%[%\'"}}%\\.'));
  it("uuid is 36 chars", () => expect(convert("<@uuid/>")).toHaveLength(36));
  it("timestamp is numeric", () => expect(convert("<@timestamp/>")).toMatch(/^\d+$/));
  it("space tag", () => expect(convert("<@space/>")).toBe(" "));
  it("newline tag", () => expect(convert("<@newline/>")).toBe("\n"));
});

// ─── Nested tags ──────────────────────────────────────────────────────────────

describe("convert - nested tags", () => {
  it("base64 then uppercase", () => {
    const result = convert("<@uppercase><@base64>hello</@base64></@uppercase>");
    expect(result).toBe("AGVSBG8=");
  });

  it("d_base64 of base64 is identity", () => {
    expect(convert("<@d_base64><@base64>hello world</@base64></@d_base64>")).toBe("hello world");
  });

  it("double base64 then double decode", () => {
    const encoded = convert("<@base64><@base64>test</@base64></@base64>");
    const decoded = convert(`<@d_base64><@d_base64>${encoded}</@d_base64></@d_base64>`);
    expect(decoded).toBe("test");
  });

  it("urlencode then d_url is identity", () => {
    expect(convert("<@d_url><@urlencode>hello world</@urlencode></@d_url>")).toBe("hello world");
  });

  it("3-level nesting", () => {
    const result = convert("<@reverse><@uppercase><@base64>hi</@base64></@uppercase></@reverse>");
    expect(result).toBe("=KGA");
  });
});

// ─── Tags with args ───────────────────────────────────────────────────────────

describe("convert - tags with args", () => {
  it("rotN with arg", () => expect(convert('<@rotN("1")>abc</@rotN>')).toBe("bcd"));
  it("rotN13 roundtrip", () => {
    const encoded = convert('<@rotN("13")>Hello World</@rotN>');
    const decoded = convert(`<@rotN("13")>${encoded}</@rotN>`);
    expect(decoded).toBe("Hello World");
  });
  it("hmac_sha256 with key", () => {
    const result = convert('<@hmac_sha256("secret")>hello</@hmac_sha256>');
    expect(result).toBe("88aab3ede8d3adf94d26ab90d3bafd4a2083070c3bcce9c014ee04a443847c0b");
  });
  it("repeat with count", () => expect(convert('<@repeat("3")>ab</@repeat>')).toBe("ababab"));
  it("substring", () => expect(convert('<@substring("0","5")>hello world</@substring>')).toBe("hello"));
  it("replace with args", () => expect(convert('<@replace("world","you")>hello world</@replace>')).toBe("hello you"));
  it("find with regex", () => expect(convert('<@find("\\d+")>abc123def456</@find>')).toBe("123\n456"));
  it("arithmetic add", () => expect(convert('<@arithmetic("5","+",",")>10,20</@arithmetic>')).toBe("15,25"));
  it("zeropad", () => expect(convert('<@zeropad(",","4")>1,22,333</@zeropad>')).toBe("0001,0022,0333"));
  it("split_join", () => expect(convert('<@split_join(",","|")>a,b,c</@split_join>')).toBe("a|b|c"));
});

// ─── Variables ────────────────────────────────────────────────────────────────

describe("convert - variables", () => {
  it("set_ prefix stores value", () => {
    const result = convert("<@set_myvar>hello</@set_myvar><@get_myvar>x</@get_myvar>");
    expect(result).toBe("hellohello");
  });

  it("set_variable + get_variable", () => {
    const result = convert('<@set_variable("myvar")>testval</@set_variable><@get_variable("myvar")></@get_variable>');
    expect(result).toBe("testvaltestval");
  });

  it("get undefined variable returns UNDEFINED", () => {
    expect(convert('<@get("missing")/>')).toBe("UNDEFINED");
  });
  it("get_ prefix with missing var returns body", () => {
    expect(convert("<@get_missing>fallback</@get_missing>")).toBe("fallback");
  });

  it("convertWithVars uses provided variables", () => {
    const vars = new Map([["token", "abc123"]]);
    const result = convertWithVars("<@get_token>x</@get_token>", vars);
    expect(result).toBe("abc123");
  });
});

// ─── Real tags ────────────────────────────────────────────────────────────────

describe("convert - real_ tags", () => {
  it("real_email returns arg value", () => {
    expect(convert('<@real_email("user@example.com")/>').trim()).toBe("user@example.com");
  });
  it("real_username returns arg value", () => {
    expect(convert('<@real_username("johndoe")/>').trim()).toBe("johndoe");
  });
  it("real_ with no arg returns empty", () => {
    expect(convert("<@real_email/>")).toBe("");
  });
});

// ─── Security tags ────────────────────────────────────────────────────────────

describe("convert - security tags", () => {
  it("bchar returns canary string", () => {
    expect(convert("<@bchar/>")).toBe('${{<%[%\'"}}%\\.');
  });
  it("canary contains bchar", () => {
    const result = convert("<@canary/>");
    expect(result).toContain('${{<%[%\'"}}%\\.');
  });
  it("canary with prefix", () => {
    const result = convert('<@canary("myprefix")/>');
    expect(result.startsWith("myprefix")).toBe(true);
    expect(result.endsWith("myprefix")).toBe(true);
  });
  it("c is alias for canary", () => {
    const result = convert("<@c/>");
    expect(result).toContain('${{<%[%\'"}}%\\.');
    expect(result.startsWith("pastis")).toBe(true);
  });
});

// ─── JavaScript tag ───────────────────────────────────────────────────────────

describe("convert - javascript tag", () => {
  it("default passthrough", () => {
    expect(convert('<@javascript("output = input")>hello</@javascript>')).toBe("hello");
  });
  it("custom code", () => {
    expect(convert('<@javascript("output = input.toUpperCase()")>hello</@javascript>')).toBe("HELLO");
  });
  it("math operation", () => {
    expect(convert('<@javascript("output = (parseInt(input) * 2).toString()")>21</@javascript>')).toBe("42");
  });
});

// ─── JSON parse ───────────────────────────────────────────────────────────────

describe("convert - json_parse", () => {
  it("extracts property", () => {
    const json = JSON.stringify({ name: "Alice", age: 30 });
    expect(convert(`<@json_parse("name")>${json}</@json_parse>`)).toBe("Alice");
  });
  it("invalid json returns marker", () => {
    expect(convert('<@json_parse("foo")>notjson</@json_parse>')).toBe("[invalid JSON]");
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe("convert - edge cases", () => {
  it("text before and after tag", () => {
    expect(convert("prefix <@uppercase>hello</@uppercase> suffix")).toBe("prefix HELLO suffix");
  });
  it("multiple sequential tags", () => {
    const result = convert("<@uppercase>hello</@uppercase> <@base64>world</@base64>");
    expect(result).toBe("HELLO d29ybGQ=");
  });
  it("unknown tag throws", () => {
    expect(() => convert("<@nonexistent_tag_xyz>x</@nonexistent_tag_xyz>")).toThrow();
  });
  it("empty input", () => expect(convert("")).toBe(""));
  it("plain text no tags", () => expect(convert("just plain text")).toBe("just plain text"));
  it("remove_output suppresses content", () => {
    expect(convert("<@remove_output>anything</@remove_output>")).toBe("");
  });
});

// ─── Roundtrip encode/decode pairs ────────────────────────────────────────────

describe("convert - roundtrip pairs", () => {
  const inputs = ["hello", "Hello World!", "test 123", "a & b < c"];

  for (const input of inputs) {
    it(`base64 roundtrip: ${JSON.stringify(input)}`, () => {
      const encoded = convert(`<@base64>${input}</@base64>`);
      expect(convert(`<@d_base64>${encoded}</@d_base64>`)).toBe(input);
    });

    it(`urlencode roundtrip: ${JSON.stringify(input)}`, () => {
      const encoded = convert(`<@urlencode>${input}</@urlencode>`);
      expect(convert(`<@d_url>${encoded}</@d_url>`)).toBe(input);
    });

    it(`html_entities roundtrip: ${JSON.stringify(input)}`, () => {
      const encoded = convert(`<@html_entities>${input}</@html_entities>`);
      expect(convert(`<@d_html_entities>${encoded}</@d_html_entities>`)).toBe(input);
    });
  }

  it("gzip roundtrip via engine", () => {
    const long = "aaaaaaa".repeat(50);
    const encoded = convert(`<@gzip_compress>${long}</@gzip_compress>`);
    expect(convert(`<@gzip_decompress>${encoded}</@gzip_decompress>`)).toBe(long);
  });
});
