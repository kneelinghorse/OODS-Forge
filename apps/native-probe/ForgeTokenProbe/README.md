# ForgeTokenProbe - iOS App

A modern iOS application using a **workspace + SPM package** architecture for clean separation between app shell and feature code.

## Provenance

Scaffold generated from an iOS app template (workspace + SPM package). The template's
bundled AI-assistant rules files (`CLAUDE.md`, `.cursor/`, `.github/copilot-instructions.md`)
were PRUNED before this tree was committed (s171 m05b) — template agent-config must not
become live config under a tracked tree.

## Project Architecture

```
ForgeTokenProbe/
├── ForgeTokenProbe.xcworkspace/              # Open this file in Xcode
├── ForgeTokenProbe.xcodeproj/                # App shell project
├── ForgeTokenProbe/                          # App target (minimal)
│   ├── Assets.xcassets/                # App-level assets (icons, colors)
│   ├── ForgeTokenProbeApp.swift              # App entry point
│   └── ForgeTokenProbe.xctestplan            # Test configuration
├── ForgeTokenProbePackage/                   # 🚀 Primary development area
│   ├── Package.swift                   # Package configuration
│   ├── Sources/ForgeTokenProbeFeature/       # Your feature code
│   └── Tests/ForgeTokenProbeFeatureTests/    # Unit tests
└── ForgeTokenProbeUITests/                   # UI automation tests
```

## Key Architecture Points

### Workspace + SPM Structure
- **App Shell**: `ForgeTokenProbe/` contains minimal app lifecycle code
- **Feature Code**: `ForgeTokenProbePackage/Sources/ForgeTokenProbeFeature/` is where most development happens
- **Separation**: Business logic lives in the SPM package, app target just imports and displays it

### Buildable Folders (Xcode 16)
- Files added to the filesystem automatically appear in Xcode
- No need to manually add files to project targets
- Reduces project file conflicts in teams

## Development Notes

### Code Organization
Most development happens in `ForgeTokenProbePackage/Sources/ForgeTokenProbeFeature/` - organize your code as you prefer.

### Public API Requirements
Types exposed to the app target need `public` access:
```swift
public struct NewView: View {
    public init() {}
    
    public var body: some View {
        // Your view code
    }
}
```

### Adding Dependencies
Edit `ForgeTokenProbePackage/Package.swift` to add SPM dependencies:
```swift
dependencies: [
    .package(url: "https://github.com/example/SomePackage", from: "1.0.0")
],
targets: [
    .target(
        name: "ForgeTokenProbeFeature",
        dependencies: ["SomePackage"]
    ),
]
```

### Test Structure
- **Unit Tests**: `ForgeTokenProbePackage/Tests/ForgeTokenProbeFeatureTests/` (Swift Testing framework)
- **UI Tests**: `ForgeTokenProbeUITests/` (XCUITest framework)
- **Test Plan**: `ForgeTokenProbe.xctestplan` coordinates all tests

## Configuration

### XCConfig Build Settings
Build settings are managed through **XCConfig files** in `Config/`:
- `Config/Shared.xcconfig` - Common settings (bundle ID, versions, deployment target)
- `Config/Debug.xcconfig` - Debug-specific settings  
- `Config/Release.xcconfig` - Release-specific settings
- `Config/Tests.xcconfig` - Test-specific settings

### Entitlements Management
App capabilities are managed through a **declarative entitlements file**:
- `Config/ForgeTokenProbe.entitlements` - All app entitlements and capabilities
- AI agents can safely edit this XML file to add HealthKit, CloudKit, Push Notifications, etc.
- No need to modify complex Xcode project files

### Asset Management
- **App-Level Assets**: `ForgeTokenProbe/Assets.xcassets/` (app icon, accent color)
- **Feature Assets**: Add `Resources/` folder to SPM package if needed

### SPM Package Resources
To include assets in your feature package:
```swift
.target(
    name: "ForgeTokenProbeFeature",
    dependencies: [],
    resources: [.process("Resources")]
)
```

### Generated with XcodeBuildMCP
This project was scaffolded using [XcodeBuildMCP](https://github.com/cameroncooke/XcodeBuildMCP), which provides tools for AI-assisted iOS development workflows.