import * as tmp from "tmp-promise"
import * as core from "@actions/core"
import * as githubMock from "@actions/github"
import * as artifact from "@actions/artifact"
import { run } from "../src/main"

const deployUrl = "https://api.github.com/repos/octocat/example/deployments/1"
jest.mock("@actions/github", () => {
  return {
    GitHub: jest.fn().mockImplementation(() => {
      return {
        repos: {
          createDeployment: jest.fn().mockResolvedValue({
            data: {
              url: deployUrl
            }
          })
        }
      }
    }),
    context: {
      repo: { owner: "kramerica", repo: "nyc" }
    }
  }
})
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
    const octokit = new githubMock.GitHub('token')
    const { data } = await octokit.repos.createDeployment({
      owner: owner,
      repo: repo,
      ref: "ref"
    })
    expect(data.url).toEqual(deployUrl)
  })
})

describe('action runner', () => {
  beforeEach(async () => {
    const fs = await tmp.dir()
    process.env.GITHUB_WORKSPACE = fs.path
  })
  test('mocking output', async () => {
    const value = await run()
    expect(value).toBeUndefined()
    // expect(core.setOutput).nthCalledWith(1, "deployment-response",
    //  {
    //   data: { url: deployUrl }
    // })
    expect(core.setOutput).nthCalledWith(2, "upload-response",
      {
        artifactName: "artifact",
        artifactItems: ["one", "two"],
        size: 20,
      })
    expect(core.setOutput).toHaveReturnedTimes(2)
    //expect(core.setOutput).nthReturnedWith(1, { key: "deployment-response", value: { data: { url: deployUrl } } })
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


