# medium2markdown

This project provides a solution for fetching HTML content from URLs and converting it to Markdown format using OpenAI's assistant. It consists of two main components:

1. A Flask-based API for fetching HTML content
2. A Next.js application (using App Router) that handles the OpenAI integration for converting HTML to Markdown

## Backend: Flask API for HTML Fetching

### Setup

1. Install dependencies:
   ```
   pip install flask beautifulsoup4 requests
   ```

2. Run the Flask server:
   ```
   python app.py
   ```

### API Endpoint

- **URL:** `/get_html`
- **Method:** POST
- **Body:**
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

## Frontend: Next.js App with OpenAI Integration

### Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   Create a `.env.local` file with:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

3. Run the development server:
   ```
   npm run dev
   ```

### Key Components

- `app/page.js`: Main page component
- `app/api/convert/route.js`: API route for HTML to Markdown conversion

## Usage

1. Start both the Flask backend and Next.js frontend.
2. Navigate to the Next.js app in your browser.
3. Enter a URL to fetch its HTML and convert it to Markdown.

## Error Handling

- Backend errors (e.g., invalid URLs) are handled and displayed in the frontend.
- Frontend errors (e.g., OpenAI API issues) are caught and shown to the user.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).
