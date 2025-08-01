<h1 align="center">BilibiliLocalPlayerH5</h1>

<div align="center">

本地视频与B站弹幕播放器

<https://hi.auioc.org/BilibiliLocalPlayerH5>

</div>

## 关于

使用 TypeScript 重构并开源了很早之前 PCC-Studio 编写与内部使用的项目。

<details>

<summary>🏔</summary>

早期的雪山代码并没有得到重构，反而堆得更高力（悲

</details>

## 使用

- <https://hi.auioc.org/BilibiliLocalPlayerH5>

## 开发

1. 克隆项目到本地
2. `pnpm install`
3. 下载 `CommentCoreLibrary` 到 `src/lib`[^1]：

    - [`CommentCoreLibrary.js`](https://unpkg.com/comment-core-library@0.11.1/dist/CommentCoreLibrary.js)

4. 运行 `pnpm run build:dev`
5. 浏览器打开 `public/index.html`

[^1]: <https://github.com/jabbany/CommentCoreLibrary/issues/94>

### 输出

| 脚本                         | 输出                                            |
| ---------------------------- | ----------------------------------------------- |
| `dev:html`(`watch:html`)     | `public/index.html`                             |
| `dev:script`(`watch:script`) | `public/player.js`<br/>`public/player.js.map`   |
| `dev:style`(`watch:style`)   | `public/player.css`<br/>`public/player.css.map` |
| `build:dev`(`watch`)         | ( ↑3 )                                          |
| `prod:html`                  | `build/index.html`                              |
| `prod:script`                | `build/assets/player.<commit>.min.js`           |
| `prod:style`                 | `build/assets/player.<commit>.min.css`          |
| `build`                      | ( ↑3 )                                          |

## 致谢

- [PCC-Studio](https://www.pccstudio.com)：编写原始项目
- [AUIOC](https://www.auioc.org)：技术支持
- [CommentCoreLibrary](https://github.com/jabbany/CommentCoreLibrary)：弹幕支持
- [ASS.JS](https://github.com/weizhenye/ASS)：字幕支持
- [Bootstrap Icons](https://icons.getbootstrap.com)：控件图标

## 许可证

BilibiliLocalPlayerH5 采用 **GNU Affero通用公共许可证 v3.0** 授权。

完整许可文件参见 [LICENSE](/LICENSE)。
