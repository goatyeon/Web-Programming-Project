let map;
let markers = [];
let currentPlace = null;  // 현재 선택된 장소를 저장할 변수

// 맵 초기화
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 37.631813, lng: 127.077406 }, // 서울과학기술대학교 위치
        zoom: 15,
    });

    // 검색창에서 동네와 카테고리 입력 시 장소 검색
    document.getElementById("search-button").addEventListener("click", () => {
        const location = document.getElementById("search-input").value;
        searchPlaces("음식점", location);  // "음식점" 카테고리로 검색
    });

    document.getElementById("search-input").addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const location = document.getElementById("search-input").value;
            searchPlaces("음식점", location);
        }
    });
}

// 장소 검색
async function searchPlaces(category, location) {
    document.getElementById("loading-spinner").classList.remove("hidden");  // 로딩 표시

    const service = new google.maps.places.PlacesService(map);

    service.textSearch(
        { query: `${location} ${category}`, location: map.getCenter(), radius: 1000 },
        (results, status) => {
            document.getElementById("loading-spinner").classList.add("hidden");  // 로딩 숨기기
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                clearMarkers();
                results.forEach((place) => {
                    const marker = new google.maps.Marker({
                        position: place.geometry.location,
                        map,
                        title: place.name,
                    });
                    markers.push(marker);

                    google.maps.event.addListener(marker, "click", () => {
                        currentPlace = place;  // 클릭된 장소 저장
                        showPlaceInfo(place);  // 해당 장소의 정보 표시
                        fetchBlogLinks(place.name);  // 해당 장소에 대한 블로그 크롤링 수행
                    });

                    // 검색된 첫 번째 장소로 지도 화면 이동
                    if (results.indexOf(place) === 0) {
                        map.setCenter(place.geometry.location);
                        map.setZoom(14);  // 지도 줌 레벨 설정
                    }
                });
            }
        }
    );
}

// 마커 초기화
function clearMarkers() {
    markers.forEach((marker) => marker.setMap(null));
    markers = [];
}

// 장소 정보 표시
function showPlaceInfo(place) {
    const existingInfoBox = document.querySelector('.place-info-box');
    if (existingInfoBox) {
        existingInfoBox.remove();
    }

    const newInfoBox = document.createElement('div');
    newInfoBox.classList.add('place-info-box');

    const reviews = place.reviews ? place.reviews.slice(0, 5).map(review => `
        <p><strong>${review.author_name}:</strong> ${review.text}</p>
    `).join('') : "<p>리뷰가 없습니다.</p>";

    const isOpen = place.opening_hours ? (place.opening_hours.open_now ? "영업 중" : "영업 종료") : "정보 없음";

    newInfoBox.innerHTML = `
        <h3>장소 정보</h3>
        <p><strong>이름:</strong> ${place.name}</p>
        <p><strong>평점:</strong> ${place.rating || "없음"}</p>
        <p><strong>주소:</strong> ${place.formatted_address || "없음"}</p>
        <p><strong>전화번호:</strong> ${place.formatted_phone_number || "없음"}</p>
        <p><strong>웹사이트:</strong> <a href="${place.website || "#"}" target="_blank">${place.website ? place.website : "없음"}</a></p>
        <p><strong>영업 여부:</strong> ${isOpen}</p>
        <div><strong>리뷰:</strong>${reviews}</div>
    `;

    newInfoBox.style.opacity = 0;
    newInfoBox.style.transition = "opacity 0.5s";

    // map-container의 너비를 동적으로 가져와서 적용
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
        newInfoBox.style.width = `${mapContainer.offsetWidth}px`;  // map-container의 너비로 설정
    } else {
        console.log("map-container 요소가 없습니다.");
    }

    const infoBoxContainer = document.getElementById('map-container');
    if (infoBoxContainer) {
        infoBoxContainer.appendChild(newInfoBox);
    }

    setTimeout(() => {
        newInfoBox.style.opacity = 1;
    }, 10);

    // 스타일 추가
    Object.assign(newInfoBox.style, {
        padding: "15px",
        backgroundColor: "#fff",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        marginBottom: "15px",
        fontFamily: "'Arial', sans-serif",
        color: "#333",
        backgroundColor: "#f9f9f9",
    });
}

// 크롤링 내용 태그에 추가
let allBlogLinks = [];  // 모든 블로그 링크 데이터를 저장

async function fetchBlogLinks(query) {
    try {
        const response = await fetch(`http://localhost:5500/fetchBlogLinks?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        allBlogLinks = data;  // 모든 데이터를 저장

        displayBlogLinks(allBlogLinks);  // 처음에는 모든 블로그 링크를 표시
    } catch (error) {
        console.error('Error fetching blog links:', error);
    }
}

// 블로그 링크를 화면에 표시하는 함수
function displayBlogLinks(links) {
    const resultLinks = document.getElementById("result-links");
    resultLinks.innerHTML = ""; // 기존 결과 초기화

    links.forEach((item) => {
        const cleanTitle = item.title.replace(/<b>/g, '').replace(/<\/b>/g, '');
        const cleanDescription = item.description.replace(/<b>/g, '').replace(/<\/b>/g, '');

        const descriptionSummary = extractKeywordFromDescription(cleanDescription, "");  // 필터 없이 전체 보여주기

        const card = document.createElement("div");
        card.classList.add("blog-card");

        let formattedDate = item.postdate;
        if (Date.parse(item.postdate)) {
            const postDate = new Date(item.postdate);
            formattedDate = `${postDate.getFullYear()}-${(postDate.getMonth() + 1).toString().padStart(2, '0')}-${postDate.getDate().toString().padStart(2, '0')}`;
        }

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <h3>${cleanTitle}</h3>
                    <span>${formattedDate}</span>
                </div>
                <div class="card-back">
                    <p>${descriptionSummary}</p>
                    <a href="${item.link}" target="_blank">Visit Blog</a>
                </div>
            </div>
        `;

        card.addEventListener("click", () => {
            const cardInner = card.querySelector(".card-inner");
            cardInner.classList.toggle("flipped");
        });

        const cardBack = card.querySelector(".card-back");
        cardBack.style.overflowY = "auto";
        cardBack.style.maxHeight = "200px";

        card.style.maxWidth = "350px";
        card.style.minWidth = "300px";
        card.style.height = "auto";
        card.style.overflow = "visible";

        resultLinks.appendChild(card);
    });
}

// 필터 버튼 클릭 시 필터를 적용한 데이터만 표시
function applyFilter() {
    const selectedKeyword = document.getElementById("keyword-filter").value;  // 선택된 키워드
    const filteredLinks = allBlogLinks.filter(item => {
        const cleanDescription = item.description.replace(/<b>/g, '').replace(/<\/b>/g, '');
        return extractKeywordFromDescription(cleanDescription, selectedKeyword) !== "No relevant information found.";
    });
    
    displayBlogLinks(filteredLinks);  // 필터링된 결과만 표시
}

// 키워드로 문장 추출
function extractKeywordFromDescription(description, keyword) {
    const regex = new RegExp(`[^.]*(${keyword}[^.]*\.)`, 'gi');
    const matches = description.match(regex);

    if (matches && matches.length > 0) {
        return matches[0];  // 첫 번째 매칭된 문장 반환
    } else {
        return "No relevant information found.";  // 키워드가 없다면 기본 메시지
    }
}




window.onload = initMap;
