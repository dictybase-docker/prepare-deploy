import nock from "nock"

describe("action test suite", () => {
  it("creates a deployment", async () => {
    process.env["INPUT_TOKEN"] = "token"
    process.env["GITHUB_REPOSITORY"] = "dictybase-docker/prepare-deploy"
    process.env["INPUT_REF"] = "ref/head/test-ref"
    process.env["INPUT_CLUSTER-NAME"] = "dictybase-docker"
    process.env["INPUT_CLUSTER-ZONE"] = "us-central1-a"
    process.env["INPUT_CHART-NAME"] = "prepare-deploy"
    process.env["INPUT_CHART-PATH"] = "deployments/prepare-deploy"
    process.env["INPUT_NAMESPACE"] = "dictyBase"
    process.env["INPUT_IMAGE-TAG"] = "abcd"

    nock("https://api.github.com")
      .persist()
      .post(
        "/repos/dictybase-docker/prepare-deployment/deployments",
        JSON.stringify({
          owner: "dictybase-docker",
          repo: "prepare-deploy",
          ref: "ref",
          auto_merge: false,
          required_contexts: [],
          description: "deploy created by dictybot",
          payload: {
            cluster: "seinfeld",
            zone: "us-central1-a",
            chart: "prepare-deploy",
            path: "deployments/prepare-deploy",
            namespace: "dictybase",
            image_tag: "abcd",
          },
        }),
      )
      .reply(200)
    const main = require("../src/main")

    await main.run()
  })
})
