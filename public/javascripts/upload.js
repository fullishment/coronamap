const mapContainer = document.getElementById("map");
const mapOption = {
    center:new daum.maps.LatLng(37.554477,126.970419),
    level :3,
};

let map = new daum.maps.Map(mapContainer, mapOption);

let inforwindow = new daum.maps.InfoWindow({
    zIndex:1,
});

let markerList=[];

let ps = new daum.maps.services.Places();

searchPlaces();  //키워드를 받고 검색하는 함수

function searchPlaces(){
    let keyword = $("#keyword").val();
    ps.keywordSearch(keyword,placesSearchCB); //검색하는 기능
}

function placesSearchCB(data,status){
    if(status === daum.maps.services.Status.OK){
        displayPlaces(data);
    }else if(status === daum.maps.services.status.ZERO_RESULT){
        alert("검색 결과가 존재하지 않습니다");
        return;
    }else if( status === daum.maps.services.status.ERROR){
        alert("검색 결과중 오류가 발생했습니다");
        return;
    }
}

function displayPlaces(data){
    let listEl = document.getElementById("placesList");
    let bounds = new daum.maps.LatLngBounds();

    removeAllChildNodes(listEl);  //검색결과를 최신화해주는
    removeMarker();   //기존에 있는 마커들을 지워줌


    for (let i =0; i<data.length;i++){
        let lat = data[i].y;
        let lng = data[i].x;
        let address_name = data[i]["address_name"];
        let place_name = data[i]["place_name"];

        const placePosition = new daum.maps.LatLng(lat,lng);
        bounds.extend(placePosition);

        let marker = new daum.maps.Marker({
            position:placePosition,
        });

        marker.setMap(map);
        markerList.push(marker);

        const el = document.createElement("div");
        const itemStr = `
            <div class ="info">
                <div class="info_title">
                    ${place_name}
                </div>
                <span>${address_name}</span>
            </div>
        `; 

        el.innerHTML = itemStr;
        el.className = "item";

        // 맵클릭시 인포윈도우 닫히고,결과값클릭시 인포윈도우 열리고 닫히기
        daum.maps.event.addListener(marker, "click",function(){
            // 인포윈도우 생성함수
            displayInfowindow(marker, place_name,address_name,lat,lng);
        });

        daum.maps.event.addListener(map,"click",function(){
            inforwindow.close();
        });

        el.onclick = function(){
            displayInfowindow(marker,place_name,address_name,lat,lng);
        };

        listEl.appendChild(el);  //결과값이 검색창 안에 들어가게 됨
    }

    map.setBounds(bounds);//맵이 바운드 영역으로 이동하게
}
function displayInfowindow(marker,place_name,address_name,lat,lng){
    let content = `
    <div style="padding:25px;" >
        ${place_name}<br>
        ${address_name}<br>
        <button>등록</button>
    </div>
    `;
    // 인포윈도우를 보여줄때 그 위치로 이동
    map.panTo(marker.getPosition());
    inforwindow.setContent(content);
    inforwindow.open(map,marker);
}

function removeAllChildNodes(el){
    while(el.hasChildNodes()) {
        el.removeChild(el.lastChild);  //el태그 안에 (placesList 안에있는) 노드,태그들을 삭제해주는
    }
}

// 검색할때 이전의 마커 지우기
function removeMarker(){
    for(let i=0; i< markerList.length; i++){
        markerList[i].setMap(null);
    }
    markerList= [];
}

//검색결과 목록 또는 마커를 클릭했을때 호출되는 함수입니다
//인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title, address, lat, lng){
    //인포윈도우에 컨텐츠를 부여하는 코드
     //해당 버튼을 눌렀을 때 marker, title, address, lat, lng가 location url로 post method를 통해서 요청을 함
    var content = `
    <div style="padding:25px;" >       
        ${title}<br>
        ${address}<br>
        <button onClick="onSubmit( '${title}','${address}',${lat},${lng});">등록</button> 
    </div>
    `;
    // 인포윈도우를 보여줄때 그 위치로 이동
    map.panTo(marker.getPosition());
    inforwindow.setContent(content);
    inforwindow.open(map,marker);
}

function onSubmit(title, address, lat, lng) {
    $.ajax({
        url : "/location",
        data : {title, address, lat, lng},
        type : "POST",
    })
        .done((response) => {
            console.log("데이터 요청 성공");
            alert("성공");
        })
        .fail((error) => {
            console.log("데이터 요청 실패");
            alert("실패");
        });
}
