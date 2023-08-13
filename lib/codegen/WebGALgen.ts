//===--- WebGALgen.ts - Generate WebGAL file --------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: lib\codegen\WebGALgen.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//

import { newParser, visitor } from "../parser/parser";

export let WebGALprinter: visitor = (t, v) => {
  console.log(':' + v + ';');
};
