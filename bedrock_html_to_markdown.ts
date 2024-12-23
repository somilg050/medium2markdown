import { BedrockAgentRuntime } from '@aws-sdk/client-bedrock-agent-runtime';
import { NextResponse } from 'next/server';

const bedrockAgent = new BedrockAgentRuntime({
  region: 'us-east-1',
  // Ensure AWS credentials are properly configured in your environment
});

const agentId = 'NRQ9XRQBRZ';
const agentAliasId = 'LATEST'; // Or your specific alias ID

async function fetchAndParseSections(url: string) {
  const payload = JSON.stringify({ url });
  // Call the Flask API endpoint
  const response = await fetch('<Your Flask Server Deployment URL>', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: payload,
  });
  const data = await response.json();
  const html = data.html;
  // Parse everything inside <article> tags using a regular expression
  return html.match(/<article[^>]*>[\s\S]*?<\/article>/g);
}

async function createAgentSession() {
  const response = await bedrockAgent.createSession({
    agentId,
    agentAliasId,
  });
  return response.sessionId;
}

async function invokeAgent(sessionId: string, message: string) {
  const response = await bedrockAgent.invokeAgent({
    agentId,
    agentAliasId,
    sessionId,
    inputText: message,
  });
  
  return response;
}

function parseResponse(response: any) {
  // Extract the completion from Bedrock agent response
  // Adjust this based on the actual response structure
  if (response.completion) {
    return response.completion;
  }
  return response.toString();
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const sections = await fetchAndParseSections(url);
    
    // Create a new session
    const sessionId = await createAgentSession();
    
    // Invoke the agent with the content
    const agentResponse = await invokeAgent(
      sessionId,
      JSON.stringify(sections[0])
    );
    
    // Parse and return the response
    const parsedResponse = parseResponse(agentResponse);
    
    return NextResponse.json(
      { response: parsedResponse },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
