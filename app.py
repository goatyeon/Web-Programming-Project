from flask import Flask, request, jsonify, render_template
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/crawl', methods=['GET'])
def crawl_info():
    # Get the destination parameter from the query string
    destination = request.args.get('destination')
    if not destination:
        return jsonify({'error': 'Please provide a destination'}), 400

    # Add "weather" to the destination to search for weather information
    weather_query = destination + " 날씨"

    # Function to fetch search results from Google
    def fetch_google_results(query):
        search_url = f'https://www.google.com/search?q={query}'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }

        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        search_results = []
        for g in soup.find_all('div', class_='tF2Cxc'):
            link = g.find('a')['href']
            title = g.find('h3').text if g.find('h3') else ''
            description = g.find('span', class_='aCOpRe').text if g.find('span', class_='aCOpRe') else ''
            search_results.append({'title': title, 'url': link, 'description': description})

        return search_results

    # Function to fetch search results from Naver
    def fetch_naver_results(query):
        search_url = f'https://search.naver.com/search.naver?query={query}'
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
        }

        response = requests.get(search_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')

        search_results = []
        # Find Naver's search result links (these can vary depending on the page structure)
        for result in soup.find_all('div', class_='api_subject_bx'):
            link = result.find('a')['href']
            title = result.find('strong').text if result.find('strong') else ''
            search_results.append({'title': title, 'url': link})

        return search_results

    # Fetch Google and Naver results for the weather query
    google_results = fetch_google_results(weather_query)
    naver_results = fetch_naver_results(weather_query)

    # Return the results as a JSON response
    return jsonify({
        'destination': destination,
        'google_results': google_results,
        'naver_results': naver_results
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

