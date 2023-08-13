//===--- print.ts - Test Print Kirikiri Script ------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: tools\printAST\print.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//

import { gameParser } from "../../lib/parser/ksToks";
import { best } from "../../lib/parser/parser";

const text =
`*page1|
`

let ast = best(gameParser)(text);
console.log(JSON.stringify(ast, null, 2));
