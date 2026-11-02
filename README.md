<h1 align="center">BilibiliLocalPlayerH5</h1>

<div align="center">

本地视频与B站弹幕播放器

<https://app.qttp.net/BilibiliLocalPlayerH5/><br/>
<https://hi.auioc.org/BilibiliLocalPlayerH5/>

</div>

## 关于

使用 TypeScript 重构并开源了很早之前 PCC-Studio 编写与内部使用的项目。

<details>

<summary>🏔</summary>

早期的雪山代码并没有得到重构，反而堆得更高力（悲

</details>

## 使用

- <https://app.qttp.net/BilibiliLocalPlayerH5/> ([地址2](https://hi.auioc.org/BilibiliLocalPlayerH5/))
  - 默认构建，依赖使用 UNPKG CDN 引入
- 无 CDN 构建：[地址1](https://app.qttp.net/BilibiliLocalPlayerH5/bundled/) ([地址2](https://hi.auioc.org/BilibiliLocalPlayerH5/bundled/))
  - 依赖包含在打包的 `player.all.js` 中
- All-in-One 构建：[地址2](https://app.qttp.net/BilibiliLocalPlayerH5/all-in-one/) ([地址2](https://hi.auioc.org/BilibiliLocalPlayerH5/all-in-one/))
  - 样式和脚本内联在单个 HTML 文件中，可保存在本地离线使用

## 开发

1. 克隆项目到本地
2. `pnpm install`
3. 下载 `CommentCoreLibrary` 到 `src/lib`[^1]：

    - [`CommentCoreLibrary.js`](https://unpkg.com/comment-core-library@0.11.1/dist/CommentCoreLibrary.js)

4. 运行 `pnpm run build:dev` 或 `pnpm run watch`
5. 浏览器打开 `public/index.html`

[^1]: <https://github.com/jabbany/CommentCoreLibrary/issues/94>

### 输出

| 脚本                         | 输出                                                  | 前置                                  |
| ---------------------------- | ----------------------------------------------------- | ------------------------------------- |
| `dev:html`(`watch:html`)     | `public/index.html`                                   |                                       |
| `dev:htmlBundled`            | `public/bundled/index.html`                           | `dev:scriptBundled`<br/>`dev:style`   |
| `dev:script`(`watch:script`) | `public/player.js`<br/>`public/player.js.map`         |                                       |
| `dev:scriptBundled`          | `public/player.all.js`<br/>`public/player.all.js.map` |                                       |
| `dev:style`(`watch:style`)   | `public/player.css`<br/>`public/player.css.map`       |                                       |
| `dev:allInOne`               | `public/all-in-one/index.html`                        |                                       |
| `build:dev`                  | ( ↑6 )                                                |                                       |
| `watch`                      | ( `watch:html` + `watch:script` +`watch:style` )      |                                       |
| `prod:html`                  | `build/index.html`                                    |                                       |
| `prod:htmlBundled`           | `build/bundled/index.html`                            | `prod:scriptBundled`<br/>`prod:style` |
| `prod:script`                | `build/assets/player.<commit>.min.js`                 |                                       |
| `prod:scriptBundled`         | `build/assets/player.<commit>.all.min.js`             |                                       |
| `prod:style`                 | `build/assets/player.<commit>.min.css`                |                                       |
| `prod:allInOne`              | `build/all-in-one/index.html`                         |                                       |
| `build:prod`                 | ( ↑6 )                                                |                                       |

## 致谢

- [PCC-Studio](https://www.pccstudio.com)：编写原始项目
- [AUIOC](https://www.auioc.org)：技术支持
- [CommentCoreLibrary](https://github.com/jabbany/CommentCoreLibrary)：弹幕支持
- [ASS.JS](https://github.com/weizhenye/ASS)：字幕支持
- [Bootstrap Icons](https://icons.getbootstrap.com)：控件图标

## 许可证

BilibiliLocalPlayerH5 采用 **GNU Affero通用公共许可证 v3.0** 授权。

完整许可文件参见 [LICENSE](/LICENSE)。
