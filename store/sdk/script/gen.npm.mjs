import cp from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const {push = `no`} = process.env

const execOpt = {
  cwd: __dirname,
  stdio: `inherit`,
}

const talbe = {
  no() {
    // 打包 npm 包
    cp.execSync(`npx shx rm -rf ./npm-pkg/browser/`, {...execOpt})
    cp.execSync(`npx rollup --config rollup.config.mjs`, {...execOpt, env: {target: `browser`}})
    cp.execSync(`npx shx rm -rf ./npm-pkg/node/`, {...execOpt})
    cp.execSync(`npx rollup --config rollup.config.mjs`, {...execOpt, env: {target: `node`}})
    // 使用主项目中的 readme 文件
    cp.execSync(`npx shx cp ../readme.md ./npm-pkg/readme.md`, {...execOpt})
    // 修改 page.html 中的 wsUrl
    const text = fs.readFileSync(`${__dirname}/../win-api/res/page.html`, `utf8`)
    const newText = text
      .replace(`wsUrl: undefined`, `wsUrl: \`ws://127.0.0.1:10005?token=tokentokentoken\``)
      .replace(`</head>`, `</head>\n  <script src="../browser/main.umd.min.js"></script>`)
      .replace(`globalThis.ext.token`, `(await nativeMain.G.token)[1]`)
      .replace(`globalThis.ext.wsUrl`, `(await nativeMain.G.wsUrl)[1]`)
    fs.writeFileSync(`${__dirname}/npm-pkg/test/page.html`, newText)
  },
  yes() {
    cp.execSync(`npx shx rm -f *.tgz`, {...execOpt, cwd: `${__dirname}/npm-pkg/`})
    cp.execSync(`npm version prerelease`, {...execOpt, cwd: `${__dirname}/npm-pkg/`})
    const fileName = cp.execSync(`npm pack`, {cwd: `${__dirname}/npm-pkg/`}).toString()
    cp.execSync(`npm publish ${fileName}`, {...execOpt, cwd: `${__dirname}/npm-pkg/`})
  },
}

const fn = talbe[push]

fn()
