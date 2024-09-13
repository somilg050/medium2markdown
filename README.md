# medium2markdown

This project provides a Flask-based API that fetches HTML content from a given URL and converts it to Markdown format using OpenAI's assistant. 
It's a two-step process: first fetching and parsing the HTML, then sending it to OpenAI for conversion to Markdown.

## Features

- Fetch HTML content from any given URL
- Parse HTML using BeautifulSoup
- Convert HTML to Markdown using OpenAI's assistant
- Return the converted Markdown as a JSON response
- Error handling for invalid requests or processing failures

## Requirements

- Python 3.6+
- Flask
- BeautifulSoup4
- Requests
- OpenAI Python library

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/html-to-markdown-api.git
   cd html-to-markdown-api
   ```

2. Create a virtual environment (optional but recommended):
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. Install the required packages:
   ```
   pip install flask beautifulsoup4 requests openai
   ```

4. Set up your OpenAI API key:
   - Create a `.env` file in the project root
   - Add your OpenAI API key: `OPENAI_API_KEY=your_api_key_here`

## Usage

1. Start the Flask server:
   ```
   python app.py
   ```

2. The server will start running on `http://127.0.0.1:5000/`.

3. To convert HTML to Markdown, send a POST request to the `/convert_to_markdown` endpoint with a JSON body containing the URL:

   ```
   POST /convert_to_markdown
   Content-Type: application/json

   {
     "url": "https://example.com"
   }
   ```

4. The API will respond with a JSON object containing the Markdown content:

   ```json
   {
     "markdown": "# Example Heading\n\nThis is some converted markdown content..."
   }
   ```

## API Endpoints

### 1. Fetch HTML Content

- **Endpoint:** `/get_html`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "url": "https://example.com"
  }
  ```
- **Response:**
  ```json
  {
    "html": "<html>...</html>"
  }
  ```

### 2. Convert HTML to Markdown

- **Endpoint:** `/convert_to_markdown`
- **Method:** POST
- **Request Body:**
  ```json
  {
    "url": "https://example.com"
  }
  ```
- **Response:**
  ```json
  {
    "markdown": "# Converted Markdown Content..."
  }
  ```

## Error Handling

- If the URL is not provided in the request body, the API will return a 400 error.
- If there's an error fetching the URL, the API will return the error message in the response.
- If there's an error during the OpenAI conversion process, the API will return a 500 error with details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
