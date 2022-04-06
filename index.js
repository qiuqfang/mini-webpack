import fs from "fs";
import path from "path";

import parser from "@babel/parser";
import traverse from "@babel/traverse";

function createAsset(filePath) {
  //1.获取文件的内容
  const source = fs.readFileSync(filePath, "utf-8");

  //2.获取依赖关系(通过AST解析)
  const ast = parser.parse(source, { sourceType: "module" });
  const deps = [];
  //3.遍历AST
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
    },
  });

  //4.返回一个Asset对象
  return { filePath, source, deps };
}

function createGraph() {
  const mainAsset = createAsset("./example/main.js");

  console.log("mainAsset", mainAsset);
  const queue = [mainAsset];
  //1.遍历依赖
  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      console.log("example", relativePath);
      const childAsset = createAsset(path.resolve("./example", relativePath));
      console.log(childAsset);
    });
  }
}

createGraph();
