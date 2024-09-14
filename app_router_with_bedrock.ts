import { NextResponse } from 'next/server';
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Initialize the Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: "us-east-1", // Replace with your AWS region
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const maxDuration = 60;
export const dynamic = 'force-dynamic';
const modelId = "anthropic.claude-3-sonnet-20240229-v1:0"; // Claude 3.5 Sonnet model ID

async function fetchAndParseSections(url: string) {
  try {
    // Prepare the payload
    const payload = JSON.stringify({ url });
    // Call the Flask API endpoint
    const response = await fetch('<Your Flask Server Deployment URL>', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    // Get the JSON response
    const data = await response.json();
    // Extract the HTML content from the response
    const html = data.html;
    // Parse everything inside <article> tags using a regular expression
    return html.match(/<article[^>]*>[\s\S]*?<\/article>/g);
  } catch (error) {
    // Handle errors (e.g., network issues, parsing issues)
    throw new Error(`HTTP error! Status: ${500}`);
  }
}

async function invokeBedrockModel(prompt: string) {
  const input = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    top_p: 1,
  };

  const command = new InvokeModelCommand({
    modelId: modelId,
    body: JSON.stringify(input),
    contentType: "application/json",
    accept: "application/json",
  });

  try {
    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    return responseBody.content[0].text;
  } catch (error) {
    console.error("Error invoking Bedrock model:", error);
    throw error;
  }
}

function parseMarkdownContent(markdownString: string) {
  // Regular expression to match and extract the content within the Markdown code block
  const codeBlockMatch = markdownString.match(/```markdown\s([\s\S]*?)\s```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    // Extracted content without the surrounding triple backticks and the word "markdown"
    return codeBlockMatch[1].trim();
  } else {
    return markdownString;
  }
}

export async function POST(req: Request) {
  const { url } = await req.json();
  // parse everything inside section tag
  const sections = await fetchAndParseSections(url);
  if (sections) {
    const prompt = `Analyze and summarize the following article section: ${JSON.stringify(sections[0])}`;
    
    try {
      const response = await invokeBedrockModel(prompt);
      return NextResponse.json(
        {
          response: parseMarkdownContent(response),
        },
        { status: 200 },
      );
    } catch (error) {
      return NextResponse.json(
        { error: 'An error occurred while processing your request.' },
        { status: 500 },
      );
    }
  } else {
    return NextResponse.json(
      { error: 'Please provide a valid URL.' },
      { status: 400 },
    );
  }
}
