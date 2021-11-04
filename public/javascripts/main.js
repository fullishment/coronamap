//지도서비스 구축 기본적인 기능 완료
//데이터 입력하고 키워드를 통해 데이터 검색하고 데이터를 데이터베이스에 입력후
//그 데이터를 불러와서 메인페이지에서 보여주는 기능



const mapOptions = {
    center: new naver.maps.LatLng(36.3595704, 127.105399),
    minZoom : 7,
    zoomControl: true, //줌 컨트롤의 표시 여부
    zoomControlOptions: { //줌 컨트롤의 옵션
        position: naver.maps.Position.TOP_RIGHT
    },
    zoom: 7
};

const map = new naver.maps.Map('map', mapOptions);
naver.maps.Event.addListener(map, 'zoom_changed', function(zoom, marker) {
    //alert('zoom 값이 '+ zoom +'으로 변경되었습니다!');
    //marker.setMap(null);	
    if(zoom==9){
        if(map.data.getAllFeature().length==17){
            map.data.addGeoJson(seoulGeoJson);
        } 
    }else if(zoom<9){
        map.data.removeGeoJson(seoulGeoJson);
    }
});   
// /location url로 요청하고 데이터를 바탕으로 지도위에 마커를 표시
$.ajax({
    url: "https://api.odcloud.kr/api/15077586/v1/centers?page=0&perPage=0&serviceKey=4FdfPXtjwHAvgzvvBRukYUp8vVxhuoHkYwpRila9BPKWuftssfal2lNs6jXL8M1oDA5JJM8YcHFps0d7u%2BmPew%3D%3D",
    type: "GET",
}).done((response) => {
    //if (response.message !== "success") return;
    const data = response.data;

    $("#viewCB").on("click",function(){
        if($(this).is(":checked")){
            regionGeoJson.forEach((geojson) => { 
                map.data.removeGeoJson(geojson);
                
                
            });
            //$(".cluster1 , .cluster2").removeClass("hide");
            map.data.removeGeoJson(seoulGeoJson);
        }else{
            //$(".cluster1 , .cluster2").addClass("hide");
            regionGeoJson.forEach((geojson) => {
                map.data.addGeoJson(geojson);
                
            });
            
            if(map.zoom >=9){
                map.data.addGeoJson(seoulGeoJson);
            }
        }
    });

let markerList = [];
let infowindowList = [];

const getClickHandler = (i) => () => {
    const marker = markerList[i];
    const infowindow = infowindowList[i];
    if ( infowindow.getMap()) {
        infowindow.close()
    }else {
        infowindow.open(map, marker);
    }
};

const getClickMap =(i) => () => {
    const infowindow = infowindowList[i];
    infowindow.close();
};

function geetClickHandler(i) {
    return function() {

    }
}

for(let i in data){
    const target = data[i];
    const latlng = new naver.maps.LatLng(target.lat, target.lng);  //네이버맵

    let marker = new naver.maps.Marker({
        map : map,
        position : latlng,
        icon : {
            content  : `<div class="pin"></div><div class="pulse"></div>`,  //마커
            anchor : new naver.maps.Point(7.5, 7.5),   //마커의 넓이와 높이의 절반.15px이니까 7.5
        },
        visible:false,
        
    });
    $("#viewCB").on("click",function(){
        if($(this).is(":checked")){
            marker.setVisible(true);
        }else{
            marker.setVisible(false);
        }
    });
    const content = `
    <div class="infowindow_wrap">
        <div class="infowindow_title">${target.centerName}</div>
        <div class="infowindow_address">${target.address}</div>
    </div>
    `;
 
    const infowindow = new naver.maps.InfoWindow({
        content : content,
        backgroundColor:"#00ff0000",
        borderColor:"#00ff0000",
        anchorSize: new naver.maps.Size(0,0),
    });

    markerList.push(marker);
    infowindowList.push(infowindow);
}

for(let i = 0, ii = markerList.length; i <ii; i++) {
    naver.maps.Event.addListener(markerList[i], "click", getClickHandler(i));
    naver.maps.Event.addListener(map,"click",getClickMap(i));
}

    //10개 이하일때는 클러스터1 실행
    const cluster1 = {
        content: `<div class="cluster1 hide"></div>` ,
    };
    //10개 이상 100개 이하면 클러스터2 실행 이런식으로 만들 예정
    const cluster2 = {
        content: `<div class="cluster2 hide"></div>`,
    };
    
    const cluster3 = {
        
        content: `<div class="cluster3 hide"></div>`,
    };
    

    //클러스터작동
    const markerClustering = new MarkerClustering({
        minClusterSize : 2,
        maxZoom: 12,
        map : map,
        markers : markerList,
        disableClickZoom : false,  //false: 클러스터 기능 활성화
        gridSize : 30,  //좀더 세분화된 클러스터 만듬,더 키우면 더 넓은 영역의 클러스터를 만듬
        icons : [cluster1, cluster2, cluster3],
        indexGernerator : [2, 5, 10],   //클러스터1,2,3 이 실행되는 조건,기준  10개 이상이면 클러스터3 실행
        stylingFunction: (clusterMarker, count) => {
            $(clusterMarker.getElement()).find("div:first-child").text(count);  //클러스터 안에 몇개의 마커가 있는지 시각적으로 보여줌
        },
    });
});


