const path = require("path");

class HashFilePlugin {
  constructor(options) {
    this.options = {
      filename: "hash.json",
    };

    if (!options) {
      return;
    }

    if (options.filename) {
      this.options.filename = options.filename;
    }
  }

  apply(compiler) {
    const buildJsonFile = path.resolve(
      compiler.options.output.path || ".",
      this.options.filename
    );

    compiler.hooks.afterEmit.tapAsync("HashFilePlugin", (compilation, callback) => {
      const stats = compilation.getStats().toJson({
        hash: true,
        publicPath: false,
        assets: false,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false,
      });
      compiler.outputFileSystem.writeFile(
        buildJsonFile,
        JSON.stringify({ hash: stats.hash }),
        callback
      );
    });
  }
}

class HashTextPlugin {
  constructor(options) {
    this.options = {
      filename: "hash.json",
    };

    if (!options) {
      return;
    }

    if (options.filename) {
      this.options.filename = options.filename;
    }
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tapAsync("HashTextPlugin", (compilation, callback) => {
      const stats = compilation.getStats().toJson({
        hash: true,
        publicPath: false,
        assets: false,
        chunks: false,
        modules: false,
        source: false,
        errorDetails: false,
        timings: false,
      });

      const buildJsonFileWitHash = path.resolve(
        compiler.options.output.path || ".",
        `hash.${stats.hash}.json`
      );
      compiler.outputFileSystem.writeFile(
        buildJsonFileWitHash,
        JSON.stringify({ hash: stats.hash }),
        callback
      );
    });
  }
}
module.exports = { HashFilePlugin, HashTextPlugin };
