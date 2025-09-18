# 🚀 Automatic Version Management

This project uses `standard-version` for automatic version bumping and changelog generation.

## 📋 How It Works

### Automatic Versioning
- **Patch** (1.0.0 → 1.0.1): Bug fixes, small improvements
- **Minor** (1.0.0 → 1.1.0): New features, backward compatible
- **Major** (1.0.0 → 2.0.0): Breaking changes

### Commit Message Convention
Use conventional commits for automatic version detection:

```
feat: add new feature          # → minor version bump
fix: resolve bug              # → patch version bump
chore: update dependencies    # → patch version bump
docs: update documentation    # → patch version bump
```

## 🛠️ Usage

### Manual Version Bumping
```bash
# Bump patch version (1.0.0 → 1.0.1)
npm run bump:patch

# Bump minor version (1.0.0 → 1.1.0)
npm run bump:minor

# Bump major version (1.0.0 → 2.0.0)
npm run bump:major

# Auto-detect version type from commits
npm run release
```

### What Happens When You Bump
1. **Version updated** in all package.json files
2. **Changelog generated** from commit messages
3. **Git tag created** with the new version
4. **Commit created** with version bump

### After Version Bump
```bash
# Push the changes and tags
git push --follow-tags origin main
```

## 🤖 GitHub Actions

The project includes a GitHub Actions workflow that:
- Runs on pushes to `main` branch
- Automatically bumps version based on commits
- Creates releases and tags
- Updates changelog

## 📝 Commit Message Examples

```bash
# Feature (minor bump)
git commit -m "feat: add user authentication"

# Bug fix (patch bump)
git commit -m "fix: resolve login issue"

# Breaking change (major bump)
git commit -m "feat!: redesign user interface"

# Documentation (patch bump)
git commit -m "docs: update API documentation"

# Maintenance (patch bump)
git commit -m "chore: update dependencies"
```

## 🎯 Best Practices

1. **Use conventional commits** for automatic version detection
2. **Test before bumping** - run `npm run build` and `npm run lint:all`
3. **Push tags** after version bump: `git push --follow-tags`
4. **Review changelog** before pushing to ensure accuracy
5. **Use semantic versioning** (semver) principles

## 📦 Files Updated

When you bump the version, these files are automatically updated:
- `package.json` (root)
- `apps/admin/package.json`
- `apps/user/package.json`
- `packages/shared/package.json`
- `CHANGELOG.md` (generated)

## 🔧 Configuration

The versioning is configured in `.versionrc.json`:
- Commit message parsing
- Changelog sections
- File patterns to update
- URL formats for links
