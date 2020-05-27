import * as core from "@actions/core"
import * as github from "@actions/github"

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
    core.setOutput("create-deploy", data.url)
    console.log("created deployment %s", data.url)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
