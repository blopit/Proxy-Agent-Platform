// CopilotKit temporarily disabled - will be re-enabled after proper configuration
// import { CopilotBackend, OpenAIAdapter } from '@copilotkit/backend'

// const copilotKit = new CopilotBackend()

export async function POST(req: Request) {
  // Temporary mock response until CopilotKit is properly configured
  return new Response(JSON.stringify({
    message: "CopilotKit is temporarily disabled",
    status: "disabled"
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}