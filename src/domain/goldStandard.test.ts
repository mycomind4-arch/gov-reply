import { describe, expect, it } from 'vitest'
import { runGovReplyGoldWorkflow } from './goldStandard'

const passed = () => ({
  receive: async () => ({ passed: true, evidenceIds: ['receive:request'] }),
  understand: async () => ({ passed: true, evidenceIds: ['understand:notice'] }),
  deadline: async () => ({ passed: true, evidenceIds: ['deadline:source'] }),
  evidence: async () => ({ passed: true, evidenceIds: ['evidence:document'] }),
  strategy: async () => ({ passed: true, evidenceIds: ['strategy:review'] }),
  response: async () => ({ passed: true, evidenceIds: ['response:draft'] }),
  review: async () => ({ passed: true, evidenceIds: ['review:approval'] }),
  authorization: async () => ({ passed: true, evidenceIds: ['authorization:actor'] }),
  submission: async () => ({ passed: true, evidenceIds: ['submission:provider'] }),
  tracking: async () => ({ passed: true, evidenceIds: ['tracking:number'] }),
  proof: async () => ({ passed: true, evidenceIds: ['proof:provider'] }),
})

describe('GovReply Gold Standard workflow', () => {
  it('requires the full lifecycle before completion', async () => {
    const result = await runGovReplyGoldWorkflow(passed())
    expect(result.status).toBe('completed')
    expect(result.stages.map(stage => stage.stage)).toEqual([
      'receive', 'understand', 'deadline', 'evidence', 'strategy', 'response',
      'review', 'authorization', 'submission', 'tracking', 'proof',
    ])
    expect(result.stages.every(stage => stage.evidenceIds.length > 0)).toBe(true)
  })

  it('blocks submission when review fails', async () => {
    const dependencies = passed()
    dependencies.review = async () => ({ passed: false, evidenceIds: [], message: 'review failed' })
    const result = await runGovReplyGoldWorkflow(dependencies)

    expect(result.status).toBe('blocked')
    expect(result.stages.at(-1)?.stage).toBe('review')
    expect(result.stages.some(stage => stage.stage === 'submission')).toBe(false)
  })

  it('requires explicit authorization before submission', async () => {
    const dependencies = passed()
    dependencies.authorization = async () => ({ passed: false, evidenceIds: [], message: 'authorization failed' })
    const result = await runGovReplyGoldWorkflow(dependencies)

    expect(result.status).toBe('blocked')
    expect(result.stages.at(-1)?.stage).toBe('authorization')
    expect(result.stages.some(stage => stage.stage === 'submission')).toBe(false)
  })

  it('requires tracking and proof before completion', async () => {
    const dependencies = passed()
    dependencies.proof = async () => ({ passed: false, evidenceIds: [], message: 'proof unavailable' })
    const result = await runGovReplyGoldWorkflow(dependencies)

    expect(result.status).toBe('blocked')
    expect(result.stages.at(-1)?.stage).toBe('proof')
  })

  it('blocks a stage that claims success without provenance', async () => {
    const dependencies = passed()
    dependencies.evidence = async () => ({ passed: true, evidenceIds: [], message: 'nothing was grounded' })
    const result = await runGovReplyGoldWorkflow(dependencies)

    expect(result.status).toBe('blocked')
    expect(result.stages.at(-1)?.stage).toBe('evidence')
    expect(result.stages.at(-1)?.status).toBe('blocked')
  })
})
