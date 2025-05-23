#!/bin/bash

echo "🚀 Telepítés indul..."

# Alap csomagok
npm install --save-dev prettier eslint typescript \
  @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-config-prettier husky lint-staged

# Prettier konfig
cat <<EOT > .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
EOT

# Prettier ignore
cat <<EOT > .prettierignore
node_modules
dist
build
.next
out
coverage
*.log
.vscode
.env
EOT

# ESLint konfig
cat <<EOT > .eslintrc.json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "rules": {
    "no-unused-vars": "warn"
  }
}
EOT

# .editorconfig
cat <<EOT > .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
EOT

# VS Code settings
mkdir -p .vscode
cat <<EOT > .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.organizeImports": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.requireConfig": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.exclude": {
    "**/.git": true,
    "**/node_modules": true,
    "**/.DS_Store": true,
    "**/dist": true,
    "**/.next": true
  }
}
EOT

# Husky init + lint-staged
npm pkg set scripts.prepare="husky install"
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

# lint-staged config
npm pkg set lint-staged."*.{js,ts,jsx,tsx,json}"="[ \\"prettier --write\\", \\"eslint --fix\\" ]"

echo "✅ Minden készen van! Ne felejts el egy első commitot:"
echo "   git add . && git commit -m 'chore: initial setup with prettier, eslint, husky'"
