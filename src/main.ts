import * as core from "@actions/core"
import * as github from "@actions/github"

interface deploymentParams {
  client: github.GitHub
  owner: string
  repo: string
  ref: string
  auto_merge: boolean
  required_contexts: Array<string>
  description: string
  payload: string
}

async function runGithubDeployment(params: deploymentParams): Promise<string> {
  const resp = await params.client.repos.createDeployment({
    owner: params.owner,
    repo: params.repo,
    ref: params.ref,
    auto_merge: params.auto_merge,
    required_contexts: params.required_contexts,
    description: params.description,
    payload: params.payload,
  })
  return resp.data.url
}

async function run(): Promise<void> {
  try {
    const octokit = new github.GitHub(core.getInput("token"), {
      required: true,
    })
    const { repo, owner } = github.context.repo
    const ref = core.getInput("ref", { required: true })
    const url = await runGithubDeployment({
      client: octokit,
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
    console.log("created deployment %s", url)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
