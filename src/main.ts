import * as core from "@actions/core"
import * as github from "@actions/github"

async function run(): Promise<void> {
  try {
    const inputs = [
      "cluster-name",
      "cluster-zone",
      "chart-name",
      "chart-path",
      "namespace",
      "image-repo",
      "image-tag",
    ]
    inputs.forEach(input => console.log(`${input} == ${core.getInput(input)}`))
    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