//내가한거 
function test(data){
    var i =0;
    $(data).find('item').each(function(index,item){
        var tmp = {
            "gubun" : $(this).find('gubun').text(),
            "defCnt" : $(this).find('defCnt').text(),
            "deathCnt" : $(this).find('deathCnt').text(),
            "isoIngCnt" : $(this).find('isolIngCnt').text()
        }
        apiArray[i] = tmp;
        i++;
    });

    
}

//행정구역 데이터 레이어 소개 및 표시기능
//도별 정보 가져올 서버의 주소
const urlPrefix = "https://navermaps.github.io/maps.js/docs/data/region";
const urlSuffix = ".json";
const mcpfix ="https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_municipalities_geo_simple.json";

//const mcpfix="https://services2.arcgis.com/RiHDI9SnFmD3Itzs/arcgis/rest/services/%EC%A0%84%EA%B5%AD%EC%8B%9C%EA%B5%B0%EA%B5%AC%ED%96%89%EC%A0%95%EA%B2%BD%EA%B3%84/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json";
let seoulGeoJson = [];
let regionGeoJson = [];
let loadCount = 0;
let apiArray = new Array();
const tooltip = $(
    `<div style="position:absolute;z-index:1000; padding:5px 10px; background:white;border:1px solid black;font-size:14px;display:none;pointer-events:none;"></div>`
);

tooltip.appendTo(map.getPanes().floatPane);
//구역별로 나누고 이벤트추가코드
naver.maps.Event.once(map, "init_stylemap", () =>{
    for(let i= 1; i<18; i++){
        let keyword = i.toString();
        if(keyword.length === 1){
            keyword = "0" + keyword;     //1이라하면 01로 생성,12같은 두자리수는 해당코드 작동안함,키워드가 01부터 17까지 생성됨
        }
        $.ajax({
            url : urlPrefix + keyword + urlSuffix,   //url에 17번의 요청이 들어가고 
        }).done((geojson) =>{
            regionGeoJson.push(geojson);   //17개의 도에대한 결과값이 regionGeoJson이라는 빈 배열에 들어가고

            loadCount++;
            if(loadCount === 17){   // 17번으로 빈 배열이 가득차면 함수실행
                //startDataLayer();
                apiresponse();         
                $.ajax({
                    url : mcpfix,
                }).done((sgeojson) => {
                    seoulApi();
                 var jsontext = sgeojson;
                 seoulGeoJson = JSON.parse(jsontext);
                 startDataLayer();
                 //map.data.addGeoJson(seoulGeoJson);
                 });
            }

        });
    }
});
//api 받아오기 
function apiresponse(){
    var xhr = new XMLHttpRequest();
    var url = 'https://cors-anywhere.herokuapp.com/http://openapi.data.go.kr/openapi/service/rest/Covid19/getCovid19SidoInfStateJson'; /*URL*/
    var queryParams = '?' + encodeURIComponent('serviceKey') + '='+'dPFKtwA/NRWi9trbdTVxhgHsxZjtvoz141kUi/JLLK9W6SI5zUdd07FWlLpKDzrw8rrmSqFPzOBmaHjiCr3fYA=='; /*Service Key*/

    xhr.open('GET', url + queryParams);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4) {
            //console.log('Status: '+this.status+'nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'nBody: '+this.responseText);
            test(this.responseText);
        }
    };
    xhr.send('');
}
var seoul = "";
function toStringByFormatting(source, delimiter = '.') { 
    const year = source.getFullYear(); 
    const month = leftPad(source.getMonth() + 1); 
    const day = leftPad(source.getDate()); 
    return [year, month, day].join(delimiter); 
}
function leftPad(value) { 
    if (value >= 10) { 
        return value; 
    } 
    return `0${value}`; 
}

