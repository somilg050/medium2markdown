import { NextResponse } from 'next/server';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Initialize the Bedrock Agent Runtime client
const bedrockAgentClient = new BedrockAgentRuntimeClient({
  region: "us-east-1", // Replace with your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Replace these with your actual Bedrock Agent details
const agentId = 'your-agent-id';
const agentAliasId = 'your-agent-alias-id';

async function invokeBedrockAgent(sessionId: string, inputText: string) {
  const command = new InvokeAgentCommand({
    agentId: agentId,
    agentAliasId: agentAliasId,
    sessionId: sessionId,
    inputText: inputText,
  });

  try {
    const response = await bedrockAgentClient.send(command);
    return response.completion;
  } catch (error) {
    console.error("Error invoking Bedrock Agent:", error);
    throw error;
  }
}

export async function POST(req: Request) {
  const { message, sessionId } = await req.json();

  if (!message || !sessionId) {
    return NextResponse.json(
      { error: 'Please provide both a message and a sessionId.' },
      { status: 400 },
    );
  }

  try {
    const response = await invokeBedrockAgent(sessionId, message);
    return NextResponse.json(
      {
        response: response,
        sessionId: sessionId
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 },
    );
  }
}
