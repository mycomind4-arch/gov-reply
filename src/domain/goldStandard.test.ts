import { describe, expect, it } from 'vitest'
import { runGovReplyGoldWorkflow } from './goldStandard'

const passed = () => ({
  receive: async () => true,
  understand: async () => true,
  deadline: async () => true,
  evidence: async () => true,
  strategy: async () => true,
  response: async () => true,
  review: async () => true,
  authorization: async () => true,
  submission: async () => true,
  tracking: async () => true,
  proof: async () => true,
})

describe('GovReply Gold Standard workflow', () => {
  it('requires the full lifecycle before completion', async () => {
    const result = await runGovReplyGoldWorkflow(passed())
    expect(result.status).toBe('completed')
    expect(result.stages.map(stage => stage.stage)).toEqual([
      'receive', 'understand', 'deadline', 'evidence', 'strategy', 'response',
      'review', 'authorization', 'submission', 'tracking', 'proof',
    ])
  })

  it('blocks submission when review fails', async () => {
    const dependencies = passed()
    dependencies.review = async () => false
    const result = await runGovReplyGoldWorkflow(dependencies)

    expect(result.status).toBe('blocked')
    expect(result.stages.at(-1)?.stage).toBe('review')
    expect(result.stages.some(stage => stage.stage === 'submission')).toBe(false)
  })

  it('requires explicit authorization before submission', async () => {
    const dependencies = passed()
    dependencies.authorization = async () => false
    const result = await runGovReplyGoldWorkflow(dependencies)

    expect(result.status).toBe('blocked')
    expect(result.stages.at(-1)?.stage).toBe('authorization')
    expect(result.stages.some(stage => stage.stage === 'submission')).toBe(false)
  })

  it('requires tracking and proof before completion', async () => {
    const dependencies = passed()
    dependencies.proof = async () => false
    const result = await runGovReplyGoldWorkflow(dependencies)

    expect(result.status).toBe('blocked')
    expect(result.stages.at(-1)?.stage).toBe('proof')
  })
})
