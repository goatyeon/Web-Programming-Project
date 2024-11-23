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



window.onload = initMap;
