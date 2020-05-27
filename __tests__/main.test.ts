import * as core from "@actions/core"
import * as githubMock from "@actions/github"
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

jest.mock("@actions/core", () => ({
  getInput: jest.fn(input => input),
  setOutput: jest.fn((key, value) => { return { key: key, value: value } })
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
    expect(core.setOutput).toReturnWith({ key: "jerry", value: "seinfeld" })
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

test('test action runner', async () => {
})


