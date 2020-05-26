import nock from "nock"

/**
 * Based on https://github.com/actions/toolkit/blob/5feb835dff800f53c9f6d8989f0b503262aade87/docs/github-package.md
 */

describe("action test suite", () => {
  const owner = "dictybase-docker"
  const repo = "prepare-deploy"
  const ref = "ref/head/test-ref"
  const cluster = "testkube"
  const zone = "us-central1-a"
  const chart = "prepare-deploy"
  const chartPath = "deployments/prepare-deploy"
  const namespace = "dictybase"
  const imageTag = "abcd"
  const payload = JSON.stringify({
    cluster: cluster,
    zone: zone,
    chart: chart,
    path: chartPath,
    namespace: namespace,
    image_tag: imageTag,
  })

  it("creates a deployment", async () => {
    process.env["INPUT_TOKEN"] = "token"
    process.env["GITHUB_REPOSITORY"] = `${owner}/${repo}`
    process.env["INPUT_REF"] = ref
    process.env["INPUT_CLUSTER-NAME"] = cluster
    process.env["INPUT_CLUSTER-ZONE"] = zone
    process.env["INPUT_CHART-NAME"] = chart
    process.env["INPUT_CHART-PATH"] = chartPath
    process.env["INPUT_NAMESPACE"] = namespace
    process.env["INPUT_IMAGE-TAG"] = imageTag

    nock("https://api.github.com")
      .persist()
      .post(
        "/repos/dictybase-docker/prepare-deploy/deployments",
        JSON.stringify({
          ref: ref,
          auto_merge: false,
          required_contexts: [],
          description: "deploy request from dictybasebot",
          payload,
        }),
      )
      .reply(200)

    const main = require("../src/main")
    await main.run()
  })
})
