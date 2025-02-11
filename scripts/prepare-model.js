const fs = require("fs");
const path = require("path");
const https = require("https");
const { execSync } = require("child_process");

const MODELS_DIR = path.join(__dirname, "../models");
const LLAMA_CPP_DIR = path.join(__dirname, "../llama.cpp");
const MODEL_URLS = {
  tiny: "https://huggingface.co/TheBloke/TinyLlama-1.1B-Chat-v0.3-GGUF/resolve/main/tinyllama-1.1b-chat-v0.3.Q4_K_M.gguf",
  small:
    "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf",
  medium:
    "https://huggingface.co/TheBloke/Llama-2-13B-chat-GGUF/resolve/main/llama-2-13b-chat.Q4_K_M.gguf",
};

async function main() {
  // Create directories if they don't exist
  if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
  }

  // Clone llama.cpp if not exists
  if (!fs.existsSync(LLAMA_CPP_DIR)) {
    console.log("Cloning llama.cpp repository...");
    execSync("git clone https://github.com/ggerganov/llama.cpp.git", {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
    });
  }

  try {
    // Create build directory
    const buildDir = path.join(LLAMA_CPP_DIR, "build");
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // Configure CMake for WASM build
    console.log("Configuring CMake for WASM build...");
    execSync(
      "emcmake cmake .. " +
        "-DCMAKE_BUILD_TYPE=Release " +
        "-DLLAMA_NATIVE=OFF " +
        "-DLLAMA_BUILD_SERVER=OFF " +
        "-DLLAMA_BUILD_EXAMPLES=OFF " +
        "-DLLAMA_STANDALONE=ON " +
        "-DBUILD_SHARED_LIBS=OFF",
      {
        cwd: buildDir,
        stdio: "inherit",
      }
    );

    // Build the library
    console.log("Building WASM library...");
    execSync("emmake make", {
      cwd: buildDir,
      stdio: "inherit",
    });

    // Create our wrapper
    console.log("Creating WASM wrapper...");
    const wasmWrapper = `
      const wasmModule = {
        onRuntimeInitialized: function() {
          console.log('WASM Runtime initialized');
        },
        locateFile: function(path, prefix) {
          if (path.endsWith('.wasm')) {
            return prefix + path;
          }
          return path;
        }
      };
      export default wasmModule;
    `;

    // Create wasm directory
    const wasmDestDir = path.join(__dirname, "../src/llama-wasm");
    if (!fs.existsSync(wasmDestDir)) {
      fs.mkdirSync(wasmDestDir, { recursive: true });
    }

    // Copy WASM files and write wrapper
    fs.copyFileSync(
      path.join(buildDir, "a.out.wasm"),
      path.join(wasmDestDir, "llama.wasm")
    );
    fs.copyFileSync(
      path.join(buildDir, "a.out.js"),
      path.join(wasmDestDir, "llama.js")
    );
    fs.writeFileSync(path.join(wasmDestDir, "wrapper.js"), wasmWrapper);

    console.log("WASM build complete!");
  } catch (error) {
    console.error("Failed to build llama.cpp:", error);
    console.log("\nPlease ensure you have CMake and Emscripten installed:");
    console.log("1. Install CMake: https://cmake.org/download/");
    console.log(
      "2. Install Emscripten: https://emscripten.org/docs/getting_started/downloads.html"
    );
    process.exit(1);
  }

  // Download models
  for (const [name, url] of Object.entries(MODEL_URLS)) {
    const modelPath = path.join(MODELS_DIR, `${name}.gguf`);

    if (!fs.existsSync(modelPath)) {
      console.log(`Downloading ${name} model...`);
      await downloadFile(url, modelPath);
    }
  }

  console.log("Model preparation complete!");
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (response) => {
        response.pipe(file);

        // Track progress
        let downloaded = 0;
        const total = parseInt(response.headers["content-length"], 10);

        response.on("data", (chunk) => {
          downloaded += chunk.length;
          const percent = ((downloaded / total) * 100).toFixed(2);
          process.stdout.write(`\rDownloading... ${percent}%`);
        });

        file.on("finish", () => {
          process.stdout.write("\n");
          file.close(resolve);
        });
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
