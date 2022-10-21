require("@nomicfoundation/hardhat-toolbox");
require('@openzeppelin/hardhat-upgrades');
const fs = require("fs")

const ALCHEMY_API_KEY = "pz92P-wnhD3D-nA4wgvB90Xyd8_8ksJ5";
const GOERLI_PRIVATE_KEY = "f5c16051947e0c6b7ffa88d70f0a177f818b2951cad40da46093215c25c42738";
const GOERLI_PRIVATE_KEY2 = "ba81f4c934f247f107f0ca6a8b9dc12d94a3ba82107b3dec231ac9c2dd2d7cf2";
const ETHERSCAN_API_KEY = "ihGloIZtANJOUX1sr0Oub3TOu0GDESq9";

module.exports = {
  solidity: "0.8.9",
  networks: {
    goerli: {
      url: `https://eth-goerli.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [GOERLI_PRIVATE_KEY2],
      gas: 28500000,
      gasPrice: 8000000000
    }
  }
};
function getSortedFiles(dependenciesGraph) {
  const tsort = require("tsort")
  const graph = tsort()

  const filesMap = {}
  const resolvedFiles = dependenciesGraph.getResolvedFiles()
  resolvedFiles.forEach((f) => (filesMap[f.sourceName] = f))

  for (const [from, deps] of dependenciesGraph.entries()) {
      for (const to of deps) {
          graph.add(to.sourceName, from.sourceName)
      }
  }

  const topologicalSortedNames = graph.sort()

  // If an entry has no dependency it won't be included in the graph, so we
  // add them and then dedup the array
  const withEntries = topologicalSortedNames.concat(resolvedFiles.map((f) => f.sourceName))

  const sortedNames = [...new Set(withEntries)]
  return sortedNames.map((n) => filesMap[n])
}

function getFileWithoutImports(resolvedFile) {
  const IMPORT_SOLIDITY_REGEX = /^\s*import(\s+)[\s\S]*?;\s*$/gm

  return resolvedFile.content.rawContent.replace(IMPORT_SOLIDITY_REGEX, "").trim()
}

subtask("flat:get-flattened-sources", "Returns all contracts and their dependencies flattened")
  .addOptionalParam("files", undefined, undefined, types.any)
  .addOptionalParam("output", undefined, undefined, types.string)
  .setAction(async ({ files, output }, { run }) => {
      const dependencyGraph = await run("flat:get-dependency-graph", { files })
      console.log(dependencyGraph)

      let flattened = ""

      if (dependencyGraph.getResolvedFiles().length === 0) {
          return flattened
      }

      const sortedFiles = getSortedFiles(dependencyGraph)

      let isFirst = true
      for (const file of sortedFiles) {
          if (!isFirst) {
              flattened += "\n"
          }
          flattened += `// File ${file.getVersionedName()}\n`
          flattened += `${getFileWithoutImports(file)}\n`

          isFirst = false
      }

      // Remove every line started with "// SPDX-License-Identifier:"
      flattened = flattened.replace(/SPDX-License-Identifier:/gm, "License-Identifier:")

      flattened = `// SPDX-License-Identifier: MIXED\n\n${flattened}`

      // Remove every line started with "pragma experimental ABIEncoderV2;" except the first one
      flattened = flattened.replace(/pragma experimental ABIEncoderV2;\n/gm, ((i) => (m) => (!i++ ? m : ""))(0))

      flattened = flattened.trim()
      if (output) {
          console.log("Writing to", output)
          fs.writeFileSync(output, flattened)
          return ""
      }
      return flattened
  })

subtask("flat:get-dependency-graph")
  .addOptionalParam("files", undefined, undefined, types.any)
  .setAction(async ({ files }, { run }) => {
      const sourcePaths = files === undefined ? await run("compile:solidity:get-source-paths") : files.map((f) => fs.realpathSync(f))

      const sourceNames = await run("compile:solidity:get-source-names", {
          sourcePaths,
      })

      const dependencyGraph = await run("compile:solidity:get-dependency-graph", { sourceNames })

      return dependencyGraph
  })

task("flat", "Flattens and prints contracts and their dependencies")
  .addOptionalVariadicPositionalParam("files", "The files to flatten", undefined, types.inputFile)
  .addOptionalParam("output", "Specify the output file", undefined, types.string)
  .setAction(async ({ files, output }, { run }) => {
      console.log(
          await run("flat:get-flattened-sources", {
              files,
              output,
          })
      )
  })