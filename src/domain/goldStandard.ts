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

export type GovReplyStageResult = {
  stage: GovReplyGoldStage
  status: 'passed' | 'blocked' | 'failed'
  messages: string[]
}

export type GovReplyGoldDependencies = {
  receive: () => Promise<boolean>
  understand: () => Promise<boolean>
  deadline: () => Promise<boolean>
  evidence: () => Promise<boolean>
  strategy: () => Promise<boolean>
  response: () => Promise<boolean>
  review: () => Promise<boolean>
  authorization: () => Promise<boolean>
  submission: () => Promise<boolean>
  tracking: () => Promise<boolean>
  proof: () => Promise<boolean>
}

export type GovReplyGoldResult = {
  status: 'completed' | 'blocked' | 'failed'
  stages: GovReplyStageResult[]
}

export async function runGovReplyGoldWorkflow(
  dependencies: GovReplyGoldDependencies,
): Promise<GovReplyGoldResult> {
  const stages: GovReplyStageResult[] = []
  const ordered: Array<[GovReplyGoldStage, () => Promise<boolean>]> = [
    ['receive', dependencies.receive],
    ['understand', dependencies.understand],
    ['deadline', dependencies.deadline],
    ['evidence', dependencies.evidence],
    ['strategy', dependencies.strategy],
    ['response', dependencies.response],
    ['review', dependencies.review],
    ['authorization', dependencies.authorization],
    ['submission', dependencies.submission],
    ['tracking', dependencies.tracking],
    ['proof', dependencies.proof],
  ]

  for (const [stage, action] of ordered) {
    try {
      const passed = await action()
      stages.push({
        stage,
        status: passed ? 'passed' : 'blocked',
        messages: passed ? [] : [`${stage} gate did not pass`],
      })
      if (!passed) return { status: 'blocked', stages }
    } catch (error) {
      stages.push({
        stage,
        status: 'failed',
        messages: [error instanceof Error ? error.message : String(error)],
      })
      return { status: 'failed', stages }
    }
  }

  return { status: 'completed', stages }
}
