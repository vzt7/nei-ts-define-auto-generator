const path = require("path");

const CWD = process.cwd();
const PACKAGE = require(path.join(CWD, "package.json"));

const header = `
// ==UserScript==
// @name         nei-template-plugin
// @name:zh      nei-template-plugin : 在 nei 页面自动生成指定模板代码
// @namespace    https://greasyfork.org/zh-CN/scripts/419329-nei-template-plugin
// @version      2.0.0
// @description  nei template plugin.
// @author       vzt7.zed@gmail.com
// @match        *://nei.hz.netease.com/*
// @grant        unsafewindow
// @run-at       document-start
// ==/UserScript==

(function(window){window.addEventListener("load",function(){`;
const footer = `});})(unsafeWindow || window);`;

const assetProcess = async ({ name, bundler }) => {
  if (name.split(".").pop() === "js" && bundler.options.production) {
    return {
      header,
      footer,
    };
  }
};

module.exports = assetProcess;
