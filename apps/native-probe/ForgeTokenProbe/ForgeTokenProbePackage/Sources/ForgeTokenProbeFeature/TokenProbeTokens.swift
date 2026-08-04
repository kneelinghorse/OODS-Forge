// TokenProbeTokens.swift — s166 m05 scratch screen token source.
// COMPILABLE SUBSET of the m03-generated OodsTokens.swift (dims + hex-sourced colors);
// the oklch/keyword lines do not compile (the m03 finding) and are excluded here.
// PT brand colors come from the m04 DTCG artifact (partstown.base.json), hex→Color.
import SwiftUI
import UIKit

public enum OodsTokenSubset {
        public static let borderPanelDefaultRadius = CGFloat(192.00) /** Default border for cards and primary panels. */
        public static let borderPanelDefaultWidth = CGFloat(16.00) /** Default border for cards and primary panels. */
        public static let borderStatusCriticalRadius = CGFloat(128.00) /** Critical status banner border with rounded corners. */
        public static let borderStatusCriticalWidth = CGFloat(16.00) /** Critical status banner border with rounded corners. */
        public static let borderSurfaceDefaultRadius = CGFloat(192.00) /** Alias to panel default border. */
        public static let borderSurfaceDefaultWidth = CGFloat(16.00) /** Alias to panel default border. */
        public static let refBorderRadiusMd = CGFloat(192.00) /** Medium radius for cards and panels. */
        public static let refBorderRadiusPill = CGFloat(15984.00) /** Pill radius for chip and badge treatments. */
        public static let refBorderRadiusSm = CGFloat(128.00) /** Small radius for banners and compact surfaces. */
        public static let refBorderWidthBold = CGFloat(32.00) /** Bold border width for emphasis and outlines. */
        public static let refBorderWidthHairline = CGFloat(16.00) /** Hairline border width for foundational surfaces. */
        public static let refShadowColorStrong = UIColor(red: 0.059, green: 0.090, blue: 0.165, alpha: 0.24) /** Stronger shadow colour for high elevation overlays. */
        public static let refShadowColorSubtle = UIColor(red: 0.059, green: 0.090, blue: 0.165, alpha: 0.12) /** Soft ambient shadow colour for elevated surfaces. */
        public static let refSpaceInlineSm = CGFloat(224.00) /** Small horizontal spacing used in chip contexts. */
        public static let refSpaceInlineXs = CGFloat(128.00) /** Compact horizontal spacing. */
        public static let refSpaceInsetCompact = CGFloat(128.00) /** Compact padding for dense containers. */
        public static let refSpaceInsetDefault = CGFloat(384.00) /** Default padding for primary cards and panels. */
        public static let refSpaceScaleLg = CGFloat(320.00) /** Large geometry scalar (= 1.25rem); continues the +0.375rem scale ramp (sm 8 / md 14 / lg 20). Completes the t-shirt set so emitter md/sm/lg all resolve (sprint-125 m03). */
        public static let refSpaceScaleMd = CGFloat(224.00) /** Medium geometry scalar (= 0.875rem); seeds the size.spacing contract. */
        public static let refSpaceScaleSm = CGFloat(128.00) /** Small geometry scalar (= 0.5rem); seeds the size.spacing contract. */
        public static let refSpaceStackCompact = CGFloat(192.00) /** Tight vertical spacing between related items. */
        public static let refSpaceStackDefault = CGFloat(320.00) /** Standard vertical spacing between sections. */
        public static let refTypographyLetterSpacingDefault = CGFloat(0.00) /** Neutral tracking for body copy. */
        public static let refTypographyLetterSpacingTight = CGFloat(-0.16) /** Tight tracking for large headings. */
        public static let refTypographyLetterSpacingWide = CGFloat(1.28) /** Wide tracking for uppercase captions. */
        public static let refTypographyLineHeightLoose = CGFloat(2560.00) /** Loose rhythm for long-form detail views. */
        public static let refTypographyLineHeightRelaxed = CGFloat(2400.00) /** Relaxed rhythm for dense reading. */
        public static let refTypographyLineHeightStandard = CGFloat(2240.00) /** Baseline rhythm for UI text. */
        public static let refTypographyLineHeightTight = CGFloat(1920.00) /** Tight rhythm for headlines and compact contexts. */
        public static let refTypographySizesDisplayLg = CGFloat(1280.00) /** Large display heading — homepage hero statement. */
        public static let refTypographySizesDisplayMd = CGFloat(1024.00) /** Medium display heading — page hero titles. */
        public static let refTypographySizesDisplaySm = CGFloat(768.00) /** Small display heading — section heroes and feature titles. */
        public static let refTypographySizesLg = CGFloat(320.00) /** Large supporting heading scale. */
        public static let refTypographySizesMd = CGFloat(256.00) /** Default reading scale. */
        public static let refTypographySizesSm = CGFloat(224.00) /** Compact body/label scale. */
        public static let refTypographySizesXl = CGFloat(384.00) /** Primary heading scale. */
        public static let refTypographySizesXs = CGFloat(192.00) /** Caption scale. */
        public static let refTypographySizesXxl = CGFloat(512.00) /** Hero heading scale. */
        public static let shadowElevationCardBlur = CGFloat(640.00) /** Baseline elevation shadow for cards and raised panels. */
        public static let shadowElevationCardColor = UIColor(red: 0.059, green: 0.090, blue: 0.165, alpha: 0.12) /** Baseline elevation shadow for cards and raised panels. */
}

public enum PartsTownBrand {
    public static let partsTownRedTint = Color(red: 0.6510, green: 0.0980, blue: 0.1804) // #a6192e (Parts Town Red Tint)
    public static let partsTownBlack = Color(red: 0.1765, green: 0.1608, blue: 0.1490) // #2d2926 (Parts Town Black)
    public static let partsTownRed = Color(red: 0.7843, green: 0.0627, blue: 0.1804) // #c8102e (Parts Town Red)
}
