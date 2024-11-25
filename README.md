## Web-Programming-Project
# 여행지 정보 제공 사이트 구현

### 🚨 현재 상황
깃허브 페이지로 구현을 못하는 상황이라,
현재까지 구현한 웹 사이트에 대해 데모 영상을 찍어 놓았습니다.

[중간점검용 데모 영상](https://youtu.be/p80x0t3T2r0)


이 사이트는 사용자가 원하는 동네를 입력하면 그 동네 인근 카페, 식당 등을 구글맵 상에서 확인할 수 있고
그 중 하나를 클릭하면 관련 블로그나 카페 글을 네이버로부터 찾아 링크 형태로 제공하도록 하는 사이트입니다.


### 사용 방법
- 네비게이터에 있는 '카페', '식당', '관광지' 중 검색을 원하는 것을 클릭합니다.
- 이동된 페이지에서 검색창에 원하는 동네를 입력합니다.
- 구글맵 상에 해당 동네에 있는 인근 '카페' or '식당' or '관광지'가 마크 표시가 됩니다.
- 특정 마크를 클릭하면 장소 정보가 뜹니다. (위치, 리뷰, 영업시간 등 - places api에서 제공하는 것)
- 지도 옆에 해당 동네(혹은 특정 카페, 식당, 관광지)에 대한 네이버 블로그, 카페 등을 찾아 링크로 제공합니다.
- 사용자는 링크를 클릭하여 해당 게시글로 이동할 수 있습니다. 

