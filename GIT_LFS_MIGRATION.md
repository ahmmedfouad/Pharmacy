# Git LFS Migration Guide

This repository has been configured to use Git LFS (Large File Storage) for managing binary files. This improves repository performance and fixes issues with cloning and pushing large files.

## What Changed?

- Added `.gitattributes` to track binary files (images, videos, etc.) with Git LFS
- Added `.vercelignore` to optimize Vercel deployments
- Updated README with Git LFS installation instructions

## For New Contributors

If you're cloning this repository for the first time after this change:

```bash
# Install Git LFS (if not already installed)
git lfs install

# Clone the repository normally
git clone https://github.com/ahmmedfouad/Pharmacy.git
cd Pharmacy

# Git LFS will automatically download the large files
```

## For Existing Contributors

If you already have a clone of this repository:

### Option 1: Fresh Clone (Recommended)

The simplest approach is to delete your local repository and clone it again:

```bash
# Backup any uncommitted changes first!
cd /path/to/Pharmacy
git stash  # Save any uncommitted changes

# Move to parent directory and remove the old clone
cd ..
rm -rf Pharmacy

# Install Git LFS and clone fresh
git lfs install
git clone https://github.com/ahmmedfouad/Pharmacy.git
cd Pharmacy

# Restore your changes if you had any
git stash pop
```

### Option 2: Migrate Your Existing Clone

If you prefer to keep your existing clone:

```bash
cd /path/to/Pharmacy

# Install Git LFS (if not already installed)
git lfs install

# Fetch the latest changes
git fetch origin

# Pull the .gitattributes file
git pull origin main

# Migrate existing files to LFS (this may take a while)
git lfs migrate import --include="*.jpg,*.jpeg,*.png,*.gif,*.ico,*.bmp,*.webp,*.svg,*.tiff,*.pdf,*.zip,*.tar.gz,*.mp4,*.mov,*.mp3,*.wav" --everything

# Force push the migrated history (only if coordinating with team)
# WARNING: This rewrites history - coordinate with your team first!
# git push --force --all origin
```

## Why Git LFS?

### Problems It Solves:

1. **Slow Cloning**: Large binary files made cloning slow
2. **Push Failures**: Large files could cause push failures to GitHub
3. **Repository Bloat**: Binary files bloated the git history
4. **Vercel Issues**: Large files caused deployment problems with Vercel

### Benefits:

- ✅ Faster cloning and fetching
- ✅ No push failures from large files
- ✅ Smaller repository size
- ✅ Better Vercel deployment performance
- ✅ Efficient handling of binary file updates

## Troubleshooting

### "This repository is configured for Git LFS but 'git-lfs' was not found"

Install Git LFS:

**macOS:**
```bash
brew install git-lfs
git lfs install
```

**Ubuntu/Debian:**
```bash
sudo apt-get install git-lfs
git lfs install
```

**Windows:**
Download from https://git-lfs.github.com/

### "Encountered X file(s) that should have been pointers"

This means some files weren't properly tracked by LFS. Fix with:

```bash
git lfs migrate import --include="*.jpg,*.png,*.ico" --everything
```

### Push Still Failing?

1. Check file sizes: `find . -type f -size +10M`
2. Ensure Git LFS is tracking them: `git lfs ls-files`
3. Verify .gitattributes is committed: `git log --all -- .gitattributes`

## Verifying Git LFS Setup

To verify everything is working correctly:

```bash
# Check Git LFS status
git lfs env

# List files tracked by LFS
git lfs ls-files

# Should show files like:
# 988e1f2d45 * examples/medicine.jpg
# 626a8c9e12 * src/assets/Logo.png
# etc.
```

## Questions?

If you encounter any issues, please open an issue on GitHub or contact the repository maintainer.
