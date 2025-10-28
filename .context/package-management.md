# Package Management

## Package Manager

This project uses **pnpm** as the package manager.

### Installation Commands

```bash
# Install dependencies
pnpm install

# Add a new dependency
pnpm add [package-name]

# Add a development dependency
pnpm add -D [package-name]

# Remove a dependency
pnpm remove [package-name]

# Update dependencies
pnpm update

# Install globally
pnpm add -g [package-name]
```

### Why pnpm?

- **Faster** - Uses hard links and symlinks to save disk space
- **Efficient** - Better dependency resolution than npm/yarn
- **Secure** - Stricter dependency hoisting prevents phantom dependencies
- **Monorepo support** - Excellent workspace management

### Available Scripts

Check `package.json` for available scripts, commonly:

```bash
pnpm dev           # Start development server
pnpm build         # Build for production
pnpm start         # Start production server
pnpm test          # Run tests
pnpm lint          # Run linting
pnpm format        # Format code
```

### Lock File

- **Lock file**: `pnpm-lock.yaml`
- Always commit the lock file to ensure consistent installs
- Never manually edit the lock file

### Best Practices

1. **Use exact pnpm version** in CI/CD (check `.nvmrc` or `package.json` engines)
2. **Commit lock file** for reproducible builds
3. **Use workspace protocol** for monorepo packages
4. **Keep dependencies updated** regularly with `pnpm update`

### Troubleshooting

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check outdated packages
pnpm outdated

# Audit dependencies
pnpm audit
```
