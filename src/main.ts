import * as core from "@actions/core"
import * as github from "@actions/github"
import * as artifact from "@actions/artifact"
import { promises as fsPromises } from "fs"
import { join, dirname } from "path"

export const run = async (): Promise<void> => {
  try {
    const octokit: github.GitHub = new github.GitHub(core.getInput("token"), {
      required: true,
    })
    const { repo, owner } = github.context.repo
    const ref = core.getInput("ref", { required: true })
    const { data } = await octokit.repos.createDeployment({
      owner: owner,
      repo: repo,
      ref: ref,
      auto_merge: false,
      required_contexts: [],
      description: "deploy created by dictybot",
      payload: JSON.stringify({
        cluster: core.getInput("cluster-name", { required: true }),
        zone: core.getInput("cluster-zone", { required: true }),
        chart: core.getInput("chart-name", { required: true }),
        path: core.getInput("chart-path", { required: true }),
        namespace: core.getInput("namespace", { required: true }),
        image_tag: core.getInput("image-tag", { required: true }),
      }),
    })
    const workspace = process.env.GITHUB_WORKSPACE || "./"
    const outFile = join(workspace, core.getInput("output"))
    const outDir = dirname(outFile)
    await fsPromises.writeFile(outFile, JSON.stringify(data))
    const uploadResponse = await artifact
      .create()
      .uploadArtifact("deploy-payload", [outFile], outDir)
    core.setOutput("deployment", JSON.stringify(data))
    core.setOutput("upload-response", JSON.stringify(uploadResponse))
    console.log("created deployment %s", data.url)
  } catch (error) {
    core.setFailed(`action failed with error ${error.message}`)
  }
}

run()
