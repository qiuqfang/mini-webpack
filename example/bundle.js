(function (modules) {
  function require(id) {
    const [fn, mapping] = modules[id];

    const module = { exports: {} };

    function localRequire(filePath) {
      return require(mapping[filePath]);
    }

    fn(localRequire, module, module.exports);

    return module.exports;
  }
  require(1);
})({
  1: [
    function (require, module, exports) {
      const { foo } = require("foo.js");
      foo();
      console.log("main.js");
    },
    { "foo.js": 2 },
  ],
  2: [
    function (require, module, exports) {
      function foo() {
        console.log("foo.js");
      }
      module.exports = { foo };
    },
    {},
  ],
});
