import { NextResponse } from 'next/server';
import OpenAIApi from 'openai';

// Use the OPENAI_API_KEY environment variable
const openai = new OpenAIApi({
  apiKey: '<Your OpenAI API Key>',
});

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const assistantId = '<assistantId>';

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

async function createThreadAndRun(assistantId: string, message: string) {
  return openai.beta.threads.createAndRun({
    assistant_id: assistantId,
    thread: {
      messages: [{ role: 'user', content: message }],
    },
  });
}

async function listMessages(threadId: string) {
  return openai.beta.threads.messages.list(threadId);
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
    const thread = await createThreadAndRun(
      assistantId,
      JSON.stringify(sections[0]),
    );

    const threadId = thread.thread_id;

    console.log(`Thread created and assistant running with ID: ${threadId}`);

    // Retry fetching messages until successful or max retries reached
    const maxRetries = 10;
    const retryInterval = 3000; // 3 seconds
    let retryCount = 0;

    //wait 5 seconds initially
    await new Promise((resolve) => setTimeout(resolve, retryInterval));

    let messages: OpenAIApi.Beta.Threads.Messages.Message[] = [];

    while (retryCount < maxRetries) {
      // Retrieve messages from the thread
      try {
        const response = await listMessages(threadId);
        messages = response.data;
        if (
          response.data &&
          response.data.length > 1 &&
          messages[0]?.content[0]?.['text'].value
        ) {
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
        retryCount++;
      } catch (e) {
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
        retryCount++;
      }
    }
    if (retryCount === maxRetries) {
      return NextResponse.json(
        { error: 'Please try again after some time.' },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        response: parseMarkdownContent(
          `${messages[0].content[0]['text'].value}`,
        ),
      },
      { status: 200 },
    );
  } else {
    return NextResponse.json(
      { error: 'Please provide a valid URL.' },
      { status: 400 },
    );
  }
}
