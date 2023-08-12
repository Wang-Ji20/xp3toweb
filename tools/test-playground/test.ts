//===--- test.ts - Print result to the console -----------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: tools\test-playground\test.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//

import { ParseBool, many } from "../../lib/parser/parser";

console.log(many(ParseBool)("truefalsefalse"));
