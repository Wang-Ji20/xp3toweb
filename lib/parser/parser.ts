//===--- parser.ts - RecDes Parser -----------------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: lib\parser\parser.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//

export type visitor = (t: Token, v: string) => any;
export type filterTok = (c: context) => boolean;
export type context = { token: Token; value: string };
export type textProvider = (pos: number) => string;

type listener = {
  filter: filterTok;
  visitor: visitor;
};

type Token = "Text" | "Tag" | "Label" | "EOF";

class state {
  text: string;
  pos: number;
  tok: Token;
  tokval: string;
  listeners: listener[];

  constructor() {
    this.text = "";
    this.pos = 0;
    this.tok = "EOF";
    this.tokval = "";
    this.listeners = [];
  }

  addListener(v: listener) {
    this.listeners.push(v);
  }

  removeListener(v: listener) {
    this.listeners = this.listeners.filter((x) => x !== v);
  }

  notify(context: context) {
    this.listeners.forEach(
      (v) => v.filter(context) && v.visitor(context.token, context.value)
    );
  }

  setToken(t: Token) {
    let context = {
      token: t,
      value: this.tokval.substring(0),
    };
    this.tok = t;
    this.tokval = "";
    return context;
  }

  peek(i: number = 0) {
    return this.text[this.pos + i];
  }

  next() {
    this.tokval += this.text[this.pos];
    this.pos++;
    return this.text[this.pos - 1];
  }

  // False -> EOF
  // True -> Found
  preceedTill(s: string): boolean {
    for (;;) {
      if (this.pos >= this.text.length) {
        return false;
      }
      let c = this.peek();
      if (s.includes(c[0])) {
        return true;
      }
      this.next();
    }
  }

  skip() {
    this.pos++;
  }

  skipSpace(): boolean {
    for (;;) {
      if (this.pos >= this.text.length) {
        return false;
      }
      let c = this.peek();
      if (c === " " || c === "\t" || c === "\r" || c === "\n") {
        this.skip();
      } else {
        return true;
      }
    }
  }

  // skip one \r\n or \n
  skipNewLine() {
    if (this.peek() === "\r") {
      this.skip();
    }
    if (this.peek() === "\n") {
      this.skip();
    }
  }
}

// @ssss CRLF
function parseAtTag(s: state) {
  s.skip();
  if (s.preceedTill("\r\n") == false) {
    throw new Error("Invalid tag");
  }
  let c = s.setToken("Tag");
  s.notify(c);
  s.skipNewLine();
}

// *s|s CRLF
function parseLabel(s: state) {
  s.skip();
  if (s.pos >= s.text.length) {
    throw new Error("Invalid label");
  }
  if (s.preceedTill("|\r\n") == false) {
    throw new Error("Invalid label");
  }
  let c = s.setToken("Label");
  s.notify(c);
  if ("\r\n".includes(s.peek())) {
    s.skipNewLine();
    return;
  }
  parseLabel(s);
}

// [s]
function parseInlineTag(s: state) {
  s.skip();
  s.preceedTill("]");
  let c = s.setToken("Tag");
  s.skip();
  s.notify(c);
}

// Text: str
//     | str Text
//     | tag Text
//     | tag
function parseText(s: state) {
  while (s.preceedTill("@*[") && s.peek() === "[" && s.peek(1) === "[") {}
  let c = s.setToken("Text");
  s.notify(c);
  if (s.pos >= s.text.length) {
    return;
  }
  if (s.peek() === "[") {
    parseInlineTag(s);
  } else {
    parseLine(s);
  }
}

function parseLine(s: state) {
  if (s.pos >= s.text.length) {
    s.setToken("EOF");
    return;
  }
  let c = s.peek();
  if (c === "@") {
    parseAtTag(s);
  } else if (c === "*") {
    parseLabel(s);
  } else if (c === "[") {
    parseInlineTag(s);
  } else {
    parseText(s);
  }
}

function parse(s: state) {
  for (;;) {
    parseLine(s);
    if (s.tok === "EOF") {
      return;
    }
  }
}

export function newParser(text: string): state {
  let s = new state();
  s.text = text;
  return s;
}

export function registerListener(
  s: state,
  v: visitor,
  f: filterTok = (c: context) => true
) {
  s.addListener({
    filter: f,
    visitor: v,
  });
}

export function startParse(s: state) {
  parse(s);
}
