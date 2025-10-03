import { CopilotBackend, OpenAIAdapter } from '@copilotkit/backend'

const copilotKit = new CopilotBackend()

export async function POST(req: Request) {
  const { handleRequest } = copilotKit
  return handleRequest(req, new OpenAIAdapter())
}