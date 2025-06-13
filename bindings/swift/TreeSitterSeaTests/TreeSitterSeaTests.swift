import XCTest
import SwiftTreeSitter
import TreeSitterSea

final class TreeSitterSeaTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_sea())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Sea grammar")
    }
}
