# Tauri Integration

This project now includes Tauri support for building cross-platform desktop applications.

## Prerequisites

1. **Rust**: Install Rust from [https://rustup.rs/](https://rustup.rs/)
2. **System Dependencies**:
   - **Windows**: Install Microsoft Visual Studio C++ Build Tools
   - **macOS**: Install Xcode Command Line Tools
   - **Linux**: Install build essentials (`sudo apt install build-essential` on Ubuntu/Debian)

## Development

### Start Tauri Development Mode
```bash
bun run tauri:dev
```

This will:
- Start the Nuxt development server
- Build and run the Tauri application
- Enable hot reload for both frontend and backend

### Build for Production
```bash
bun run tauri:build
```

This creates distributable packages for your target platforms.

## Project Structure

```
src-tauri/
├── src/
│   ├── main.rs          # Entry point
│   └── lib.rs           # Main application logic
├── tauri.conf.json      # Tauri configuration
├── Cargo.toml           # Rust dependencies
└── icons/               # Application icons
```

## Configuration

The Tauri configuration is in `src-tauri/tauri.conf.json`:

- **App Name**: "BuildItui"
- **Identifier**: "com.Builditui.app"
- **Window Size**: 1200x800
- **Build Output**: `.output/public` (Nuxt's output directory)

## Tauri APIs

The application includes examples of Tauri API usage:

- **Platform Detection**: Shows when running in Tauri vs web
- **Shell Integration**: Opens external URLs using system default browser
- **Custom Commands**: `get_platform()` returns the current OS

## Adding New Tauri Features

### 1. Add Rust Commands

In `src-tauri/src/lib.rs`:
```rust
#[tauri::command]
fn your_command() -> String {
    "Hello from Rust!".to_string()
}
```

### 2. Register Commands

Add to the invoke handler:
```rust
.invoke_handler(tauri::generate_handler![get_platform, your_command])
```

### 3. Use in Vue

```typescript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke('your_command');
```

## Available Scripts

- `bun run tauri` - Run Tauri CLI commands
- `bun run tauri:dev` - Development mode
- `bun run tauri:build` - Build for production
- `bun run tauri:preview` - Preview production build

## Troubleshooting

### Common Issues

1. **Rust not found**: Ensure Rust is installed and in your PATH
2. **Build tools missing**: Install platform-specific build tools
3. **Permission errors**: On Linux/macOS, ensure proper permissions

### Debug Mode

Tauri runs in debug mode during development, which shows console output and enables hot reload.

## Resources

- [Tauri Documentation](https://tauri.app/docs/)
- [Tauri API Reference](https://tauri.app/reference/)
- [Rust Documentation](https://doc.rust-lang.org/)
