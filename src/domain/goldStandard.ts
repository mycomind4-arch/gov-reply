export type GovReplyGoldStage =
  | 'receive'
  | 'understand'
  | 'deadline'
  | 'evidence'
  | 'strategy'
  | 'response'
  | 'review'
  | 'authorization'
  | 'submission'
  | 'tracking'
  | 'proof'

export type GovReplyGateResult = {
  passed: boolean
  evidenceIds: string[]
  message?: string
}

export type GovReplyStageResult = {
  stage: GovReplyGoldStage
  status: 'passed' | 'blocked' | 'failed'
  evidenceIds: string[]
  messages: string[]
}

export type GovReplyGoldDependencies = Record<GovReplyGoldStage, () => Promise<GovReplyGateResult>>

export type GovReplyGoldResult = {
  status: 'completed' | 'blocked' | 'failed'
  stages: GovReplyStageResult[]
}

export async function runGovReplyGoldWorkflow(
  dependencies: GovReplyGoldDependencies,
): Promise<GovReplyGoldResult> {
  const stages: GovReplyStageResult[] = []
  const ordered: GovReplyGoldStage[] = [
    'receive', 'understand', 'deadline', 'evidence', 'strategy', 'response',
    'review', 'authorization', 'submission', 'tracking', 'proof',
  ]

  for (const stage of ordered) {
    try {
      const result = await dependencies[stage]()
      const evidenceIds = result.evidenceIds.filter((id) => id.trim().length > 0)
      if (result.passed && evidenceIds.length === 0) {
        stages.push({
          stage,
          status: 'blocked',
          evidenceIds,
          messages: [result.message ?? `${stage} passed without evidence; Gold Standard execution requires provenance.`],
        })
        return { status: 'blocked', stages }
      }

      const status = result.passed ? 'passed' : 'blocked'
      stages.push({
        stage,
        status,
        evidenceIds,
        messages: result.passed ? [] : [result.message ?? `${stage} gate did not pass`],
      })
      if (!result.passed) return { status: 'blocked', stages }
    } catch (error) {
      stages.push({
        stage,
        status: 'failed',
        evidenceIds: [],
        messages: [error instanceof Error ? error.message : String(error)],
      })
      return { status: 'failed', stages }
    }
  }

  return { status: 'completed', stages }
}