function seoulApi(){
    var xhr = new XMLHttpRequest();
    let today = new Date();
    let yesterday = new Date(today.setDate(today.getDate() - 1));
    var url = 'https://openAPI.seoul.go.kr:8088/4d76576e797279613632514e4e7a44/xml/TbCorona19CountStatusJCG/1/5/'+toStringByFormatting(yesterday)+'.00'; /*URL*/
    

    xhr.open('GET', url);
    xhr.onreadystatechange = function () {
        //if (this.readyState == 4) {
            //console.log('Status: '+this.status+'nHeaders: '+JSON.stringify(this.getAllResponseHeaders())+'nBody: '+this.responseText);
            seoul = (this.responseText);
        //}
    };
    xhr.send('');
    

}
function startDataLayer(){
    map.data.setStyle((feature) => {
        const styleOptions = {
            fillColor : "#ff0000",
            fillOpacity : 0.0001,
            strokeColor : "#ff0000",
            strokeWeight : 2,
            strokeOpacity : 0.4,
            visible : true
        };

        if(feature.getProperty("focus")){
            styleOptions.fillOpacity = 0.6;
            styleOptions.fillColor = "#0f0";
            styleOptions.strokeColor = "#0f0";
            styleOptions.strokeWeight = 4;
            styleOptions.strokeOpacity = 1;
        }
        if(feature.getProperty("check")){
            styleOptions.visible= false;
        }
        return styleOptions;
    });

    regionGeoJson.forEach((geojson) => {    //17개의 도를 구획별로 나누고 빨간선으로 구분해서 표시됨
        map.data.addGeoJson(geojson);
    });


    //focus styling  클릭하면 포커스 된 도 영역이 칠해짐(초록)
    map.data.addListener("click",(e) => {
        let feature = e.feature;
        if(feature.getProperty("focus") !== true) {
            feature.setProperty("focus",true);
        }else{
            feature.setProperty("focus",false);
        }
    });

    map.data.addListener("mouseover" , (e) => {  //마우스가 올라간 곳이 빨간색으로 칠해짐
        let feature = e.feature;
        let info = "";
        if( feature.getProperty("area1") !=null){
            let regionName = feature.getProperty("area1");
            let reName = regionName.substring(0,2);
            if(regionName.length == 4){
                reName = regionName.substring(0,1) + regionName.substring(2,3);
            }
           
            for(let i = 0;i<apiArray.length;i++){
                if(apiArray[i].gubun == reName){
                    info += "총 확진자 : "+apiArray[i].defCnt+"</br>";
    
                    info += "총 사망자 : "+apiArray[i].deathCnt+"</br>";
                    
                    info += "지역명 : "+apiArray[i].gubun+"</br>";
                }
            }
        }else {
            let idx = feature.property_name_eng.toUpperCase().indexOf("-");
            let reName="";
            if(feature.property_name_eng=='Jung-gu'){
                reName = feature.property_name_eng.toUpperCase().substring(0,idx)+feature.property_name_eng.toUpperCase().substring(idx+1);
            }else {
                reName = feature.property_name_eng.toUpperCase().substring(0,idx);
                if(reName=='YEONGDEUNGPO'){
                    reName="YDP";
                }else if(reName=='EUNPYEONG'){
                    reName="EP";
                }else if(reName=='DONGDAEMUN'){
                    reName=="DDM";
                }
            }
            
            info+="지역명 : "+feature.property_name+"<br/>";
            if($(seoul).find(reName).text() ){
                info+="총 확진자 : "+$(seoul).find(reName).text()+"명<br/>";
                info+="전일 대비 증가 : "+$(seoul).find(reName+'ADD').text()+"명<br/>";
            }else{
                info+="<br/>관련 정보 없음<br/><br/>"
            }
            info+="기준일 : "+$(seoul).find('JCG_DT').text();

            console.log(info);
        }
        

        tooltip
            .css({
                display:"block",
                left : e.offset.x,
                top : e.offset.y ,
            })
            .html(info);
        map.data.overrideStyle(feature,{
            fillOpacity : 0.6,
            strokeWeight : 4,
            strokeOpacity : 1,
        });
    });

    map.data.addListener("mouseout",(e) => {  //마우스가 내려가면 revertStyle을 통해서 이전 정의한 setStyle로 다시 바뀜
        tooltip.hide().empty();
        map.data.revertStyle();
    });
}
