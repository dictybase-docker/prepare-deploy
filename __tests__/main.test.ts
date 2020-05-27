import * as core from "@actions/core"
import * as githubMock from "@actions/github"

jest.mock("@actions/github", () => {
  return {
    Github: jest.fn(() => {
      return {
        repos: {
          createDeployment: jest.fn().mockResolvedValue({
            data: {
              url: "https://api.github.com/repos/octocat/example/deployments/1"
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
  test('mocking of context module', () => {
    const { owner, repo } = githubMock.context.repo
    expect(owner).toEqual("kramerica")
    expect(repo).toEqual("nyc")
  })
})


