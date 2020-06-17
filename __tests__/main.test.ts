import { promises as fsPromises } from "fs"
import { join } from "path"
import { run } from "../src/main"
import * as tmp from "tmp-promise"
import * as core from "@actions/core"
import * as githubMock from "@actions/github"
import * as artifact from "@actions/artifact"

const deployUrl = "https://api.github.com/repos/octocat/example/deployments/1"
jest.mock("@actions/artifact", () => {
  return {
    create: jest.fn().mockImplementation(() => {
      return {
        uploadArtifact: jest.fn().mockResolvedValue({
          artifactName: "artifact",
          artifactItems: ["one", "two"],
          size: 20,
        })
      }
    }),
  }
})
jest.mock("@actions/core", () => ({
  getInput: jest.fn(input => input),
  setOutput: jest.fn((key, value) => { return { key: key, value: value } }),
  setFailed: jest.fn(msg => msg)
}))
jest.mock("@actions/github", () => ({
  getOctokit: jest.fn().mockImplementation(() => {
    return {
      repos: {
        createDeployment: jest.fn().mockResolvedValue({ data: { url: deployUrl } })
      }
    }
  }),
  context: { repo: { owner: "kramerica", repo: "nyc" } }
}))

describe('core action module', () => {
  test('mocking of getInput', () => {
    core.getInput("hello")
    expect(core.getInput).toBeCalledWith("hello")
    core.getInput("token")
    expect(core.getInput).toBeCalledWith("token")
  })
  test('mocking of setOuput', () => {
    core.setOutput("jerry", "seinfeld")
    core.setOutput("george", { data: "costanza" })
    expect(core.setOutput).nthReturnedWith(1, { key: "jerry", value: "seinfeld" })
    expect(core.setOutput).nthReturnedWith(2, { key: "george", value: { data: "costanza" } })
  })
  test('mocking of setFailed', () => {
    core.setFailed("failed")
    expect(core.setFailed).toBeCalledWith("failed")
  })
})

describe('core github module', () => {
  test('mocking of context', () => {
    const { owner, repo } = githubMock.context.repo
    expect(owner).toEqual("kramerica")
    expect(repo).toEqual("nyc")
  })
  test('mocking of octokit instance', async () => {
    const { owner, repo } = githubMock.context.repo
    const octokit = githubMock.getOctokit('token')
    const { data } = await octokit.repos.createDeployment({
      owner: owner,
      repo: repo,
      ref: "ref"
    })
    expect(data).toEqual({ url: deployUrl })
  })
})

describe('action runner', () => {
  let fs: tmp.DirectoryResult
  beforeEach(async () => {
    fs = await tmp.dir()
    process.env.GITHUB_WORKSPACE = fs.path
  })
  test('content of output artifact', async () => {
    const value = await run()
    expect(value).toBeUndefined()
    const content = await fsPromises.readFile(join(fs.path, "artifact-file"), 'utf-8')
    expect(JSON.parse(content)).toMatchObject({ url: deployUrl })
  })
  test('mocking of action output', async () => {
    const value = await run()
    expect(core.setOutput).nthCalledWith(1, "deployment-response", { url: deployUrl })
    expect(core.setOutput).nthCalledWith(2, "upload-response", {
      artifactName: "artifact",
      artifactItems: ["one", "two"],
      size: 20,
    })
    expect(core.setOutput).toHaveReturnedTimes(2)
    expect(core.setOutput).nthReturnedWith(1, { key: "deployment-response", value: { url: deployUrl } })
    expect(core.setOutput).nthReturnedWith(2, {
      key: "upload-response",
      value: {
        artifactName: "artifact",
        artifactItems: ["one", "two"],
        size: 20,
      }
    })
    expect(core.setFailed).not.toHaveBeenCalled()
  })
})


