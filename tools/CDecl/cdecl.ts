//===--- cdecl.ts - Parse C Style Declaration ------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: tools\CDecl\cdecl.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//

import { best, satisfy, char, digit, many, seqs, ParseSpace, token, alts, fmap, Parser } from "../../lib/parser/parser";

type TokenType = "Identifier" | "Star" | "LParen" | "RParen" | "LBkt" | "RBkt";
type NTermType = "CDecl" | "DirectDcl" | "Pointer" | "Array" | "Func";

type AST = {
  node: NTermType | TokenType;
  children?: AST[];
  Info: any
}

function StrToCIdentifier(s: string): AST {
  return { node: "Identifier", Info: s };
}

var starParser = char("*");
var lparenParser = char("(");
var rparenParser = char(")");
var lbktParser = char("[");
var rbktParser = char("]");

var idCharParser = satisfy((s: string) => "a" <= s && s <= "z" || "A" <= s && s <= "Z" || s == "_" || "0" <= s && s <= "9");
var idParser = fmap(many(idCharParser), (s: string[]) => StrToCIdentifier(s.join("")));

function cdeclParser(): Parser<AST> {
  return fmap(directdclParser(), (dcl: AST) => { return { node: "CDecl", children: [dcl], Info: null }; })
}

function directdclParser(): Parser<AST> {
  return alts(
    fmap(idParser, (id: AST) => { return { node: "DirectDcl", children: [id], Info: null }; }),
  )
}



console.log(JSON.stringify(best(cdeclParser())("abc123")));
