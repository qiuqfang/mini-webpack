import fs from "fs";
import path from "path";

import parser from "@babel/parser";
import traverse from "@babel/traverse";
import ejs from "ejs";
import { transformFromAst } from "@babel/core";

let id = 0;
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
  //4.转换esm为cms
  const { code } = transformFromAst(ast, null, {
    presets: ["@babel/preset-env"],
    
  });

  //5.返回一个Asset对象
  return { filePath, code, deps, id: id++, mapping: {} };
}

function createGraph() {
  const mainAsset = createAsset("./example/main.js");

  console.log("mainAsset", mainAsset);
  const graph = [mainAsset];
  //1.遍历依赖
  for (const asset of graph) {
    asset.deps.forEach((relativePath) => {
      console.log("example", relativePath);
      const childAsset = createAsset(path.resolve("./example", relativePath));
      asset.mapping[relativePath] = childAsset.id;
      console.log(childAsset);
      graph.push(childAsset);
    });
  }
  return graph;
}

const graph = createGraph();

console.log(graph);

function build(graph) {
  console.log(graph);
  const template = fs.readFileSync("./template.ejs", "utf-8");

  const code = ejs.render(template, { graph });

  fs.writeFileSync("./dist/bundle.js", code);
}

build(graph);
