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
    alert(`장소 이름: ${place.name}\n평점: ${place.rating}\n주소: ${place.formatted_address}`);
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
            const link = document.createElement("a");
            link.href = item.link;
            link.target = "_blank";
            link.textContent = item.title;
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

window.onload = initMap;
