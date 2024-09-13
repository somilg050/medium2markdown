from flask import Flask, jsonify, request
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time

app = Flask(__name__)


def get_website_html(url):
    # Set up headless Chrome options
    chrome_options = Options()
    # chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Initialize the WebDriver with ChromeDriverManager
    driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=chrome_options)
    driver.get(url)

    print("Pausing for 5 seconds to allow the page to load...")
    time.sleep(5)  # Pause for 5 seconds

    # Get the HTML content of the page
    html_content = driver.page_source

    # Close the WebDriver
    driver.quit()

    return html_content


@app.route('/get_html', methods=['POST'])
def get_html():
    print('Fetching the HTML content of a website...')

    # Get the URL from the request body
    data = request.get_json()
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required in the request body'}), 400

    url = data['url']
    html_content = get_website_html(url)

    # Parse the HTML content with BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')

    # Return the HTML content as a JSON response
    return jsonify({'html': str(soup)})


if __name__ == '__main__':
    app.run(debug=True)
