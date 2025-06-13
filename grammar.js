/**
 * @file Sea grammar for tree-sitter
 * @author Emmeline Coats <me@emmelinecoats.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "sea",

  extras: ($) => [$.comment, /\s+/],

  conflicts: ($) => [
    [$.unary_expression],
    [$.expr_identifier, $.expr_invoke],
    [$.binary_expression, $.expr_var],
    [$.binary_expression, $.expr_let],
    [$.statement_if],
    [$._statement, $.binary_expression],
    [$.statement_ret, $.binary_expression],
  ],

  word: ($) => $.identifier,

  rules: {
    source_file: ($) => repeat($._top_level_statement),

    comment: ($) => choice(seq("//", /.*/), seq("/*", /.*/, "*/")),

    // Top level statements
    _top_level_statement: ($) =>
      choice(
        $.top_use,
        $.top_fun,
        $.top_rec,
        $.top_def,
        $.top_def,
        $.top_tag,
        $.top_tag_rec,
        $.top_pragma,
        $.raw,
        $.hashtag,
      ),
    top_use: ($) =>
      seq(
        "use",
        repeat($.identifier),
        optional(repeat(seq("/", $.identifier))),
        optional(seq("[", repeat($.identifier), "]")),
      ),
    top_fun: ($) =>
      seq(
        "fun",
        $.identifier,
        $.definition_list,
        optional(seq(":", $.type)),
        $.block,
      ),
    top_rec: ($) => seq("rec", $.identifier, $.definition_list),
    top_def: ($) => seq("def", $.identifier, "=", $.type),
    top_tag: ($) =>
      seq(
        "tag",
        $.identifier,
        "(",
        repeat(seq($.identifier, optional(","))),
        ")",
      ),
    top_tag_rec: ($) =>
      seq(
        "tag",
        "rec",
        $.identifier,
        "(",
        repeat(seq($.identifier, optional($.definition_list))),
        ")",
      ),
    top_pragma: ($) =>
      seq(
        "pragma",
        $.identifier,
        "(",
        optional(seq($._expression, optional(repeat(seq(",", $._expression))))),
        ")",
      ),

    // Statements
    _statement: ($) =>
      choice(
        $.statement_ret,
        $.statement_if,
        $.statement_switch,
        $.statement_for,
        $._expression,
        $.raw,
      ),
    statement_ret: ($) => seq("ret", $._expression),
    statement_if: ($) =>
      seq(
        "if",
        $._expression,
        $.block,
        optional(seq("else", choice($.statement_if, $.block))),
      ),
    statement_switch: ($) =>
      seq(
        "switch",
        $._expression,
        "{",
        repeat(seq(optional("fall"), "case", $._expression, $.block)),
        "}",
      ),
    statement_for: ($) =>
      seq(
        "for",
        choice(
          seq($._expression, ";", $._expression, ";", $._expression),
          seq($._expression),
          seq($.identifier, "in", $._expression, "to", $._expression),
        ),
        $.block,
      ),

    // Expressions
    _expression: ($) =>
      choice(
        $.expr_group,
        $.expr_number,
        $.expr_string,
        $.expr_c_string,
        $.expr_char,
        $.expr_bool,
        $.expr_identifier,
        $.expr_new,
        $.expr_invoke,
        $.expr_list,
        $.expr_var,
        $.expr_let,
        $.unary_expression,
        $.binary_expression,
      ),
    expr_group: ($) => seq("(", $._expression, ")"),
    expr_number: ($) => $.number,
    expr_string: ($) => $.string,
    expr_c_string: ($) => $.c_string,
    expr_char: ($) => $.char,
    expr_bool: ($) => choice("true", "false"),
    expr_identifier: ($) => $.identifier,
    expr_new: ($) =>
      seq(
        "new",
        $.identifier,
        "(",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        ")",
      ),
    expr_list: ($) =>
      seq(
        "[",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        "]",
      ),
    expr_invoke: ($) =>
      seq(
        $.identifier,
        "(",
        optional(seq($._expression, repeat(seq(",", $._expression)))),
        ")",
      ),
    expr_var: ($) =>
      seq("var", $.identifier, optional(seq(":", $.type)), "=", $._expression),
    expr_let: ($) =>
      seq("let", $.identifier, optional(seq(":", $.type)), "=", $._expression),
    unary_expression: ($) =>
      prec(
        100_000,
        choice(
          seq("-", $._expression),
          seq("not", $._expression),
          seq("ref", $._expression),
          seq($._expression, "^"),
        ),
      ),
    binary_expression: ($) =>
      choice(
        prec.right(0, seq($._expression, "=", $._expression)), // expr = expr
        prec.left(1, seq($._expression, ">", $._expression)), // expr > expr
        prec.left(1, seq($._expression, ">=", $._expression)), // expr >= expr
        prec.left(1, seq($._expression, "<", $._expression)), // expr < expr
        prec.left(2, seq($._expression, "<=", $._expression)), // expr <= expr
        prec.left(3, seq($._expression, "==", $._expression)), // expr == expr
        prec.left(3, seq($._expression, "!=", $._expression)), // expr != expr
        prec.left(4, seq($._expression, "and", $._expression)), // expr and expr
        prec.left(4, seq($._expression, "or", $._expression)), // expr or expr
        prec.right(5, seq($._expression, "+", $._expression)), // expr + expr
        prec.right(5, seq($._expression, "-", $._expression)), // expr - expr
        prec.left(6, seq($._expression, "*", $._expression)), // expr * expr
        prec.left(6, seq($._expression, "/", $._expression)), // expr / expr
        prec.left(6, seq($._expression, "%", $._expression)), // expr % expr
        prec.right(7, seq($._expression, ".", $._expression)), // expr.expr
        prec.right(7, seq($._expression, "as", $._expression)), // expr as type
        seq($._expression, "[", $._expression, "]"),
      ),

    // Misc
    block: ($) =>
      choice(seq("{", repeat($._statement), "}"), seq("->", $._statement)),

    hashtag: ($) =>
      seq(
        "#",
        choice(
          $.identifier,
          seq(
            "(",
            repeat(seq($.identifier, repeat(seq(",", $.identifier)))),
            ")",
          ),
        ),
      ),

    raw: ($) => seq("raw", "[", repeat1(choice(/\[.+\]/, /[^\[\]]+/)), "]"),

    type: ($) =>
      choice(
        seq(
          repeat("^"),
          $.identifier,
          repeat(seq("[", optional($.number), "]")),
        ),
        seq("fun", "(", repeat($.type), ")", optional(seq(":", $.type))),
      ),

    identifier: ($) => /[a-zA-Z_$][a-zA-Z_$0-9]*/,
    number: ($) => /[0-9_]+(\.[0-9_]+)?/,
    string: ($) => /".*"/,
    c_string: ($) => /c".*"/,
    char: ($) => /`.*`/,

    definition_list: ($) =>
      seq(
        "(",
        optional(
          seq(
            seq($.identifier, ":", $.type),
            repeat(seq(",", $.identifier, ":", $.type)),
          ),
        ),
        ")",
      ),
  },
});
