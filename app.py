from flask import Flask, render_template, jsonify, request
import urllib.request
import json
from dotenv import load_dotenv
import os
from flask_cors import CORS

# 환경 변수 로드
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5500", "http://127.0.0.1:5500"])

# 기본 경로 (index.html 렌더링)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cafe')
def cafe():
    return render_template('cafe.html')

@app.route('/restaurant')
def restaurant():
    return render_template('restaurant.html')

@app.route('/attraction')
def attraction():
    return render_template('attraction.html')



# 네이버 API 클라이언트 설정
NAVER_CLIENT_ID = os.getenv('NAVER_CLIENT_ID')
NAVER_CLIENT_SECRET = os.getenv('NAVER_CLIENT_SECRET')

def getRequestUrl(url):
    req = urllib.request.Request(url)
    req.add_header("X-Naver-Client-ID", NAVER_CLIENT_ID)
    req.add_header("X-Naver-Client-Secret", NAVER_CLIENT_SECRET)

    try:
        response = urllib.request.urlopen(req)
        if response.getcode() == 200:
            return response.read().decode('utf-8')
        else:
            print(f"Error: {response.getcode()} - {url}")
            return None
    except Exception as e:
        print(f"Exception: {str(e)} - {url}")
        return None

def getNaverSearch(node, query, start, display):
    base = "https://openapi.naver.com/v1/search"
    node = f"/{node}.json"
    parameters = f"?query={urllib.parse.quote(query)}&start={start}&display={display}"

    url = base + node + parameters
    response = getRequestUrl(url)
    if response:
        return json.loads(response)
    else:
        return None

@app.route('/fetchBlogLinks', methods=['GET'])
def fetch_blog_links():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Query parameter is required"}), 400

    # 네이버 API에서 블로그 검색
    result = getNaverSearch('blog', query, 1, 25)
    print(result)  # 응답 내용 로그로 출력

    if result is None:
        return jsonify({"error": "Failed to fetch data from Naver"}), 500

    # 'items' 키 존재 여부 확인
    if 'items' in result:
        return jsonify(result['items'])
    else:
        return jsonify({"error": "No items found in Naver response"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5500)
