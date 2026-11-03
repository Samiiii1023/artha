# First GitHub push

**Never use a public repository for personal financial records.** This starter only contains generic synthetic tests; the actual app repository should be private.

## Option A: GitHub CLI

1. Extract the starter ZIP as a folder named `artha`.
2. Sign into GitHub on your development machine with `gh auth login`.
3. Run:

```bash
cd artha
npm install
npm test
git init -b main
git add .
git commit -m "chore: initialize Artha financial core"
gh repo create artha --private --source=. --remote=origin --push
```

This requires Git and GitHub CLI installed. Do not add README or gitignore when creating a separate remote (they are already in this starter).

## Option B: GitHub website

1. Create a **new private** empty repository named `artha` under your GitHub account. Do not initialize it with README, license or .gitignore.
2. From the extracted folder:

```bash
cd artha
npm install
npm test
git init -b main
git add .
git commit -m "chore: initialize Artha financial core"
git remote add origin https://github.com/YOUR_USERNAME/artha.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your real GitHub username. GitHub will handle authentication; use a supported credential manager instead of putting tokens into shell commands.

After pushing, send the repository URL. The next task is the Expo shell and its first native screens.
