//===--- AST.ts - AST Node definitions -------------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: lib\AST\AST.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//

export type Tag = {
  type: "Tag";
  text: string;
}

export type Text = {
  type: "Text";
  text: string;
  tag: Tag[];
};

export type Label = {
  type: "Label";
  names: string;
}
