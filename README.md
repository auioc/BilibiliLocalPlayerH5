<h1 align="center">BilibiliLocalPlayerH5</h1>

<div align="center">

本地视频与B站弹幕播放器

<https://hi.auioc.org/BilibiliLocalPlayerH5>

</div>

## 关于

使用 TypeScript 重构并开源了很早之前 PCC-Studio 编写与内部使用的项目。
> ~~LainIO24：早期的雪山代码并没有得到重构，反而堆得更高力（悲~~

自提交 `9eddaae4` 起加入了更多的新功能。

## 使用

- [网站版](https://hi.auioc.org/BilibiliLocalPlayerH5)
- [单文件版](https://hi.auioc.org/BilibiliLocalPlayerH5/aio.html)：使用“另存为……”可保存为单个 HTML 文件到本地离线使用。

两版本功能完全相同。

## 开发

1. 克隆项目到本地
2. 下载 [`CommentCoreLibrary.js`](https://github.com/jabbany/CommentCoreLibrary/raw/19db2962ed0ce637a2b99facdf8634d51bb1b503/dist/CommentCoreLibrary.js) 和 [`ass.js`](https://github.com/weizhenye/ASS/raw/e6a3605a2343655d9ef80bdd7e9fe92f92edca22/dist/ass.js) 到 `src/lib`
3. 运行 `tsc` 指令构建 `public/player.js`
4. 浏览器打开 `public/index.html` 即可使用或调试

注意事项：

- 本项目构建不需要项目级别的 NPM 包，需要的只有用于编译 TypeScript 的全局包 `typescript`。
- `build.sh` 脚本用于持续集成自动构建，开发时一般不需要使用，在本地使用可能会破坏项目结构！

## 致谢

- [PCC-Studio](https://www.pccstudio.com)：编写原始项目
- [AUIOC](https://www.auioc.org)：技术支持
- [CommentCoreLibrary](https://github.com/jabbany/CommentCoreLibrary)：弹幕支持
- [ASS.JS](https://github.com/weizhenye/ASS)：字幕支持
- [Bootstrap Icons](https://icons.getbootstrap.com)：控件图标

## 许可证

BilibiliLocalPlayerH5 采用 **GNU Affero通用公共许可证 v3.0** 授权。

完整许可文件参见 [LICENSE](/LICENSE)。
