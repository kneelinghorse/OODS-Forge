import XCTest

// s166 m05 — the certify-native audit probe. performAccessibilityAudit (iOS 17+)
// is an XCUITest-only API, so the "audit" leg of a future MCP certify.native
// necessarily runs through a test bundle like this one (driven via
// `xcodebuildmcp simulator test`).
final class ForgeTokenProbeUITests: XCTestCase {
    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testTokenScreenRendersAndExposesA11yTree() throws {
        let app = XCUIApplication()
        app.launch()
        // SwiftUI exposes Text by its LABEL to XCUIElement staticTexts queries; the
        // .accessibilityIdentifier form did not match here (a certify.native lesson:
        // drive assertions off labels or the runtime a11y tree, not identifiers).
        XCTAssertTrue(app.staticTexts["Forge Token Probe"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["Order Part"].exists)
    }

    @MainActor
    func testPerformAccessibilityAudit() throws {
        // RED leg of the s171 m05b pair: the bitmap ships UNLABELED (default state).
        let app = XCUIApplication()
        app.launch()
        _ = app.staticTexts["Forge Token Probe"].waitForExistence(timeout: 10)

        // Collect every issue instead of failing on the first — the point is the
        // REPORT (what a certify.native verdict would grade), not a pass/fail.
        var collected: [String] = []
        try app.performAccessibilityAudit(for: .all) { issue in
            collected.append("\(issue.auditType): \(issue.compactDescription)")
            return true // handled — keep collecting
        }
        // Emit the findings into the test log for extraction by the driver.
        for (index, finding) in collected.enumerated() {
            print("A11Y-AUDIT-FINDING[\(index)]: \(finding)")
        }
        print("A11Y-AUDIT-TOTAL: \(collected.count)")

        // The runtime accessibility tree — the label-less image node is the datum.
        print("A11Y-TREE-BEGIN")
        print(app.debugDescription)
        print("A11Y-TREE-END")

        // Screenshot, kept in the result bundle for extraction.
        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "probe-unlabeled"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }

    @MainActor
    func testPerformAccessibilityAuditLabeledBitmap() throws {
        // GREEN leg: the SAME bitmap opts into a label via launch environment; the
        // image-related finding must disappear while everything else stays equal.
        let app = XCUIApplication()
        app.launchEnvironment["PROBE_BITMAP_LABELED"] = "1"
        app.launch()
        _ = app.staticTexts["Forge Token Probe"].waitForExistence(timeout: 10)

        var collected: [String] = []
        try app.performAccessibilityAudit(for: .all) { issue in
            collected.append("\(issue.auditType): \(issue.compactDescription)")
            return true
        }
        for (index, finding) in collected.enumerated() {
            print("A11Y-AUDIT-FINDING-LABELED[\(index)]: \(finding)")
        }
        print("A11Y-AUDIT-LABELED-TOTAL: \(collected.count)")

        print("A11Y-TREE-LABELED-BEGIN")
        print(app.debugDescription)
        print("A11Y-TREE-LABELED-END")

        let screenshot = XCTAttachment(screenshot: app.screenshot())
        screenshot.name = "probe-labeled"
        screenshot.lifetime = .keepAlways
        add(screenshot)
    }
}
