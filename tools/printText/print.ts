//===--- print.ts - Test Print Kirikiri Script ------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: tools\printAST\print.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//

import { WebGALprinter } from "../../lib/codegen/WebGALgen";
import {
  newParser,
  registerListener,
  startParse,
  visitor,
} from "../../lib/parser/parser";

const text = `*page0|&f.scripttitle
@setdaytime
@se storage=se247.wav
@fadein rule=カーテン左から time=800 storage=oアインツ森入り口-(朝靄)
　经过长途跋涉，到达了郊外的森林。[lr]
　从这里走二小时左右，可以走到越来越熟悉的爱因兹贝伦城。[lr]
@sestop time=2000 nowait=1
@fg index=1000 time=300 pos=c storage=バーサーカー01a(近)
　但、为什么森林入口处堵着不得了的人啊。
@pg`;

let p = newParser(text);
registerListener(p, WebGALprinter, (c) => c.token === "Text");
startParse(p);
