let map;
let markers = [];
const initialLocation = { lat: 37.631813, lng: 127.077406 }; // 서울과학기술대학교 위치

// 맵 초기화
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 15,
    });

    new google.maps.Marker({
        position: initialLocation,
        map,
        title: "서울과학기술대학교",
    });
}

// 장소 검색
async function searchPlaces(category, location) {
    document.getElementById("loading-spinner").classList.remove("hidden");
    const service = new google.maps.places.PlacesService(map);

    service.textSearch(
        { query: `${location} ${category}`, location: map.getCenter(), radius: 1000 },
        (results, status) => {
            document.getElementById("loading-spinner").classList.add("hidden");
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
                        showPlaceInfo(place);
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
    // 기존에 존재하는 정보 박스가 있으면 제거
    const existingInfoBox = document.querySelector('.place-info-box');
    if (existingInfoBox) {
        existingInfoBox.remove();
    }

    // 새로운 div 생성
    const newInfoBox = document.createElement('div');
    newInfoBox.classList.add('place-info-box'); // 스타일 적용을 위한 클래스 추가

    // 리뷰를 최대 5개로 제한하고, 없으면 "없음" 표시
    const reviews = place.reviews ? place.reviews.slice(0, 5).map(review => `
        <p><strong>${review.author_name}:</strong> ${review.text}</p>
    `).join('') : "<p>리뷰가 없습니다.</p>";

    // 영업 여부 처리
    const isOpen = place.opening_hours ? (place.opening_hours.open_now ? "영업 중" : "영업 종료") : "정보 없음";

    // 내용 설정
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

    // 초기 투명도 설정
    newInfoBox.style.opacity = 0;
    newInfoBox.style.transition = "opacity 0.5s";

    // info-box라는 id를 가진 div에 새로운 infoBox 추가
    const infoBoxContainer = document.getElementById('map-container');
    if (infoBoxContainer) {
        infoBoxContainer.appendChild(newInfoBox);
    } else {
        console.log("info-box 요소가 없습니다.");
    }

    // 투명도 변경
    setTimeout(() => {
        newInfoBox.style.opacity = 1; // 점차 보이게 설정
    }, 10);

    // 위치 지정 (필요에 따라 수정)
    Object.assign(newInfoBox.style, {
        padding: "15px",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "5px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
        marginBottom: "15px", // 여러 정보 박스가 있을 경우 아래쪽 간격
    });
}




async function fetchBlogLinks(query) {
    try {
        const response = await fetch(`http://localhost:5500/fetchBlogLinks?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const resultLinks = document.getElementById("result-links");
        resultLinks.innerHTML = "";  // 기존 결과 초기화

        data.forEach((item) => {
            // <b> 태그 제거: 제목에서 <b> 태그를 제거
            const cleanTitle = item.title.replace(/<b>/g, '').replace(/<\/b>/g, ''); 

            // <a> 태그 생성
            const link = document.createElement("a");
            link.href = item.link;
            link.target = "_blank";
            link.textContent = cleanTitle;  // <b> 태그가 제거된 제목 사용
            resultLinks.appendChild(link);
        });
    } catch (error) {
        console.error('Error fetching blog links:', error);
    }
}


// 이벤트 리스너

document.getElementById("search-button").addEventListener("click", () => {
    const location = document.getElementById("search-input").value;
    searchPlaces("관광지", location);
    fetchBlogLinks(location + " 관광지");
});

// 엔터키로 검색 이벤트
document.getElementById("search-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {  // 엔터키가 눌렸을 때
        const location = document.getElementById("search-input").value;
        searchPlaces("관광지", location);
        fetchBlogLinks(location + " 관광지");
    }
});

window.onload = initMap;
