import SwiftUI
import UIKit

// s166 m05 scratch screen — a Parts-Town-branded card styled from Forge token
// artifacts (the compilable m03 OodsTokens subset + m04 PT DTCG colors). The
// unlabeled BITMAP below is a DELIBERATE a11y defect so the
// performAccessibilityAudit XCUITest has a real finding class to surface.
//
// s171 m05b re-plant: the defect must be a genuine one. SF Symbols AND
// asset-catalog images derive an implicit accessibility label from their name,
// so only a programmatic `Image(uiImage:)` bitmap is truly label-less. It is
// deliberately NOT marked decorative. The GREEN leg of the RED→GREEN pair opts
// into a label via the PROBE_BITMAP_LABELED launch environment.

/// A programmatically drawn swatch — brand A's interactive primary as emitted by
/// the s171 colour transform (#C93E00). No symbol name, no catalog entry, no label.
enum ProbeBitmap {
    static var swatch: UIImage {
        let size = CGSize(width: 48, height: 48)
        return UIGraphicsImageRenderer(size: size).image { context in
            UIColor(red: 0.788, green: 0.243, blue: 0.000, alpha: 1).setFill()
            context.fill(CGRect(origin: .zero, size: size))
        }
    }
}
public struct ContentView: View {
    public var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Forge Token Probe")
                .font(.system(size: 28, weight: .bold))
                .foregroundStyle(PartsTownBrand.partsTownRed)
                .accessibilityIdentifier("probe.title")

            Text("Certify-native feasibility spike: this screen is styled from generated token artifacts, then inspected through the simulator accessibility tree.")
                .font(.system(size: 16))
                .foregroundStyle(PartsTownBrand.partsTownBlack)
                .accessibilityIdentifier("probe.body")

            HStack(spacing: 12) {
                if ProcessInfo.processInfo.environment["PROBE_BITMAP_LABELED"] == "1" {
                    Image(uiImage: ProbeBitmap.swatch)
                        .accessibilityLabel("Brand primary colour swatch")
                        .accessibilityIdentifier("probe.bitmap")
                } else {
                    Image(uiImage: ProbeBitmap.swatch)
                        .accessibilityIdentifier("probe.bitmap")
                }
                Button("Order Part") {}
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
                    .background(PartsTownBrand.partsTownRed)
                    .foregroundStyle(.white)
                    .clipShape(RoundedRectangle(cornerRadius: 8))
                    .accessibilityIdentifier("probe.cta")
            }

            RoundedRectangle(cornerRadius: 8)
                .fill(PartsTownBrand.partsTownRedTint.opacity(0.15))
                // m03 finding on display: this "large geometry scalar" arrives ×16-inflated
                // (px source ridden through SD's rem assumption) — 320pt tall, visibly wrong.
                .frame(height: OodsTokenSubset.refSpaceScaleLg)
                .overlay(
                    Text("Swatch: Parts Town Red Tint")
                        .font(.system(size: 13))
                        .foregroundStyle(PartsTownBrand.partsTownBlack)
                )
                .accessibilityIdentifier("probe.swatch")

            Spacer()
        }
        .padding(24)
        .accessibilityIdentifier("probe.root")
    }

    public init() {}
}
