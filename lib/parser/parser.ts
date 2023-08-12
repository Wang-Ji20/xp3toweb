//===--- parser.ts - Parser Type -------------------------*- TypeScript -*-===//
// xp3toweb 2023
//
// Identification: lib\parser\parser.ts
//
// Author: Ji Wang <jiwangcdi@gmail.com>
//
// SPDX-License-Identifier: MIT
//===----------------------------------------------------------------------===//
//
// This file try to implement a simple parser combinator library in TypeScript.
//
// The parser combinator library is inspired by the following resources:
//  - http://cmsc-16100.cs.uchicago.edu/2021-autumn/Lectures/18/functional-parsing.php
//
//===----------------------------------------------------------------------===//

// type Parser s = String -> (s,String)

/// In general, a parser is a function given a string, and return a list of
/// possible results and the remaining string. The list of possible results
/// is used to handle ambiguity.
///
/// Typically, we expect below result:
/// ```typescript
/// BoolParser("true") = [{ result: true, remaining: "" }]
/// BoolParser("false") = [{ result: false, remaining: "" }]
/// ```
export type Parser<T> = (s: string) => { result: T, remaining: string }[];

/// The satisfy function takes a predicate and returns a parser that succeeds
/// if the first character in the input string satisfies the predicate.
/// ```typescript
/// var digit = satisfy((s) => "0" <= s && s <= "9");
/// digit("123") = [{ result: "1", remaining: "23" }]
/// digit("abc") = []
/// ```
export function satisfy(predicate: (s: string) => boolean): Parser<string> {
  return (s: string) => {
    if (s.length == 0) {
      return [];
    }
    if (predicate(s[0])) {
      return [{ result: s[0], remaining: s.slice(1) }];
    }
    return [];
  }
}

/// The char function takes a character and returns a parser that succeeds
/// if the first character in the input string is the given character.
/// ```typescript
/// var a = char("a");
/// a("abc") = [{ result: "a", remaining: "bc" }]
/// a("123") = []
/// ```
export function char(c: string): Parser<string> {
  return satisfy((s) => s == c);
}

export var digit = satisfy((s) => "0" <= s && s <= "9");

/// The string function takes a string and returns a parser that succeeds
/// if the input string starts with the given string.
/// ```typescript
/// var s = string("abc");
/// s("abcdef") = [{ result: "abc", remaining: "def" }]
/// s("123") = []
/// ```
export function string(s: string): Parser<string> {
  return (input: string) => {
    if (input.startsWith(s)) {
      return [{ result: s, remaining: input.slice(s.length) }];
    }
    return [];
  }
}

/// Till now, our parser can only parse strings, however to make our parser
/// really useful we need to convert strings to value type.
/// We use fmap to do this.
/// ```typescript
/// var BoolStringToBool = function (s: string): boolean {
///   if (s == "true") {
///     return true;
///   }
///   if (s == "false") {
///     return false;
///   }
///   throw new Error("Invalid bool string");
/// }
/// var BoolParser = fmap(string("true"), BoolStringToBool);
/// BoolParser("true") = [{ result: true, remaining: "" }]
/// BoolParser("false") = [{ result: false, remaining: "" }]
/// ```
export function fmap<T, U>(parser: Parser<T>, f: (t: T) => U): Parser<U> {
  return (input: string) => {
    return parser(input)
      .map(({ result, remaining }) => {
        return { result: f(result), remaining: remaining };
      });
  }
}

export function pure(t: any): Parser<any> {
  return (_) => [{ result: t, remaining: _ }];
}


export function alt<T, U>(p1: Parser<T>, p2: Parser<U>): Parser<T | U> {
  return (input: string) => {
    var result: { result: T | U, remaining: string }[] = [];
    return result.concat(p1(input)).concat(p2(input));
  }
}

/// monad
function bind<T, U>(parser: Parser<T>, f: (t: T) => Parser<U>): Parser<U> {
  return (input: string) => {
    return parser(input).flatMap(({ result, remaining }) => {
      return f(result)(remaining);
    });
  }
}

export function token<T>(tok: string, result: T): Parser<T> {
  return fmap(string(tok), (_) => result);
}

export var ParseTrue = token("true", true);
export var ParseFalse = token("false", false);


export var ParseBool = alt(ParseTrue, ParseFalse);

// transform a parser that parses a single value into a parser that parses
// a list of values
export function many<T>(parser: Parser<T>): Parser<T[]> {
  return alt(pure([]), bind(parser, (t) => fmap(many(parser), (ts) => [t].concat(ts))));
}

/// seq
export function seq<T, U>(p1: Parser<T>, p2: Parser<U>): Parser<[T, U]> {
  return bind(p1, (t) => fmap(p2, (u) => [t, u]));
}

/// varadic version of seq & alt
export function seqs<T>(...parsers: Parser<T>[]): Parser<T[]> {
  if (parsers.length == 0) {
    return pure([]);
  }
  return bind(parsers[0], (t) => fmap(seqs(...parsers.slice(1)), (ts) => [t].concat(ts)));
}

export function alts<T>(...parsers: Parser<T>[]): Parser<T> {
  if (parsers.length == 0) {
    throw new Error("alts: no parser");
  }
  if (parsers.length == 1) {
    return parsers[0];
  }
  return alt(parsers[0], alts(...parsers.slice(1)));
}

/// skipSpace
export var ParseSpace = satisfy((s) => s == " ");
export var ParseSpaces = many(ParseSpace);

/// skip any char
export function skip<T>(parser: Parser<T>): Parser<void> {
  return fmap(parser, (_) => undefined);
}

export var skipSpaces = skip(ParseSpaces);

/// get best result (i.e. remaining == '')
export function best<T>(parser: Parser<T>): Parser<T> {
  return (input: string) => {
    var result = parser(input);
    var bestResult = result.filter(({ remaining }) => remaining == '');
    if (bestResult.length == 0) {
      return [];
    }
    return bestResult;
  }
}

/// optional parser
export function optional<T>(parser: Parser<T>): Parser<T> {
  return alt(parser, pure([]));
}
