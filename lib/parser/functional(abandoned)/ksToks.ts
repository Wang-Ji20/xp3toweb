//===--- ksToks.ts - Token Definitions Kirikiri Script ---*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: lib\parser\functional(abandoned)\ksToks.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//
// This block describes the grammar of Kirikiri Script using BNF.
//
// Game: Line
//     | Line Game
//
// Line: Label CRLF
//     | Command CRLF
//     | Text CRLF
//
// Label: * anyStr '|'
//
// Command: @ anyStr
//        | tag
//
// CRLF: "\r\n"
//     | "\n"
//
// text: word text
//     | word
//     | tag text
//     | tag
//
// word: anyStr
//
// tag: [ anyStr ]
//===----------------------------------------------------------------------===//

import {
  Parser,
  Y,
  alt2,
  alt3,
  alt4,
  fmap,
  many,
  satisfy,
  seq2,
  seq3,
  seq4,
  some,
  string,
} from "./parser";

import { Label, Tag, Text } from "../../AST/AST";

let reservedWords = ["@", "*", "[", "]", ";", "|", "\r\n", "\n"];

let lbraktParser = string("[");
let rbraktParser = string("]");
let atParser = string("@");
let starParser = string("*");
let semicolonParser = string(";");
let IParser = string("|");

let anyStrParser = fmap(
  some(
    satisfy((c) => {
      return !reservedWords.includes(c);
    })
  ),
  (s: string[]) => {
    return s.join("");
  }
);

let wordParser = anyStrParser;
let tagParser = fmap(
  seq3(lbraktParser, anyStrParser, rbraktParser),
  (s: [string, string, string]): Tag => {
    return { type: "Tag", text: s[1] };
  }
);

let textParser = Y((textParser: Parser<Text>) => {
  return alt4(
    fmap(seq2(wordParser, textParser), (s: [string, Text]): Text => {
      return { type: "Text", text: s[0] + s[1].text, tag: s[1].tag };
    }),
    fmap(wordParser, (s: string): Text => {
      return { type: "Text", text: s, tag: [] };
    }),
    fmap(seq2(tagParser, textParser), (s: [Tag, Text]): Text => {
      return { type: "Text", text: s[1].text, tag: [s[0], ...s[1].tag] };
    }),
    fmap(tagParser, (s: Tag): Text => {
      return { type: "Text", text: "", tag: [s] };
    })
  );
});

let CRLFParser = alt2(string("\r\n"), string("\n"));

let commandParser = alt2(
  fmap(seq2(atParser, anyStrParser), (s: [string, string]): Tag => {
    return { type: "Tag", text: s[1] };
  }),
  tagParser
);

let labelParser = fmap(
  seq3(starParser, anyStrParser, IParser),
  (s: [string, string, string]): Label => {
    return { type: "Label", names: s[1] };
  }
);

let lineParser = fmap(
  seq2(alt3(labelParser, commandParser, textParser), CRLFParser),
  (s: [Tag | Label | Text, string]): Tag | Text | Label => {
    return s[0];
  }
);

let gameParser = many(
  fmap(
    seq2(lineParser, CRLFParser),
    (s: [Tag | Label | Text, string]): Tag | Text | Label => {
      return s[0];
    }
  )
);

export { gameParser };
