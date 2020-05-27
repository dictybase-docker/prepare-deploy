import * as core from "@actions/core"
import * as githubMock from "@actions/github"

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
  getInput: jest.fn(input => input)
}))

test('mocking of getInput from core action', () => {
  core.getInput("hello")
  expect(core.getInput).toBeCalledWith("hello")
  core.getInput("token")
  expect(core.getInput).toBeCalledWith("token")
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


