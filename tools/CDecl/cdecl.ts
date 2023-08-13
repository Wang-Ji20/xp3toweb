//===--- cdecl.ts - Parse C Style Declaration ------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: tools\CDecl\cdecl.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//
// eliminate left recursion
//
// dcl: * direct-dcl
// direct-dcl:
//       name dr
//       | (dcl) dr
// dr:
//    ()dr
//    []dr
//    ()
//    []
//===----------------------------------------------------------------------===//

import {
  best,
  satisfy,
  char,
  Y,
  many,
  ParseSpace,
  token,
  alts,
  fmap,
  Parser,
  seq3,
  alt2,
  seq2,
  alt4,
  seq4,
  string,
} from "../../lib/parser/functional(abandoned)/parser";

type TokenType = "Identifier" | "Star" | "LParen" | "RParen" | "LBkt" | "RBkt";
type NTermType = "CDecl" | "DirectDcl" | "Pointer" | "Array" | "Func";

type AST = {
  node: NTermType | TokenType;
  children: AST[];
  Info: any;
};

function StrToCIdentifier(s: string): AST {
  return { node: "Identifier", Info: s, children: [] };
}

var starParser = char("*");
var lparenParser = char("(");
var rparenParser = char(")");
var pairparenParser = string("()");

var lbktParser = char("[");
var rbktParser = char("]");
var pairbktParser = string("[]");

var idCharParser = satisfy(
  (s: string) =>
    ("a" <= s && s <= "z") ||
    ("A" <= s && s <= "Z") ||
    s == "_" ||
    ("0" <= s && s <= "9")
);
var idParser = fmap(many(idCharParser), (s: string[]) =>
  StrToCIdentifier(s.join(""))
);

var cdeclParser = (p: Parser<AST>) =>
  alt2(
    fmap(p, (dcl: AST): AST => {
      return { node: "CDecl", children: [dcl], Info: null };
    }),
    fmap(seq2(starParser, p), (s: [string, AST]): AST => {
      return { node: "CDecl", children: [s[1]], Info: "Pointer to" };
    })
  );

var drParser: Parser<AST> = Y((dr: Parser<AST>) => {
  return alts(
    fmap(seq2(pairbktParser, dr), (s: [string, AST]) => {
      return { node: "DirectDcl", children: [s[1]], Info: "Array of" };
    }),
    fmap(seq2(lparenParser, rparenParser), (s: [string, string]): AST => {
      return { node: "DirectDcl", children: [], Info: "Function returning " };
    }),
    fmap(seq2(pairbktParser, dr), (s: [string, AST]) => {
      return {
        node: "DirectDcl",
        children: [s[1]],
        Info: "Function returning",
      };
    }),
    fmap(seq2(lbktParser, rbktParser), (s: [string, string]) => {
      return { node: "DirectDcl", children: [], Info: "Array of" };
    })
  );
});

var directdclParser: Parser<AST> = Y((directdcl: Parser<AST>) => {
  return alts(
    fmap(idParser, (id: AST) => {
      return { node: "DirectDcl", children: [id], Info: null };
    }),
    fmap(seq2(idParser, drParser), (s: [AST, AST]) => {
      s[1].children = s[1].children.concat([s[0]]);
      return { node: "DirectDcl", children: [s[1]], Info: null };
    }),
    fmap(
      seq3(lparenParser, cdeclParser(directdcl), rparenParser),
      (s: [string, AST, string]) => {
        return { node: "DirectDcl", children: [s[1]], Info: null };
      }
    ),
    fmap(
      seq4(lparenParser, cdeclParser(directdcl), rparenParser, drParser),
      (s: [string, AST, string, AST]): AST => {
        s[3].children = s[3].children.concat([s[1]]);
        return { node: "DirectDcl", children: [s[3]], Info: null };
      }
    )
  );
});

let FinalParser = best(cdeclParser(directdclParser));

let finalAST: AST = FinalParser("(*(*x())[])()")[0].result;
console.log(JSON.stringify(finalAST, null, 1));

function visit(ast: AST): string {
  if (ast.children.length == 0) {
    return ast.Info;
  }
  var result = "";
  ast.children.forEach((child: AST) => {
    result = result.concat(visit(child));
  });
  var ss;
  if (ast?.Info == null) {
    ss = "";
  } else {
    ss = ast.Info;
  }
  return result.concat(" ").concat(ss).concat(" ");
}

console.log(visit(finalAST));
