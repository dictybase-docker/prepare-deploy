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
      "image-repository",
      "image-tag",
      "ref",
      "token",
    ]
    const octokit = new github.GitHub(core.getInput("token"), {
      required: true,
    })
    const { repo, owner } = github.context.repo
    const ref = core.getInput("ref", { required: true })
    const resp = octokit.repos.createDeployment({
      owner: owner,
      repo: repo,
      ref: ref,
      auto_merge: false,
      required_contexts: [],
      description: "deploy request from dictybaseBot",
      payload: JSON.stringify({
        cluster: core.getInput("cluster-name", { required: true }),
        zone: core.getInput("cluster-zone", { required: true }),
        chart: core.getInput("chart-name", { required: true }),
        path: core.getInput("chart-path", { required: true }),
        namespace: core.getInput("namespace", { required: true }),
        image_tag: core.getInput("image-tag", { required: true }),
      }),
    })
    octokit.log.info(`preapred deployment for ref ${ref} in ${owner}/${repo}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
